# Project Compass — 통계/추론 엔진 구현 블루프린트

**Version**: 1.0
**Date**: 2026-04-01
**Classification**: Internal Engineering Blueprint
**용도**: 이 문서만 보고 데이터 → 투자 결정까지의 전체 파이프라인을 구현할 수 있어야 함

> **핵심 목적**: 이 엔진은 **인터벤션과 실험 결과를 투자 결정으로 번역**하기 위해 존재한다. A/B 테스트 ATE가 ΔLTV로, 라이브 ops 액션이 Payback Shift로, UA 변경이 Capital Efficiency 변화로 번역되는 전체 파이프라인이 이 엔진의 존재 이유다. "데이터를 수집한다"가 아니라 "인터벤션이 투자 가치를 창출했는가를 측정한다"가 이 시스템의 목적이다.

---

## 1. 전체 파이프라인: 데이터에서 투자 결정까지

```
Raw Data Sources                    Processing                      Decision Output
━━━━━━━━━━━━━━━                   ━━━━━━━━━━━                     ━━━━━━━━━━━━━━━
                                        │
[Apple RSS Rankings] ─────┐             │
[iTunes Search API] ──────┤             ▼
[GP Scraper] ─────────────┤     ┌──────────────┐
                          ├────→│ 1. INGEST     │
[GameAnalytics PDF] ──────┤     │    정규화     │
[AppsFlyer Index] ────────┘     │    저장       │
                                └──────┬───────┘
                                       │
[고객 MMP: AppsFlyer] ───┐             ▼
[고객 실험: Statsig] ────┤     ┌──────────────┐
[고객 코호트 데이터] ────┤────→│ 2. ENRICH     │
[고객 재무 데이터] ──────┘     │    결합       │
                                │    피처 생성  │
                                └──────┬───────┘
                                       │
                                       ▼
                                ┌──────────────┐
                                │ 3. PREDICT    │
                                │  리텐션 예측  │
                                │  (Layer 1+2)  │
                                └──────┬───────┘
                                       │
                                       ▼
                                ┌──────────────┐
                                │ 4. TRANSLATE  │
                                │  LTV/Payback  │
                                │  ATE→ΔLTV    │
                                │  ROI 산출    │
                                └──────┬───────┘
                                       │
                                       ▼
                                ┌──────────────┐
                                │ 5. DECIDE     │
                                │  Green/Yellow │
                                │  /Red 판정   │
                                └──────┬───────┘
                                       │
                                       ▼
                                ┌──────────────┐      ┌─────────────────┐
                                │ 6. NARRATE    │─────→│ Dashboard       │
                                │  LLM 번역    │      │ API Response    │
                                │  (Phase 3~)  │      │ Alert/Notify    │
                                └──────────────┘      └─────────────────┘
```

---

## 2. Stage 0: ONBOARD — 사용자 온보딩 데이터 플로우

온보딩 시 각 단계에서 어떤 데이터가 생성/저장되는지:

```python
async def onboard_tenant(signup_data, mmp_choice, app_id, platform):
    """
    온보딩 7단계에서 생성되는 데이터.
    """
    # Step 1: 테넌트 생성
    tenant = create_tenant(signup_data.team_name, signup_data.email)

    # Step 2: MMP 연동
    if mmp_choice.provider != 'none':
        mmp_config = save_mmp_config(
            tenant_id=tenant.id,
            provider=mmp_choice.provider,  # 'appsflyer' | 'adjust' | 'singular'
            api_token=encrypt(mmp_choice.api_token),  # AES-256 암호화
        )
        # 연동 테스트: 실제 API 호출로 토큰 유효성 확인
        test_result = await test_mmp_connection(mmp_config)
        if not test_result.success:
            raise MMPConnectionError(test_result.error)

    # Step 3: 게임 등록
    # iTunes Search API로 메타데이터 자동 수집
    app_metadata = await fetch_app_metadata(app_id, platform)
    game = register_game(
        tenant_id=tenant.id,
        app_id=app_id,
        platform=platform,
        app_name=app_metadata.name,
        genre=app_metadata.primary_genre,
        genre_id=app_metadata.genre_id,
    )
    # 장르-티어 자동 분류
    classification = classify_game(app_id, 'us')
    update_game_classification(game.id, classification)

    # Step 4: MMP 데이터 초기 동기화
    if mmp_config:
        await initial_mmp_sync(tenant.id, game.id, mmp_config)
        # → mmp_cohort_data 테이블에 코호트 데이터 적재

    # Step 5: Prior 즉시 생성 (Value-first)
    prior = get_prior(classification['genre'], classification['tier'])
    initial_prediction = prior_only_prediction(
        GameContext(game=game, classification=classification, prior=prior)
    )
    save_prediction(tenant.id, game.id, initial_prediction)

    # Step 5-6: 실험 플랫폼 + 재무 (선택, None 가능)
    # → 사용자가 입력하면 저장, 스킵하면 None

    return OnboardResult(
        tenant=tenant,
        game=game,
        mmp_connected=mmp_config is not None,
        data_days=count_cohort_days(tenant.id, game.id),
        initial_prediction=initial_prediction,
        activated_features=get_activated_features(tenant.id),
    )
```

```sql
-- 온보딩에서 생성되는 테이블

-- MMP 연동 설정 (테넌트별)
CREATE TABLE mmp_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  provider TEXT NOT NULL,             -- 'appsflyer', 'adjust', 'singular'
  api_token_encrypted TEXT NOT NULL,  -- AES-256 암호화된 토큰
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT,              -- 'success', 'failed', 'pending'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, provider)
);

-- 실험 플랫폼 연동 설정 (테넌트별)
CREATE TABLE experiment_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  provider TEXT NOT NULL,             -- 'statsig', 'firebase', 'launchdarkly', 'manual'
  api_key_encrypted TEXT,             -- NULL이면 manual/약식 모드
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, provider)
);

-- 온보딩 진행 상태 추적
CREATE TABLE onboarding_status (
  tenant_id UUID PRIMARY KEY REFERENCES tenants(id),
  step_signup BOOLEAN DEFAULT true,
  step_mmp BOOLEAN DEFAULT false,
  step_game BOOLEAN DEFAULT false,
  step_data_confirmed BOOLEAN DEFAULT false,
  step_experiment BOOLEAN DEFAULT false,   -- NULL이면 스킵
  step_financial BOOLEAN DEFAULT false,    -- NULL이면 스킵
  step_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completion_percentage INTEGER DEFAULT 0, -- 0-100
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Stage 1: INGEST — 데이터 수집 및 정규화

### 2.1 수집 파이프라인 (Cloud Run Jobs)

```
Cloud Scheduler (cron)
    │
    ├─ 6시간마다: ranking_collector
    │   └─ Apple RSS → app_store_rankings 테이블
    │
    ├─ 24시간마다: metadata_collector
    │   ├─ iTunes Search API → app_metadata 테이블 (iOS)
    │   └─ google-play-scraper → app_metadata 테이블 (Android)
    │
    ├─ 24시간마다: mmp_sync (고객별)
    │   └─ AppsFlyer Cohort API → mmp_cohort_data 테이블
    │
    └─ 24시간마다: experiment_sync (고객별)
        └─ Statsig Console API → experiment_results 테이블
```

### 2.2 핵심 테이블 관계도

```sql
-- 모든 테이블은 tenant_id + RLS로 격리

-- 마켓 데이터 (공유, 모든 테넌트 접근 가능)
app_store_rankings    -- 6시간마다: 앱 랭킹 시계열
app_metadata          -- 일 1회: 앱 상세 정보 + 평점 수
genre_benchmarks      -- 수동/분기: 벤치마크 리포트 데이터 (Prior 원천)

-- 고객 데이터 (테넌트별 격리)
tenant_games          -- 고객이 등록한 자기 게임 목록
mmp_cohort_data       -- MMP에서 동기화된 UA/코호트 데이터
experiment_results    -- 실험 플랫폼에서 동기화된 ATE 데이터
manual_experiments    -- 약식 실험 (수동 등록)
cohort_retention      -- 고객 자체 리텐션 데이터 (직접 업로드 또는 MMP에서)
financial_inputs      -- 재무 변수 (Tier 1: 5개 필수, Tier 2: 확장, Tier 3: 자동 연동)

