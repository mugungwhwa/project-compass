# yieldo — 데이터 소스 실전 가이드

**Version**: 1.0
**Date**: 2026-04-01
**Classification**: Internal Developer Reference
**용도**: 이 문서만 보고 데이터 수집 파이프라인을 구축할 수 있어야 함

---

## 1. 데이터 소스 전체 맵

```
yieldo가 사용하는 데이터 = 4개 레이어

Layer 1: 앱스토어 공개 데이터 (랭킹, 메타데이터, 평점)
  → 역할: 장르/티어 분류 기준 + 시장 맥락 제공
           → 인터벤션(UA, 라이브옵스, 실험) 효과를 시장 조건 대비 평가하는 기준선
  → 법적: ✅ 공식 API/피드

Layer 2: 공개 벤치마크 리포트 (장르별 리텐션/매출 벤치마크)
  → 역할: 베이지안 사전분포(Prior) 구축
           → "이 장르에서 이 정도 리텐션이 정상인가?" 판단 기준 — 인터벤션 효과 해석의 시장 맥락
  → 법적: ✅ 공개 발행물

Layer 3: 고객 데이터 (MMP + 실험 + 코호트)
  → 역할: 베이지안 사후분포(Posterior) 업데이트
           → 실제 인터벤션(UA 집행, 실험 롤아웃, 라이브옵스)이 리텐션/LTV에 미친 효과 측정
           → MMP 코호트: 시장 조건 하에서 UA 인터벤션의 효과성 평가
           → 실험 데이터: ATE → ΔLTV → 투자 가치로 번역하는 핵심 입력
  → 법적: ✅ 고객 인가 API 연동

Layer 4: 앱 인텔리전스 라이선싱 (Phase 3+)
  → 역할: 정밀 벤치마크 보완
           → 인터벤션 효과를 더 세밀한 시장 맥락과 비교하기 위한 보완 데이터
  → 법적: ✅ 라이선싱 계약
```

---

## 2. Layer 1: 앱스토어 공개 데이터

### 2.1 Apple RSS Top Charts Feed

**가장 중요한 무료 데이터 소스.** Apple이 공식 제공하는 JSON/RSS 피드.

#### URL 형식

```
https://rss.applemarketingtools.com/api/v2/{country}/apps/{chart_type}/{limit}/apps.json
```

#### 파라미터

| 파라미터 | 값 | 설명 |
|---|---|---|
| `{country}` | `us`, `kr`, `jp`, `gb`, `de` 등 | ISO 3166-1 alpha-2 국가 코드 |
| `{chart_type}` | `top-free`, `top-paid`, `top-grossing` | 차트 유형 |
| `{limit}` | `10`, `25`, `50`, `100`, `200` | 결과 수 (최대 200) |

#### 게임 장르 필터

장르 필터를 추가하려면 URL에 `genre={genre_id}` 파라미터 추가:

```
https://rss.applemarketingtools.com/api/v2/{country}/apps/{chart_type}/{limit}/apps.json?genre={genre_id}
```

#### 게임 장르 ID (Apple)

| Genre ID | 장르 | yieldo 분류 |
|---|---|---|
| `6014` | Games (전체) | 전체 게임 |
| `7001` | Action | 액션 |
| `7002` | Adventure | 어드벤처 |
| `7003` | Arcade | 아케이드 |
| `7004` | Board | 보드 |
| `7005` | Card | 카드 |
| `7006` | Casino | 카지노 |
| `7009` | Family | 패밀리 |
| `7011` | Music | 음악 |
| `7012` | Puzzle | 퍼즐 |
| `7013` | Racing | 레이싱 |
| `7014` | Role Playing | RPG |
| `7015` | Simulation | 시뮬레이션 |
| `7016` | Sports | 스포츠 |
| `7017` | Strategy | 전략 |
| `7018` | Trivia | 트리비아 |
| `7019` | Word | 워드 |

#### 실전 예시

```bash
# 미국 Top Grossing 게임 200개 (JSON)
curl "https://rss.applemarketingtools.com/api/v2/us/apps/top-grossing/200/apps.json"

# 한국 Top Free 퍼즐 게임 100개
curl "https://rss.applemarketingtools.com/api/v2/kr/apps/top-free/100/apps.json?genre=7012"

# 일본 Top Grossing RPG 50개
curl "https://rss.applemarketingtools.com/api/v2/jp/apps/top-grossing/50/apps.json?genre=7014"
```

#### 반환 데이터 (JSON)

