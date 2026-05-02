# yieldo Demo Script & Smoke Checklist

**Date**: 2026-04-30
**Audience**: 예창패 / 투자자
**Length**: 60-90초 핵심 + 3-5분 풀 데모
**Status**: 시연용 — connections PR-A + PR-B + PR-C main 안착 후

---

## 1. Opening Narrative (15초)

> "yieldo는 mobile gaming의 4개 데이터 사일로 — MMP, 실험, 재무, 시장 인텔리전스 — 를 하나의 투자 결정 레이어로 묶습니다. 'A/B 실험이 이겼다'에서 '그 승리가 LTV를 얼마 올렸고 자본 재배치를 정당화하는가'로 번역하는 게 핵심입니다."

핵심 단어: **번역 레이어**, **자본 재배치**, **LTV**.

## 2. Connections Hub Tour (30초)

http://localhost:3000/dashboard/connections 또는 Vercel 프로덕션 URL.

페이지 상단 stats header — 전체 12개 connector / N개 연결됨 + 진행률 바 + 4-silo 카운트 칩 (각 사일로당 3개).

| 사일로 | 카드 (3개씩) |
|---|---|
| MMP | **AppsFlyer** (실제 가동) · Adjust · Singular |
| 실험 | Statsig · Firebase · Optimizely |
| 재무 | **재무 직접 입력** (실제 폼) · QuickBooks · Xero |
| 시장 | GameAnalytics · Sensor Tower · AppMagic |

각 카드 좌측에 brand color chip + initials (예: AF / AJ / SG / ST / FB / OP / 재 / QB / XR / GA / SN / AM).

> "4개 사일로의 통합 진입점. AppsFlyer는 매일 cron으로 cohort 데이터를 끌어와 LTV 계산에 신선한 신호를 공급합니다. 12개 connector 중 정식 연동은 Phase별 단계 출시 — Sensor Tower / AppMagic 등은 partnership 협의 시 활성화."

**참고**: cron schedule은 Vercel Hobby plan 호환을 위해 매일 18:00 UTC 1회로 설정 (PR-A follow-up `6daeae9`).

## 3. AppsFlyer 실 가동 시연 (20초)

AppsFlyer 카드 클릭:
- App ID 입력 폼 노출 (실제 등록 가능)
- 등록된 상태면 "최근 sync 시각" 메트릭 표시

> "이 부분은 실제 작동합니다. 등록 후 cron이 자동으로 데이터를 끌어와 다른 모듈(LTV, Burn Tolerance)에 전파합니다."

## 4. 재무 직접 입력 시연 — 핵심 시퀀스 (60초)

이 부분이 narrative의 가장 강력한 단계 — input → 저장 → **dashboard 전파**.

1. 재무 카테고리 "재무 직접 입력" 카드 클릭
2. 5-metric 폼 노출
3. 시드 값 입력 (천 단위 콤마 자동 포맷):
   - 월 매출: `50,000,000` KRW
   - UA 지출: `20,000,000` KRW
   - 현금 잔고: `500,000,000` KRW
   - 월 burn: `30,000,000` KRW
   - 목표 payback: `12` 개월
4. "저장" 클릭 → "저장됨" 1초 표시 → 다이얼로그 자동 닫힘
5. **페이지 새로고침** → 카드 status "연결됨" 유지
6. 카드 다시 클릭 → 폼이 저장된 값으로 pre-fill → 닫기
7. **🔥 핵심 — 다른 페이지로 이동**: `/dashboard` 또는 `/dashboard/market-gap` 클릭
8. **상단 RunwayStatusBar 확인**: burn tolerance · netRunway · capEfficiency · revPerSpend 메트릭이 입력값에서 파생된 수치로 표시됨

> "Visible.vc 모델 — 3분 안에 5개 핵심 지표만 입력. localStorage에 저장돼 새로고침에도 살아남고, 모든 dashboard 페이지 상단 status bar에 burn tolerance와 runway로 즉시 반영됩니다. 정식 버전은 Supabase 영구 저장 + RLS 멀티테넌트 격리입니다."

핵심 단어: **Visible.vc**, **3분**, **input → status bar 실시간 전파**, **localStorage prototype → Supabase 정식**.

**파생 공식 (deriveFinancialHealth, KRW→USD@1300)**:
- `netBurn = monthlyRevenue - monthlyBurn - uaSpend`
- `runway = cashBalance / |min(0, netBurn)|`
- `burnTolerance = min(runway, targetPaybackMonths)`
- 색상: 12개월 ≥ green, 6개월 ≥ amber, 그 외 red

## 5. Other Connectors — 정직한 placeholder (15초)

Statsig / Firebase / Optimizely / Adjust / Singular / GameAnalytics / Sensor Tower / AppMagic / QuickBooks / Xero 중 하나 클릭:
- 3-step wizard dialog: 자격 정보 → 검증 → 연결 완료
- footer: "시연용 placeholder — 실제 등록 흐름은 추후 릴리즈에서 활성화됩니다"