-- 재무 데이터 (테넌트별 격리, 영업비밀 수준 보호)
-- Tier 1 (MVP 필수 5개): monthly_revenue, monthly_ua_spend, cash_balance, monthly_burn, target_payback_days
-- Tier 2 (선택 확장): revenue_iap/ad 분해, dev_cost, ops_cost, gross_margin, headcount
-- Tier 3 (Phase 3+): QuickBooks/Xero 자동 연동 시 full P&L
financial_inputs (
  id BIGSERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  game_id UUID REFERENCES tenant_games(id),  -- NULL이면 전사 레벨
  input_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Tier 1: MVP 필수 (5개, 3분 입력)
  monthly_revenue DECIMAL(14,2),          -- 월 매출 (또는 범위의 중앙값)
  monthly_revenue_range JSONB,            -- {"min": 100000, "max": 200000} 범위 허용
  monthly_ua_spend DECIMAL(14,2),         -- 월 UA 비용
  cash_balance DECIMAL(14,2),             -- 현금 잔액
  monthly_burn DECIMAL(14,2),             -- 월간 총 지출 (burn rate)
  target_payback_days INTEGER,            -- 목표 페이백 기간

  -- Tier 2: 선택적 확장
  revenue_iap DECIMAL(14,2),              -- IAP 매출
  revenue_ads DECIMAL(14,2),              -- 광고 매출
  dev_cost DECIMAL(14,2),                 -- 게임별 개발비
  ops_cost DECIMAL(14,2),                 -- 게임별 운영비
  gross_margin DECIMAL(5,4),              -- 매출총이익률
  headcount INTEGER,                      -- 인원 수

  -- 메타
  input_method TEXT DEFAULT 'manual',     -- 'manual', 'csv', 'quickbooks', 'xero'
  input_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, game_id, input_date)
);

ALTER TABLE financial_inputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON financial_inputs
  USING (tenant_id = (SELECT tenant_id FROM user_profiles WHERE user_id = auth.uid()));

-- 감사 추적: 재무 데이터는 영업비밀 → 누가 언제 조회했는지 기록
CREATE TABLE financial_access_log (
  id BIGSERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL,
  accessed_by UUID NOT NULL,
  action TEXT NOT NULL,                   -- 'view', 'export', 'edit', 'delete'
  target_table TEXT NOT NULL,             -- 'financial_inputs'
  target_id BIGINT,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET
);

-- Compass 산출물 (테넌트별 격리)
retention_predictions -- 리텐션 예측 결과 (P10/P50/P90)
investment_metrics    -- LTV, Payback, BEP, IRR, ROAS 산출물
investment_signals    -- Green/Yellow/Red 판정 + 근거
experiment_translations -- ATE → ΔLTV → ROI 번역 결과
```

---

## 3. Stage 2: ENRICH — 데이터 결합 및 피처 생성

### 3.1 장르-티어 분류

고객이 게임을 등록하면, 앱스토어 데이터에서 장르-티어를 자동 분류합니다.

```python
# Python (FastAPI 서비스)

def classify_game(app_id: str, country: str) -> dict:
    """
    앱스토어 데이터에서 장르-티어를 분류.
    이 분류가 베이지안 Prior 선택의 키가 됨.
    """
    # 1. 앱 메타데이터에서 장르 확인
    metadata = db.query(app_metadata).filter(app_id=app_id).first()
    genre = metadata.primary_genre  # e.g., "Strategy"

    # 2. 최근 30일 Top Grossing 랭킹에서 티어 분류
    recent_rankings = db.query(app_store_rankings).filter(
        app_id=app_id,
        country=country,
        chart_type='top-grossing',
        crawl_timestamp >= now() - timedelta(days=30)
    ).all()

    avg_rank = mean([r.rank for r in recent_rankings]) if recent_rankings else None

    # 3. 티어 분류
    if avg_rank and avg_rank <= 50:
        tier = "top_50"
    elif avg_rank and avg_rank <= 200:
        tier = "top_200"
    else:
        tier = "long_tail"  # 랭킹 밖 또는 데이터 없음

    return {
        "genre": genre,       # "Strategy", "RPG", "Puzzle", ...
        "tier": tier,          # "top_50", "top_200", "long_tail"
        "genre_tier_key": f"{genre}_{tier}",  # Prior 조회 키
        "avg_rank": avg_rank
    }
```

### 3.2 Prior 조회

장르-티어 키로 `genre_benchmarks` 테이블에서 Prior를 가져옵니다.

```python
def get_prior(genre: str, tier: str) -> dict:
    """
    genre_benchmarks 테이블에서 해당 장르-티어의 리텐션 Prior를 조회.
    여러 소스(GameAnalytics, AppsFlyer, Unity)의 데이터를 가중 평균.
    """
    benchmarks = db.query(genre_benchmarks).filter(
        genre=genre,
        # tier 필터: 벤치마크 리포트가 tier를 구분하지 않으면 장르만으로 조회
    ).all()

    # 여러 소스의 벤치마크를 가중 평균
    prior = {}
    for metric in ['retention_d1', 'retention_d7', 'retention_d14', 'retention_d28']:
        sources = [b for b in benchmarks if b.metric == metric]
        if sources:
            prior[metric] = {
                'p10': mean([s.p10 for s in sources]),
                'p50': mean([s.p50 for s in sources]),
                'p90': mean([s.p90 for s in sources]),
                'source_count': len(sources),
                'sources': [s.source for s in sources]
            }

    return prior
```

### 3.3 고객 데이터와 결합

```python
def build_game_context(tenant_id: str, game_id: str) -> GameContext:
    """
    하나의 게임에 대해, 모든 데이터 소스를 결합하여
    예측/판정에 필요한 전체 컨텍스트를 구성.
    """
    game = db.query(tenant_games).get(game_id)
    classification = classify_game(game.app_id, game.primary_country)
    prior = get_prior(classification['genre'], classification['tier'])

    # MMP 데이터 (있으면)
    mmp_data = db.query(mmp_cohort_data).filter(
        tenant_id=tenant_id,
        app_id=game.app_id
    ).order_by(cohort_date.desc()).limit(90).all()

    # 고객 자체 코호트 리텐션 (있으면)
    cohort_data = db.query(cohort_retention).filter(
        tenant_id=tenant_id,
        game_id=game_id
    ).order_by(cohort_date.desc()).all()

    # 실험 데이터 (있으면)
    experiments = db.query(experiment_results).filter(
        tenant_id=tenant_id,
        game_id=game_id
    ).all()

    # 재무 데이터 (Tier 1: 5개 필수, Tier 2: 확장, Tier 3: 자동)
    financials = db.query(financial_inputs).filter(
        tenant_id=tenant_id,
        game_id=game_id
    ).order_by(input_date.desc()).first()
    # financials가 None이어도 파이프라인은 작동 (시그널에 "재무 데이터 없음" 표시)

    return GameContext(
        game=game,
        classification=classification,
        prior=prior,
        mmp_data=mmp_data,
        cohort_data=cohort_data,
        experiments=experiments,
        financials=financials,
        data_days=len(cohort_data),  # 관측 일수 → Layer 1 vs 2 전환 기준
    )
```

---

## 4. Stage 3: PREDICT — 리텐션 예측

### 4.1 Layer 선택 로직

```python
def predict_retention(ctx: GameContext) -> RetentionPrediction:
    """
    데이터 충분도에 따라 Layer 1 또는 Layer 2를 선택.
    """
    if ctx.data_days < 7:
        # 데이터 부족: Prior만으로 밴드 제공
        return prior_only_prediction(ctx)

    elif ctx.data_days < 14:
        # Layer 1: 파라메트릭 모델 (scipy curve_fit + Prior)
        return layer1_parametric(ctx)

    elif ctx.data_days >= 14 and sufficient_volume(ctx):
        # Layer 2: LSTM 모델 (PyTorch + MC Dropout)
        return layer2_lstm(ctx)

    else:
        # 데이터 있지만 볼륨 부족: Layer 1 유지
        return layer1_parametric(ctx)
