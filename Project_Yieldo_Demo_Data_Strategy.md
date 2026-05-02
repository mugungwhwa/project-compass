# yieldo — Demo Data Strategy

## Synthetic Generators · Persona Library · Sales Workflow

**Version**: 1.0
**Date**: 2026-05-02
**Classification**: Internal Strategy Document
**Audience**: 2-person dev team, sales/BD partner, demo session designer
**Related Documents**:
- Foundation: `CLAUDE.md` §3 (Retention Theory) §7 (Product Architecture)
- Architecture: `Project_Yieldo_Data_Architecture.md` §6
- Policy: `Project_Yieldo_Data_Policy.md`
- Engine: `Project_Yieldo_Engine_Blueprint.md`

---

## 1. Why Demo Data Strategy Matters

### 1.1 yieldo의 시연 본질

yieldo는 "분석 도구"가 아닌 "투자 의사결정 도구"다. 시연에서 보여줄 것은:
- ❌ "이런 차트가 있어요"
- ✅ "이 데이터로 이런 의사결정을 합니다"

따라서 demo data는 **현실적 + 의사결정이 명확히 도출되는** 시나리오여야 한다. 단순 random 데이터는 의사결정 demo가 불가능하다.

### 1.2 시연 실패 시나리오 (피해야 할 것)

| 안티패턴 | 결과 |
|---|---|
| Random retention curve | "이게 좋다는 건지 나쁘다는 건지 모르겠네요" |
| 한 가지 페르소나만 | "우리 케이스는 이거랑 다른데요" |
| 비현실적 metric (D7=80%) | "이건 우리 산업에선 불가능한 숫자인데요" |
| Live ops 이벤트 없는 평면 데이터 | "운영 임팩트가 없어 보이는데" |
| 시연 중 reset 안 됨 | (이전 세션 잔재로 demo flow 깨짐) |

### 1.3 성공 demo의 3요소

1. **현실성** — 5대 retention 성질·실제 산업 benchmark 범위 준수
2. **의사결정성** — 시청자가 "Green/Yellow/Red 판정"을 받아들이게
3. **재현성** — Deterministic seed + 1-click reset

---

## 2. Demo vs Production 격리

### 2.1 격리 결정 (Architecture §6.1 참조)

**선택**: **Schema-level separation** (`demo.*` vs `production.*`)

**이유**:
- RLS만 의존: 코드 버그 시 cross-tenant leakage 위험
- 별도 Supabase project: 운영 분기 + $25/월 추가 부담
- Schema 분리: 단일 connection pool 유지하며 물리적 격리 효과

### 2.2 구현

```sql
CREATE SCHEMA demo;

-- Production schema의 모든 테이블 미러
CREATE TABLE demo.org (LIKE public.org INCLUDING ALL);
CREATE TABLE demo.financial_input (LIKE public.financial_input INCLUDING ALL);
-- ... 모든 운영 테이블 동일 패턴
```

**API layer 분기**:

```typescript
// middleware에서 헤더 또는 subdomain 감지
const isDemoMode =
  request.headers.get('X-Yieldo-Mode') === 'demo' ||
  request.url.includes('demo.yieldo.app')

const schema = isDemoMode ? 'demo' : 'public'
const supabase = createClient({ schema })
```

### 2.3 격리 테스트

- 매 배포 전 자동 테스트: demo 데이터를 production에서 조회 불가 확인
- 매 분기 수동 침투 테스트: header injection 시도, JOIN injection 시도

---

## 3. Synthetic Data Generators

### 3.1 Generator 목록

| Generator | 상태 | 책임 | 위치 |
|---|---|---|---|
| `financial-input-seed.ts` | ✅ 완료 (PR-D Task 1) | Financial T1 mock | `shared/api` |
| `cohort-retention-seed.ts` | 📋 TODO | 5대 성질 만족하는 retention 곡선 | `shared/api` |
| `mmp-cpi-seed.ts` | 📋 TODO | 채널별 CPI/ROAS 시계열 | `shared/api` |
| `experiment-result-seed.ts` | 📋 TODO | ATE + CI 분포 | `shared/api` |
| `live-ops-event-seed.ts` | 📋 TODO | 시간축 intervention 이벤트 | `shared/api` |