```json
{
  "feed": {
    "title": "Top Free Games",
    "country": "us",
    "updated": "2026-04-01T12:00:00.000-07:00",
    "results": [
      {
        "artistName": "Supercell",
        "id": "529479190",
        "name": "Clash of Clans",
        "releaseDate": "2012-08-02",
        "kind": "apps",
        "artworkUrl100": "https://...",
        "genres": [
          { "genreId": "7017", "name": "Strategy", "url": "..." }
        ],
        "url": "https://apps.apple.com/us/app/clash-of-clans/id529479190"
      }
    ]
  }
}
```

#### 인증/제한

| 항목 | 값 |
|---|---|
| **인증** | 없음 (공개 피드) |
| **Rate Limit** | 명시 없음, ~20 req/min 권장 |
| **갱신 주기** | 실시간에 가까움 (수분~1시간) |
| **최대 결과** | 200개/요청 |
| **법적 상태** | ✅ Apple 공식 제공 피드 |

#### Supabase 저장 스키마

```sql
CREATE TABLE app_store_rankings (
  id BIGSERIAL PRIMARY KEY,
  app_id TEXT NOT NULL,               -- Apple app ID (e.g., "529479190")
  app_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  country TEXT NOT NULL,              -- "us", "kr", "jp"
  chart_type TEXT NOT NULL,           -- "top-free", "top-paid", "top-grossing"
  genre_id TEXT,                      -- "7014" for RPG
  rank INTEGER NOT NULL,              -- 1-200
  crawl_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 복합 인덱스: 동일 시점 같은 앱 중복 방지
  UNIQUE(app_id, country, chart_type, genre_id, crawl_timestamp)
);

-- 시계열 쿼리 최적화
CREATE INDEX idx_rankings_time ON app_store_rankings (crawl_timestamp DESC);
CREATE INDEX idx_rankings_app ON app_store_rankings (app_id, country, chart_type);
```

#### 크롤링 스케줄

```
Cloud Scheduler → 6시간마다 실행
  → 대상 국가: us, kr, jp, gb, de, tw, cn (7개국)
  → 대상 차트: top-free, top-grossing (2종)
  → 대상 장르: 6014(전체), 7012(퍼즐), 7014(RPG), 7017(전략), 7001(액션) (5장르)
  → 총 요청 수: 7 × 2 × 5 = 70 req / 6시간
  → 매우 가벼움, rate limit 문제 없음
```

---

### 2.2 iTunes Search API (App Lookup)

특정 앱의 상세 정보를 가져올 때 사용.

#### URL 형식

```
# 앱 ID로 조회
https://itunes.apple.com/lookup?id={app_id}&country={country}

# 검색
https://itunes.apple.com/search?term={keyword}&country={country}&media=software&entity=software&genreId={genre_id}&limit={limit}
```

#### 실전 예시

```bash
# Clash of Clans 상세 정보 (US)
curl "https://itunes.apple.com/lookup?id=529479190&country=us"

# 한국에서 "RPG" 검색, 상위 25개
curl "https://itunes.apple.com/search?term=RPG&country=kr&media=software&entity=software&genreId=7014&limit=25"

# 여러 앱 동시 조회 (최대 200개, 콤마 구분)
curl "https://itunes.apple.com/lookup?id=529479190,1477099598,1544504717&country=us"
```

#### 반환 데이터 (핵심 필드)

```json
{
  "resultCount": 1,
  "results": [
    {
      "trackId": 529479190,
      "trackName": "Clash of Clans",
      "bundleId": "com.supercell.magic",
      "sellerName": "Supercell Oy",
      "primaryGenreName": "Games",
      "primaryGenreId": 6014,
      "genres": ["Games", "Strategy"],
      "genreIds": ["6014", "7017"],
      "price": 0.00,
      "currency": "USD",
      "averageUserRating": 4.6,
      "userRatingCount": 3250000,        // ← 평점 수 (설치 프록시)
      "averageUserRatingForCurrentVersion": 4.5,
      "userRatingCountForCurrentVersion": 125000,
      "currentVersionReleaseDate": "2026-03-15T00:00:00Z",
      "releaseDate": "2012-08-02T00:00:00Z",
      "version": "16.0.8",
      "description": "...",
      "contentAdvisoryRating": "9+",
      "fileSizeBytes": "298123456",
      "minimumOsVersion": "14.0",
      "languageCodesISO2A": ["EN", "JA", "KO", "ZH"],
      "screenshotUrls": ["..."],
      "artworkUrl512": "https://..."
    }
  ]
}
```

#### 핵심 활용 필드

