# Bayesian Stats Engine — yieldo Migration

**Date**: 2026-04-29
**Branch**: `feature/d-bayesian-stats-engine` (예정)
**Status**: Design (구현 전)
**Source spec**: `/Users/mike/Downloads/Project Compass/docs/superpowers/specs/2026-04-21-bayesian-stats-engine-design.md` (treenod 원본)
**Migration item**: D (2순위) of 8-feature migration matrix (memory: `project_treenod_to_yieldo_migration`)

---

## 1. 목적과 배경

### 1.1 현재 yieldo 상태

yieldo의 `/dashboard/market-gap` 페이지는 "장르 기대치(prior) vs 우리 실적(posterior)" 비교를 보여주지만, 실제 통계 엔진이 없고 `mockPriorPosterior` 하드코딩 데이터만 표시한다.

| # | 결함 | 위치 | 영향 |
|---|------|------|------|
| 1 | Posterior가 mock 하드코딩 | `mock-data.ts:773` + `market-gap/page.tsx:11,45` | 실데이터 비교 불가 |
| 2 | Validity 개념 없음 | — | 데이터 부족 시에도 점수가 표시되어 거짓 정밀도 위험 |
| 3 | Genre prior 부재 | — | 장르별 비교 기준값 없음 |
| 4 | MMP vendor lock-in 가능성 | `shared/api/appsflyer/` 단일 구현 | 후속 vendor (Adjust 등) 추가 시 엔진 재작성 위험 |

### 1.2 yieldo가 *이미 해결*한 항목

A(AppsFlyer 연동) 작업이 D를 위한 기반을 선제적으로 깔아두었다. treenod 원본 spec §1.1의 결함 6개 중 3개는 yieldo 측에서 이미 해결됨:

| 항목 | yieldo 상태 | 증거 |
|---|---|---|
| Cohort depth 미스매치 | ✅ 이미 D1/D7/D30 | `aggregation.ts:116-119`, `types.ts:214-218` (CohortObservationSchema) |
| Revenue 단위 혼선 | ✅ plain USD 일관 | `eventRevenueUsd` 필드 (`aggregation.ts:130`, `types.ts:233`) |
| Genre/region 슬롯 부재 | ✅ AppSchema에 `genre`/`region` optional 필드 존재 | `types.ts:152-153` |

→ D 작업은 *원본 spec §3-§9*만 핵심. §1.1 사전정리 부분은 건너뜀.

### 1.3 이번 branch의 범위

**포함**:
- TS pure conjugate Bayesian 엔진 (Beta-Binomial 리텐션 + Log-normal MoM 수익)
- Metric Registry 패턴 (4 entries: d1/d7/d30/monthly_revenue)
- Validity gate (4 reason enum + UI 표시 정책)
- Snapshot v2 schema (posterior + validity 필드 추가, 기존 v1과 backward-compat)
- AppsFlyer 통합 (`computePosterior()` 단계 추가)
- Seed snapshot prebuild (mock fixture → 실제 engine 출력 → JSON commit)
- market-gap 페이지 와이어링 + Methodology Modal 한국어 카피
- Genre prior data file (GameAnalytics 2024 + Yieldo Engine Blueprint 기반 hardcode)

**포함 안 함** (§11 상세):
- PyMC/NumPyro Python service (deferred to B 차례)
- 다장르·다리전 prior, 다 vendor MMP, 다 게임 sync
- 추가 지표 (ARPDAU/CPI/LTV) — Registry는 4 entries로 시작
- MCMC 엔진, request-time recomputation
- gameKey enum 정리 (별도 sub-project)
- Plugin interface 외부 노출 (1차에는 Registry 내부 사용만)

### 1.4 Brainstorming 결정 4개 (2026-04-29)

브레인스토밍 단계에서 확정된 4개 결정:

| # | 결정 항목 | 채택 옵션 | 근거 |
|---|---|---|---|
| 1 | 엔진 스택 | **Hybrid (TS pure 1차, Python infra B 차례에 구축)** | D 모델은 conjugate라 NUTS 불필요. B(LSTM)/F(VC sim)이 진짜 Python 필요. 메모리 "PyMC" 명명은 카테고리 라벨이지 강제 아님. |
| 2 | gameKey 정책 | **현재 enum 유지 (D 범위 밖)** | D 엔진은 `app.genre`로 prior 조회. gameKey는 D critical path에 영향 없음. |
| 3 | §10 Plugin Registry | **1차 포함 (외부 노출은 후속)** | 4 metric을 균일하게 담는 그릇이라 분리 불가능. 인라인보다 코드량 동일하면서 형식 균일. |
| 4 | UI fallback | **Seed Snapshot prebuild** | 메모리 `feedback_landing_embedding` 정합 — mock 분기 대신 실제 engine 출력을 빌드타임에 1회 생성하여 commit. |

### 1.5 성공 기준

1. **과학 타당성**: Beta-Binomial conjugate 수학이 analytical reference와 1e-3 tolerance 일치
2. **투명성**: snapshot 파일에 priorParams, observations, engineVersion, validity 모두 기록 — git diff로 통계 변화 감사 가능
3. **안전성**: validity gate 실패 시 엔진이 숫자 대신 explicit `invalid` 반환 + UI에 "보류" 배지 노출
4. **확장성**: 새 metric 추가 = METRIC_REGISTRY에 1 entry 추가 + 모델 1파일. 엔진 코어·snapshot 스키마 수정 불필요
5. **데모-라이브 통일**: market-gap 페이지가 demo(seed snapshot)와 live(customer snapshot)에 대해 *같은 분기 0의 코드 경로* 사용

---

## 2. 시스템 경계와 데이터 흐름

### 2.1 전체 아키텍처

```
[AppsFlyer cron]                 [Seed prebuild]
      │                                │
      ▼                                ▼
CohortSummary v1            Mock cohort fixture
(yieldo aggregation.ts)     (mock-data.ts:773 → 변환)
      │                                │
      └──────────┬─────────────────────┘
                 ▼
         computePosterior()              ┌─────────────────────────┐
         + genrePrior 조회        ◀──────│ shared/data/            │
                 │                       │  genre-priors.json      │
                 ▼                       │  (P10/50/90 + ESS)      │
         PosteriorSnapshot v2            └─────────────────────────┘
         (cohorts + posterior +
          validity + engineVersion)
                 │
        ┌────────┴─────────┐
        ▼                  ▼
[Vercel Blob]      [seed-posterior.json
 (live customer)    committed to repo]
        │                  │
        └────────┬─────────┘
                 ▼
        market-gap/page.tsx
        ├ PriorPosteriorChart
        ├ Methodology Modal (L2 허용)
        └ "보류" 배지 (validity gate)
```

### 2.2 경계 원칙

1. **엔진은 pure**: I/O·네트워크·파일 접근 금지. 입력 = `(priorParams, observations)`, 출력 = `CredibleInterval | InvalidResult`. 테스트 용이성 + B(LSTM) 차례에 Python 측 재구현 비교 가능.
2. **Snapshot이 single source of truth**: live는 Vercel Blob, demo는 commit된 JSON 파일. UI는 *둘 다 동일한 zod schema*로 읽음. 분기 코드 0.
3. **Engine version은 snapshot에 기록**: `engineVersion` mismatch 시 prebuild 자동 재생성 (CI green 조건).

---

## 3. Bayesian Engine Core

### 3.1 Engine 모듈 구성

(전체 디렉터리 영향 범위는 §10 PR 분할 + §6.2 prebuild + §8.1 페이지 변경 참고)

```
src/shared/lib/bayesian-stats/
├── index.ts                    # 공개 API barrel
├── types.ts                    # CredibleInterval, MetricDefinition, Validity, ValidityReason, PosteriorRecord
├── beta-binomial.ts            # 리텐션 모델 (Beta(α,β) prior + Bin(n,k) likelihood, conjugate)
├── lognormal.ts                # 수익 모델 (LogNormal prior + MoM, right-skewed $)
├── beta-quantile.ts            # Numerical Recipes betaincinv 포팅 (CI low/high 계산용)
├── effective-sample-size.ts    # Prior strength cap 정책 (genre prior pseudo-counts 제한)
├── validity.ts                 # validatePrior, validateRetentionPosterior, validateRevenuePosterior
├── metric-registry.ts          # METRIC_REGISTRY (4 entries: retention_d1/d7/d30 + monthly_revenue_usd)
├── build-rows.ts               # registry 순회 → UI rows
├── version.ts                  # ENGINE_VERSION 상수 ("1.0.0")
└── __tests__/
    ├── beta-binomial.test.ts
    ├── lognormal.test.ts
    ├── validity.test.ts
    ├── shrinkage.test.ts       # property test: observed n 증가 → CI 폭 감소
    └── e2e.test.ts             # registry 전체 → row 출력 통합 테스트
```