```

### 4.2 Prior-Only 예측 (D0-D6, 데이터 부족)

```python
def prior_only_prediction(ctx: GameContext) -> RetentionPrediction:
    """
    관측 데이터 없음 → 장르 벤치마크 Prior 밴드를 그대로 제공.
    신뢰도 낮음을 명시.
    """
    prior = ctx.prior
    days = list(range(1, 181))  # D1-D180

    # Prior P10/P50/P90에서 파워로 커브 3개를 피팅
    curve_p10 = fit_power_law_from_points(prior, percentile='p10')
    curve_p50 = fit_power_law_from_points(prior, percentile='p50')
    curve_p90 = fit_power_law_from_points(prior, percentile='p90')

    return RetentionPrediction(
        days=days,
        p10=[curve_p10(d) for d in days],
        p50=[curve_p50(d) for d in days],
        p90=[curve_p90(d) for d in days],
        confidence=0.3,  # 낮은 신뢰도
        layer="prior_only",
        message="장르 벤치마크 기반 예측입니다. 실제 코호트 데이터가 쌓이면 정확도가 향상됩니다."
    )


def fit_power_law_from_points(prior: dict, percentile: str):
    """
    D1, D7, D14, D28의 벤치마크 값으로 파워로 커브를 피팅.
    R(t) = a * t^b + c
    """
    from scipy.optimize import curve_fit
    import numpy as np

    known_days = []
    known_values = []
    for metric, day in [('retention_d1', 1), ('retention_d7', 7),
                        ('retention_d14', 14), ('retention_d28', 28)]:
        if metric in prior:
            known_days.append(day)
            known_values.append(prior[metric][percentile])

    def power_law(t, a, b, c):
        return a * np.power(t, b) + c

    popt, _ = curve_fit(
        power_law,
        np.array(known_days, dtype=float),
        np.array(known_values, dtype=float),
        p0=[0.5, -0.5, 0.02],
        bounds=([0, -1, 0], [1, 0, 0.3]),  # 5대 성질 제약: b ∈ (-1, 0), c ≥ 0
        maxfev=5000
    )

    return lambda t: power_law(t, *popt)
```

### 4.3 Layer 1: 파라메트릭 모델 (D7-D13)

```python
def layer1_parametric(ctx: GameContext) -> RetentionPrediction:
    """
    관측된 코호트 데이터 + 장르 Prior를 결합하여 베이지안 커브 피팅.
    핵심: Prior가 형태를 제약하고, 관측 데이터가 파라미터를 업데이트.
    """
    import numpyro
    import numpyro.distributions as dist
    from numpyro.infer import MCMC, NUTS
    import jax.numpy as jnp

    # 관측 데이터
    observed_days = ctx.cohort_data.days      # e.g., [1, 2, 3, 4, 5, 6, 7]
    observed_retention = ctx.cohort_data.values  # e.g., [0.35, 0.28, 0.24, 0.21, 0.19, 0.18, 0.17]

    # Prior에서 파라미터 범위 추정 (5대 성질 + 장르 벤치마크)
    prior_d1 = ctx.prior['retention_d1']
    prior_d28 = ctx.prior['retention_d28']

    def model(days, obs=None):
        # Prior: 장르 벤치마크에서 파생된 파라미터 분포
        a = numpyro.sample('a', dist.Beta(
            *beta_params_from_benchmark(prior_d1['p50'], prior_d1['p10'], prior_d1['p90'])
        ))
        b = numpyro.sample('b', dist.Uniform(-0.8, -0.1))  # 5대 성질 P4: 감속 감소
        c = numpyro.sample('c', dist.Beta(2, 50))  # floor: 작은 양수 (P5: 점근 수렴)

        # 파워로 모델
        predicted = a * jnp.power(days, b) + c

        # Likelihood: 관측 데이터
        sigma = numpyro.sample('sigma', dist.HalfNormal(0.05))
        numpyro.sample('obs', dist.Normal(predicted, sigma), obs=obs)

    # MCMC 실행
    kernel = NUTS(model)
    mcmc = MCMC(kernel, num_warmup=500, num_samples=1000)
    mcmc.run(jax.random.PRNGKey(0),
             days=jnp.array(observed_days, dtype=jnp.float32),
             obs=jnp.array(observed_retention, dtype=jnp.float32))

    samples = mcmc.get_samples()

    # D1-D180 예측 생성
    future_days = jnp.arange(1, 181, dtype=jnp.float32)
    predictions = samples['a'][:, None] * jnp.power(future_days, samples['b'][:, None]) + samples['c'][:, None]

    return RetentionPrediction(
        days=list(range(1, 181)),
        p10=jnp.percentile(predictions, 10, axis=0).tolist(),
        p50=jnp.percentile(predictions, 50, axis=0).tolist(),
        p90=jnp.percentile(predictions, 90, axis=0).tolist(),
        confidence=0.5 + (ctx.data_days / 28) * 0.3,  # D7=0.62, D14=0.75
        layer="layer1_parametric",
        params={
            'a_median': float(jnp.median(samples['a'])),
            'b_median': float(jnp.median(samples['b'])),
            'c_median': float(jnp.median(samples['c'])),
        },
        message=f"D{ctx.data_days} 데이터 + {ctx.classification['genre']} 장르 벤치마크 기반 예측"
    )


def beta_params_from_benchmark(p50, p10, p90):
    """벤치마크 P10/P50/P90에서 Beta 분포 alpha/beta 파라미터 추정."""
    mean = p50
    spread = (p90 - p10) / 2.56
    variance = max(spread ** 2, 1e-6)
    alpha = max(mean * (mean * (1 - mean) / variance - 1), 0.5)
    beta = max((1 - mean) * (mean * (1 - mean) / variance - 1), 0.5)
    return alpha, beta
```

### 4.4 Layer 2: LSTM 모델 (D14+)

```python
def layer2_lstm(ctx: GameContext) -> RetentionPrediction:
    """
    D14+ 데이터가 충분할 때 LSTM으로 정밀 예측.
    MC Dropout으로 불확실성 추정.
    """
    import torch

    # 입력 시퀀스 구성
    input_seq = prepare_lstm_input(
        retention_seq=ctx.cohort_data.values,    # D1-D14+ 실측
        genre_embedding=genre_to_embedding(ctx.classification['genre']),
        ua_channel_mix=ctx.mmp_data.channel_proportions if ctx.mmp_data else None,
        market_signals=get_market_signals(ctx.game.app_id)
    )

    # 모델 로드 (사전 학습된 모델)
    model = load_lstm_model(ctx.classification['genre'])

    # MC Dropout: 50회 forward pass
    model.train()  # dropout 활성 유지
    predictions = []
    for _ in range(50):
        with torch.no_grad():
            pred = model(input_seq)
            predictions.append(pred.numpy())

    predictions = np.stack(predictions)  # shape: (50, n_future_days)

    # [C3 FIX] 5대 성질 제약: LSTM 출력에 monotonicity post-processing
    # P1(단조 감소) 보장: R(d+1) <= R(d)
    # LSTM은 자유형 시퀀스 예측이므로 일부 구간에서 상승할 수 있음
    # np.minimum.accumulate로 단조 감소를 강제
    predictions = np.minimum.accumulate(predictions, axis=1)

    # 추가 제약: R(t) >= 0 (음수 리텐션 방지)
    predictions = np.maximum(predictions, 0.0)

    return RetentionPrediction(
        days=list(range(1, 366)),
        p10=np.percentile(predictions, 10, axis=0).tolist(),
        p50=np.percentile(predictions, 50, axis=0).tolist(),
        p90=np.percentile(predictions, 90, axis=0).tolist(),
        confidence=0.7 + min(ctx.data_days / 60, 0.25),  # D14=0.93, D30=0.95
        layer="layer2_lstm",
        message=f"LSTM 모델 (D{ctx.data_days} 데이터, {ctx.classification['genre']} 장르)"
    )