| 필드 | yieldo 활용 |
|---|---|
| `userRatingCount` | **설치 수 프록시** — 일간 변화량 추적 → 상대적 DL 규모 추정 |
| `averageUserRating` | 품질 시그널 |
| `currentVersionReleaseDate` | 업데이트 빈도 추적 → 라이브옵스 활성도 |
| `primaryGenreName` + `genres` | 장르 분류 키 |
| `price` | 무료/유료 분류 |

#### 인증/제한

| 항목 | 값 |
|---|---|
| **인증** | 없음 |
| **Rate Limit** | ~20 calls/minute (Apple 공식 문서) |
| **법적 상태** | ✅ Apple 공식 API |
| **제한** | 검색 결과 최대 200개, Lookup 최대 200 ID |

#### Supabase 저장 스키마

```sql
CREATE TABLE app_metadata (
  id BIGSERIAL PRIMARY KEY,
  app_id TEXT NOT NULL,
  store TEXT NOT NULL DEFAULT 'ios',
  country TEXT NOT NULL,
  app_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  bundle_id TEXT,
  primary_genre TEXT,
  primary_genre_id TEXT,
  genres TEXT[],                       -- PostgreSQL 배열
  price DECIMAL(10,2),
  currency TEXT,
  avg_rating DECIMAL(3,2),
  rating_count INTEGER,               -- ← 핵심: 일간 변화량 추적
  current_version TEXT,
  current_version_release_date TIMESTAMPTZ,
  release_date TIMESTAMPTZ,
  content_rating TEXT,
  crawl_date DATE NOT NULL DEFAULT CURRENT_DATE,

  UNIQUE(app_id, country, crawl_date)
);

-- 평점 수 변화량 추적용 뷰
CREATE VIEW rating_count_daily_change AS
SELECT
  app_id, country, crawl_date,
  rating_count,
  rating_count - LAG(rating_count) OVER (
    PARTITION BY app_id, country ORDER BY crawl_date
  ) AS daily_rating_increase
FROM app_metadata;
```

---

### 2.3 Google Play 데이터 (google-play-scraper)

#### 패키지 설치

```bash
pnpm add google-play-scraper
```

#### 핵심 메서드

```typescript
import gplay from 'google-play-scraper';

// 1. 앱 상세 정보
const appDetail = await gplay.app({
  appId: 'com.supercell.clashofclans',
  lang: 'ko',
  country: 'kr'
});
// 반환: title, description, score, ratings, reviews, installs,
//       minInstalls, maxInstalls, genre, genreId, developer, ...

// 2. 카테고리별 Top 차트
const topApps = await gplay.list({
  category: gplay.category.GAME_STRATEGY,  // 장르
  collection: gplay.collection.TOP_GROSSING,  // 차트 유형
  num: 200,          // 최대 500
  country: 'kr',
  lang: 'ko'
});

// 3. 리뷰 수집
const reviews = await gplay.reviews({
  appId: 'com.supercell.clashofclans',
  sort: gplay.sort.NEWEST,
  num: 100,
  lang: 'ko',
  country: 'kr'
});

// 4. 유사 앱 조회
const similar = await gplay.similar({
  appId: 'com.supercell.clashofclans',
  lang: 'ko',
  country: 'kr'
});
```

#### Google Play 게임 장르 ID

```typescript
import gplay from 'google-play-scraper';

// 주요 게임 장르
gplay.category.GAME                    // 전체 게임
gplay.category.GAME_ACTION             // 액션
gplay.category.GAME_ADVENTURE          // 어드벤처
gplay.category.GAME_ARCADE             // 아케이드
gplay.category.GAME_BOARD              // 보드
gplay.category.GAME_CARD               // 카드
gplay.category.GAME_CASINO             // 카지노
gplay.category.GAME_CASUAL             // 캐주얼
gplay.category.GAME_PUZZLE             // 퍼즐
gplay.category.GAME_RACING             // 레이싱
gplay.category.GAME_ROLE_PLAYING       // RPG
gplay.category.GAME_SIMULATION         // 시뮬레이션
gplay.category.GAME_SPORTS             // 스포츠
gplay.category.GAME_STRATEGY           // 전략
gplay.category.GAME_WORD               // 워드

// 차트 유형
gplay.collection.TOP_FREE              // Top 무료
gplay.collection.TOP_PAID              // Top 유료
gplay.collection.TOP_GROSSING          // Top 매출
gplay.collection.TRENDING              // 인기 급상승
```

#### 핵심 반환 필드 (app 메서드)

