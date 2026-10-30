import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import { useSlidePageNumber } from '@open-slide/core';

// ─── Webfont Loading ─────────────────────────────────────────────────────────
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=DM+Mono:wght@400;500&display=swap';
const FONT_LINK_ID = 'osd-webfont-databricks-data';
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

// ─── Design System ───────────────────────────────────────────────────────────
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

// ─── Color Palette ──────────────────────────────────────────────────────────
const palette = {
  bg: design.palette.bg,
  text: design.palette.text,
  accent: design.palette.accent,
  muted: '#5A5755',
  faint: '#8A8580',
  surface: '#FFFFFF',
  line: '#E4E2DD',
  navy: '#1B3139',
  lava: '#FF3621',
  slate: '#618794',
  green: '#00A972',
  amber: '#FFAB00',
  maroon: '#98102A',
};

const font = {
  display: design.fonts.display,
  body: design.fonts.body,
  mono: "'DM Mono', ui-monospace, Menlo, monospace",
};

const fill = {
  width: '100%' as const,
  height: '100%' as const,
  background: 'var(--osd-bg)',
  color: 'var(--osd-text)',
  fontFamily: 'var(--osd-font-body)',
  overflow: 'hidden' as const,
  position: 'relative' as const,
  display: 'flex' as const,
  flexDirection: 'column' as const,
};

// ─── KPI Card Component ──────────────────────────────────────────────────────
const Kpi = ({ label, value, delta, deltaPercent }: { label: string; value: string; delta: number; deltaPercent: string }) => {
  const isPositive = delta >= 0;
  return (
    <div
      style={{
        background: palette.surface,
        borderRadius: 12,
        border: `1px solid ${palette.line}`,
        boxShadow: '0 1px 3px rgba(27, 49, 57, 0.08)',
        padding: '24px',
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 400, color: palette.muted, marginBottom: 12 }}>
        {label}
      </div>
      <div style={{ fontSize: 72, fontWeight: 700, color: palette.navy, marginBottom: 16, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 14, color: isPositive ? palette.green : palette.maroon, fontWeight: 500 }}>
        {isPositive ? '↑' : '↓'} {deltaPercent}
      </div>
    </div>
  );
};

// ─── Hero Stat Component ─────────────────────────────────────────────────────
const HeroStat = ({ number, label, isLava = false }: { number: string; label: string; isLava?: boolean }) => (
  <div
    style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <div style={{ fontSize: 132, fontWeight: 700, color: isLava ? palette.lava : palette.navy, lineHeight: 1, marginBottom: 16 }}>
      {number}
    </div>
    <div style={{ fontSize: 18, color: palette.muted, fontWeight: 500, textAlign: 'center' }}>
      {label}
    </div>
  </div>
);

// ─── Bar Chart Component ─────────────────────────────────────────────────────
const BarChart = () => {
  const data = [
    { label: 'Northwind', value: 2400, isLava: true },
    { label: 'Fabrikam', value: 1800, isLava: false },
    { label: 'Contoso', value: 2100, isLava: false },
    { label: 'Tailspin', value: 1500, isLava: false },
  ];
  const maxValue = 2400;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      {/* Chart area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: 24, paddingBottom: 32 }}>
        {data.map((item) => (
          <div key={item.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
            <div
              style={{
                width: '100%',
                height: `${(item.value / maxValue) * 280}px`,
                backgroundColor: item.isLava ? palette.lava : palette.navy,
                borderRadius: '4px 4px 0 0',
              }}
            />
          </div>
        ))}
      </div>

      {/* X-axis labels */}
      <div style={{ display: 'flex', justifyContent: 'space-around', gap: 24, marginBottom: 16 }}>
        {data.map((item) => (
          <div key={item.label} style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 500, color: palette.text }}>
            {item.label}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, fontSize: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16, backgroundColor: palette.lava, borderRadius: 2 }} />
          <span style={{ color: palette.text }}>Highlighted</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16, backgroundColor: palette.navy, borderRadius: 2 }} />
          <span style={{ color: palette.text }}>Standard</span>
        </div>
      </div>
    </div>
  );
};