### 3.2 공통 타입

```ts
// types.ts
export type CredibleInterval = {
  mean: number          // posterior mean (point estimate)
  ci_low: number        // 2.5% quantile
  ci_high: number       // 97.5% quantile
  sampleSize: number    // effective n (prior pseudo-counts + observed n)
}

export type ValidityReason =
  | "insufficient_installs"      // cohort installs < 1000
  | "insufficient_history"       // cohort age < 30일
  | "prior_ess_too_low"          // genre prior ESS < 5000
  | "engine_version_mismatch"    // snapshot의 engineVersion ≠ 현재 build

export type Validity =
  | { valid: true }
  | { valid: false, reason: ValidityReason, detail?: string }

export type PosteriorResult = CredibleInterval | { invalid: true, validity: Validity }

export type MetricDefinition<Prior, Obs> = {
  metricId: string
  model: BayesianModel<Prior, Obs>
  priorAccessor: (priors: GenrePriorRecord) => Prior
  observationAccessor: (snapshot: CohortSummary) => Obs
  validate: (obs: Obs) => Validity
}

export type PosteriorRecord = Record<string, PosteriorResult>
```

### 3.3 Beta-Binomial 모델 (리텐션)

Beta(α, β) prior + Binomial(n, k) likelihood = Beta(α+k, β+n-k) posterior (conjugate).

```ts
// beta-binomial.ts
export const betaBinomialModel: BayesianModel<{α: number, β: number}, {n: number, k: number}> = {
  posterior: ({α, β}, {n, k}) => {
    const αPost = α + k
    const βPost = β + (n - k)
    return {
      mean: αPost / (αPost + βPost),
      ci_low: betaQuantile(0.025, αPost, βPost),
      ci_high: betaQuantile(0.975, αPost, βPost),
      sampleSize: αPost + βPost,
    }
  },
}
```

Prior 구성: GameAnalytics 2024 benchmark의 P10/P50/P90을 (α, β) 형태로 변환. ESS cap 적용 (§3.5).

### 3.4 Log-normal 모델 (월 수익)

월 수익은 right-skewed 분포라 직접 conjugate Gaussian 부적합. Method-of-Moments로 LogNormal(μ, σ²) 파라미터 추정 후 prior와 가중 평균.

```ts
// lognormal.ts
export const lognormalModel: BayesianModel<{μ0: number, σ0: number}, {monthlyValues: number[]}> = {
  posterior: ({μ0, σ0}, {monthlyValues}) => {
    const logVals = monthlyValues.map(Math.log)
    const μMle = mean(logVals)
    const σMle = std(logVals)
    // 가중 평균 (prior strength = ESS pseudo-counts, observed strength = n)
    const w = monthlyValues.length / (monthlyValues.length + ESS_REVENUE)
    const μPost = w * μMle + (1 - w) * μ0
    const σPost = Math.sqrt(w * σMle**2 + (1 - w) * σ0**2)
    return {
      mean: Math.exp(μPost + σPost**2 / 2),
      ci_low: Math.exp(μPost - 1.96 * σPost),
      ci_high: Math.exp(μPost + 1.96 * σPost),
      sampleSize: monthlyValues.length + ESS_REVENUE,
    }
  },
}
```

### 3.5 Effective Sample Size (ESS) cap

Genre prior에서 추출한 pseudo-counts가 너무 크면 (예: 100,000) 우리 cohort 데이터(예: 1,500 installs)가 사실상 무시됨. 따라서 prior pseudo-counts에 상한 적용.

```ts
// effective-sample-size.ts
export const ESS_RETENTION_CAP = 10_000   // Beta α+β 합 상한
export const ESS_REVENUE = 6              // 월 수익 prior pseudo-months
```

