# yieldo — Technical Whitepaper

**Version**: 1.0 (compressed external draft)
**Date**: 2026-05-03
**Audience**: Investors, technology partners, technical evaluators
**Source**: Compressed extract from `Project_Yieldo_Technical_Moat_and_Pipeline.md` (Korean, internal). For deeper detail, request the full document.

---

## 1. What yieldo Is

**yieldo is the Decision Operating System for mobile gaming capital allocation.** It is not an analytics dashboard. It answers a single, structurally underserved question for game operators and publishers: *"Should we invest more, and how much?"*

Mobile gaming is a pre-investment industry. Development, user acquisition, and live operations costs are committed before revenue signals exist. Recovery stretches over months or years through LTV monetization. This creates a perpetual capital allocation dilemma — one that today is resolved through manual synthesis across four disconnected data silos:

| Silo | Existing tools | Question they answer | Question they leave open |
|---|---|---|---|
| Market Intelligence | Sensor Tower, AppMagic | "What does the market look like?" | "Does this market justify our investment?" |
| Attribution & UA | AppsFlyer, Adjust | "Where do users come from? At what cost?" | "Is the cost justified by long-term return?" |
| Experimentation | Statsig, Optimizely | "Which variant won?" | "How much investment value did this create?" |
| Financial | ERP, spreadsheets | "What is our current position?" | "Should we invest more?" |

yieldo sits **above** these tools and translates their outputs into capital allocation decisions. It does not replace any of them.

---

## 2. The Seven Moats

| # | Moat | Tier | One-line claim |
|---|---|---|---|
| 1 | **Theory Authority** | Scientific fact | Five Retention Properties — internally formalized 2021, externally cross-validated by 2017–2024 academic literature |
| 2 | **Mathematical Closure** | Mathematical theorem | Power-law retention + monotone convergence theorem mathematically guarantees the asymptotic floor — LTV integration boundary is *defined*, not estimated |
| 3 | **Bayesian Decision Framework** | Architectural | Market prior + internal likelihood → posterior. Point-estimate output is prohibited at the API level. Hallucination surface area approaches zero |
| 4 | **Deterministic ATE → ΔIRR Translation** | Mathematical | Experiment outcome → capital impact is a pure deterministic chain. LLMs cannot fabricate values they are not authorized to generate |
| 5 | **Bayesian Network Effect** | Architectural | Each customer's data tightens genre-level priors. Time itself becomes the moat — late entrants cannot catch up |
| 6 | **Category Creation** | Strategic | "Capital Allocation Intelligence" is not a category that exists. yieldo defines the coordinate system, not just a position within it |
| 7 | **Honesty as Positioning** | Strategic | Internal BI teams cannot ship uncertainty disclosure under executive pressure. Only an external SaaS can institutionalize "we tell you what we don't know" |

The first four are technical. The last three are strategic consequences of the first four.

---

## 3. Scientific Foundation

### 3.1 Why Retention Is the Central Variable

Every economic flow in mobile gaming passes through retention:

```
Retention(t) → DAU(t) → ARPDAU(t) → Daily Revenue(t) → LTV → Payback → Investment Decision
```

Predict retention with bounded uncertainty, and you can predict the investment outcome.

### 3.2 The Five Retention Properties

Originally formalized in 2021 from mobile gaming portfolio operations, subsequently cross-validated against academic literature (Viljanen & Airola 2017, GameAnalytics 2024 benchmarks, Deconstructor of Fun 2020):

| # | Property | Mechanism | External validation |
|---|---|---|---|
| P1 | **Monotonic Non-Increase** — cohort retention at day N cannot exceed day N-1 | Mathematical guarantee from definition | Universal in survival analysis |
| P2 | **Sequential Dependency** — each day's retention is influenced by the prior day's state | Markov chain / HMM frameworks | Rothenbuehler 2015, Jang 2021 |
| P3 | **Temporal Decrease** — retention decreases as a population-level regularity | Heterogeneous user filtering | GameAnalytics 2024: D1=22.91%, D7=4.2%, D28=0.85% (median across thousands of games) |
| P4 | **Decelerating Decline** — the rate of decrease slows over time | Self-selection: survivors have lower churn probability | "Decreasing hazard rate" in survival analysis (Viljanen 2017) |
| P5 | **Asymptotic Stabilization** — P1 + P4 → curve converges to a horizontal floor | Monotone convergence theorem | "Curve flattens out in D30-D60" (Deconstructor of Fun 2020) |

### 3.3 Mathematical Framework

The retention curve is modeled by a power-law decay:

$$R(t) = a \cdot t^b, \quad b \in (-1, 0)$$

For games with strong core engagement, the shifted form fits better:

$$R(t) = a \cdot t^b + c, \quad c > 0$$

