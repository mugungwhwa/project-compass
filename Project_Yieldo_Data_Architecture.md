# yieldo — Data Architecture Document

## Storage · Compute · Data Flow Specification

**Version**: 1.0
**Date**: 2026-05-02
**Classification**: Internal Architecture Document
**Audience**: 2-person dev team, future infra hires, technical due-diligence reviewers
**Related Documents**:
- Foundation: `CLAUDE.md` §8 (AI & Technology Stack)
- Implementation: `Project_Yieldo_Tech_Stack.md`
- Pipeline: `Project_Yieldo_Engine_Blueprint.md`
- Sources: `Project_Yieldo_Data_Sources_Guide.md`
- Compliance: `Project_Yieldo_Legal.md`
- Policy (sibling): `Project_Yieldo_Data_Policy.md` (to be authored)
- Demo (sibling): `Project_Yieldo_Demo_Data_Strategy.md` (to be authored)

---

## 1. Why Not Databricks (그리고 왜 Snowflake도 아닌가)

### 1.1 카테고리 오인 방지

yieldo는 Foundation Document §1.3에서 명시한 대로 **데이터 웨어하우스가 아니다**. Translation layer는 raw event를 저장·집계하는 시스템이 아니라, 이미 집계된 4개 silo의 출력을 **연결·번역**하는 시스템이다.

| 도구 카테고리 | 처리 단위 | 일반적 데이터량 | yieldo 해당? |
|---|---|---|---|
| Warehouse (Databricks/Snowflake) | Raw events, granular logs | TB~PB/월 | ❌ |
| Lakehouse (Databricks Delta) | Streaming + batch unified | TB+/일 | ❌ |
| Operational DB (Postgres) | Aggregated cohorts, metrics, configs | MB~GB/테넌트 | ✅ |
| Cache (Redis) | Hot query results, session state | KB~MB | ✅ |
| Object Store (GCS/S3) | Raw API dumps, archives | GB/월 | ✅ |

yieldo가 다루는 데이터의 본질:
- **Cohort retention**: 게임당 N일 × 테넌트당 ~10개 게임 → 한 테넌트 평생 누적 ~10MB
- **MMP API pull**: AppsFlyer Cohort API daily, 게임당 ~100KB → 한 테넌트 일일 ~1MB
- **Financial input**: Manual, 5~30 metrics × monthly → 한 테넌트 평생 ~100KB
- **Experiment results**: ATE + CI per experiment, ~50 experiments/year/테넌트 → ~1MB

**결론**: 100개 테넌트 기준 누적 데이터 ~10GB. Postgres 단일 인스턴스로 10년치 처리 가능.

### 1.2 Databricks 도입 시 비용·운영 부담

| 항목 | Databricks | Supabase Pro |
|---|---|---|
| 월 고정비 | $1,500~ (workspace + compute floor) | $25 |
| 운영 인력 | Spark 운영 지식 필수 | Postgres SQL만 알면 됨 |
| 학습 곡선 | 2~4주 | 즉시 |
| 2인 팀 적합도 | ❌ overkill | ✅ |

### 1.3 Snowflake도 같은 이유로 제외

Snowflake는 Databricks보다 SQL-friendly하지만 여전히:
- 최소 $40/월 + per-second compute
- yieldo의 query pattern (작은 단위 read-heavy + cache-friendly)에 비효율적
- Postgres + Redis 조합이 latency·cost 양쪽에서 우월

### 1.4 그러면 언제 도입하나? (Objective Triggers)

다음 셋 중 **둘 이상** 충족되기 전엔 검토조차 시작하지 않는다:

1. 활성 유료 테넌트 **100+**
2. 처리 raw event volume **10TB+/월**
3. Spark/distributed compute가 **강제되는** ML 도입 (예: 100M+ user 단위 deep learning training)

현재 상태: 0 / 0 / 0. 트리거까지 최소 18~24개월 거리.

---

## 2. 3-Layer Storage Model

### 2.1 Layer 개요