### 3.2 공통 설계 원칙

1. **Deterministic seed**: 동일 `(personaId, dateRange)` → 동일 데이터셋
2. **Realistic noise**: 결정론적이되 시청자에게 자연스럽게 보일 jitter
3. **Composability**: 한 페르소나의 모든 generator가 일관된 스토리 형성
4. **Time-anchored**: 모든 generator가 동일 reference date 기준 (보통 today - 1)

### 3.3 cohort-retention-seed.ts 명세

**입력**:
```typescript
type RetentionSeedInput = {
  personaId: 'A' | 'B' | 'C'
  gameId: string
  cohortStartDate: Date
  cohortSize: number      // installs
  observationDays: number // 보통 30
  genre: 'puzzle' | 'rpg' | 'casual' | 'strategy'
}
```

**출력**:
```typescript
type RetentionPoint = {
  cohortDate: Date
  dayN: number          // 0, 1, 2, ..., observationDays
  activeUsers: number
  retentionRate: number // 0~1
}
```

**5대 성질 강제**:
- P1 (Monotonic): `R(d+1) <= R(d)` — 모든 d
- P2 (Sequential): `R(d+1)` 계산 시 `R(d)` 의존
- P3 (Decreasing): `R(d) → 0` as `d → inf`
- P4 (Decelerating): `|dR/dt|` 감소
- P5 (Asymptotic): 페르소나별 floor `c` 수렴

**구현 알고리즘**:
```
R(d) = a * (d+1)^b + c

where:
  a = persona.initialRetentionAt1 - persona.asymptoticFloor
  b = persona.decayExponent  // (-0.7, -0.3) 범위
  c = persona.asymptoticFloor // 0.01 ~ 0.15

noise: ±0.5% jitter, deterministic from hash(personaId, gameId, d)
```

### 3.4 mmp-cpi-seed.ts 명세

**입력**: persona + channel mix + dateRange
**출력**: 채널별 일일 CPI/installs/spend 시계열

**현실성 제약**:
- CPI는 채널·국가·장르별 GameAnalytics 2024 benchmark 범위 내 (예: 미국 RPG iOS = $5~20)
- 주말 효과 (CPI ↓, installs ↑)
- 페르소나 B (soft-launch RPG)는 CPI 점진 상승 (유저 풀 고갈 효과)

### 3.5 experiment-result-seed.ts 명세

**입력**: persona + experiment metadata
**출력**: ATE + CI + p-value + sample size

**시나리오 다양성**:
- Persona A: 명확한 winner (ATE > 0, p < 0.05, narrow CI)
- Persona B: 불확실 (ATE 양수지만 CI 0 포함)
- Persona C: 명확한 loser 또는 inconclusive

### 3.6 live-ops-event-seed.ts 명세

**출력**: 시간축 intervention 이벤트 + 예상 retention impact

**이벤트 타입**:
- 신규 콘텐츠 출시 (retention spike)
- UA 캠페인 시작 (cohort size 증가)
- 결제 프로모션 (ARPDAU 증가)
- 기능 deprecation (retention 미세 감소)

각 이벤트는 retention curve에 measurable impact 주입 → Action Impact Board 시연 가능.

---

## 4. Demo Persona Library

### 4.1 3-Persona 설계 의도

서로 다른 의사결정 시나리오를 보여주기 위한 3개 페르소나:

| Persona | 시나리오 | yieldo가 도출할 의사결정 |
|---|---|---|
| **A — Mid-tier Puzzle Publisher** | 안정 운영, 추가 투자 결정 | "Green — UA 30% 증액 추천" |
| **B — Soft-launch RPG** | 고불확실성, scale 결정 | "Yellow — 추가 D14 데이터 후 재평가" |
| **C — Declining Title** | 쇠퇴 게임, capital reallocation | "Red — UA 중단 + LiveOps 재투자" |

