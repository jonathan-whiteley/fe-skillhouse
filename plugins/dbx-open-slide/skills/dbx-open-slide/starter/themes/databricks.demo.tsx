import { type Page, type DesignSystem, useSlidePageNumber } from '@open-slide/core';

// Preview-only demo for the Themes panel. Self-contained: inlines the same
// Title / Eyebrow / AccentBar / Footer defined in themes/databricks.md.
// Webfont via @import in an inline <style> is allowed in demo files only.

export const design: DesignSystem = {
  palette: { bg: '#F9F7F4', text: '#1B3139', accent: '#FF3621' },
  fonts: {
    display: "'DM Sans', system-ui, -apple-system, sans-serif",
    body: "'DM Sans', system-ui, -apple-system, sans-serif",
  },
  typeScale: { hero: 132, body: 32 },
  radius: 16,
};

const muted = '#5A5755';
const faint = '#8A8580';

const Fonts = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=DM+Mono:wght@400;500&display=swap');`}</style>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontFamily: 'var(--osd-font-body)', fontSize: 22, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--osd-accent)' }}>
    {children}
  </div>
);

const Title = ({ children }: { children: React.ReactNode }) => (
  <h1 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 132, fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.02em', margin: 0, color: 'var(--osd-text)' }}>
    {children}
  </h1>
);

const AccentBar = () => (
  <div style={{ width: 96, height: 9, borderRadius: 4, background: 'var(--osd-accent)' }} />
);

const Footer = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ position: 'absolute', left: 132, right: 132, bottom: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--osd-font-body)', fontSize: 22, fontWeight: 500, color: faint }}>
      <span style={{ fontWeight: 700, color: 'var(--osd-text)', letterSpacing: '-0.01em' }}>Databricks</span>
      <span>{current} / {total}</span>
    </div>
  );
};

const fill = { width: '100%', height: '100%', fontFamily: 'var(--osd-font-body)' } as const;

const Cover: Page = () => (
  <div style={{ ...fill, background: 'var(--osd-bg)', color: 'var(--osd-text)', padding: '0 132px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 32, position: 'relative' }}>
    <Fonts />
    <Eyebrow>Databricks theme</Eyebrow>
    <Title>Editorial-plain, on brand</Title>
    <AccentBar />
    <p style={{ fontSize: 32, color: muted, maxWidth: 1200, lineHeight: 1.5, margin: 0 }}>
      Oat surface, Navy text, Lava as a strict ten-percent accent. DM Sans throughout.
    </p>
    <Footer />
  </div>
);

const Content: Page = () => (
  <div style={{ ...fill, background: 'var(--osd-bg)', color: 'var(--osd-text)', padding: '108px 132px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
    <Fonts />
    <Eyebrow>How it holds together</Eyebrow>
    <h2 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 84, fontWeight: 700, letterSpacing: '-0.02em', margin: '24px 0 56px' }}>
      One accent, used sparingly
    </h2>
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 32 }}>
      {['Left-aligned, editorial rhythm', 'Square Lava ticks, never round dots or side stripes', 'Sentence case headlines, no superlatives', 'DM Mono for tabular numbers and code'].map((t) => (
        <li key={t} style={{ position: 'relative', paddingLeft: 40, fontSize: 32, lineHeight: 1.45 }}>
          <span style={{ position: 'absolute', left: 0, top: 14, width: 13, height: 13, borderRadius: 3, background: 'var(--osd-accent)' }} />
          {t}
        </li>
      ))}
    </ul>
    <Footer />
  </div>
);

const Closer: Page = () => (
  <div style={{ ...fill, background: '#0B2026', color: '#F9F7F4', padding: '0 132px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28, position: 'relative' }}>
    <Fonts />
    <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#FF3621' }}>Dark mode</div>
    <h1 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 116, fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.02em', margin: 0 }}>
      Same system, deep ink
    </h1>
    <div style={{ width: 96, height: 9, borderRadius: 4, background: '#FF3621' }} />
    <p style={{ fontSize: 32, color: '#B9C6CB', maxWidth: 1100, lineHeight: 1.5, margin: 0 }}>
      Navy 900 surface for exec events and dark rooms. Lava stays the one accent.
    </p>
  </div>
);

export default [Cover, Content, Closer];