// ─── Data Table Component ────────────────────────────────────────────────────
const DataTable = () => (
  <div style={{ width: '100%', borderCollapse: 'collapse' as const }}>
    {/* Header Row */}
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        backgroundColor: palette.navy,
        color: palette.surface,
        fontWeight: 600,
        fontSize: 14,
        borderRadius: '8px 8px 0 0',
      }}
    >
      <div style={{ padding: '12px 16px', textAlign: 'left' }}>Account</div>
      <div style={{ padding: '12px 16px', textAlign: 'right' }}>DBU consumption</div>
      <div style={{ padding: '12px 16px', textAlign: 'right' }}>Monthly spend</div>
      <div style={{ padding: '12px 16px', textAlign: 'right' }}>WoW delta</div>
    </div>

    {/* Data Rows */}
    {[
      { account: 'Northwind Retail', dbu: '148,200', spend: '$39,500', delta: '+12.4%' },
      { account: 'Fabrikam', dbu: '92,400', spend: '$24,640', delta: '+3.1%' },
      { account: 'Contoso', dbu: '115,800', spend: '$30,880', delta: '+7.8%' },
      { account: 'Tailspin', dbu: '63,600', spend: '$16,960', delta: '+2.1%' },
      { account: 'Lakeview Dining', dbu: '81,200', spend: '$21,680', delta: '+5.5%' },
    ].map((row, idx) => (
      <div
        key={row.account}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          backgroundColor: idx % 2 === 0 ? palette.surface : '#F3F3F3',
          borderBottom: idx < 4 ? `1px solid ${palette.line}` : 'none',
          fontSize: 14,
        }}
      >
        <div style={{ padding: '12px 16px', textAlign: 'left', color: palette.text }}>
          {row.account}
        </div>
        <div style={{ padding: '12px 16px', textAlign: 'right', fontFamily: font.mono, fontVariantNumeric: 'tabular-nums', color: palette.text }}>
          {row.dbu}
        </div>
        <div style={{ padding: '12px 16px', textAlign: 'right', fontFamily: font.mono, fontVariantNumeric: 'tabular-nums', color: palette.text }}>
          {row.spend}
        </div>
        <div style={{ padding: '12px 16px', textAlign: 'right', fontFamily: font.mono, fontVariantNumeric: 'tabular-nums', color: palette.green, fontWeight: 500 }}>
          {row.delta}
        </div>
      </div>
    ))}
  </div>
);

// ─── Page Components ────────────────────────────────────────────────────────

// Page 1: KPI Dashboard
const KpiDashboard = () => (
  <div style={fill}>
    <div style={{ padding: '108px 132px', display: 'flex', flexDirection: 'column', gap: 64, flex: 1 }}>
      {/* Heading */}
      <div>
        <h1 style={{ fontSize: 48, fontWeight: 700, margin: 0, color: palette.text }}>
          Portfolio metrics
        </h1>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
        <Kpi label="Total DBU consumption" value="501K" delta={12} deltaPercent="+12.4% WoW" />
        <Kpi label="Monthly spend" value="$133.7K" delta={8} deltaPercent="+8.2% WoW" />
        <Kpi label="Avg DBU per account" value="71.6K" delta={-2} deltaPercent="-2.1% WoW" />
        <Kpi label="Accounts active" value="7" delta={0} deltaPercent="0% change" />
      </div>
    </div>

    {/* Footer */}
    <PageFooter />
  </div>
);

// Page 2: Hero Stats
const Stats = () => (
  <div style={fill}>
    <div style={{ padding: '108px 132px', display: 'flex', flexDirection: 'column', gap: 40, flex: 1 }}>
      {/* Heading */}
      <div>
        <h1 style={{ fontSize: 48, fontWeight: 700, margin: 0, color: palette.text }}>
          Quarter consumption breakdown
        </h1>
      </div>

      {/* Three hero stats */}
      <div style={{ display: 'flex', gap: 48, flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
        <HeroStat number="$402K" label="Total quarterly spend" isLava />
        <HeroStat number="1.8M" label="DBU quarters used" />
        <HeroStat number="$223" label="Average DBU cost" />
      </div>
    </div>

    {/* Footer */}
    <PageFooter />
  </div>
);

// Page 3: Bar Chart
const Charts = () => (
  <div style={fill}>
    <div style={{ padding: '108px 132px', display: 'flex', flexDirection: 'column', gap: 40, flex: 1 }}>
      {/* Heading */}
      <div>
        <h1 style={{ fontSize: 48, fontWeight: 700, margin: 0, color: palette.text }}>
          Account consumption comparison
        </h1>
      </div>

      {/* Chart */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <BarChart />
      </div>
    </div>

    {/* Footer */}
    <PageFooter />
  </div>
);

// Page 4: Data Table
const DataTablePage = () => (
  <div style={fill}>
    <div style={{ padding: '108px 132px', display: 'flex', flexDirection: 'column', gap: 40, flex: 1, overflowY: 'auto' as const }}>
      {/* Heading */}
      <div>
        <h1 style={{ fontSize: 48, fontWeight: 700, margin: 0, color: palette.text }}>
          Account consumption detail
        </h1>
      </div>

      {/* Table */}
      <div style={{ flex: 1 }}>
        <DataTable />
      </div>
    </div>

    {/* Footer */}
    <PageFooter />
  </div>
);

// ─── Page Footer ────────────────────────────────────────────────────────────
const PageFooter = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute' as const,
        bottom: 32,
        right: 132,
        fontSize: 12,
        color: palette.faint,
        fontWeight: 500,
      }}
    >
      {current} / {total}
    </div>
  );
};

// ─── Metadata & Export ──────────────────────────────────────────────────────
export const meta: SlideMeta = {
  title: 'Databricks — data layouts',
  createdAt: '2026-08-18T21:53:03.050Z',
  theme: 'databricks',
};

export default [KpiDashboard, Stats, Charts, DataTablePage] satisfies Page[];
