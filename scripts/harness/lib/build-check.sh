#!/usr/bin/env bash
# build-check.sh — yieldo workspace 안에서 `npm run build` 실행
# Worktree 인식: $PWD/yieldo가 있으면 그것, 없으면 $CLAUDE_PROJECT_DIR/yieldo
#
# Usage: build_check
# Returns:
#   exit 0  : 빌드 성공
#   exit 1  : 빌드 실패
# Stdout (on failure): JSON line { "stage": "build", "first_error": "<line>" }

set -uo pipefail

# yieldo 경로 결정: 현재 worktree 우선, fallback 프로젝트 루트
if [[ -d "$PWD/yieldo" ]]; then
  YIELDO_PATH="$PWD/yieldo"
elif [[ -d "${CLAUDE_PROJECT_DIR:-/Users/mike/Downloads/Compass}/yieldo" ]]; then
  YIELDO_PATH="${CLAUDE_PROJECT_DIR:-/Users/mike/Downloads/Compass}/yieldo"
else
  printf '{"stage":"build","first_error":"yieldo path not found"}\n'
  exit 1
fi

cd "$YIELDO_PATH" || {
  printf '{"stage":"build","first_error":"cannot cd to yieldo"}\n'
  exit 1
}

# 빌드 실행, 출력은 tempfile에 저장해서 첫 에러 라인 추출
LOG=$(mktemp)
trap 'rm -f "$LOG"' EXIT

if npm run build > "$LOG" 2>&1; then
  exit 0
fi

# 첫 에러 라인 추출 (Next.js 빌드 컨벤션)
FIRST=$(grep -m1 -E '(Error|error)' "$LOG" 2>/dev/null || echo "build failed without recognizable error line")
# JSON-safe 인코딩 (jq가 있으면 사용, 없으면 단순 escape)
if command -v jq >/dev/null 2>&1; then
  ENCODED=$(jq -Rs . <<< "$FIRST")
  printf '{"stage":"build","first_error":%s}\n' "$ENCODED"
else
  ESCAPED=${FIRST//\"/\\\"}
  printf '{"stage":"build","first_error":"%s"}\n' "$ESCAPED"
fi

exit 1