| 필드 | 타입 | yieldo 활용 |
|---|---|---|
| `minInstalls` | number | **다운로드 범위** (Google이 공개하는 하한값, e.g., 10000000) |
| `score` | number | 평점 (1-5) |
| `ratings` | number | 총 평점 수 → 일간 변화량 추적 |
| `reviews` | number | 총 리뷰 수 |
| `genre` | string | 장르 분류 키 |
| `genreId` | string | 장르 ID |
| `developer` | string | 개발사 |
| `updated` | timestamp | 마지막 업데이트 → 라이브옵스 활성도 |
| `recentChanges` | string | 업데이트 노트 |

#### 인증/제한

| 항목 | 값 |
|---|---|
| **인증** | 없음 |
| **Rate Limit** | 공식 제한 없으나, ~1 req/sec 권장 (차단 방지) |
| **법적 상태** | ⚠️ 공개 페이지 기반 — 신중하게, rate limit 준수 |
| **npm** | `google-play-scraper` (github: facundoolano/google-play-scraper) |

---

### 2.4 App Store 데이터 (app-store-scraper)

#### 패키지 설치

```bash
pnpm add app-store-scraper
```

#### 핵심 메서드

```typescript
import store from 'app-store-scraper';

// 앱 상세 정보
const app = await store.app({
  id: 529479190,  // 또는 appId: 'com.supercell.magic'
  country: 'kr',
  lang: 'ko'
});

// 리뷰
const reviews = await store.reviews({
  id: 529479190,
  country: 'kr',
  sort: store.sort.RECENT,
  page: 1
});

// 카테고리별 리스트
const list = await store.list({
  category: store.category.GAMES_STRATEGY,
  collection: store.collection.TOP_GROSSING,
  country: 'kr',
  num: 200
});
```

#### 인증/제한

| 항목 | 값 |
|---|---|
| **인증** | 없음 |
| **Rate Limit** | ~1 req/sec 권장 |
| **법적 상태** | ⚠️ 공개 페이지 기반 — iTunes API 우선 사용 권장 |
| **npm** | `app-store-scraper` (github: facundoolano/app-store-scraper) |

---

## 3. Layer 2: 공개 벤치마크 리포트

### 3.1 GameAnalytics Benchmark Report (핵심 소스)

**yieldo의 베이지안 Prior 구축에 가장 중요한 소스.** 인터벤션 효과를 시장 벤치마크 대비 평가하는 기준선을 제공한다.

| 항목 | 상세 |
|---|---|
| **URL** | https://gameanalytics.com/resources/mobile-gaming-benchmarks |
| **발행 주기** | 연 1회 (보통 Q1-Q2) |
| **최신 버전** | 2024 (2025 버전은 발행 시 업데이트 필요) |
| **접근 방법** | 이메일 등록 후 PDF 다운로드 (무료) |
| **법적 상태** | ✅ 공개 발행물 — 인용 시 출처 명시 |

#### 포함 데이터 (yieldo에 핵심적인 것)

| 데이터 | 세분화 | yieldo 활용 |
|---|---|---|
| **D1 리텐션** by genre | 12+ 장르, percentile (P10/P25/P50/P75/P90) | Prior 밴드 구축 핵심 |
| **D7 리텐션** by genre | 동일 | Prior 밴드 구축 핵심 |
| **D14 리텐션** by genre | 동일 | Prior 밴드 구축 |
| **D28 리텐션** by genre | 동일 | Prior 밴드 구축 핵심 |
| 세션 수 by genre | 장르별 | 참여도 벤치마크 |
| 세션 길이 by genre | 장르별 | 참여도 벤치마크 |
| DAU/MAU ratio | 장르별 | Stickiness 벤치마크 |

#### 데이터 추출 및 저장 방법

```
1. https://gameanalytics.com/resources/mobile-gaming-benchmarks 접속
2. 이메일 등록 후 PDF 다운로드
3. PDF에서 장르별 리텐션 테이블 수동 추출
4. 아래 스키마로 Supabase에 저장
```