### 4.2 Persona A — Anchor Puzzle

**Story**: 2년 운영 중인 puzzle 게임. 안정적 retention, 명확한 LTV. 추가 마케팅 투자 가치 판단.

| Metric | 값 |
|---|---|
| 장르 | Puzzle (casual sub) |
| 운영 기간 | 24개월 |
| 월 매출 | $1.2M |
| 월 UA spend | $350K |
| Cash balance | $5M |
| Monthly burn | $200K |
| D1 retention | 38% |
| D7 retention | 14% |
| D30 retention | 5.5% |
| Asymptotic floor | ~3% |
| Genre band 위치 | P50 (median) |

**예상 시연 흐름**:
1. Executive Overview → "Green, payback 90일 P50"
2. Market Gap → "Genre 평균 대비 retention +8% 우위"
3. Action Impact → "지난 분기 LiveOps 이벤트 3건 모두 양의 LTV 임팩트"
4. Capital Console → "UA 30% 증액 시 IRR 18% → 24% 예상"

### 4.3 Persona B — Soft-launch Saga

**Story**: 베트남 + 인도네시아에서 4주 전 soft launch한 RPG. 데이터 부족, scale 결정 어려움.

| Metric | 값 |
|---|---|
| 장르 | RPG (mid-core) |
| 운영 기간 | 1개월 |
| 월 매출 | $80K (작음, 초기) |
| 월 UA spend | $120K (테스트) |
| Cash balance | $3M |
| Monthly burn | $400K |
| D1 retention | 42% (좋음) |
| D7 retention | 18% (애매) |
| D14 retention | 11% |
| Asymptotic floor | ?? (조기 판정 어려움) |
| Genre band 위치 | P40~P75 (불확실) |

**예상 시연 흐름**:
1. Executive Overview → "Yellow, payback P10/P50/P90 = 80/180/410일 (wide CI)"
2. Bayesian Prior 강조 → "RPG 장르 prior + D7 likelihood = posterior 여전히 불확실"
3. 추천 → "추가 14일 데이터 + UA 채널 1개 추가 테스트 후 재평가"
4. **이 페르소나가 yieldo의 Bayesian 가치를 가장 잘 보여줌**

### 4.4 Persona C — Declining Veteran

**Story**: 4년차 strategy 게임. Retention/매출 점진 감소. 투자 중단 vs LiveOps 재투자 결정.

| Metric | 값 |
|---|---|
| 장르 | Strategy (4X) |
| 운영 기간 | 48개월 |
| 월 매출 | $400K (전년 대비 -30%) |
| 월 UA spend | $200K |
| Cash balance | $2M |
| Monthly burn | $250K |
| D1 retention | 25% |
| D7 retention | 8% |
| D30 retention | 3% |
| Asymptotic floor | 1.5% (낮음) |
| Genre band 위치 | P25 (하위) |

**예상 시연 흐름**:
1. Executive Overview → "Red, payback 280일 (목표 120일 대비)"
2. Action Impact → "지난 6개월 LiveOps 이벤트 임팩트 점진 감소"
3. Capital Console → 두 시나리오 비교:
   - 옵션 1: UA 중단 + LiveOps 유지 → Cash burn 6개월 연장
   - 옵션 2: 신규 컨텐츠 투자 → P50 retention 회복 가능성 35%
4. **이 페르소나가 capital reallocation 의사결정을 가장 잘 보여줌**

### 4.5 Persona 선택 가이드 (영업 시나리오별)

| 미팅 상대 | 추천 페르소나 |
|---|---|
| 안정 운영 mid-tier publisher | A |
| Soft-launch 고민하는 신생 스튜디오 | B |
| 포트폴리오 의사결정 고민하는 publisher | C 또는 A→C 비교 |
| CFO/투자자 (재무 관점) | B (Bayesian 가치 부각) |
| UA Lead (운영 관점) | A (실용성 부각) |
| 정부 사업 심사위원 | A (안정성) + B (혁신성) |

---

## 5. Reset / Snapshot Mechanism

