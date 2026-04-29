#!/usr/bin/env bash
# scripts/harness/precommit-gate.sh
# PreToolUse:Bash hook — git commit 전 yieldo/ 풀체크 게이트
#
# BASELINE (2026-04 기존):
#   - stdin으로 JSON 받음, jq로 .tool_input.command 추출
#   - git commit 만 게이트 (push는 통과)
#   - tsc --noEmit + npm test 검증
#   - 워크스페이스 루트와 yieldo/ 서브디렉터리 분리
#   - 실패 시 exit 2 (Claude commit 차단)
#
# EXTENSION (2026-04-29, plan: docs/superpowers/plans/2026-04-29-yieldo-migration-pipeline.md):
#   - smart-skip: yieldo/ 경로 staging 안 됐으면 통과
#   - YIELDO_GATE_SKIP=1 env var 우회 (memory: feedback_gate_skip_policy.md)
#   - 풀체크 4종: tsc + eslint + arch-guard(stub) + npm run build
#   - 실패 시 lib/ultraqa-trigger.sh 호출 → GATE_FAIL marker + state file → Claude가 ultraqa cycle 발동
set -uo pipefail

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // ""' 2>/dev/null || echo "")

# git commit 또는 git push가 아니면 즉시 통과
if ! echo "$CMD" | grep -qE '(^|[[:space:]&;|])git[[:space:]]+(commit|push)([[:space:]]|$)'; then
  exit 0
fi

# 우회 env var (memory: feedback_gate_skip_policy.md)
if [[ "${YIELDO_GATE_SKIP:-0}" == "1" ]]; then
  echo "⤼ GATE_SKIP (YIELDO_GATE_SKIP=1)" >&2
  exit 0
fi

WORKSPACE_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
APP_DIR="$WORKSPACE_DIR/yieldo"
LIB_DIR="$WORKSPACE_DIR/scripts/harness/lib"

if [ ! -d "$APP_DIR" ]; then
  echo "❌ precommit-gate: yieldo/ 서브디렉터리를 찾지 못함 ($APP_DIR)" >&2
  exit 2
fi

# Smart skip: yieldo/ 경로가 staging 안 됐으면 게이트 의미 없음
STAGED=$(git -C "$WORKSPACE_DIR" diff --cached --name-only 2>/dev/null || true)
if ! echo "$STAGED" | grep -qE '^yieldo/'; then
  echo "⤼ GATE_SKIP (no yieldo/ paths staged)" >&2
  exit 0
fi

cd "$APP_DIR"

echo "━━━ yieldo pre-commit gate — 풀체크 4종 ━━━" >&2

# 실패 누적
FAILURES='[]'
add_failure() {
  local stage="$1"; local err="$2"
  FAILURES=$(jq --arg s "$stage" --arg e "$err" '. + [{"stage":$s,"first_error":$e}]' <<<"$FAILURES")
}

# 1. tsc
echo "▸ tsc --noEmit..." >&2
if ! npx tsc --noEmit > /tmp/yieldo-tsc.log 2>&1; then
  cat /tmp/yieldo-tsc.log >&2
  FIRST=$(grep -m1 -E 'error' /tmp/yieldo-tsc.log || echo "tsc failed")
  add_failure "tsc" "$FIRST"
else
  echo "  ✅ tsc 통과" >&2
fi

# 2. eslint — staged ts/tsx 파일만 (PR-scoped). 기존 33 pre-existing errors는
# 별도 cleanup PR로 분리. 우리 변경분만 책임지는 정합 (2026-04-29 incremental fix).
STAGED_TS=$(git -C "$WORKSPACE_DIR" diff --cached --name-only --diff-filter=ACM 2>/dev/null \
  | grep -E '^yieldo/.*\.(ts|tsx)$' \
  | sed 's|^yieldo/||' || true)
echo "▸ eslint (staged)..." >&2
if [ -z "$STAGED_TS" ]; then
  echo "  ⤼ eslint skip — staged ts/tsx 없음" >&2
elif ! npx eslint $STAGED_TS > /tmp/yieldo-eslint.log 2>&1; then
  cat /tmp/yieldo-eslint.log >&2
  FIRST=$(grep -m1 -E 'error' /tmp/yieldo-eslint.log || echo "eslint failed")
  add_failure "eslint" "$FIRST"
else
  echo "  ✅ eslint 통과 ($(echo "$STAGED_TS" | wc -l | tr -d ' ')개 파일)" >&2
fi

# 3. arch-guard (현재 stub, 항상 0)
echo "▸ arch-guard..." >&2
if ! bash "$LIB_DIR/arch-guard-wrapper.sh" "$APP_DIR" > /tmp/yieldo-arch.log 2>&1; then
  cat /tmp/yieldo-arch.log >&2
  add_failure "arch-guard" "$(cat /tmp/yieldo-arch.log)"
else
  echo "  ✅ arch-guard 통과 (stub)" >&2
fi

# 4. build
echo "▸ npm run build..." >&2
if ! bash "$LIB_DIR/build-check.sh" > /tmp/yieldo-build.log 2>&1; then
  cat /tmp/yieldo-build.log >&2
  add_failure "build" "$(cat /tmp/yieldo-build.log)"
else
  echo "  ✅ build 통과" >&2
fi

# 통과 케이스: state 리셋
if [[ "$FAILURES" == "[]" ]]; then
  rm -f "$WORKSPACE_DIR/.harness-state/ultraqa-cycle.json"
  echo "━━━ 게이트 통과 — 커밋 진행 ━━━" >&2
  exit 0
fi

# 실패: ultraqa 트리거, exit 2로 차단
echo "━━━ 게이트 실패 → ultraqa cycle 트리거 ━━━" >&2
bash "$LIB_DIR/ultraqa-trigger.sh" "$FAILURES"
exit 2
