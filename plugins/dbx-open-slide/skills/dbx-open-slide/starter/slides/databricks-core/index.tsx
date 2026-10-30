import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';

import wordmarkNavy from '@assets/brand/databricks-logo-navy.svg';
import wordmarkWhite from '@assets/brand/databricks-logo-white.svg';

// ─── Webfont Loading ─────────────────────────────────────────────────────────
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=DM+Mono:wght@400;500&display=swap';
const FONT_LINK_ID = 'osd-webfont-databricks-core';
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

// ─── Design System (Databricks Light) ────────────────────────────────────────
export const design: DesignSystem = {
  palette: {
    bg: '#F9F7F4',
    text: '#1B3139',
    accent: '#FF3621',
  },
  fonts: {
    display: "'DM Sans', system-ui, -apple-system, sans-serif",
    body: "'DM Sans', system-ui, -apple-system, sans-serif",
  },
  typeScale: {
    hero: 132,
    body: 32,
  },
  radius: 16,
};

// ─── Local Constants ─────────────────────────────────────────────────────────
const palette = {
  bg: design.palette.bg,
  text: design.palette.text,
  accent: design.palette.accent,
  muted: '#5A5755',
  faint: '#8A8580',
  surface: '#FFFFFF',
  line: '#E4E2DD',
  darkBg: '#0B2026',
  darkText: '#F9F7F4',
  darkMuted: '#B9C6CB',
};

const font = {
  display: design.fonts.display,
  body: design.fonts.body,
  mono: "'DM Mono', monospace",
};

const fill = {
  width: '100%',
  height: '100%',
  background: 'var(--osd-bg)',
  color: 'var(--osd-text)',
  fontFamily: 'var(--osd-font-body)',
  overflow: 'hidden',
  position: 'relative' as const,
};

// ─── Page 1: Cover ──────────────────────────────────────────────────────────
const Cover = () => (
  <div style={fill}>
    {/* Accent bar: top-right corner */}
    <div
      style={{
        position: 'absolute',
        top: 108,
        right: 132,
        width: 96,
        height: 9,
        backgroundColor: palette.accent,
        borderRadius: 4,
      }}
    />

    {/* Center content */}
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        paddingTop: -108,
        paddingBottom: 108,
        textAlign: 'center',
      }}
    >
      {/* Eyebrow */}
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '.16em',
          textTransform: 'uppercase',
          color: palette.muted,
          marginBottom: 24,
        }}
      >
        Portfolio Review
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: 132,
          fontWeight: 700,
          lineHeight: 1.2,
          margin: 0,
          marginBottom: 32,
          color: 'var(--osd-text)',
          fontFamily: font.display,
          maxWidth: 900,
        }}
      >
        Account strategy and execution
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: 32,
          fontWeight: 400,
          lineHeight: 1.4,
          margin: 0,
          color: palette.faint,
          fontFamily: font.body,
          maxWidth: 800,
        }}
      >
        Building on Lakehouse momentum across seven accounts
      </p>
    </div>

    {/* Vertical budget: eyebrow 22px + gap 24 + title (132×1.2 = ~158px) + gap 32 + subtitle (32×1.4 = ~45px) = 22+24+158+32+45 = 281px ✓ */}
  </div>
);

// ─── Page 2: Section Divider ────────────────────────────────────────────────
const Section = () => (
  <div style={fill}>
    {/* Accent bar: bottom-left */}
    <div
      style={{
        position: 'absolute',
        bottom: 108,
        left: 132,
        width: 96,
        height: 9,
        backgroundColor: palette.accent,
        borderRadius: 4,
      }}
    />

    {/* Centered section heading */}
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          fontSize: 108,
          fontWeight: 700,
          lineHeight: 1.1,
          margin: 0,
          marginBottom: 32,
          color: 'var(--osd-text)',
          fontFamily: font.display,
        }}
      >
        Key use cases
      </h2>

      <p
        style={{
          fontSize: 32,
          fontWeight: 400,
          lineHeight: 1.4,
          margin: 0,
          color: palette.faint,
          fontFamily: font.body,
        }}
      >
        Where we're driving value
      </p>
    </div>

    {/* Vertical budget: section 108px + gap 32 + kicker 32px = 172px ✓ */}
  </div>
);