> "이 connector들은 등록 흐름 prototype입니다. 출시 시점에 실제 OAuth/API 연동으로 교체됩니다 — 카드 디자인과 데이터 흐름은 동일합니다."

핵심: 거짓말이 아니라 **prototype 단계**임을 명시. footer disclaimer가 신뢰의 핵심.

## 6. Closing — 다음 단계 (15초)

> "이 데모는 4개 사일로 통합 진입점 + 재무 input → status bar 실시간 wiring입니다. 다음 단계는 (1) 실제 OAuth connector 추가 (Adjust/Statsig), (2) Module 1 Executive Overview HeroVerdict / PortfolioVerdict 카드까지 입력값 흐름 확장, (3) 시장 인텔리전스 Bayesian prior 자동 갱신. 6주 안에 paying customer 1팀 pilot이 목표입니다."

---

## Day-of Smoke Checklist (시연 직전 5분)

발표 전 다음을 순서대로 확인:

### 환경

- [ ] Vercel production URL이 응답하는지 (또는 로컬 dev `localhost:3000`)
- [ ] `/dashboard/connections` 페이지 로드 — 4 카테고리 모두 카드 1개 이상 표시
- [ ] "곧 추가됩니다" empty state가 어디에도 없음
- [ ] 페이지 풀 로드까지 1.5초 미만

### AppsFlyer 실 동작

- [ ] AppsFlyer 카드 status — "연결됨"이면 sync 살아있음
- [ ] 카드 클릭 시 RegisterForm 또는 metrics view 보임 (placeholder wizard 아님)
- [ ] (선택) Vercel Functions 탭에서 최근 cron 호출 성공 로그 확인

### 재무 입력 시퀀스 + Status Bar 전파

- [ ] "재무 직접 입력" 카드 클릭 → 5-field form (placeholder wizard 아님)
- [ ] 빈 폼 + "저장" 클릭 → 모든 필드에 inline 빨간 에러 "값을 입력하세요"
- [ ] 음수 입력 (`-1`) → "음수는 입력할 수 없습니다"
- [ ] payback `61` 입력 → "1~60 사이 정수를 입력하세요"
- [ ] 정상 시드값 입력 → "저장됨" → 새로고침 → 카드 "연결됨" → 재클릭 시 pre-fill
- [ ] **저장 직후** `/dashboard` 또는 `/dashboard/market-gap` 이동 → 상단 RunwayStatusBar의 burn tolerance / netRunway 값이 mock과 다른 (입력값 파생) 수치로 변경됨
- [ ] localStorage 비운 상태 (incognito) → status bar 기존 mock 값으로 fallback (회귀 0)
- [ ] 시연 끝 후 localStorage 초기화: 브라우저 콘솔 `localStorage.removeItem("yieldo:financial-input:v1")` 또는 incognito 사용

### Placeholder wizard

- [ ] Statsig 또는 Adjust 카드 → 3-step wizard
- [ ] Step 1: connector별 가이드 텍스트 (e.g., Statsig Console / Adjust Dashboard)
- [ ] "다음" → Step 2 spinner ~1.5초
- [ ] Step 3: "연결되었습니다 (시연용)" + 닫기
- [ ] footer disclaimer "시연용 placeholder" 모든 step에서 표시

### 회귀 점검

- [ ] 다른 페이지 (`/dashboard`, `/dashboard/overview` 등) 정상 렌더 — connections 변경이 회귀 안 일으킴
- [ ] 콘솔에 React 에러/경고 0건

---

## Rollback Plan

만약 데모 직전 브로큰:
1. **재무 form 안 뜸** → localStorage 초기화 후 재시도. 그래도 안 되면 Statsig 카드로 narrative 우회 (placeholder wizard만 시연)
2. **AppsFlyer cron 죽어있음** → "최근 sync 시각" 라벨 무시하고 "AppsFlyer는 등록 가능, cron은 출시 시점 활성화" 라벨 변경
3. **페이지 자체 안 뜸** → Vercel preview URL 시연. 그래도 안 되면 로컬 dev (`npm run dev`)

git revert 안전 zone (역순):
- PR-C만 revert (status bar wiring 끔, 카드 입력 흐름 유지): `git revert -m 1 717f938`
- PR-C + PR-B revert: `git revert -m 1 717f938 c0567dc`
- PR-A까지 revert: `git revert -m 1 717f938 c0567dc 7aacf83`

---

## References

- PR #13 (PR-A): connections demo-pack — 4-silo 카드 + placeholder wizard + AppsFlyer cron
- PR #14 (PR-B): financial manual input — 5-metric form + localStorage
- PR #17 (PR-C): financial input → dashboard wiring — `useLiveFinancial` + `RunwayStatusBar`
- Spec: `docs/superpowers/specs/2026-04-29-connections-demo-pack-design.md`
- Spec: `docs/superpowers/specs/2026-04-29-connections-pr-b-financial-design.md`
- Spec: `docs/superpowers/specs/2026-04-30-connections-pr-c-financial-wiring-design.md`
