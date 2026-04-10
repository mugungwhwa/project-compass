# Integration API Research: Mobile Gaming Data Platforms
## For Project Compass — Investment Decision OS
**Research Date**: April 2026 | **Target Stack**: Next.js + Python

---

## 1. MMP (Mobile Measurement Partner) Integration

### 1.1 AppsFlyer

#### Authentication
- **Method**: Bearer token in `Authorization` header
- **Token source**: Dashboard > Your Email > API Tokens
- **Format**: `Authorization: Bearer <api_token>`
- **Note**: Different API products may use different token types (V2 API token, Cohort API token)

#### Cohort API (PRIMARY for Compass retention data)
- **Endpoint**: `POST https://hq1.appsflyer.com/api/cohorts/v1/data/app/{app_id}`
- **Auth**: Bearer token (`Authorization: Bearer <cohort_api_token>`)
- **Content-Type**: `application/json`
- **Request body (JSON)**:
  ```json
  {
    "cohort_type": "user_acquisition",
    "min_cohort_size": 50,
    "preferred_timezone": "UTC",
    "from": "2026-01-01",
    "to": "2026-03-31",
    "filters": {},
    "aggregation_type": "cumulative",
    "per_user": true,
    "groupings": ["pid", "date"],
    "kpis": ["retention"]
  }
  ```
- **Available KPIs**: retention, revenue, ecpi (effective CPI), cost, ROAS (one additional KPI per call beyond the always-returned users/ecpi/cost)
- **Groupings**: pid (partner/channel), date, campaign, geo, media_source, etc.
- **Max retention day**: 30 days post-install (day 0 = install day)
- **Max cohort day**: 90 days post-install
- **Response format**: CSV or JSON (set via `format` query param)

#### Master API V2 (Aggregate KPIs across apps)
- **Endpoint**: `GET https://hq.appsflyer.com/export/master_report/v4`
- **Parameters**: `api_token`, `app_id`, `from`, `to`, `groupings`, `kpis`
- **Data**: LTV, activity, retention, cohort, Protect360 KPIs
- **Freshness**: 24-48 hours depending on timezone
- **Response**: CSV or JSON

#### Aggregate Pull API V2 (Per-app aggregated data)
- **Endpoint**: `GET https://hq.appsflyer.com/export/{report_type}/v5/app/{app_id}`
- **Reports**: partners_report, geo_report, partners_by_date_report, daily_report
- **Use for**: CPI by channel, installs by geo, ROAS by campaign

#### Data Locker (Raw data streaming)
- **Delivery method**: NOT an API — streams data to your cloud storage
- **Supported destinations**: AWS S3, Google Cloud Storage, BigQuery, Snowflake
- **Delivery cadence**: Hourly (data organized by report type/date/hour folders)
- **Data format**: Parquet or CSV (Snappy/GZIP compressed or uncompressed)
- **Setup**: Create dedicated bucket (e.g., `af-datalocker-mybucket` for AWS)
- **Contains**: Install-level attribution, in-app events, SKAN postbacks, retargeting data
- **Plan requirement**: Enterprise plan or premium add-on

#### SKAN / Privacy-Preserving Attribution
- **SKAN raw data**: Available via Data Locker and Push API
- **Contains**: Decoded iOS SKAN postbacks with conversion values
- **SSOT (Single Source of Truth)**: Models null values from Apple's privacy thresholds
- **Conversion Studio API**: `PUT/GET` endpoints to manage SKAN conversion value schemas

#### Rate Limits
| API | Limit |
|-----|-------|
| General API | 500 req/sec, 30,000 req/min per account |
| Pull API | Varies by plan; daily quota system |
| Cohort API | Subject to report generation quotas |
| Master API | Subject to report generation quotas |

#### Pricing (2025-2026)
| Plan | Cost | API Access |
|------|------|-----------|
| **Zero** (Free) | $0 (up to 12K lifetime installs) | Basic attribution only, 30-day trial of premium APIs |
| **Growth** | $0.05-$0.07/install | Pull API access; premium add-ons (Data Locker, Raw Data) available |
| **Enterprise** | Custom annual contract | Full API access, Data Locker, unlimited raw data exports, dedicated support |

