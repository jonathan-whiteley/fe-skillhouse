import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import { useSlidePageNumber } from '@open-slide/core';
import wordmark from '@assets/brand/databricks-logo-white.svg';
import genieIcon from '@assets/brand/genie-icon-full-color.svg';
import lakebaseIcon from '@assets/brand/lakebase-icon-full-color.svg';

// ─── Webfont: DM Sans + DM Mono, injected once, keyed to this slide id ────────
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=DM+Mono:wght@400;500&display=swap';
const FONT_LINK_ID = 'osd-webfont-hello-world-dark';
// Create-or-update (not create-if-missing) so HMR picks up edits; see slide-authoring references/webfonts.md.
if (typeof document !== 'undefined') {
  let link = document.getElementById(FONT_LINK_ID) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = FONT_LINK_ID;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  if (link.href !== FONT_HREF) link.href = FONT_HREF;
}

// ─── Panel-tweakable design tokens (dark mode) ────────────────────────────────
export const design: DesignSystem = {
  palette: { bg: '#0B2026', text: '#F9F7F4', accent: '#FF3621' },
  fonts: {
    display: "'DM Sans', system-ui, -apple-system, sans-serif",
    body: "'DM Sans', system-ui, -apple-system, sans-serif",
  },
  typeScale: { hero: 132, body: 32 },
  radius: 16,
};

// ─── Extra colors outside the DesignSystem shape ──────────────────────────────
const muted = '#B9C6CB';
const faint = '#7E9098';
const surface = '#143D4A';
const line = '#2E4A54';

const fill = {
  width: '100%',
  height: '100%',
  fontFamily: 'var(--osd-font-body)',
  position: 'relative',
} as const;

// ─── Fixed components (from themes/databricks.md, dark variant) ───────────────
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

const AccentBar = () => (
  <div style={{ width: 96, height: 9, borderRadius: 4, background: 'var(--osd-accent)' }} />
);

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
        color: faint,
      }}
    >
      <img src={wordmark} alt="Databricks" style={{ height: 26 }} />
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {current} / {total}
      </span>
    </div>
  );
};

// ─── Page 1 — Title ───────────────────────────────────────────────────────────
// Budget: eyebrow 22 + gap 32 + hero 132×1.04 + gap 24 + bar 9 + gap 32 + sub 48 ≈ 337px < 864 ✓
const Title: Page = () => (
  <div
    style={{
      ...fill,
      background: 'var(--osd-bg)',
      color: 'var(--osd-text)',
      padding: '0 132px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 32,
    }}
  >
    <Eyebrow>Hello, world</Eyebrow>
    <h1
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 132,
        fontWeight: 700,
        lineHeight: 1.04,
        letterSpacing: '-0.02em',
        margin: 0,
      }}
    >
      Genie and Lakebase
    </h1>
    <AccentBar />
    <p style={{ fontSize: 32, color: muted, maxWidth: 1200, lineHeight: 1.5, margin: 0 }}>
      A two-minute look at natural-language analytics and the operational database
      built into the lakehouse.
    </p>
    <Footer />
  </div>
);

// ─── Content-page building blocks ─────────────────────────────────────────────
const Point = ({ children }: { children: React.ReactNode }) => (
  <li style={{ position: 'relative', paddingLeft: 40, fontSize: 32, lineHeight: 1.45, color: 'var(--osd-text)' }}>
    <span
      style={{
        position: 'absolute',
        left: 0,
        top: 14,
        width: 13,
        height: 13,
        borderRadius: 3,
        background: 'var(--osd-accent)',
      }}
    />
    {children}
  </li>
);

const ProductHeader = ({ icon, alt, product }: { icon: string; alt: string; product: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
    <div
      style={{
        width: 96,
        height: 96,
        borderRadius: 16,
        background: surface,
        border: `1px solid ${line}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img src={icon} alt={alt} style={{ width: 56, height: 56 }} />
    </div>
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 84,
        fontWeight: 700,
        letterSpacing: '-0.02em',
        margin: 0,
      }}
    >
      {product}
    </h2>
  </div>
);

// ─── Page 2 — Genie ─────────────────────────────────────────────────────────
// Budget: eyebrow 22 + gap 24 + header 96 + gap 56 + 4 points (4×46 + 3×32) ≈ 478px < 864 ✓
const Genie: Page = () => (
  <div
    style={{
      ...fill,
      background: 'var(--osd-bg)',
      color: 'var(--osd-text)',
      padding: '108px 132px',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <Eyebrow>Ask your data</Eyebrow>
    <div style={{ height: 24 }} />
    <ProductHeader icon={genieIcon} alt="Databricks Genie" product="Genie" />
    <ul style={{ listStyle: 'none', margin: '56px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 32 }}>
      <Point>Ask questions in plain language, get governed SQL back</Point>
      <Point>Grounded in Unity Catalog: it respects your permissions</Point>
      <Point>Learns from certified queries and instructions you supply</Point>
      <Point>Embeds in dashboards, apps, and Slack for self-serve answers</Point>
    </ul>
    <Footer />
  </div>
);

// ─── Page 3 — Lakebase ────────────────────────────────────────────────────────
// Budget: identical structure to Genie ≈ 478px < 864 ✓
const Lakebase: Page = () => (
  <div
    style={{
      ...fill,
      background: 'var(--osd-bg)',
      color: 'var(--osd-text)',
      padding: '108px 132px',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <Eyebrow>Operational Postgres</Eyebrow>
    <div style={{ height: 24 }} />
    <ProductHeader icon={lakebaseIcon} alt="Databricks Lakebase" product="Lakebase" />
    <ul style={{ listStyle: 'none', margin: '56px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 32 }}>
      <Point>A managed Postgres database, native to the lakehouse</Point>
      <Point>Serverless: separate compute and storage, scales to zero</Point>
      <Point>Syncs with Unity Catalog tables, no bespoke pipelines</Point>
      <Point>Serves low-latency reads and writes for apps and agents</Point>
    </ul>
    <Footer />
  </div>
);

export const meta: SlideMeta = {
  title: 'Hello world — Genie and Lakebase',
  createdAt: '2026-08-19T15:54:20.938Z',
  theme: 'databricks',
};
export default [Title, Genie, Lakebase] satisfies Page[];
