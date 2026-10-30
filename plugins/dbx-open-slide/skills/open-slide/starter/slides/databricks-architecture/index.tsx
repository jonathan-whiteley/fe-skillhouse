import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import { useSlidePageNumber } from '@open-slide/core';

// Webfont loading
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=DM+Mono:wght@400;500&display=swap';
const FONT_LINK_ID = 'osd-webfont-databricks-architecture';
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

export const design: DesignSystem = {
  palette: { bg: '#F9F7F4', text: '#1B3139', accent: '#FF3621' },
  fonts: {
    display: "'DM Sans', system-ui, -apple-system, sans-serif",
    body: "'DM Sans', system-ui, -apple-system, sans-serif",
  },
  typeScale: { hero: 132, body: 32 },
  radius: 16,
};

export const meta: SlideMeta = {
  title: 'Databricks — architecture layouts',
  createdAt: '2026-08-18T21:53:03.050Z',
  theme: 'databricks',
};

// Color tokens
const colors = {
  bg: 'var(--osd-bg, #F9F7F4)',
  text: 'var(--osd-text, #1B3139)',
  accent: 'var(--osd-accent, #FF3621)',
  muted: '#5A5755',
  faint: '#8A8580',
  surface: '#FFFFFF',
  line: '#E4E2DD',
  bgSubtle: '#EEEDE9',
  bronze: '#C08457',
  silver: '#8A9BA8',
  gold: '#C9A227',
  navy: '#1B3139',
};

// Footer component
const Footer: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div style={{ position: 'absolute', bottom: 24, right: 40, fontSize: 14, color: colors.muted, fontFamily: colors.fontDisplay }}>
    {current} / {total}
  </div>
);

// ============================================================================
// PAGE 1: MEDALLION ARCHITECTURE
// ============================================================================

const MedalionStage: React.FC<{
  label: string;
  role: string;
  items: string[];
  fill: string;
  x: number;
}> = ({ label, role, items, fill, x }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: 200,
      width: 240,
      backgroundColor: fill,
      borderRadius: 16,
      padding: 28,
      boxShadow: '0 3px 9px rgba(27,49,57,0.08)',
      fontFamily: "'DM Sans', sans-serif",
    }}
  >
    <div
      style={{
        fontSize: 32,
        fontWeight: 700,
        color: colors.navy,
        marginBottom: 8,
        letterSpacing: '-0.5px',
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: 18,
        color: colors.muted,
        marginBottom: 20,
        fontWeight: 400,
        lineHeight: '1.3',
      }}
    >
      {role}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            fontSize: 16,
            color: colors.navy,
            paddingLeft: 12,
            borderLeft: `3px solid ${colors.navy}`,
            opacity: 0.85,
          }}
        >
          {item}
        </div>
      ))}
    </div>
  </div>
);

const ArrowChevron: React.FC<{ x: number }> = ({ x }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: 320,
      width: 28,
      height: 28,
      color: colors.navy,
      fontSize: 28,
      fontWeight: 300,
      opacity: 0.7,
    }}
  >
    →
  </div>
);

