# yieldo — Business Model & Packaging Plan

> **목적**: yieldo의 수익화 전략, 티어별 패키징, 단가 책정, 그리고 Phase별 진화 로드맵을 하나의 문서로 통합
>
> **기반 문서**: CLAUDE.md §9, Business Plan §9/§14, B2B Readiness Blueprint §2-§5, Tech Stack §7
>
> **생성일**: 2026-04-17
> **상태**: 전략 설계 문서 (실행 전)

---

## 0. TL;DR

> yieldo는 **Consulting → SaaS → Enterprise** 3단계 수익 진화를 따른다.
> SaaS 단계에서는 **Starter / Growth / Enterprise** 3-tier 구조로 패키징하며,
> 핵심 가격 앵커는 **"관리 타이틀 수 × 의사결정 깊이"** 이다.
> Free tier는 두지 않는다. 대신 **14일 무료 트라이얼 + 데모 환경**으로 대체한다.

---

## 1. 가격 설계 원칙

### 1.1 Value-Based Pricing

yieldo가 답하는 질문은 "이 게임에 추가 투자해야 하나?"이다.
이 질문의 답이 만드는 가치는 **수백만~수천만 달러 규모의 자본 배분 결정**이다.

| 원칙 | 설명 |
|---|---|
| **가치 기반** | 데이터 볼륨이나 API 호출 수가 아닌, 의사결정 가치에 연동 |
| **예측 가능** | 고객이 월 청구액을 미리 알 수 있는 구조 (서프라이즈 과금 없음) |
| **성장 연동** | 고객이 성공할수록 yieldo 매출도 성장 (타이틀 수 × 깊이) |
| **단순성** | 3개 이하 tier, 핵심 축 1개 (타이틀 수), 이해하기 쉬운 구조 |

### 1.2 Free Tier를 두지 않는 이유

| 고려 사항 | 판단 |
|---|---|
| 타겟 고객 | $10M+ 매출 게임사 CEO/UA Lead — 무료 도구가 아닌 의사결정 인프라를 찾는 사람 |
| 제품 특성 | 고객 재무 데이터 + MMP 연동이 핵심 → 무료로는 가치 증명 불가 |
| 운영 비용 | 2인 팀으로 무료 유저 서포트는 리소스 소모 |
| 대안 | 14일 전 기능 트라이얼 + 상시 데모 환경 (mock 데이터)으로 충분 |

> **결론**: Free tier 없음. **14-day full-access trial** + **공개 데모 대시보드** (현재 프로토타입 활용)

---

## 2. Revenue Evolution — 3단계 수익 진화

### Phase 1: Consulting-Led Entry (Year 1, 2026)

**목적**: 프레임워크 검증 + 케이스 스터디 확보 + 제품 피드백

| 수익 스트림 | 설명 | 단가 | 타겟 수 |
|---|---|---|---|
| **Investment Decision Report** | 마켓+내부+재무 데이터 통합 분석 리포트 | $10K-$30K / 건 | 6-10건/년 |
| **Decision Support Retainer** | 월간 투자 의사결정 자문 | $5K-$15K / 월 | 3-5사 |
| **Pilot Project** | PoC 프로젝트 (2-3개월) | $20K-$50K / 프로젝트 | 2-3건 |

**Year 1 수익 목표**: $250K

**핵심 전략**:
- 모든 컨설팅은 yieldo 대시보드를 보조 도구로 사용 → 제품 가치 자연 체험
- Pilot → SaaS 전환율 목표 60%+
- 컨설팅 과정에서 수집한 패턴을 제품에 내재화

### Phase 2: SaaS Platform (Year 2-3, 2027-2028)

**목적**: 반복 가능한 구독 수익 + PMF 증명

→ **섹션 3에서 상세 패키징**

### Phase 3: Enterprise + Platform (Year 3+, 2028~)

**목적**: 대형 퍼블리셔 계약 + API 생태계

| 수익 스트림 | 설명 | 단가 |
|---|---|---|
| **Enterprise Contract** | 전용 배포, SLA, 전담 지원 | $100K-$500K / 년 |
| **API Access** | 프로그래밍 방식 의사결정 인텔리전스 | 사용량 기반 |
| **Data Connector Marketplace** | 추가 데이터 소스 커넥터 | 레비뉴 쉐어 |
| **Strategic Advisory** | C-level 의사결정 자문 (yieldo 데이터 기반) | 프리미엄 리테이너 |

