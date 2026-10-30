---
name: open-slide
description: Generate on-brand Databricks slide decks as React components in the local open-slide project, using the Databricks corporate design system as the theme. Use when the user says "open-slide", "open slide deck", "react slide deck", "build a slide in open-slide", or asks for a code-based (not Claude Design) branded deck. Sets up a local open-slide project on first use (theme, fonts, starter decks, internal brand pack), then authors decks with the Databricks theme, verifies the render, and exports to HTML, PDF, editable PPTX, or Google Slides.
---

# open-slide

Generate a polished, on-brand Databricks slide deck as React components in the user's **local open-slide project** (`<project>` below; Step 1 finds or creates it). Each deck is a `slides/<id>/index.tsx` file rendered on a fixed 1920×1080 canvas; the `@open-slide/core` runtime handles scaling, navigation, thumbnails, and play mode.

Use it when the user wants editable, code-based slides in a git repo they run locally, with PPTX / PDF / HTML / Google Slides export.

## This skill is a thin driver

The open-slide project ships its **own** authoring skills under `.agents/skills/` — they are the source of truth for *how* to write slides, and this skill delegates to them rather than duplicating their contents (so it never drifts when the project updates):

- **`create-slide`** — owns the "draft a new deck" workflow: theme pick, scoping questions, page structure.
- **`slide-authoring`** — technical reference: file contract, 1920×1080 canvas, type scale, `design` const + `var(--osd-*)` tokens, assets, webfonts, transitions.
- **`create-theme`** — create/extract a theme (rarely needed; the Databricks theme already exists).
- **`apply-comments`** — apply `@slide-comment` inspector markers.
- **`current-slide`** — resolve "this slide" / "this page" against the dev server.

This skill's job is only to: get into the right project, make sure the **Databricks theme** is applied, run the **build + screenshot** verify loop, export when asked, and remind the user to commit. It does not re-teach slide authoring.

## Project facts (do not rediscover)

- **Path:** `project_dir` in `~/.claude/open-slide-config.json` (or the file `$OPEN_SLIDE_CONFIG` names), written by the setup script. One project per user; all decks accumulate there.
- **Package manager: `npm`** (the project ships a `package-lock.json`).
- **Version: `@open-slide/core` 2.x** (2.1.0 as of 2026-10-14; React 19, Vite 8). 2.x is what unlocked editable PPTX export, speaker notes, the in-editor Format panel, and the chrome-less preview route. `package.json` carries an `"overrides": { "zod": "^4.5.0" }` entry: the Databricks npm proxy only serves recent versions, so shadcn's `zod@^3` range can't resolve without it. Do not remove it.
- **Theme: `themes/databricks.md`** — the Databricks corporate brand (Oat/Navy light + Deep-ink dark modes, Lava ≤10% accent, DM Sans / DM Mono). Already installed; do NOT recreate it. See `references/databricks-theme.md`.
- **Brand assets:** `assets/brand/*.svg` (367 official SVGs: logos, symbols, product icons and lockups, nodal illustrations) are **downloaded at setup** from a databricks.com-only Drive file, because this plugin's repo is public. They are gitignored: never commit them to a public repo. `assets/fonts/` has DM Sans + DM Mono TTFs (OFL). Import brand SVGs via `@assets/...`.
- **Reference decks to copy patterns from:** `slides/hello-world-dark/` (dark 3-slide title/Genie/Lakebase), plus `databricks-core`, `databricks-data`, `databricks-architecture`, `databricks-narrative`, and open-slide's own `getting-started`.

## Workflow

Copy this checklist and track progress:

```
open-slide Progress:
- [ ] Step 0: Gather brief (topic, audience, slide count, light/dark)
- [ ] Step 1: Find or set up the project
- [ ] Step 2: Author the deck via the project's own create-slide skill, Databricks theme
- [ ] Step 3: Verify — npm run build (must pass)
- [ ] Step 4: Verify — dev server + screenshot (confirm on-brand)
- [ ] Step 5: Export (only if asked: HTML / PDF / PPTX)
- [ ] Step 6: Deliver + remind to commit
```

### Step 0: Gather the brief
Ask only what you cannot infer: topic, audience, rough slide count, and **light vs dark mode** (the Databricks theme supports both). Do NOT ask about visual style beyond mode — the theme owns aesthetic direction. If the user gives a bare topic, propose a slide outline and proceed once they confirm.

