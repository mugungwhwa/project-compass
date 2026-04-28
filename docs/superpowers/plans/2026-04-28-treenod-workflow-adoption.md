# treenod/compass 워크플로우 차용 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** treenod/compass 의 하네스(SessionStart hook + PreCommit gate + PostPR enrich + `/dev-start` 슬래시 커맨드 + CLAUDE.md §10 작업 컨벤션)를 메인 워크스페이스에 도입한다. 디자인/회사 도메인 자산은 일절 가져오지 않는다.

**Architecture:** `.claude/settings.json` 에 3개 hook을 등록하고, 실행 로직은 `scripts/harness/` 의 3개 bash 스크립트로 분리. 새 작업 시작은 `/dev-start` 슬래시 커맨드로 worktree+브랜치+install을 자동화. 본 도입 작업 자체는 main 브랜치에서 atomic commit 시리즈로 진행 (메타 파일만 변경).

**Tech Stack:** bash + jq + gh CLI + Claude Code hooks (SessionStart / PreToolUse:Bash / PostToolUse:Bash) + Next.js 15 (compass/ 서브디렉터리)

**Spec:** `docs/superpowers/specs/2026-04-28-treenod-workflow-adoption.md`

**Source:** `/Users/mike/Downloads/_treenod-compass-ref/` (외부 임시 클론, 작업 종료 시 삭제)

---

## File Structure (변경 요약)

```
.claude/
├── settings.json                              ← 신규 (Task 5)
└── commands/
    └── dev-start.md                           ← 신규 (Task 6)

scripts/
└── harness/
    ├── session-brief.sh                       ← 신규 (Task 2)
    ├── precommit-gate.sh                      ← 신규 (Task 3, cd compass 보정)
    └── postpr-enrich.sh                       ← 신규 (Task 4)

CLAUDE.md                                      ← §10 append (Task 7)
compass/package.json                           ← scripts.test 추가 (Task 1)
```

각 파일의 단독 책임:
- `session-brief.sh` — 세션 시작 시 git/PR/spec 상태 markdown 출력 (stdout)
- `precommit-gate.sh` — `git commit` 직전에 tsc + npm test 실행, 실패 시 exit 2
- `postpr-enrich.sh` — `gh pr create` 직후 CodeRabbit 트리거 + Vercel preview URL 폴링
- `dev-start.md` — `/dev-start <type> <name>` 슬래시 커맨드 정의
- `settings.json` — 위 3개 hook 등록 (`settings.local.json`과 매처가 달라 공존)
- CLAUDE.md §10 — 사용자 프로필 + worktree 규약 + 계정 분리 + 자동 작동 표 + 수동 슬래시 커맨드

---

## Task 순서 (의존성)

```
Task 1 (compass/package.json: test 더미)
        ↓
Task 2 (session-brief.sh) ─┐
                           │
Task 3 (precommit-gate.sh) ┤   ← Task 1 의존 (npm test 호출)
                           │
Task 4 (postpr-enrich.sh) ─┤
                           ↓
Task 5 (.claude/settings.json — 3 hook 등록)
        ↓
Task 6 (.claude/commands/dev-start.md)
        ↓
Task 7 (CLAUDE.md §10)
        ↓
Task 8 (통합 검증 + 임시 클론 정리)
```

---

## Task 1: `compass/package.json` 에 더미 test 스크립트 추가

**목적**: precommit-gate.sh가 `npm test`를 호출하므로 test 스크립트가 정의되어 있어야 게이트가 의미있게 작동. 현재 `compass/package.json`은 `dev/build/start/lint`만 있어 게이트의 두 번째 단계가 자동 스킵됨. 더미로 시작하고 향후 vitest 도입 시 교체.

**Files:**
- Modify: `/Users/mike/Downloads/Compass/compass/package.json`

- [ ] **Step 1: 현재 scripts 블록 확인**

Run: `node -e "console.log(JSON.stringify(require('/Users/mike/Downloads/Compass/compass/package.json').scripts, null, 2))"`

Expected output:
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

- [ ] **Step 2: `test` 키 추가 (Edit tool)**

Edit `/Users/mike/Downloads/Compass/compass/package.json`:

old_string:
```
    "lint": "eslint"
```

new_string:
```
    "lint": "eslint",
    "test": "echo 'no tests yet' && exit 0"
```

- [ ] **Step 3: 변경 확인**

Run: `cd /Users/mike/Downloads/Compass/compass && npm test`

Expected output:
```
> compass@... test
> echo 'no tests yet' && exit 0

no tests yet
```

종료 코드 0 (확인: `echo $?` → `0`)

- [ ] **Step 4: Commit**

```bash
cd /Users/mike/Downloads/Compass
git add compass/package.json
git commit -m "chore(harness): add dummy test script for precommit-gate compatibility

precommit-gate.sh runs 'npm test' as second stage. Without a defined
test script the gate silently skips. Dummy script keeps gate functional
until real vitest suite is introduced."
```

---