Here $c$ is the asymptotic floor of P5 — the game's stable core user population. Its existence is not assumed; it is **proven by the monotone convergence theorem** applied to P1 and P4.

### 3.4 Why the Asymptotic Floor Matters Economically

LTV is an integral:

$$\text{LTV} = \int_{0}^{T^*} R(t) \cdot \text{ARPDAU}(t) \, dt$$

If $T^*$ is chosen arbitrarily, LTV is arbitrary. yieldo's **asymptotic arrival detection** provides $T^*$ as a *mathematically determined* quantity. This is the structural reason yieldo's LTV estimates differ from those of other tools — the integration boundary is defined, not fudged.

### 3.5 Slope-Based Prediction (Internal IP)

Once D2-D7 retention is observed, yieldo compares the *slope* against genre-stratified benchmark bands. When slope rank and band rank align, the long-term projection is adopted directly. When they diverge, a calibrated rule applies:

| Band Position | Asymptotic Arrival | Adopted Projection |
|---|---|---|
| Lower tier | Early arrival (fast stabilization) | **Upper tier** — early stabilization signals strong core engagement |
| Upper tier | Late arrival (slow stabilization) | **Lower tier** — high initial retention with slow stabilization signals weak core |
| Aligned | Aligned | Adopt directly |

The shape of the curve matters more than any single data point. This integrated methodology — five properties + slope-based prediction + asymptotic detection — does not exist in packaged form in academic literature.

### 3.6 Validation Status

| Claim | Status | Evidence |
|---|---|---|
| Five Properties (P1–P5) | Confirmed | Viljanen & Airola 2017; GameAnalytics 2024; Deconstructor of Fun 2020 |
| Power-law model fit | Confirmed | Valeev 2018; Viljanen et al. 2016 |
| D7 → D180 predictive power (genre-stratified) | Confirmed (~50% variance explained — genre control mandatory) | Academic consensus |
| D30 → D180 predictive power | Confirmed (~80% variance explained) | Academic consensus |
| Asymptotic floor existence (top-grossing) | Confirmed | GoPractice; Deconstructor of Fun; GameAnalytics |
| Slope-band alignment rules | Internal IP | yieldo operational synthesis |

---

## 4. Inference Engine

### 4.1 Bayesian Framework

$$\underbrace{P(\theta)}_{\text{Prior}} \times \underbrace{P(D | \theta)}_{\text{Likelihood}} \propto \underbrace{P(\theta | D)}_{\text{Posterior}}$$

| Component | Source | Role |
|---|---|---|
| Prior | Genre benchmarks, competitive distributions, market saturation, UA cost trends | Initial belief from market intelligence |
| Likelihood | Cohort retention curves, UA performance, experiment ATEs, financial actuals | Internal evidence |
| Posterior | Investment decision with credible intervals | Output: decision-grade quantified uncertainty |

### 4.2 Dual-Layer Prediction

| Layer | Stage | Method | Output |
|---|---|---|---|
| **Layer 1** | Soft launch, D1–D7 | Power-law curve fit + genre-stratified bands (`scipy.optimize.curve_fit`, `lmfit`) | Retention prediction with prior-derived credible intervals |
| **Layer 2** | D14+ scale stage | Sequence-to-sequence LSTM (2×128) + Attention + Bayesian head (Monte Carlo dropout) | D60–D365 retention with P10/P50/P90 + per-user churn probability |

The layers are complementary, not competing. Layer 1 supplies the prior; Layer 2 refines the posterior as behavioral data accumulates. The transition is gradual and automatic based on data sufficiency.

### 4.3 The Hallucination-Immune Translation

Existing experimentation platforms report statistical results: *"Treatment improved D7 retention by +3.7pp (p < 0.05)."* yieldo translates this into investment language through a **deterministic chain**:

```
ATE  →  ΔRetention(d) ∀ d  →  ΔLTV  →  ΔAnnual Revenue
                                       →  ΔPayback
                                       →  ΔIRR
                                       →  Experiment ROI
```

| Transformation | Type | Model degrees of freedom |
|---|---|---|
| ATE → ΔRetention(d) | Layer 1/2 model evaluation | Determined by model parameters |
| ΔRetention(d) → ΔLTV | Numerical integration | 0 — input function fixes output |
| ΔLTV → ΔAnnual Revenue | Scalar multiplication | 0 |
| ΔAnnual Revenue → ΔPayback | Cumulative sum threshold | 0 |
| ΔPayback → ΔIRR | NPV = 0 root finding | 0 (unique root on convergence) |

There is no architectural surface where an LLM can fabricate values. **This determinism is the core of yieldo's hallucination immunity.** LLMs are restricted to translating numerical posteriors into prose; they never generate the numbers themselves.

### 4.4 Architecture-Level Uncertainty Enforcement

