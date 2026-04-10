# Project Compass — Foundation Document

## Experiment-to-Investment Decision OS for the Mobile Gaming Industry

**Version**: 1.0
**Date**: March 2026
**Classification**: Internal Foundation Document
**Usage**: Final business report, government support program applications, product development reference

---

## 1. Project Identity

### 1.1 One-Line Definition

**Project Compass transforms game interventions, experiments, and market signals into capital allocation decisions — the Experiment-to-Investment Decision OS for mobile gaming.**

### 1.2 What This Project Is

An AI-powered decision operating system that measures whether A/B tests, live operations, and market interventions are actually creating investable growth — translating experiment outcomes (ATE → ΔLTV → ROI) into capital allocation decisions with quantified confidence.

### 1.3 What This Project Is NOT

- Not a market data provider (Sensor Tower, AppMagic already do this)
- Not a mobile attribution platform (AppsFlyer, Adjust already do this)
- Not a full-stack A/B testing SDK (Statsig, Firebase already do this)
- Not a data warehouse (Databricks, Snowflake already do this)
- Not a generic BI dashboard (Looker, Tableau already do this)

Compass is the **translation layer** that sits above all of these and converts their outputs into investment decisions.

---

## 2. The Structural Problem: Data Silos in Mobile Gaming

### 2.1 The Pre-Investment Nature of Mobile Gaming

Mobile gaming is structurally a **pre-investment industry**:

- Development costs are committed before any revenue signal exists
- User acquisition budgets are deployed before payback can be measured
- Live operations costs are ongoing with long-tail revenue recovery
- Revenue recovery stretches over months or years through LTV monetization

This creates a perpetual capital allocation dilemma: operators must continuously decide how much additional capital to commit, with incomplete information distributed across disconnected systems.

### 2.2 The Four Data Silos

The mobile gaming data ecosystem is fragmented into four disconnected silos, each answering a narrow question while leaving the investment question unanswered:

**Silo 1: Market Intelligence (External)**
- Sources: Sensor Tower, AppMagic, data.ai
- Contains: Download estimates, revenue estimates, competitive benchmarks, genre trends, ad intelligence
- Answers: "What does the market look like?"
- Does NOT answer: "Does this market justify our current investment level?"

**Silo 2: Attribution & User Acquisition (Boundary)**
- Sources: AppsFlyer, Adjust, Singular
- Contains: Install attribution, ROAS, channel performance, incrementality measurement
- Answers: "Where do users come from and what do they cost?"
- Does NOT answer: "Is this acquisition cost justified by long-term returns?"

**Silo 3: Experimentation & Product (Internal)**
- Sources: Statsig, Optimizely, Firebase, LaunchDarkly
- Contains: A/B test results, feature flags, experiment metadata
- Answers: "Which variant performed better?"
- Does NOT answer: "How much investment value did this experiment create?"

**This is the central gap.** A/B testing tools tell teams which variant won, but not whether that win created investment value.

**Silo 4: Financial & Revenue (Internal)**
- Sources: Internal ERP, spreadsheets, cohort data, revenue systems
- Contains: Revenue, costs, margins, payback calculations, budget allocations
- Answers: "What is our current financial position?"
- Does NOT answer: "Given market conditions and operational velocity, should we invest more?"

### 2.3 The Missing Layer

No existing tool bridges these four silos into a unified investment decision. Operators are forced to manually synthesize information from 4+ systems, typically through spreadsheets and meetings, to answer the most fundamental question in their business:

> "Can we afford to invest more capital, and should we?"

But the question goes deeper: **Which specific interventions — experiments, live events, UA campaigns, feature releases — are actually increasing LTV? And do those gains justify reallocating capital?** No existing tool answers this.

**Project Compass is this missing layer.**

---

## 3. Scientific Foundation: Retention Theory

### 3.1 Why Retention Is the Central Variable

All mobile game economics ultimately flow through retention:

```
Retention → DAU → ARPDAU → Daily Revenue → LTV → Payback → Investment Decision
```

Retention is the foundational variable that determines:
- How many users remain active (DAU sustainability)
- How long revenue can be extracted per user (LTV ceiling)
- When acquisition costs are recovered (payback period)
- Whether additional investment is justified (capital allocation logic)

**If you can predict retention, you can predict the investment outcome.**

### 3.2 The Five Properties of Retention

Through empirical observation across mobile gaming portfolios (2021), five fundamental properties of retention were identified and subsequently validated against academic literature (Viljanen & Airola 2017, GameAnalytics 2024 benchmark data, Deconstructor of Fun 2020):