## Task 2: `scripts/harness/session-brief.sh` 작성

**목적**: 세션 시작 시 현재 브랜치, 최근 커밋 3개, 열린 PR, 최신 spec 3개, 활성 worktree를 markdown으로 출력해 Claude에게 자동 주입.

**Files:**
- Create: `/Users/mike/Downloads/Compass/scripts/harness/session-brief.sh`

- [ ] **Step 1: 디렉터리 확인 및 생성**

Run: `mkdir -p /Users/mike/Downloads/Compass/scripts/harness && ls /Users/mike/Downloads/Compass/scripts/harness/`

Expected: 빈 디렉터리 (또는 디렉터리만 존재).

- [ ] **Step 2: `session-brief.sh` 작성 (Write tool)**

Write `/Users/mike/Downloads/Compass/scripts/harness/session-brief.sh` with content:

```bash
#!/usr/bin/env bash
# scripts/harness/session-brief.sh
# SessionStart hook — 메인 워크스페이스 현재 상태 요약을 Claude에게 주입
set -euo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "(not a git repo)")
COMMITS=$(git log --oneline -3 2>/dev/null || echo "(no commits)")

if command -v gh >/dev/null 2>&1; then
  PRS=$(gh pr list --state open --limit 5 \
    --json number,title,headRefName,isDraft \
    --jq '.[] | "#\(.number) [\(if .isDraft then "draft" else "open" end)] \(.title) (\(.headRefName))"' \
    2>/dev/null || echo "(gh CLI error)")
else
  PRS="(gh CLI not installed)"
fi

LATEST_SPECS=$(ls -t docs/superpowers/specs/*.md 2>/dev/null | head -3 | xargs -n1 basename 2>/dev/null || echo "(no specs)")

WORKTREES=$(git worktree list 2>/dev/null | awk '{print "  • " $0}' || echo "  (none)")

cat <<EOF
# Compass 세션 컨텍스트 (auto-injected)

## 현재 브랜치
$BRANCH

## 최근 커밋 3개
$COMMITS

## 열린 PR
${PRS:-(none)}

## 최신 스펙 3개
$LATEST_SPECS

## 활성 worktree
$WORKTREES
EOF
```

- [ ] **Step 3: 실행 권한 부여**

Run: `chmod +x /Users/mike/Downloads/Compass/scripts/harness/session-brief.sh`

Verify: `ls -l /Users/mike/Downloads/Compass/scripts/harness/session-brief.sh`

Expected: `-rwxr-xr-x` 권한.

- [ ] **Step 4: 단독 실행 검증**

Run:
```bash
cd /Users/mike/Downloads/Compass
bash scripts/harness/session-brief.sh
```

Expected output (실제 값은 환경마다 다름):
```
# Compass 세션 컨텍스트 (auto-injected)

## 현재 브랜치
main

## 최근 커밋 3개
<3개 commit hash + message>

## 열린 PR
<gh pr list 결과 또는 (none)>

## 최신 스펙 3개
2026-04-28-treenod-workflow-adoption.md
<2개 더>

## 활성 worktree
  • /Users/mike/Downloads/Compass  <hash> [main]
  • /Users/mike/Downloads/Compass/.worktrees/yieldo-rebrand  <hash> [feature/yieldo-rebrand]
```

확인 포인트: 5개 섹션 모두 출력되고 빈 값 fallback (`(none)`, `(no specs)` 등)이 정상 작동.

- [ ] **Step 5: Commit**

```bash
cd /Users/mike/Downloads/Compass
git add scripts/harness/session-brief.sh
git commit -m "feat(harness): add session-brief.sh for SessionStart hook

Outputs branch, recent commits, open PRs, latest specs, and active
worktrees as markdown context block on session start. Pulled from
treenod/compass workflow with no modifications (workspace-agnostic)."
```

---

## Task 3: `scripts/harness/precommit-gate.sh` 작성 (cd compass 보정)

**목적**: `git commit` 직전에 `compass/` 서브디렉터리에서 tsc + npm test 자동 실행. 실패 시 exit 2로 커밋 차단.

**Files:**
- Create: `/Users/mike/Downloads/Compass/scripts/harness/precommit-gate.sh`

- [ ] **Step 1: 스크립트 작성 (Write tool)**

Write `/Users/mike/Downloads/Compass/scripts/harness/precommit-gate.sh` with content:

```bash
#!/usr/bin/env bash
# scripts/harness/precommit-gate.sh
# PreToolUse:Bash hook — git commit 전에 compass/ 안에서 tsc + npm test 자동 검증
# 워크스페이스 루트(/Users/mike/Downloads/Compass)와 앱 루트(compass/) 차이 보정
set -uo pipefail

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // ""' 2>/dev/null || echo "")

# git commit 이 아니면 즉시 통과
if ! echo "$CMD" | grep -qE '(^|[[:space:]&;|])git[[:space:]]+commit([[:space:]]|$)'; then
  exit 0
fi

WORKSPACE_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
APP_DIR="$WORKSPACE_DIR/compass"

if [ ! -d "$APP_DIR" ]; then
  echo "❌ precommit-gate: compass/ 서브디렉터리를 찾지 못함 ($APP_DIR)" >&2
  exit 2
fi

cd "$APP_DIR"

echo "━━━ Compass pre-commit gate (in compass/) ━━━" >&2

echo "▸ tsc --noEmit..." >&2
if ! npx tsc --noEmit 2>&1 >&2; then
  cat >&2 <<EOF
❌ 커밋 차단: TypeScript 타입 오류 발견
   위 출력의 오류를 먼저 수정하세요.
EOF
  exit 2
fi
echo "  ✅ tsc 통과" >&2

if [ -f package.json ] && node -e "process.exit(require('./package.json').scripts?.test ? 0 : 1)" 2>/dev/null; then
  echo "▸ npm test..." >&2
  if ! npm test 2>&1 >&2; then
    cat >&2 <<EOF
❌ 커밋 차단: 테스트 실패
   실패한 테스트를 먼저 수정하세요.
EOF
    exit 2
  fi
  echo "  ✅ test 통과" >&2
else
  echo "  ⤼ test 스크립트 없음 — 스킵" >&2
fi

echo "━━━ 게이트 통과 — 커밋 진행 ━━━" >&2
exit 0
```

- [ ] **Step 2: 실행 권한 부여**

Run: `chmod +x /Users/mike/Downloads/Compass/scripts/harness/precommit-gate.sh`

- [ ] **Step 3: 단독 검증 — 스킵 경로 (비-commit 명령)**

Run:
```bash
cd /Users/mike/Downloads/Compass
echo '{"tool_input":{"command":"ls -la"}}' | bash scripts/harness/precommit-gate.sh
echo "exit code: $?"
```

Expected output:
```
exit code: 0
```

(stderr 출력 없음. 즉시 exit 0.)

- [ ] **Step 4: 단독 검증 — 성공 경로 (git commit)**

Run:
```bash
cd /Users/mike/Downloads/Compass
echo '{"tool_input":{"command":"git commit -m test"}}' | bash scripts/harness/precommit-gate.sh
echo "exit code: $?"
```

Expected stderr (시간 약 10–30초):
```
━━━ Compass pre-commit gate (in compass/) ━━━
▸ tsc --noEmit...
  ✅ tsc 통과
▸ npm test...

> compass@... test
> echo 'no tests yet' && exit 0

no tests yet
  ✅ test 통과
━━━ 게이트 통과 — 커밋 진행 ━━━
```

Expected exit code: `0`

확인 포인트: tsc가 `compass/` 안에서 실행되었는지 (오류 없이 종료). 만약 tsc 오류가 나오면 일단 `compass/` 의 기존 코드 문제이므로 가드 작동을 입증한 것 — 다음 step에서 차단 검증으로 활용.

- [ ] **Step 5: 단독 검증 — 차단 경로 (의도적 TS 오류)**

임시 오류 파일 생성:
```bash
cd /Users/mike/Downloads/Compass
cat > compass/__precommit_gate_test.ts <<'EOF'
const x: number = "not a number"; // intentional type error
export {};
EOF
```

게이트 호출:
```bash
echo '{"tool_input":{"command":"git commit -m test"}}' | bash scripts/harness/precommit-gate.sh
echo "exit code: $?"
```

Expected stderr (요약):
```
▸ tsc --noEmit...
__precommit_gate_test.ts(1,7): error TS2322: Type 'string' is not assignable to type 'number'.
❌ 커밋 차단: TypeScript 타입 오류 발견
```

Expected exit code: `2`

정리:
```bash
rm /Users/mike/Downloads/Compass/compass/__precommit_gate_test.ts
```

- [ ] **Step 6: Commit**

```bash
cd /Users/mike/Downloads/Compass
git add scripts/harness/precommit-gate.sh
git commit -m "feat(harness): add precommit-gate.sh with compass/ subdir cd

Adapts treenod/compass precommit-gate.sh to this workspace's structure
where Next.js app lives in compass/ subdirectory. Verifies tsc + npm
test inside compass/ before allowing git commit through. Exits 2 on
failure to block the commit."
```

`git commit` 실행 시 게이트 자체가 hook으로는 아직 등록되지 않았으므로(Task 5에서 등록), 이 commit은 정상 통과.

---

## Task 4: `scripts/harness/postpr-enrich.sh` 작성

**목적**: `gh pr create` 직후 CodeRabbit 트리거 코멘트 추가 + Vercel preview URL 폴링.

**Files:**
- Create: `/Users/mike/Downloads/Compass/scripts/harness/postpr-enrich.sh`

- [ ] **Step 1: 스크립트 작성 (Write tool)**

Write `/Users/mike/Downloads/Compass/scripts/harness/postpr-enrich.sh` with content:

```bash
#!/usr/bin/env bash
# scripts/harness/postpr-enrich.sh
# PostToolUse:Bash hook — gh pr create 직후 CodeRabbit 트리거 + Vercel URL 조회
set -uo pipefail

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // ""' 2>/dev/null || echo "")
STDOUT=$(echo "$INPUT" | jq -r '.tool_response.stdout // ""' 2>/dev/null || echo "")
EXIT_CODE=$(echo "$INPUT" | jq -r '.tool_response.exit_code // 1' 2>/dev/null || echo "1")

if ! echo "$CMD" | grep -qE '(^|[[:space:]&;|])gh[[:space:]]+pr[[:space:]]+create'; then
  exit 0
fi
if [ "$EXIT_CODE" != "0" ]; then
  exit 0
fi

PR_URL=$(echo "$STDOUT" | grep -oE 'https://github\.com/[^[:space:]]+/pull/[0-9]+' | head -1)
if [ -z "$PR_URL" ]; then
  exit 0
fi
PR_NUM=$(echo "$PR_URL" | grep -oE '[0-9]+$')

echo "━━━ Compass post-PR enrichment (PR #$PR_NUM) ━━━" >&2

if command -v gh >/dev/null 2>&1; then
  if gh pr comment "$PR_NUM" --body "@coderabbitai review" >/dev/null 2>&1; then
    echo "  ✅ CodeRabbit review 트리거됨" >&2
  else
    echo "  ⚠️  CodeRabbit 트리거 실패 (수동 추가 필요)" >&2
  fi
fi

VERCEL_URL=""
for i in 1 2 3; do
  sleep 10
  VERCEL_URL=$(gh pr view "$PR_NUM" --json comments \
    --jq '.comments[] | select(.author.login == "vercel" or .author.login == "vercel[bot]") | .body' 2>/dev/null \
    | grep -oE 'https://[a-z0-9-]+\.vercel\.app[^[:space:])]*' | head -1 || echo "")
  [ -n "$VERCEL_URL" ] && break
done

if [ -n "$VERCEL_URL" ]; then
  echo "  ✅ Vercel Preview: $VERCEL_URL" >&2
else
  echo "  ⤼ Vercel Preview: 아직 배포 중 (1–2분 후 PR 페이지에서 확인)" >&2
fi

echo "━━━ PR: $PR_URL ━━━" >&2
exit 0
```

- [ ] **Step 2: 실행 권한 부여**

Run: `chmod +x /Users/mike/Downloads/Compass/scripts/harness/postpr-enrich.sh`

- [ ] **Step 3: 단독 검증 — 스킵 경로 (비-PR 명령)**

Run:
```bash
cd /Users/mike/Downloads/Compass
echo '{"tool_input":{"command":"ls -la"},"tool_response":{"stdout":"foo","exit_code":0}}' | bash scripts/harness/postpr-enrich.sh
echo "exit code: $?"
```

Expected output:
```
exit code: 0
```

(stderr 출력 없음.)

- [ ] **Step 4: 단독 검증 — 스킵 경로 (실패한 gh pr create)**

Run:
```bash
echo '{"tool_input":{"command":"gh pr create"},"tool_response":{"stdout":"","exit_code":1}}' | bash scripts/harness/postpr-enrich.sh
echo "exit code: $?"
```

Expected output:
```
exit code: 0
```

(stderr 출력 없음. exit code != 0이라 즉시 exit 0.)

- [ ] **Step 5: 단독 검증 — PR URL 추출 동작 (실제 PR API 호출 없이)**

PR_URL 추출 정규식만 빠르게 검증:
```bash
echo "https://github.com/mugungwhwa/project-compass/pull/42" | grep -oE 'https://github\.com/[^[:space:]]+/pull/[0-9]+'
```

Expected: `https://github.com/mugungwhwa/project-compass/pull/42`

(실제 `gh pr comment` / `gh pr view` 폴링은 통합 단계 또는 사용자 수동 PR로 검증.)

- [ ] **Step 6: Commit**

```bash
cd /Users/mike/Downloads/Compass
git add scripts/harness/postpr-enrich.sh
git commit -m "feat(harness): add postpr-enrich.sh

Triggers @coderabbitai review and polls for Vercel preview URL after
gh pr create succeeds. Pulled from treenod/compass workflow without
modification."
```

---

## Task 5: `.claude/settings.json` 신규 생성 (3 hook 등록)

**목적**: 작성한 3개 스크립트를 SessionStart / PreToolUse:Bash / PostToolUse:Bash 훅으로 등록. 기존 `settings.local.json`(매처 `Write|Edit`)과 매처가 달라 충돌하지 않음.

**Files:**
- Create: `/Users/mike/Downloads/Compass/.claude/settings.json`

- [ ] **Step 1: 기존 settings.local.json 확인 (충돌 점검)**

Run:
```bash
cat /Users/mike/Downloads/Compass/.claude/settings.local.json | jq '.hooks | keys'
cat /Users/mike/Downloads/Compass/.claude/settings.local.json | jq '.hooks.PostToolUse[0].matcher'
```