This is the structural differentiator that competitors cannot easily copy:

```
Prohibited:    "D30 retention = 8.5%"
Prohibited:    "LTV = $4.2M"
Prohibited:    "Recommended UA spend: $500K"

Required:      "D30 retention ∈ [7.2%, 10.1%], 90% CI, Confidence Tier B"
Required:      "LTV ∈ [$3.1M, $5.8M], 90% CI, Confidence Tier B (D14 data sparse)"
Required:      "Recommend $500K UA, decision confidence 0.74"
```

Point-estimate API endpoints are not implemented in the system. The hallucination surface area approaches zero by construction. Competitors who wish to claim the same positioning must remove every point-estimate endpoint from their own products — a costly, architecturally invasive change.

A four-tier **confidence rating** system (A / B / C / no-data) is mandatory in every output. Sparse-data regions are explicitly tagged *"prior dominant — more internal data needed."*

---

## 5. Pipeline & Integrations

### 5.1 Three-Layer Storage

| Layer | Role | Latency | Examples |
|---|---|---|---|
| L1 — Supabase Postgres (HOT) | Source of truth — identity, cohort retention, encrypted financials, experiment metadata, audit log | <50ms | All transactional data |
| L2 — Upstash Redis (CACHE) | Hot-path response cache, fully reconstructable from L1 | <10ms | Prediction bands, dashboard payloads |
| L3 — GCS (COLD) | Raw archive, ML training corpus, 7-year audit retention | 100ms – 5s | MMP raw dumps, audit log archives, model checkpoints |

**Databricks is deliberately not adopted.** yieldo is a translation layer, not a data warehouse. Daily raw event volume is ~1MB/month, not 10TB. Adoption gate: 100+ active tenants AND 10TB+/month raw event volume AND distributed compute mandated. Currently 0/3.

### 5.2 Customer-Authorized Agent Pattern

```
Platform ─(API contract)─→ Customer ─(API key delegation)─→ yieldo
```

yieldo's API access is *derived* from the customer's rights. The customer's act of providing an API key, combined with explicit MSA consent, constitutes legal delegation. This is the standard pattern used by Zapier, Segment, Fivetran, and Singular. Supporting case law: *Van Buren v. US* (2021), *hiQ v. LinkedIn* (2022).

For market intelligence (Silo 1), yieldo does **not** scrape third-party platforms (Sensor Tower, AppMagic). Instead, public benchmark reports (GameAnalytics, Unity, AppsFlyer Index) form the initial Bayesian prior, and customer data progressively refines it (the network effect of §6).

### 5.3 Korean Legal Compliance

Customer financial data is treated as a *trade secret* under Korea's Unfair Competition Prevention Act (not as personal data under PIPA, which does not apply to corporate financials). Required protections: AES-256 column encryption, Supabase RLS-enforced tenant isolation, full audit trail, and explicit prohibition of cross-customer aggregation in MSA.

---

## 6. The Bayesian Network Effect

```
Year 1 (10 customers):    Prior wide variance       ─────────────────
Year 2 (50 customers):    Tightening               ───────────────
Year 3 (200 customers):   Genre prior precise      ────────────
Year 5 (1,000 customers): Prior > public benchmark ─────
```

Each new customer's behavioral data tightens genre-level priors. The aggregation of *retention distributions* (not customer-identifiable data) is legally permissible — distinct from financial aggregation, which is contractually prohibited. Once yieldo's prior precision exceeds publicly available benchmarks, the platform delivers value that *cannot be obtained anywhere else*. This is a compounding moat: time itself becomes the asset.

No competitor has equivalent network-effect structure:

| Competitor | Aggregated genre prior? | Reason |
|---|---|---|
| Sensor Tower / AppMagic | Partial — market-level only | Decision data not collected |
| AppsFlyer / Adjust | None | Single-customer scope |
| Statsig / Optimizely | None | Per-customer experiment isolation |
| Internal BI teams | Impossible | Single-company data only |
| **yieldo** | **Yes** | Genre prior is legitimately aggregable |

---

## 7. Competitive Positioning

### 7.1 What Internal BI Teams Cannot Build

The largest competitor is not another SaaS. It is the internal BI team at a major publisher, equipped with spreadsheets, Looker, and a custom dashboard. They can replicate ~70% of yieldo's surface features.

What they **cannot** do is institutionalize uncertainty disclosure under executive pressure. Executives demand point estimates. Analysts lack the political capital to refuse. Confidence intervals get pushed to slide appendices, then quietly dropped from board reports. This is not a technical limitation — it is an organizational one. Only an *external* SaaS can architect honesty into the product itself.

### 7.2 Positioning Map