**Property 1: Monotonic Non-Increase**
> Cohort retention on Day N cannot exceed retention on Day N-1.

- Validation: Mathematically guaranteed by the definition of N-day cohort retention
- Caveat: Re-engagement campaigns can create temporary violations in rolling retention metrics; the property holds for standard cohort retention measurement
- Academic support: Universally confirmed across survival analysis literature

**Property 2: Sequential Dependency**
> Each day's retention is influenced by the preceding day's retention state.

- Validation: Consistent with Markov chain and Hidden Markov Model (HMM) frameworks for churn prediction (Rothenbuehler et al. 2015)
- Refinement: First-order Markov approximation is useful but oversimplified; behavioral features over 3-7 day windows provide stronger predictive signal (Jang et al. 2021)
- Implication: Day-over-day retention ratios (D[n+1]/D[n]) carry forward predictive information

**Property 3: Temporal Decrease**
> Retention decreases over time as a population-level regularity.

- Validation: Universally documented. GameAnalytics 2024 benchmark: median D1=22.91%, D7=4.2%, D28=0.85% across thousands of games
- Mechanism: Heterogeneous user population where low-engagement users churn first, progressively filtering toward a more engaged survivor pool

**Property 4: Decelerating Decline**
> The rate of retention decrease slows over time as remaining users are progressively more engaged.

- Validation: Corresponds to the "decreasing hazard rate" in survival analysis (Viljanen & Airola 2017)
- Mathematical basis: In the power law model R(t) = a * t^b (b < 0), the derivative dR/dt = a * b * t^(b-1) becomes progressively less negative
- Mechanism: Self-selection effect — users surviving past critical thresholds (D7, D14, D30) have fundamentally lower daily churn probability

**Property 5: Asymptotic Stabilization**
> Properties 1 (monotonic decrease) + Property 4 (decelerating decline) together produce asymptotic behavior — the retention curve approaches a horizontal floor.

- Validation: Mathematically rigorous via squeeze theorem. If the function is monotonically non-increasing and its rate of decrease approaches zero, the function converges to a limit
- Industry confirmation: Deconstructor of Fun (2020) identifies the D30-D60 window as when "the retention curve flattens out"
- GoPractice: "For a number of products, the retention curve plateaus, which means new users turn into regular ones"
- Practical significance: The asymptotic floor represents the game's "core user base" — the stable population from which long-term monetization flows

### 3.3 The Asymptotic Floor: Gateway to LTV Measurement

The point at which retention stabilizes — the "asymptotic arrival point" — is the critical threshold for investment decision-making:

**Before stabilization:**
- LTV estimates are speculative (integration endpoint is arbitrary)
- Each additional day of data materially changes projected LTV
- Investment decisions carry high uncertainty

**After stabilization:**
- The remaining retention tail becomes predictable via the fitted model
- LTV calculation has bounded uncertainty
- Investment decisions can be made with quantified confidence

This is why the asymptotic arrival point is not merely an analytical curiosity — it is the **gateway to rational capital allocation**.

### 3.4 Mathematical Framework

The retention curve is best modeled by the power law decay function:

```
R(t) = a * t^b    where b in (-1, 0)
```

This model satisfies all five properties:
- P1: Monotonically non-increasing for b < 0
- P2: Sequential structure inherent in power law progression
- P3: R(t) decreases as t increases
- P4: |dR/dt| = |a * b * t^(b-1)| decreases as t increases (deceleration)
- P5: R(t) → 0+ as t → ∞ (asymptotic)

For games with strong engagement, the shifted power law provides a better fit:

```
R(t) = a * t^b + c    where c > 0 is the asymptotic floor
```

Alternative validated models:
- Shifted exponential: R(t) = a * exp(-bt) + c
- Weibull survival function: R(t) = exp(-(t/lambda)^k)
- Log-linear: R(t) = a - b * log(t)

**Reference**: Viljanen & Airola (2017), "Modelling User Retention in Mobile Games"; Valeev (2018), power law retention modeling.

### 3.5 Prediction Methodology

#### Phase 1: Benchmark Construction
1. Collect retention data (D1/D2/D3/D4/D5/D6/D7/D14/D30) from app intelligence platforms
2. Segment by genre (Puzzle, Casual, RPG, Strategy, etc.) and performance tier (Top Gross 50)
3. Calculate day-over-day retention ratios for each title: D[n+1]/D[n]
4. Establish prediction bands (P10/P50/P90) for each genre-tier combination