ESS cap이 너무 낮으면 prior가 약해 D7→D30 예측이 노이즈에 흔들리고, 너무 높으면 우리 데이터가 묻힘. 10,000은 "전형적 cohort install 수의 5~10배" 기준. (treenod 원본 §3.6 참조)

### 3.6 Validity 정책

```ts
// validity.ts
export function validateRetentionPosterior(obs: {n: number, cohortAgeDays: number}, day: 1|7|30): Validity {
  if (obs.n < 1000) return { valid: false, reason: "insufficient_installs", detail: `n=${obs.n}` }
  if (obs.cohortAgeDays < day) return { valid: false, reason: "insufficient_history", detail: `age=${obs.cohortAgeDays}d, need ${day}d` }
  return { valid: true }
}

export function validatePrior(prior: GenrePriorRecord): Validity {
  if (prior.essRetention < 5000) return { valid: false, reason: "prior_ess_too_low", detail: `ESS=${prior.essRetention}` }
  return { valid: true }
}
```

### 3.7 Metric Registry

```ts
// metric-registry.ts
export const METRIC_REGISTRY: Record<string, MetricDefinition<any, any>> = {
  retention_d1: {
    metricId: "retention_d1",
    model: betaBinomialModel,
    priorAccessor: p => p.retention.d1,
    observationAccessor: s => ({
      n: totalInstalls(s),
      k: totalRetained(s, 1),
    }),
    validate: obs => validateRetentionPosterior(obs, 1),
  },
  retention_d7:  { /* 동일 패턴: priorAccessor=p.retention.d7, observationAccessor에서 totalRetained(s,7), validate(obs,7) */ },
  retention_d30: { /* 동일 패턴: day=30 */ },
  monthly_revenue_usd: {
    metricId: "monthly_revenue_usd",
    model: lognormalModel,
    priorAccessor: p => p.monthlyRevenueUsd,
    observationAccessor: s => ({ monthlyValues: groupRevenueByMonth(s.revenue.daily) }),
    validate: obs => obs.monthlyValues.length >= 3
      ? { valid: true }
      : { valid: false, reason: "insufficient_history", detail: `${obs.monthlyValues.length} months` },
  },
}
```

새 metric 추가 = entry 1개 + 모델 1파일. 엔진 코어 무수정.

---

## 4. Snapshot v2 Schema

기존 yieldo `SnapshotSchema` (`shared/api/appsflyer/types.ts:54-71`)는 *변경 없음*. 새 필드는 *별도 schema 확장*으로 추가:

```ts
// shared/api/posterior/snapshot-v2.ts
import { SnapshotSchema as AppsFlyerSnapshotSchema } from "@/shared/api/appsflyer/types"

export const CredibleIntervalSchema = z.object({
  mean: z.number(),
  ci_low: z.number(),
  ci_high: z.number(),
  sampleSize: z.number().nonnegative(),
})

export const ValiditySchema = z.discriminatedUnion("valid", [
  z.object({ valid: z.literal(true) }),
  z.object({
    valid: z.literal(false),
    reason: z.enum(["insufficient_installs", "insufficient_history", "prior_ess_too_low", "engine_version_mismatch"]),
    detail: z.string().optional(),
  }),
])

export const PosteriorSnapshotSchema = AppsFlyerSnapshotSchema.extend({
  posterior: z.record(z.string(), CredibleIntervalSchema).nullable(),
  metadata: z.object({
    engineVersion: z.string(),
    priorVersion: z.string(),
    validity: z.record(z.string(), ValiditySchema),  // metricId → validity
  }),
})
export type PosteriorSnapshot = z.infer<typeof PosteriorSnapshotSchema>
```

기존 AppsFlyer 흐름 *변경 없음*. `runMmpSync` 끝부분에 `computePosterior()` 단계만 추가하여 v2 형태로 저장.

---

## 5. Validity Gate — UI 노출 정책

### 5.1 메모리 정합 룰