---

## 3. SaaS Tier 설계 — 핵심 패키징

### 3.1 가격 축 (Pricing Axis)

**Primary axis**: 관리 타이틀(게임) 수
**Secondary axis**: 의사결정 깊이 (모듈 접근 범위)

이 2축 구조를 선택한 이유:
- 타이틀 수는 고객 규모와 직접 비례 → 자연스러운 성장 연동
- 의사결정 깊이는 가치 차별화 → 업셀 경로 명확

### 3.2 3-Tier 구조

```
┌─────────────────────────────────────────────────────────────────┐
│                        ENTERPRISE                                │
│            "Portfolio-level Capital Intelligence"                 │
│                    Custom pricing                                │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │                      GROWTH                                │   │
│  │          "Experiment-to-Investment OS"                      │   │
│  │               $5,000/month                                 │   │
│  │                                                            │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │                   STARTER                            │   │   │
│  │  │        "Investment Health Monitor"                    │   │   │
│  │  │              $1,500/month                             │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  └───────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Tier별 상세

#### Starter — "Investment Health Monitor"

**월 $1,500** (연 계약 시 $1,200/월 = $14,400/년)

**타겟**: 소규모 스튜디오, 단일 타이틀 운영사, yieldo 첫 도입
**포지셔닝**: "내 게임의 투자 건강 상태를 한눈에"

| 포함 항목 | 상세 |
|---|---|
| **타이틀** | 1개 |
| **시트** | 3석 |
| **Module 1**: Executive Overview | 투자 상태 (G/Y/R), Burn Tolerance, Payback Forecast |
| **Module 2**: Market Gap | 장르 벤치마크 비교, 경쟁 포지셔닝 |
| **재무 입력** | Tier 1 수동 입력 (5개 핵심 지표) |
| **MMP 연동** | 1개 플랫폼 (AppsFlyer 또는 Adjust) |
| **AI Copilot** | Level 1 — 정적 인사이트 요약 |
| **데이터 갱신** | 일 1회 배치 |
| **지원** | 이메일 (48시간 응답) |
| **Export** | CSV |

**포함하지 않는 것**: Module 3/4/5, 실험 연동, 시나리오 시뮬레이션, 실시간 갱신

---

#### Growth — "Experiment-to-Investment OS"

**월 $5,000** (연 계약 시 $4,000/월 = $48,000/년)

**타겟**: 중견 퍼블리셔, 멀티 타이틀 운영, 실험 문화 보유
**포지셔닝**: "모든 개입이 투자 가치를 만들고 있는가?"

| 포함 항목 | 상세 |
|---|---|
| **타이틀** | 3개 포함 (추가 $1,500/타이틀/월) |
| **시트** | 10석 (추가 $200/석/월) |
| **Module 1**: Executive Overview | 전체 기능 |
| **Module 2**: Market Gap | 전체 기능 + 경쟁사 심층 비교 |
| **Module 3**: Action Impact Board | 개입 → ΔLTV → Payback Shift 전체 파이프라인 |
| **Module 4**: Experiment Investment Board | ATE → ΔLTV → Experiment ROI 번역 |
| **Module 5**: Capital Allocation Console | 시나리오 시뮬레이터, 리스크 경계, 추천 액션 |
| **재무 입력** | Tier 2 확장 (IAP/광고 분해, 게임별 비용, Gross Margin) |
| **MMP 연동** | 복수 플랫폼 |
| **실험 연동** | Statsig / Firebase (1개 플랫폼) |
| **AI Copilot** | Level 2 — 컨텍스트 기반 대화형 인사이트 |
| **데이터 갱신** | 4시간 간격 |
| **지원** | 이메일 + 채팅 (24시간 응답) |
| **Export** | CSV + PDF Investment Posture Report |
| **온보딩** | 전담 온보딩 (1회 60분) |

**핵심 차별화**: Module 3+4 (개입→투자 번역)가 yieldo의 핵심 가치이며, Growth부터 열림

---

#### Enterprise — "Portfolio Capital Intelligence"

**Custom pricing** (연 $100K-$500K, 타이틀·규모에 따라 협의)

**타겟**: 대형 퍼블리셔, 10+ 타이틀 포트폴리오, C-suite 의사결정
**포지셔닝**: "포트폴리오 전체의 자본 배분 최적화"

| 포함 항목 | 상세 |
|---|---|
| **타이틀** | 무제한 |
| **시트** | 무제한 |
| **전체 Module** | 1-5 전체 + 포트폴리오 뷰 (크로스 타이틀 비교) |
| **재무 입력** | Tier 3 — QuickBooks/Xero 자동 연동 |
| **MMP/실험** | 전체 플랫폼 무제한 연동 |
| **AI Copilot** | Level 3-4 — 시나리오 시뮬레이터 + Action Executor |
| **데이터 갱신** | 실시간 (near real-time) |
| **지원** | 전담 CSM + Slack 채널 + SLA (4시간 응답) |
| **Export** | CSV + PDF + API Access + Scheduled Reports |
| **보안** | SSO (SAML), 감사 로그, DPA, Custom RLS 정책 |
| **온보딩** | 전담 팀 온보딩 (4주 프로그램) |
| **Advisory** | 분기별 C-level 투자 전략 리뷰 (yieldo 데이터 기반) |

---

### 3.4 Tier 비교 매트릭스

| 기능 | Starter ($1.5K) | Growth ($5K) | Enterprise (Custom) |
|---|---|---|---|
| **타이틀 수** | 1 | 3 (추가 가능) | 무제한 |
| **시트** | 3 | 10 (추가 가능) | 무제한 |
| **Module 1** Executive Overview | ✅ | ✅ | ✅ |
| **Module 2** Market Gap | ✅ | ✅ | ✅ |
| **Module 3** Action Impact Board | — | ✅ | ✅ |
| **Module 4** Experiment Board | — | ✅ | ✅ |
| **Module 5** Capital Console | — | ✅ | ✅ |
| **Portfolio View** (cross-title) | — | — | ✅ |
| 재무 입력 | Tier 1 (수동 5개) | Tier 2 (확장) | Tier 3 (자동) |
| MMP 연동 | 1개 | 복수 | 무제한 |
| 실험 연동 | — | 1개 | 무제한 |
| AI Copilot Level | 1 | 2 | 3-4 |
| 데이터 갱신 | 일 1회 | 4시간 | 실시간 |
| Export | CSV | CSV + PDF | CSV + PDF + API |
| SSO / 감사 로그 | — | — | ✅ |
| 전담 CSM | — | — | ✅ |
| 온보딩 | 셀프서브 | 1회 60분 | 4주 프로그램 |

---

## 4. Add-On 과금 항목

Tier 업그레이드 없이 필요한 기능만 추가 구매할 수 있는 모듈형 add-on:

| Add-On | 대상 Tier | 월 단가 | 설명 |
|---|---|---|---|
| **추가 타이틀** | Growth | $1,500 / 타이틀 | 3개 초과 시 |
| **추가 시트** | Growth | $200 / 석 | 10석 초과 시 |
| **실험 연동** | Starter | $1,000 / 월 | Starter에서 Module 4 없이 실험 데이터만 수집 |
| **Premium Modeling** | Growth | $2,000 / 월 | 고급 시나리오 시뮬레이션, Monte Carlo 심층 분석 |
| **PDF Report** | Starter | $500 / 월 | Investment Posture PDF 자동 생성 |
| **API Access** | Growth | 사용량 기반 | 프로그래밍 방식 데이터 접근 |

---

## 5. 단가 책정 근거 (Pricing Justification)

### 5.1 Value Anchor — 고객이 얻는 가치

| 시나리오 | yieldo 없이 | yieldo 있으면 | 가치 차이 |
|---|---|---|---|
| UA 예산 $1M 잘못 배분 | 3개월 후 발견, $300K 손실 | 2주 만에 재배분, $50K 손실 | **$250K 절약** |
| A/B 테스트 승자 rollout 지연 | 의사결정 4주 지연, LTV 기회비용 | 3일 만에 ship 결정 | **$100K+ 기회 포착** |
| 게임 운영 중단 시점 판단 오류 | 3개월 추가 burn ($500K) | 정확한 cut 시점 결정 | **$500K 절약** |

**Starter $1.5K/월**: 연 $18K → 한 번의 올바른 결정이 100x+ ROI
**Growth $5K/월**: 연 $60K → 실험 파이프라인 최적화만으로 $500K+ 가치 창출 가능

### 5.2 경쟁 제품 가격 비교 (Adjacent Market)

| 도구 | 카테고리 | 가격대 |
|---|---|---|
| Sensor Tower | Market Intelligence | $5K-$20K/월 |
| AppMagic | Market Intelligence | $1K-$5K/월 |
| AppsFlyer | Attribution (MMP) | $3K-$30K/월 |
| Statsig | Experimentation | $2K-$10K/월 |
| Amplitude | Product Analytics | $2K-$8K/월 |
| Mixpanel | Product Analytics | $1.5K-$5K/월 |

**yieldo 포지셔닝**: 이 도구들 위에 앉는 "번역 레이어" → 이들의 합산 비용 대비 30-50% 수준이 적정

### 5.3 ACV 정합성 확인

| Tier | 월가 | 연 계약가 | ACV 범위 |
|---|---|---|---|
| Starter | $1,500 | $14,400 | — |
| Growth (기본) | $5,000 | $48,000 | ✅ $50K 타겟 부합 |
| Growth (타이틀 5개 + 추가 시트) | ~$8,000 | ~$96,000 | ✅ $100K 타겟 부합 |
| Enterprise | Custom | $100K-$500K | ✅ 상위 ACV 타겟 부합 |

**Blended ACV 목표**: $50K-$120K → Growth tier 중심 믹스에서 달성 가능

---

## 6. 트라이얼 & 전환 전략

### 6.1 Acquisition Funnel

```
공개 데모 대시보드 (mock 데이터, 상시 접근)
    ↓