```sql
CREATE TABLE genre_benchmarks (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,                -- 'gameanalytics_2024'
  report_year INTEGER NOT NULL,        -- 2024
  genre TEXT NOT NULL,                 -- 'Puzzle', 'RPG', 'Strategy', 'Casual'
  metric TEXT NOT NULL,                -- 'retention_d1', 'retention_d7', 'retention_d28'
  p10 DECIMAL(5,4),                    -- 하위 10%
  p25 DECIMAL(5,4),                    -- 하위 25%
  p50 DECIMAL(5,4),                    -- 중앙값
  p75 DECIMAL(5,4),                    -- 상위 25%
  p90 DECIMAL(5,4),                    -- 상위 10%
  sample_size INTEGER,                 -- 표본 게임 수 (리포트에 명시된 경우)
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(source, report_year, genre, metric)
);

-- GameAnalytics 2024 데이터 예시 (PDF에서 추출)
INSERT INTO genre_benchmarks (source, report_year, genre, metric, p10, p25, p50, p75, p90) VALUES
  ('gameanalytics_2024', 2024, 'Puzzle', 'retention_d1', 0.18, 0.24, 0.32, 0.40, 0.48),
  ('gameanalytics_2024', 2024, 'Puzzle', 'retention_d7', 0.03, 0.05, 0.09, 0.14, 0.20),
  ('gameanalytics_2024', 2024, 'Puzzle', 'retention_d28', 0.005, 0.01, 0.025, 0.05, 0.08),
  ('gameanalytics_2024', 2024, 'RPG', 'retention_d1', 0.15, 0.22, 0.30, 0.38, 0.45),
  ('gameanalytics_2024', 2024, 'RPG', 'retention_d7', 0.04, 0.07, 0.12, 0.18, 0.25),
  ('gameanalytics_2024', 2024, 'RPG', 'retention_d28', 0.01, 0.02, 0.05, 0.09, 0.14);
-- ※ 위 수치는 예시입니다. 실제 PDF에서 정확한 수치를 추출해야 합니다.
```

#### yieldo 베이지안 Prior로의 변환

```python
# genre_benchmarks 테이블 데이터를 NumPyro Prior로 변환
import numpyro.distributions as dist

def build_genre_prior(genre: str, metric: str, benchmarks: dict) -> dist.Distribution:
    """
    벤치마크 P10/P50/P90에서 Beta 분포 Prior를 피팅.

    Args:
        genre: 'Puzzle', 'RPG', 'Strategy' 등
        metric: 'retention_d1', 'retention_d7', 'retention_d28'
        benchmarks: {'p10': 0.18, 'p50': 0.32, 'p90': 0.48}
    """
    # P50을 중심으로, P10-P90 범위에서 Beta 분포 파라미터 추정
    mean = benchmarks['p50']
    # P10-P90 범위로 분산 추정
    spread = (benchmarks['p90'] - benchmarks['p10']) / 2.56  # ≈ 1 std

    # Beta 분포 alpha, beta 파라미터 계산
    variance = spread ** 2
    alpha = mean * (mean * (1 - mean) / variance - 1)
    beta = (1 - mean) * (mean * (1 - mean) / variance - 1)

    return dist.Beta(max(alpha, 0.5), max(beta, 0.5))
```

---

### 3.2 AppsFlyer Performance Index

| 항목 | 상세 |
|---|---|
| **URL** | https://www.appsflyer.com/performance-index/ |
| **발행 주기** | 연 1-2회 |
| **접근 방법** | 웹에서 직접 열람 (일부 데이터), PDF 다운로드 (전체) |
| **법적 상태** | ✅ 공개 발행물 |

#### 포함 데이터

| 데이터 | yieldo 활용 |
|---|---|
| 미디어 소스별 리텐션 랭킹 (D1, D7, D30) | UA 채널 벤치마크 |
| 미디어 소스별 볼륨 랭킹 | UA 채널 규모 비교 |
| 국가별 UA 효율 | 지역별 CPI 트렌드 참조 |
| 게임 vs 비게임 비교 | 산업 전체 맥락 |

#### 저장

`genre_benchmarks` 테이블에 `source = 'appsflyer_performance_index_2024'`로 동일하게 저장.

---

### 3.3 Unity Gaming Report

| 항목 | 상세 |
|---|---|
| **URL** | https://unity.com/resources/gaming-report |
| **발행 주기** | 연 1회 |
| **접근 방법** | 이메일 등록 후 PDF 다운로드 |
| **법적 상태** | ✅ 공개 발행물 |

#### 포함 데이터

| 데이터 | yieldo 활용 |
|---|---|
| 장르별 D1/D7/D30 리텐션 벤치마크 | Prior 보완 (GameAnalytics와 교차 검증) |
| 광고 수익 트렌드 | ARPDAU 모델링 참조 |
| 플랫폼별 (iOS/Android) 차이 | 플랫폼 보정 계수 |
| 국가별 참여도 차이 | 지역 보정 |

---

### 3.4 Adjust Mobile App Trends

| 항목 | 상세 |
|---|---|
| **URL** | https://www.adjust.com/resources/ebooks/mobile-app-trends/ |
| **발행 주기** | 연 1회 |
| **접근 방법** | 이메일 등록 후 PDF 다운로드 |
| **법적 상태** | ✅ 공개 발행물 |

#### 포함 데이터