#### Phase 2: Retention Curve Interpolation
For days without direct benchmark data (D8-D13, D15-D29):
```
R(d) = R(d_prev) - ((R(d_prev) - R(d_next)) / (d_next - d_prev))
```
Applied with the constraint that daily decline follows the deceleration pattern (Property 4).

#### Phase 3: Slope-Based Prediction
1. When D1 retention is observed: generate full prediction band using genre benchmarks
2. As D2-D7 data arrives: compare observed slopes to prediction band slopes
3. If observed slopes fall within prediction band: adopt the corresponding long-term projection
4. Slope matching enables D7 data to project D30/D60/D180 retention within the genre-specific band

#### Phase 4: Asymptotic Arrival Detection
Special handling for games where the curve stabilizes early:
- If D2-D6 slope is shallow (small daily decline): early asymptotic arrival detected
- Cross-reference slope position against prediction band
- If prediction band rank and slope rank align: adopt projection directly
- If they diverge: apply the adjustment rules (see Section 3.6)

### 3.6 Prediction Adjustment Rules

When the prediction band position and asymptotic arrival timing diverge:

| Prediction Band Position | Asymptotic Arrival Speed | Resolution |
|---|---|---|
| Lower tier | Early arrival (fast stabilization) | Adopt **upper tier** — early stabilization indicates stronger core engagement despite lower initial retention |
| Upper tier | Late arrival (slow stabilization) | Adopt **lower tier** — high initial retention with slow stabilization indicates weak core engagement |
| Aligned | Aligned | Adopt directly — consistent signals increase confidence |

These rules reflect the insight that **the shape of the curve matters more than any single data point**.

### 3.7 Validation Status

| Claim | Status | Evidence |
|---|---|---|
| Five properties (P1-P5) | Confirmed | Viljanen & Airola 2017, GameAnalytics 2024, Deconstructor of Fun 2020 |
| Power law model fit | Confirmed | Valeev 2018, Viljanen et al. 2016 |
| D7 → D30 predictive power | Confirmed (genre-stratified) | ~50% variance explained D7→D180; ~80% for D30→D180 |
| Slope-based band prediction | Confirmed (methodology) | Consistent with day-over-day ratio stability in academic literature |
| Asymptotic floor existence | Confirmed (top-grossing games) | GoPractice, Deconstructor of Fun, GameAnalytics |

**Key limitation**: Direct D7→D180 prediction without genre stratification is insufficient. Genre controls are mandatory for reliable projection.

---

## 4. The Bayesian Decision Framework

### 4.1 Core Principle: Market Intelligence as Prior

The fundamental insight of Project Compass is the application of Bayesian inference to investment decisions:

```
Prior (Market Intelligence) + Likelihood (Internal Data) = Posterior (Investment Decision)
```

**Prior Distribution**: Constructed from external market intelligence
- Genre-level retention benchmarks (Sensor Tower, AppMagic)
- Competitive performance distributions
- Market saturation signals
- UA cost trends by geography and channel

**Likelihood Function**: Updated with internal observed data
- Actual cohort retention curves
- Real UA performance and CPI
- Experiment results (ATE measurements)
- Live operations impact data
- Revenue and financial actuals

**Posterior Distribution**: The investment decision with quantified uncertainty
- Probability of payback within target period
- Expected LTV with credible intervals
- Capital efficiency score with confidence bands
- Recommended action with decision confidence

### 4.2 Why Bayesian, Not Frequentist

Traditional analytics provides point estimates: "D30 retention is 8.5%."
Bayesian inference provides decision-grade output: "D30 retention is between 7.2% and 10.1% with 90% probability, given market benchmarks and our observed D7 data."

For investment decisions, the distinction is critical:
- Point estimates create false precision and overconfident decisions
- Credible intervals enable risk-aware capital allocation
- Prior incorporation prevents over-fitting to noisy early data
- Posterior updating improves with each day of new evidence

### 4.3 The Belief Update Cycle

```
Day 0: Prior = Genre benchmark distribution
         ↓
Day 1: Observe D1 retention → Update posterior
         ↓
Day 3: Observe D3 retention → Update posterior (narrowing)
         ↓
Day 7: Observe D7 retention → Posterior significantly tightened
         ↓
Day 14: Observe D14 retention → High-confidence posterior
         ↓
Day 30: Observe D30 retention → Investment decision with bounded uncertainty
```