**Compass recommendation**: Enterprise plan required for Data Locker + Cohort API + raw data. Expect $30K-80K/year minimum for a gaming company with meaningful scale.

---

### 1.2 Adjust

#### Authentication
- **Method**: Bearer token in `Authorization` header
- **Token source**: Dashboard > My Account > API Token
- **Format**: `Authorization: Bearer <adjust_api_token>`

#### Report Service API (PRIMARY — replaces legacy KPI Service)
- **Endpoint**: `GET https://automate.adjust.com/reports-service/report`
- **Auth**: Bearer token
- **Response formats**: JSON (default), CSV, Parquet, Pivot JSON
- **Required parameters**:
  - `dimensions` — grouping (e.g., `app,os_name,campaign,country_code,day`)
  - `metrics` — KPIs (e.g., `installs,clicks,impressions,cost,ecpi`)
  - `date_period` — range (e.g., `2026-01-01:2026-03-31`, `-30d:-1d`, `this_month`)
- **Optional parameters**: `ad_spend_mode`, `attribution_source`, `utc_offset`, `currency`, `sort`, `sandbox`
- **Key dimensions**: `day`, `week`, `month`, `country_code`, `network`, `partner_name`, `campaign`, `adgroup`, `creative`

#### Cohort Data via Report Service
- **Cohort retention**: Available for D0 through D120 post-install
- **Endpoint**: Same Report Service endpoint with cohort-specific metrics
- **Advantage over AppsFlyer**: 120-day cohort window vs. AppsFlyer's 90-day max

#### Legacy KPI Service (still available)
- **Cohort endpoint**: `GET https://api.adjust.com/kpis/v1/{app_token}/cohorts.json`
- **Tracker-level**: `GET https://api.adjust.com/kpis/v1/{app_token}/trackers/{tracker_token}/cohorts.json`
- **Auth**: `user_token` parameter

#### Raw Data Export
- **Callback-based**: Real-time server-to-server callbacks for install/event data
- **CSV export**: Available via Datascape UI and API
- **Parquet recommended**: For large data volumes (more efficient than CSV)

#### Rate Limits
- **50 simultaneous requests maximum** (returns HTTP 429 if exceeded)
- **Response codes**: 200 (success), 204 (empty), 400, 401, 503, 504

#### Pricing (2025-2026)
- **Model**: Based on Monthly Tracked Users (MTUs)
- **Tiers**: Packages bundling core attribution + optional modules (fraud prevention, audience builder, incrementality)
- **API access**: Included in all paid plans via Report Service API
- **Estimate**: $20K-100K+/year depending on MTU volume

---

### 1.3 Singular

#### Authentication
- **Method**: API key as query parameter or `Authorization` header
- **Token source**: Dashboard > Developer Tools > API Keys
- **Format**: `?api_key=<key>` or `Authorization: <key>`

#### Reporting API (Async model)
- **Step 1 — Create report**: `POST https://api.singular.net/api/v2.0/create_async_report`
  - Returns a `report_id`
- **Step 2 — Poll status**: `GET https://api.singular.net/api/v2.0/get_report_status?report_id={id}`
  - Returns download URL when ready
- **Step 3 — Download**: Fetch the CSV/JSON from the provided URL
- **Sync alternative**: Available for smaller queries (limited to 3 concurrent)

#### Key Differences from AppsFlyer/Adjust
| Feature | Singular | AppsFlyer | Adjust |
|---------|----------|-----------|--------|
| **Query model** | Async (generate → poll → download) | Sync (direct response) | Sync (direct response) |
| **ETL built-in** | Yes — premium ETL product | Data Locker (cloud storage) | Callbacks + export |
| **Pricing model** | By ad spend or conversions | By non-organic installs | By MTUs |
| **Fraud prevention** | Included free | Protect360 add-on | Optional module |
| **Cohort depth** | Limited cohort support | D0-D90 | D0-D120 |
| **Cost data** | Strong (cost aggregation is core) | Via InCost API | Via ad_spend_mode |