```

### 4.5 Layer 전환: 블렌딩

```python
def blended_prediction(ctx: GameContext) -> RetentionPrediction:
    """
    Layer 1 → Layer 2 전환은 급격하지 않고 점진적.
    D14-D21 구간에서 두 레이어의 가중 평균.
    """
    if ctx.data_days < 14:
        return layer1_parametric(ctx)
    elif ctx.data_days > 21:
        return layer2_lstm(ctx)
    else:
        # 블렌딩 구간: D14-D21
        l1 = layer1_parametric(ctx)
        l2 = layer2_lstm(ctx)

        # 가중치: D14에서 L1=100%, D21에서 L2=100%
        w2 = (ctx.data_days - 14) / 7  # 0.0 → 1.0
        w1 = 1 - w2

        blended = RetentionPrediction(
            days=l1.days,
            p10=[w1 * a + w2 * b for a, b in zip(l1.p10, l2.p10)],
            p50=[w1 * a + w2 * b for a, b in zip(l1.p50, l2.p50)],
            p90=[w1 * a + w2 * b for a, b in zip(l1.p90, l2.p90)],
            confidence=w1 * l1.confidence + w2 * l2.confidence,
            layer=f"blended (L1:{w1:.0%}, L2:{w2:.0%})",
        )
        return blended
```

---

## 5. Stage 4: TRANSLATE — 투자 메트릭 산출

### 5.0 ARPDAU 추정 (MMP 데이터 부재 시)

```python
# [C2 FIX] MMP 데이터가 없을 때 ARPDAU를 추정하는 로직

# 장르별 ARPDAU 벤치마크 (GameAnalytics/Unity 공개 리포트 기반)
# ※ 실제 리포트에서 추출한 정확한 수치로 업데이트 필요
GENRE_ARPDAU_BENCHMARKS = {
    #              P10     P50     P90
    'Action':     (0.02,   0.06,   0.15),
    'Adventure':  (0.01,   0.04,   0.10),
    'Arcade':     (0.02,   0.05,   0.12),
    'Casino':     (0.10,   0.30,   0.80),
    'Casual':     (0.01,   0.04,   0.10),
    'Puzzle':     (0.02,   0.06,   0.15),
    'RPG':        (0.05,   0.15,   0.40),
    'Simulation': (0.03,   0.08,   0.20),
    'Sports':     (0.02,   0.06,   0.15),
    'Strategy':   (0.05,   0.12,   0.35),
    'Word':       (0.02,   0.05,   0.12),
    '_default':   (0.02,   0.06,   0.15),
}

def estimate_arpdau(ctx: GameContext) -> float | None:
    """
    MMP 데이터가 없을 때 장르 벤치마크 기반으로 ARPDAU를 추정.

    우선순위:
    1. MMP 데이터에서 직접 계산 (가장 정확)
    2. 고객이 수동 입력한 재무 데이터에서 역산
    3. 장르 벤치마크 P50 사용 (최후 수단)
    4. 모두 불가 → None 반환 (LTV 계산 비활성화)
    """
    # 1순위: MMP 데이터
    if ctx.mmp_data and ctx.mmp_data.avg_arpdau:
        return ctx.mmp_data.avg_arpdau

    # 2순위: 재무 데이터에서 역산
    # ARPDAU = Monthly Revenue / (DAU * 30)
    # DAU ≈ Monthly Installs * D30 Retention (P50)
    if (ctx.financials and ctx.financials.monthly_revenue
        and ctx.mmp_data and ctx.mmp_data.monthly_installs):
        d30_ret = ctx.prior.get('retention_d28', {}).get('p50', 0.05)
        estimated_dau = ctx.mmp_data.monthly_installs * d30_ret
        if estimated_dau > 0:
            return ctx.financials.monthly_revenue / (estimated_dau * 30)

    # 3순위: 장르 벤치마크 P50
    genre = ctx.classification.get('genre', '_default')
    benchmark = GENRE_ARPDAU_BENCHMARKS.get(genre,
                GENRE_ARPDAU_BENCHMARKS['_default'])
    return benchmark[1]  # P50

    # Note: 벤치마크 기반 ARPDAU 사용 시 LTV 계산의 confidence가 낮아짐
    # 이는 generate_investment_signal()에서 전체 confidence에 반영됨
```

### 5.1 LTV 계산

```python
def calculate_ltv(
    retention: RetentionPrediction,
    arpdau: float,
    arpdau_trend: float = 0.0  # 일별 ARPDAU 변화율
) -> LTVResult:
    """
    LTV = Σ(d=1→T) Retention(d) × ARPDAU(d)

    T는 점근적 도달점(asymptotic arrival)에 의해 결정.
    """
    import numpy as np

    # ARPDAU 시계열 (트렌드 반영)
    days = np.array(retention.days)
    arpdau_series = arpdau * (1 + arpdau_trend) ** days

    # LTV for each percentile
    ltv_p10 = np.cumsum(np.array(retention.p10) * arpdau_series)
    ltv_p50 = np.cumsum(np.array(retention.p50) * arpdau_series)
    ltv_p90 = np.cumsum(np.array(retention.p90) * arpdau_series)

    # 점근적 도달점 탐지: retention 일간 변화가 0.1%p 미만인 첫 시점
    daily_change = np.diff(retention.p50)
    asymptotic_day = None
    for i, change in enumerate(daily_change):
        if abs(change) < 0.001:  # 0.1%p 미만
            asymptotic_day = i + 2  # 인덱스 보정
            break

    return LTVResult(
        days=retention.days,
        ltv_cumulative_p10=ltv_p10.tolist(),
        ltv_cumulative_p50=ltv_p50.tolist(),
        ltv_cumulative_p90=ltv_p90.tolist(),
        ltv_d30={'p10': ltv_p10[29], 'p50': ltv_p50[29], 'p90': ltv_p90[29]},
        ltv_d90={'p10': ltv_p10[89], 'p50': ltv_p50[89], 'p90': ltv_p90[89]},
        ltv_d180={'p10': ltv_p10[179], 'p50': ltv_p50[179], 'p90': ltv_p90[179]},
        asymptotic_day=asymptotic_day,
        arpdau_used=arpdau,
    )
```

### 5.2 Payback & BEP 확률

```python
def calculate_payback(ltv: LTVResult, cpi: float) -> PaybackResult:
    """
    Payback Period = LTV가 CPI를 초과하는 첫 번째 날
    BEP 확률 = P(LTV(T) ≥ CPI)
    """
    import numpy as np

    # P50 기준 페이백 일
    payback_p50 = None
    for i, ltv_val in enumerate(ltv.ltv_cumulative_p50):
        if ltv_val >= cpi:
            payback_p50 = i + 1
            break

    # P10 기준 페이백 (비관적)
    payback_p10 = None
    for i, ltv_val in enumerate(ltv.ltv_cumulative_p10):
        if ltv_val >= cpi:
            payback_p10 = i + 1
            break

    # BEP 확률 (D180 기준)
    # P10 < CPI < P90 일 때, CPI가 분포 내 어디에 있는지로 추정
    ltv_180_p10 = ltv.ltv_d180['p10']
    ltv_180_p50 = ltv.ltv_d180['p50']
    ltv_180_p90 = ltv.ltv_d180['p90']

    if cpi <= ltv_180_p10:
        bep_probability = 0.95  # CPI가 P10보다 낮으면 거의 확실
    elif cpi >= ltv_180_p90:
        bep_probability = 0.05  # CPI가 P90보다 높으면 거의 불가능
    else:
        # 선형 보간 (정밀하려면 Monte Carlo 사용)
        if cpi <= ltv_180_p50:
            bep_probability = 0.5 + 0.4 * (ltv_180_p50 - cpi) / (ltv_180_p50 - ltv_180_p10)
        else:
            bep_probability = 0.5 - 0.4 * (cpi - ltv_180_p50) / (ltv_180_p90 - ltv_180_p50)

    return PaybackResult(
        payback_day_p10=payback_p10,
        payback_day_p50=payback_p50,
        bep_probability_d180=round(bep_probability, 2),
        cpi=cpi,
        roas_d30=ltv.ltv_d30['p50'] / cpi if cpi > 0 else None,
        roas_d90=ltv.ltv_d90['p50'] / cpi if cpi > 0 else None,
        roas_d180=ltv.ltv_d180['p50'] / cpi if cpi > 0 else None,
    )
```

### 5.3 A/B 실험 → 투자 가치 번역

#### 번역 체인 예시 (Experiment-Driven ΔLTV Case)

```
[입력] Statsig 실험 결과:
  실험명: "Daily Login Reward Redesign"
  ATE (D7 리텐션): +3.7pp  (Control: 18.2% → Treatment: 21.9%)
  95% CI: [+1.2pp, +6.1pp]
  p-value: 0.012

