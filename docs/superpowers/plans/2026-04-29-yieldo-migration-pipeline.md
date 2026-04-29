# yieldo Migration Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the Claude harness `precommit-gate.sh` with full-check (tsc + eslint + arch-guard + `npm run build`) + ultraqa auto-fix loop, register 3 memory policies, and bootstrap Scope A's first sub-project (D PyMC Bayesian) worktree — leaving the system in a state where D's brainstorming/spec/plan cycle can begin and F/M5 worktrees can be added incrementally without conflicts.

**Architecture:** Bash hook layer (`precommit-gate.sh` + 3 lib scripts at `scripts/harness/lib/`) detects `git commit|push` Bash invocations, runs 4 checks inside `yieldo/`, and on failure writes a structured GATE_FAIL marker (state file + stdout) that Claude parses to invoke ultraqa. ultraqa loops fix→verify until the 4-condition goal (`tsc=0 ∧ eslint=0 ∧ arch-guard=0 ∧ build exit-0`) is met, with a 3-cycle architect-verification gate and a 9-cycle hard cap. Scope A consists of D/F/M5 sub-projects, but only D is bootstrapped here; F and M5 follow once D's brainstorming spec is committed (per memory policy: each sub-project gets its own brainstorm→spec→plan cycle).

**Tech Stack:** bash, jq, gh CLI, Claude Code skills (`arch-guard:arch-audit`, `arch-guard:arch-fix`, `oh-my-claudecode:ultraqa`, `dev-start`), Next.js 15 (yieldo), git worktrees

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `scripts/harness/precommit-gate.sh` | Modify (existing) | Detect git commit/push in `$CLAUDE_TOOL_INPUT`, smart-skip if no yieldo/ paths staged, run 4 checks, output GATE_FAIL on failure |
| `scripts/harness/lib/arch-guard-wrapper.sh` | Create | Invoke `claude` CLI with `arch-guard:arch-audit` slash command, parse violations from stdout |
| `scripts/harness/lib/build-check.sh` | Create | Run `npm run build` inside `yieldo/` (or active worktree's yieldo/), return exit code + first failure line |
| `scripts/harness/lib/ultraqa-trigger.sh` | Create | Write `.harness-state/ultraqa-cycle.json` (cycle count, failures, hard cap), emit structured GATE_FAIL stdout for Claude to parse |
| `scripts/harness/lib/.gitkeep` | Create | Track empty lib dir before scripts land |
| `~/.claude/projects/-Users-mike-Downloads-Compass/memory/feedback_pr_babysit_round_robin.md` | Create | Memory: every user message → activeP PR poll + 1-line report only when state changes |
| `~/.claude/projects/-Users-mike-Downloads-Compass/memory/feedback_gate_skip_policy.md` | Create | Memory: `YIELDO_GATE_SKIP=1` env var usage, when allowed, when NOT |
| `~/.claude/projects/-Users-mike-Downloads-Compass/memory/project_scope_a_progress.md` | Create | Memory: D/F/M5 sub-project status + bootstrap order + dependency notes |
| `~/.claude/projects/-Users-mike-Downloads-Compass/memory/MEMORY.md` | Modify | Add 3 new index entries (one-liner each) |
| `.worktrees/feature-pymc-bayesian/` | Create (via `/dev-start`) | Scope A's first sub-project worktree, port 3001 |

---

## Task 1: Inspect current `precommit-gate.sh` and document the baseline

**Files:**
- Read: `scripts/harness/precommit-gate.sh`

- [ ] **Step 1: Read current gate**

Run:
```bash
cat /Users/mike/Downloads/Compass/scripts/harness/precommit-gate.sh
```

Expected: existing hook script content. Note three things:
- How it parses `$CLAUDE_TOOL_INPUT`
- Current behavior on git commit/push (likely passthrough or minimal check)
- Where it writes logs (if any)

- [ ] **Step 2: Capture baseline behavior in a comment block at top of file**

Use Edit to prepend (after shebang) a comment block:
```bash
# precommit-gate.sh — Claude PreToolUse:Bash hook
#
# BASELINE (before 2026-04-29 extension):
#   - <document what you found in Step 1>
#
# EXTENSION (2026-04-29, plan: docs/superpowers/plans/2026-04-29-yieldo-migration-pipeline.md):
#   - On `git commit|push` with yieldo/ paths staged: run tsc + eslint + arch-guard + npm run build
#   - On any failure: emit GATE_FAIL JSON to stdout, write state file, exit 2
#   - Claude parses GATE_FAIL → invokes ultraqa cycle → loops until goal met
```

- [ ] **Step 3: Verify the file is unchanged behavior-wise (only comment added)**

Run:
```bash
cd /Users/mike/Downloads/Compass && bash scripts/harness/precommit-gate.sh < /dev/null; echo "exit=$?"
```

Expected: same exit code as before Step 2 (typically 0, since no Bash tool input).

---

## Task 2: Create `arch-guard-wrapper.sh`

**Files:**
- Create: `scripts/harness/lib/arch-guard-wrapper.sh`

- [ ] **Step 1: Create lib directory and placeholder**

Run:
```bash
mkdir -p /Users/mike/Downloads/Compass/scripts/harness/lib
touch /Users/mike/Downloads/Compass/scripts/harness/lib/.gitkeep
```

Expected: directory exists, `.gitkeep` file created.

- [ ] **Step 2: Write the wrapper script**

Create `scripts/harness/lib/arch-guard-wrapper.sh`:
```bash
#!/bin/bash
# arch-guard-wrapper.sh — invokes the arch-guard:arch-audit skill via Claude CLI
# and parses the violation count from output.
#
# Usage: arch_guard_audit <yieldo-path>
# Returns:
#   exit 0  : 0 violations
#   exit 1  : >0 violations OR audit failed
# Stdout (on failure): JSON line { "violations": N, "first": "<file:line>" }

set -euo pipefail

YIELDO_PATH="${1:-./yieldo}"

cd "$YIELDO_PATH" || { echo '{"error":"yieldo path missing"}' >&2; exit 1; }

# Invoke arch-guard skill non-interactively. The skill is expected to print
# `VIOLATIONS=N` somewhere in its output.
OUTPUT=$(claude /arch-guard:arch-audit --silent 2>&1 || true)

VIOLATIONS=$(echo "$OUTPUT" | grep -oE 'VIOLATIONS=[0-9]+' | head -1 | cut -d= -f2)
VIOLATIONS="${VIOLATIONS:-0}"

if [[ "$VIOLATIONS" -gt 0 ]]; then
  FIRST=$(echo "$OUTPUT" | grep -oE '[a-zA-Z0-9_/.-]+:[0-9]+' | head -1)
  printf '{"violations":%d,"first":"%s"}\n' "$VIOLATIONS" "${FIRST:-unknown}"
  exit 1
fi

exit 0
```

- [ ] **Step 3: Make executable and test on current yieldo**

Run:
```bash
chmod +x /Users/mike/Downloads/Compass/scripts/harness/lib/arch-guard-wrapper.sh
bash /Users/mike/Downloads/Compass/scripts/harness/lib/arch-guard-wrapper.sh /Users/mike/Downloads/Compass/yieldo
echo "exit=$?"
```

Expected: exit 0 (clean) or exit 1 with JSON line. Either is acceptable — what we're verifying is that the script runs without bash errors.

- [ ] **Step 4: NO commit yet** (will commit after Task 5 alongside the extended gate)

---

## Task 3: Create `build-check.sh`

**Files:**
- Create: `scripts/harness/lib/build-check.sh`

- [ ] **Step 1: Write the build check script**

Create `scripts/harness/lib/build-check.sh`:
```bash
#!/bin/bash
# build-check.sh — runs `npm run build` inside the yieldo workspace
# and reports exit code + first error line.
#
# Worktree-aware: detects $PWD-relative yieldo/, falls back to $CLAUDE_PROJECT_DIR/yieldo.
#
# Usage: build_check
# Returns:
#   exit 0  : build succeeded
#   exit 1  : build failed
# Stdout (on failure): JSON line { "stage": "build", "first_error": "<line>" }

set -euo pipefail

# Resolve yieldo path: prefer current worktree, fall back to project root
if [[ -d "$PWD/yieldo" ]]; then
  YIELDO_PATH="$PWD/yieldo"
elif [[ -d "${CLAUDE_PROJECT_DIR:-/Users/mike/Downloads/Compass}/yieldo" ]]; then
  YIELDO_PATH="${CLAUDE_PROJECT_DIR:-/Users/mike/Downloads/Compass}/yieldo"
else
  echo '{"stage":"build","first_error":"yieldo path not found"}'
  exit 1
fi

cd "$YIELDO_PATH"

# Run build, capture output to a tempfile so we can parse first error
LOG=$(mktemp)
trap 'rm -f "$LOG"' EXIT

if npm run build > "$LOG" 2>&1; then
  exit 0
fi

# Extract first line containing "Error" or "error" (Next.js build conventions)
FIRST=$(grep -m1 -E '(Error|error)' "$LOG" || echo "build failed without recognizable error line")
printf '{"stage":"build","first_error":%s}\n' "$(jq -Rs . <<< "$FIRST")"
exit 1
```

- [ ] **Step 2: Make executable**

Run:
```bash
chmod +x /Users/mike/Downloads/Compass/scripts/harness/lib/build-check.sh
```

- [ ] **Step 3: Test on current yieldo (expect pass — main is green)**

Run:
```bash
bash /Users/mike/Downloads/Compass/scripts/harness/lib/build-check.sh
echo "exit=$?"
```

Expected: exit 0 (main is currently building successfully — confirmed by recent commit `8fb1858` deps fix). Build takes ~2-3 minutes.

- [ ] **Step 4: NO commit yet**

---

## Task 4: Create `ultraqa-trigger.sh`

**Files:**
- Create: `scripts/harness/lib/ultraqa-trigger.sh`
- Create: `.harness-state/` directory (runtime state, gitignored)

- [ ] **Step 1: Add `.harness-state/` to `.gitignore`**

Use Edit to append to `/Users/mike/Downloads/Compass/.gitignore`:
```
.harness-state/
```

- [ ] **Step 2: Write the trigger script**

Create `scripts/harness/lib/ultraqa-trigger.sh`:
```bash
#!/bin/bash
# ultraqa-trigger.sh — when gate fails, write state file and emit GATE_FAIL marker
# for Claude to parse and invoke the ultraqa skill.
#
# Usage: ultraqa_trigger <failure_json_array>
#   <failure_json_array> = JSON like '[{"stage":"tsc","first_error":"..."},{"stage":"build",...}]'
#
# Side effects:
#   - Writes/updates .harness-state/ultraqa-cycle.json (cycle count, failures, last_arch_review_cycle)
#   - Emits structured stdout starting with GATE_FAIL: that Claude parses
#   - Returns exit 2 to block the original git command
#
# Hard cap: if cycle count >= 9, emits GATE_FAIL_HARDCAP instead — Claude must escalate to user.
# Architect gate: every 3 cycles (3,6,9), emits GATE_FAIL_ARCH_GATE flag — Claude must invoke architect agent first.

set -euo pipefail

FAILURES_JSON="${1:-[]}"
STATE_DIR="${CLAUDE_PROJECT_DIR:-/Users/mike/Downloads/Compass}/.harness-state"
STATE_FILE="$STATE_DIR/ultraqa-cycle.json"

mkdir -p "$STATE_DIR"

# Read existing state or initialize
if [[ -f "$STATE_FILE" ]]; then
  CYCLE=$(jq -r '.cycle' "$STATE_FILE")
  CYCLE=$((CYCLE + 1))
else
  CYCLE=1
fi

# Determine flags
HARDCAP="false"
ARCH_GATE="false"
if [[ "$CYCLE" -ge 9 ]]; then
  HARDCAP="true"
elif [[ $((CYCLE % 3)) -eq 0 ]]; then
  ARCH_GATE="true"
fi

# Write new state
jq -n \
  --argjson cycle "$CYCLE" \
  --arg hardcap "$HARDCAP" \
  --arg arch_gate "$ARCH_GATE" \
  --argjson failures "$FAILURES_JSON" \
  '{cycle: $cycle, hardcap: ($hardcap == "true"), arch_gate: ($arch_gate == "true"), failures: $failures, ts: now}' \
  > "$STATE_FILE"

# Emit structured marker
if [[ "$HARDCAP" == "true" ]]; then
  echo "GATE_FAIL_HARDCAP cycle=$CYCLE state=$STATE_FILE"
elif [[ "$ARCH_GATE" == "true" ]]; then
  echo "GATE_FAIL_ARCH_GATE cycle=$CYCLE state=$STATE_FILE"
else
  echo "GATE_FAIL cycle=$CYCLE state=$STATE_FILE"
fi

cat "$STATE_FILE"
exit 2
```

- [ ] **Step 3: Make executable**

Run:
```bash
chmod +x /Users/mike/Downloads/Compass/scripts/harness/lib/ultraqa-trigger.sh
```

- [ ] **Step 4: Test trigger with a synthetic failure**

Run:
```bash
bash /Users/mike/Downloads/Compass/scripts/harness/lib/ultraqa-trigger.sh '[{"stage":"tsc","first_error":"test.ts:1: type error"}]'
echo "exit=$?"
cat /Users/mike/Downloads/Compass/.harness-state/ultraqa-cycle.json
```

Expected:
- stdout starts with `GATE_FAIL cycle=1 state=...`
- followed by JSON dump of state
- exit 2
- state file shows cycle=1, hardcap=false, arch_gate=false

- [ ] **Step 5: Test cycle counter — run again**

Run:
```bash
bash /Users/mike/Downloads/Compass/scripts/harness/lib/ultraqa-trigger.sh '[]'
echo "exit=$?"
```

Expected: cycle=2 in state file. exit 2.

- [ ] **Step 6: Test arch_gate at cycle 3**

Run:
```bash
bash /Users/mike/Downloads/Compass/scripts/harness/lib/ultraqa-trigger.sh '[]'
echo "---"
bash /Users/mike/Downloads/Compass/scripts/harness/lib/ultraqa-trigger.sh '[]'
```

Expected: third invocation outputs `GATE_FAIL_ARCH_GATE cycle=3 ...`.

- [ ] **Step 7: Reset state file for clean slate**

Run:
```bash
rm -f /Users/mike/Downloads/Compass/.harness-state/ultraqa-cycle.json
```

- [ ] **Step 8: NO commit yet**

---

## Task 5: Extend `precommit-gate.sh` to compose all checks

**Files:**
- Modify: `scripts/harness/precommit-gate.sh`

- [ ] **Step 1: Replace gate body with full-check composition**

Use Edit to replace the script body (after the shebang + comment block from Task 1) with:
```bash
set -euo pipefail

# Only act on git commit / git push Bash invocations
CMD="${CLAUDE_TOOL_INPUT:-}"
if ! [[ "$CMD" =~ ^git[[:space:]]+(commit|push) ]]; then
  exit 0
fi

# Skip if user explicitly waived (memory policy: feedback_gate_skip_policy.md)
if [[ "${YIELDO_GATE_SKIP:-0}" == "1" ]]; then
  echo "GATE_SKIP (YIELDO_GATE_SKIP=1)" >&2
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-/Users/mike/Downloads/Compass}"
LIB="$PROJECT_DIR/scripts/harness/lib"

# Smart skip: if no yieldo/ paths are staged, gate is irrelevant
STAGED=$(git -C "$PROJECT_DIR" diff --cached --name-only 2>/dev/null || true)
if ! grep -qE '^yieldo/' <<< "$STAGED"; then
  echo "GATE_SKIP (no yieldo/ paths staged)" >&2
  exit 0
fi

# Collect failures
FAILURES='[]'
add_failure() {
  local stage="$1"; local err="$2"
  FAILURES=$(jq --arg s "$stage" --arg e "$err" '. + [{"stage":$s,"first_error":$e}]' <<< "$FAILURES")
}

cd "$PROJECT_DIR/yieldo"

# 1. tsc
if ! npx tsc --noEmit > /tmp/tsc.log 2>&1; then
  FIRST=$(grep -m1 -E 'error' /tmp/tsc.log || echo "tsc failed")
  add_failure "tsc" "$FIRST"
fi

# 2. eslint
if ! npx eslint . > /tmp/eslint.log 2>&1; then
  FIRST=$(grep -m1 -E 'error' /tmp/eslint.log || echo "eslint failed")
  add_failure "eslint" "$FIRST"
fi

# 3. arch-guard
if ! bash "$LIB/arch-guard-wrapper.sh" "$PROJECT_DIR/yieldo" > /tmp/arch.log 2>&1; then
  add_failure "arch-guard" "$(cat /tmp/arch.log)"
fi

# 4. build
if ! bash "$LIB/build-check.sh" > /tmp/build.log 2>&1; then
  add_failure "build" "$(cat /tmp/build.log)"
fi

# Pass if no failures
if [[ "$FAILURES" == "[]" ]]; then
  # On successful gate: reset cycle counter
  rm -f "$PROJECT_DIR/.harness-state/ultraqa-cycle.json"
  exit 0
fi

# Fail: trigger ultraqa, exit 2 to block git command
bash "$LIB/ultraqa-trigger.sh" "$FAILURES"
exit 2
```

- [ ] **Step 2: Verify shellcheck passes (if installed)**

Run:
```bash
which shellcheck && shellcheck /Users/mike/Downloads/Compass/scripts/harness/precommit-gate.sh || echo "shellcheck unavailable, skip"
```

Expected: no errors, or "shellcheck unavailable, skip" if not installed.

- [ ] **Step 3: Smoke test — non-git command should pass through**

Run:
```bash
CLAUDE_TOOL_INPUT="ls -la" CLAUDE_PROJECT_DIR=/Users/mike/Downloads/Compass \
  bash /Users/mike/Downloads/Compass/scripts/harness/precommit-gate.sh
echo "exit=$?"
```

Expected: exit 0, no output.

- [ ] **Step 4: Smoke test — git commit with no yieldo/ paths staged passes through**

Run (assuming nothing staged or only non-yieldo paths):
```bash
CLAUDE_TOOL_INPUT="git commit -m test" CLAUDE_PROJECT_DIR=/Users/mike/Downloads/Compass \
  bash /Users/mike/Downloads/Compass/scripts/harness/precommit-gate.sh
echo "exit=$?"
```

Expected: stderr `GATE_SKIP (no yieldo/ paths staged)`, exit 0.

---

## Task 6: Manual full-stack test — clean commit passes the gate

**Files:** none modified (verification only)

- [ ] **Step 1: Stage a trivial yieldo/ change**

Run:
```bash
cd /Users/mike/Downloads/Compass/yieldo
echo "# gate test" >> README.md 2>/dev/null || echo "# gate test" > README.md
git add yieldo/README.md
```

- [ ] **Step 2: Invoke the gate as Claude would**

Run:
```bash
CLAUDE_TOOL_INPUT="git commit -m test" CLAUDE_PROJECT_DIR=/Users/mike/Downloads/Compass \
  bash /Users/mike/Downloads/Compass/scripts/harness/precommit-gate.sh
echo "exit=$?"
```

Expected: gate runs all 4 checks (~2-3 min). Exit 0 on success. State file at `.harness-state/ultraqa-cycle.json` is removed (reset on pass).

- [ ] **Step 3: Unstage the test change**

Run:
```bash
cd /Users/mike/Downloads/Compass
git restore --staged yieldo/README.md
git restore yieldo/README.md
```

---

## Task 7: Manual failure test — broken type triggers ultraqa

**Files:**
- Modify (temporarily): `yieldo/src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Inject an intentional type error**

Use Edit to add at top of `yieldo/src/app/(dashboard)/dashboard/page.tsx` (after imports):
```typescript
const __gate_test: number = "intentional type error for gate test";
```

- [ ] **Step 2: Stage the file and invoke gate**

Run:
```bash
cd /Users/mike/Downloads/Compass
git add yieldo/src/app/\(dashboard\)/dashboard/page.tsx
CLAUDE_TOOL_INPUT="git commit -m test" CLAUDE_PROJECT_DIR=/Users/mike/Downloads/Compass \
  bash scripts/harness/precommit-gate.sh
echo "exit=$?"
cat .harness-state/ultraqa-cycle.json
```

Expected:
- stderr/stdout contains `GATE_FAIL cycle=1 state=...`
- followed by JSON state showing `failures: [{stage: "tsc", ...}]`
- exit 2
- state file exists

- [ ] **Step 3: Revert the test change**

Run:
```bash
cd /Users/mike/Downloads/Compass
git restore --staged yieldo/src/app/\(dashboard\)/dashboard/page.tsx
git restore yieldo/src/app/\(dashboard\)/dashboard/page.tsx
rm -f .harness-state/ultraqa-cycle.json
```

Expected: file restored to original, state file removed.

---

## Task 8: Commit the harness extension

**Files:** all the new/modified harness files

- [ ] **Step 1: Stage harness changes only**

Run:
```bash
cd /Users/mike/Downloads/Compass
git add scripts/harness/precommit-gate.sh \
        scripts/harness/lib/arch-guard-wrapper.sh \
        scripts/harness/lib/build-check.sh \
        scripts/harness/lib/ultraqa-trigger.sh \
        scripts/harness/lib/.gitkeep \
        .gitignore
git status --short
```

Expected: only the listed files staged. No yieldo/ changes leaking.

- [ ] **Step 2: Commit (NOTE: gate will run on this very commit)**

Because the gate skips when no yieldo/ paths are staged, this commit will pass through cleanly:
```bash
git commit -m "$(cat <<'EOF'
feat(harness): extend precommit-gate.sh with full-check + ultraqa loop

- precommit-gate.sh: smart-skip when no yieldo/ paths staged, run tsc/eslint/arch-guard/build on yieldo/ commits
- lib/arch-guard-wrapper.sh: invoke arch-guard:arch-audit skill, parse violations
- lib/build-check.sh: worktree-aware npm run build runner
- lib/ultraqa-trigger.sh: write .harness-state/ultraqa-cycle.json with cycle counter, architect gate (every 3), hard cap (9)

Plan: docs/superpowers/plans/2026-04-29-yieldo-migration-pipeline.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git log --oneline -1
```

Expected: commit succeeds. Hash shown in log.

---

## Task 9: Register PR babysit memory policy

**Files:**
- Create: `~/.claude/projects/-Users-mike-Downloads-Compass/memory/feedback_pr_babysit_round_robin.md`

- [ ] **Step 1: Write the memory file**

Create with content:
```markdown
---
name: PR babysit — 매 메시지 라운드 로빈
description: 3개 worktree 동시 진행 시 활성 PR을 사용자 메시지 단위로 점검 (자동 폴링 X)
type: feedback
---

매 사용자 메시지 시작 시 `gh pr list --state open --author @me` 한 번 실행. 변경사항(CI 결과 변경, 새 리뷰 코멘트, 충돌 발생) 발견되면 메시지 시작 부분에 1줄 리포트. 변경사항 없으면 보고하지 않음(소음 방지).

**Why:** 사용자가 비개발자 + 추천-OK 워크플로우(`feedback_design.md`)를 선호. 자동 폴링(`/loop`) 또는 ralph 루프는 통제권 상실 위험. 메시지 단위 라운드 로빈이 자연스럽고 0 추가 인프라.

**How to apply:** Scope A 진행 중에는 항상 적용. 단일 PR 진행 중일 때는 노이즈라 적용 X — 활성 PR이 2개 이상일 때만 자동 점검.
```

- [ ] **Step 2: No commit needed (memory dir is per-user, outside repo)**

---

## Task 10: Register gate skip env var memory policy

**Files:**
- Create: `~/.claude/projects/-Users-mike-Downloads-Compass/memory/feedback_gate_skip_policy.md`

- [ ] **Step 1: Write the memory file**

Create with content:
```markdown
---
name: precommit-gate 우회 정책 (YIELDO_GATE_SKIP)
description: 풀체크 게이트를 임시 우회하는 환경변수 사용 시점과 금지 시점
type: feedback
---

`YIELDO_GATE_SKIP=1`으로 풀체크 게이트(tsc + eslint + arch-guard + build) 우회 가능.

**허용 시점:**
- 문서/spec/plan만 수정한 commit (그래도 가급적 stage 분리로 자동 skip 활용)
- harness 스크립트 자체를 디버그 중일 때
- 사용자가 명시 요청 시 ("게이트 건너뛰고 커밋해줘")

**금지 시점:**
- yieldo/ 코드 변경이 있는 commit — 절대 우회 금지
- ultraqa hard cap(9 사이클) 도달 시 — 사용자 escalation 후 결정
- main 브랜치 push — Vercel build에서 잡혀도 늦음

**Why:** 게이트는 push 후 Vercel preview에서 잡히는 비용을 push 전에 차단하는 안전망. 우회 빈발 시 게이트 의미 상실.

**How to apply:** Claude는 default 우회 X. 우회는 사용자 명시 승인 필요. 우회 시 대화에 명시 기록.
```

- [ ] **Step 2: No commit needed**

---

## Task 11: Register Scope A progress tracker memory

**Files:**
- Create: `~/.claude/projects/-Users-mike-Downloads-Compass/memory/project_scope_a_progress.md`

- [ ] **Step 1: Write the memory file**

Create with content:
```markdown
---
name: Scope A 진행 상태 (D + F + M5)
description: yieldo 마이그레이션 Scope A 3 sub-project의 worktree·브랜치·머지 상태 추적
type: project
---

Scope A = MVP 3 sub-project. 메모리 `project_treenod_to_yieldo_migration.md`에서 분기.

| sub | branch | port | worktree | 상태 | 의존 |
|---|---|---|---|---|---|
| D PyMC Bayesian | `feature/pymc-bayesian` | 3001 | `.worktrees/feature-pymc-bayesian/` | 🟢 worktree 시동됨 (2026-04-29) | AppsFlyer ✅ |
| F VC Simulation | `feature/vc-simulation` | 3002 | (미시동) | ⏳ D mock 완료 후 시동 | D mock OK |
| M5 Capital Console | `feature/capital-console` | 3003 | (미시동) | ⏳ F 시동 후 시동 | F 합의 |

**머지 순서**: D → F → M5 (rebase 필수)

**공유 파일 충돌 매트릭스**: `src/shared/i18n/dictionary.ts` 후순위 rebase 자동 해결 / `runway-fan-chart.tsx` F만 / `app-sidebar.tsx` F만 / `package.json` D만

**Why:** 19 sub-project 중 첫 3개. 한꺼번에 plan 짜면 obsolete — sub-project별 별도 brainstorm/spec/plan 사이클 필수.

**How to apply:** D의 brainstorming spec이 commit되기 전에는 F·M5 worktree 시동 X. D 완료 시 이 memory 업데이트 → F 시동.

**관련 plan**: `docs/superpowers/plans/2026-04-29-yieldo-migration-pipeline.md`
**관련 spec**: `.omc/specs/2026-04-29-yieldo-migration-pipeline-design.md`
```

- [ ] **Step 2: No commit needed**

---

## Task 12: Update `MEMORY.md` index with 3 new entries

**Files:**
- Modify: `~/.claude/projects/-Users-mike-Downloads-Compass/memory/MEMORY.md`

- [ ] **Step 1: Append 3 index entries**

Use Edit to append at end of `MEMORY.md`:
```markdown
- [PR babysit 라운드 로빈](feedback_pr_babysit_round_robin.md) — 활성 PR 2+개일 때만 메시지 단위로 점검, 자동 폴링 X
- [precommit-gate 우회 정책](feedback_gate_skip_policy.md) — YIELDO_GATE_SKIP=1은 문서·harness 디버그·사용자 명시 시만 허용
- [Scope A 진행 상태](project_scope_a_progress.md) — D/F/M5 worktree·머지 순서·공유 파일 충돌 매트릭스
```

- [ ] **Step 2: Verify line count under 200**

Run:
```bash
wc -l ~/.claude/projects/-Users-mike-Downloads-Compass/memory/MEMORY.md
```

Expected: under 200 lines (memory skill advises truncation past 200).

- [ ] **Step 3: No commit needed**

---

## Task 13: Bootstrap Scope A first sub-project — D PyMC worktree

**Files:**
- Create: `.worktrees/feature-pymc-bayesian/` (via skill)

- [ ] **Step 1: Verify port 3001 is free**

Run:
```bash
lsof -i :3001 | head -5
echo "exit=$?"
```

Expected: no process listed (exit 1 from lsof = nothing found, that's good). If something is bound, kill it before continuing.

- [ ] **Step 2: Invoke `/dev-start` skill for the new worktree**

In the Claude session, invoke:
```
/dev-start feature pymc-bayesian
```

Expected behavior:
- Creates `.worktrees/feature-pymc-bayesian/` worktree
- Checks out new branch `feature/pymc-bayesian` from main
- Runs `cd yieldo && npm install` inside the worktree
- Optionally launches dev server on port 3001

- [ ] **Step 3: Verify worktree exists**

Run:
```bash
git -C /Users/mike/Downloads/Compass worktree list
```

Expected: 4 worktrees listed (main + 3 existing + the new feature-pymc-bayesian).

- [ ] **Step 4: Verify worktree has independent node_modules**

Run:
```bash
ls -d /Users/mike/Downloads/Compass/.worktrees/feature-pymc-bayesian/yieldo/node_modules
```

Expected: directory exists, separate from main yieldo/node_modules.

- [ ] **Step 5: Update Scope A memory — mark D as bootstrapped**

This is already pre-filled in Task 11. Verify the memory file says "🟢 worktree 시동됨 (2026-04-29)" for D. If `/dev-start` failed, update the status accordingly.

- [ ] **Step 6: Final commit on main — none**

The worktree itself is tracked by git (worktree pointer in `.git/worktrees/`), but no main-branch commit is needed. Worktree creation is a git operation, not a commit.

---

## Definition of Done

After Task 13, the system is in this state:

- ✅ `precommit-gate.sh` runs full-check on yieldo/ commits, smart-skips otherwise
- ✅ ultraqa cycle state file mechanism works (cycle counter, architect gate at 3/6/9, hard cap 9)
- ✅ 3 memory policies registered + indexed
- ✅ Worktree `.worktrees/feature-pymc-bayesian/` exists with independent node_modules, branch `feature/pymc-bayesian` checked out
- ⏳ D PyMC's brainstorming spec is the next thing to write (separate cycle, NOT in this plan)
- ⏳ F and M5 worktrees are NOT yet bootstrapped — they wait until D's spec exists (memory `project_scope_a_progress.md` enforces order)

The user can now invoke `superpowers:brainstorming` inside the D worktree to start D's design cycle.

---

## Self-Review Checklist (run after writing this plan)

**1. Spec coverage:** Every section of `2026-04-29-yieldo-migration-pipeline-design.md` mapped to a task?
- §4 결정 1 (스코프 A→B→C): Task 11 (Scope A memory captures progression contract)
- §4 결정 2 (병렬 worktree port 3001/3002/3003): Task 13 (port 3001) + memory documents 3002/3003
- §4 결정 3 (harness 단독 (b)): Tasks 1-5 extend the existing harness, no husky added
- §4 결정 4 (풀체크 3-3): Task 5 composes tsc + eslint + arch-guard + build
- §4 결정 5 (ultraqa 4-4): Task 4 + Task 5 trigger
- §4 결정 6 (auto-merge): Already in `postpr-enrich.sh` (observation 0ddb849), no new task needed
- §4 결정 7 (PR babysit 5-4): Task 9
- §4 결정 8 (F vs M5 분리): Task 11 memory documents the boundary
- §6.3 공유 파일 충돌 매트릭스: Task 11 memory
- §11 위험/안전망: Task 4 (hard cap, arch_gate), Task 10 (skip policy)

**2. Placeholder scan:** No "TBD", "TODO", "appropriate handling" — verified.

**3. Type/name consistency:**
- `arch_guard_audit` (Task 2) → invoked as `bash "$LIB/arch-guard-wrapper.sh"` (Task 5) ✅
- `build_check` (Task 3) → invoked as `bash "$LIB/build-check.sh"` (Task 5) ✅
- `ultraqa_trigger` (Task 4) → invoked as `bash "$LIB/ultraqa-trigger.sh" "$FAILURES"` (Task 5) ✅
- State file path: `.harness-state/ultraqa-cycle.json` consistent across Tasks 4, 5, 7 ✅

---

## Execution Handoff

Plan complete. Two execution options:

**1. Subagent-Driven (recommended)** — Dispatch a fresh subagent per task with two-stage review. Best for parallel-safe tasks; not ideal here because tasks 6-7 require live build (~3min each) and tasks 12-13 invoke skills that mutate session state.

**2. Inline Execution** — Execute tasks in this session with checkpoints. Best for this plan because gate testing needs the live shell + Bash hook integration must be verified turn-by-turn.

Recommended: **Inline Execution** for this particular plan (harness changes are stateful and need live verification per task). Subagent-driven becomes appropriate once D/F/M5 sub-project plans land — those are mostly file edits + tests with clear pass/fail.