- `feedback_korean_stats_terms`: Prior/Posterior → 사전/사후 분포, CI → 신뢰 구간
- `project_language_layering`: market-gap 페이지 = L1 (operator UI), 기술 용어는 Methodology Modal(L2)에만
- `feedback_transcendent_translation`: i18n 키 추가 시 transcendent-translation skill 자동 발동
- `feedback_design_master_authority`: UI 디자인 결정 자율 적용

### 5.2 Validity별 UI 표시

| Validity 결과 | 차트 영역 (L1) | "보류" 배지 카피 (L1) | Methodology Modal (L2) |
|---|---|---|---|
| `valid: true` | 사후 분포 + 95% 신뢰 구간 밴드 | (없음) | engineVersion, sampleSize, ESS, prior parameters 노출 |
| `insufficient_installs` | Prior만 표시 (회색 밴드) | "데이터 부족 — 보류" | "Cohort 내 install 수 < 1000 (현재 N개). Beta-Binomial posterior CI 너무 넓어 의사결정 불가." |
| `insufficient_history` | Prior + 진행률 게이지 | "관측 기간 부족 — 보류" | "Cohort age < 30일 (현재 D일). D30 retention 측정 가능 시점 도달 전." |
| `prior_ess_too_low` | 점선 prior + 경고 | "장르 기준값 부족 — 보류" | "Genre prior ESS < 5000 (현재 ESS=N). P10/P50/P90 band 신뢰도 낮음." |
| `engine_version_mismatch` | 빈 영역 + 갱신 안내 | "엔진 갱신 중 — 잠시 후" | "Snapshot의 engineVersion ≠ 현재 build. prebuild 재실행 필요." |

### 5.3 i18n 키 (한국어 기준, `shared/i18n/dictionary.ts` 추가 대상)

```
market.priorPosterior.title             "사전 vs 사후 분포"
market.priorPosterior.priorLabel        "사전 분포 (장르 기대치)"
market.priorPosterior.posteriorLabel    "사후 분포 (우리 데이터 반영)"
market.priorPosterior.ciLabel           "95% 신뢰 구간"
market.validity.suspended.title         "보류"
market.validity.insufficientInstalls    "데이터 부족 — 보류"
market.validity.insufficientHistory     "관측 기간 부족 — 보류"
market.validity.priorEssTooLow          "장르 기준값 부족 — 보류"
market.validity.engineVersionMismatch   "엔진 갱신 중 — 잠시 후"
market.methodology.title                "방법론"
market.methodology.engineVersion        "엔진 버전"
market.methodology.priorVersion         "사전값 버전"
market.methodology.sampleSize           "유효 표본 수"
```

영어 번역은 transcendent-translation skill로 별도 작업.

---

## 6. Seed Snapshot Prebuild

### 6.1 목적

Demo 페이지(market-gap)에 customer 미연결 상태에서도 *진짜 engine 출력*을 표시. mock 분기 코드를 코드베이스에서 제거.

### 6.2 Prebuild 스크립트

```ts
// scripts/build-seed-snapshot.ts
import { mockPriorPosterior } from "@/shared/api/mock-data"
import { computePosterior } from "@/shared/api/posterior/compute-posterior"
import { genrePriors } from "@/shared/data/genre-priors"
import { ENGINE_VERSION } from "@/shared/lib/bayesian-stats/version"

async function main() {
  const fixtureCohortSummary = transformMockToCohortSummary(mockPriorPosterior)
  const portfolioPrior = genrePriors.portfolio
  const snapshot = computePosterior(fixtureCohortSummary, portfolioPrior, {
    engineVersion: ENGINE_VERSION,
    priorVersion: genrePriors.version,
  })
  await fs.writeFile(
    "src/shared/data/seed-posterior.json",
    JSON.stringify(snapshot, null, 2)
  )
}
```

### 6.3 Engine version 안전망

```json
// package.json
{
  "scripts": {
    "prebuild": "tsx scripts/build-seed-snapshot.ts && next build",
    "verify-seed": "tsx scripts/verify-seed-snapshot.ts"
  }
}
```

`verify-seed`는 git diff 기반 — `build:seed` 실행 후 변동 있으면 CI fail. PR이 engine 코드를 바꿨는데 seed를 갱신하지 않으면 자동 차단.

---

## 7. AppsFlyer 통합

### 7.1 통합 지점