Expected:
```
[
  "PostToolUse"
]
"Write|Edit"
```

→ 새로 등록할 PostToolUse 매처 `Bash`와 충돌 없음 확인.

- [ ] **Step 2: `settings.json` 작성 (Write tool)**

Write `/Users/mike/Downloads/Compass/.claude/settings.json` with content:

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume|clear",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/scripts/harness/session-brief.sh\""
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/scripts/harness/precommit-gate.sh\""
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/scripts/harness/postpr-enrich.sh\""
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 3: JSON 유효성 검증**

Run: `jq . /Users/mike/Downloads/Compass/.claude/settings.json > /dev/null && echo "valid"`

Expected output:
```
valid
```

- [ ] **Step 4: hook 등록 확인**

Run:
```bash
jq -r '.hooks | keys[]' /Users/mike/Downloads/Compass/.claude/settings.json
```

Expected output:
```
PostToolUse
PreToolUse
SessionStart
```

- [ ] **Step 5: Commit**

```bash
cd /Users/mike/Downloads/Compass
git add .claude/settings.json
git commit -m "feat(harness): register 3 hooks in .claude/settings.json

SessionStart -> session-brief.sh
PreToolUse:Bash -> precommit-gate.sh
PostToolUse:Bash -> postpr-enrich.sh

Coexists with settings.local.json (matcher: Write|Edit) without
conflict. Hooks load on next Claude Code session restart."
```

---

## Task 6: `.claude/commands/dev-start.md` 슬래시 커맨드 작성

**목적**: 새 작업 시작 흐름(worktree 생성 + 브랜치 + npm install + brainstorming)을 한 줄 커맨드로 축약. Worktree 경로는 spec §3.2 옵션 A에 따라 `.worktrees/<type>-<name>/`.

**Files:**
- Create: `/Users/mike/Downloads/Compass/.claude/commands/dev-start.md`

- [ ] **Step 1: 디렉터리 확인**

Run: `mkdir -p /Users/mike/Downloads/Compass/.claude/commands && ls /Users/mike/Downloads/Compass/.claude/commands/`

Expected: 빈 디렉터리.

- [ ] **Step 2: 슬래시 커맨드 작성 (Write tool)**

Write `/Users/mike/Downloads/Compass/.claude/commands/dev-start.md` with content:

````markdown
---
description: 새 작업 시작 — worktree + 브랜치 + npm install + (필요 시) brainstorming
argument-hint: <type: feature|fix|refactor|docs> <name>
---

# /dev-start

입력:
- `$1` = type (`feature` | `fix` | `refactor` | `docs` 중 하나)
- `$2` = name (kebab-case, 예: `mmm-v3`, `fadein-delay-prop`)

## 실행 순서

1. **입력 검증**
   - `$1`이 `feature` / `fix` / `refactor` / `docs` 중 하나인지 확인, 아니면 에러 메시지 출력 후 종료
   - `$2`가 `^[a-z][a-z0-9-]+$` 패턴인지 확인, 아니면 에러

2. **브랜치 / 경로 계산**
   - type별 prefix:
     - `feature` → `feat/<name>`
     - `fix` → `fix/<name>`
     - `refactor` → `refactor/<name>`
     - `docs` → `docs/<name>`
   - worktree 경로: `.worktrees/<type>-<name>/` (워크스페이스 내부)

3. **Worktree 생성**
   ```bash
   git worktree add ".worktrees/<type>-<name>" -b "<prefix>/<name>"
   ```
   이미 같은 이름의 worktree가 있으면 오류 출력 + 기존 경로 안내 후 종료.

4. **종속성 설치 (백그라운드)**
   - worktree 안의 `compass/` 서브디렉터리에서 `npm install --legacy-peer-deps`를 백그라운드로 실행
   - 사용자에게 "의존성 설치 중 — 몇 분 걸릴 수 있음" 안내

5. **타입별 후속 액션**
   - `feature` 또는 `refactor` → `superpowers:brainstorming` 스킬 자동 호출
   - `fix` → `superpowers:systematic-debugging` 스킬 자동 호출
   - `docs` → 바로 편집 모드 진입 (brainstorming 스킵)

6. **작업 디렉터리 전환 안내**
   - Claude에게 "이후 모든 파일 편집은 `.worktrees/<type>-<name>/` 디렉터리에서 수행" 알림

## 주의

- 메인 워크스페이스 루트(`/Users/mike/Downloads/Compass/`)에서 실행 가정
- 메타 파일(`docs/`, `CLAUDE.md`, `scripts/`, `README.md`, `.claude/`) 수정은 worktree 없이 main에서 해도 됨 (CLAUDE.md §10.2 참고)
- 동일한 이름의 worktree가 이미 있으면 오류 + 기존 경로 안내
- Next.js 앱은 워크스페이스의 `compass/` 서브디렉터리에 위치 — `npm install`은 거기서 실행
````

- [ ] **Step 3: 파일 존재 + frontmatter 확인**

