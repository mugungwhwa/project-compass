# treenod/compass 워크플로우 차용 스펙

**Date**: 2026-04-28
**Status**: Draft → User Review
**Source**: `treenod-mike/compass` (외부 임시 클론: `/Users/mike/Downloads/_treenod-compass-ref/`)
**Target**: `/Users/mike/Downloads/Compass/` (메인 워크스페이스, `mugungwhwa/project-compass`)
**Author**: Mike + Claude (brainstorming session)

---

## 1. 배경 및 목적

`treenod-mike/compass` 저장소는 본인이 개인 Compass(`/Users/mike/Downloads/Compass/compass/`)에서 파생한 **회사 포트폴리오용 간소화 복사본**이다. 그 과정에서 워크플로우/하네스 자동화 레이어를 더 정교하게 정리했고, 그 자산을 다시 원본(메인 워크스페이스)으로 가져오는 것이 본 작업의 목적.

**가져올 것**: 하네스 자동화 (hooks, slash command, 작업 컨벤션 문서)
**가져오지 않을 것**:
- `src/` 전체 (24개 차트 위젯, 디자인 토큰, 페이지 레이아웃)
- 디자인 시스템 문서 (`docs/top-card-research.md`, `verdict-redesign-concepts.md`, `wording-glossary.md`)
- 회사 도메인 코드 (`crawler/`, AppsFlyer/Sensor Tower/LSTM/MMM/VC sim 관련 spec·plan·API 라우트)
- 회사 운영 환경변수 (`.env.example`의 APPSFLYER 키 등)

본인은 **비개발자**이고 **추천-OK 워크플로우**를 선호하므로 spec 내부의 결정 항목은 단일 추천안 + 근거 형태로 제시한다.

---

## 2. 차용 항목 카탈로그

### 2.1 하네스 코어 (5개) — 차용

| # | 원본 경로 | 대상 경로 | 비고 |
|---|---|---|---|
| H1 | `.claude/settings.json` | `.claude/settings.json` (신규) | 3개 hook 등록. 기존 `settings.local.json`과 매처가 달라 공존 가능 |
| H2 | `scripts/compass-harness/session-brief.sh` | `scripts/harness/session-brief.sh` | **디렉터리명을 `harness/`로 중립화** (yieldo 리브랜드 후에도 의미 유지) |
| H3 | `scripts/compass-harness/precommit-gate.sh` | `scripts/harness/precommit-gate.sh` | **`cd compass` 보정 필수** (앱 서브디렉터리 차이) |
| H4 | `scripts/compass-harness/postpr-enrich.sh` | `scripts/harness/postpr-enrich.sh` | 그대로 |
| H5 | `.claude/commands/compass-start.md` | `.claude/commands/dev-start.md` | **명령어 이름을 `/dev-start`로 중립화**. worktree 경로는 §3.2에서 결정 |

### 2.2 문서 컨벤션 (3개) — 차용

| # | 원본 경로 | 대상 경로 | 비고 |
|---|---|---|---|
| D1 | CLAUDE.md §10 (작업 컨벤션) | 메인 `CLAUDE.md` 새 섹션 추가 | 본인 yieldo 리브랜드 컨텍스트로 보정 (skills 이름, hooks 매처) |
| D2 | `docs/superpowers/specs/` 컨벤션 | 이미 존재 (`docs/superpowers/specs/`) | 명명 규약 `YYYY-MM-DD-<topic>-design.md` 통일 |
| D3 | `docs/superpowers/plans/` 컨벤션 | 이미 존재 (`docs/superpowers/plans/`) | spec → plan → 구현 흐름 명문화 |

### 2.3 부수 작업 — 차용

| # | 변경 | 이유 |
|---|---|---|
| P1 | `compass/package.json` 에 `"test"` 스크립트 추가 | precommit-gate.sh가 `npm test`를 호출하나 현재는 미정의 → 게이트 두 번째 단계가 자동 스킵됨 |

### 2.4 명시 제외 (사용자 요구: 디자인 + 회사 도메인 분리)

- `src/` 전체, `public/`, `components.json`, `postcss.config.mjs`, `src/styles/globals.css`
- treenod README.md의 브랜드 메타 (purple primary, Rocko Ultra, Pretendard 등)
- treenod CLAUDE.md §2 Tech Stack(디자인 부분), §6 Design System, §7 핵심 컨벤션 (Chart/Layout/Typography)
- treenod `docs/top-card-research.md`, `verdict-redesign-concepts.md`, `wording-glossary.md`
- treenod `docs/superpowers/specs/2026-04-27-gameboard-design-system-*`, `2026-04-27-vc-sim-typography-hierarchy-design.md`
- `crawler/` 전체
- `vercel.json` 의 `crons` (회사 API 라우트)
- `.env.example` (APPSFLYER 키 등 회사 운영)
- `docs/operations/appsflyer-sdk-integration-request.md`
- treenod `docs/superpowers/specs/`·`plans/` 의 도메인 spec/plan (AppsFlyer, Sensor Tower, LSTM, Bayesian, MMM, VC sim, marketing simulator)

