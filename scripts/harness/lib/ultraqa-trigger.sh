#!/usr/bin/env bash
# ultraqa-trigger.sh — gate 실패 시 state file 작성 + GATE_FAIL marker 출력
# Claude가 stdout을 파싱해 ultraqa skill 발동 (수정→재검증 루프)
#
# Usage: ultraqa_trigger <failure_json_array>
#   <failure_json_array> = JSON like '[{"stage":"tsc","first_error":"..."},...]'
#
# Side effects:
#   - .harness-state/ultraqa-cycle.json 작성/갱신 (cycle, hardcap, arch_gate, failures, ts)
#   - 구조화 stdout: GATE_FAIL | GATE_FAIL_ARCH_GATE | GATE_FAIL_HARDCAP
#   - 항상 exit 2 (원래 git 명령 차단)
#
# 흐름:
#   - cycle 1,2 : 일반 GATE_FAIL → Claude가 arch-fix invoke
#   - cycle 3,6 : GATE_FAIL_ARCH_GATE → Claude가 architect 검증부터
#   - cycle ≥9  : GATE_FAIL_HARDCAP → 사용자 escalation 강제

set -uo pipefail

FAILURES_JSON="${1:-[]}"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-/Users/mike/Downloads/Compass}"
STATE_DIR="$PROJECT_DIR/.harness-state"
STATE_FILE="$STATE_DIR/ultraqa-cycle.json"

mkdir -p "$STATE_DIR"

# 기존 state 읽거나 초기화
if [[ -f "$STATE_FILE" ]] && command -v jq >/dev/null 2>&1; then
  CYCLE=$(jq -r '.cycle // 0' "$STATE_FILE" 2>/dev/null || echo 0)
  CYCLE=$((CYCLE + 1))
else
  CYCLE=1
fi

# 플래그 결정 (hardcap 우선)
HARDCAP="false"
ARCH_GATE="false"
if [[ "$CYCLE" -ge 9 ]]; then
  HARDCAP="true"
elif [[ $((CYCLE % 3)) -eq 0 ]]; then
  ARCH_GATE="true"
fi

# state 작성 (jq 있으면 정식, 없으면 fallback)
if command -v jq >/dev/null 2>&1; then
  jq -n \
    --argjson cycle "$CYCLE" \
    --arg hardcap "$HARDCAP" \
    --arg arch_gate "$ARCH_GATE" \
    --argjson failures "$FAILURES_JSON" \
    '{cycle: $cycle, hardcap: ($hardcap == "true"), arch_gate: ($arch_gate == "true"), failures: $failures, ts: now}' \
    > "$STATE_FILE"
else
  cat > "$STATE_FILE" <<EOF
{"cycle":$CYCLE,"hardcap":$HARDCAP,"arch_gate":$ARCH_GATE,"failures":$FAILURES_JSON,"ts":$(date +%s)}
EOF
fi

# 구조화 marker 출력 (Claude가 파싱)
if [[ "$HARDCAP" == "true" ]]; then
  echo "GATE_FAIL_HARDCAP cycle=$CYCLE state=$STATE_FILE"
elif [[ "$ARCH_GATE" == "true" ]]; then
  echo "GATE_FAIL_ARCH_GATE cycle=$CYCLE state=$STATE_FILE"
else
  echo "GATE_FAIL cycle=$CYCLE state=$STATE_FILE"
fi

cat "$STATE_FILE"
exit 2