Run:
```bash
head -4 /Users/mike/Downloads/Compass/.claude/commands/dev-start.md
```

Expected output:
```
---
description: 새 작업 시작 — worktree + 브랜치 + npm install + (필요 시) brainstorming
argument-hint: <type: feature|fix|refactor|docs> <name>
---
```

- [ ] **Step 4: Commit**

```bash
cd /Users/mike/Downloads/Compass
git add .claude/commands/dev-start.md
git commit -m "feat(harness): add /dev-start slash command

Automates new-work flow: worktree (.worktrees/<type>-<name>/) + branch
+ npm install --legacy-peer-deps (in compass/) + skill dispatch
(brainstorming for feature/refactor, systematic-debugging for fix).

Adapted from treenod/compass /compass-start with workspace-internal
worktree path and compass/ subdir install."
```

---

## Task 7: `CLAUDE.md` §10 작업 컨벤션 섹션 append

**목적**: 사용자 프로필, worktree 규약, 계정 분리, 자동 작동 표, 수동 슬래시 커맨드를 메인 CLAUDE.md에 명문화.

**Files:**
- Modify: `/Users/mike/Downloads/Compass/CLAUDE.md` (append)

- [ ] **Step 1: 현재 CLAUDE.md 끝 확인**

Run: `tail -20 /Users/mike/Downloads/Compass/CLAUDE.md`

(끝 라인을 기억해서 append 위치 확인. 보통 §15 Document Usage Guide의 마지막 항목으로 끝남.)

- [ ] **Step 2: §10 섹션 append (Edit tool — 마지막에 추가)**

기존 CLAUDE.md 의 마지막 라인 (`Provides detailed legal analysis, Korean law, and action items`) 뒤에 다음을 append.

Edit `/Users/mike/Downloads/Compass/CLAUDE.md`:

old_string:
```
- `Project_Compass_Legal.md` provides detailed legal analysis, Korean law, and action items
```

new_string:
````
- `Project_Compass_Legal.md` provides detailed legal analysis, Korean law, and action items

---

## 16. 작업 컨벤션 (하네스)

### 16.1 사용자 프로필
- **Mike는 비개발자**. 제품 방향을 정의하나 기술 트레이드오프 판단은 어려움.
- **추천-OK 워크플로우**: A/B/C/D 메뉴형 질문보다 단일 추천안 + 근거 제시를 선호. 사용자 응답은 OK / 다르게 2가지로 수렴.

### 16.2 브랜치 / Worktree 규약
- **모든 코드 작업(feature/fix/refactor)은 `git worktree` 기본**. `git checkout -b`로 같은 디렉터리에서 브랜치 이동 금지.
- 시작 커맨드: `/dev-start <type> <name>` — worktree + 브랜치 + `npm install --legacy-peer-deps` (compass/ 안에서) 자동화.
- Worktree 경로: `.worktrees/<type>-<name>/` (워크스페이스 내부)
- 메타 파일(`docs/`, `CLAUDE.md`, `scripts/`, `README.md`, `.claude/`) 수정은 main 워크트리에서 직접 해도 됨.

### 16.3 GitHub 계정 분리
- **회사 계정**: `treenod-mike` → `treenod-*` repo 전용 (SSH `git@github.com-treenod`)
- **개인 계정**: `mugungwhwa` → 개인 repo 전용 (SSH `git@github.com-mugung`)
- 계정 오염 시 즉시 `gh auth switch` 후 identity 재확인. `git config user.*` 설정을 절대 수정하지 말 것.

### 16.4 하네스 자동 작동 목록
세션마다 아래가 자동으로 돎 — Claude가 수동 호출할 필요 없음:

| 순간 | 작동 | 실패 시 |
|---|---|---|
| 세션 시작 | 현재 브랜치·최근 커밋 3·열린 PR·최신 spec 3·활성 worktree 자동 요약 | — |
| `git commit` 시도 | `compass/` 안에서 tsc + npm test 자동 실행 | 커밋 차단 (exit 2), 오류 메시지 반환 |
| `gh pr create` 성공 | `@coderabbitai review` 코멘트 + Vercel preview URL 폴링 (최대 30초) | 에러 메시지만 출력, 후속 작업 안 막음 |

스크립트 위치: `scripts/harness/{session-brief,precommit-gate,postpr-enrich}.sh`
Hook 등록: `.claude/settings.json`
별도 디자인 변경 감지 hook: `.claude/hooks/yieldo-redflags.sh` (PostToolUse:Write|Edit, 별도 매처라 공존)

### 16.5 하네스 범위 밖 (수동 실행 슬래시 커맨드)
- `/yieldo-dev` — Compass/yieldo 기능 구현 오케스트레이션 (`.claude/skills/yieldo-dev`)
- `/yieldo-verify` — 5-Point 검증 (`.claude/skills/yieldo-verify`)
- `/arch-check` — 큰 구조 변경(여러 레이어 수정, FSD 경계 재정의) 커밋 전 수동 실행
- `/oh-my-claudecode:ralph` — 복잡한 버그 추적이나 긴 리팩토링에 자율 루프로 선택 사용
- `/ultrareview` — 사용자가 직접 PR에 트리거 (회사 IP 외부 노출 주의)
````