Each observation narrows the posterior, progressively converting market-level uncertainty into game-specific investment conviction.

---

## 5. Revenue Modeling Engine

### 5.1 The Revenue Chain

```
UA Spend → ÷ CPI → Installs → × Retention(d) → DAU → × ARPDAU → Daily Revenue
```

**Core Formula:**
```
Daily Revenue(d) = Σ[cohort_c] (Installs_c × Retention_c(d) × ARPDAU(d))
```

Each variable is forecast with uncertainty:
- **CPI**: Observed per channel, with trend extrapolation
- **Retention(d)**: LSTM-predicted with Bayesian credible intervals
- **ARPDAU**: Decomposed into IAP revenue + ad revenue per DAU, with payer conversion and spend depth modeling

### 5.2 LTV Calculation

```
LTV = Σ(d=1 to T) Retention(d) × ARPDAU(d)
```

Where T is determined by the asymptotic arrival point — the moment when the retention curve stabilizes sufficiently for the integral to converge with bounded error.

**The experiment-to-investment pipeline runs through this model:**
```
ATE (experiment result) → ΔRetention(d) → ΔLTV → ΔCapital Allocation Decision
```
Every intervention — A/B test, live ops event, UA campaign, feature release — is evaluated by how much it moves LTV, and whether that movement justifies capital reallocation.

### 5.3 Investment Metrics Derived from Revenue Model

| Metric | Formula | Decision It Enables |
|---|---|---|
| Payback Period | d where Σ(ARPDAU × Retention) ≥ CPI | "When do we recover acquisition cost?" |
| ROAS(d) | LTV(d) / CPI | "What is our return at day d?" |
| BEP Probability | P(LTV(T) ≥ CPI) from posterior | "How likely is break-even?" |
| IRR Estimate | Internal rate solving NPV = 0 | "Is this investment competitive?" |
| Capital Efficiency | Revenue / Total Investment | "How productive is our spending?" |
| Burn Tolerance | Months of runway at current loss rate | "How long can we sustain?" |

---

## 6. Experiment-to-Investment Translation

### 6.1 The Missing Link: ATE → Investment Value

Current experimentation platforms report statistical results: "Treatment improved D7 retention by +3.7 percentage points (p < 0.05)."

Compass translates this into investment language:

```
ATE (Average Treatment Effect)
    → ΔRetention(d) for all future days
    → ΔLTV per user
    → ΔAnnual Revenue (ΔLTV × projected user volume)
    → ΔPayback Period
    → ΔIRR
    → Experiment ROI (ΔAnnual Revenue / Experiment Cost)
```

### 6.2 Experiment Portfolio as Investment

Compass reframes the experimentation function not as an R&D cost center, but as an investment portfolio:

| Metric | Meaning |
|---|---|
| Experiment Velocity | Rate of capital-efficient learning |
| Ship Rate × Win Rate | Conversion rate of R&D spend to product value |
| Cumulative ΔLTV | Total incremental value from shipped winners |
| Experiment ROI | Return on experimentation investment |
| Learning Efficiency | Value of knowledge per experiment dollar (including "failures") |
| Time-to-Decision | Speed of capital reallocation based on evidence |

### 6.3 The Compounding Effect

Experimentation value compounds:
- Each shipped winner permanently improves the retention/revenue baseline
- Improved baseline makes subsequent experiments more valuable (larger user base)
- Faster experiment cycles compound the rate of value creation
- This creates a measurable competitive moat: **organizational learning velocity as capital efficiency**

---

## 7. Product Architecture

### 7.1 Five Core Modules

**Module 1: Executive Overview — "Can We Invest More?"**
- Current investment status (Green/Yellow/Red)
- Burn tolerance window
- Payback forecast with P10/P50/P90 confidence bands
- Key risks and opportunities (AI-generated summary)

**Module 2: Market vs. Internal Gap — "Where Do We Stand?"**
- Retention/revenue benchmarks vs. genre averages
- Competitive positioning against specific titles
- Market saturation signals and growth headroom
- Prior distribution visualization (market benchmark band)

**Module 3: Action Impact Board — "What's Actually Working?"**
- Chronological log of all interventions (UA, live ops, releases, experiments)
- Causal impact estimation per action (leveraging the retention model)
- Expected vs. actual comparison
- Cumulative action value tracker

**Module 4: Experiment Investment Board — "Is R&D Paying Off?"**
- Experiment velocity, ship rate, win rate
- ATE → ΔLTV → Experiment ROI translation
- Time-to-decision and time-to-rollout metrics
- Cumulative experiment portfolio value