#### Rate Limits
- Async reports: 100 concurrent
- Sync reports: 3 concurrent
- Single report: 200K rows max
- Daily global: 3M rows (shared across all queries)

#### ETL Integration (Singular ETL)
- **Renamed Sept 2025**: "Data Destinations" → "Singular ETL"
- **Location**: Data Integrations > Aggregated ETL or User-Level ETL
- **Destinations**: All major data warehouses, databases, data lakes
- **Setup**: Zero-code configuration
- **Premium feature**: Additional cost

#### Pricing (2025-2026)
- **Starting**: ~$795/month (Standard)
- **Average contract**: ~$83K/year
- **Range**: Up to ~$206K/year
- **Includes**: Fraud prevention and Reporting API free of charge
- **ETL**: Premium add-on

---

## 2. A/B Testing / Feature Flag Platform Integration

### 2.1 Statsig

#### Authentication
- **Console API**: Header `STATSIG-API-KEY: <console_api_key>` (from Project Settings > API Keys)
- **Server SDK**: Server Secret Key (for server-side evaluation)
- **Client SDK**: Client-SDK Key (safe for client-side)
- **API Version**: Header `STATSIG-API-VERSION: 20240601` (optional now, required in future)
- **Base URL**: `https://statsigapi.net`

#### Console API — Get Experiment Pulse Results (KEY ENDPOINT for Compass)
- **Endpoint**: `GET https://statsigapi.net/console/v1/gates/{id}/rules/{ruleID}/pulse_results`
- **Query params**:
  - `cuped` (string: "true"/"false") — toggle CUPED variance reduction
  - `confidence` (string: 0-100) — confidence interval level
- **Response fields per metric**:
  ```
  metricID, metricName, directionality
  absoluteChange, percentChange
  testMean, controlMean
  testStd, controlStd
  testUnits, controlUnits
  pValue, sequentialTestingPValue, adjustedAlpha
  confidenceInterval: { lower, upper, delta }
  percentConfidenceInterval: { lower, upper, delta }
  sequentialTestingConfidenceInterval: { lower, upper, delta }
  percentSequentialTestingConfidenceInterval: { lower, upper, delta }
  reversePower
  toplineImpact: { absolute/relative, actual/projected, with deltas }
  ds (date string)
  ```

**This is the key endpoint for extracting ATE data.** The `absoluteChange` field IS the ATE. The confidence interval fields provide the uncertainty bounds needed for the Bayesian framework.

#### Console API — Experiment Management
- **List experiments**: `GET /console/v1/experiments`
- **Get experiment**: `GET /console/v1/experiments/{id}`
- **Create experiment**: `POST /console/v1/experiments`
- **Update experiment**: `PATCH /console/v1/experiments/{id}`

#### Server SDK (Feature Gates + Dynamic Config + Rollout)
- **Languages**: Python, Node.js, Go, Java, Ruby, .NET, PHP, Rust
- **Key methods**:
  ```python
  # Python SDK
  statsig.initialize("server-secret-key")

  gate = statsig.check_gate(user, "gate_name")        # Boolean
  config = statsig.get_config(user, "config_name")     # JSON blob
  experiment = statsig.get_experiment(user, "exp_name") # Variant assignment
  statsig.log_event(user, "event_name", value, metadata)
  ```
- **Local evaluation**: SDK downloads all rule sets at init; evaluates locally without network round-trips
- **Rollout**: Feature gates support percentage-based rollout (0-100%)

#### Rate Limits
- **Mutation requests** (POST/PATCH/PUT/DELETE): ~100 req/10 sec, ~900 req/15 min per project
- **Read requests**: Not explicitly limited (but be reasonable)
- **OpenAPI spec**: `https://api.statsig.com/openapi/20240601.json`

#### Pricing (2025-2026)
| Plan | Cost | Features |
|------|------|----------|
| **Developer** (Free) | $0 | 2M events/month, unlimited gates/configs, experimentation + analytics, 50K session replays, 1-year retention, unlimited seats |
| **Pro** | $150/month baseline + usage | Higher event limits |
| **Enterprise** | Custom (50%+ discount at 20M+ events/month) | Volume discounts, advanced features |