- [ ] **Step 3: append 결과 확인**

Run:
```bash
grep -n "16. 작업 컨벤션" /Users/mike/Downloads/Compass/CLAUDE.md
```

Expected output (라인 번호는 실제와 다를 수 있음):
```
<NNN>:## 16. 작업 컨벤션 (하네스)
```

- [ ] **Step 4: Commit**

```bash
cd /Users/mike/Downloads/Compass
git add CLAUDE.md
git commit -m "docs(harness): add §16 작업 컨벤션 to CLAUDE.md

Documents user profile, worktree convention, GitHub account separation,
auto-running hooks table, and manual slash commands. Adapted from
treenod/compass §10 with this workspace's specifics (compass/ subdir,
.worktrees/ path, yieldo-dev/yieldo-verify skills, yieldo-redflags
hook coexistence)."
```

---

## Task 8: 통합 검증 + 임시 클론 정리

**목적**: 모든 spec §6 V1–V6 항목을 한 번에 점검하고, 외부 임시 클론 디렉터리 삭제.

**Files:** (변경 없음, 검증 + cleanup만)

- [ ] **Step 1: 모든 스크립트 실행 권한 재확인**

Run:
```bash
ls -l /Users/mike/Downloads/Compass/scripts/harness/
```

Expected: 3개 파일 모두 `-rwxr-xr-x`.

만약 누락되면:
```bash
chmod +x /Users/mike/Downloads/Compass/scripts/harness/*.sh
```

- [ ] **Step 2: V1 — session-brief 단독 작동**

Run:
```bash
cd /Users/mike/Downloads/Compass
bash scripts/harness/session-brief.sh | head -20
```

Expected: 5개 섹션 헤더 (`## 현재 브랜치`, `## 최근 커밋 3개`, `## 열린 PR`, `## 최신 스펙 3개`, `## 활성 worktree`) 모두 출력.

- [ ] **Step 3: V2/V3 — precommit-gate 성공/차단 (Task 3에서 이미 검증, 재실행)**

성공 경로:
```bash
cd /Users/mike/Downloads/Compass
echo '{"tool_input":{"command":"git commit -m smoke"}}' | bash scripts/harness/precommit-gate.sh
echo "exit: $?"
```
Expected: `━━━ 게이트 통과 ━━━` + `exit: 0`

차단 경로 (의도적 TS 오류):
```bash
cat > /Users/mike/Downloads/Compass/compass/__gate_smoke.ts <<'EOF'
const x: number = "string"; export {};
EOF
echo '{"tool_input":{"command":"git commit -m smoke"}}' | bash /Users/mike/Downloads/Compass/scripts/harness/precommit-gate.sh
echo "exit: $?"
rm /Users/mike/Downloads/Compass/compass/__gate_smoke.ts
```
Expected: `❌ 커밋 차단` + `exit: 2`

- [ ] **Step 4: V4 — postpr-enrich 스킵 경로**

Run:
```bash
echo '{"tool_input":{"command":"git status"},"tool_response":{"stdout":"","exit_code":0}}' | bash /Users/mike/Downloads/Compass/scripts/harness/postpr-enrich.sh
echo "exit: $?"
```
Expected: stderr 출력 없음 + `exit: 0`

(실제 PR 생성 검증은 사용자가 다음 PR을 만들 때 자연스럽게 확인됨.)

- [ ] **Step 5: V5 — /dev-start 명령 등록 확인**

Run:
```bash
ls /Users/mike/Downloads/Compass/.claude/commands/
cat /Users/mike/Downloads/Compass/.claude/commands/dev-start.md | head -5
```
Expected: `dev-start.md` 존재 + frontmatter `description` 라인 출력.

(실제 슬래시 커맨드 실행은 Claude Code 재시작 후 사용자 검증.)

- [ ] **Step 6: V6 — 회사 도메인 키워드 누출 점검**

Run:
```bash
cd /Users/mike/Downloads/Compass
git diff --name-only main~7..main | grep -iE "(crawler|appsflyer|sensor-tower|levelplay|gameboard|mmm|lstm)" || echo "OK: no leaked domain artifacts"
```
Expected output:
```
OK: no leaked domain artifacts
```

(만약 매칭되면 즉시 회수 — 해당 파일 삭제 후 amend.)

- [ ] **Step 7: 신규 파일 목록 점검**

Run:
```bash
git diff --name-only main~7..main
```

Expected output:
```
.claude/commands/dev-start.md
.claude/settings.json
CLAUDE.md
compass/package.json
docs/superpowers/plans/2026-04-28-treenod-workflow-adoption.md
docs/superpowers/specs/2026-04-28-treenod-workflow-adoption.md
scripts/harness/postpr-enrich.sh
scripts/harness/precommit-gate.sh
scripts/harness/session-brief.sh
```