```
┌─────────────────────────────────────────────────────────────┐
│  L1 — HOT (Supabase PostgreSQL + RLS)                       │
│  목적: 실시간 read/write, 트랜잭션, 테넌트 운영 데이터          │
│  대상: cohort_retention, financial_input, experiment_result, │
│        org/user/role, audit_log                              │
│  Latency: < 50ms                                             │
└─────────────────────────────────────────────────────────────┘
                          ▲
                          │ frequent reads
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  L2 — CACHE (Upstash Redis, serverless)                     │
│  목적: Hot path 응답 가속, 세션, rate limit                   │
│  대상: prediction band cache, dashboard query result,        │
│        Statsig API response, TanStack Query SSR cache        │
│  Latency: < 10ms                                             │
│  TTL: 60s ~ 24h (도메인별)                                   │
└─────────────────────────────────────────────────────────────┘
                          ▲
                          │ refill on miss
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  L3 — COLD (GCS bucket, lifecycle to Coldline)              │
│  목적: Raw archive, audit retention, ML training corpus      │
│  대상: MMP API daily dump, audit log archive (>30d),         │
│        ML model artifacts, public benchmark snapshots        │
│  Latency: ~100ms (Standard) ~ 5s (Coldline)                  │
│  Lifecycle: 30d → Nearline → 90d → Coldline → 365d → Archive │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 L1 — Supabase PostgreSQL

**역할**: 모든 운영 데이터의 source of truth

**핵심 테이블 그룹**:

| 그룹 | 테이블 | 용도 |
|---|---|---|
| Identity | `org`, `org_member`, `user`, `role` | 테넌트·사용자·권한 |
| Connections | `connection`, `connection_credential` | MMP/Statsig 연동 정보 (credential은 Vault) |
| Game Catalog | `game`, `game_version` | 테넌트별 게임 메타 |
| Cohort Data | `cohort`, `cohort_retention_point` | 게임별 일일 cohort + N일 retention |
| Financial | `financial_input`, `financial_input_history` | T1 영업비밀, AES-256 column 암호화 |
| Experiment | `experiment`, `experiment_arm`, `experiment_result` | A/B 메타 + ATE 결과 |
| Action Log | `action_event`, `action_impact` | 모든 intervention + causal impact |
| Predictions | `prediction_run`, `prediction_band` | ML inference 결과 + credible interval |
| Audit | `audit_log` | 모든 T1·T2 read/write 기록 |

**RLS 원칙**:
- 모든 테넌트 데이터 테이블은 `org_id` 컬럼 + RLS policy 강제
- Service role은 ML inference 전용, 사용자 세션엔 절대 노출 X
- `auth.uid()` 기반 row filter, `org_member` JOIN으로 권한 체크

**확장 옵션** (필요 시점에):
- `pgsodium` — column-level encryption (T1 financial)
- `pg_partman` — `cohort_retention_point` 시계열 파티셔닝 (테넌트 50+ 시점)
- `timescaledb` — 만약 retention 일별 scale이 100M row 초과 시 (현재 예상 X)

### 2.3 L2 — Upstash Redis

**역할**: Latency-critical read 가속, 무상태 SaaS의 결합 완화

**캐시 대상 + TTL**:

| 키 패턴 | 데이터 | TTL | 무효화 트리거 |
|---|---|---|---|
| `pred:band:{game_id}:{date}` | Prediction band P10/P50/P90 | 24h | nightly batch 완료 시 |
| `dash:overview:{org_id}` | Executive overview payload | 5min | financial_input write |
| `mmp:cohort:{conn_id}:{date}` | AppsFlyer API 응답 | 24h | manual refresh |
| `bench:genre:{genre}:{tier}` | Public benchmark band | 7d | weekly batch |
| `ratelimit:{user_id}:{route}` | Rate limit counter | 60s | (auto-expire) |
| `session:{token}` | Better Auth session | 24h | logout |

**무상태 원칙**: Redis 전체가 cold-start 가능. 모든 데이터는 L1에서 재구축 가능해야 한다.

### 2.4 L3 — GCS Cold Storage

**역할**: Raw 보존, 감사·재학습·법적 의무 대응

**버킷 구조**:

```
gs://yieldo-cold/
├── raw/
│   ├── mmp/
│   │   ├── appsflyer/{org_id}/{yyyy-mm-dd}.json.gz
│   │   └── adjust/{org_id}/{yyyy-mm-dd}.json.gz
│   └── statsig/{org_id}/{experiment_id}/{yyyy-mm-dd}.json.gz
├── audit/
│   └── {yyyy-mm}/audit_log_archive.parquet
├── ml/
│   ├── models/{model_name}/{version}/
│   └── training/{cohort_export}/{yyyy-mm-dd}.parquet
└── benchmark/
    └── public/{source}/{yyyy-mm-dd}.json