// ─── Page 3: Content (4 bullets) ────────────────────────────────────────────
const Content = () => (
  <div style={fill}>
    {/* Accent bar: top-left */}
    <div
      style={{
        position: 'absolute',
        top: 108,
        left: 132,
        width: 96,
        height: 9,
        backgroundColor: palette.accent,
        borderRadius: 4,
      }}
    />

    {/* Page content */}
    <div
      style={{
        paddingTop: 108,
        paddingBottom: 108,
        paddingLeft: 132,
        paddingRight: 132,
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Page heading */}
      <h2
        style={{
          fontSize: 84,
          fontWeight: 700,
          lineHeight: 1.1,
          margin: 0,
          marginBottom: 48,
          color: 'var(--osd-text)',
          fontFamily: font.display,
        }}
      >
        Active initiatives
      </h2>

      {/* Bullets container */}
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
          flex: 1,
        }}
      >
        {/* Bullet 1 */}
        <li
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 24,
            fontSize: 32,
            fontWeight: 400,
            lineHeight: 1.2,
            color: 'var(--osd-text)',
            fontFamily: font.body,
          }}
        >
          <div
            style={{
              width: 13,
              height: 13,
              minWidth: 13,
              backgroundColor: palette.accent,
              borderRadius: 3,
              marginTop: 6,
            }}
          />
          <span>Data consolidation from legacy systems to Lakehouse</span>
        </li>

        {/* Bullet 2 */}
        <li
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 24,
            fontSize: 32,
            fontWeight: 400,
            lineHeight: 1.2,
            color: 'var(--osd-text)',
            fontFamily: font.body,
          }}
        >
          <div
            style={{
              width: 13,
              height: 13,
              minWidth: 13,
              backgroundColor: palette.accent,
              borderRadius: 3,
              marginTop: 6,
            }}
          />
          <span>AI/BI dashboards for operational metrics and insights</span>
        </li>

        {/* Bullet 3 */}
        <li
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 24,
            fontSize: 32,
            fontWeight: 400,
            lineHeight: 1.2,
            color: 'var(--osd-text)',
            fontFamily: font.body,
          }}
        >
          <div
            style={{
              width: 13,
              height: 13,
              minWidth: 13,
              backgroundColor: palette.accent,
              borderRadius: 3,
              marginTop: 6,
            }}
          />
          <span>Real-time analytics for guest sentiment and preferences</span>
        </li>

        {/* Bullet 4 */}
        <li
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 24,
            fontSize: 32,
            fontWeight: 400,
            lineHeight: 1.2,
            color: 'var(--osd-text)',
            fontFamily: font.body,
          }}
        >
          <div
            style={{
              width: 13,
              height: 13,
              minWidth: 13,
              backgroundColor: palette.accent,
              borderRadius: 3,
              marginTop: 6,
            }}
          />
          <span>ML pipelines for supply chain optimization</span>
        </li>
      </ul>
    </div>

    {/* Vertical budget: heading 84px + gap 48 + 4×(32×1.2=38px) + 3×(28gap) = 84+48+152+84 = 368px ✓ */}
  </div>
);

// ─── Page 4: Two-Column ────────────────────────────────────────────────────
const TwoColumn = () => (
  <div style={fill}>
    {/* Accent bar: right edge */}
    <div
      style={{
        position: 'absolute',
        top: 108,
        right: 132,
        width: 96,
        height: 9,
        backgroundColor: palette.accent,
        borderRadius: 4,
      }}
    />

    {/* Page content */}
    <div
      style={{
        paddingTop: 108,
        paddingBottom: 108,
        paddingLeft: 132,
        paddingRight: 132,
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Page heading */}
      <h2
        style={{
          fontSize: 84,
          fontWeight: 700,
          lineHeight: 1.1,
          margin: 0,
          marginBottom: 48,
          color: 'var(--osd-text)',
          fontFamily: font.display,
        }}
      >
        Engagement model
      </h2>

      {/* Two-column container */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 64,
          flex: 1,
        }}
      >
        {/* Left Column: Paragraph */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
          }}
        >
          <p
            style={{
              fontSize: 32,
              fontWeight: 400,
              lineHeight: 1.5,
              margin: 0,
              color: 'var(--osd-text)',
              fontFamily: font.body,
            }}
          >
            We're working closely with platform and analytics teams to design scalable data pipelines. Quarterly strategy calls with C-suite stakeholders align technical roadmap with business objectives.
          </p>
        </div>

        {/* Right Column: Stats and bullets */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 32,
          }}
        >
          {/* Stat 1 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: palette.accent,
                fontFamily: font.display,
              }}
            >
              12.3M
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 400,
                color: palette.faint,
                fontFamily: font.body,
              }}
            >
              Daily events ingested
            </div>
          </div>

          {/* Stat 2 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: palette.accent,
                fontFamily: font.display,
              }}
            >
              3.2TB
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 400,
                color: palette.faint,
                fontFamily: font.body,
              }}
            >
              Monthly data growth
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Vertical budget: heading 84 + gap 48 + left paragraph (32×1.5×2=96) + right stats (96px total) = 328px ✓ */}
  </div>
);

// ─── Page 5: Closing (Dark) ────────────────────────────────────────────────
const Closing = () => (
  <div
    style={{
      ...fill,
      background: palette.darkBg,
      color: palette.darkText,
    }}
  >
    {/* Accent bar: bottom-right */}
    <div
      style={{
        position: 'absolute',
        bottom: 108,
        right: 132,
        width: 96,
        height: 9,
        backgroundColor: palette.accent,
        borderRadius: 4,
      }}
    />

    {/* Centered closing content */}
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        textAlign: 'center',
        gap: 32,
      }}
    >
      {/* Thank you */}
      <h1
        style={{
          fontSize: 132,
          fontWeight: 700,
          lineHeight: 1.2,
          margin: 0,
          color: palette.darkText,
          fontFamily: font.display,
        }}
      >
        Thank you
      </h1>

      {/* Contact line */}
      <p
        style={{
          fontSize: 32,
          fontWeight: 400,
          lineHeight: 1.4,
          margin: 0,
          color: palette.darkMuted,
          fontFamily: font.body,
        }}
      >
        Next steps: quarterly business review in October
      </p>

      {/* Wordmark */}
      <div style={{ marginTop: 48 }}>
        <img
          src={wordmarkWhite}
          alt="Databricks"
          style={{
            height: 32,
            width: 'auto',
          }}
        />
      </div>
    </div>

    {/* Vertical budget: title 132 + gap 32 + contact 32×1.4=45 + gap 32 + logo container 32+48 = 321px ✓ */}
  </div>
);

// ─── Metadata and Exports ───────────────────────────────────────────────────
export const meta: SlideMeta = {
  title: 'Databricks — core layouts',
  createdAt: '2026-08-18T21:53:03.050Z',
  theme: 'databricks',
};

export default [Cover, Section, Content, TwoColumn, Closing] satisfies Page[];