| 데이터 | yieldo 활용 |
|---|---|
| 앱 카테고리별 설치/세션 트렌드 | 시장 성장률 참조 |
| 리어트리뷰션 비율 | UA 효율 벤치마크 |
| 지역별 모바일 트렌드 | 시장 기회 평가 |

---

### 3.5 Deconstructor of Fun

| 항목 | 상세 |
|---|---|
| **URL** | https://www.deconstructoroffun.com/ |
| **핵심 글** | "Long-Term Retention — Why D180 is the New D30" |
| **접근 방법** | 블로그 직접 열람 (무료) |
| **법적 상태** | ✅ 공개 블로그 — 인용 시 출처 명시 |

#### yieldo 활용

- D30-D60 윈도우에서 리텐션 커브가 안정화된다는 실증적 근거
- CLAUDE.md Section 3.2 Property 5 (Asymptotic Stabilization)의 산업 확인
- 장기 리텐션의 중요성에 대한 정성적 참조

---

### 3.6 GoPractice

| 항목 | 상세 |
|---|---|
| **URL** | https://gopractice.io/ |
| **핵심 글** | "The Importance of Long-Term Retention" |
| **접근 방법** | 블로그 직접 열람 (무료) |
| **법적 상태** | ✅ 공개 블로그 |

#### yieldo 활용

- "리텐션 커브가 평탄해지면 신규 유저가 정규 유저로 전환된 것" — floor 개념 확인
- Asymptotic floor의 실무적 의미

---

### 3.7 벤치마크 데이터 수집 체크리스트

```
□ GameAnalytics 2024 벤치마크 PDF 다운로드
  → 장르별 D1/D7/D14/D28 P10/P25/P50/P75/P90 추출
  → genre_benchmarks 테이블에 입력

□ AppsFlyer Performance Index 최신판 확인
  → 미디어 소스별 리텐션 랭킹 추출
  → genre_benchmarks 테이블에 입력

□ Unity Gaming Report 최신판 다운로드
  → 장르별 리텐션 벤치마크 추출 (교차 검증용)
  → genre_benchmarks 테이블에 입력

□ Adjust Mobile App Trends 최신판 다운로드
  → 시장 트렌드 데이터 참조

□ Deconstructor of Fun 핵심 글 읽기
  → 장기 리텐션 관련 인사이트 정리

□ GoPractice 핵심 글 읽기
  → Asymptotic floor 관련 인사이트 정리

→ 모든 벤치마크를 genre_benchmarks 테이블에 통합
→ NumPyro Prior 구축 스크립트 실행
→ Prior 분포 시각화 검증
```

---

## 4. Layer 2.5: 재무 데이터 입력

### 4.0 재무 데이터 입력 전략

MMP 연동으로 매출/CPI/ROAS는 자동 수집되지만, **전사 비용/현금/burn rate는 별도 입력이 필요합니다.**

#### 입력 방식: 3-Tier Progressive

```
Tier 1 (MVP, 수동 입력 3분):
  → yieldo 대시보드 Settings > Financial 페이지
  → 5개 필드만 입력

  1. 월 매출              [______] 또는 범위 [$100K - $200K]
  2. 월 UA 비용            [______]
  3. 현금 잔액             [______]
  4. 월간 총 지출 (burn)   [______]
  5. 목표 페이백 기간 (일)  [______]

Tier 2 (Month 2-3, 선택적 확장):
  → 같은 페이지에서 "상세 입력" 토글
  6. 매출 분해 (IAP / 광고)
  7. 게임별 개발비
  8. 게임별 운영비
  9. Gross margin
  10. 인원 수

Tier 3 (Phase 3+, 자동 연동):
  → Settings > Integrations > Accounting
  → QuickBooks Online 또는 Xero OAuth 연결
  → 3년치 P&L 자동 Pull (Clockwork 모델 참조)
```

#### 갱신 주기

| Tier | 갱신 방법 | 권장 주기 |
|---|---|---|
| Tier 1 | 수동 입력 (대시보드 폼) | 월 1회 |
| Tier 2 | 수동 입력 또는 CSV 업로드 | 월 1회 |
| Tier 3 | QuickBooks/Xero 자동 동기화 | 일 1회 (자동) |

#### Supabase 저장 스키마

