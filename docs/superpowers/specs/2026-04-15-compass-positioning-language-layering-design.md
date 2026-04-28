# yieldo Positioning — A+B 하이브리드 & L0/L1/L2 언어 레이어링

**Date**: 2026-04-15
**Type**: Positioning / Language Framework (전체 제품 포지셔닝)
**Source**: Brainstorming (superpowers:brainstorming, 5 sections approved)
**Predecessor**: `2026-04-14-market-gap-bayesian-loadbearing-diagnosis.md` + `2026-04-14-market-gap-bayesian-p3-implementation.md`
**Driver**: 어제 세션에서 단독 합의된 "yieldo = Alpha 측정 인프라" 포지션의 외부 검증 부재·Layer 혼재 리스크 → 오늘 brainstorming으로 재구성

---

## 1. 결정 요약

**A+B 하이브리드 채택** (단일 framing 선정이 아닌 레이어 분리):

- **Top-line position (L0) = Decision OS** (CLAUDE.md §1 원본 유지)
- **Signature mechanism (L2) = Alpha** (잠정, 외부 검증 대기)
- **Operator UI (L1) = 의사결정 언어** (Invest/Hold/Reduce 신호, Alpha 단어 미노출)

어제 단일 framing("yieldo = Alpha 측정 인프라")으로 밀었던 결정을 레이어 분리 구조로 재구성. Alpha는 포지션의 pillar가 아닌 mechanism의 signature metric으로 격하.

---

## 2. Rubric & 후보 비교 (결정 근거)

### 2.1 평가 기준 (세 축, 가중치)

| 기준 | 가중치 | 의미 |
|---|---|---|
| Operator 즉각 이해도 | 40% | 게임 스튜디오 운영자가 5초 안에 "이거 우리한테 도움된다" 판단 |
| 카테고리 차별성 | 30% | Sensor Tower/AppsFlyer/Statsig와 다른 카테고리임을 한 문장으로 설명 |
| Product fit | 30% | Module 1–5 전체와 자연스러운 통합 |

### 2.2 후보 4개 채점

| # | Framing | Operator (40%) | 차별성 (30%) | Fit (30%) | Total |
|---|---|---|---|---|---|
| A | Alpha 측정 인프라 | 6/10 | 9/10 | 7/10 | 7.2 |
| B | Decision OS (CLAUDE.md §1) | 8/10 | 5/10 | 9/10 | 7.4 |
| C | PMF Signal Platform | 9/10 | 6/10 | 7/10 | 7.4 |
| D | Cohort Edge Intelligence | 5/10 | 7/10 | 6/10 | 6.0 |
| **A+B** | **Decision OS (Alpha signature)** | **8/10** | **8/10** | **9/10** | **8.3** |

A+B 하이브리드가 3-축 모두에서 경쟁력 있고 총점 우위.

---

## 3. L0/L1/L2 언어 레이어링 프레임

### 3.1 3층 정의

| Layer | 대상 Context | Audience | 우세 언어 | 기술 용어 허용 |
|---|---|---|---|---|
| **L0** | Marketing / Public | 잠재 고객, 심사위원 | Decision OS (§1 원본) | 최소 |
| **L1** | Dashboard UI (Operator) | 게임 스튜디오 운영자 | 의사결정 결과 언어 | 0 |
| **L2** | Methodology / Investor Pitch | 분석가, VC, CTO, 기술 심사 | Alpha · Bayesian 학술어 | 중~고 |

### 3.2 레이어별 규칙

**L0 (Marketing)**:
- Mike가 정제한 공식 문장 유지 — 건드리지 않음
- 예: "Signal-to-Yield Operating Terminal for mobile gaming"

**L1 (Dashboard UI / Operator)**:
- 의사결정 동사로 끝나는 문장 원칙
- 결과를 먼저 말하고 근거는 선택적
- 기술 용어(Alpha, Prior, Posterior, Bayesian) **절대 노출 금지**
- 예: "우리 D7 18.7 vs 장르 14.2 → Invest 신호"

**L2 (Methodology)**:
- 토글, ⓘ, expand로만 노출
- 기본 상태에서 L1 사용자의 시야에 들어오지 않아야 함
- Alpha · Bayesian · Posterior 등 학술·업계어 허용
- 예: "Alpha Persistence: posterior update loop로 검증"

### 3.3 Layer 간 충돌 해결

같은 데이터를 다른 layer에서 다르게 부를 때:
- **두 값은 반드시 동일 source**를 가리켜야 함 (integrity)
- **색상·위치 등 시각 anchor는 두 layer에서 동일** (초록 = 우리, 빨강 = 장르)
- 용어만 context별로 교체

