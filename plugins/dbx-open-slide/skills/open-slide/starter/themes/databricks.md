---
name: Databricks
description: Databricks corporate brand for slides — Oat-light or Navy-dark surfaces, Navy text, Lava as a strict 10% accent, DM Sans + DM Mono. Editorial-plain, no AI slop.
mode: light
---

# Databricks

The Databricks corporate slide identity. The aesthetic is **pre-committed** — do not
re-litigate it per deck. Execute the brand with precision; do not invent a new one.

Two surface modes share one type system and one accent. Pick per deck (or per page):

- **Light** (default) — Oat `#F9F7F4` surface, Navy `#1B3139` text. Corporate default.
- **Dark** — Deep-ink `#0B2026` surface, Oat-white `#F9F7F4` text. Exec-events / dark rooms.

## Palette

| Role       | Value     | Notes                                                        |
| ---------- | --------- | ------------------------------------------------------------ |
| bg         | `#F9F7F4` | light surface (Oat Light). Dark mode: `#0B2026`.             |
| text       | `#1B3139` | primary copy on light (Navy). Dark mode: `#F9F7F4`.          |
| accent     | `#FF3621` | Lava 600. Callouts, key numbers, one accent bar. **≤10% of any page.** |
| muted      | `#5A5755` | secondary copy on light. Dark mode: `#B9C6CB`.               |
| faint      | `#8A8580` | captions / footer on light. Dark mode: `#7E9098`.           |
| surface    | `#FFFFFF` | card / panel fill on light. Dark mode: `#1B3139`.           |
| bg-subtle  | `#EEEDE9` | secondary tint (Oat Medium). Dark mode: `#143D4A`.          |
| line       | `#E4E2DD` | warm hairline on light. Dark mode: `#2E4A54`.               |
| success    | `#00875C` | positive deltas only. Not decorative.                        |
| error      | `#98102A` | negative deltas only (Maroon — disambiguated from Lava).     |

Data-viz series (categorical, use in order — NOT all Lava): `#1B3139` navy, `#FF3621` lava,
`#618794` slate, `#00A972` green, `#FFAB00` amber, `#1B5162` teal-navy. Keep Lava to one
series or the single "hero" number.

## Typography

- Display + body font: **DM Sans** — `'DM Sans', system-ui, -apple-system, sans-serif`. Weights 400 / 500 / 700.
- Mono font: **DM Mono** — `'DM Mono', ui-monospace, 'SF Mono', Menlo, monospace`. Weights 400 / 500. Use for code, and tabular numbers in tables (`fontVariantNumeric: 'tabular-nums'`).
- **No substitutes, ever.** No Barlow, no Inter, no system-only fallback as the design.
- Webfont import (load once at module top level per `slide-authoring/references/webfonts.md`, keyed to the slide id): `https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=DM+Mono:wght@400;500&display=swap`
- Type scale (1920×1080 canvas — these override `slide-authoring` defaults):
  - Hero title (cover): 132px, weight 700, letter-spacing -0.02em, line-height 1.04
  - Section heading: 108px, weight 700
  - Page heading: 84px, weight 700, letter-spacing -0.02em
  - Card / stat title: 36px, weight 700
  - Body: 32px, weight 400, line-height 1.6
  - Bullet: 32px, weight 400
  - Big stat number: 132px, weight 700, letter-spacing -0.03em
  - Eyebrow / label: 22px, weight 700, letter-spacing 0.16em, UPPERCASE
  - Caption / footer: 22px, weight 500

## Layout

- Canvas: 1920 × 1080 (open-slide standard). Design values below are the zip template ×1.5.
- Content padding: **108px vertical, 132px horizontal** from canvas edges. Never let text touch the edge.
- Alignment: left-aligned, editorial. Center only cover/section/closing ceremonial pages.
- One accent bar convention: 96px × 9px Lava rectangle, radius 4px, above or below the title.
- Cards: white (`surface`) fill, radius 16px, soft navy-tinted shadow `0 3px 9px rgba(27,49,57,0.08), 0 12px 30px rgba(27,49,57,0.08)`. Do NOT nest cards in cards.
- Bullets: square Lava/navy tick (13px, radius 3px) + 24px gap. NOT round dots. NOT a left border stripe.

## Fixed components

Paste-ready. Copy verbatim into a slide that uses this theme. They read `var(--osd-*)`
tokens injected by the slide's `design` const, so light/dark follows the slide's palette.

### Title