### 5.1 Reset Flow

```
사용자가 DemoSeedToolbar에서 "Persona A로 reset" 클릭
   │
   ▼
[Server Action: POST /api/demo/reset]
   │
   ├─ 인증 확인 (demo mode + admin role)
   ├─ TRUNCATE demo.* tables WHERE org_id = demoOrgId
   ├─ Generators 호출:
   │   ├─ financialInputSeed(personaId='A')
   │   ├─ cohortRetentionSeed(personaId='A', games=[...])
   │   ├─ mmpCpiSeed(personaId='A', channels=[...])
   │   ├─ experimentResultSeed(personaId='A')
   │   └─ liveOpsEventSeed(personaId='A')
   ├─ Bulk insert into demo.*
   ├─ Invalidate Redis: del *:{demoOrgId}:*
   └─ Return { personaId, summary, resetAt }
```

### 5.2 Reset 옵션

| 옵션 | 동작 | UX |
|---|---|---|
| Soft reset | 데이터만 교체, UI 상태 유지 | 토스트 알림 |
| Hard reset | 데이터 + localStorage + Redis 전체 | 페이지 새로고침 |
| Persona switch | 다른 persona로 교체 | Hard reset 자동 |

### 5.3 Snapshot (Phase 2)

특정 시점 demo state를 저장 → 영업 미팅 중 빠르게 복원:

```
저장: snapshot_id = createSnapshot(currentDemoState)
복원: restoreSnapshot(snapshot_id)  // < 1초
```

활용 예시:
- "어제 미팅 끝난 시점 state 저장 → 오늘 후속 미팅에서 그 시점부터 시연"
- "고객사가 자기 데이터 가상으로 입력해본 상태 저장 → POC 평가 시 재현"

---

## 6. Demo Data Legal Status

### 6.1 합성 데이터의 법적 분류

| 항목 | 일반 고객 데이터 | Demo Synthetic 데이터 |
|---|---|---|
| 영업비밀 (T1) | ✅ 보호 의무 | ❌ 합성, 보호 불요 |
| 개인정보 (T3) | ✅ PIPA 적용 | ❌ 가상, 적용 안 됨 |
| 저작권 | 고객사 보유 | yieldo 보유 |
| 외부 공유 | 고객 동의 필수 | 자유 공유 가능 |

### 6.2 사용 시 주의

**금지**:
- ❌ 실제 게임명 사용 (Clash of Clans, Royal Match 등) — defamation 리스크
- ❌ 실제 회사명 사용 (Supercell, Playrix 등) — trademark 리스크
- ❌ 특정 회사로 식별 가능한 metric 조합 사용

**권장**:
- ✅ 가상 게임명 (예: "Match Saga", "Galaxy Strategy", "Block Quest")
- ✅ 가상 publisher명 (예: "Indigo Studios", "Helix Games", "Vertex Mobile")
- ✅ Genre + tier 표기만 사용 ("Top 100 puzzle game in NA")

### 6.3 영업 자료에 사용 시

- 모든 demo screenshot에 "Demo data — fictional" 워터마크 (작게)
- Pitch deck에 사용 시 첫 페이지에 disclaimer 한 줄

---

## 7. Sales Demo Workflow

### 7.1 미팅 전 (T-24h)

```
1. 미팅 상대 페르소나 매칭 (§4.5 참조)
2. Demo URL 사전 접속 → persona reset 실행
3. 관련 영업 노트 조회 → demo flow 커스터마이징
4. 백업 페르소나 1개 추가 reset (질문 대응용)
```

### 7.2 미팅 중 (60분 표준 demo)

```
[0~5min]   yieldo 정체성 한 줄 + 4 silo problem statement
[5~15min]  Executive Overview → Green/Yellow/Red 판정 (페르소나별)
[15~30min] Module 2~4 순회:
            - Market Gap: prior + posterior 시각화
            - Action Impact: intervention causal value
            - Experiment Board: ATE → ΔLTV 번역
[30~45min] Capital Console: 시나리오 시뮬레이션 (양방향 대화)
[45~55min] Q&A — 추가 페르소나 toggle 가능
[55~60min] Next steps + POC 제안
```