기존 `runAppsFlyerSync` (`shared/api/appsflyer/orchestrator.ts`) 끝부분 1단계 추가:

```
fetchInstalls → parseCSV → aggregate → [NEW: computePosterior] → saveSnapshot → return summary
```

`computePosterior(cohortSummary, app.genre)` 알고리즘 (metric 별 동일 순서):
1. `genre-priors.json`에서 `app.genre`에 해당하는 prior 조회 (없으면 portfolio default)
2. **validity 먼저 평가**: `metric.validate(obs)` → invalid면 `{ invalid: true, validity }` 반환, posterior 계산 skip
3. valid면 `model.posterior(prior, obs)` 호출 → CredibleInterval 산출
4. METRIC_REGISTRY 4 entries 모두 반복 → posterior + validity record 빌드
5. v2 snapshot 형태(§4)로 wrap → return

**원칙**: validity 실패 시 모델은 *호출되지 않음*. 거짓 정밀도 방지(성공 기준 §1.5 #3).

### 7.2 backward compatibility

- v1 snapshot (posterior 필드 없음)이 Vercel Blob에 남아 있으면 UI는 "engine_version_mismatch" validity로 처리하여 prebuild 안내 노출
- Snapshot v2 schema는 v1을 superset 으로 확장 — 기존 `aggregation.ts`·`blob-store.ts` 무수정

---

## 8. Market-Gap 페이지 와이어링

### 8.1 변경 대상 파일

- `src/app/(dashboard)/dashboard/market-gap/page.tsx` — `mockPriorPosterior` import 제거, `useLivePosterior(appId)` 훅으로 교체
- `src/shared/api/posterior/use-live-posterior.ts` — 신규 client hook (snapshot fetch + seed fallback)
- `src/widgets/charts/PriorPosteriorChart.tsx` (이미 존재) — props 타입을 `PosteriorSnapshot` 으로 정정
- `src/widgets/charts/MethodologyModal.tsx` — 신규 (validity, engineVersion, ESS 등 노출)

### 8.2 hook 인터페이스

```ts
// shared/api/posterior/use-live-posterior.ts
export function useLivePosterior(appId: string | "demo") {
  return useQuery({
    queryKey: ["posterior", appId],
    queryFn: async () => {
      if (appId === "demo") {
        return seedPosterior  // import { default as seedPosterior } from "@/shared/data/seed-posterior.json"
      }
      const res = await fetch(`/api/posterior/${appId}`)
      if (!res.ok) throw new Error("posterior fetch failed")
      return PosteriorSnapshotSchema.parse(await res.json())
    },
  })
}
```

분기 1개 (demo vs live) — seed/live 모두 *같은 zod schema* 통과.

---

## 9. Testing Strategy

| 레벨 | 대상 | 통과 기준 |
|---|---|---|
| Unit | `beta-binomial.ts`, `lognormal.ts`, `beta-quantile.ts` | analytical reference 와 1e-3 tolerance 일치 (성공 기준 §1.5 #1) |
| Unit | `validity.ts` | 4개 reason × edge cases (n=0, k>n, age=0, ess=0) 모두 PASS |
| Property | `shrinkage.test.ts` | observed n ↑ ⇒ posterior CI 폭 ↓ (property-based, fast-check 또는 vitest 수동 generator 100 trials) |
| Integration | `build-rows.ts` | METRIC_REGISTRY 4 entries 모두 row 생성 + 1개 invalid 케이스 처리 |
| Snapshot | `seed-posterior.json` | `npm run verify-seed` 실행 후 git diff 빈 결과 |
| Manual | market-gap Vercel preview | screenshot diff (Toss DPS 참조 vs 우리 — 메모리 `feedback_design`) |

---

## 10. PR 분할 (4 PR, 순차 진행)

| PR | 범위 | 검증 게이트 |
|---|---|---|
| **PR1** | `shared/lib/bayesian-stats/` 전체 + unit/property tests + `genre-priors.json` | `npm test` green |
| **PR2** | `shared/api/posterior/{compute-posterior, snapshot-v2}.ts` + AppsFlyer orchestrator 통합 + `/api/posterior/[appId]` route | mock cron 1회 실행 → v2 snapshot 생성 + zod parse 통과 |
| **PR3** | `scripts/build-seed-snapshot.ts` + `seed-posterior.json` commit + `prebuild`/`verify-seed` package script | `npm run prebuild` 결과 git clean |
| **PR4** | market-gap/page.tsx 와이어링 + Methodology Modal + i18n 한국어 키 | Vercel preview 스크린샷 + L1/L2 layering 자가검증 |

**병렬화 불가** — PR2는 PR1 의존, PR3는 PR1+PR2 의존, PR4는 PR3 의존. 순차 진행이 정답.

---

## 11. Out of Scope (1차에 안 함)

| 항목 | 처리 방향 |
|---|---|
| PyMC/NumPyro Python service | B(LSTM) 차례에 Cloud Run + FastAPI 인프라 신규 구축 |
| 다장르·다리전 prior 구조 | genre-priors.json 단일 파일 + portfolio default. 다지역은 후속 |
| Plugin interface 외부 노출 | METRIC_REGISTRY는 내부 사용. 외부 plugin 등록은 후속 |
| ARPDAU/CPI/LTV metric 추가 | Registry는 4 entries로 시작. 추가는 후속 sub-project |
| MCMC 엔진 | conjugate 모델로 충분. 비공액 prior 필요 시 후속 |
| gameKey enum 정리 | "data model cleanup" 별도 sub-project로 분리 |
| Sample 게임 per-game prior-posterior | 1차에서는 portfolio default + genre lookup만 |
| Revenue Forecast widget 통합 | 메모리 `project_revenue_forecast_decisions` 가 별도 Bayesian 3-layer 설계 — D의 monthly_revenue posterior가 그 위젯 입력으로 들어가는지 spec 작성 후 확인 |

---

## 12. References

### 외부 문서
- treenod 원본 spec: `/Users/mike/Downloads/Project Compass/docs/superpowers/specs/2026-04-21-bayesian-stats-engine-design.md`
- yieldo CLAUDE.md §3 (Retention Theory) — 5 properties + power law 모델
- yieldo CLAUDE.md §4 (Bayesian Decision Framework) — prior-posterior 철학
- yieldo CLAUDE.md §8.2 (AI Stack) — NumPyro 명시 (Hybrid 결정의 Python 측 종착지)
- yieldo `Project_Yieldo_Engine_Blueprint.md` — 통계/추론 엔진 구현 블루프린트

### 메모리 항목
- `project_treenod_to_yieldo_migration` — 8 feature matrix, D=2순위
- `feedback_workflow_brainstorm_first` — brainstorming 의무화 정책
- `feedback_landing_embedding` — 위젯 실물 임베드 원칙 (seed snapshot 결정 근거)
- `feedback_korean_stats_terms` — 한국어 통계 용어 정책
- `project_language_layering` — L0/L1/L2 레이어링
- `feedback_design_master_authority` — UI 디자인 자율 적용 권한
- `feedback_transcendent_translation` — i18n 자동 트리거
- `project_market_gap_alpha_frame` — Alpha = L2 signature metric (D는 L1 surface, Alpha는 후속 metric)
- `project_revenue_forecast_decisions` — Revenue Forecast 3-layer (D의 monthly_revenue 통합 검토 대상)

### 학술 / 산업
- Viljanen & Airola (2017) "Modelling User Retention in Mobile Games"
- GameAnalytics (2024) Mobile Gaming Benchmarks Report — genre prior 출처
- Sequoia Capital "Retention" — D7→D30 예측 가능성 근거

---

## 13. Engine Version 운영 규약

- `ENGINE_VERSION` 은 `version.ts` 단일 상수
- 변경 시 semver:
  - PATCH: 버그 수정 (수치 결과 동일)
  - MINOR: 모델 추가 (기존 결과 동일)
  - MAJOR: 수치 결과가 달라지는 변경 (모든 commit된 snapshot 재생성 필요)
- MAJOR bump 시 PR 체크리스트:
  - [ ] `seed-posterior.json` 재생성
  - [ ] Vercel Blob의 customer snapshot은 다음 cron 사이클에 자동 갱신
  - [ ] Methodology Modal에 "엔진 갱신: vN → vM" 안내 1주일 노출

---

**End of spec.**