```

**Lifecycle policy**:
- Standard 30일 → Nearline 60일 → Coldline 275일 → Archive (영구 또는 7년 후 삭제, 회계법 기준)
- Audit log은 **7년 강제 보존** (회계법 + 부정경쟁방지법 자료 보전)

---

## 3. Compute Topology

### 3.1 전체 토폴로지

```
                    ┌──────────────────┐
                    │  Vercel Edge      │
                    │  (Next.js 15)     │
                    │  - UI rendering   │
                    │  - Thin BFF       │
                    │  - Middleware auth│
                    └────────┬─────────┘
                             │
                ┌────────────┼────────────┐
                ▼            ▼            ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ Supabase │  │ Upstash  │  │ FastAPI  │
        │ Postgres │  │  Redis   │  │ (Cloud   │
        │  + RLS   │  │          │  │  Run)    │
        └─────┬────┘  └──────────┘  └────┬─────┘
              │                            │
              │       ┌──────────────┐    │
              ├──────►│  GCS Cold    │◄───┤
              │       │   Storage    │    │
              │       └──────────────┘    │
              │                            │
              ▼                            ▼
        ┌────────────────────────────────────────┐
        │  Cloud Run Jobs + Cloud Scheduler       │
        │  - Nightly MMP pull (per tenant)        │
        │  - Daily Bayesian posterior update      │
        │  - Weekly benchmark refresh             │
        │  - Monthly audit log archive            │
        └────────────────────────────────────────┘
```

### 3.2 컴포넌트별 책임

#### Vercel (Next.js)
- UI rendering (RSC + Client Components)
- Authentication middleware (Better Auth)
- Thin BFF: read는 Supabase 직접, write는 Server Action
- ML inference 호출은 FastAPI proxy
- **No heavy compute** — Vercel Functions 시간/메모리 한계 회피

#### Supabase
- Primary DB (Postgres 15+)
- RLS + Row-level auth
- Realtime (필요 시점에) — dashboard live update
- Storage (이미지·문서, GCS와 별도 — 사용자 업로드 영역)
- Edge Functions (간단한 webhook 처리)

#### Upstash Redis
- Serverless Redis (per-request pricing)
- TanStack Query SSR cache backend
- Rate limit (per-user, per-IP)
- Session store

#### FastAPI on Cloud Run
- 분리된 Python 서비스 (ML inference 전용)
- Endpoint 예시:
  - `POST /predict/retention` — Layer 1 power law fit + band 생성
  - `POST /predict/ltv` — Retention → LTV integration
  - `POST /experiment/translate` — ATE → ΔLTV → Experiment ROI
  - `POST /scenario/simulate` — Monte Carlo capital allocation
- Stateless, autoscale 0~N
- 모델 artifact는 GCS에서 lazy load, Redis에 in-memory cache

#### Cloud Run Jobs + Scheduler
- Nightly: MMP API pull, posterior update
- Weekly: Public benchmark refresh
- Monthly: Audit log → GCS Parquet
- 모든 job은 idempotent, retry-safe

### 3.3 왜 이 분리인가

**Next.js에서 Python 안 하는 이유**: Vercel Functions의 cold start + 메모리 한계 + Python 런타임 미지원. NumPyro/JAX는 컨테이너 환경 필수.

**FastAPI를 Vercel이 아닌 GCP에 두는 이유**:
- Vercel Pro의 Function 메모리 상한(1GB)으로 NumPyro NUTS 부족
- GCP Cloud Run은 4 vCPU / 32GB 가능, autoscale + 분당 과금
- 동일 region (asia-northeast3) 시 Supabase~Cloud Run latency ~10ms

**Supabase와 GCS 병용 이유**:
- Supabase Storage는 사용자 직접 업로드용 (이미지·문서)
- GCS는 시스템 raw archive·ML artifact 전용 (lifecycle 정책이 풍부)

---

## 4. Data Flow Diagrams

### 4.1 Ingestion Flow (Silo → L1)

```
[Silo 1: Public Benchmark]
   │ (weekly Cloud Run Job)
   ▼