```tsx
// size: 132 hero (cover/closing), 108 section divider, 84 page heading.
const Title = ({ children, size = 132 }: { children: React.ReactNode; size?: 132 | 108 | 84 }) => (
  <h1
    style={{
      fontFamily: 'var(--osd-font-display)',
      fontSize: size,
      fontWeight: 700,
      lineHeight: 1.04,
      letterSpacing: '-0.02em',
      margin: 0,
      color: 'var(--osd-text)',
    }}
  >
    {children}
  </h1>
);
```

### AccentBar

```tsx
const AccentBar = () => (
  <div style={{ width: 96, height: 9, borderRadius: 4, background: 'var(--osd-accent)' }} />
);
```

### Eyebrow

```tsx
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontFamily: 'var(--osd-font-body)',
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: 'var(--osd-accent)',
    }}
  >
    {children}
  </div>
);
```

### Footer

Pull the page number from `useSlidePageNumber()` — never hardcode `pageNum` / `total`.
Import the Databricks wordmark from the global asset folder (light vs white by mode).

```tsx
import { useSlidePageNumber } from '@open-slide/core';
import wordmark from '@assets/brand/databricks-logo-navy.svg'; // dark mode: databricks-logo-white.svg

const Footer = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute',
        left: 132,
        right: 132,
        bottom: 56,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: 'var(--osd-font-body)',
        fontSize: 22,
        fontWeight: 500,
        color: '#8A8580',
      }}
    >
      <img src={wordmark} alt="Databricks" style={{ height: 26 }} />
      <span>{current} / {total}</span>
    </div>
  );
};
```

## Brand assets

All 367 official brand SVGs live under the project's global `assets/brand/` — import via
the `@assets` alias (`import icon from '@assets/brand/genie-icon-full-color.svg'`). Read the
filename to pick the variant; never redraw a logo in inline SVG or CSS.

| You want…                    | Import path                                        |
| ---------------------------- | -------------------------------------------------- |
| Wordmark on light            | `@assets/brand/databricks-logo-navy.svg`           |
| Wordmark on dark             | `@assets/brand/databricks-logo-white.svg`          |
| Wordmark full-color          | `@assets/brand/databricks-logo-full-color.svg`     |
| Spark symbol (light)         | `@assets/brand/databricks-symbol-navy.svg`         |
| Spark symbol (dark)          | `@assets/brand/databricks-symbol-white.svg`        |
| Genie / AI-BI / Lakeflow…    | `@assets/brand/<product>-icon-full-color.svg`      |
| Product lockup               | `@assets/brand/<product>-lockup-full-color.svg` (`-white` on dark) |
| Nodal illustration (motif)   | `@assets/brand/illustration-nodal-0N.svg`          |

Rules: preserve the `#FF3621` Spark fill always. Never recolor, rotate, skew, stretch, or
drop-shadow a logo. Always `alt="Databricks"` (or the product name for product icons).

## Motion

- Philosophy: **subtle**. Content is the point; motion never performs.
- Only animate `transform` and `opacity`. Exponential easing. Respect `prefers-reduced-motion`.

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

## Aesthetic

Editorial-plain. Confident, declarative, unadorned — headers are labels, not taglines.
Warm Oat backgrounds with Navy text and Lava used like a highlighter: sparingly, on the one
thing that matters. Sentence case for every headline (never Title Case). Address the reader
as "you." No emoji. The dotted "nodal" illustration is the only decorative motif.

**Bans (each is an instant rewrite):**
- Lava above ~10% of the viewport — CTAs, bars, dots, underlines, icons all count. Pull back.
- `border-left` / `border-right` > 1px as a card/callout accent (the #1 AI tell). Use a full hairline, a background tint, or a leading number instead.
- Gradient text (`background-clip: text`). Solid colors only; emphasize with weight or size.
- Any font that isn't DM Sans / DM Mono.
- Purple→blue gradients, glassmorphism, glowing dark-mode accents, bounce easing, decorative sparklines. The full AI-slop inventory — always reject.
- Title Case headlines, superlatives, slide-deck framing ("Unlock the power of…").

The test: a stranger should recognize this as Databricks-made **without a logo**. If it could
be any SaaS deck, reshape the palette, type, and voice until it's unmistakable.

## Example usage

```tsx
const Cover: Page = () => (
  <div style={{ width: '100%', height: '100%', background: 'var(--osd-bg)', color: 'var(--osd-text)', padding: '0 132px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 32 }}>
    <Eyebrow>Q3 portfolio review</Eyebrow>
    <Title>Consumption is compounding</Title>
    <AccentBar />
    <p style={{ fontSize: 32, color: '#5A5755', maxWidth: 1200, lineHeight: 1.5 }}>
      A short subtitle in sentence case that says what this deck is about.
    </p>
    <Footer />
  </div>
);
```