"Request Trial" / "Book Demo" CTA
    ↓
14-day Full-Access Trial (Growth tier 기능 전체)
    ↓  [온보딩 콜 1회 포함]
    ↓
Trial → Paid 전환 (Starter 또는 Growth 선택)
    ↓
Quarterly Business Review → Upsell (Starter→Growth, Growth→Enterprise)
```

### 6.2 트라이얼 설계

| 항목 | 설계 |
|---|---|
| **기간** | 14일 |
| **기능 범위** | Growth tier 전체 (Module 1-5) |
| **타이틀 수** | 1개 |
| **데이터** | 실 데이터 연동 (MMP API 키 입력) + mock fallback |
| **온보딩** | 1회 30분 콜 (value-first: 장르 벤치마크 먼저 보여주기) |
| **트라이얼 종료** | 읽기 전용 모드 전환 (데이터 유지, 14일간 추가 보관) |
| **전환 인센티브** | 트라이얼 중 연 계약 시 첫 달 무료 |

### 6.3 공개 데모 환경

현재 프로토타입(mock 데이터 기반 5개 모듈)을 공개 데모로 활용:
- URL: `demo.yieldogames.io` (또는 `/demo` 경로)
- 로그인 불필요, 모든 모듈 탐색 가능
- 데이터는 가상 게임 "Puzzle Quest" 기반
- CTA: "See this with YOUR data → Start Trial"

---

## 7. Phase별 패키징 진화 로드맵

### Year 1 (2026): Consulting + Starter Prep

| Q | 마일스톤 | BM 활동 |
|---|---|---|
| Q2 | Customer Discovery (20-30 인터뷰) | 가격 민감도 테스트, WTP 탐색 |
| Q2-Q3 | Pilot 2-3건 | $20K-$50K 컨설팅 리포트 납품 |
| Q3 | MVP 대시보드 (P0 완료) | Starter tier 기능 셋 확정 |
| Q4 | Early customers 5-10명 | Starter 기준 첫 구독 전환 |

**Year 1 수익 믹스**: 컨설팅 80% + SaaS 20%

### Year 2 (2027): SaaS Dominant

| Q | 마일스톤 | BM 활동 |
|---|---|---|
| Q1 | Platform V1 (셀프서브 온보딩) | Starter + Growth 정식 런칭 |
| Q2 | Growth tier 실험 연동 완성 | Growth 업셀 캠페인 시작 |
| Q3 | 서구 시장 첫 고객 | 글로벌 pricing 검증 (USD 기준 유지) |
| Q4 | 30+ 고객 | Enterprise 문의 대응 시작 |

**Year 2 수익 믹스**: 컨설팅 25% + SaaS 65% + Enterprise 10%
**Year 2 수익 목표**: $1.2M

### Year 3 (2028): Enterprise Scale

| Q | 마일스톤 | BM 활동 |
|---|---|---|
| Q1 | Enterprise tier 정식 출시 | SSO, 감사 로그, DPA 완비 |
| Q2 | API Platform 런칭 | 사용량 기반 과금 도입 |
| Q3 | 80+ 고객 | 지역별 가격 차별화 검토 |
| Q4 | Series A 준비 | Unit economics 증명 ($5M+ ARR) |

**Year 3 수익 믹스**: 컨설팅 5% + SaaS 55% + Enterprise 40%
**Year 3 수익 목표**: $4.2M

---

## 8. Unit Economics 목표

### 8.1 Tier별 마진 구조

| 항목 | Starter | Growth | Enterprise |
|---|---|---|---|
| 월 매출 / 고객 | $1,500 | $5,000 | ~$15,000 |
| 인프라 비용 / 고객 | ~$50 | ~$150 | ~$500 |
| 지원 비용 / 고객 | ~$100 | ~$300 | ~$1,500 |
| **Gross Margin** | **~90%** | **~91%** | **~87%** |

### 8.2 전사 목표 (at Scale)

| 메트릭 | 목표 | 근거 |
|---|---|---|
| Blended ACV | $50K-$120K | Growth tier 중심 믹스 |
| Gross Margin | 75-85% | Enterprise CSM 비용 포함 blended |
| CAC Payback | < 12개월 | 네트워크 기반 세일즈로 낮은 CAC |
| Net Revenue Retention | 110%+ | 타이틀 추가 + tier 업그레이드 |
| LTV:CAC | > 5:1 | 장기 구독 + 높은 전환 비용 |
| Logo Churn | < 10%/년 | 의사결정 인프라 → 높은 전환 비용 |

### 8.3 인프라 비용 구조 (참고)

Tech Stack 문서 기준 초기 인프라 비용:

| 서비스 | 월 비용 |
|---|---|
| Vercel Pro | $20 |
| Supabase Pro | $25 |
| GCP Cloud Run (API) | $30-80 |
| GCP Cloud Run Jobs (배치) | $20-50 |
| 기타 (Redis, 모니터링 등) | $20-50 |
| **합계** | **$115-225** |

→ 고객 50명 기준 인프라 비용 ~$2K-5K/월 → **고객당 $40-100/월** → Gross Margin 90%+ 유지 가능

---

## 9. 고객 세그먼트별 패키징 매핑

| 고객 유형 | 규모 | 추천 Tier | 예상 ACV | 핵심 니즈 |
|---|---|---|---|---|
| **인디 스튜디오** | 1-2 타이틀, <$5M 매출 | Starter | $14K-$18K | 투자 건강 모니터링, 벤치마크 비교 |
| **중견 퍼블리셔** | 3-5 타이틀, $10M-$50M 매출 | Growth | $48K-$100K | 실험→투자 번역, 타이틀별 비교 |
| **대형 퍼블리셔** | 10+ 타이틀, $50M+ 매출 | Enterprise | $100K-$500K | 포트폴리오 자본 배분, API, SSO |
| **VC/투자사** | 게임 포트폴리오 평가 | Enterprise (특수) | $150K-$300K | 투자 대상 실사, 포트폴리오 모니터링 |

---

## 10. 업셀 & 확장 경로

```
Starter ($14K ACV)
    │
    ├── 타이틀 추가 필요 ──→ Growth로 업그레이드
    ├── 실험 연동 필요 ──→ Growth로 업그레이드
    └── PDF Report 필요 ──→ Add-On $500/월
    