**Compass recommendation**: Developer plan is sufficient for initial integration and prototyping. Pro/Enterprise when scaling beyond 2M events/month.

---

### 2.2 Firebase Remote Config + A/B Testing

#### Authentication
- **Method**: Google service account (OAuth 2.0)
- **Setup**: Generate private key JSON file from Firebase console
- **Admin SDK**: Uses service account credentials automatically

#### Remote Config REST API (Programmatic parameter management)
- **Base URL**: `https://firebaseremoteconfig.googleapis.com`
- **Get template**: `GET /v1/projects/{project}/remoteConfig`
- **Update template**: `PUT /v1/projects/{project}/remoteConfig`
- **Flow**: Get current template → modify parameters → validate → publish
- **Auth**: OAuth 2.0 bearer token from service account

#### Rollout via Remote Config
- **Mechanism**: Conditions using "User in random percentage"
- **Configuration**: Set percentage slider (0-100%)
- **Limitation**: Values must be 50% or less, unless rolling out to 100%
- **Programmatic**: Can modify conditions via REST API or Admin SDK

#### A/B Testing — Getting Results
- **No dedicated REST API for experiment results** — this is a significant limitation
- **Primary method**: BigQuery export
  - Requires Blaze plan (pay-as-you-go)
  - Firebase console > A/B Testing > experiment > Options > Query experiment data
  - Opens BigQuery with pre-built query
  - Extracts: experiment name, variant, event name, event counts, revenue
- **BigQuery SQL example** (from Firebase docs):
  ```sql
  SELECT
    experiment_variant,
    COUNT(DISTINCT user_pseudo_id) as users,
    SUM(event_value_in_usd) as total_revenue,
    STDDEV(event_value_in_usd) as stddev_revenue
  FROM `project.analytics_*.events_*`
  WHERE event_name IN ('in_app_purchase', 'ecommerce_purchase')
  GROUP BY experiment_variant
  ```

#### Limitations for Compass
1. **No programmatic API for experiment results** — must use BigQuery export
2. **No ATE / confidence interval computation** — must calculate yourself from raw BigQuery data
3. **Experiment management is console-only** — no API to create/start/stop experiments
4. **A/B Testing is tightly coupled to Firebase ecosystem** — harder to integrate with external systems
5. **Statistical methodology is opaque** — limited control over test parameters

#### Pricing
- **Remote Config**: Completely free, no usage limits
- **A/B Testing**: Free (built on Remote Config)
- **BigQuery export**: Requires Blaze plan; BigQuery costs apply (first 1TB/month query free, then $5/TB)
- **Analytics**: Free (powers both Remote Config and A/B Testing)

---

### 2.3 LaunchDarkly

#### Authentication
- **Method**: API access token in `Authorization` header
- **Format**: `Authorization: <api_access_token>`
- **Beta API**: Requires header `LD-API-Version: beta` for experiment endpoints

#### Experiments API (Beta)
- **Base URL**: `https://app.launchdarkly.com/api/v2`
- **Key endpoints**:
  | Endpoint | Method | Description |
  |----------|--------|-------------|
  | `/projects/{projKey}/environments/{envKey}/experiments` | GET | List experiments |
  | `/projects/{projKey}/flags/{flagKey}/experiments` | POST | Create experiment |
  | `/projects/{projKey}/flags/{flagKey}/experiments/{expKey}` | GET | Get experiment |
  | `/projects/{projKey}/flags/{flagKey}/experiments/{expKey}` | PATCH | Update experiment |
  | `/projects/{projKey}/flags/{flagKey}/experiments/{expKey}/results` | GET | **Get experiment results** |
  | `/projects/{projKey}/flags/{flagKey}/experiments/{expKey}/results/{metricGroupKey}` | GET | Results for metric group |

#### Get Experiment Results — Response Fields
- **treatmentResults** array, each containing:
  - `treatmentId` — variant identifier
  - `winningTreatmentId` — which variant won
  - Credible intervals (Bayesian approach)
  - Probability of being best (per variation)
  - Mean value per unit
  - Traffic counts (via `?expand=traffic`)
