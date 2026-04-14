# Market Gap 페이지 — 베이지안 추론 Load-Bearing 진단

**Date**: 2026-04-14
**Module**: Market Position (Module 2 / "시장에서의 우리의 위치는?")
**Page**: `compass/src/app/(dashboard)/dashboard/market-gap/page.tsx`
**Status**: Diagnostic spec (진단 우선 → 결과 보고 처방 결정)
**Source**: Deep Interview (4 rounds, final ambiguity 18.5%)

---

## 1. 핵심 질문 (사용자 원본)

> "시장 포지션 페이지에서 베이지안 추론이 실제 시장에서의 격차를 만드는 것인지? 어떤 식으로 명확하게 베이지안 추론을 사용자가 인식해야 하는지"

인터뷰를 통해 정제된 질문 두 층:

### 진단 (선행)
**베이지안 추론 프레임이 Market Gap 페이지의 "격차" 스토리에서 load-bearing(실제 작동)인가, 아니면 통계 라벨만 붙은 decorative 요소인가?**

### 처방 (진단 결과 따라)
load-bearing이라면 사용자가 명확히 인식하도록 UX를 어떻게 조정하는가? (단, "명시적 인식" vs "암묵적 작동"의 트레이드오프 고려)

---

## 2. 진단 기준 (Rubric)

사용자가 인터뷰 Round 2-4에서 명시한 기준 두 가지:

### Test A — 치환성 (Substitutability)
> "베이지안이라는 것이, 실제 사전확률, 우리 프로덕트가 사후확률로 치환해서 스토리텔링이 가능하냐"

- **사전 확률 = 장르/시장 기대치**
- **사후 확률 = 우리 프로덕트의 실측 데이터**
- 두 치환이 자연스러운 내러티브를 만드는가?

치환이 어색하면 → 통계 라벨일 뿐
치환이 자연스러우면 → 진짜 의사결정 프레임

### Test B — 순환성 (Cyclic Update)
> "사후 사전확률이 만나서 사전확률이 개선되고 다시 업데이트되면 사후확률이 되는건대... 그렇게 순환되는 구조냐"

베이지안 추론의 본질은 **반복적 belief update**:
```
초기 prior → +data → posterior → (다음 라운드 prior) → +new data → 새 posterior → ...
```

이 cyclic loop이 페이지 구조에 가시화되어 있는가?

가시화되어 있지 않으면 → 시간 t의 스냅샷 비교(snapshot comparison)
가시화되어 있으면 → 진짜 베이지안 process

### Test C — Operator 자연스러움 (Self-evident Story)
Compass의 primary user는 data analyst가 아닌 business operator (CLAUDE.md §11.2). 치환성+순환성이 통계 용어 없이도 직관적으로 읽히는가?

---

## 3. 현재 Market Gap 페이지 상태 (증거)

**파일 구조** (explore agent 보고 기반):

| 컴포넌트 | 위치 | 베이지안 노출 |
|---|---|---|
| MarketHeroVerdict | line 30-36 | ❌ rank CI 계산만 (synthesizeRankCI:59-66), 베이지안 용어 없음 |
| **PriorPosteriorChart** | line 45 + `/widgets/charts/ui/prior-posterior-chart.tsx` | ✅ 명시적 "Prior vs Posterior · 베이지안 추론" 제목 |
| Retention benchmark | market-benchmark.tsx | ❌ 우리 vs 장르 P10/P50/P90 — 베이지안 언급 없음 |
| Ranking trend | ranking-trend.tsx | ❌ 시계열만 |
| Saturation trend | saturation-trend.tsx | ❌ Top Grossing 진입 임계값 |
| Competitor table | — | ❌ 일반 비교 테이블 |

**PriorPosteriorChart 데이터** (mock-data.ts:724-740):
- D7: Prior 14.2 (CI 9.5–21.0) → Posterior 18.7 (CI 16.5–21.2)
- D30: Prior 6.4 (CI 3.2–12.5) → Posterior 8.5 (CI 7.1–10.2)
- ARPDAU: Prior 0.18 (CI 0.08–0.35) → Posterior 0.22 (CI 0.18–0.27)

**색상**: Prior = 회색 넓은 대역 (불확실), Posterior = 파란색 좁은 대역 (확신)

---

## 4. 진단 결과

### Test A — 치환성: ⚠️ 부분 통과

| 측면 | 결과 |
|---|---|
| 치환 자체 자연스러운가? | ✅ "장르의 D7 retention 기대치는 14.2이고 우리 게임은 18.7 측정" — 자연스러움 |
| 치환이 의사결정으로 연결되는가? | ⚠️ "장르 평균 +31% 우월" 까지는 가지만, "그래서 무엇을 하라?"로 이어지는 명시적 다리 약함 |
| 치환의 메타포가 일관된가? | ✅ 3개 지표(D7, D30, ARPDAU) 모두 동일 구조로 prior→posterior 매핑 |

