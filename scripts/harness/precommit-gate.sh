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
APP_DIR="$WORKSPACE_DIR/yieldo"

if [ ! -d "$APP_DIR" ]; then
  echo "❌ precommit-gate: compass/ 서브디렉터리를 찾지 못함 ($APP_DIR)" >&2
  exit 2
fi

cd "$APP_DIR"

echo "━━━ yieldo pre-commit gate (in yieldo/) ━━━" >&2

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