[TRANSLATE 단계 처리]:
  1. ATE → ΔRetention Curve: +3.7pp D7 lift → 전체 커브 비례 이동
  2. ΔRetention → ΔLTV(D180):
       P10: +$0.42/user  P50: +$0.89/user  P90: +$1.61/user
  3. ΔLTV → ΔAnnual Revenue (연간 설치 50K 가정):
       P10: +$21K  P50: +$44K  P90: +$80K
  4. Experiment ROI (실험 비용 $5K 가정):
       P50 ROI: +780%  |  P(ROI > 0): 87%

[DECIDE 단계 출력]:
  추천: "전체 배포 권장"
  페이백 변화: D95 → D81 (단축 14일)
  투자 시그널 변화: YELLOW → GREEN (BEP 확률 +12pp)
```

이 체인이 Compass의 핵심 가치다 — A/B 플랫폼이 "Treatment 승리"를 보고하는 시점에서, Compass는 "이 승리가 $44K 연간 추가 수익과 14일 빠른 페이백을 의미한다"고 번역한다.

```python
def translate_experiment_to_investment(
    ate: float,                  # ATE (e.g., +0.037 = +3.7pp D7 retention)
    ate_ci: tuple,               # (lower, upper) confidence interval
    baseline_retention: RetentionPrediction,
    arpdau: float,
    projected_annual_installs: int,
    experiment_cost: float,
    source: str = 'statsig'      # 'statsig', 'manual', 'pre_post', 'cohort'
) -> ExperimentTranslation:
    """
    ATE → ΔRetention → ΔLTV → ΔRevenue → Experiment ROI
    전체 파이프라인을 불확실성과 함께 산출.
    """
    import numpy as np

    # 1. ATE 분포 생성 (정규 근사)
    ate_mean = ate
    ate_std = (ate_ci[1] - ate_ci[0]) / (2 * 1.96)  # 95% CI → std
    ate_samples = np.random.normal(ate_mean, ate_std, 10000)

    # 2. ATE → ΔRetention Curve
    # 단순화: D7 ATE가 전체 커브를 비례적으로 이동시킨다고 가정
    # (정교화: 5대 성질에 따라 초기 효과가 감쇠하는 모델)
    baseline_d7 = baseline_retention.p50[6]  # D7 P50
    lift_ratio_samples = ate_samples / baseline_d7  # 상대적 리프트

    # 3. ΔRetention → ΔLTV
    baseline_ltv_180 = sum(baseline_retention.p50[:180]) * arpdau
    delta_ltv_samples = lift_ratio_samples * baseline_ltv_180 * 0.7  # 감쇠 계수 0.7

    # 4. ΔLTV → ΔAnnual Revenue
    delta_revenue_samples = delta_ltv_samples * projected_annual_installs

    # 5. Experiment ROI
    roi_samples = (delta_revenue_samples - experiment_cost) / experiment_cost

    # 6. 결정 신뢰도 (소스별 페널티 적용)
    confidence_penalty = {
        'statsig': 0.0,      # A/B 플랫폼: 최고 신뢰
        'manual': 0.0,       # 수동 등록이지만 A/B 결과: 동일
        'pre_post': -0.15,   # Pre/Post 분석: 대조군 없음
        'cohort': -0.30      # 코호트 비교: 가장 낮은 신뢰
    }

    base_confidence = float((roi_samples > 0).mean())
    adjusted_confidence = max(0, base_confidence + confidence_penalty.get(source, 0))

    # 7. 롤아웃 추천
    if adjusted_confidence >= 0.9:
        recommendation = 'ship'
        recommended_rollout = 100
    elif adjusted_confidence >= 0.7:
        recommendation = 'gradual_rollout'
        recommended_rollout = 25
    elif adjusted_confidence >= 0.5:
        recommendation = 'continue_testing'
        recommended_rollout = None  # 현재 유지
    else:
        recommendation = 'kill'
        recommended_rollout = 0

    return ExperimentTranslation(
        ate=ate,
        ate_ci=ate_ci,
        delta_ltv={
            'p10': float(np.percentile(delta_ltv_samples, 10)),
            'p50': float(np.percentile(delta_ltv_samples, 50)),
            'p90': float(np.percentile(delta_ltv_samples, 90)),
        },
        delta_annual_revenue={
            'p10': float(np.percentile(delta_revenue_samples, 10)),
            'p50': float(np.percentile(delta_revenue_samples, 50)),
            'p90': float(np.percentile(delta_revenue_samples, 90)),
        },
        experiment_roi={
            'p10': float(np.percentile(roi_samples, 10)),
            'p50': float(np.percentile(roi_samples, 50)),
            'p90': float(np.percentile(roi_samples, 90)),
        },
        prob_positive_roi=float((roi_samples > 0).mean()),
        decision_confidence=round(adjusted_confidence, 2),
        recommendation=recommendation,
        recommended_rollout=recommended_rollout,
        source=source,
    )
```

### 5.3 재무 메트릭 산출 (Financial Data → Investment Metrics)

재무 데이터가 입력되면 추가 메트릭이 활성화됩니다. **재무 데이터 없이도 파이프라인은 작동**하지만, 아래 메트릭들은 비활성 상태로 "재무 데이터 필요" 표시됩니다.

```python
def calculate_financial_metrics(
    financials: FinancialInputs | None,
    ltv: LTVResult,
    payback: PaybackResult | None,
    mmp_data: MMPCohortData | None,
) -> FinancialMetrics:
    """
    재무 데이터 Tier에 따라 활성화되는 메트릭이 다름.
    Tier 1 (5개 필수) → Burn Tolerance, Capital Efficiency, Revenue/Spend
    Tier 2 (확장)     → Gross Margin 기반 조정, 게임별 P&L
    Tier 3 (자동)     → 전사 P&L 연동, 부서별 비용 배분
    """
    if financials is None:
        return FinancialMetrics(
            available=False,
            message="재무 데이터를 입력하면 Burn Tolerance, Capital Efficiency 등이 활성화됩니다."
        )

    # ──── Tier 1 계산 (5개 필수 입력으로 산출 가능) ────

    # 1. Burn Tolerance (런웨이)
    #    "현재 burn rate로 몇 개월 버틸 수 있는가?"
    if financials.monthly_burn > 0:
        burn_tolerance_months = financials.cash_balance / financials.monthly_burn
    else:
        burn_tolerance_months = None  # burn이 0이면 수익 > 비용

    # 2. Revenue / Spend Ratio
    #    "매출이 UA 비용을 얼마나 커버하는가?"
    if financials.monthly_ua_spend > 0:
        revenue_spend_ratio = financials.monthly_revenue / financials.monthly_ua_spend
    else:
        revenue_spend_ratio = None

    # 3. Capital Efficiency
    #    "총 투자 대비 매출 효율"
    total_monthly_investment = financials.monthly_burn  # burn = 전체 지출
    if total_monthly_investment > 0:
        capital_efficiency = financials.monthly_revenue / total_monthly_investment
    else:
        capital_efficiency = None

    # 4. Monthly Net Burn (순 소각률)
    #    "실제로 매월 줄어드는 현금"
    monthly_net_burn = financials.monthly_burn - financials.monthly_revenue
    if monthly_net_burn > 0:
        net_runway_months = financials.cash_balance / monthly_net_burn
    else:
        net_runway_months = None  # 흑자 상태 (burn < revenue)
        
    # 5. Payback Affordability
    #    "예상 페이백 기간 동안 버틸 수 있는가?"
    payback_affordable = None
    if payback and payback.payback_day_p50 and burn_tolerance_months:
        payback_months = payback.payback_day_p50 / 30
        payback_affordable = burn_tolerance_months >= payback_months

    # ──── Tier 2 계산 (확장 입력 시 추가) ────

    # 6. Gross Margin 기반 조정
    gross_margin_adjusted_ltv = None
    if financials.gross_margin and financials.gross_margin > 0:
        gross_margin_adjusted_ltv = {
            'p10': ltv.ltv_d180['p10'] * financials.gross_margin,
            'p50': ltv.ltv_d180['p50'] * financials.gross_margin,
            'p90': ltv.ltv_d180['p90'] * financials.gross_margin,
        }

    # 7. 게임별 총 비용 (개발 + 운영 + UA)
    game_total_cost = None
    if financials.dev_cost is not None and financials.ops_cost is not None:
        game_total_cost = (
            financials.dev_cost +
            financials.ops_cost +
            (financials.monthly_ua_spend or 0)
        )

    # ──── 범위 입력 처리 ────

    # 사용자가 범위로 입력한 경우 (e.g., {"min": 100000, "max": 200000})
    revenue_for_calc = financials.monthly_revenue
    revenue_is_range = False
    if financials.monthly_revenue_range:
        r = financials.monthly_revenue_range
        revenue_for_calc = (r['min'] + r['max']) / 2  # 중앙값 사용
        revenue_is_range = True

    return FinancialMetrics(
        available=True,
        tier=detect_tier(financials),  # 'tier1', 'tier2', 'tier3'

        # Tier 1 메트릭
        burn_tolerance_months=round(burn_tolerance_months, 1) if burn_tolerance_months else None,
        net_runway_months=round(net_runway_months, 1) if net_runway_months else None,
        revenue_spend_ratio=round(revenue_spend_ratio, 2) if revenue_spend_ratio else None,
        capital_efficiency=round(capital_efficiency, 2) if capital_efficiency else None,
        monthly_net_burn=round(monthly_net_burn, 0),
        payback_affordable=payback_affordable,

        # Tier 2 메트릭 (None이면 UI에서 숨김)
        gross_margin_adjusted_ltv=gross_margin_adjusted_ltv,
        game_total_cost=game_total_cost,

        # 범위 입력 표시
        revenue_is_range=revenue_is_range,
        revenue_range=financials.monthly_revenue_range,

        # 상태 메시지
        message=generate_financial_message(burn_tolerance_months, payback_affordable, capital_efficiency),
    )