- **Statistical approach**: Bayesian by default
  - Credible intervals (not just confidence intervals)
  - Probability to be best for each variation
  - Supports both numeric and conversion metrics
- **Expand param**: `?expand=traffic` to include unit counts per treatment
- **Filter params**: `flagKey`, `metricKey`, `status` (not_started/running/stopped)

#### Percentage Rollouts
- **Weight system**: 0 to 100,000 (scaled by 1000x for fractional percent precision)
  - 60,000 = 60% rollout
  - 500 = 0.5% rollout
- **API-controllable**: Full CRUD on flag targeting rules including rollout percentages
- **Progressive rollout**: Modify weights via PATCH on flag configuration

#### Pricing (2025-2026)
| Plan | Cost | Experimentation |
|------|------|-----------------|
| **Developer** (Free) | $0 | Basic experimentation, 1 project, 3 environments |
| **Foundation** | $12/service connection/month + $10/1K client MAU/month | Full experimentation at $3/1K experimentation MAU/month |
| **Enterprise** | Custom (median ~$72K/year, range $19.5K-$165.7K) | Full suite |

**Warning**: Usage-based experimentation costs ($3/1K MAU) can add 30-50% to base costs.

---

## 3. Rollout Management

### 3.1 Gradual Rollout Capabilities by Platform

| Capability | Statsig | LaunchDarkly | Firebase RC |
|-----------|---------|--------------|-------------|
| Percentage rollout | Yes (0-100%) | Yes (0.001-100%, via 1000x weights) | Yes (0-100%, slider) |
| Programmatic control | Yes (Console API + Server SDK) | Yes (REST API PATCH on flags) | Yes (REST API template update) |
| Granularity | Integer percent | 0.1% (via weight system) | Integer percent |
| Targeting rules | User properties, segments, random | User attributes, segments, rules | Conditions (user %, properties) |
| Auto-decision | Not built-in (must build) | Not built-in (must build) | Not built-in |

### 3.2 Implementing "Rollout > Measure > Auto-Decide" Loops

No platform provides this out-of-the-box. Compass must build this orchestration layer. Here is the recommended architecture:

```
┌─────────────────────────────────────────────────┐
│              Compass Orchestration               │
│                  (Python)                        │
├─────────────────────────────────────────────────┤
│                                                  │
│  1. SET ROLLOUT (1%)                            │
│     → Statsig: PATCH experiment config           │
│     → or LaunchDarkly: PATCH flag weights        │
│     → or Firebase: PUT Remote Config template    │
│                                                  │
│  2. WAIT (accumulate data, e.g., 7 days)        │
│     → Cron job or scheduled task                 │
│                                                  │
│  3. MEASURE IMPACT                              │
│     → Statsig: GET pulse_results                 │
│     → or LaunchDarkly: GET experiment results    │
│     → or Firebase: Query BigQuery                │
│     → Extract: ATE, confidence intervals, p-val  │
│                                                  │
│  4. DECIDE                                      │
│     → Compass Bayesian engine evaluates:         │
│       - Is ATE significant?                      │
│       - Is ΔLTV positive with >X% confidence?    │
│       - Does experiment ROI justify rollout?      │
│                                                  │
│  5. ACT                                         │
│     → If positive: increase rollout (10%→50%→100%)│
│     → If negative: kill experiment               │
│     → If inconclusive: extend measurement window │
│     → Log decision + rationale                   │
│                                                  │
│  6. LOOP to step 2                              │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 3.3 Platform Recommendation for Rollout Management

**Statsig is the clear winner** for a 2-person team:
1. Free tier (2M events/month) is generous enough for early-stage
2. Console API provides both experiment results AND management in one API
3. Server SDK handles local evaluation (no latency penalty)
4. CUPED variance reduction is built-in (reduces time-to-decision)
5. Python SDK available natively
6. Pulse results endpoint returns ATE + CI directly — no calculation needed

---

## 4. Key Data Points Needed from Each Platform

### 4.1 From MMP → Compass Pipeline

| Data Point | Field/Source | Platform | Frequency |
|-----------|-------------|----------|-----------|
| **CPI per channel/geo** | `ecpi` metric, grouped by `pid` + `geo` | AppsFlyer Cohort API or Adjust Report Service | Daily |
| **Install volumes** | `installs` metric, grouped by `date` + `pid` | AppsFlyer Pull API or Adjust Report Service | Daily |
| **ROAS by campaign** | `roas` KPI, grouped by `campaign` + `pid` | AppsFlyer Cohort API (D0-D90) | Daily |
| **Cohort retention** | `retention` KPI, grouped by `date` | AppsFlyer Cohort API (D0-D30) or Adjust (D0-D120) | Daily |
| **Revenue per cohort** | `revenue` KPI, per_user=true | AppsFlyer Cohort API | Daily |
| **UA spend** | `cost` metric | AppsFlyer Master API or Adjust Report Service | Daily |
| **SKAN conversions** | SKAN raw data reports | AppsFlyer Data Locker | Hourly |

### 4.2 From A/B Platform → Compass Pipeline

| Data Point | Field/Source | Platform | Frequency |
|-----------|-------------|----------|-----------|
| **Experiment ID** | `experiment.id` / `experimentName` | Statsig Console API | On-demand |
| **Variant names** | `groups[].name` | Statsig Console API | On-demand |
| **Sample sizes** | `testUnits`, `controlUnits` | Statsig Pulse Results | On-demand |
| **ATE (absolute)** | `absoluteChange` | Statsig Pulse Results | Daily/On-demand |
| **ATE (relative)** | `percentChange` | Statsig Pulse Results | Daily/On-demand |
| **Confidence interval** | `confidenceInterval.lower/upper` | Statsig Pulse Results | Daily/On-demand |
| **P-value** | `pValue` | Statsig Pulse Results | Daily/On-demand |
| **Test/Control means** | `testMean`, `controlMean` | Statsig Pulse Results | Daily/On-demand |
| **Topline impact** | `toplineImpact.absolute/relative` | Statsig Pulse Results | Daily/On-demand |
| **Retention metric (D1/D7/D30)** | Custom metric in Statsig | Statsig (log via SDK) | Continuous |
| **Revenue metric** | Custom metric in Statsig | Statsig (log via SDK) | Continuous |

### 4.3 ATE → ΔLTV Translation Pipeline

```
Statsig Pulse Results
    │
    ├── absoluteChange on "D7_retention" metric = ATE_retention
    ├── confidenceInterval = uncertainty bounds
    ├── testUnits + controlUnits = sample sizes
    │
    ▼
Compass Bayesian Engine
    │
    ├── ATE_retention → project ΔLTV using retention model (Section 3 of CLAUDE.md)
    ├── CI on retention → CI on ΔLTV (uncertainty propagation)
    ├── ΔLTV × projected_annual_users = ΔAnnual_Revenue
    ├── ΔAnnual_Revenue / experiment_cost = Experiment_ROI
    │
    ▼
Investment Decision
    ├── If Experiment_ROI > threshold AND P(ΔLTV > 0) > confidence_threshold
    │     → SHIP (increase rollout)
    └── Else → HOLD or KILL