```sql
CREATE TABLE financial_inputs (
  id BIGSERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  game_id UUID REFERENCES tenant_games(id),  -- NULL이면 전사 레벨
  input_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Tier 1 필수 (5개)
  monthly_revenue DECIMAL(14,2),
  monthly_revenue_range JSONB,          -- {"min": 100000, "max": 200000}
  monthly_ua_spend DECIMAL(14,2),
  cash_balance DECIMAL(14,2),
  monthly_burn DECIMAL(14,2),
  target_payback_days INTEGER,

  -- Tier 2 선택
  revenue_iap DECIMAL(14,2),
  revenue_ads DECIMAL(14,2),
  dev_cost DECIMAL(14,2),
  ops_cost DECIMAL(14,2),
  gross_margin DECIMAL(5,4),
  headcount INTEGER,

  -- 메타
  input_method TEXT DEFAULT 'manual',   -- 'manual', 'csv', 'quickbooks', 'xero'
  input_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, game_id, input_date)
);

-- RLS + 감사 로그 (영업비밀 보호 수준)
ALTER TABLE financial_inputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON financial_inputs
  USING (tenant_id = (SELECT tenant_id FROM user_profiles WHERE user_id = auth.uid()));
```

#### 보안 요구사항

- 재무 데이터는 **영업비밀** (부정경쟁방지법 보호 대상, PIPA 개인정보 아님)
- AES-256 암호화 (Supabase 기본 제공)
- 감사 추적: 누가 언제 조회/수정했는지 기록 (`financial_access_log` 테이블)
- 범위 입력 허용: 정확한 수치 대신 "$100K-$200K" 같은 범위로 심리적 부담 감소
- 데이터 삭제 보장: 고객 요청 시 즉시 전체 삭제 가능

---

## 5. Layer 3: 고객 데이터 연동 (Phase 2)

### 4.1 AppsFlyer Cohort API

> **수집 목적**: UA 인터벤션의 효과성을 시장 및 벤치마크 맥락에서 평가하기 위해 수집.
> CPI/ROAS/코호트 리텐션은 "얼마나 잘 집행했는가"가 아니라 "이 UA 액션이 장기 LTV와
> 페이백에 어떤 영향을 미쳤는가"를 측정하는 인터벤션 효과 데이터다.

| 항목 | 상세 |
|---|---|
| **Endpoint** | `POST https://hq1.appsflyer.com/api/cohorts/v1/data/app/{app_id}` |
| **인증** | Bearer Token (V2 API Token) — 고객이 자기 계정에서 발급 |
| **API 문서** | https://dev.appsflyer.com/hc/reference/cohort-api |
| **Rate Limit** | 500 req/sec, 30K req/min |
| **반환 형식** | JSON |
| **법적 상태** | ✅ 고객 인가 API (Customer-Authorized Agent 패턴) |

#### 요청 예시

```json
POST /api/cohorts/v1/data/app/com.example.game
Authorization: Bearer {customer_api_token}

{
  "from": "2026-01-01",
  "to": "2026-03-31",
  "groupings": ["date", "geo", "media_source"],
  "kpis": ["retention_day_1", "retention_day_7", "retention_day_30", "ecpi", "roas"],
  "filters": {
    "geo": ["US", "JP", "KR"],
    "media_source": ["Facebook Ads", "Google Ads"]
  },
  "granularity": "day"
}
```

#### Supabase 저장

```sql
CREATE TABLE mmp_cohort_data (
  id BIGSERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  source TEXT NOT NULL DEFAULT 'appsflyer',
  app_id TEXT NOT NULL,
  cohort_date DATE NOT NULL,
  country TEXT,
  media_source TEXT,
  campaign TEXT,
  installs INTEGER,
  cost DECIMAL(12,2),
  cpi DECIMAL(8,4),
  retention_d1 DECIMAL(5,4),
  retention_d7 DECIMAL(5,4),
  retention_d14 DECIMAL(5,4),
  retention_d30 DECIMAL(5,4),
  revenue_d7 DECIMAL(12,2),
  revenue_d30 DECIMAL(12,2),
  roas_d7 DECIMAL(8,4),
  roas_d30 DECIMAL(8,4),
  synced_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, source, app_id, cohort_date, country, media_source)
);

ALTER TABLE mmp_cohort_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON mmp_cohort_data
  USING (tenant_id = (SELECT tenant_id FROM user_profiles WHERE user_id = auth.uid()));
```

---

### 4.2 Statsig Console API

> **yieldo에서 가장 전략적으로 중요한 데이터 소스.** 실험 ATE(Average Treatment Effect)를
> ΔLTV → 실험 ROI로 번역하는 파이프라인의 입력이 된다. "실험 승리 ≠ 투자 가치"를 정량화하고,
> 어떤 인터벤션이 실제로 투자 가능한 성장을 만들고 있는지 판단하는 핵심 근거.