GCS raw/benchmark/  ──►  L1 benchmark_band table

[Silo 2: MMP (AppsFlyer)]
   │ (nightly Cloud Run Job, per-tenant)
   ▼
GCS raw/mmp/{org_id}/  ──►  L1 cohort, cohort_retention_point

[Silo 3: Experimentation (Statsig)]
   │ (on-event webhook + nightly fallback pull)
   ▼
GCS raw/statsig/{org_id}/  ──►  L1 experiment_result

[Silo 4: Financial (Manual Tier 1)]
   │ (User input via DemoSeedToolbar or production form)
   ▼
L1 financial_input (AES-256 column encryption)
   │
   └──►  L1 financial_input_history (audit trail)
```

### 4.2 Read/Inference Flow (L1 → ML → UI)

```
User opens Executive Overview
   │
   ▼
Next.js RSC fetches dash:overview:{org_id} from Redis
   │
   ├─ HIT ─────────────────────────────►  Render
   │
   └─ MISS
       │
       ▼
   Server Action queries Supabase (RLS-scoped)
       │
       ▼
   If retention prediction needed:
       │
       ▼
   Call FastAPI POST /predict/retention
       │
       ▼
   FastAPI loads cohort_retention_point from L1
       │
       ▼
   FastAPI runs scipy curve_fit + NumPyro SVI
       │
       ▼
   Returns prediction band (P10/P50/P90)
       │
       ▼
   Cache result in Redis (TTL 24h)
       │
       ▼
   Return to RSC → Render
```

### 4.3 Write Flow (User Input → L1 → Audit)

```
User submits financial_input
   │
   ▼
Next.js Server Action
   │
   ├─►  Encrypt T1 fields (AES-256-GCM)
   ├─►  Insert into financial_input
   ├─►  Insert into financial_input_history
   ├─►  Insert audit_log row
   ├─►  Invalidate Redis: dash:overview:{org_id}
   └─►  Return success
```

---

## 5. Phase별 진화 경로

### Phase 1 — MVP (현재 ~ 12개월)
**상태**: Supabase + Upstash + Cloud Run + GCS

**목표**: 첫 10개 유료 테넌트, manual financial input only

**비용 예상** (월):
- Vercel Pro: $20
- Supabase Pro: $25
- Upstash: $0~10 (free tier 충분)
- GCS: $1~5
- Cloud Run: $5~30 (autoscale 0)
- W&B free tier: $0
- **합계: $50~100/월** — 2인 팀 + 첫 매출까지 충분

### Phase 2 — PMF (12 ~ 24개월)
**전제**: 활성 테넌트 30~80, daily query 1k~10k

**추가 도구 검토**:
- **dbt Core** (오픈소스, 무료) — transformation pipeline 코드화
- **BigQuery** (선택) — 만약 cross-tenant analytics 또는 대규모 benchmark aggregation 필요 시
- **Sentry** — 에러 추적
- **PostHog or Mixpanel** — 자사 product analytics

**Supabase 강화**:
- PITR (Point-in-Time Recovery) 7일
- Read replica (필요 시)
- Custom domain + dedicated compute (Team plan)

**비용 예상**: $300~800/월

### Phase 3 — Scale (24개월+)
**전제**: 활성 테넌트 100+, raw event 1TB+/월

**검토 트리거 발동 가능 시점**:
- BigQuery 정착 → 만약 ML training set이 100M row 넘기 시작하면 → **Databricks 검토 시작**
- Postgres write throughput 한계 → Citus 또는 Aurora 마이그레이션 검토
- ML 모델 복잡도 증가 → Vertex AI 또는 SageMaker 검토

**핵심 원칙**: 트리거가 발동해도 **재검토만**, 자동 도입 X. 매번 cost-benefit 재평가.

---

## 6. Demo·시연을 위한 데이터 기반 장치

이 섹션은 sibling 문서 `Project_Yieldo_Demo_Data_Strategy.md`에서 본격 다루지만, 아키텍처 관점에서 필수 결정사항만 명시.

### 6.1 Demo Tenant 격리 원칙

**3가지 옵션 비교**:

| 옵션 | 격리 강도 | 운영 부담 | 비용 |
|---|---|---|---|
| A. Demo org_slug prefix (`demo_*`) | 약 (RLS만) | 낮음 | 0 |
| B. Demo schema separation | 중 (schema-level) | 중 | 0 |
| C. Separate Supabase project | 강 (물리적) | 높음 | +$25/월 |

**권장**: **B (schema separation)** — RLS만으론 실수 시 cross-tenant leakage 위험, 별도 project는 운영 분기 부담.

```sql
CREATE SCHEMA demo;
-- demo.* 테이블은 production.* 미러
-- API layer에서 X-Yieldo-Mode: demo 헤더로 schema 선택
```

### 6.2 Synthetic Data Generators

이미 구현됨:
- ✅ `financial-input-seed.ts` (PR-D Task 1)
- ✅ `DemoSeedToolbar` UI (PR-D Task 2)

추가 필요 (sibling 문서에서 상세):
- `cohort-retention-seed.ts` — 5대 성질 만족 곡선
- `mmp-cpi-seed.ts` — 채널별 CPI/ROAS
- `experiment-result-seed.ts` — ATE + CI 분포
- `live-ops-event-seed.ts` — 시간축 intervention

모두 deterministic seed 기반, 동일 seed → 동일 데이터셋 → 시연 재현성 보장.

### 6.3 Demo Reset Mechanism

```
DemoSeedToolbar 트리거
   │
   ▼