def detect_tier(financials: FinancialInputs) -> str:
    """입력된 필드 수에 따라 Tier 자동 판별."""
    tier2_fields = [financials.revenue_iap, financials.dev_cost,
                    financials.ops_cost, financials.gross_margin]
    if financials.input_method in ('quickbooks', 'xero'):
        return 'tier3'
    elif any(f is not None for f in tier2_fields):
        return 'tier2'
    else:
        return 'tier1'


def generate_financial_message(burn_months, payback_ok, cap_eff):
    """재무 상태를 한 문장으로 요약."""
    parts = []
    if burn_months is not None:
        if burn_months >= 12:
            parts.append(f"런웨이 {burn_months:.0f}개월로 안정적")
        elif burn_months >= 6:
            parts.append(f"런웨이 {burn_months:.0f}개월 — 주의 필요")
        else:
            parts.append(f"런웨이 {burn_months:.0f}개월 — 긴급")

    if payback_ok is True:
        parts.append("페이백 기간 내 런웨이 충분")
    elif payback_ok is False:
        parts.append("페이백 도달 전 런웨이 소진 위험")

    if cap_eff is not None:
        if cap_eff >= 1.0:
            parts.append(f"자본효율 {cap_eff:.0%} (흑자)")
        else:
            parts.append(f"자본효율 {cap_eff:.0%} (적자)")

    return " · ".join(parts) if parts else "재무 분석 완료"
```

#### 재무 데이터 유무에 따른 시그널 변화

```
재무 데이터 없을 때:                    재무 데이터 있을 때:
━━━━━━━━━━━━━━━━━━                   ━━━━━━━━━━━━━━━━━━

시그널 판정:                           시그널 판정:
  BEP 확률:     30%                     BEP 확률:     30%
  ROAS:         25%                     ROAS:         25%
  Burn:         20% → 중립(50점)        Burn:         20% → 실제 계산
  리텐션 위치:  15%                     리텐션 위치:  15%
  신뢰도:       10%                     신뢰도:       10%

→ Burn 점수가 항상 중립(50)            → Burn 점수가 실제 런웨이 반영
→ 재무 상태와 무관한 시그널             → 재무 상태가 시그널에 직접 영향

예: 리텐션 좋고 ROAS 좋아도             예: 리텐션 좋고 ROAS 좋지만
   → GREEN                               런웨이 3개월이면 → YELLOW
                                          "페이백 D47인데 런웨이 3개월 → 위험"

+ 추가 활성화 메트릭:
  ✓ Burn Tolerance Window
  ✓ Net Runway (순 런웨이)
  ✓ Capital Efficiency
  ✓ Payback Affordability
  ✓ Revenue/Spend Ratio
```

---

## 6. Stage 5: DECIDE — 투자 시그널 판정 및 예산 재배분

DECIDE 단계는 단순한 Green/Yellow/Red 판정을 넘어, **인터벤션 결과를 예산 재배분 권고로 연결**한다.

```
TRANSLATE 출력 (ΔLTV, Payback Shift, Experiment ROI)
    ↓
Green/Yellow/Red 시그널 판정 (BEP 확률, ROAS, Burn Tolerance 종합)
    ↓
예산 재배분 권고:
  - GREEN + Experiment ROI > 300%  → "UA 예산 증액 권장, 실험 배포 가속"
  - GREEN + 낮은 Experiment Velocity → "실험 속도 증가로 추가 ΔLTV 확보 가능"
  - YELLOW + 특정 액션 기여 낮음    → "해당 라이브 ops 비용 재검토"
  - RED + 페이백 불가 궤적          → "UA 지출 축소, 핵심 리텐션 개선 집중"
```

예산 재배분 결정은 개별 인터벤션의 ΔLTV와 Experiment ROI 누적 값에 근거한다.
**가장 높은 ROI를 보인 인터벤션 유형에 자원을 집중하는 것이 Compass의 최종 권고 논리다.**

### 6.1 Green / Yellow / Red 판정 로직

```python
def generate_investment_signal(
    payback: PaybackResult,
    financials: FinancialInputs,
    retention: RetentionPrediction,
    ctx: GameContext
) -> InvestmentSignal:
    """
    모든 메트릭을 종합하여 최종 투자 시그널을 판정.
    """

    # 판정 기준 점수 (0-100)
    scores = {}

    # 1. BEP 확률 (가중치 30%)
    scores['bep'] = payback.bep_probability_d180 * 100

    # 2. ROAS D90 (가중치 25%)
    if payback.roas_d90:
        scores['roas'] = min(payback.roas_d90 * 100, 100)  # 100% ROAS = 100점
    else:
        scores['roas'] = 0

    # 3. Burn Tolerance (가중치 20%)
    if financials and financials.monthly_burn > 0:
        months_remaining = financials.cash_reserve / financials.monthly_burn
        scores['burn'] = min(months_remaining / 12 * 100, 100)  # 12개월 = 100점
    else:
        scores['burn'] = 50  # 데이터 없으면 중립

    # 4. 리텐션 밴드 위치 (가중치 15%)
    if ctx.cohort_data and ctx.prior:
        actual_d7 = ctx.cohort_data.get_retention(7)
        prior_d7_p50 = ctx.prior['retention_d7']['p50']
        retention_vs_benchmark = actual_d7 / prior_d7_p50 if prior_d7_p50 > 0 else 1.0
        scores['retention_position'] = min(retention_vs_benchmark * 70, 100)
    else:
        scores['retention_position'] = 50

    # 5. 예측 신뢰도 (가중치 10%)
    scores['confidence'] = retention.confidence * 100

    # 가중 평균
    weighted_score = (
        scores['bep'] * 0.30 +
        scores['roas'] * 0.25 +
        scores['burn'] * 0.20 +
        scores['retention_position'] * 0.15 +
        scores['confidence'] * 0.10
    )

    # 시그널 판정
    if weighted_score >= 70:
        signal = 'green'
        message = "투자 지속 권장 — BEP 달성 확률과 수익성 지표가 양호합니다."
    elif weighted_score >= 40:
        signal = 'yellow'
        message = "주의 관찰 필요 — 일부 지표가 기준 미달이며 추가 데이터 수집이 권장됩니다."
    else:
        signal = 'red'
        message = "투자 재검토 권장 — 현재 궤적으로는 BEP 달성이 어려울 수 있습니다."

    return InvestmentSignal(
        signal=signal,
        score=round(weighted_score, 1),
        message=message,
        breakdown=scores,
        factors=[
            f"BEP 확률(D180): {payback.bep_probability_d180:.0%}",
            f"ROAS(D90): {payback.roas_d90:.0%}" if payback.roas_d90 else "ROAS: 데이터 부족",
            f"Burn Tolerance: {months_remaining:.1f}개월" if financials else "재무 데이터 없음",
            f"리텐션 vs 벤치마크: {retention_vs_benchmark:.0%}" if ctx.cohort_data else "코호트 데이터 대기 중",
            f"예측 신뢰도: {retention.confidence:.0%} (Layer: {retention.layer})",
        ],
        generated_at=datetime.utcnow(),
    )