| 항목 | 상세 |
|---|---|
| **Pulse Results** | `GET https://statsigapi.net/console/v1/experiments/{id}/pulse_results` |
| **Gates List** | `GET https://statsigapi.net/console/v1/gates` |
| **Rollout Control** | `PATCH https://statsigapi.net/console/v1/gates/{id}` |
| **인증** | Header `statsig-api-key: {console_api_key}` — 고객이 Statsig 콘솔에서 발급 |
| **API 문서** | https://docs.statsig.com/console-api |
| **Rate Limit** | ~100 mutations/10sec, ~900/15min |
| **가격** | Developer 무료: 2M 이벤트/월, 무제한 시트 |
| **법적 상태** | ✅ 고객 인가 API |

#### ATE 가져오기 예시

```bash
curl -X GET "https://statsigapi.net/console/v1/experiments/tutorial_flow_v2/pulse_results" \
  -H "statsig-api-key: {customer_console_key}"
```

#### 핵심 반환 필드

```json
{
  "metrics": [
    {
      "metric_name": "d7_retention",
      "test_mean": 0.221,
      "control_mean": 0.185,
      "absolute_change": 0.036,          // ← ATE
      "relative_change": 0.195,
      "confidence_interval": {
        "lower": 0.012,
        "upper": 0.061
      },
      "p_value": 0.003,
      "is_significant": true
    }
  ]
}
```

---

## 5. 랭킹 데이터의 올바른 활용법

### 랭킹 데이터는 "추정 엔진"이 아니라 "분류 키 + 시장 시그널"

```
올바른 활용:
  ✅ 장르-티어 분류: "이 게임은 Strategy Top Grossing 30-50위" → 해당 밴드의 Prior 적용
  ✅ 시장 트렌드: "RPG Top Grossing 진입 난이도가 3개월간 상승" → 포화도 시그널
  ✅ 경쟁사 추적: "경쟁 게임이 Top Free에서 20위 → 5위로 급등" → UA 공격 감지
  ✅ 업데이트 효과: "업데이트 후 Top Grossing 순위 5단계 상승" → 라이브옵스 효과 프록시

잘못된 활용:
  ❌ "Top Grossing 30위니까 일매출 $50K" → 정밀도 낮음, ±50% 오차
  ❌ "랭킹이 올라갔으니 리텐션이 좋을 것" → 직접적 관계 없음
  ❌ "DL 추정치로 정확한 LTV 산출" → 추정 위의 추정은 무의미
```

---

## 6. 전체 데이터 파이프라인 요약

```
┌─────────────────────────────────────────────────────────────┐
│                  Data Pipeline Overview                      │
│                                                              │
│  Every 6 hours (Cloud Scheduler):                           │
│    Apple RSS → app_store_rankings 테이블                     │
│                                                              │
│  Every 24 hours (Cloud Scheduler):                          │
│    iTunes Search API → app_metadata 테이블                   │
│    google-play-scraper → app_metadata 테이블 (Android)       │
│                                                              │
│  Manual / Quarterly:                                         │
│    GameAnalytics PDF → genre_benchmarks 테이블               │
│    AppsFlyer Index → genre_benchmarks 테이블                 │
│    Unity Report → genre_benchmarks 테이블                    │
│                                                              │
│  On Customer Connect (Phase 2):                             │
│    AppsFlyer Cohort API → mmp_cohort_data 테이블             │
│    Statsig Console API → experiment_results 테이블           │
│                                                              │
│  All → Supabase PostgreSQL (RLS per tenant)                 │
│     → Python FastAPI reads → NumPyro/PyTorch inference       │
│     → Results cached in Upstash Redis                       │
│     → Next.js dashboard renders                              │
└─────────────────────────────────────────────────────────────┘
```

---

## References

### 공식 API 문서
- Apple RSS Generator: https://rss.applemarketingtools.com
- iTunes Search API: https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/
- AppsFlyer Cohort API: https://dev.appsflyer.com/hc/reference/cohort-api
- Statsig Console API: https://docs.statsig.com/console-api
- Adjust Report Service: https://help.adjust.com/en/article/report-service-api

### npm 패키지
- google-play-scraper: https://github.com/facundoolano/google-play-scraper
- app-store-scraper: https://github.com/facundoolano/app-store-scraper

### 벤치마크 리포트
- GameAnalytics: https://gameanalytics.com/resources/mobile-gaming-benchmarks
- AppsFlyer Performance Index: https://www.appsflyer.com/performance-index/
- Unity Gaming Report: https://unity.com/resources/gaming-report
- Adjust Mobile App Trends: https://www.adjust.com/resources/ebooks/mobile-app-trends/
- Deconstructor of Fun: https://www.deconstructoroffun.com/
- GoPractice: https://gopractice.io/