**Module 5: Capital Allocation Console — "What Should We Do Next?"**
- Scenario simulator (Monte Carlo-based)
- Risk boundary visualization
- AI-ranked recommended actions with decision confidence scores
- Investment budget optimization across titles/channels

### 7.2 Design Principles

1. **Decision-first**: Every screen starts with the decision, not the data
2. **Action-linked**: Every metric connects to a specific actionable intervention
3. **Uncertainty-honest**: Credible intervals and confidence bands, never false precision
4. **Operator-centric**: Designed for business operators, not data analysts

### 7.3 Product Philosophy: Intervention Over Analysis

This platform does NOT show "what happened." It shows **"which intervention creates what investment impact."**

Every screen is structured as:
```
Action (UA, Live Ops, Experiment, Release)
  → Intermediate metric change (retention, conversion, payer mix)
  → Investment metric change (payback, BEP, IRR, capital efficiency)
  → Current risk tolerance and decision recommendation
```

The product is an **investment decision translator**, not an analytics tool.

### 7.4 What This Product Deliberately Does NOT Do

- Does NOT build a full-stack A/B testing SDK (Statsig/Firebase already do this)
- Does NOT replace MMP attribution (AppsFlyer/Adjust already do this)
- Does NOT sell raw market data (Sensor Tower/AppMagic already do this)
- Does NOT build a data warehouse (Supabase/Databricks already do this)

Instead, it sits **above** all of these and translates their outputs into capital allocation decisions. This deliberate scoping enables a 2-person team to build a focused, high-value product.

### 7.5 Long-Term Vision

This business serves a dual purpose:
1. **Near-term**: SaaS revenue from investment decision support
2. **Long-term**: Foundation for building an internal game studio with a pre-built Decision OS

The founder's marketing + business development + data strategy background is a strength — the product is designed for business operators who ask "should we invest more?" not analysts who ask "what does the data show?"

---

## 8. AI & Technology Stack

### 8.1 Dual-Layer Prediction Architecture

Compass uses a two-layer prediction system that mirrors the data availability lifecycle:

**Layer 1: Parametric Retention Model (Early-Stage)**
- When: Soft-launch, D1-D7 data available
- Method: Power law curve fitting with genre-stratified benchmark bands
- Based on: The five retention properties and slope-based prediction methodology (Section 3.5)
- Output: Retention prediction bands with genre-prior confidence intervals
- Strength: Works with minimal data; interpretable; fast

**Layer 2: LSTM Deep Learning Model (Scale-Stage)**
- When: D14+ data available with sufficient cohort volume
- Method: Sequence-to-sequence LSTM with attention mechanism
- Input: Cohort retention sequences + genre benchmark + UA channel mix + market signals
- Architecture: 2× LSTM (128 units) → Attention → Bayesian head (Monte Carlo dropout)
- Output: D60-D365 retention with P10/P50/P90 credible intervals; per-user churn probability
- Strength: Captures non-linear behavioral patterns; individual-level prediction; adapts to live ops

**The two layers are complementary, not competing:**
- Layer 1 provides the Bayesian prior from market benchmarks and retention theory
- Layer 2 refines the posterior as internal behavioral data accumulates
- Transition from Layer 1 to Layer 2 is gradual and automatic based on data sufficiency

### 8.2 Bayesian Intelligence Engine
- Framework: NumPyro (JAX-based) for probabilistic programming — SVI for real-time, NUTS for batch
- Curve fitting: scipy.optimize.curve_fit + lmfit for Layer 1 parametric models
- Prior construction: Genre benchmark distributions from public benchmark reports (GameAnalytics, AppsFlyer, Unity)
- Posterior updating: Sequential Bayesian updating as customer's internal data arrives
- Scenario simulation: Monte Carlo methods (numpy + scipy.stats) for investment outcome modeling
- Uncertainty propagation: End-to-end uncertainty from retention → LTV → payback → decision
- A/B test translation: Custom Bayesian A/B on NumPyro — ATE → ΔLTV → Experiment ROI

### 8.3 LLM Integration Layer
- Auto-generated investment summaries in natural language
- Natural language query interface ("Should we increase UA spend on this title?")
- Anomaly explanation with context-aware recommendation engine