---

## 3. 본인 워크스페이스 보정 사항

### 3.1 앱 루트 차이 (필수)

| 항목 | treenod | 본인 워크스페이스 |
|---|---|---|
| Next.js 앱 위치 | 저장소 루트 | `compass/` 서브디렉터리 |
| `tsconfig.json` | 루트 | `compass/tsconfig.json` |
| `package.json` | 루트 | `compass/package.json` |

**보정**: `precommit-gate.sh`에서 `cd "${CLAUDE_PROJECT_DIR:-$(pwd)}/compass"` 로 변경.
**검증**: 본 spec 후속 plan에서 단위 테스트로 확인.

### 3.2 Worktree 컨벤션 (사용자 결정 필요)

본인 워크스페이스는 현재 `.worktrees/yieldo-rebrand/` (워크스페이스 내부 hidden) 패턴을 사용 중. treenod는 `../compass-worktrees/<type>-<name>/` (외부) 패턴.

**옵션 A (추천)**: 본인 기존 패턴 유지 → `.worktrees/<type>-<name>/`
- 장점: 이미 진행 중인 yieldo-rebrand worktree와 일관성 유지
- 단점: 워크스페이스 내부에 있어 `find`/grep 도구가 의도치 않게 worktree까지 인덱싱할 수 있음

**옵션 B**: treenod 외부 패턴 채택 → `../compass-worktrees/<type>-<name>/`
- 장점: 인덱싱/grep 노이즈 분리, 본 작업의 `_treenod-compass-ref/` 와 같은 외부 격리 원칙과 일관
- 단점: 기존 `.worktrees/yieldo-rebrand/` 마이그레이션 필요

→ **단일 추천: 옵션 A 유지**. 사유: yieldo 리브랜드가 진행 중이라 worktree 이동은 추가 마찰. 인덱싱 노이즈는 `.gitignore` + `vitest.config.ts` exclude로 차단 가능.

### 3.3 `.claude/settings.json` vs `settings.local.json` 분리

기존 `settings.local.json`:
- `permissions.allow` 다수 (개인 권한 목록 — 그대로 유지)
- `hooks.PostToolUse[matcher: "Write|Edit"]` → `yieldo-redflags.sh` 호출

신규 `settings.json` (이번 spec):
- `hooks.SessionStart`, `hooks.PreToolUse[matcher: "Bash"]`, `hooks.PostToolUse[matcher: "Bash"]`
- 매처가 `Write|Edit` vs `Bash`로 달라 **충돌 없음**

Claude Code는 두 파일을 머지하므로 그대로 공존.

### 3.4 디렉터리/명령어 이름 중립화 (yieldo 리브랜드 친화)

| 항목 | treenod 원본 | 본인 워크스페이스 적용 | 사유 |
|---|---|---|---|
| 스크립트 디렉터리 | `scripts/compass-harness/` | `scripts/harness/` | 향후 yieldo로 완전 리브랜드 시 이름 변경 비용 0 |
| 슬래시 커맨드 | `/compass-start` | `/dev-start` | 동일 |

CLAUDE.md §10에서 이 이름들을 그대로 참조.

### 3.5 CLAUDE.md §10 보정 포인트

treenod 원본 §10에서 본인 워크스페이스로 옮길 때 변경할 부분:

| 원본 §10 항목 | 보정 |
|---|---|
| §10.2 Worktree 경로 `../compass-worktrees/<type>-<name>/` | `.worktrees/<type>-<name>/` (3.2 결정 반영) |
| §10.2 시작 커맨드 `/compass-start` | `/dev-start` |
| §10.3 GitHub 계정 분리 (treenod-mike vs mugungwhwa) | **그대로 유지**. 본인 워크스페이스가 회사·개인 둘 다 작업하는 환경이라 더 필요 |
| §10.4 자동 작동 표 | tsc 경로 보정 (`compass/` 서브디렉터리) 명시 |
| §10.5 수동 실행 슬래시 커맨드 | 본인 환경에 맞게: `/yieldo-dev`, `/yieldo-verify`, `/arch-check`, `/ultrareview`, `/loop` 등 (compass-dev 대신 yieldo-dev) |

---

## 4. 파일 변경 계획 (구체)