```
                  High External + Internal Integration
                              ▲
                              │
      Sensor Tower   ●        │              ● yieldo
      AppMagic       ●        │
                              │
   ◄──────────────────────────┼─────────────────────────────►
   Observation                │              Decision
                              │
              AppsFlyer  ●    │   ● Statsig
              Adjust     ●    │   ● Firebase
                              │
        Looker       ●        │
        Tableau      ●        │
                              │
                              ▼
                  Low Integration / Single Silo
```

The upper-right quadrant is empty. yieldo defines a coordinate system (translation layer above silos) before claiming a position within it.

### 7.3 Honesty as Positioning Asset

| Industry default | yieldo |
|---|---|
| Point estimate = signal of confidence | Credible interval = signal of confidence |
| Uncertainty = weakness (hidden) | Uncertainty = honesty (surfaced) |
| Recommendations are assertions | Recommendations carry decision confidence scores |
| AI delivers *answers* | AI delivers *distributions* |

This is not a marketing tagline. It is a structural consequence of the architecture-level prohibition described in §4.4. A competitor wishing to claim this positioning must rebuild their own product to remove every point-estimate endpoint — an architecturally invasive, multi-quarter undertaking.

---

## 8. Implementation Status (Honest Disclosure)

As of 2026-05-03, the public technology stack is at the following maturity level:

| Layer | Status |
|---|---|
| Frontend (Next.js 16, FSD architecture, dashboards, charts) | ~80% — working, deployed |
| AppsFlyer Pull API integration | Working — live cohort sync |
| Python ML service (FastAPI, NumPyro, scipy, LSTM) | 0% — design complete, implementation pending |
| Supabase database + RLS | 0% — schema designed, deployment pending |
| Multi-tenant authentication | 0% — pending |
| Adjust / Statsig / Firebase / accounting integrations | Catalog only — implementation pending |

**This disclosure is deliberate.** The scientific foundations of §3 and the inference framework of §4 are *true regardless of implementation* — they do not depend on code being written today. The architecture of §5–§6 is a credible blueprint with partial realization. The implementation gap of §8 is a near-term execution risk, not an existential one.

We disclose this gap rather than hide it because the same honesty discipline that powers the product (§4.4, §7.3) must extend to how we describe it. A reviewer who discovers the gap after the fact loses confidence in everything else. A reviewer who is told the gap upfront, alongside a credible roadmap, gains confidence in the team's discipline.

Near-term execution roadmap:
- **Week 1**: Supabase schema + RLS + first migration
- **Week 2**: Authentication + Organization plugin integration
- **Week 3**: Python ML service skeleton — FastAPI on Cloud Run with one power-law fit endpoint
- **Week 4**: First end-to-end posterior demo — AppsFlyer cohort → Layer 1 fit → P10/P50/P90 output

---

## 9. Summary

yieldo's defensibility rests on three structurally combined layers:

1. **Theoretical authority** — five retention properties internally formalized in 2021, cross-validated by subsequent academic literature, integrated with slope-based prediction methodology that does not exist in packaged form elsewhere.
2. **Architectural discipline** — Bayesian framework with point-estimate prohibition at the API level. Hallucination-immune deterministic translation from experiment outcomes to capital allocation decisions.
3. **Strategic consequence** — category creation (Decision Operating System), Bayesian network effect (time as moat), honesty positioning (only external SaaS can institutionalize it).

The first two are mathematical and architectural facts — they do not depend on adoption or scale. The third compounds with adoption. yieldo is a company designed to become more defensible as time passes, not less.

---

## Appendix — References

**Academic**
- Viljanen, M. & Airola, A. (2017). *Modelling User Retention in Mobile Games.* IEEE CIG.
- Viljanen, M. et al. (2016). *User Activity Decay in Mobile Games.*
- Jang, S. et al. (2021). *On Analyzing Churn Prediction in Mobile Games.* arXiv:2104.05554.
- Rothenbuehler, P. et al. (2015). *Hidden Markov Models for Churn Prediction.*
- Chen, P. et al. (2018). *Customer Lifetime Value in Video Games Using Deep Learning.* arXiv:1811.12799.

**Industry**
- Deconstructor of Fun (2020). *Long-Term Retention — Why D180 is the New D30.*
- GoPractice. *The Importance of Long-Term Retention.*
- GameAnalytics (2024). *Mobile Gaming Benchmarks Report.*
- Valeev, R. (2018). *How to Make Retention Model and Calculate LTV for Mobile Game.*

**Legal precedent (Customer-Authorized Agent pattern)**
- *Van Buren v. United States* (2021).
- *hiQ Labs v. LinkedIn* (2022).

---

**Contact** | mike@yieldo.com (placeholder)
**Internal source document** | `Project_Yieldo_Technical_Moat_and_Pipeline.md` (Korean, 1008 lines)

*This whitepaper is a compressed extract. Section depth and methodological detail are available on request.*
