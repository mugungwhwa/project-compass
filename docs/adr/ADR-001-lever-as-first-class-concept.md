# ADR-001: Lever as a First-Class Concept

**Status**: Proposed
**Date**: 2026-04-08
**Deciders**: Mike (Founder)
**Related**: CLAUDE.md §7.1 (Product Architecture), Project_Yieldo_UI_Guide.md Modules 3–4, Project_Yieldo_Engine_Blueprint.md

---

## Context

yieldo 현재 ontology는 모든 개입(intervention)을 "Action"이라는 단일 바구니에 담고 있다. CLAUDE.md §7.1 Module 3(Action Impact Board)는 UA, Live Ops, 릴리스, 실험을 "시간순 타임라인 이벤트"로 동일하게 취급한다. 이 구조는 두 가지 문제를 만든다.

1. **존재론적 혼동**: 실험(experiment)은 *모르는 레버를 탐색*하는 활동이고, 운영(operation/LiveOps)은 *이미 검증된 레버를 반복 실행*하는 활동이다. 본질이 다른데 수평으로 묶여 있다.
2. **시각적 단절**: UI Guide 기준 Module 3(Action Impact)은 7줄로 얇게 설계되어 있고, Module 4(Experiment Investment)는 50+줄로 깊게 설계되어 있다. 둘 사이에 양방향 링크가 없다. 운영자가 "이번 달 라이브이벤트 $120K 매출이 어느 실험에서 검증된 레버였는가"를 추적할 경로가 없다. Experiment-to-Investment 내러티브(CLAUDE.md §1.1)가 UI 레벨에서 끊겨 있다.

이 단절은 yieldo의 핵심 가치 제안("실험→투자 결정 OS")과 직접 충돌한다.

## Decision

**yieldo 데이터 모델과 문서 체계에 "Lever"를 1급 개념(first-class concept)으로 도입한다.**

- **Lever**: 게임 지표(리텐션/ARPDAU/LTV)를 움직이는 것으로 *검증된* 개입 단위. "Daily login reward 2x", "Event pass monetization", "Onboarding flow v3" 같은 것.
- **Experiment**: Lever를 *검증*한다 (ATE → ΔLTV로 측정).
- **Operation**: 검증된 Lever를 *실행*한다 (반복/리듬/확대).
- **Lever**는 고유한 `validated_delta_ltv`, `confidence_interval`, `execution_count`, `decay_curve`를 가진다.

이 결정은 "intervention → LTV 기여"의 계산 경로를 Experiment 한 군데가 아니라 **Lever라는 공유 객체**를 경유하도록 재정의한다:

```
Experiment → 검증 → Lever
                      ↓
              Operation → 실행 → ΔLTV 기여 누적
```

## Consequences

### Positive
- **존재론 정합**: operation이 실험과 다른 본질("검증된 레버 반복")을 가진다는 점이 모델에 반영된다.
- **추적 가능성**: 모든 운영 액션이 원천 실험으로 역추적 가능해진다 — Experiment-to-Investment 체인이 UI에서 연속적으로 표현될 수 있다.
- **새로운 분석 능력 — Lever Decay**: 같은 레버를 반복 실행할 때 효과가 감쇠하는 현상을 베이지안으로 모델링할 수 있다. 현재 Module 4의 Ripple Forecast는 1회 롤아웃만 가정한다. Lever가 생기면 "이 레버를 이번 달 3번째 쓸 때 예상 ΔLTV"를 추정할 수 있다.
- **포트폴리오 관점**: "우리가 보유한 검증된 레버 N개, 각 레버의 잔여 가치 합계"라는 새로운 투자 자산 뷰가 가능해진다.

### Negative / Cost
- **문서 부채**: CLAUDE.md §7.1, UI Guide Modules 3–4, Engine Blueprint, Data Sources Guide가 모두 Lever 개념을 반영하도록 업데이트되어야 한다 (후속 작업).
- **사전 박제 리스크**: 아직 구현 전이므로 Lever 스키마 세부(필드, 관계)는 확정하지 않는다. 본 ADR은 방향만 고정한다.
- **"약식 실험" 엣지케이스**: A/B 플랫폼 없이 Pre/Post CausalImpact로 검증된 레버를 어떻게 Lever 객체로 저장할지는 후속 ADR에서 결정.

### Deferred (본 ADR 범위 밖)
- Lever의 정확한 데이터 스키마 (Engine Blueprint 업데이트 시)
- Lever를 다루는 UI 모듈의 네이밍/헤드라인 질문 (UI Guide 리팩터링 시)
- 기존 Module 3/4 재구조화 방식 — "Module 3를 Lever Execution Board로 개명" vs "Module 3/4 통합" vs 기타
- Lever decay 수학 모델 (shifted exponential? Bayesian hierarchical?)

## Alternatives Considered

| 대안 | 왜 선택하지 않았나 |
|---|---|
| (A) Module 3와 4 사이에 단순 cross-link만 추가 | 시각 패치일 뿐, 운영=실험의 존재론적 분리를 반영하지 못함. Lever decay 같은 새 분석 능력도 생기지 않음. |
| (B) 타임라인 오버레이에 "검증 연결선" 툴팁만 추가 | 가장 가벼우나 근본 해결 아님. 데이터 모델 부채가 남음. |
| (C) 5개 페이지 전체를 먼저 감사 후 결정 | 이미 핵심 단절 지점(Module 3↔4)이 식별됨. 전체 감사는 본 ADR 이후 후속 작업으로 진행하면 충분. |

## Next Steps (별도 작업으로 분리)

1. Lever 데이터 스키마 설계 → Engine Blueprint 업데이트 (ADR-002 예정)
2. Lever 관점에서 UI Guide Modules 3–4 재설계 (ADR-003 예정)
3. CLAUDE.md §7.1에 Lever 개념 1줄 언급 추가 (문서 정합성 확보)
4. 5개 페이지 네이밍 감사 — Lever ontology 확정 후에 수행 (사용자 원래 질문에 대한 후속 답변)

---

*본 ADR은 2026-04-08 Deep Interview 세션(4라운드, 모호성 100% → 10%)의 산출물이다. 인터뷰 맥락: 사용자가 "operation의 역할이 무엇인가"를 물었고, 이 질문이 페이지 네이밍 논의가 아니라 존재론 누락 이슈로 귀결되었다.*
