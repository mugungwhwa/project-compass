# yieldo Context Index

**용도**: 새 세션에서 이 파일만 먼저 읽으면 전체 프로젝트 상태를 파악하고, 필요한 문서만 선택적으로 로드할 수 있음.

---

## 프로젝트 한줄 요약

모바일 게임 업계용 Signal-to-Yield Operating Terminal — A/B 테스트, 라이브 운영, UA 캠페인 등 모든 인터벤션이 실제로 투자 가치(LTV)를 창출하는지 측정하고, 그 결과를 자본 배분 결정으로 번역하는 SaaS 플랫폼. 핵심 파이프라인: ATE → ΔLTV → 자본 배분 결정.

## 현재 상태

- **단계**: 설계 문서 완료, 코드 미작성
- **팀**: 2인 (풀스택 개발자 + 데이터/AI 엔지니어)
- **다음 액션**: `/yieldo-dev onboarding` 또는 `/yieldo-dev phase 1`로 개발 시작

## 문서 맵 — "이 작업엔 이 문서를"

| 작업 | 읽어야 할 문서 | 읽을 섹션 |
|---|---|---|
| **덱 리디자인 (v2)** | `Deck_Redesign_Guide.md` + 기존 `Deck.html` | 가이드 전체 (5KB) |
| **프로젝트 이해 / 방향 질문** | `CLAUDE.md` | 전체 (35KB) |
| **온보딩 구현** | `UI_Guide.md` Sec 7 + `Engine_Blueprint.md` Sec 2 | 온보딩 플로우 + Stage 0 |
| **Module 1 (Overview) 구현** | `UI_Guide.md` Sec 8.1 + `Engine_Blueprint.md` Sec 4-6 | 화면 + 계산 로직 |
| **Module 3 (Action Impact) 구현** ⭐ | `UI_Guide.md` Sec 8.3 + `Engine_Blueprint.md` Sec 5 | 인터벤션→LTV 인과 추정 (핵심 차별화) |
| **Module 4 (Experiment Investment) 구현** ⭐ | `UI_Guide.md` Sec 8.4 + `Engine_Blueprint.md` Sec 5 + `CLAUDE.md` Sec 6 | ATE→ΔLTV→Experiment ROI 번역 파이프라인 |
| **리텐션 모델 구현** | `Engine_Blueprint.md` Sec 4 + `CLAUDE.md` Sec 3 | PREDICT + 5대 성질 |
| **LTV/Payback/시그널 구현** | `Engine_Blueprint.md` Sec 5-6 | TRANSLATE + DECIDE |
| **재무 메트릭 구현** | `Engine_Blueprint.md` Sec 5.3 + `UI_Guide.md` Sec 6.4 | 재무 계산 + 입력 UX |
| **MMP 연동 (AppsFlyer)** | `Data_Sources_Guide.md` Sec 5.1 | API 엔드포인트 + 스키마 |
| **실험 연동 (Statsig) — ATE→ΔLTV 번역** | `Data_Sources_Guide.md` Sec 5.2 + `Tech_Stack.md` Sec 4.2 + `CLAUDE.md` Sec 6 | API + 롤아웃 + experiment-to-investment 파이프라인 |
| **데이터 수집 (크롤링)** | `Data_Sources_Guide.md` Sec 2-3 | Apple RSS + 벤치마크 |
| **DB 스키마 확인** | `Engine_Blueprint.md` Sec 2 + `Data_Sources_Guide.md` Sec 4 | 테이블 정의 |
| **FSD 폴더 구조** | `Tech_Stack.md` Sec 2.2 | 디렉토리 구조 |
| **법적 질문** | `Legal.md` | 전체 (13KB) |
| **UI 디자인 토큰/패턴** | `UI_Guide.md` Sec 8 | 색상/타이포/컴포넌트 |
| **투자 덱 / 사업계획** | `Business_Plan.md` 또는 `Deck.html` | 필요 섹션 |
| **개발 명령 실행** | `/yieldo-dev` 스킬 (`.claude/skills/yieldo-dev/`) | 스킬 호출 |
| **코드 검증** | `/yieldo-verify` 스킬 (`.claude/skills/yieldo-verify/`) | 스킬 호출 |

## 핵심 의사결정 (변경 금지)

1. **크롤링 금지** — Sensor Tower/AppMagic/data.ai 크롤링은 한국법상 형사 위험. 공개 벤치마크 + 고객 데이터 + 라이선싱만 사용.
2. **NumPyro** — 베이지안 추론 프레임워크 (PyMC/Stan 아님). JAX 기반, SVI 실시간.
3. **5대 성질 제약** — 모든 리텐션 커브 피팅에서 b ∈ (-1, 0), c ≥ 0 필수.
4. **Decision-first UI** — 모든 화면은 "Should we...?" 질문으로 시작. 트래픽 라이트 금지.
5. **재무 = 영업비밀** — PIPA 개인정보 아님. AES-256 + RLS + 감사 추적 필수.
6. **Value-first 온보딩** — MMP 연동 후 벤치마크 먼저 보여주고, 그 후에 재무 요청.
7. **우측 사이드바** — Navigation + Context + Actions. 300px 고정, Cmd+\ 토글.

## 파일 크기 참조

| 파일 | 크기 | 전체 로드 필요? |
|---|---|---|
| CLAUDE.md | 35KB | 방향 질문 시만 |
| Tech_Stack.md | 75KB | 섹션별 부분 로드 |
| Engine_Blueprint.md | 40KB | 섹션별 부분 로드 |
| Data_Sources_Guide.md | 32KB | 섹션별 부분 로드 |
| UI_Guide.md | 30KB | 섹션별 부분 로드 |
| Legal.md | 13KB | 법적 질문 시 전체 |
| yieldo-dev.md | 10KB | 개발 시 전체 |
| **CONTEXT_INDEX.md** | **3KB** | **항상 먼저** |