---

## 4. Market Gap P3 Rebalance (어제 spec 조정)

### 4.1 용어 치환표 (L0/L1/L2 규칙 적용)

| 위치 | 어제 표현 | 오늘 (규칙 적용) | Layer |
|---|---|---|---|
| 차트 제목 | "시장 컨센서스 vs 우리 실적 — Alpha 측정" | **"시장 기대치 vs 우리 실적"** | L1 |
| 범례 (prior side) | "시장 컨센서스 (장르 median)" | "장르 기대치 (median, D{n})" | L1 |
| 범례 (posterior side) | "우리 실적 (코호트 관측 ±CI)" | 그대로 | L1 |
| Gap 표시 | "Alpha +31%" | **"우리 우월 +31%"** | L1 |
| 동적 insight | "Alpha +31% (edge 생성 중)" | **"장르 평균 대비 +31% — Invest 신호"** | L1 |
| Methodology 토글 | "Alpha Persistence 검증 보기" | 그대로 (L2) | L2 |
| Methodology 패널 | "Persistent vs Transient Alpha" | 그대로 (L2) | L2 |

### 4.2 Signal별 판정 언어 (L1)

HeroVerdict와 1:1 동일 언어 사용:

- Match League: "우리 우월 +31% → **Invest 신호**"
- Weaving Fairy: "우리 ±4% → **Hold 신호**"
- Dig Infinity: "우리 부족 -19% → **Reduce 신호**"

L2 methodology 패널에서만 "이 판정은 Alpha Persistence 검증 기반" 명시.

### 4.3 색상·구조 (유지)

변경 없음. 초록 = 우리, 빨강 = 장르, 파랑 = 격차 accent. 두 레이어 UX 구조 유지. Cyclic Update Timeline은 L2 내부에 잔존.

---

## 5. Signature Metric 이름 외부 검증 플랜

"Alpha" 단어 확정은 외부 검증 전까지 유예. 구조는 고정, 이름은 i18n 키로 교체 가능.

### 5.1 후보 (검증 대상)

| # | 후보 | 출처 감각 | 강점 | 약점 |
|---|---|---|---|---|
| A | Alpha | Finance 직설 | 투자자 pitch 무기 | Operator 번역 비용, 정의 stretch |
| B | Market Beat | 일상 + 경량 finance | 짧음, 한국어 자연 매핑 | 신조어, 검색 친화성↓ |
| C | 초과 성과지표 | 한국어 풀이 | 번역 비용 0, 예창패 친화 | 영문 pitch에서 약함 |
| D | Genre Outperformance | 도메인 특정 | 게임 청중 구체적 | 카테고리 확장 제약 |
| E | Cohort Edge | Game-native | 코호트 프레임 명시 | "Edge" 추상 |

### 5.2 검증 설계

**타겟 샘플**:
- Operator (게임 스튜디오): 3명 이상. PD/BD/CEO 혼합. Mike 네트워크 + AppMagic 前 세일즈 디렉터 경로
- 투자자: 2명 이상. 모바일 게임 투자 경험자
- 분석가: 1-2명. 데이터 팀 리드

**질문 템플릿**:
> "우리 제품은 yieldo Decision OS입니다. 그 안에서 시장 기대치 대비 우리 실적의 차이를 측정하는 지표가 있어요. 이걸 {A/B/C/D/E} 중 어떤 단어로 부르는 게 자연스러울까요?"

각 audience에 같은 질문, 다른 순서로 후보 제시(순서 편향 제거).

**합의 조건**:
- Top 선택지가 operator/투자자/분석가 세 그룹 모두에서 동일 → 최종화
- 분열 시 Layer별 분리:
  - L1 trigger 텍스트 → operator top pick
  - L2 panel body → 투자자 top pick

### 5.3 잠정 운영 원칙

- L1: "Alpha" 단어 미사용 (어제 잘못 노출된 부분 정리)
- L2: "Alpha" 잠정 유지, i18n 키 `methodology.signatureMetric` 하나로 감싸기
- 문서 표기: spec/메모리에서 "Alpha"는 "(잠정, 외부 검증 대기)" 주석 동반

---

## 6. Downstream 변경 리스트

이번 디자인 승인 결과 반영되는 파일:

### 6.1 편집 (3 files)

1. **`2026-04-14-market-gap-bayesian-p3-implementation.md`**
   - §2 제목: "Alpha는 signature mechanism (L2 전용)"
   - §3.1 치환표 재작성 (L1에서 Alpha 제거)
   - §3.3 insight 예시 재작성 (Invest/Hold/Reduce 언어)
   - §6 수용기준 조정 ("L1에 'Alpha' 부재 확인" 추가)

