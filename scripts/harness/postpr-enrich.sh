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