### 7.3 미팅 후 (T+24h)

```
1. 시연 중 받은 질문 정리 (CRM에 기록)
2. 만약 고객이 본인 데이터로 시뮬레이션 원함 → POC schema 별도 생성
3. Demo state reset (다음 미팅 준비)
4. Demo session log 정리 (어떤 페르소나 + 어떤 흐름이 reaction 좋았는지)
```

### 7.4 POC (Proof of Concept) 단계

영업 진전 시 demo → POC로 전환:

```
[Demo]                      [POC]
- Synthetic data            - 고객 실제 데이터 (T1 보호 적용)
- demo.* schema             - production.* schema, 별도 org
- 모든 페르소나 toggle      - 고객사 데이터만
- 영업 데모               - 의사결정 검증 (보통 2~4주)
```

---

## 8. Generator 구현 우선순위

### 8.1 우선순위 매트릭스

| Generator | 우선순위 | 의존성 | 예상 소요 |
|---|---|---|---|
| `cohort-retention-seed` | **P0** | 없음 (가장 중요) | 4시간 |
| `live-ops-event-seed` | P0 | retention-seed | 3시간 |
| `mmp-cpi-seed` | P1 | 없음 | 3시간 |
| `experiment-result-seed` | P1 | 없음 | 2시간 |
| Snapshot mechanism | P2 | 모든 generator | 6시간 |

### 8.2 권장 작업 순서

1. `cohort-retention-seed` (P0) — Module 1·2·3·4 모두 의존
2. `live-ops-event-seed` (P0) — Action Impact Board 핵심
3. `mmp-cpi-seed` (P1) — Module 5 Capital Console
4. `experiment-result-seed` (P1) — Module 4 Experiment Board
5. Snapshot mechanism (P2) — 영업 본격화 후

### 8.3 통합 테스트

각 generator 단독 테스트 후 **persona별 통합 테스트** 필수:
- "Persona A 전체 데이터셋이 일관된 스토리를 형성하는가"
- "Module 1~5 모든 화면에서 모순 없이 표시되는가"
- "Reset → 새 persona → 다시 reset 시 leak 없는가"

---

## 9. 결정 요약 (Decision Log)

| 결정 | 선택 | 근거 |
|---|---|---|
| Demo 격리 방식 | Schema-level (`demo.*`) | RLS만은 위험, 별도 project는 과함 |
| Persona 수 | 3개 (A/B/C) | 의사결정 다양성 충분, 운영 부담 최소 |
| Generator 패턴 | Deterministic seed + jitter | 재현성 + 자연스러움 동시 확보 |
| 5대 성질 강제 | yes (cohort-retention-seed) | yieldo의 과학적 정합성 시연 |
| 가상 게임/회사명 | 강제 (실명 금지) | Defamation·trademark 리스크 회피 |
| Reset UI | DemoSeedToolbar (PR-D 완료) | 1-click + persona switch |
| Snapshot | Phase 2로 연기 | Generator 우선 완성 |

---

## 10. 미해결 / 다음 결정 필요

1. **i18n 적용** — Persona 스토리·게임명을 ko/en 모두 작성? 영문 데모 시점에 결정
2. **모바일 demo 지원** — 영업 미팅이 데스크탑 위주, 모바일 데모 필요성 검증 후 결정
3. **VC Simulator 페르소나** — Feature F (VC pivot) 진행 시 별도 페르소나 추가 검토
4. **Adversarial demo** — 의도적으로 "yieldo가 답을 못 주는" 시나리오 페르소나 추가 (정직성 차별화)? Phase 2 검토
5. **Persona 자동 회전** — 미팅 일정 + CRM 연동 → 자동 reset. Phase 3+

---

## 11. 변경 이력

| 날짜 | 버전 | 변경 | 작성자 |
|---|---|---|---|
| 2026-05-02 | 1.0 | 최초 작성, 3-persona 설계 + generator 우선순위 확정 | Mike |