```

---

## 6.5 Stage 6: NARRATE — LLM 번역 레이어 (인터페이스 계약)

> **구현 시점**: Phase 3 (Month 5-6)
> **현재 상태**: 인터페이스 정의만 — Phase 1-2에서는 rule-based 템플릿(`generate_financial_message()`)으로 대체
> **목적**: 앞선 Stage 출력을 설계할 때 "이 데이터가 LLM 프롬프트의 입력이 된다"는 것을 의식하기 위한 계약

### 기능 분류 및 우선순위

| 순서 | 기능 | 입력 (앞 Stage 출력) | 출력 | 난이도 | 의존성 |
|---|---|---|---|---|---|
| **P1** | 투자 요약 생성 | `InvestmentSignal` + `RetentionPrediction` + `FinancialStatus` | 3-5문장 자연어 요약 | 낮음 | Stage 5 출력만 있으면 가능 |
| **P2** | 이상 탐지 해석 | `AnomalyEvent` + `HistoricalContext` + `ActionLog` | 원인 가설 + 권장 조치 | 중간 | 이상 탐지 로직 선행 필요 |
| **P3** | 자연어 쿼리 | 사용자 질문 + 전체 컨텍스트 | 구조화된 답변 | 높음 | RAG/function calling 아키텍처 필요 |

### P1: 투자 요약 생성 — 입출력 계약

Stage 5의 `InvestmentSignal`이 이 함수의 입력이 된다:

```python
@dataclass
class NarrateInput:
    """Stage 5 → Stage 6 인터페이스. 앞 Stage 출력의 합집합."""

    # Stage 5: DECIDE 출력
    signal: Literal['GREEN', 'YELLOW', 'RED']
    signal_score: float                    # 0-100
    signal_factors: list[str]              # 판정 근거 문자열 리스트

    # Stage 3: PREDICT 출력
    retention_layer: Literal['parametric', 'lstm']
    retention_d30_p50: float
    retention_confidence: float            # 0-1
    retention_vs_benchmark: str            # "상위 20%" 등

    # Stage 4: TRANSLATE 출력
    payback_days_p50: int | None
    bep_probability_d180: float
    ltv_p50: float
    roas_d90: float | None

    # Stage 4: 재무 출력
    burn_tolerance_months: float | None
    capital_efficiency: float | None

    # 컨텍스트
    game_name: str
    genre: str
    data_freshness: datetime               # 가장 오래된 입력 데이터 시점


@dataclass
class NarrateOutput:
    """LLM이 생성하는 투자 요약."""
    summary: str              # 3-5문장 자연어 요약
    key_insight: str          # 핵심 인사이트 1문장
    recommended_action: str   # 다음 행동 제안
    confidence_note: str      # 불확실성/데이터 한계 고지
```

**Phase 1-2 대체 구현** (rule-based):
```python
def narrate_investment_summary(inp: NarrateInput) -> NarrateOutput:
    """
    Phase 1-2: 템플릿 기반 요약. Phase 3에서 LLM 호출로 교체.
    기존 generate_financial_message()를 확장한 형태.
    """
    # 템플릿 기반 — LLM 교체 시 이 함수 내부만 변경
    summary = f"{inp.game_name}({inp.genre})의 투자 시그널은 {inp.signal}입니다. "
    summary += f"D30 리텐션 {inp.retention_d30_p50:.1%}(벤치마크 {inp.retention_vs_benchmark}), "
    summary += f"BEP 확률 {inp.bep_probability_d180:.0%}."

    return NarrateOutput(
        summary=summary,
        key_insight=inp.signal_factors[0] if inp.signal_factors else "",
        recommended_action="상세 분석 필요" if inp.signal == 'YELLOW' else "",
        confidence_note=f"예측 신뢰도 {inp.retention_confidence:.0%} (Layer: {inp.retention_layer})",
    )
```

### P2: 이상 탐지 해석 — 입출력 계약

```python
@dataclass
class AnomalyNarrateInput:
    """이상 탐지 엔진 → LLM 해석 인터페이스."""
    anomaly_type: str             # 'retention_drop' | 'revenue_spike' | 'cpi_surge' 등
    metric_name: str              # 이상이 감지된 메트릭
    expected_value: float
    actual_value: float
    deviation_sigma: float        # 표준편차 기준 이탈 정도
    recent_actions: list[str]     # 최근 ActionLog (UA 변경, 업데이트, 실험 등)
    historical_pattern: str       # "지난 3회 유사 이탈 시 원인: ..."


@dataclass
class AnomalyNarrateOutput:
    """이상 탐지에 대한 LLM 해석."""
    explanation: str              # 가능한 원인 설명 (2-3문장)
    likely_cause: str             # 가장 유력한 원인 1개
    suggested_actions: list[str]  # 권장 조치 1-3개
    urgency: Literal['immediate', 'monitor', 'informational']
```

### P3: 자연어 쿼리 — 스코프 정의만

> Phase 4+ 이후. 현재는 인터페이스 정의 불필요.
> 진입 시점에 RAG 아키텍처 (컨텍스트 검색 + function calling) 별도 설계 예정.

### 기술 선택 (Phase 3 진입 시 결정)

Phase 3 시작 시 아래 항목을 확정한다. 지금은 열어둠:

| 결정 항목 | 후보 | 결정 기준 |
|---|---|---|
| LLM 모델 | Claude API / OpenAI / self-hosted | 비용, 한국어 품질, 지연시간 |
| 호출 방식 | 실시간 streaming / batch 생성 후 캐시 | 대시보드 UX 요구사항에 따라 |
| 비용 구조 | 호출당 비용 × 일일 배치 횟수 × 테넌트 수 | 월 $50/테넌트 이하 목표 |
| 폴백 전략 | LLM 실패 시 rule-based 템플릿 자동 전환 | 가용성 99.5% 이상 |

### 파이프라인 내 위치

```
Stage 5: DECIDE                Stage 6: NARRATE              Dashboard
━━━━━━━━━━━━━━━               ━━━━━━━━━━━━━━━━              ━━━━━━━━━
InvestmentSignal ──────→ NarrateInput ──→ NarrateOutput ──→ 해석 카드
                                                            AI Recommendation 박스
AnomalyEvent ──────────→ AnomalyNarrateInput               한줄 요약
                              ──→ AnomalyNarrateOutput ──→ 알림 + 설명 패널

