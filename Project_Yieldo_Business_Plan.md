# yieldo

## Signal-to-Yield Operating Terminal for the Mobile Gaming Industry

### Business Plan

**Confidential**
Prepared: March 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [The Problem](#2-the-problem)
3. [The Solution: yieldo](#3-the-solution-project-yieldo)
4. [Why Now](#4-why-now)
5. [Market Opportunity](#5-market-opportunity)
6. [Product Overview](#6-product-overview)
7. [Core Metrics & Intelligence Engine](#7-core-metrics--intelligence-engine)
8. [Technology & Data Architecture](#8-technology--data-architecture)
9. [Business Model](#9-business-model)
10. [Competitive Landscape](#10-competitive-landscape)
11. [Go-to-Market Strategy](#11-go-to-market-strategy)
12. [Team](#12-team)
13. [Milestones & Roadmap](#13-milestones--roadmap)
14. [Financial Projections](#14-financial-projections)
15. [The Ask](#15-the-ask)
16. [Long-Term Vision](#16-long-term-vision)
17. [Appendix](#17-appendix)

---

## 1. Executive Summary

The mobile gaming industry generates over $90 billion annually, yet the operators who deploy capital into these games — CEOs, UA leads, live operations heads, and CFOs — cannot answer the most fundamental question in their business:

**"Which interventions are actually creating investable growth?"**

Today, teams run A/B tests and live game interventions constantly — but the results are never translated into capital decisions. Experimentation platforms (Statsig, LaunchDarkly) report that a variant won. Attribution platforms (AppsFlyer, Adjust) report where users came from. But no tool connects those results to LTV impact, payback shift, or capital allocation guidance. **Teams know experiment winners, but not investment winners.** A/B tools tell teams what won, but not whether it created investment value. Live game iteration lacks an operating system linking intervention to LTV.

**yieldo** is the world's first **Experiment-to-Investment Decision Operating System** for the mobile gaming industry. It sits above existing tools and translates every intervention — A/B test result, live ops event, UA change, feature release — into investment language: ΔLTV, payback shift, and capital allocation guidance. yieldo does not merely evaluate whether a game deserves more capital. It measures whether ongoing game interventions are creating the conditions that justify more capital.

**We are not building another analytics tool. We are building the intervention-to-investment translation layer that the industry has never had.**

### Key Highlights

| | |
|---|---|
| **Product** | Signal-to-Yield Operating Terminal for mobile game operators |
| **Category** | Intervention-to-Investment Intelligence (new category) |
| **Target Users** | Game company CEOs, UA/Marketing leads, Live Ops heads, CFOs, BD teams |
| **Positioning** | Translates interventions and experiment outcomes into Capital Allocation Intelligence |
| **Differentiation** | No existing product connects A/B test results, live ops actions, and UA changes to LTV impact and investment decisions |
| **Team** | Former Treenod Data Team — deep domain expertise in mobile gaming data strategy and operations |
| **Revenue Model** | Consulting-led entry → SaaS subscription → Enterprise contracts |

---

## 2. The Problem

### 2.1 The Structural Challenge of Mobile Gaming

Mobile gaming is a **capital-intensive, pre-investment industry** by nature:

- **Development costs** are paid upfront before any revenue is generated
- **User acquisition (UA) budgets** are deployed before payback is realized
- **Live operations costs** are ongoing with long-tail revenue recovery
- **Revenue recovery** stretches over months or years through LTV monetization

This structure creates a perpetual dilemma for every game operator:

> How much loss can we tolerate? How far should we push before pulling back? Is the data telling us to invest more — or to stop?

### 2.2 The Data Fragmentation Problem

The modern mobile gaming company has access to more data than ever. But that data lives in silos:

| Data Type | Source | What It Tells You |
|---|---|---|
| Market Intelligence | Sensor Tower, AppMagic | What the market looks like |
| Attribution & UA | AppsFlyer, Adjust, Singular | Where users come from |
| Experimentation | Statsig, Optimizely, Firebase | What variants perform better |
| Data Infrastructure | Databricks, Snowflake, BigQuery | Where data is stored |
| Financial Data | Internal spreadsheets, ERP systems | What the P&L looks like |

Each tool answers a narrow question. **No tool answers the investment question.**

### 2.3 The Experiment-to-Investment Gap

The deepest problem is not simply data fragmentation — it is that **experiment winners are never translated into investment winners**.

- **Teams know experiment winners, but not investment winners.** A variant that improves D7 retention by +3.7pp is a statistical result. What it means for LTV, payback period, and whether to increase UA spend is a different question entirely — one that no current tool answers.
- **A/B tools tell teams what won, but not whether it created investment value.** Statsig shows significance. It does not show ΔLTV, payback shift, or experiment ROI.
- **Live game iteration lacks an operating system linking intervention to LTV.** Every balance patch, live ops event, and feature release changes the game's economics. That change is never measured in investment terms.

The missing chain is: **Intervention → Signal Change → ΔLTV → Payback Shift → Decision**

### 2.4 The Questions That Remain Unanswered

Every day, game operators ask questions that none of their current tools can answer:

1. **"Should we invest more capital into this game right now?"**
   - Requires combining market saturation signals, internal UA efficiency, LTV forecasts, and burn tolerance — data that lives in 4+ different systems.

2. **"Is our live operations effort actually creating investment value?"**
   - Requires linking specific operational actions (balance patches, content updates, events) to downstream LTV, retention, and payback changes.

3. **"Are our experiments actually improving our competitive position?"**
   - Requires measuring not just win rate, but experiment velocity, ship rate, time-to-decision, and the cumulative contribution to capital efficiency.

4. **"Should we keep burning cash, or is it time to cut?"**
   - Requires a risk framework that combines market opportunity, internal execution speed, and financial tolerance — a framework that simply does not exist today.

5. **"How do we compare to the market, and does that comparison justify our current spend?"**
   - Requires overlaying external benchmarks with internal performance and translating the gap into actionable investment guidance.

### 2.5 The Cost of This Problem

Without an integrated decision layer, game operators resort to:

- **Gut-feel decisions** on multi-million dollar capital allocation
- **Over-investment** in games that should have been scaled back
- **Under-investment** in games that had untapped growth potential
- **Delayed decisions** that miss critical market windows
- **Post-mortem analysis** instead of real-time investment guidance

The result: billions of dollars in misallocated capital across the industry every year.

---

## 3. The Solution: yieldo

### 3.1 One-Line Definition

**yieldo translates every game intervention — experiment result, live ops action, UA change, feature release — into capital allocation intelligence. It is the Signal-to-Yield Operating Terminal for the mobile gaming industry.**

### 3.2 What yieldo Does

yieldo is not an analytics dashboard. It is an **operating system for intervention-to-investment decisions**. The core translation chain that yieldo executes for every intervention is:

```
Intervention (A/B test, live ops event, UA change, feature release)
    → Signal Change (retention shift, conversion change, payer mix)
    → ΔLTV (per-user lifetime value impact with credible intervals)
    → Payback Shift (days earlier or later to break even)
    → Decision (invest more / hold / reduce / pivot)
```

This chain is what every existing tool fails to complete. yieldo exists to close it.

More specifically, yieldo:

1. **Integrates** data from multiple sources:
   - External market data (Sensor Tower, AppMagic)
   - Internal operational data (revenue, cohorts, UA, ROAS, retention, live ops logs)
   - Experiment results (A/B test outcomes, feature rollouts, deployment logs)
   - Financial parameters (CAC, gross margin, payback targets, BEP, IRR, budgets)

2. **Models** the relationships between actions and outcomes:
   - Bayesian updating with external market priors and internal observed posteriors
   - LTV and retention forecasting
   - Saturation signal detection
   - Scenario simulation with uncertainty quantification

3. **Translates** everything into investment language:
   - "You can invest $X more with Y% confidence of payback within Z months"
   - "This action contributed $X to expected LTV per user"
   - "Your experiment velocity is generating $X in annualized capital efficiency gains"
   - "Market saturation signals suggest reducing spend by X% over the next quarter"

### 3.3 What yieldo Does NOT Do

yieldo deliberately avoids competing with existing best-in-class tools:

| We Do NOT Build | Why |
|---|---|
| Raw market data collection | Sensor Tower / AppMagic already excel here |
| Mobile attribution SDK | AppsFlyer / Adjust own this layer |
| Full-stack A/B testing engine | Statsig / LaunchDarkly / Firebase handle execution |
| Data warehouse infrastructure | Databricks / Snowflake serve this need |
| Generic BI dashboards | Looker / Tableau already exist |

Instead, yieldo is the **translation layer** that sits above all of these and converts their outputs into capital allocation decisions.

### 3.4 Core Philosophy: Intervention Over Observation

Traditional analytics answers: *"What happened?"*
yieldo answers: **"What intervention drives what investment outcome?"**

Every screen in yieldo is structured as:

```
Action (UA spend, live ops event, balance patch, A/B result, feature release)
    ↓
Intermediate Signal Change (retention, conversion, payer mix, spend depth)
    ↓
Investment Metric Impact (payback, BEP trajectory, IRR, capital efficiency)
    ↓
Decision Guidance (invest more / hold / reduce / pivot)
```

This is not a dashboard. It is a **decision machine**.

---

## 4. Why Now

### 4.1 Market Maturity Creates Demand

The mobile gaming market has matured past the era of "launch and hope." Growth now comes from **operational excellence** — and operational excellence requires capital allocation discipline. As competition intensifies, the margin for error in investment decisions shrinks. Game operators can no longer afford to allocate capital based on intuition.

### 4.2 Data Infrastructure is Finally Ready

Five years ago, building an integrated decision layer would have required constructing the entire data stack from scratch. Today, the building blocks exist:

- Market intelligence APIs are mature and accessible
- Attribution data is standardized through MMP platforms
- Cloud data warehouses enable real-time data integration
- Bayesian and ML modeling tools are production-ready

The infrastructure layer is built. **The intelligence layer is missing.**

### 4.3 The AI Inflection Point

Modern AI and machine learning capabilities enable:

- Real-time Bayesian belief updating across data sources
- Natural language interpretation of complex investment scenarios
- Automated anomaly detection across market and internal signals
- Scenario simulation at speeds previously impossible

These capabilities make a product like yieldo viable for the first time.

### 4.4 Industry Consolidation Creates Urgency

The mobile gaming industry is consolidating. Larger publishers are acquiring studios, and studios need to demonstrate capital efficiency to attract investment or acquisition offers. A standardized investment decision framework becomes a competitive necessity — not a luxury.

---

## 5. Market Opportunity

### 5.1 Total Addressable Market (TAM)

The global mobile gaming market exceeds **$90 billion** in annual revenue (2025). Within this market, game operators collectively spend:

- **$30B+** annually on user acquisition
- **$5B+** on live operations and content updates
- **$2B+** on data and analytics tools

The investment decision layer touches all of these spend categories. The TAM for capital allocation intelligence in mobile gaming is estimated at **$1.5-3 billion**, based on the premise that 1.5-3% of total industry spend could be redirected through better decision infrastructure.

### 5.2 Serviceable Addressable Market (SAM)

Focusing on mid-to-large mobile game publishers and studios (annual revenue $10M+) who:

- Operate multiple live titles simultaneously
- Maintain dedicated UA and data teams
- Spend $1M+ annually on data and analytics tools

This segment represents approximately **800-1,500 companies globally**, with an average potential contract value of **$50K-$120K annually**, yielding a SAM of **$100-300M**.

### 5.3 Serviceable Obtainable Market (SOM)

In the first 3 years, targeting:

- **Year 1**: 5-10 pilot customers (Asia-Pacific focus, leveraging Treenod network)
- **Year 2**: 20-40 customers (expansion to Western markets)
- **Year 3**: 50-100 customers (enterprise tier + self-serve SaaS)

Projected Year 3 ARR: **$5M-$15M**

### 5.4 Market Expansion Potential

Beyond mobile gaming, the Operating Intelligence Terminal model applies to:

- **Console/PC gaming** publishers with live-service models
- **Digital entertainment** (streaming, social media apps) with similar UA/LTV economics
- **Any subscription business** with high upfront acquisition costs and long payback periods

---

## 6. Product Overview

### 6.1 Product Architecture

yieldo is organized into five core modules, each designed around a specific decision need:

#### Module 1: Executive Overview — "Can We Invest More?" *(Summary Layer)*

The summary layer that surfaces what the value creation modules have measured. It does not generate insight independently — it aggregates signals from Modules 3 and 4 into a single investment stance.

- **Investment Status Indicator**: Real-time Green/Yellow/Red assessment synthesized from intervention impact and experiment ROI signals
- **Burn Tolerance Window**: How much runway remains at current spend rates, and what the risk threshold looks like
- **Payback Forecast**: Projected time to recover current investments, with P10/P50/P90 confidence intervals
- **Key Risks & Opportunities**: AI-generated summary of the top factors affecting investment decisions today, anchored to specific interventions

#### Module 2: Market vs. Internal Gap — "Where Do We Stand?"

Contextualizes internal performance against external market reality.

- **Benchmark Positioning**: Current retention, revenue, and UA metrics vs. genre/market averages
- **Competitive Gap Analysis**: Head-to-head comparison with specific competitor titles
- **Market Saturation Signals**: Indicators of genre crowding, declining UA efficiency, or emerging whitespace
- **Growth Headroom Assessment**: Estimated remaining growth potential given market conditions

#### Module 3: Action Impact Board — "What's Actually Working?" *(Value Creation Layer)*

The primary value creation module. Connects every operational action to its investment outcome, completing the chain: **Intervention → Signal Change → ΔLTV → Payback Shift**.

- **Action Timeline**: Chronological log of all interventions (UA changes, live ops events, feature releases, balance patches)
- **Impact Attribution**: Estimated ΔLTV and payback shift per action, with uncertainty bands
- **Expected vs. Actual**: Comparison of predicted investment impact (pre-action) with observed results (post-action)
- **Cumulative Action Value**: Running total of investment value generated by operational interventions

This module answers a question no existing tool answers: *"Which specific actions moved our LTV and by how much?"*

#### Module 4: Experiment Investment Board — "Is Our R&D Paying Off?" *(Value Creation Layer)*

The second primary value creation module. Translates every A/B test and experiment outcome from statistical language into investment language: **ATE → ΔLTV → Experiment ROI**.

- **Experiment Velocity**: Number of experiments completed per time period
- **Ship Rate**: Percentage of experiments that resulted in production rollouts
- **Win Rate**: Percentage of experiments that showed statistically significant positive results
- **Time-to-Decision**: Average time from experiment start to go/no-go decision
- **LTV Contribution**: Estimated ΔLTV per shipped experiment, translated from ATE with credible intervals
- **Experiment ROI**: (ΔAnnual Revenue from shipped winners) / (Experiment operating cost)
- **Learning Efficiency**: Value of knowledge gained even from "failed" experiments

This module answers a question no A/B platform answers: *"Did this experiment winner create investment value — and how much?"*

#### Module 5: Capital Allocation Console — "What Should We Do Next?"

The decision-making cockpit.

- **Available Investment Budget**: Remaining deployable capital with risk-adjusted recommendations
- **Risk Boundaries**: Visual representation of tolerance ranges and current position
- **Scenario Simulator**: Model different investment scenarios and see projected BEP/IRR changes
- **Recommended Next Actions**: AI-powered prioritized list of highest-impact interventions
- **Decision Confidence Score**: Quantified confidence level for each recommendation

### 6.2 User Experience Philosophy

yieldo is designed for **business operators, not data analysts**. Every interface element follows three rules:

1. **Decision-first**: Every screen starts with the decision it enables, not the data behind it
2. **Action-linked**: Every metric is connected to a specific action that can change it
3. **Uncertainty-honest**: Every forecast includes confidence intervals and risk ranges — no false precision

---

## 7. Core Metrics & Intelligence Engine

### 7.1 Investment Metrics

| Metric | Description | Decision It Enables |
|---|---|---|
| Payback Period | Time to recover invested capital | "How long until we break even?" |
| BEP Trajectory | Projected path to break-even point | "Are we on track or drifting?" |
| IRR Estimate | Internal rate of return on game investment | "Is this investment competitive vs. alternatives?" |
| Capital Efficiency Score | Revenue generated per dollar invested | "How productive is our spending?" |
| Burn Tolerance Window | Remaining time at current loss rate | "How long can we sustain current strategy?" |
| Incremental Value per Action | Marginal investment value of each intervention | "What's the next dollar worth?" |

### 7.2 Experiment Metrics

| Metric | Description | Decision It Enables |
|---|---|---|
| Experiment Velocity | Experiments completed per period | "Are we learning fast enough?" |
| Ship Rate | % of experiments deployed to production | "Are experiments translating to product?" |
| Win Rate | % of experiments with significant positive results | "Is our hypothesis quality improving?" |
| Time-to-Decision | Average decision cycle per experiment | "Are we deciding fast enough?" |
| Time-to-Rollout | Lag between decision and full deployment | "Are we capturing value quickly?" |
| Learning Efficiency | Knowledge value per experiment dollar | "Is our R&D spend justified?" |

### 7.3 Market Metrics

| Metric | Description | Decision It Enables |
|---|---|---|
| Genre Competition Intensity | Crowding and spend levels in target genre | "Is the market getting harder?" |
| Competitor Growth Trends | Trajectory of rival titles | "Are competitors pulling ahead?" |
| Saturation Signals | Indicators of market ceiling proximity | "Is there room left to grow?" |
| UA Efficiency Trends | Cost and quality trends in user acquisition | "Is acquisition getting cheaper or more expensive?" |
| Benchmark Gaps | Retention/revenue vs. market standards | "Where are we underperforming?" |

### 7.4 Operational Metrics

| Metric | Description | Decision It Enables |
|---|---|---|
| Live Ops Action Value | Revenue impact per operational intervention | "Which live ops actions matter most?" |
| Update Productivity | Value generated per product update cycle | "Are our updates worth the engineering cost?" |
| Release Contribution Score | Incremental value of each release | "Is our roadmap generating ROI?" |
| UA + Product Joint Efficiency | Combined effectiveness of acquisition and product | "Are marketing and product aligned?" |

### 7.5 Modeling Approach

yieldo employs a **Bayesian decision support** framework rather than a "prediction machine" approach:

- **External Market Prior**: Market-level benchmarks and trends form the prior belief
- **Internal Observed Posterior**: Actual game performance data updates the belief
- **LTV / Retention Forecasting**: Probabilistic projections with explicit uncertainty bands
- **Saturation Score Prediction**: Early warning system for diminishing returns
- **Scenario Simulation**: Monte Carlo-based modeling of investment outcomes
- **Explainable Outputs**: Every recommendation includes the reasoning chain, not just the number

**Design principle**: The model must be trustworthy enough for a CEO to act on. This means explainability is not optional — it is a core product requirement.

---

## 8. Technology & Data Architecture

### 8.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PROJECT YIELDO                          │
│                 Operating Intelligence Terminal                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│   │  Executive   │  │   Action     │  │    Capital      │   │
│   │  Overview    │  │   Impact     │  │   Allocation    │   │
│   │  Dashboard   │  │   Board      │  │   Console       │   │
│   └──────┬──────┘  └──────┬───────┘  └────────┬────────┘   │
│          │                │                    │             │
│   ┌──────┴────────────────┴────────────────────┴────────┐   │
│   │           Decision Intelligence Engine               │   │
│   │   (Bayesian Models / Scenario Sim / Risk Scoring)    │   │
│   └──────────────────────┬───────────────────────────────┘   │
│                          │                                   │
│   ┌──────────────────────┴───────────────────────────────┐   │
│   │              Unified Data Layer                       │   │
│   │    (Schema Normalization / Feature Engineering)       │   │
│   └──┬──────────┬──────────┬──────────┬──────────────────┘   │
│      │          │          │          │                       │
├──────┴──────────┴──────────┴──────────┴───────────────────┤
│                    Data Connectors                         │
├───────────┬───────────┬────────────┬──────────────────────┤
│  Market   │Attribution│ Experiment │   Financial          │
│  Intel    │  & UA     │  Results   │   Data               │
│           │           │            │                      │
│ Sensor    │ AppsFlyer │ Statsig    │  Internal            │
│ Tower     │ Adjust    │ Firebase   │  ERP / Sheets        │
│ AppMagic  │ Singular  │ Optimizely │  Manual Upload       │
└───────────┴───────────┴────────────┴──────────────────────┘
```

### 8.2 Data Platform

**Initial implementation**: Databricks-based data platform

- **Data Ingestion**: Automated connectors for market intelligence APIs, MMP webhooks, experiment result exports, and financial data uploads
- **Customer Data Isolation**: Multi-tenant architecture with strict data separation per customer
- **Common Schema**: Standardized data model across all input sources
- **Feature Engineering**: Automated computation of derived metrics and model inputs
- **Model Training & Inference**: Bayesian model updates and scenario simulations
- **Serving Layer**: Real-time API for dashboard rendering and alert generation

**Key design decisions**:

- Customers are not required to use Databricks — yieldo ingests data from their existing warehouse
- Long-term architecture supports customer-owned warehouse or hybrid deployment models
- All modeling runs on yieldo infrastructure to protect proprietary algorithms

### 8.3 Integration Architecture

yieldo is designed as a **read-layer** that integrates with existing tools, not replaces them:

- **API-first**: All data connectors are API-based for easy integration
- **No SDK required**: yieldo does not require customers to install client-side SDKs
- **Flexible ingestion**: Supports API pulls, webhook pushes, file uploads, and warehouse queries
- **Export capability**: Decision outputs can be exported to existing BI tools, Slack, email, or custom integrations

### 8.4 AI & Machine Learning Stack

- **Bayesian Inference Engine**: PyMC / Stan for probabilistic modeling
- **Forecasting**: Prophet / custom LTV models with uncertainty quantification
- **Scenario Simulation**: Monte Carlo engines for investment outcome modeling
- **NLP Layer**: LLM-powered natural language interpretation of decision context and recommendation generation
- **Anomaly Detection**: Statistical process control for market and performance signal monitoring

---

## 9. Business Model

### 9.1 Revenue Evolution

#### Phase 1: Consulting-Led Entry (Year 1)

| Revenue Stream | Description | Pricing |
|---|---|---|
| Investment Decision Reports | Custom analysis combining market + internal + financial data | $10K-$30K per report |
| Decision Support Retainer | Monthly advisory with data-driven investment recommendations | $5K-$15K/month |
| Pilot Projects | Proof-of-concept engagements with early adopters | $20K-$50K per pilot |

**Rationale**: Start with high-touch, consultative engagements to validate the decision framework, build case studies, and refine the product based on real operator feedback.

#### Phase 2: SaaS Platform (Year 2-3)

| Revenue Stream | Description | Pricing |
|---|---|---|
| Platform Subscription | Core Operating Intelligence Terminal access | $3K-$10K/month |
| Seat-Based Pricing | Per-user access for additional team members | $500-$1K/seat/month |
| Project Add-Ons | Additional game titles or projects | $1K-$3K/project/month |
| Premium Modeling | Advanced scenario simulation and forecasting | $2K-$5K/month add-on |

#### Phase 3: Enterprise (Year 3+)

| Revenue Stream | Description | Pricing |
|---|---|---|
| Enterprise Contracts | Custom deployment, SLA, dedicated support | $100K-$500K/year |
| API Access | Programmatic access to decision intelligence | Usage-based pricing |
| Data Connector Marketplace | Pre-built integrations with additional data sources | Revenue share model |
| Strategic Advisory | C-level decision support powered by yieldo data | Premium retainer |

### 9.2 Unit Economics (Target at Scale)

| Metric | Target |
|---|---|
| Average Contract Value (ACV) | $50K-$120K |
| Gross Margin | 75-85% |
| CAC Payback | < 12 months |
| Net Revenue Retention | 110%+ |
| LTV:CAC Ratio | > 5:1 |

### 9.3 Pricing Philosophy

yieldo pricing is based on **value delivered**, not data volume. The product helps operators make multi-million dollar allocation decisions — pricing reflects a fraction of the capital efficiency gains it enables.

---

## 10. Competitive Landscape

### 10.1 The Category Gap

The most important insight about yieldo's competitive position is this: **the category does not yet exist.**

No current product combines market intelligence, operational data, experiment results, and financial modeling into a unified investment decision layer for game operators. This represents a genuine whitespace opportunity.

### 10.2 Adjacent Players

| Company | What They Do | What They Don't Do |
|---|---|---|
| **Sensor Tower** | Market intelligence, competitive benchmarking, download/revenue estimates | No internal data integration, no investment decision logic, no financial modeling |
| **AppMagic** | Market analytics, genre trends, ad intelligence | Same gaps as Sensor Tower |
| **AppsFlyer / Adjust** | Attribution, UA measurement, incrementality | No market context, no financial translation, no experiment integration |
| **Statsig / Optimizely** | A/B testing execution, feature flags | No investment framing, no market data, no capital allocation logic |
| **Databricks / Snowflake** | Data storage and processing | Infrastructure only — no domain-specific intelligence |
| **Looker / Tableau** | General BI visualization | Shows data, doesn't make decisions — requires analyst interpretation |
| **Internal spreadsheets** | Ad-hoc financial modeling | Fragile, disconnected from live data, not scalable |

### 10.3 yieldo Positioning

```
                    Market Data Integration
                           ▲
                           │
          Sensor Tower  ●  │         ● yieldo
          AppMagic      ●  │
                           │
    ◄──────────────────────┼──────────────────────►
    Observation                          Decision
    (What happened?)                     (What to do?)
                           │
           AppsFlyer    ●  │
           Statsig      ●  │
           Looker       ●  │
                           │
                           ▼
                    Internal Data Integration
```

**yieldo occupies the upper-right quadrant** — high integration of both market and internal data, oriented toward decisions rather than observations. No current player occupies this space.

### 10.4 Adjacent Category Distinction: Funding Intelligence vs. Intervention-to-Investment OS

An important distinction separates yieldo from funding-oriented tools (e.g., PvX Partners, Lambda-style revenue-based financing platforms):

| Dimension | Funding Intelligence (PvX / Lambda style) | yieldo: Intervention-to-Investment OS |
|---|---|---|
| **Core question** | "Does this game qualify for external financing?" | "Are our interventions creating investable growth?" |
| **Data direction** | Outside-in: financier evaluates operator | Inside-out: operator understands their own economics |
| **Primary user** | External capital provider | Internal operator (CEO, UA lead, live ops, CFO) |
| **Output** | Financing term sheet | ΔLTV, payback shift, capital allocation decision |
| **Experiment role** | Not included | Central — ATE → ΔLTV is a core pipeline |
| **Live ops role** | Not included | Action Impact Board measures every intervention |

yieldo is **not a funding readiness or underwriting tool**. It is an operating system that helps operators understand whether their own game interventions are compounding investment value — and whether that justifies continued or increased capital deployment.

### 10.5 Competitive Moat

1. **Intervention-to-Investment Translation**: Proprietary pipeline from ATE/action logs → ΔLTV → payback shift — not replicable from generic BI tools
2. **Integration Complexity**: Combining experimentation results, live ops logs, MMP data, and financial inputs into a coherent investment framework creates significant switching costs
3. **Network Effects**: As more customers use yieldo, anonymized benchmark data improves genre-level priors and ΔLTV estimates for all users
4. **Operational Knowledge**: Built by operators who understand the actual decision process, not by data infrastructure engineers
5. **Category Definition**: First-mover advantage in defining the Intervention-to-Investment OS category

### 10.6 Relationship with Market Intelligence Providers

yieldo is **complementary** to Sensor Tower, AppMagic, and similar providers — not competitive.

- yieldo makes their data more valuable by connecting it to investment decisions
- Long-term partnership or acquisition opportunities exist
- yieldo can serve as a premium layer that increases the perceived value of market intelligence subscriptions

---

## 11. Go-to-Market Strategy

### 11.1 Phase 1: Validation (Months 1-6)

**Strategy**: Interview-led validation with network-based pilot customers

**Customer Discovery Interviews** (Target: 20-30 interviews)

Focus on decision-makers at mobile game companies:
- Game company CEOs and founders
- UA and marketing leads
- Live operations heads
- Data strategy and business strategy leads
- Publisher BD teams

**Interview focus areas** (not feature requests, but decision pain):
- When is investment decision-making hardest?
- When has the gap between market data and internal data caused frustration?
- When have experiment results failed to translate into investment decisions?
- What do you actually want to know: "what happened" or "what should we do"?

**Pilot Program** (Target: 2-3 customers)
- Deliver handcrafted investment decision reports combining market + internal + financial data
- Validate whether the output actually influences capital allocation decisions
- Iterate on framework based on operator feedback

### 11.2 Phase 2: Product-Market Fit (Months 6-18)

**Strategy**: Convert pilot learnings into repeatable product

- Launch MVP dashboard based on validated decision frameworks
- Target 5-10 paying customers through network and industry events
- Focus on Asia-Pacific market initially (leveraging Treenod network and relationships)
- Build case studies demonstrating measurable impact on investment decisions

**Key channels**:
- Direct outreach through gaming industry networks
- Gaming conferences (GDC, Gamescom, G-Star, TGS)
- Content marketing focused on capital allocation in gaming (thought leadership)
- Strategic partnerships with game industry consultancies

### 11.3 Phase 3: Scale (Months 18-36)

**Strategy**: Expand to Western markets and enterprise tier

- Launch self-serve SaaS tier for mid-market studios
- Build enterprise sales team for large publishers
- Expand to Western markets (North America, Europe)
- Develop partnership/integration programs with market intelligence providers
- Launch API platform for custom integrations

### 11.4 Partnership Strategy

| Partner Type | Value Proposition | Examples |
|---|---|---|
| Market Intelligence | yieldo adds a decision layer to their data | Sensor Tower, AppMagic |
| Attribution Platforms | yieldo connects UA measurement to investment outcomes | AppsFlyer, Adjust |
| Game Publishers | yieldo helps portfolio-level capital allocation | Major publishers |
| Industry Consultancies | yieldo powers their advisory practice | Game industry advisors |
| Data Platforms | yieldo is a premium application on their infrastructure | Databricks, Snowflake |

---

## 12. Team

### 12.1 Founding Team

The founding team comes from **Treenod's Data Team**, bringing deep, hands-on experience in mobile gaming data strategy and operations.

**Why this team is uniquely positioned**:

1. **Operator Perspective**: Unlike pure data scientists or infrastructure engineers, the team has lived the investment decision problem from the operator's seat. They have directly experienced the frustration of having abundant data but insufficient decision frameworks.

2. **Data Strategy Expertise**: The team has built and operated data pipelines, analytics infrastructure, and decision frameworks at scale within a live mobile gaming environment.

3. **Industry Network**: Deep relationships across the Korean and Asia-Pacific mobile gaming ecosystem — providing immediate access to pilot customers and design partners.

4. **Technical Depth**: Proven capability in data engineering, statistical modeling, machine learning, and production system design — the exact skills required to build yieldo.

5. **Business Acumen**: Understanding of mobile gaming economics, UA dynamics, live operations, and capital allocation — the domain knowledge that makes yieldo's decision layer credible.

### 12.2 Why Operator Background Matters

This business requires founders who understand that the customer is **not a data analyst** — the customer is a **business operator** who wants investment guidance.

A purely technical team would build a better analytics tool. A purely business team would build a consulting practice. **This team builds the decision OS** because they have lived at the intersection of data and business operations in mobile gaming.

### 12.3 Hiring Plan

| Role | Timing | Purpose |
|---|---|---|
| Senior Data Engineer | Month 1-3 | Build data integration and pipeline infrastructure |
| Full-Stack Engineer | Month 3-6 | Build product UI and API layer |
| ML / Statistical Modeling Engineer | Month 3-6 | Build Bayesian decision models |
| Customer Success Lead | Month 6-9 | Manage pilot customer relationships |
| Sales / BD Lead | Month 9-12 | Drive customer acquisition beyond founder network |
| Product Designer | Month 6-9 | Design operator-centric decision interfaces |

---

## 13. Milestones & Roadmap

### Year 1: Validate and Build

| Quarter | Milestone | Key Deliverable |
|---|---|---|
| Q1 2026 | Customer Discovery | 20+ interviews, problem validation complete |
| Q2 2026 | Pilot Launch | 2-3 handcrafted report pilots with paying customers |
| Q3 2026 | MVP Development | Working dashboard with core decision modules |
| Q4 2026 | Early Customers | 5-10 paying customers, initial case studies |

### Year 2: Product-Market Fit

| Quarter | Milestone | Key Deliverable |
|---|---|---|
| Q1 2027 | Platform V1 | Full SaaS platform with self-serve onboarding |
| Q2 2027 | Market Expansion | First Western market customers |
| Q3 2027 | Integration Ecosystem | Connectors for top 5 data sources |
| Q4 2027 | 30+ Customers | Demonstrated product-market fit, repeatability |

### Year 3: Scale

| Quarter | Milestone | Key Deliverable |
|---|---|---|
| Q1 2028 | Enterprise Tier | Large publisher contracts signed |
| Q2 2028 | API Platform | Developer ecosystem launched |
| Q3 2028 | 80+ Customers | Regional expansion to EMEA |
| Q4 2028 | Series A Ready | Proven unit economics, clear path to $10M+ ARR |

---

## 14. Financial Projections

### 14.1 Revenue Forecast

| | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Consulting / Reports | $200K | $300K | $200K |
| SaaS Subscriptions | $50K | $800K | $2.8M |
| Enterprise Contracts | — | $100K | $1M |
| **Total Revenue** | **$250K** | **$1.2M** | **$4.2M** |

### 14.2 Cost Structure

| | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Personnel (team of 4→7→10-14) | $400K | $900K | $1.8M |
| Infrastructure (cloud, data, APIs) | $50K | $150K | $350K |
| Sales & Marketing | $30K | $200K | $500K |
| Operations & Overhead | $50K | $100K | $200K |
| **Total Costs** | **$530K** | **$1.35M** | **$2.85M** |

### 14.3 Key Financial Metrics

| | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Gross Margin | 60% | 72% | 80% |
| Net Burn | -$280K | -$150K | +$1.35M |
| Customers | 5-10 | 15-25 | 40-60 |
| ARR (exit) | $300K | $1.5M | $3-5M |
| Team Size | 4-5 | 7-8 | 10-14 |

### 14.4 Path to Profitability

yieldo reaches **cash-flow positive in Year 2** through the combination of:
- High-margin SaaS revenue replacing lower-margin consulting
- Efficient customer acquisition through industry networks
- Low infrastructure costs relative to revenue (no raw data collection costs)

---

## 15. The Ask

### 15.1 Funding Round

**Raising: Pre-Seed / Seed Round**

| | |
|---|---|
| **Amount** | $500K - $1M |
| **Instrument** | SAFE or Convertible Note |
| **Use of Funds** | 18 months of runway to achieve product-market fit |

### 15.2 Use of Funds

| Category | Allocation | Purpose |
|---|---|---|
| Engineering Team | 50% | Core platform development (data, models, UI) |
| Customer Acquisition | 15% | Pilot programs, conferences, content marketing |
| Data & Infrastructure | 15% | Cloud computing, API access, data platform costs |
| Operations | 10% | Legal, accounting, office, tools |
| Reserve | 10% | Contingency and opportunity fund |

### 15.3 Key Milestones This Funding Enables

1. **Validate** the investment decision framework with 5-10 paying pilot customers
2. **Build** the MVP platform with core decision modules
3. **Prove** that yieldo measurably improves capital allocation decisions
4. **Establish** repeatable go-to-market playbook for the gaming industry
5. **Position** for Series A with demonstrated product-market fit and $1M+ ARR trajectory

### 15.4 What Investors Get

- **Category creation opportunity**: First mover in a new, defensible category
- **Capital-efficient model**: SaaS with 80%+ gross margins at scale
- **Multiple exit paths**: Independent scale, strategic acquisition by market intelligence companies, or platform play
- **Domain moat**: Deep gaming industry expertise that generalist competitors cannot replicate
- **Expanding TAM**: Core framework applicable beyond gaming to all pre-investment digital businesses

---

## 16. Long-Term Vision

### 16.1 The Three Horizons

**Horizon 1 (Years 1-3): Mobile Gaming Operating Intelligence Terminal**
- Establish the category and prove the value proposition
- Build a profitable, growing SaaS business serving mobile game operators

**Horizon 2 (Years 3-5): Gaming Industry Capital Intelligence Platform**
- Expand to console, PC, and cross-platform gaming
- Add portfolio-level decision support for publishers managing 10+ titles
- Build the industry's most comprehensive investment benchmark dataset

**Horizon 3 (Years 5+): Universal Operating Intelligence Terminal**
- Apply the framework to adjacent industries with similar economics (streaming, e-commerce, subscription businesses)
- Become the standard infrastructure for capital allocation intelligence

### 16.2 Strategic Optionality

yieldo is designed to create multiple strategic outcomes:

1. **Independent Growth**: Scale as a standalone SaaS company with $100M+ ARR potential
2. **Strategic Acquisition**: Highly attractive to market intelligence companies (Sensor Tower, data.ai) who want to move up the value chain from data to decisions
3. **Platform Evolution**: Become the operating system layer that other tools plug into, creating a defensible ecosystem
4. **Internal Leverage**: The yieldo framework becomes a proprietary advantage for the founding team's long-term ambition to operate their own gaming studio — with the industry's best investment decision infrastructure already built in-house

### 16.3 The Founder's North Star

> *"We build yieldo not just as a business, but as proof that the most important layer in gaming — the investment decision layer — has been missing. When we eventually build our own games, we will already have the operating system that every studio wishes they had."*

---

## 17. Appendix

### A. Glossary

| Term | Definition |
|---|---|
| **LTV** | Lifetime Value — total revenue expected from a user over their lifetime |
| **CAC** | Customer Acquisition Cost — cost to acquire one user |
| **ROAS** | Return on Ad Spend — revenue generated per dollar of advertising |
| **BEP** | Break-Even Point — when cumulative revenue equals cumulative investment |
| **IRR** | Internal Rate of Return — annualized return on investment |
| **UA** | User Acquisition — marketing efforts to acquire new game players |
| **MMP** | Mobile Measurement Partner — attribution tracking platform |
| **Live Ops** | Live Operations — ongoing game updates, events, and content management |
| **Payback Period** | Time required to recover the initial investment in a user or game |
| **Burn Rate** | Rate at which a company spends cash reserves |
| **Cohort** | Group of users acquired during the same time period, tracked together |

### B. Market Intelligence Landscape

The mobile gaming data and intelligence market includes:

- **Sensor Tower**: Estimated $100M+ revenue, acquired by Apptopia. Market leader in app store intelligence.
- **AppMagic**: Growing competitor focused on game-specific market analytics.
- **data.ai (formerly App Annie)**: Broad mobile market intelligence, recently merged with Sensor Tower.
- **AppsFlyer**: $300M+ revenue, dominant MMP in mobile gaming.
- **Adjust (AppLovin)**: Major MMP, acquired by AppLovin for $1B.

These valuations and market positions validate the scale of opportunity in gaming data intelligence — and highlight the absence of a decision layer above these tools.

### C. Comparable Company Frameworks

yieldo draws inspiration from decision intelligence platforms in other industries:

| Company | Industry | What They Do | Relevance |
|---|---|---|---|
| Palantir | Government / Enterprise | Integrates diverse data for decision-making | Decision OS model, not just analytics |
| Amplitude | Digital Products | Product analytics with outcome focus | Focus on "what drives outcomes" vs. "what happened" |
| Gainsight | SaaS | Customer success intelligence | Translates signals into business decisions |
| Anaplan | Enterprise | Connected planning and capital allocation | Financial modeling integrated with operational data |

yieldo applies similar principles to the mobile gaming vertical — with domain-specific models, metrics, and decision frameworks.

---

**Contact**

yieldo
[Contact Information]
[Website]

*This document is confidential and intended for prospective investors only. The financial projections contained herein are forward-looking estimates and subject to market conditions, execution risk, and other uncertainties.*