### 4.1 신규 생성

```
.claude/settings.json                            ← H1 (3개 hook)
.claude/commands/dev-start.md                    ← H5 (worktree 자동화)
scripts/harness/session-brief.sh                 ← H2 (chmod +x)
scripts/harness/precommit-gate.sh                ← H3 (cd compass 보정 + chmod +x)
scripts/harness/postpr-enrich.sh                 ← H4 (chmod +x)
```

### 4.2 수정

```
CLAUDE.md                                        ← §10 (작업 컨벤션) 신규 섹션 append
compass/package.json                             ← scripts.test 추가 (P1)
```

### 4.3 미이동 (회사 spec 본문)

`2026-04-24-compass-harness-design.md` 본문은 본인 워크스페이스에 동봉하지 않는다.
이번 adoption spec(본 문서)이 동일한 의도·근거를 본인 환경 컨텍스트에서 다시 정리하므로 중복 불필요.

---

## 5. 보안/IP 가드레일

1. **임시 클론 격리**: `_treenod-compass-ref/`는 메인 워크스페이스 외부에 위치. 작업 종료 시 `rm -rf /Users/mike/Downloads/_treenod-compass-ref/`.
2. **회사 도메인 코드 미반입**: §2.4 제외 목록의 어떤 파일도 본인 워크스페이스로 복사하지 않음.
3. **검증**: 차용 후 `git status`로 새 파일 목록 점검. `crawler/`, `appsflyer`, `sensor-tower`, `gameboard`, `levelplay` 키워드가 나오면 즉시 회수.
4. **environment vars**: treenod `.env.example`의 키는 가져오지 않음. 본인 워크스페이스의 기존 `.env*` 패턴 유지.

---

## 6. 검증 / 진단 플랜 (구현 후)

| # | 검증 항목 | 방법 |
|---|---|---|
| V1 | session-brief 작동 | 새 Claude 세션 시작 → 컨텍스트 블록에 브랜치/PR/스펙 표시 확인 |
| V2 | precommit-gate 작동 (성공) | 무해 변경 후 `git commit` → tsc 통과 후 커밋 진행 |
| V3 | precommit-gate 작동 (차단) | TS 오류 임시 삽입 후 `git commit` → exit 2 차단 확인, 이후 롤백 |
| V4 | postpr-enrich 작동 | 더미 PR 생성 → `@coderabbitai review` 코멘트 + Vercel preview URL 출력 확인 후 PR 닫기 |
| V5 | /dev-start 작동 | `/dev-start docs harness-test` → `.worktrees/docs-harness-test/` 생성 확인 후 정리 |
| V6 | IP 누출 점검 | 차용 후 `git diff --name-only main` 으로 새 파일 목록 검사. 회사 도메인 키워드 없음 확인 |

---

## 7. 미해결 이슈 (writing-plans 단계로 이월)

1. **`compass/package.json`의 test 스크립트 정의 방식**: 더미(`echo no tests yet && exit 0`) vs 실제 vitest 도입. 본 spec에서는 더미 권장 (precommit-gate를 깨지 않으면서 향후 vitest 도입 시 교체) — plan 단계에서 확정.
2. **`.worktrees/` 가 `tsconfig.json`/`vitest.config.ts` exclude에 들어 있는지 점검**. 누락 시 plan 단계에서 추가.
3. **Arch-guard hook 통합**: 본인 워크스페이스에는 이미 `arch-guard:pre-commit` 스킬이 있음. precommit-gate.sh에서 추가로 호출할지 또는 별도 분리할지 — plan 단계 결정.
4. **`.claude/hooks/yieldo-redflags.sh` (PostToolUse:Write|Edit) 와의 시너지**: 디자인 변경 감지 hook이 별도로 작동 중. 새 하네스가 그것과 어떻게 협력하는지 §10 문서에 한 줄 명시 필요.

---

## 8. 참고

- treenod 원본 spec: `_treenod-compass-ref/docs/superpowers/specs/2026-04-24-compass-harness-design.md`
- 본인 워크스페이스 메모리:
  - `feedback_workflow_brainstorm_first.md` (brainstorming + ultraplan 의무화)
  - `workflow_branching.md` (네이밍, 3일 규칙, worktree 시점)
- Claude Code hooks 공식 문서: https://docs.claude.com/en/docs/claude-code/hooks

---

## 9. 다음 단계

1. **사용자 검토** (본 spec 파일)
2. 승인 → `superpowers:writing-plans` 스킬로 단계별 구현 계획서 작성
3. 구현 계획서 승인 → 실제 파일 생성/수정
4. 검증 §6
5. 임시 클론 디렉터리 삭제