const Medallion: Page = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: colors.bg, position: 'relative', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden' }}>
      {/* Page heading */}
      <div style={{ position: 'absolute', top: 60, left: 100, fontSize: 84, fontWeight: 700, color: colors.navy, letterSpacing: '-1px' }}>
        Medallion architecture
      </div>

      {/* Source node */}
      <div
        style={{
          position: 'absolute',
          left: 100,
          top: 200,
          width: 120,
          backgroundColor: colors.bgSubtle,
          borderRadius: 12,
          padding: 16,
          textAlign: 'center',
          fontSize: 18,
          fontWeight: 600,
          color: colors.navy,
          boxShadow: '0 2px 6px rgba(27,49,57,0.06)',
        }}
      >
        Data sources
      </div>

      {/* Bronze stage */}
      <MedalionStage
        label="Bronze"
        role="Raw ingest"
        items={['API feeds', 'Database exports', 'Log files']}
        fill={colors.bgSubtle}
        x={260}
      />

      {/* Arrow 1 */}
      <ArrowChevron x={520} />

      {/* Silver stage */}
      <MedalionStage
        label="Silver"
        role="Cleaned & conformed"
        items={['Deduplicated', 'Validated', 'Standardized']}
        fill={colors.surface}
        x={580}
      />

      {/* Arrow 2 */}
      <ArrowChevron x={840} />

      {/* Gold stage - with Lava accent */}
      <div
        style={{
          position: 'absolute',
          left: 900,
          top: 200,
          width: 240,
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 28,
          boxShadow: '0 3px 9px rgba(27,49,57,0.08)',
          borderTop: `4px solid ${colors.accent}`,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: colors.accent,
            marginBottom: 8,
            letterSpacing: '-0.5px',
          }}
        >
          Gold
        </div>
        <div
          style={{
            fontSize: 18,
            color: colors.muted,
            marginBottom: 20,
            fontWeight: 400,
            lineHeight: '1.3',
          }}
        >
          Business-ready aggregates
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 16, color: colors.navy, paddingLeft: 12, borderLeft: `3px solid ${colors.navy}`, opacity: 0.85 }}>
            Metrics & KPIs
          </div>
          <div style={{ fontSize: 16, color: colors.navy, paddingLeft: 12, borderLeft: `3px solid ${colors.navy}`, opacity: 0.85 }}>
            Dimensional models
          </div>
          <div style={{ fontSize: 16, color: colors.navy, paddingLeft: 12, borderLeft: `3px solid ${colors.navy}`, opacity: 0.85 }}>
            Business datasets
          </div>
        </div>
      </div>

      {/* Consumers node */}
      <div
        style={{
          position: 'absolute',
          right: 100,
          top: 200,
          width: 140,
          backgroundColor: colors.bgSubtle,
          borderRadius: 12,
          padding: 16,
          textAlign: 'center',
          fontSize: 18,
          fontWeight: 600,
          color: colors.navy,
          boxShadow: '0 2px 6px rgba(27,49,57,0.06)',
        }}
      >
        BI & analytics
      </div>

      {/* Description */}
      <div
        style={{
          position: 'absolute',
          bottom: 140,
          left: 100,
          right: 100,
          fontSize: 22,
          color: colors.muted,
          lineHeight: '1.6',
          fontWeight: 400,
        }}
      >
        The medallion architecture organizes data into three layers of progressively refined quality. Data flows from raw sources through cleaning and validation to curated datasets ready for analytics and reporting.
      </div>

      <Footer current={current} total={total} />
    </div>
  );
};

// ============================================================================
// PAGE 2: LAKEHOUSE BLUEPRINT
// ============================================================================

const LakehouseLayer: React.FC<{
  label: string;
  description: string;
  items: string[];
  y: number;
  bgColor: string;
  icon?: React.ReactNode;
}> = ({ label, description, items, y, bgColor, icon }) => (
  <div
    style={{
      position: 'absolute',
      left: 100,
      top: y,
      right: 100,
      backgroundColor: bgColor,
      borderRadius: 12,
      padding: 28,
      boxShadow: '0 2px 8px rgba(27,49,57,0.06)',
      fontFamily: "'DM Sans', sans-serif",
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
      {icon && <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>}
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color: colors.navy, marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ fontSize: 18, color: colors.muted, fontWeight: 400 }}>
          {description}
        </div>
      </div>
    </div>
    <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
      {items.map((item, i) => (
        <div key={i} style={{ fontSize: 16, color: colors.navy, opacity: 0.85 }}>
          • {item}
        </div>
      ))}
    </div>
  </div>
);

const GovernanceBand: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: 100,
      top: 390,
      right: 100,
      height: 80,
      backgroundColor: colors.surface,
      borderRadius: 12,
      border: `2px solid ${colors.line}`,
      display: 'flex',
      alignItems: 'center',
      gap: 32,
      paddingLeft: 28,
      paddingRight: 28,
      fontFamily: "'DM Sans', sans-serif",
      boxShadow: '0 2px 6px rgba(27,49,57,0.05)',
    }}
  >
    <div style={{ fontSize: 24, fontWeight: 700, color: colors.navy }}>
      Unity Catalog
    </div>
    <div style={{ fontSize: 16, color: colors.muted, opacity: 0.8 }}>
      Unified governance • Data lineage • Access control • Audit
    </div>
  </div>
);