Server Action: POST /api/demo/reset
   │
   ├─►  TRUNCATE demo.* tables (org_id 한정)
   ├─►  Re-seed from generator
   ├─►  Invalidate all Redis keys with org_id prefix
   └─►  Return new dataset summary
```

---

## 7. 결정 요약 (Decision Log)

| 결정 | 선택 | 근거 |
|---|---|---|
| 데이터 웨어하우스 도입 | ❌ 안 함 | yieldo는 translation layer, raw event TB급 처리 X |
| Primary DB | Supabase Postgres | RLS native, 2인 팀 운영 가능, $25/월 |
| Cache | Upstash Redis | Serverless, per-request 과금, cold-start 가능 |
| Cold storage | GCS | Lifecycle 정책 풍부, Coldline·Archive 가성비 우수 |
| ML compute | FastAPI on Cloud Run | NumPyro/JAX 호환, autoscale, asia-northeast3 co-located |
| Batch | Cloud Run Jobs + Scheduler | Cron + idempotent, Vercel Cron 한계 회피 |
| Demo isolation | Schema-level separation | RLS만은 위험, 별도 project는 과함 |
| Databricks/Snowflake | 도입 안 함 (현재) | 카테고리 오인 + cost overhead |
| BigQuery | Phase 2에서 검토 | Serverless·SQL-only, Databricks의 95% 가치 5% 비용 |

---

## 8. 미해결 / 다음 결정 필요

다음 항목들은 본 문서에서 결정하지 않고 별도 논의 필요:

1. **Customer-managed encryption keys (CMK)** — Phase 2 enterprise 고객 요구 시 도입. AWS KMS vs GCP KMS 선택 보류.
2. **Multi-region deployment** — 첫 글로벌 enterprise 계약 시점에 결정. 현재 asia-northeast3 단일.
3. **Realtime dashboard updates** — Supabase Realtime vs polling. UX 검증 후 결정.
4. **ML model registry** — W&B free tier vs MLflow 자체 호스팅 vs Vertex AI Model Registry. Phase 2 진입 시 재평가.
5. **Vault for credentials** — Supabase Vault (native) vs HashiCorp Vault (자체). MMP API key 관리 시작 시점에 결정.

---

## 9. 변경 이력

| 날짜 | 버전 | 변경 | 작성자 |
|---|---|---|---|
| 2026-05-02 | 1.0 | 최초 작성, Databricks 미도입 결정, 3-layer storage model 확정 | Mike |