### 8.4 Technology Platform
- Frontend: Next.js 15 (App Router) + FSD 2.1 architecture + TypeScript
- State: TanStack Query v5 (server) + Zustand (client)
- Visualization: Recharts (P10/P50/P90 credible interval bands) + D3 (custom)
- Auth: Better Auth with Organization plugin (multi-tenant)
- Database: Supabase (PostgreSQL + RLS for tenant isolation)
- ML Service: FastAPI on GCP Cloud Run (inference separated from serving)
- Batch: GCP Cloud Run Jobs + Cloud Scheduler
- Cache: Upstash Redis
- ML Tracking: W&B (Weights & Biases) free tier
- Detailed specifications: See `Project_Compass_Tech_Stack.md`

### 8.4.1 Vercel 배포 가이드 (제출용 호스팅)

**현재 배포 상태**: GitHub 연동 완료, `git push` 시 자동 재배포

**Vercel 프로젝트 설정**:
- Git Repo: `mugungwhwa/project-compass`
- Root Directory: `compass`
- Framework: Next.js (자동 감지)
- Install Command Override: `npm install --legacy-peer-deps`
  - 이유: `@visx` 라이브러리가 peer dependency로 React 18만 명시하나 React 19에서 정상 동작. 클린 설치 시 peer conflict 방지.
- Build Command: `next build` (기본값)
- Node.js: Vercel 기본 (v20)

**배포 워크플로우**:
1. 로컬에서 변경 → `git push` → Vercel 자동 빌드 & 배포
2. 모든 페이지가 Static 빌드이므로 Hobby (무료) 플랜으로 충분

**주의사항**:
- 커밋되지 않은 변경사항은 Vercel에 반영되지 않음 — 반드시 push 후 확인
- 새 dependency 추가 시 `@visx`처럼 React 19 peer dependency 충돌 여부 확인 필요

### 8.5 External Platform Integration (Silo Bridging)

**Silo 2 — MMP (Attribution & UA):**
- AppsFlyer Cohort API (primary) — CPI, ROAS, cohort retention
- Adjust Report Service API (secondary) — D120 long-term cohorts
- Integration model: Customer-Authorized Agent pattern (customer provides API key)

**Silo 3 — Experimentation:**
- Statsig Console API (primary) — ATE, confidence intervals, rollout control
- Firebase BigQuery Connector (secondary)
- Lightweight experiment support for customers without A/B platforms (manual entry, Pre/Post CausalImpact, cohort comparison)

**Silo 4 — Financial & Revenue:**
- Tier 1 (MVP): Manual input — 5 metrics only (Monthly Revenue, UA Spend, Cash Balance, Monthly Burn, Target Payback)
- Tier 2 (Phase 2): Expanded manual — revenue breakdown, game-level costs, gross margin
- Tier 3 (Phase 3+): Accounting integration (QuickBooks/Xero auto-pull) when justified
- Input UX: Range input allowed ("$100K-$200K"), value-first onboarding (show benchmarks before requesting financials)
- Security: Company financials are trade secrets (부정경쟁방지법), not personal data (PIPA). AES-256 encryption, RLS isolation, audit trail mandatory.
- Reference: Visible.vc model — 3-minute structured data collection, progressive expansion

**Silo 1 — Market Intelligence:**
- NOT dependent on app intelligence platform crawling (legal risk — see `Project_Compass_Legal.md`)
- Phase 1: Public benchmark reports (GameAnalytics, AppsFlyer Index, Unity) as Bayesian prior
- Phase 2: Customer data → Bayesian posterior updating (network effect — improves with usage)
- Phase 3: App intelligence API partnership/licensing when platform scale justifies negotiation
- Legal compliance: See `Project_Compass_Legal.md` for detailed analysis

### 8.6 Market Intelligence Data Strategy

The Bayesian prior is constructed from legally compliant public sources, not from crawling proprietary platforms:

```
Layer 1: Public benchmarks → Genre-level D1/D7/D28 P10/P50/P90 bands (Prior)
Layer 2: Five Retention Properties → Curve shape constraints (b, c parameter ranges)
Layer 3: Customer actual cohort data → Bayesian posterior updating
Layer 4: Platform growth → App intelligence partnership/licensing (complement, not dependency)
```

This creates a **network effect**: each customer's data improves the genre benchmark for all customers.
The platform becomes more accurate as it grows — a defensible competitive moat.

---

## 9. Business Model

### 9.1 Revenue Phases

**Phase 1: Consulting-Led Validation (Year 1)**
- Handcrafted investment decision reports
- Monthly decision support retainer
- Pilot projects with early adopters
- Purpose: Validate framework, build case studies, refine product