**결론**: 치환은 가능하지만, 페이지의 다른 영역(MarketHero, Saturation, Competitor)이 같은 치환 메타포를 공유하지 않아 단편적.

### Test B — 순환성: ❌ 실패

| 측면 | 결과 |
|---|---|
| 시간 축이 보이는가? | ❌ PriorPosteriorChart는 단일 시점 스냅샷. Prior가 어느 시점, Posterior가 어느 시점인지 불명 |
| Posterior가 다음 prior가 되는 메커니즘 표현? | ❌ 없음. 한 번의 비교로 끝남 |
| Belief update 누적이 시각화되는가? | ❌ "D7 데이터 누적될수록 D30 불확실성이 좁혀진다" 같은 동적 표현 없음 |
| 신규 cohort가 들어왔을 때의 update 흐름? | ❌ 정적 mock data |

**결론**: 현재 페이지는 **베이지안 추론(process)이 아닌 베이지안 비교(snapshot)**만 표현. 가장 큰 결손.

### Test C — Operator 자연스러움: ⚠️ 부분 통과

| 측면 | 결과 |
|---|---|
| 통계 용어 없이도 읽히는가? | ⚠️ 차트 자체는 직관적이나, "베이지안 추론"이라는 영문 학술 용어를 그대로 노출 |
| Operator의 의사결정 언어로 번역되는가? | ❌ "장르 prior 14.2, our posterior 18.7" → "그래서 투자를 늘려야 하나?"로 직접 연결 안 됨 |
| 다른 페이지 작업(`사전 확률/사후 확률` 한국어 채택)과 일관된가? | ❌ Market Gap은 여전히 영문 "Prior/Posterior" 사용 (Revenue Forecast는 한국어로 전환 완료) |

**결론**: 한국어화 + operator 의사결정 언어로의 번역 layer 부재.

---

## 5. 종합 판정

| 기준 | 점수 | 비고 |
|---|---|---|
| Test A 치환성 | 6/10 | 한 차트에선 OK, 페이지 전체 메타포 미통일 |
| Test B 순환성 | 2/10 | 결정적 결손 — 베이지안의 본질인 update loop 부재 |
| Test C Operator 자연스러움 | 5/10 | 한국어/의사결정 번역 미완 |
| **종합 load-bearing** | **13/30 ≈ 43%** | **부분 load-bearing — "스냅샷 베이지안" 단계** |

**판정**: 현재 Market Gap의 베이지안 표현은 **"베이지안 추론을 한다고 주장하지만 실제로는 스냅샷 비교만 보여주는" 상태**.

→ Round 4 contrarian 답변 ("베이지안 자체를 명시적으로 들어내는게 맞냐")이 진단의 정확한 진입점이었음. 현재는 라벨만 명시적이고 process는 미가시. Cyclic update 구조가 보이지 않으면 "베이지안" 라벨은 **operator에게 거추장스러운 통계 jargon**이 됨.

---

## 6. 처방 옵션 (진단 결과 기반)

진단이 "부분 load-bearing"으로 나왔으므로 두 가지 길:

### 옵션 P1 — 베이지안 process 가시화 (full load-bearing 강화)
- **Cyclic update timeline 컴포넌트 신설**: D0(initial prior, 장르만) → D7(첫 update) → D14(두 번째 update) → D30(현재 posterior) — 시간이 흐를수록 prior 회색 밴드가 좁아지면서 posterior로 수렴
- **MarketHero에 update step 표시**: "장르 expectation D7=14.2 → 우리 D7=16.5 → posterior reset → D14=17.8 → ..."
- **다음 cohort 데이터 도착 시 update 미리보기**: "다음 주 cohort가 들어오면 P50이 ±X% 변동 예상"
- **장점**: 진짜 베이지안 process를 보여줌, "이건 진짜 추론이다" 증명력 강함, Compass 차별점 극대화
- **단점**: 새 컴포넌트 추가, mock data 시계열 확장 필요, 구현 비용 큼

### 옵션 P2 — 베이지안 라벨 제거, 순수 operator 언어로 (under-the-hood 작동)
- "Prior/Posterior" → "**장르의 기대치 / 우리 프로덕트의 증명**"
- "베이지안 추론" 표제 제거. 차트는 그대로 남기되 의미 layer만 교체
- Methodology 익스포트나 투자자 자료에는 "Bayesian inference under the hood" 명시
- **장점**: operator 인지 부담 ZERO, 페이지가 즉시 self-evident
- **단점**: 베이지안 차별점이 "비밀"이 됨, 투자자/심사위원에게 차별성 어필 어려움

