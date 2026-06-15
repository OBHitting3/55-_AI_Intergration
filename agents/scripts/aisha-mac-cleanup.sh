#!/bin/bash
# Aisha Mac Janitor v1 — legacy cleanup, targets rot only.
#
# Run on the Mac (not WSL2). Safe by default: with no flags, prints usage.
# Use --dry-run first to preview, then --confirm to actually delete.

set -e

DRY_RUN=0
CONFIRM=0
for arg in "$@"; do
  [[ "$arg" == "--dry-run" ]] && DRY_RUN=1
  [[ "$arg" == "--confirm" ]] && CONFIRM=1
done

if [ "$DRY_RUN" -eq 0 ] && [ "$CONFIRM" -eq 0 ]; then
  cat <<EOF
Usage: $0 [--dry-run | --confirm]
  --dry-run   List up to 30 deletion candidates per target. No changes.
  --confirm   Actually delete the matched files.

Targets: ~/Downloads ~/Desktop ~/Documents ~/.Trash
Patterns: *.tmp *.bak ._* *.crdownload .DS_Store
EOF
  exit 0
fi

TARGETS=(
  "$HOME/Downloads"
  "$HOME/Desktop"
  "$HOME/Documents"
  "$HOME/.Trash"
)

PATTERNS=(-name "*.tmp" -o -name "*.bak" -o -name "._*" -o -name "*.crdownload" -o -name ".DS_Store")

LOG_DIR="$HOME/Obsidian"
LOG_FILE="$LOG_DIR/Janitor-Log.md"
mkdir -p "$LOG_DIR"

{
  echo ""
  echo "## Aisha sweep — $(date '+%Y-%m-%d %H:%M:%S')"
  echo "Mode: $([ $CONFIRM -eq 1 ] && echo confirm || echo dry-run)"
  echo
} >>"$LOG_FILE"

echo "=== Aisha sweep started ==="
for dir in "${TARGETS[@]}"; do
  [ -d "$dir" ] || continue
  echo "Scanning $dir"
  if [ "$DRY_RUN" -eq 1 ]; then
    find "$dir" -type f \( "${PATTERNS[@]}" \) | head -30 | tee -a "$LOG_FILE"
  else
    find "$dir" -type f \( "${PATTERNS[@]}" \) -print -delete | tee -a "$LOG_FILE"
    echo "Cleaned $dir"
  fi
done

echo "Aisha complete. Log appended to $LOG_FILE"