const WorkloadTile: React.FC<{ label: string; icon?: React.ReactNode; x: number }> = ({ label, icon, x }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: 520,
      width: 140,
      backgroundColor: colors.bgSubtle,
      borderRadius: 12,
      padding: 20,
      textAlign: 'center',
      boxShadow: '0 2px 6px rgba(27,49,57,0.06)',
      fontFamily: "'DM Sans', sans-serif",
    }}
  >
    {icon && (
      <div
        style={{
          width: 48,
          height: 48,
          margin: '0 auto 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
    )}
    <div style={{ fontSize: 16, fontWeight: 600, color: colors.navy }}>
      {label}
    </div>
  </div>
);

const LakehouseBlueprint: Page = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: colors.bg, position: 'relative', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden' }}>
      {/* Page heading */}
      <div style={{ position: 'absolute', top: 60, left: 100, fontSize: 84, fontWeight: 700, color: colors.navy, letterSpacing: '-1px' }}>
        Lakehouse blueprint
      </div>

      {/* Data Sources Layer */}
      <LakehouseLayer
        label="Data sources & cloud storage"
        description="Raw data from any source"
        items={['APIs', 'Databases', 'Cloud storage', 'Streaming feeds', 'Data lakes']}
        y={180}
        bgColor={colors.bgSubtle}
      />

      {/* Delta Lake + Unity Catalog Layer (governance band) */}
      <GovernanceBand />

      {/* Workloads Layer */}
      <div
        style={{
          position: 'absolute',
          left: 100,
          top: 500,
          right: 100,
          fontSize: 18,
          fontWeight: 600,
          color: colors.muted,
          marginBottom: 12,
        }}
      >
        Workloads powered by lakehouse
      </div>

      {/* Workload tiles */}
      <WorkloadTile label="BI & dashboards" x={120} />
      <WorkloadTile label="AI/ML" x={300} />
      <WorkloadTile label="Streaming" x={480} />
      <WorkloadTile label="Apps" x={660} />
      <WorkloadTile label="SQL" x={840} />

      {/* Description */}
      <div
        style={{
          position: 'absolute',
          bottom: 120,
          left: 100,
          right: 100,
          fontSize: 22,
          color: colors.muted,
          lineHeight: '1.6',
          fontWeight: 400,
        }}
      >
        The lakehouse unifies data lake scalability with data warehouse reliability. Delta Lake provides ACID transactions and schema enforcement. Unity Catalog delivers governance across all workloads, enabling secure analytics at scale.
      </div>

      <Footer current={current} total={total} />
    </div>
  );
};

// ============================================================================
// PAGE 3: REFERENCE ARCHITECTURE
// ============================================================================

const FlowBox: React.FC<{
  label: string;
  description: string;
  x: number;
  bgColor?: string;
  icon?: React.ReactNode;
}> = ({ label, description, x, bgColor = colors.bgSubtle, icon }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: 240,
      width: 180,
      backgroundColor: bgColor,
      borderRadius: 12,
      padding: 24,
      boxShadow: '0 2px 8px rgba(27,49,57,0.06)',
      fontFamily: "'DM Sans', sans-serif",
      textAlign: 'center',
    }}
  >
    {icon && (
      <div
        style={{
          width: 52,
          height: 52,
          margin: '0 auto 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
    )}
    <div style={{ fontSize: 20, fontWeight: 700, color: colors.navy, marginBottom: 8 }}>
      {label}
    </div>
    <div style={{ fontSize: 14, color: colors.muted, lineHeight: '1.4', fontWeight: 400 }}>
      {description}
    </div>
  </div>
);

const FlowArrow: React.FC<{ x: number }> = ({ x }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: 290,
      width: 32,
      height: 2,
      backgroundColor: colors.navy,
      opacity: 0.5,
    }}
  >
    <div
      style={{
        position: 'absolute',
        right: -8,
        top: -4,
        width: 0,
        height: 0,
        borderLeft: '8px solid ' + colors.navy,
        borderTop: '5px solid transparent',
        borderBottom: '5px solid transparent',
        opacity: 0.5,
      }}
    />
  </div>
);