### 옵션 P3 — 이중 레이어 (recommended)
- 기본 UI: P2 (operator 언어로 자연스럽게 읽힘)
- ⓘ 툴팁 / "Methodology" 익스포트: "이 페이지는 베이지안 추론을 사용합니다 — 자세히" 토글로 P1의 cyclic 시각화 노출
- **장점**: 두 audience(operator + 투자자) 모두 만족, 점진적 도입 가능
- **단점**: 복잡도 약간 증가

### 옵션 P4 — 처방 보류 (메타 결정)
- 현재 베이지안 라벨이 "스냅샷"인 채로 그대로 두기. 우선순위 더 높은 다른 차트에 시간 투자
- **장점**: 0 effort
- **단점**: 진단상 발견된 "load-bearing 부분 실패"가 그대로 남음, 차후 심사 시 약점

---

## 7. 권장 다음 단계

**즉시 가능 (no code)**:
1. 이 진단 spec을 사용자(Mike)와 검토 → 처방 옵션 (P1/P2/P3/P4) 선택
2. 선택된 옵션이 P1, P3 중 하나면 → 별도 implementation spec 작성

**P1/P3 선택 시 implementation 단계**:
- Cyclic Update Timeline 컴포넌트 디자인 (Toss DPS 스타일 참조)
- mock data 확장: cohort별 시계열로 D7/D14/D30/D60 모든 시점의 prior/posterior 값
- Revenue Forecast(2026-04-14)에서 확립한 한국어 용어(`사전 확률 / 사후 확률`) Market Gap에도 적용 (`feedback_korean_stats_terms` memory 준수)
- `feedback_chart_specs` 원칙 — 한 차트씩, 별도 spec md, brainstorming → 승인 → 구현 순서

**확정 사항 (변경하지 않음)**:
- Revenue Forecast의 Bayesian 색상 매핑(초록 posterior / 빨강 prior)이 이미 살아 있음 → Market Gap도 이 패턴 따를 것
- 한국어 용어 정책 일관 적용

---

## 8. Clarity Breakdown (인터뷰 결과)

| Dimension | Final Score | Weight | Weighted | Gap |
|---|---|---|---|---|
| Goal Clarity | 0.95 | 0.40 | 0.380 | 진단→처방 아크 + 순환 구조 진단 명확 |
| Constraint Clarity | 0.50 | 0.30 | 0.150 | 의도적 deferred — 진단 결과 후 결정 |
| Success Criteria | 0.95 | 0.30 | 0.285 | 치환성 + 순환성 두 축으로 확정 |
| **Total Clarity** | | | **0.815** | |
| **Final Ambiguity** | | | **18.5%** | ✅ Below threshold |

---

## 9. Interview Transcript

<details>
<summary>Full Q&A (4 rounds)</summary>

### Round 1 — Goal Clarity
**Q**: 진단(load-bearing 여부) vs 처방(UX 가시성) — 어느 쪽을 우선?
**A**: 둘 다 (진단 → 처방 순차)
**Ambiguity**: 100% → 72.5%

### Round 2 — Success Criteria
**Q**: "load-bearing"의 판단 기준? (정보 기여도 / 의사결정 변경 / 시간적 수렴 / 셋 다)
**A**: 1번 — **정보 기여도**, 그러나 핵심 reframe — "베이지안 = 사전확률·사후확률 치환으로 스토리텔링이 가능하냐"
**Ambiguity**: 72.5% → 38.5%

### Round 3 — Constraint Clarity
**Q**: 처방 시 수정 범위는? (한 차트 / 페이지 전체 / 텍스트만 / 모름)
**A**: 아직 모름 — 진단 보고 결정 (deferred 결정 자체가 경계)
**Ambiguity**: 38.5% → 29.5%

### Round 4 — Contrarian Mode
**Q**: "사용자가 베이지안을 명확히 인식해야 한다"는 전제 자체가 틀릴 수 있다 — 명시 / 암묵 / 이중 / 재정의?
**A**: **재정의** — 핵심은 "Market Gap에서 우리 프로덕트와 시장의 차가 순환 update 루프 구조냐"
**Ambiguity**: 29.5% → 18.5% ✅

</details>

---

## 10. 관련 문서

- `CLAUDE.md` §4 (Bayesian Decision Framework), §11.2 (operator-not-analyst principle)
- `docs/superpowers/specs/2026-04-14-revenue-forecast-bayesian.md` — Revenue Forecast의 Bayesian 적용 (참조 패턴)
- Memory: `feedback_korean_stats_terms` (사전/사후 확률 한국어 정책)
- Memory: `feedback_chart_specs` (one-chart-per-spec 프로세스)
- Memory: `project_revenue_forecast_decisions` (색상 매핑, 기본 상태)
