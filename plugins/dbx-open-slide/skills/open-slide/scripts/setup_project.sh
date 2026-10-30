#!/usr/bin/env bash
# One-time setup of a local open-slide project with the Databricks theme.
# Usage: bash setup_project.sh <project-dir>
# Records the path in ~/.claude/open-slide-config.json ($OPEN_SLIDE_CONFIG overrides the file).
# Safe to re-run: an existing project only gets missing deps, skill links and brand assets.
set -euo pipefail
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:?usage: setup_project.sh <project-dir>}"
DEST="${DEST/#\~/$HOME}"

if [ -e "$DEST" ] && [ ! -f "$DEST/open-slide.config.ts" ] && [ -n "$(ls -A "$DEST" 2>/dev/null)" ]; then
  echo "refusing: $DEST exists, is not empty, and is not an open-slide project" >&2
  exit 1
fi

if [ ! -f "$DEST/open-slide.config.ts" ]; then
  mkdir -p "$DEST"
  # --ignore-existing: never overwrite anything already there
  rsync -a --ignore-existing "$SKILL_DIR/starter/" "$DEST/"
  (cd "$DEST" && git init -q && echo "created project at $DEST")
fi

# Claude Code discovers the project's own authoring skills through .claude/skills symlinks.
mkdir -p "$DEST/.claude/skills"
for s in "$DEST"/.agents/skills/*/; do
  name="$(basename "$s")"
  [ -e "$DEST/.claude/skills/$name" ] || ln -s "../../.agents/skills/$name" "$DEST/.claude/skills/$name"
done

(cd "$DEST" && { [ -d node_modules ] || npm install --no-audit --no-fund; })

if [ -z "$(ls "$DEST"/assets/brand/*.svg 2>/dev/null)" ]; then
  python3 "$SKILL_DIR/scripts/fetch_brand_pack.py" --dest "$DEST/assets/brand"
fi

OPEN_SLIDE_CONFIG="${OPEN_SLIDE_CONFIG:-$HOME/.claude/open-slide-config.json}" python3 - "$DEST" <<'EOF'
import json, os, sys
p = os.environ["OPEN_SLIDE_CONFIG"]
cfg = json.load(open(p)) if os.path.exists(p) else {}
cfg["project_dir"] = os.path.abspath(sys.argv[1])
os.makedirs(os.path.dirname(p), exist_ok=True)
json.dump(cfg, open(p, "w"), indent=2)
print(f"saved project_dir to {p}")
EOF
echo "ready: $DEST"