(spec과 plan 파일은 이전 세션에서 생성된 것 — 본 도입 작업의 일부.)

- [ ] **Step 8: 임시 클론 디렉터리 삭제**

Run:
```bash
ls /Users/mike/Downloads/_treenod-compass-ref 2>/dev/null && \
  rm -rf /Users/mike/Downloads/_treenod-compass-ref && \
  echo "removed" || echo "already absent"
```
Expected: `removed`

검증:
```bash
ls /Users/mike/Downloads/_treenod-compass-ref 2>/dev/null || echo "confirmed gone"
```
Expected: `confirmed gone`

- [ ] **Step 9: 최종 commit (spec + plan 문서 포함, 아직 commit 안 됐다면)**

Run:
```bash
cd /Users/mike/Downloads/Compass
git status --short
```

만약 `docs/superpowers/{specs,plans}/2026-04-28-treenod-workflow-adoption.md` 가 untracked면:

```bash
git add docs/superpowers/specs/2026-04-28-treenod-workflow-adoption.md
git add docs/superpowers/plans/2026-04-28-treenod-workflow-adoption.md
git commit -m "docs(harness): add adoption spec and implementation plan

Captures intent + step-by-step plan for treenod/compass workflow
adoption. Source repo cloned to /tmp scope and removed after work."
```

- [ ] **Step 10: Claude Code 재시작 안내 (사용자 행동)**

`.claude/settings.json` 변경은 Claude Code 시작 시점에만 로드됨. 다음 안내를 사용자에게 전달:

```
하네스 도입 완료.
효과 발효를 위해 Claude Code를 재시작해 주세요:
  1. 현재 세션에서 /exit 또는 Ctrl+C 두 번
  2. 같은 디렉터리에서 `claude` 재실행
  3. 재시작 후 SessionStart 컨텍스트 블록이 자동 출력되면 성공
  4. 다음 작업부터 /dev-start <type> <name> 사용 가능
```

---

## Self-Review

(작성 후 fresh eyes 점검)

**1. Spec coverage**:

| Spec 항목 | 커버 Task |
|---|---|
| §2.1 H1 (.claude/settings.json) | Task 5 |
| §2.1 H2 (session-brief.sh) | Task 2 |
| §2.1 H3 (precommit-gate.sh + cd compass) | Task 3 |
| §2.1 H4 (postpr-enrich.sh) | Task 4 |
| §2.1 H5 (.claude/commands/dev-start.md) | Task 6 |
| §2.2 D1 (CLAUDE.md §10 → §16) | Task 7 |
| §2.2 D2/D3 (specs/, plans/ 컨벤션) | 이미 존재, 본 plan/spec이 그 컨벤션을 따름 |
| §2.3 P1 (compass/package.json test) | Task 1 |
| §3.1 cd compass 보정 | Task 3 본문 |
| §3.2 worktree 경로 옵션 A | Task 6 본문 |
| §3.3 settings 분리 | Task 5 Step 1 |
| §3.4 디렉터리/명령어 중립화 | Task 2/3/4 (scripts/harness/), Task 6 (/dev-start) |
| §3.5 §10 보정 포인트 | Task 7 본문 (yieldo-dev/verify, yieldo-redflags 언급) |
| §5 IP 가드레일 | Task 8 Step 6, Step 8 |
| §6 V1–V6 검증 | Task 8 Step 2–7 |
| §7-1 test 더미 | Task 1 (`echo 'no tests yet' && exit 0`) |
| §7-2 .worktrees/ exclude 점검 | (이월 — Task 8 Step 7에서 자연 노출 시 처리) |
| §7-3 arch-guard 통합 | (의도적 미포함 — 본 spec/plan 범위 밖) |
| §7-4 yieldo-redflags 시너지 | Task 7 §16.4 마지막 줄 명시 |

**2. Placeholder scan**: 본 plan에 "TBD", "TODO", "implement later", "Add appropriate error handling" 없음. 모든 코드 블록은 완전한 형태로 포함됨.

**3. Type / 명칭 consistency**:
- 디렉터리 이름 `scripts/harness/` 일관 (Task 2/3/4)
- 슬래시 커맨드 `/dev-start` 일관 (Task 6, Task 7 §16.2)
- Worktree 경로 `.worktrees/<type>-<name>/` 일관 (Task 6, Task 7 §16.2)
- CLAUDE.md 추가 섹션 번호 §16 (기존 §15까지 있어 충돌 회피) — Task 7 본문 일관

self-review 통과.

---

## Execution 옵션

Plan 완료. `docs/superpowers/plans/2026-04-28-treenod-workflow-adoption.md` 에 저장됨.

두 가지 실행 옵션:

**1. Subagent-Driven (recommended)** — task별 fresh subagent 디스패치, task 사이 사용자 리뷰, 빠른 반복

**2. Inline Execution** — 본 세션에서 executing-plans로 batch 실행 + 체크포인트

어떤 방식으로 진행할까요?
