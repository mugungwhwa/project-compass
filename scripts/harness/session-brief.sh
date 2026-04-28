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