```

---

## 5. Recommendation for a 2-Person Team

### 5.1 Recommended Stack

| Layer | Recommendation | Rationale |
|-------|---------------|-----------|
| **MMP** | **AppsFlyer** (primary) | Market leader in gaming; Cohort API provides retention data directly; Data Locker for raw data. Most gaming companies already use it. |
| **A/B Testing** | **Statsig** (primary) | Free tier is generous; Console API returns ATE + CI directly; Python SDK for server-side; CUPED built-in; best developer experience. |
| **Feature Flags** | **Statsig** (same platform) | Unified platform = one integration, one SDK, one billing relationship. Feature gates + experiments in one tool. |
| **Rollout Management** | **Custom (Compass)** | Build the orchestration loop in Python. No platform does "rollout → measure → auto-decide" natively. |
| **Backup/Alternative MMP** | **Adjust** | If customer uses Adjust instead of AppsFlyer. Report Service API is clean; 120-day cohort window is better. |

### 5.2 Why NOT the Others (for initial build)

| Platform | Why Deprioritize |
|----------|-----------------|
| **Singular** | Async query model adds complexity; weaker cohort support; higher cost floor ($795/mo+); better as a cost aggregation complement, not primary MMP |
| **Firebase A/B Testing** | No API for experiment results (BigQuery-only); no ATE computation; opaque statistics; tightly coupled to Firebase ecosystem; fine if customer already uses it, but don't build primary integration around it |
| **LaunchDarkly** | Expensive ($3/1K experimentation MAU adds up fast); API is still in beta; Bayesian-only stats (no frequentist option); overkill for a 2-person team; better for large engineering orgs |

### 5.3 Integration Priority Order

**Phase 1 (Month 1-2)**: Build these first
1. AppsFlyer Cohort API → daily retention + CPI + ROAS ingestion
2. Statsig Console API → experiment results (ATE + CI) ingestion
3. Statsig Server SDK → Python integration for feature gates + experiment assignment

**Phase 2 (Month 3-4)**: Add flexibility
4. AppsFlyer Pull API → aggregate install/revenue data
5. Adjust Report Service API → support customers on Adjust
6. Rollout orchestration loop (Statsig API for control)

**Phase 3 (Month 5+)**: Scale
7. AppsFlyer Data Locker → raw install-level data pipeline
8. Firebase BigQuery connector → for customers using Firebase A/B testing
9. Singular Reporting API → for customers using Singular

### 5.4 Architecture Sketch

```
                    ┌──────────────────┐
                    │   Next.js App    │
                    │  (Dashboard UI)  │
                    └────────┬─────────┘
                             │ REST API
                    ┌────────▼─────────┐
                    │   Python API     │
                    │  (FastAPI/Flask)  │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
    ┌─────────▼──────┐ ┌────▼─────┐ ┌──────▼───────┐
    │  MMP Connector  │ │ Exp Conn │ │ Compass Core │
    │                 │ │          │ │              │
    │ • AppsFlyer     │ │ • Statsig│ │ • Retention  │
    │   Cohort API    │ │   Console│ │   Model      │
    │   Pull API      │ │   API    │ │ • Bayesian   │
    │   Data Locker   │ │          │ │   Engine     │
    │                 │ │ • Server │ │ • LTV Calc   │
    │ • Adjust        │ │   SDK    │ │ • Investment │
    │   Report Svc    │ │          │ │   Scoring    │
    │                 │ │ • (FB    │ │              │
    │ • Singular      │ │   BQ)   │ │              │
    │   Reporting API │ │          │ │              │
    └─────────────────┘ └──────────┘ └──────────────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                    ┌────────▼─────────┐
                    │   Data Store     │
                    │  (PostgreSQL +   │
                    │   Redis cache)   │
                    └──────────────────┘