Phase 1-2: rule-based 템플릿 (generate_financial_message 확장)
Phase 3:   LLM 호출로 교체 (함수 시그니처 동일, 내부만 변경)
```

---

## 7. 배치 파이프라인: 전체 실행 흐름

### 7.1 일간 배치 (Cloud Run Job)

```python
async def daily_batch_pipeline():
    """
    매일 1회 실행: 모든 테넌트의 모든 게임에 대해
    예측 → 번역 → 판정을 수행하고 결과를 저장.
    """
    tenants = db.query(tenants).filter(active=True).all()

    for tenant in tenants:
        games = db.query(tenant_games).filter(tenant_id=tenant.id).all()

        for game in games:
            try:
                # 1. 컨텍스트 구성
                ctx = build_game_context(tenant.id, game.id)

                # 2. 리텐션 예측
                retention = blended_prediction(ctx)

                # 3. LTV 계산
                arpdau = ctx.mmp_data.avg_arpdau if ctx.mmp_data else estimate_arpdau(ctx)
                ltv = calculate_ltv(retention, arpdau)

                # 4. Payback 계산
                cpi = ctx.mmp_data.avg_cpi if ctx.mmp_data else None
                payback = calculate_payback(ltv, cpi) if cpi else None

                # 5. 실험 번역 (있으면)
                exp_translations = []
                for exp in ctx.experiments:
                    if exp.ate is not None:
                        translation = translate_experiment_to_investment(
                            ate=exp.ate,
                            ate_ci=(exp.ci_lower, exp.ci_upper),
                            baseline_retention=retention,
                            arpdau=arpdau,
                            projected_annual_installs=ctx.mmp_data.monthly_installs * 12 if ctx.mmp_data else 100000,
                            experiment_cost=exp.cost or 0,
                            source=exp.source
                        )
                        exp_translations.append(translation)

                # 6. 투자 시그널 판정
                signal = generate_investment_signal(payback, ctx.financials, retention, ctx)

                # 7. 결과 저장
                save_prediction(tenant.id, game.id, retention)
                save_ltv(tenant.id, game.id, ltv)
                if payback:
                    save_payback(tenant.id, game.id, payback)
                for et in exp_translations:
                    save_experiment_translation(tenant.id, game.id, et)
                save_signal(tenant.id, game.id, signal)

                # 8. 캐시 업데이트 (Redis)
                cache_key = f"signal:{tenant.id}:{game.id}"
                redis.set(cache_key, signal.to_json(), ex=86400)

            except Exception as e:
                log.error(f"Pipeline failed for {tenant.id}/{game.id}: {e}")
                continue
```

### 7.2 실행 스케줄

```
Cloud Scheduler 설정:

1. ranking_collector    — 0 */6 * * *  (6시간마다)
   → Apple RSS 수집

2. metadata_collector   — 0 2 * * *    (매일 02:00 UTC)
   → iTunes API + GP Scraper 수집

3. mmp_sync             — 0 3 * * *    (매일 03:00 UTC)
   → AppsFlyer/Adjust 동기화

4. experiment_sync      — 0 4 * * *    (매일 04:00 UTC)
   → Statsig 실험 결과 동기화

5. daily_batch_pipeline — 0 5 * * *    (매일 05:00 UTC)
   → 예측 → 번역 → 판정 (전체 배치)

6. cache_warmup         — 30 5 * * *   (매일 05:30 UTC)
   → Redis 캐시 워밍업 (대시보드 응답 속도용)
```

---

## 8. API 서빙: FastAPI 엔드포인트

```python
from fastapi import FastAPI, Depends
from auth import get_current_tenant

app = FastAPI()

@app.get("/api/v1/games/{game_id}/signal")
async def get_investment_signal(game_id: str, tenant=Depends(get_current_tenant)):
    """Module 1: Executive Overview의 핵심 데이터."""
    # Redis 캐시에서 먼저 조회 (< 5ms)
    cached = redis.get(f"signal:{tenant.id}:{game_id}")
    if cached:
        return json.loads(cached)

    # 캐시 미스 시 DB에서 조회
    signal = db.query(investment_signals).filter(
        tenant_id=tenant.id, game_id=game_id
    ).order_by(generated_at.desc()).first()
    return signal


@app.get("/api/v1/games/{game_id}/retention")
async def get_retention_prediction(game_id: str, tenant=Depends(get_current_tenant)):
    """리텐션 예측 커브 (P10/P50/P90) + Prior 비교."""
    prediction = db.query(retention_predictions).filter(
        tenant_id=tenant.id, game_id=game_id
    ).order_by(generated_at.desc()).first()

    # Prior도 함께 반환 (시각화에서 Prior vs Posterior 비교용)
    game = db.query(tenant_games).get(game_id)
    classification = classify_game(game.app_id, game.primary_country)
    prior = get_prior(classification['genre'], classification['tier'])

    return {
        "prediction": prediction,
        "prior": prior,
        "classification": classification,
    }


@app.get("/api/v1/games/{game_id}/ltv")
async def get_ltv_metrics(game_id: str, tenant=Depends(get_current_tenant)):
    """LTV, Payback, ROAS, BEP 확률."""
    return db.query(investment_metrics).filter(
        tenant_id=tenant.id, game_id=game_id
    ).order_by(generated_at.desc()).first()


@app.get("/api/v1/games/{game_id}/experiments")
async def get_experiment_translations(game_id: str, tenant=Depends(get_current_tenant)):
    """실험 → 투자 가치 번역 결과 목록."""
    return db.query(experiment_translations).filter(
        tenant_id=tenant.id, game_id=game_id
    ).order_by(generated_at.desc()).all()


@app.post("/api/v1/games/{game_id}/scenario")
async def run_scenario(game_id: str, scenario: ScenarioInput, tenant=Depends(get_current_tenant)):
    """
    실시간 시나리오 시뮬레이션.
    "만약 CPI가 20% 오르면?" → SVI로 빠른 근사 추론.
    """
    ctx = build_game_context(tenant.id, game_id)

    # 시나리오 적용
    modified_cpi = ctx.mmp_data.avg_cpi * (1 + scenario.cpi_change)
    modified_arpdau = ctx.mmp_data.avg_arpdau * (1 + scenario.arpdau_change)

    # 기존 리텐션 예측 재사용 (리텐션은 시나리오에 영향 없음)
    retention = db.query(retention_predictions).filter(
        tenant_id=tenant.id, game_id=game_id
    ).order_by(generated_at.desc()).first()

    # LTV/Payback만 재계산
    ltv = calculate_ltv(retention, modified_arpdau)
    payback = calculate_payback(ltv, modified_cpi)

    return {
        "scenario": scenario,
        "ltv": ltv,
        "payback": payback,
        "comparison": {
            "baseline_payback": ctx.current_payback,
            "scenario_payback": payback.payback_day_p50,
            "delta": payback.payback_day_p50 - ctx.current_payback if both else None,
        }
    }
```

---

## 9. 데이터 신선도 & 모니터링

```sql
-- 데이터 신선도 모니터링 뷰
CREATE VIEW data_freshness AS
SELECT
  'rankings' AS source,
  MAX(crawl_timestamp) AS last_update,
  NOW() - MAX(crawl_timestamp) AS staleness
FROM app_store_rankings
UNION ALL
SELECT
  'metadata',
  MAX(crawl_date::timestamptz),
  NOW() - MAX(crawl_date::timestamptz)
FROM app_metadata
UNION ALL
SELECT
  'mmp_' || tenant_id::text,
  MAX(synced_at),
  NOW() - MAX(synced_at)
FROM mmp_cohort_data
GROUP BY tenant_id;

-- 알림: 24시간 이상 업데이트 없으면 경고
-- Cloud Monitoring에서 이 뷰를 폴링
```

---

## 10. 구현 우선순위 (Phase 1 MVP 기준)

```
Week 1-2: Stage 1 (INGEST)
  □ Apple RSS 수집기 구현 (Cloud Run Job)
  □ iTunes Search API 수집기 구현
  □ Supabase 테이블 생성 (rankings, metadata, benchmarks)
  □ GameAnalytics PDF에서 벤치마크 데이터 수동 입력
  □ Cloud Scheduler 설정

Week 3-4: Stage 2 (ENRICH) + Stage 3 일부
  □ classify_game() 구현 (장르-티어 분류)
  □ get_prior() 구현 (벤치마크 → Prior)
  □ prior_only_prediction() 구현 (Prior 기반 예측)
  □ layer1_parametric() 구현 (NumPyro curve fitting)

Week 5-6: Stage 4 (TRANSLATE)
  □ calculate_ltv() 구현
  □ calculate_payback() 구현
  □ FastAPI 엔드포인트 구현

Week 7-8: Stage 5 (DECIDE) + Dashboard
  □ generate_investment_signal() 구현
  □ daily_batch_pipeline 구현
  □ Next.js 대시보드 연동 (Module 1: Executive Overview)
  □ Prior vs Posterior 시각화 구현
```

---

## References

- CLAUDE.md Section 3: Retention Theory (5대 성질, 파워로 모델, 예측 방법론)
- CLAUDE.md Section 4: Bayesian Decision Framework
- CLAUDE.md Section 5: Revenue Modeling Engine
- CLAUDE.md Section 6: Experiment-to-Investment Translation
- Project_Compass_Tech_Stack.md: 기술 스택 상세
- Project_Compass_Data_Sources_Guide.md: 데이터 소스 URL/API 상세