**Phase 2: SaaS Platform (Year 2-3)**
- Platform subscription (per-title pricing)
- Seat-based access for team members
- Premium modeling add-ons (scenario simulation, advanced forecasting)
- Purpose: Repeatable, scalable revenue

**Phase 3: Enterprise (Year 3+)**
- Enterprise contracts with custom deployment
- API access for programmatic decision integration
- Data connector marketplace
- Strategic advisory powered by Compass intelligence
- Purpose: High-value, long-term relationships

### 9.2 Pricing Philosophy

Compass pricing reflects **value delivered**, not data volume. The product enables multi-million dollar capital allocation decisions — pricing is a fraction of the efficiency gains it creates.

---

## 10. Competitive Positioning

### 10.1 The Category Gap

No existing product combines market intelligence, operational data, experiment results, and financial modeling into a unified investment decision layer. This is a category creation opportunity.

### 10.2 Positioning Map

```
              High External + Internal Integration
                        ▲
                        │
    Sensor Tower  ●     │              ● COMPASS
    AppMagic      ●     │
                        │
◄───────────────────────┼────────────────────────►
Observation             │              Decision
                        │
         AppsFlyer  ●   │   ● Statsig
         Adjust     ●   │   ● Firebase
                        │
    Looker       ●      │
    Tableau       ●     │
                        │
                        ▼
              Low Integration / Single Silo
```

### 10.3 Relationship with Existing Tools

Compass is **complementary** to existing tools:
- Makes Sensor Tower/AppMagic data more valuable (connects to decisions)
- Makes AppsFlyer/Adjust data actionable (connects to investment outcomes)
- Makes Statsig/Firebase results meaningful (translates to capital value)
- Long-term: partnership or acquisition target for market intelligence companies

---

## 11. Target Users

### 11.1 Primary Users

| User | What They Need from Compass |
|---|---|
| Game Company CEO | "Should we invest more in this title?" |
| UA / Marketing Lead | "Is our acquisition spend justified by returns?" |
| Live Operations Head | "Which operational actions create the most investment value?" |
| Data Strategy Lead | "How do we connect our data to business decisions?" |
| CFO / Finance | "What is our true capital efficiency and payback trajectory?" |
| Publisher BD | "Which titles in our portfolio deserve more capital?" |

### 11.2 Design Principle

These users are **business operators**, not data analysts. They want investment guidance, not analytical dashboards. Every Compass interface must answer a question that starts with "Should we..." not "What happened..."

---

## 12. Market Opportunity

- **TAM**: $1.5-3B (capital allocation intelligence in mobile gaming)
- **SAM**: $100-300M (mid-to-large publishers, $10M+ revenue)
- **Target customers**: 800-1,500 companies globally
- **Average ACV**: $50-120K
- **Expansion potential**: Console/PC live-service, streaming, subscription businesses

**Note on market sizing**: The "Capital Allocation Intelligence" category does not yet exist, making TAM estimation inherently top-down. The $1.5-3B figure is derived from 1.5-3% of total mobile gaming industry spend ($90B+) that could be redirected through better decision infrastructure. This is a conservative estimate validated against adjacent market sizes (Sensor Tower ~$100M+, AppsFlyer ~$300M+, total gaming data ecosystem $1-2B).

**Key competitive consideration**: The most significant practical competitor is not another SaaS tool, but **internal BI teams** at large publishers who build similar functionality through spreadsheets and custom dashboards. Compass must demonstrate time-to-value and sophistication advantages that justify external procurement over internal build.

---

## 13. Go-to-Market Strategy

### Phase 1: Validation (Months 1-6)
- 20-30 operator interviews (focus: decision pain, not feature requests)
- 2-3 handcrafted report pilots
- Core validation question: "Did this change how you allocate capital?"

### Phase 2: Product-Market Fit (Months 6-18)
- MVP dashboard launch
- 5-10 paying customers
- APAC-first, expanding globally
- Case studies and thought leadership

### Phase 3: Scale (Months 18-36)
- Self-serve SaaS tier
- Enterprise sales
- NA/EU market expansion
- Partnership and integration programs

---

## 14. References