```

### 5.5 Estimated Integration Effort

| Integration | Effort (2-person team) | Complexity |
|------------|----------------------|------------|
| AppsFlyer Cohort API | 1-2 weeks | Medium (auth + pagination + rate limiting) |
| AppsFlyer Pull API | 1 week | Low (simple GET with params) |
| Adjust Report Service | 1-2 weeks | Medium (similar to AppsFlyer) |
| Statsig Console API | 1 week | Low (clean REST, well-documented) |
| Statsig Server SDK | 2-3 days | Low (pip install + init) |
| Rollout orchestration | 2-3 weeks | High (custom logic, state machine, error handling) |
| Firebase BigQuery | 2 weeks | Medium (BigQuery auth + custom ATE calculation) |
| Data Locker pipeline | 2-3 weeks | High (cloud storage setup + ETL) |

### 5.6 Cost Estimate (Annual, Minimum Viable)

| Service | Estimated Annual Cost |
|---------|---------------------|
| AppsFlyer (Growth or Enterprise) | $30,000-$80,000 (depends on install volume; likely already paid by customer) |
| Statsig (Developer → Pro) | $0-$1,800/year (free tier sufficient initially) |
| Adjust (if needed) | $20,000-$60,000 (likely already paid by customer) |
| LaunchDarkly (if needed) | $19,500-$72,000/year (avoid unless customer requires it) |
| Firebase | $0 (free tier; BigQuery costs minimal) |

**Key insight**: MMP costs are almost always borne by the customer, not by Compass. Compass's own platform costs for API access are minimal ($0-$1,800/year for Statsig).

---

## Sources

### AppsFlyer
- [Cohort API – Help Center](https://support.appsflyer.com/hc/en-us/articles/360004799057-Cohort-API)
- [Master API – Help Center](https://support.appsflyer.com/hc/en-us/articles/213223166-Master-API-user-acquisition-metrics-via-API)
- [API Reference Overview](https://dev.appsflyer.com/hc/reference/api-reference-overview)
- [Data Locker for Marketers](https://support.appsflyer.com/hc/en-us/articles/360000877538-Data-Locker-for-marketers)
- [Data Locker Cloud Service Setup](https://support.appsflyer.com/hc/en-us/articles/360017603577-Data-Locker-cloud-service-setup)
- [SKAN Raw Data Reports](https://support.appsflyer.com/hc/en-us/articles/360014261518-SKAN-raw-data-reports)
- [Report Generation Quotas](https://support.appsflyer.com/hc/en-us/articles/207034366-Report-generation-quotas-rate-limitations)
- [AppsFlyer Pricing](https://www.appsflyer.com/pricing/)
- [AppsFlyer Pricing Guide (MetaCTO)](https://www.metacto.com/blogs/the-complete-guide-to-appsflyer-costs-setup-integration-maintenance)

### Adjust
- [Report Service API](https://dev.adjust.com/en/api/rs-api/)
- [JSON Report Endpoint](https://dev.adjust.com/en/api/rs-api/reports/)
- [KPI Service (Legacy)](https://help.adjust.com/en/article/kpi-service)
- [Datascape Metrics Glossary](https://help.adjust.com/en/article/datascape-metrics-glossary)

### Singular
- [Reporting API Reference](https://support.singular.net/hc/en-us/articles/360045245692-Reporting-API-Reference)
- [Getting Started with Reporting API](https://support.singular.net/hc/en-us/articles/207553433-Getting-Started-with-the-Singular-Reporting-API)
- [Singular ETL FAQ](https://support.singular.net/hc/en-us/articles/360037917571-Singular-ETL-FAQ-and-Troubleshooting)
- [Singular Pricing](https://www.singular.net/pricing/)

### Statsig
- [Console API — Experiments](https://docs.statsig.com/console-api/experiments/)
- [Retrieve Pulse Results](https://docs.statsig.com/api-reference/gates/retrieve-pulse-results)
- [Reading Experiment Results](https://docs.statsig.com/experiments-plus/read-results/)
- [Confidence Intervals](https://docs.statsig.com/experiments/statistical-methods/confidence-intervals)
- [HTTP API](https://docs.statsig.com/http-api/)
- [Server SDKs](https://docs.statsig.com/server/introduction)
- [Statsig Pricing](https://statsig.com/pricing)

### Firebase
- [Remote Config REST API](https://firebase.google.com/docs/reference/remote-config/rest)
- [Modify Remote Config Programmatically](https://firebase.google.com/docs/remote-config/automate-rc)
- [A/B Testing with BigQuery](https://firebase.google.com/docs/ab-testing/bigquery)
- [Remote Config Rollouts](https://firebase.google.com/docs/remote-config/rollouts)
- [Firebase Pricing](https://firebase.google.com/pricing)

### LaunchDarkly
- [Experiments API](https://launchdarkly.com/docs/api/experiments)
- [Experimentation Overview](https://launchdarkly.com/docs/home/experimentation)
- [Percentage Rollouts](https://launchdarkly.com/docs/home/releases/percentage-rollouts)
- [Bayesian Experiment Results](https://launchdarkly.com/docs/home/experimentation/bayesian-results/)
- [LaunchDarkly Pricing](https://launchdarkly.com/pricing/)
- [REST API Docs](https://apidocs.launchdarkly.com/tag/Feature-flags/)