Growth ($48K ACV)
    │
    ├── 타이틀 5개+ ──→ 추가 타이틀 과금 ($1.5K/개)
    ├── 팀 확장 ──→ 추가 시트 ($200/석)
    ├── 심층 모델링 ──→ Premium Modeling Add-On
    ├── API 필요 ──→ API Add-On
    └── SSO/감사 필요 ──→ Enterprise로 업그레이드
    
Enterprise ($100K+ ACV)
    │
    ├── 포트폴리오 확대 ──→ 계약 규모 확대
    ├── 추가 사업부 ──→ Multi-org 확장
    └── Advisory 추가 ──→ Strategic Advisory 리테이너
```

**NRR 110%+ 달성 메커니즘**:
1. **자연 확장**: 고객이 성공하면 타이틀/시트 증가
2. **깊이 확장**: 더 많은 모듈/기능 필요 → tier 업그레이드
3. **가치 증명 → 부서 확장**: UA팀 도입 → CFO팀 확장 → C-suite 전사 도입

---

## 11. 지역별 가격 전략

### Phase 1-2 (Year 1-2): 단일 글로벌 가격 (USD)

- APAC 우선이지만 USD 기준 유지
- 한국 고객: 원화 결제 지원 (Stripe 자동 환전)
- 환율 리스크는 yieldo가 부담 (고객 편의 우선)

### Phase 3 (Year 3+): 지역 차별화 검토

| 지역 | 조정 방향 | 근거 |
|---|---|---|
| 한국/일본 | 기준가 유지 | 높은 ARPU, 강한 WTP |
| 동남아 | 20-30% 할인 | 낮은 ARPU, 시장 진입 전략 |
| 북미/유럽 | 기준가 유지 또는 10% 프리미엄 | 높은 WTP, 달러 기반 |
| 중국 | 별도 파트너십 | 현지 규제, 별도 진입 전략 필요 |

---

## 12. 결제 & 계약 구조

### 12.1 결제 방식

| 항목 | 설계 |
|---|---|
| **결제 인프라** | Stripe (Checkout + Billing + Invoice) |
| **계약 단위** | 월간 또는 연간 (연간 시 20% 할인) |
| **결제 수단** | 카드 (Starter/Growth), 카드+인보이스 (Enterprise) |
| **통화** | USD 기준, KRW/JPY/EUR 결제 지원 (Stripe 환전) |
| **업그레이드** | 즉시 적용, 잔여 기간 일할 정산 |
| **다운그레이드** | 다음 결제 주기부터 적용 |
| **취소** | 잔여 기간 사용 가능, 환불 없음 (연간 계약: 별도 협의) |

### 12.2 Enterprise 계약

| 항목 | 설계 |
|---|---|
| **계약 기간** | 12개월 (최소), 24-36개월 할인 |
| **결제** | 분기/반기/연 인보이스 |
| **SLA** | 99.9% uptime, 4시간 응답, 전담 CSM |
| **법적 문서** | MSA + Order Form + DPA + BAA (필요시) |
| **갱신** | 자동 갱신, 60일 사전 통보 |

---

## 13. 열린 질문 & 검증 필요 사항

| # | 질문 | 검증 방법 | 시점 |
|---|---|---|---|
| 1 | Starter $1.5K가 인디 스튜디오에게 적정한가? | Customer Discovery 인터뷰 WTP 질문 | Q2 2026 |
| 2 | Growth $5K에서 Module 3/4가 핵심 업셀 동기가 되는가? | Pilot 고객 사용 패턴 분석 | Q3-Q4 2026 |
| 3 | 타이틀당 추가 과금($1.5K) vs. 고정 tier 확장 중 어느 것이 마찰이 적은가? | A/B 가격 테스트 | Q1 2027 |
| 4 | VC/투자사를 별도 tier로 분리해야 하는가? | 수요 탐색 (5건+ 문의 시 분리) | Q2 2027 |
| 5 | 연간 20% 할인이 적정한가? (너무 높으면 현금흐름 부담) | 월간:연간 비율 모니터링 | Q1 2027 |
| 6 | 동남아 할인이 브랜드 가치를 훼손하지 않는가? | 파일럿 3건으로 검증 | Q3 2027 |

---

## 14. 예창패 / 정부 지원 프로그램 활용 시 주의사항

정부 지원금 수령 시 가격 정책에 미치는 영향:

| 항목 | 주의 |
|---|---|
| **매출 인정** | 컨설팅 매출은 용역 매출로 인정, SaaS는 라이선스 매출 |
| **해외 매출** | 해외 고객 매출 비율이 높으면 글로벌 진출 성과로 가산 |
| **무료 제공** | Pilot을 무료로 제공하면 매출 0 → 유료 Pilot ($20K+) 권장 |
| **가격 변경** | 정부 보고서에 기재된 가격 변경 시 변경 사유 기록 필요 |

---

## 15. 참조

- `CLAUDE.md` §9 — Business Model (Phase 1/2/3 수익 진화)
- `Project_Yieldo_Business_Plan.md` §9 — 상세 단가, §14 — 재무 예측
- `docs/Project_Yieldo_B2B_Readiness_Blueprint.md` §2 — Gap Matrix, §4 — 단계 목표
- `Project_Yieldo_Tech_Stack.md` §7.5 — 인프라 비용 구조

---

**이 문서는 살아있는 문서입니다.** Customer Discovery 인터뷰와 Pilot 결과에 따라 가격과 패키징을 지속 업데이트하세요.