### Academic Literature
- Viljanen, M. & Airola, A. (2017). "Modelling User Retention in Mobile Games." IEEE Conference on Computational Intelligence and Games.
- Viljanen, M. et al. (2016). "User Activity Decay in Mobile Games Determined by Simple Differential Equations." ResearchGate.
- Jang, S. et al. (2021). "On Analyzing Churn Prediction in Mobile Games." arXiv:2104.05554.
- Rothenbuehler, P. et al. (2015). "Hidden Markov Models for Churn Prediction." Academia.edu.
- Chen, P. et al. (2018). "Customer Lifetime Value in Video Games Using Deep Learning." arXiv:1811.12799.

### Industry Sources
- Deconstructor of Fun (2020). "Long-Term Retention — Why D180 is the New D30."
- GoPractice. "The Importance of Long-Term Retention."
- GameAnalytics (2024). "Mobile Gaming Benchmarks Report."
- Valeev, R. (2018). "How to Make Retention Model and Calculate LTV for Mobile Game." Medium.
- Sequoia Capital. "Retention." Articles.

### Internal Research
- Retention Properties Theory (2021). Original formulation of the five retention properties and slope-based prediction methodology.
- Investment Decision OS Journey. Internal strategic document defining product vision and positioning. (Absorbed into this document — Sections 7.3-7.5)

### Legal Analysis
- Project Compass Legal Analysis (2026). API integration compliance, crawling risk assessment, Korean law considerations. See `Project_Compass_Legal.md`

---

## 15. Document Usage Guide

### Project Document Structure

| Document | Purpose | Audience |
|---|---|---|
| **CLAUDE.md** (this file) | Foundation — scientific methodology, product definition, all strategic decisions | AI agents, internal reference, source of truth |
| **Project_Compass_Business_Plan.md** | Investor/government-facing business case | External reviewers, 예비창업패키지 심사위원 |
| **Project_Compass_Tech_Stack.md** | Implementation specifications, role assignments, roadmap | Internal dev team (2-person) |
| **Project_Compass_Legal.md** | API integration + crawling legal analysis, compliance framework | Internal, lawyer review |
| **Project_Compass_Data_Sources_Guide.md** | 데이터 소스별 URL, API 사양, 저장 스키마, 수집 스케줄 | Internal dev team (실전 구현 참조) |
| **Project_Compass_Engine_Blueprint.md** | 통계/추론 엔진 구현 블루프린트 — 데이터→예측→번역→판정 전체 파이프라인 코드 | Internal dev team (구현 지침) |
| **Project_Compass_UI_Guide.md** | UI/UX 설계 지침 — 레이아웃, 시그널 시각화, 불확실성 표현, 모듈별 화면 가이드 | Frontend dev (디자인 참조) |
| **`.claude/skills/compass-dev/`** | 개발 오케스트레이션 — `/compass-dev` 명령으로 병렬 에이전트 디스패치 (SKILL.md + agents.md + tasks.md) | Claude Code 개발 세션 |
| **`.claude/skills/compass-verify/`** | 5-Point 검증 독립 스킬 — `/compass-verify` 명령으로 단독 검증 수행 | Claude Code 검증 세션 |

### For Business Reports
- Sections 1-6 provide the problem statement, scientific foundation, and solution framework
- Section 3 (Retention Theory) provides peer-reviewed academic backing for the core methodology
- Section 4 (Bayesian Framework) establishes the technical credibility of the approach

### For Government Support Programs
- Section 2 (Data Silos) articulates the market problem and industry need
- Section 3.7 (Validation Status) provides evidence-based credibility
- Section 8 (AI Technology) demonstrates technical innovation and R&D depth
- Section 12 (Market Opportunity) supports economic impact arguments
- Section 14 (References) provides academic and industry citations for claims

### For Product Development
- Section 7 (Product Architecture) defines the module structure + product philosophy
- Section 8 (Technology Stack) specifies the implementation approach — details in `Project_Compass_Tech_Stack.md`
- Section 3.5-3.6 (Prediction Methodology) guides the retention model implementation
- Section 6 (Experiment Translation) defines the A/B test → investment pipeline
- Section 8.5-8.6 (External Integration + Data Strategy) defines silo bridging and legal compliance

### For Investor Communications
- Section 1 (Identity) provides the elevator pitch
- Section 10 (Competitive Positioning) establishes the category gap
- Section 4.1 (Bayesian Framework) differentiates the approach from generic analytics
- Section 9 (Business Model) outlines the revenue path

### For Legal Review
- Section 8.5 (External Platform Integration) outlines the integration model
- Section 8.6 (Market Intelligence Data Strategy) explains data sourcing compliance
- `Project_Compass_Legal.md` provides detailed legal analysis, Korean law, and action items