### Step 1: Find or set up the project
```bash
python3 -c "import json,os; p=os.environ.get('OPEN_SLIDE_CONFIG') or os.path.expanduser('~/.claude/open-slide-config.json'); print(json.load(open(p))['project_dir'] if os.path.exists(p) else 'NO CONFIG')"
```
- **Prints a path that exists** → that is `<project>`. Run `cd <project> && [ -d node_modules ] || npm install`, and if `assets/brand/` has no SVGs, `python3 <skill-dir>/scripts/fetch_brand_pack.py --dest <project>/assets/brand`.
- **No config, or the path is gone** → first run. Ask where to create the project (suggest `~/open-slide-decks`), or accept an existing open-slide project the user points at, then:
  ```bash
  bash <skill-dir>/scripts/setup_project.sh <path>
  ```
  It copies the starter (theme, fonts, starter decks, open-slide's own authoring skills), runs `git init` and `npm install`, links the authoring skills into `.claude/skills/`, downloads the brand pack, and saves `project_dir`. It refuses a non-empty folder that isn't an open-slide project. Both the lookup above and the script honor `$OPEN_SLIDE_CONFIG`.
- **Brand pack download fails**: 401 → run `/google-auth` (fe-google-tools) and retry. 403/404 → the user's Google account isn't databricks.com and can't get the pack. Without it, any deck that imports `@assets/brand/...` (all the starters do) fails to build, so stop and tell the user.

`<skill-dir>` is this skill's base directory (shown when the skill loads).

### Step 2: Author the deck
Follow the project's **own** `.agents/skills/create-slide` skill for the authoring workflow, and `slide-authoring` for the page-level how-to. Key points this skill enforces:
- **Apply the Databricks theme.** When `create-slide` Step 1 lists `themes/`, pick **`databricks`** (unless the user explicitly wants no theme). Read `themes/databricks.md` end-to-end; its palette, type scale, and components are authoritative — copy them into the slide. Set `theme: 'databricks'` on the `meta` export. Because a theme is chosen, skip the aesthetic-direction question; still confirm topic, page count, and text density.
- Write only under `slides/<kebab-id>/`. Never touch `package.json`, `open-slide.config.ts`, or other slides' files.
- Load DM Sans / DM Mono via the module-level, slide-keyed webfont injection (per `slide-authoring`'s `references/webfonts.md`) so the deck never silently falls back to system fonts.
- Import brand SVGs via `@assets/brand/<name>.svg`; light mode uses the navy/full-color logos, dark mode the white ones.
- **Speaker notes / talk track:** write them into the deck's `notes` export (index-aligned with the pages array, per `slide-authoring`), never a separate `script.md`. Present mode shows them in the presenter view.

### Step 3: Verify — build
```bash
cd <project> && npm run build 2>&1 | tail -20
```
Gate: the build MUST complete ("✓ built in ...") with no transform/type errors on your slide. Fix and rebuild before continuing. (The "chunks larger than 500 kB" notice is a benign warning, not a failure.)

### Step 4: Verify — screenshot (default: always)
Confirm the deck actually renders on-brand, not just that it compiles:
1. Start the dev server in the background: `cd <project> && npm run dev`. Read the port from `node_modules/.open-slide/server.json` (`{ "url", "port", ... }`, written on startup, removed on shutdown) instead of assuming 5173. Its `url` is IPv6 (`http://[::1]:5173/`); `http://localhost:<port>/` works the same.
2. Load the Chrome DevTools MCP schemas: `ToolSearch("select:mcp__chrome-devtools__new_page,mcp__chrome-devtools__navigate_page,mcp__chrome-devtools__resize_page,mcp__chrome-devtools__evaluate_script,mcp__chrome-devtools__take_screenshot,mcp__chrome-devtools__list_console_messages,mcp__chrome-devtools__close_page")`.
3. **Shoot each page from the chrome-less preview route:** `<url>s/<slide-id>/preview?p=<n>` (`p` is 1-based; add `&step=<k>` to show only the first `k` `<Step>`s). `resize_page` to 1920×1080 first (the viewport lands a little shorter because of window chrome; the slide letterboxes to fit, which is fine). Before each screenshot, poll the ready flag with `evaluate_script` (`wait_for` only matches visible text, not selectors):
   ```js
   async () => { for (let i = 0; i < 60; i++) { const s = document.querySelector('[data-osd-preview]')?.getAttribute('data-osd-preview'); if (s === 'ready' || s === 'error') return { state: s, error: document.querySelector('[data-osd-preview-error]')?.textContent ?? null }; await new Promise(r => setTimeout(r, 250)); } return { state: 'timeout' }; }
   ```
   `ready` means fonts, images, and entry animations have settled → `take_screenshot`. On `error`, read the returned message and fix the cause rather than screenshotting anyway. Run `list_console_messages(["error"])` per deck.
   - The editor itself is at `/s/<slide-id>` (gallery at `/`, themes at `/themes/<id>`); `/slides/<id>` and `/<id>` both render "Page not found". Use the editor only when you need its UI (thumbnail rail, Format panel, export menu).
4. Gate: console errors **originating from your slide**, missing brand fonts (system-font fallback), wrong palette, or clipped/overlapping text → fix and re-verify. Confirm DM Sans renders, Oat/Navy/Lava (or dark equivalents) are right, and every requested slide landed. Editor-chrome warnings from open-slide's own components (not your `slides/<id>/` files) are not your deck's problem.
5. Stop the dev server when done (`pkill -f "open-slide dev"`).

If Chrome DevTools MCP is unavailable, fall back to `npm run preview` and tell the user to eyeball it, noting the screenshot step was skipped.

### Step 5: Export (only when asked)
Exports run in the browser from the editor's **Download** menu (`/s/<slide-id>`, download icon in the top bar), and the file lands in `~/Downloads`:

| Menu item | Output | Use when |
|---|---|---|
| Export as HTML | Self-contained static deck | Sharing without a server |
| Export as PDF | One page per slide (not supported in Safari) | Read-only handout |
| **Export as PPTX** | **Editable**: real text boxes, shapes, logos as pictures | Someone will edit in PowerPoint / Google Slides / Keynote |
| Export as image PPTX | Each slide is a flat picture | Pixel-perfect fidelity matters more than editing |

To drive it with Chrome DevTools MCP: `take_snapshot`, click the `Download` button, click the menu item, then wait for the newest `*.pptx` / `*.pdf` in `~/Downloads` (no `.crdownload` left). To sanity-check an editable PPTX, open it with `python-pptx` and count `TEXT_BOX` shapes per slide and the run fonts (expect `DM Sans` / `DM Mono`); `qlmanage -t -s 1600 -o /tmp/out <file>.pptx` renders slide 1 for a visual check.

**Google Slides:** if the user wants the deck in Google Slides / their Drive, hand off to the **`open-slide-gslides`** subskill instead of uploading the raw export. Slides' importer ignores the PPTX's no-wrap flags and re-wraps every text box; that subskill pads the boxes, uploads to `My Drive/open-slide` (updating in place on re-runs), and validates the thumbnails.

**Font caveat:** the PPTX does not embed fonts. Google Slides has DM Sans, so it renders correctly there; PowerPoint/Keynote fall back to a default font unless DM Sans / DM Mono are installed on that machine (TTFs are in the project's `assets/fonts/`). Tell the user this when handing over a PPTX.

### Step 6: Deliver + remind to commit
- Tell the user the **slide id** and how to view/present: `cd <project> && npm run dev`, then open the local URL.
- The deck is a **local git file**, not a hosted link. Remind the user to commit it (offer to do so): `git add slides/<id> && git commit`.
- Summarize the slide list briefly and how to edit (open `slides/<id>/index.tsx`, or use the project's `apply-comments` / `current-slide` skills for inspector-driven edits).

## Upgrading open-slide
Only when the user asks (it rewrites `package.json`, which decks must otherwise never touch). Work on a branch:
1. Check `npm view @open-slide/core version` and its `dependencies` for new React/Vite majors; bump those alongside it.
2. `npm install @open-slide/core@^<new>`. On `ETARGET No matching version found` for a transitive package, that's the Databricks npm proxy's truncated version list: add/extend `"overrides"` to a version the proxy has (`npm view <pkg> versions --json`). Don't switch to the public registry without asking.
3. `npx open-slide sync:skills` (try `--dry-run` first) to refresh the project's `.agents/skills/`, then skim the diff for workflow changes this skill should pick up.
4. `npm run build`, then screenshot a few existing decks before and after to confirm they render unchanged.
5. Commit `package.json`, `package-lock.json`, and `.agents/skills/` only; leave in-progress decks out unless the user says otherwise.

## Resources

- `scripts/setup_project.sh`: first-run project setup (idempotent).
- `scripts/fetch_brand_pack.py`: download + verify the internal brand pack into `assets/brand/`.
- `references/databricks-theme.md`: what the Databricks theme is, its palette/type at a glance, brand asset locations, and light-vs-dark logo choices — so you don't re-read the whole theme file to make routine choices.

## Examples

### Example: Bare topic
User says: "open-slide deck on our Genie rollout for a retail exec, dark mode"
Result: Proposes a short outline (cover, problem, Genie architecture, results, next steps), confirms, then authors `slides/genie-rollout/index.tsx` with the Databricks dark theme, builds, screenshots each slide to confirm on-brand, and reports the slide id + how to present.

### Example: Sample deck
User says: "build a sample Databricks open-slide deck so I can see it"
Result: Points at (or regenerates) `slides/hello-world-dark/`, builds, screenshots, and shows the render — a 3-slide title/Genie/Lakebase demo of the brand.

### Example: Editable PowerPoint
User says: "export the quarterly review deck to PowerPoint so my AE can edit it"
Result: Opens `/s/quarterly-review`, picks **Export as PPTX** (editable, not image), confirms the file landed in `~/Downloads` with real DM Sans text boxes, and notes that DM Sans must be installed for PowerPoint to render it on-brand (Google Slides is fine as-is).
