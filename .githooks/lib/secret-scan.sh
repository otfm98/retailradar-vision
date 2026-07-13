#!/bin/sh
# GATE-B: block obvious secrets in staged files (RULES.md#1)

set -e

staged=$(git diff --cached --name-only --diff-filter=ACM)
[ -z "$staged" ] && exit 0

found=0
for file in $staged; do
  [ -f "$file" ] || continue
  case "$file" in
    *.png|*.jpg|*.jpeg|*.gif|*.ico|*.woff|*.woff2|bun.lock|package-lock.json) continue ;;
  esac
  if grep -En '(api[_-]?key|secret|password|token|private[_-]?key)\s*[:=]\s*["'"'"'][^"'"'"']{8,}' "$file" 2>/dev/null; then
    echo "secret-scan: possible credential pattern in staged file: $file"
    found=1
  fi
done

if [ "$found" -ne 0 ]; then
  echo "secret-scan: blocked — remove secrets before committing."
  exit 1
fi

exit 0
