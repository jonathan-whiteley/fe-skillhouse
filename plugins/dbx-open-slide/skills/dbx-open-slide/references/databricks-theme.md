# Databricks theme — quick reference

The authoritative source is `themes/databricks.md` **inside the project**
(`<project>/themes/databricks.md`). Read it end-to-end when
authoring. This file is a fast lookup so you don't re-read the whole theme for routine
choices. If the two ever disagree, the in-project file wins.

## What the theme is

The Databricks corporate slide identity, expressed as an
open-slide theme. The aesthetic is **pre-committed**: execute it, don't re-invent it. Two
surface modes share one type system and one accent:

- **Light** (corporate default) — Oat `#F9F7F4` surface, Navy `#1B3139` text.
- **Dark** (exec events / dark rooms) — Deep-ink `#0B2026` surface, Oat-white `#F9F7F4` text.

Pick the mode per deck at Step 0. Both are driven by the slide's `design` const → `var(--osd-*)`
tokens, so the fixed components adapt automatically.

## Palette (role → light / dark)

| Role      | Light      | Dark       |
| --------- | ---------- | ---------- |
| bg        | `#F9F7F4`  | `#0B2026`  |
| text      | `#1B3139`  | `#F9F7F4`  |
| accent    | `#FF3621` (Lava 600 — **≤10% of any page**) | same |
| muted     | `#5A5755`  | `#B9C6CB`  |
| faint     | `#8A8580`  | `#7E9098`  |
| surface   | `#FFFFFF`  | `#1B3139`  |
| bg-subtle | `#EEEDE9`  | `#143D4A`  |
| line      | `#E4E2DD`  | `#2E4A54`  |
| success   | `#00875C` (positive deltas only) | same |
| error     | `#98102A` (Maroon — negative deltas; NOT Lava) | same |

Data-viz series (in order, not all Lava): navy `#1B3139`, lava `#FF3621`, slate `#618794`,
green `#00A972`, amber `#FFAB00`, teal-navy `#1B5162`. Lava = one series or the single hero number.

## Type

- **DM Sans** (display + body, 400/500/700), **DM Mono** (code + tabular nums, 400/500). No substitutes.
- Webfont (module-level, slide-keyed injection per `slide-authoring` `references/webfonts.md`):
  `https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=DM+Mono:wght@400;500&display=swap`
- Scale (1920×1080): hero 132 / section 108 / page-heading 84 / card-title 36 / body 32 /
  big-stat 132 / eyebrow 22 upper (ls 0.16em) / caption 22.

## Layout at a glance

- Padding: 108px vertical, 132px horizontal from canvas edge. Text never touches the edge.
- Left-aligned editorial; center only cover / section / closing pages.
- Accent bar: 96×9px Lava rectangle, radius 4, above/below title (one per page).
- Cards: `surface` fill, radius 16, soft navy shadow. No cards-in-cards.
- Bullets: square Lava/navy tick (13px, radius 3) + 24px gap. Not round dots, not a border stripe.
- Paste-ready `Title` / `Footer` components live in `themes/databricks.md` "Fixed components" — copy verbatim.

## Brand assets (downloaded at setup; gitignored)

- **Logos** `assets/brand/`: light mode → `databricks-logo-navy.svg` / `-full-color.svg`;
  dark mode → `databricks-logo-white.svg` / `-white-mono.svg`. Symbols: `databricks-symbol-{navy,white,color}.svg`.
- **Product icons** `assets/brand/<product>-icon-full-color.svg` and `-lockup-*` (Genie, Lakebase,
  Unity Catalog, Lakeflow + variants, Mosaic AI, Delta Sharing, Marketplace, Photon, SQL, Apps, etc.).
  White variants (`-white.svg`) for dark backgrounds.
- **Illustrations** `assets/brand/illustration-nodal-*.svg` (nodal network motifs).
- **Fonts** `assets/fonts/` — DM Sans + DM Mono TTFs (self-hosted; the webfont import above is the primary path).
- Import in a slide via `@assets/brand/<name>.svg`.