const ServeBox: React.FC<{
  label: string;
  x: number;
  icon?: React.ReactNode;
}> = ({ label, x, icon }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: 500,
      width: 160,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(27,49,57,0.06)',
      fontFamily: "'DM Sans', sans-serif",
      border: `2px solid ${colors.line}`,
    }}
  >
    {icon && (
      <div
        style={{
          width: 44,
          height: 44,
          margin: '0 auto 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
    )}
    <div style={{ fontSize: 16, fontWeight: 600, color: colors.navy }}>
      {label}
    </div>
  </div>
);

const ReferenceArchitecture: Page = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: colors.bg, position: 'relative', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden' }}>
      {/* Page heading */}
      <div style={{ position: 'absolute', top: 60, left: 100, fontSize: 84, fontWeight: 700, color: colors.navy, letterSpacing: '-1px' }}>
        Reference architecture
      </div>

      {/* Main flow boxes */}
      <FlowBox
        label="Sources"
        description="Data from any system"
        x={120}
        bgColor={colors.bgSubtle}
      />

      <FlowArrow x={320} />

      <FlowBox
        label="Ingest"
        description="Lakeflow Connect"
        x={360}
        bgColor={colors.bgSubtle}
      />

      <FlowArrow x={560} />

      <FlowBox
        label="Lakehouse"
        description="Delta Lake + Unity Catalog"
        x={600}
        bgColor={colors.surface}
      />

      <FlowArrow x={800} />

      <FlowBox
        label="Compute"
        description="SQL & Python clusters"
        x={840}
        bgColor={colors.bgSubtle}
      />

      <FlowArrow x={1040} />

      <FlowBox
        label="Serve"
        description="Apps & endpoints"
        x={1080}
        bgColor={colors.surface}
      />

      {/* Serve layer heading */}
      <div
        style={{
          position: 'absolute',
          left: 100,
          top: 440,
          fontSize: 18,
          fontWeight: 600,
          color: colors.muted,
        }}
      >
        Serving options
      </div>

      {/* Serve boxes */}
      <ServeBox label="AI/BI dashboards" x={140} />
      <ServeBox label="Model serving" x={340} />
      <ServeBox label="Databricks Apps" x={540} />
      <ServeBox label="Delta Sharing" x={740} />

      {/* Background zones */}
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 410,
          width: 350,
          height: 220,
          backgroundColor: colors.bgSubtle,
          borderRadius: 8,
          opacity: 0.3,
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 600,
          top: 410,
          width: 600,
          height: 220,
          backgroundColor: colors.accent,
          borderRadius: 8,
          opacity: 0.08,
          zIndex: 0,
        }}
      />

      {/* Zone labels */}
      <div
        style={{
          position: 'absolute',
          left: 100,
          top: 630,
          fontSize: 16,
          fontWeight: 600,
          color: colors.muted,
          opacity: 0.7,
        }}
      >
        Ingestion & transformation
      </div>
      <div
        style={{
          position: 'absolute',
          right: 100,
          top: 630,
          fontSize: 16,
          fontWeight: 600,
          color: colors.navy,
          textAlign: 'right',
        }}
      >
        Consumption & delivery
      </div>

      {/* Description */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          left: 100,
          right: 100,
          fontSize: 22,
          color: colors.muted,
          lineHeight: '1.6',
          fontWeight: 400,
        }}
      >
        Data flows left-to-right: from diverse sources through cloud-native ingest into a unified lakehouse, then to compute and serving layers for analytics, ML, and applications.
      </div>

      <Footer current={current} total={total} />
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default [Medallion, LakehouseBlueprint, ReferenceArchitecture] satisfies Page[];
