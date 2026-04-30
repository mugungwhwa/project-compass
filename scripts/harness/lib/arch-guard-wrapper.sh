#!/usr/bin/env bash
# arch-guard-wrapper.sh — yieldo arch-guard 검증 어댑터
#
# 현재: STUB (항상 통과). arch-guard:arch-audit는 Claude Code skill이라 shell에서
# 직접 호출 불가. 풀 통합은 후속 iteration에서 옵션 검토:
#   1) `claude --print "/arch-guard:arch-audit"` — 새 Claude 세션 spawn (heavy ~30s+)
#   2) ESLint custom rule로 FSD 레이어 의존성만 lint 단계에서 검사 (lightweight)
#   3) Claude가 commit 직전 자체 invoke 후 결과 파일을 gate가 읽음 (이벤트 기반)
#
# Usage: arch_guard_audit <yieldo-path>
# Returns:
#   exit 0  : 통과 (현재는 항상)
#   exit 1  : 위반 발견 (현재는 미구현)
# Stdout (on failure): JSON line { "violations": N, "first": "<file:line>" }

set -uo pipefail

YIELDO_PATH="${1:-./yieldo}"

if [[ ! -d "$YIELDO_PATH" ]]; then
  printf '{"error":"yieldo path missing: %s"}\n' "$YIELDO_PATH" >&2
  exit 1
fi

# STUB: 항상 통과. 후속 PR에서 실제 검증으로 교체.
exit 0