2. **`2026-04-14-market-gap-bayesian-loadbearing-diagnosis.md`**
   - §10 "후속 업데이트" 재작성 — Alpha 역할을 L2 signature metric으로 재정의

3. **Memory `project_market_gap_alpha_frame.md`**
   - 제목·설명·본문 재작성 — "Alpha 측정 인프라 포지션" 주장 제거, "Decision OS의 signature mechanism (L2, 잠정, 외부 검증 대기)"로 재기술

### 6.2 신규 (1 memory)

4. **Memory `project_language_layering.md` (신규)**
   - L0/L1/L2 프레임 명시. 다음 세션 재발 방지
   - yieldo 전반 (Market Gap, Revenue Forecast, Module 3/4) 적용 규칙

### 6.3 인덱스 (1 file)

5. **`MEMORY.md`**
   - Market Gap 항목 요약 업데이트
   - 신규 language layering 항목 추가

### 6.4 건드리지 않는 것

- CLAUDE.md — §1 top-line 그대로
- Sprint 5 결과물 (랜딩 v2) — 이미 L0 준수
- `2026-04-14-revenue-forecast-bayesian.md` — Alpha 미사용, 이미 L1/L2 분리됨
- 코드 — 이번 세션 미변경

---

## 7. 기술적 합리성 체크 (§1–§5 통합)

- **변경 격리**: 코드 0, 문서만. 회귀 위험 없음
- **i18n 키 설계**: `methodology.signatureMetric` 단일 참조로 rename 비용 최소화
- **시각 anchor 안정**: 색상·아이콘·위치는 이름과 독립
- **Layer 독립 교체 가능**: L0/L1/L2 각자 진화 가능, 한 layer 변경이 다른 layer를 깨지 않음
- **Revenue Forecast와 일관**: 이미 구현된 Revenue Forecast가 L1/L2 분리 원칙을 준수하고 있으므로 이번 Market Gap 조정이 전체 일관성 강화

---

## 8. 비즈니스 의사결정 가능성 체크

| Audience | 이 디자인이 가능하게 하는 의사결정 |
|---|---|
| Operator (게임 스튜디오) | L1만 봐도 Invest/Hold/Reduce 판정 + 근거 즉시 이해 → 자본 배분 결정 |
| 투자자 | L2 toggle로 Alpha Persistence 증명력 확인 → 투자 thesis 검증 |
| 예창패 심사위원 | L0 top-line + L2 methodology로 방법론 근거 제출 |
| 내부 개발자 | L0/L1/L2 레이어 규칙으로 새 차트·문구 추가 시 "어느 층에 넣을지" 즉결 판단 |

---

## 9. 수용 기준 (이 디자인 자체)

- [x] Top-line (L0) = Decision OS 유지, CLAUDE.md §1 그대로
- [x] Alpha는 L2 전용 signature metric으로 격하, 외부 검증 대기 표기
- [x] L1에서 기술 용어(Alpha, Prior, Posterior, Bayesian) 사용 금지 원칙
- [x] L0/L1/L2 충돌 시 해결 원칙 정의 (동일 source, 동일 시각 anchor)
- [x] 후보 framing 4개 대비 A+B 하이브리드의 rubric 우위 입증 (8.3 vs 7.2/7.4/7.4/6.0)
- [x] 외부 검증 플랜 구체화 (샘플·질문·합의 조건)
- [x] Downstream 문서 변경 리스트 명시
- [x] 회귀 위험 0 (코드 미변경)

---

## 10. 다음 단계

1. **이 디자인 spec 커밋** (지금)
2. **§6 downstream 변경 일괄 적용 + 커밋**
3. **사용자 spec 리뷰 게이트** (brainstorming skill 규정)
4. **writing-plans 스킬로 전환** — Market Gap P3 L1 구현 플랜 + 외부 검증 프로세스 플랜 작성

구현 자체는 writing-plans 이후 별도 세션에서.

---

## 11. 관련 문서

- CLAUDE.md §1 (Decision OS top-line)
- CLAUDE.md §11.2 (operator-not-analyst 원칙 — L1 정당성)
- `2026-04-14-market-gap-bayesian-loadbearing-diagnosis.md` §1–§9 (진단 결과 유지, §10만 수정)
- `2026-04-14-market-gap-bayesian-p3-implementation.md` §4–§10 (구조 유지, §2–§3 조정)
- `2026-04-14-revenue-forecast-bayesian.md` (이미 L1/L2 분리 구현된 참조 예시)
- Memory `feedback_workflow_brainstorm_first.md` (이 spec이 생산된 프로세스 규정)
