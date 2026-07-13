#!/bin/sh
# GATE-B: warn when stable seam files are staged (RULES.md#50)
# Reads seam paths from CONTEXT/STABLE_SEAMS.md marker block.

set -e

ROOT="$(git rev-parse --show-toplevel)"
SEAMS_FILE="$ROOT/CONTEXT/STABLE_SEAMS.md"

if [ ! -f "$SEAMS_FILE" ]; then
  echo "seam-guard: CONTEXT/STABLE_SEAMS.md not found — skipping."
  exit 0
fi

staged=$(git diff --cached --name-only --diff-filter=ACM)
[ -z "$staged" ] && exit 0

in_block=0
touched=""
while IFS= read -r line; do
  case "$line" in
    *"<!-- SEAMS:START -->"*) in_block=1; continue ;;
    *"<!-- SEAMS:END -->"*) in_block=0; continue ;;
  esac
  if [ "$in_block" -eq 1 ]; then
  seam=$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
  [ -z "$seam" ] && continue
  for file in $staged; do
    if [ "$file" = "$seam" ]; then
      touched="$touched $seam"
    fi
  done
  fi
done < "$SEAMS_FILE"

if [ -n "$touched" ]; then
  echo "seam-guard: staged stable seam file(s):$touched"
  echo "seam-guard: declare the seam touch in your commit message (e.g. 'seam: liveData.ts — ...')."
  if ! printf '%s' "$(git log -1 --pretty=%B 2>/dev/null || true)" | grep -qi 'seam:'; then
    # Pre-commit cannot see the pending commit message; require an env override for seam commits.
    if [ "$SEAM_DECLARED" != "1" ]; then
      echo "seam-guard: set SEAM_DECLARED=1 when committing seam changes intentionally."
      exit 1
    fi
  fi
fi

exit 0
