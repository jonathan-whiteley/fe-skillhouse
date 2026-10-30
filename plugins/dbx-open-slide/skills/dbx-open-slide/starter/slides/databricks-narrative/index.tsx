import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import { useSlidePageNumber } from '@open-slide/core';

// ─── Webfont Loading ─────────────────────────────────────────────────────────
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=DM+Mono:wght@400;500&display=swap';
const FONT_LINK_ID = 'osd-webfont-databricks-narrative';
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

// ─── Design System ──────────────────────────────────────────────────────────
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

export const meta: SlideMeta = {
  title: 'Databricks — narrative layouts',
  createdAt: '2026-08-18T21:53:03.050Z',
  theme: 'databricks',
};

// ─── Color Palette ──────────────────────────────────────────────────────────
const palette = {
  bg: '#F9F7F4',
  text: '#1B3139',
  accent: '#FF3621',
  muted: '#5A5755',
  faint: '#8A8580',
  surface: '#FFFFFF',
  line: '#E4E2DD',
  green: '#00875C',
};

const font = {
  display: "'DM Sans', system-ui, -apple-system, sans-serif",
  body: "'DM Sans', system-ui, -apple-system, sans-serif",
  mono: "'DM Mono', ui-monospace, Menlo, monospace",
};

const fill = {
  width: '100%',
  height: '100%',
  background: palette.bg,
  color: palette.text,
  fontFamily: font.body,
  overflow: 'hidden' as const,
  position: 'relative' as const,
};

// ─── Shared Footer ──────────────────────────────────────────────────────────
const Footer = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 54,
        right: 132,
        fontSize: 16,
        fontWeight: 500,
        color: palette.faint,
        fontFamily: font.mono,
      }}
    >
      {current} / {total}
    </div>
  );
};

// ─── Page 1: Agenda ─────────────────────────────────────────────────────────
const AgendaRow = ({
  index,
  title,
  desc,
}: {
  index: number;
  title: string;
  desc: string;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 48,
      marginBottom: 56,
    }}
  >
    <div
      style={{
        fontSize: 48,
        fontWeight: 700,
        color: palette.text,
        minWidth: 60,
        lineHeight: '1',
      }}
    >
      {index}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: palette.text,
          lineHeight: '1.2',
        }}
      >
        {title}
      </div>
      {desc && (
        <div
          style={{
            fontSize: 22,
            fontWeight: 400,
            color: palette.muted,
            lineHeight: '1.3',
          }}
        >
          {desc}
        </div>
      )}
    </div>
  </div>
);

const Agenda = () => (
  <div style={fill}>
    <div
      style={{
        paddingTop: 108,
        paddingBottom: 108,
        paddingLeft: 132,
        paddingRight: 132,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h1
        style={{
          fontSize: 84,
          fontWeight: 700,
          color: palette.text,
          marginBottom: 72,
          marginTop: 0,
          lineHeight: '1.1',
        }}
      >
        Agenda
      </h1>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <AgendaRow
          index={1}
          title="Current state assessment"
          desc="Evaluate existing data infrastructure and pain points"
        />
        <AgendaRow
          index={2}
          title="Databricks value proposition"
          desc="How modern lakehouse solves your data challenges"
        />
        <AgendaRow
          index={3}
          title="Migration roadmap"
          desc="Phased approach with parallel workloads"
        />
        <AgendaRow
          index={4}
          title="Success metrics and support"
          desc="Outcomes, training, and ongoing partnership"
        />
      </div>

      <Footer />
    </div>
  </div>
);

// ─── Page 2: Timeline ───────────────────────────────────────────────────────
const TimelineMarker = ({
  label,
  date,
  isActive,
  xPercent,
}: {
  label: string;
  date: string;
  isActive: boolean;
  xPercent: number;
}) => (
  <div
    style={{
      position: 'absolute',
      left: `${xPercent}%`,
      top: 0,
      transform: 'translateX(-50%)',
    }}
  >
    {/* Date label above */}
    <div
      style={{
        textAlign: 'center',
        marginBottom: 16,
        fontSize: 20,
        fontWeight: 500,
        color: isActive ? palette.accent : palette.muted,
        fontFamily: font.mono,
      }}
    >
      {date}
    </div>

    {/* Dot marker */}
    <div
      style={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        backgroundColor: isActive ? palette.accent : palette.text,
        margin: '0 auto',
        marginBottom: 20,
      }}
    />

    {/* Event label below */}
    <div
      style={{
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 500,
        color: palette.text,
        width: 140,
        wordBreak: 'break-word',
        lineHeight: '1.2',
      }}
    >
      {label}
    </div>
  </div>
);

const Timeline = () => (
  <div style={fill}>
    <div
      style={{
        paddingTop: 108,
        paddingBottom: 108,
        paddingLeft: 132,
        paddingRight: 132,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h1
        style={{
          fontSize: 84,
          fontWeight: 700,
          color: palette.text,
          marginBottom: 72,
          marginTop: 0,
          lineHeight: '1.1',
        }}
      >
        Timeline
      </h1>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          paddingTop: 80,
          paddingBottom: 80,
        }}
      >
        {/* Baseline */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: palette.line,
            transform: 'translateY(-50%)',
          }}
        />

        {/* Markers */}
        <TimelineMarker
          label="Kickoff"
          date="Q3 2026"
          isActive={false}
          xPercent={5}
        />
        <TimelineMarker
          label="Pilot setup"
          date="Q4 2026"
          isActive={true}
          xPercent={32}
        />
        <TimelineMarker
          label="Initial load"
          date="Q1 2027"
          isActive={false}
          xPercent={58}
        />
        <TimelineMarker
          label="Production go-live"
          date="Q2 2027"
          isActive={false}
          xPercent={85}
        />
      </div>

      <Footer />
    </div>
  </div>
);

// ─── Page 3: Journey ────────────────────────────────────────────────────────
const JourneyStep = ({
  stage,
  outcome,
}: {
  stage: string;
  outcome: string;
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
    }}
  >
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        backgroundColor: palette.text,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    />
    <div
      style={{
        fontSize: 24,
        fontWeight: 700,
        color: palette.text,
        textAlign: 'center',
        minHeight: 32,
      }}
    >
      {stage}
    </div>
    <div
      style={{
        fontSize: 18,
        fontWeight: 400,
        color: palette.muted,
        textAlign: 'center',
        lineHeight: '1.3',
      }}
    >
      {outcome}
    </div>
  </div>
);

const Chevron = () => (
  <div
    style={{
      width: 32,
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
      color: palette.faint,
      flexShrink: 0,
    }}
  >
    →
  </div>
);

const Journey = () => (
  <div style={fill}>
    <div
      style={{
        paddingTop: 108,
        paddingBottom: 108,
        paddingLeft: 132,
        paddingRight: 132,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h1
        style={{
          fontSize: 84,
          fontWeight: 700,
          color: palette.text,
          marginBottom: 72,
          marginTop: 0,
          lineHeight: '1.1',
        }}
      >
        Customer journey
      </h1>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <JourneyStep stage="Explore" outcome="Define scope and use cases" />
        <Chevron />
        <JourneyStep stage="Pilot" outcome="Validate approach and tools" />
        <Chevron />
        <JourneyStep stage="Scale" outcome="Expand to production workloads" />
        <Chevron />
        <JourneyStep stage="Optimize" outcome="Maximize ROI and efficiency" />
      </div>

      <Footer />
    </div>
  </div>
);

// ─── Page 4: Milestones ─────────────────────────────────────────────────────
const GanttRow = ({
  phase,
  startPercent,
  widthPercent,
  isCritical,
}: {
  phase: string;
  startPercent: number;
  widthPercent: number;
  isCritical: boolean;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 32,
      marginBottom: 40,
    }}
  >
    <div
      style={{
        fontSize: 20,
        fontWeight: 600,
        color: palette.text,
        minWidth: 140,
      }}
    >
      {phase}
    </div>
    <div
      style={{
        flex: 1,
        height: 36,
        position: 'relative',
        backgroundColor: palette.line,
        borderRadius: 8,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: `${startPercent}%`,
          top: 0,
          width: `${widthPercent}%`,
          height: '100%',
          backgroundColor: isCritical ? palette.accent : palette.text,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 600,
          color: palette.surface,
          paddingLeft: 12,
          paddingRight: 12,
        }}
      >
        {isCritical && '⬤'}
      </div>
    </div>
  </div>
);

const Milestones = () => (
  <div style={fill}>
    <div
      style={{
        paddingTop: 108,
        paddingBottom: 108,
        paddingLeft: 132,
        paddingRight: 132,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h1
        style={{
          fontSize: 84,
          fontWeight: 700,
          color: palette.text,
          marginBottom: 72,
          marginTop: 0,
          lineHeight: '1.1',
        }}
      >
        Quarterly milestones
      </h1>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <GanttRow
          phase="Planning & architecture"
          startPercent={0}
          widthPercent={25}
          isCritical={false}
        />
        <GanttRow
          phase="Infrastructure setup"
          startPercent={20}
          widthPercent={30}
          isCritical={true}
        />
        <GanttRow
          phase="Data migration"
          startPercent={45}
          widthPercent={35}
          isCritical={false}
        />
        <GanttRow
          phase="Testing & optimization"
          startPercent={75}
          widthPercent={25}
          isCritical={false}
        />
      </div>

      <Footer />
    </div>
  </div>
);

// ─── Page 5: Comparison ─────────────────────────────────────────────────────
const ComparisonRow = ({
  label,
  before,
  after,
}: {
  label: string;
  before: string;
  after: string;
}) => (
  <div
    style={{
      display: 'flex',
      gap: 32,
      marginBottom: 28,
      borderBottom: `1px solid ${palette.line}`,
      paddingBottom: 28,
    }}
  >
    <div
      style={{
        flex: 1,
        fontSize: 18,
        fontWeight: 600,
        color: palette.text,
        minWidth: 160,
      }}
    >
      {label}
    </div>
    <div
      style={{
        flex: 1.2,
        fontSize: 18,
        fontWeight: 400,
        color: palette.muted,
        lineHeight: '1.3',
      }}
    >
      {before}
    </div>
    <div
      style={{
        flex: 1.2,
        fontSize: 18,
        fontWeight: 400,
        color: palette.text,
        lineHeight: '1.3',
      }}
    >
      {after}
    </div>
  </div>
);

const Comparison = () => (
  <div style={fill}>
    <div
      style={{
        paddingTop: 108,
        paddingBottom: 108,
        paddingLeft: 132,
        paddingRight: 132,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h1
        style={{
          fontSize: 84,
          fontWeight: 700,
          color: palette.text,
          marginBottom: 72,
          marginTop: 0,
          lineHeight: '1.1',
        }}
      >
        Before and after
      </h1>

      {/* Column headers */}
      <div
        style={{
          display: 'flex',
          gap: 32,
          marginBottom: 40,
          paddingBottom: 16,
          borderBottom: `2px solid ${palette.text}`,
        }}
      >
        <div
          style={{
            flex: 1,
            fontSize: 18,
            fontWeight: 600,
            color: palette.muted,
          }}
        >
          Aspect
        </div>
        <div
          style={{
            flex: 1.2,
            fontSize: 18,
            fontWeight: 600,
            color: palette.muted,
          }}
        >
          Current state
        </div>
        <div
          style={{
            flex: 1.2,
            fontSize: 18,
            fontWeight: 700,
            color: palette.text,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          Databricks
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              backgroundColor: palette.accent,
              color: palette.surface,
              padding: '2px 8px',
              borderRadius: 3,
            }}
          >
            Recommended
          </span>
        </div>
      </div>

      {/* Comparison rows */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ComparisonRow
          label="Data silos"
          before="Fragmented across systems"
          after="Unified data lakehouse"
        />
        <ComparisonRow
          label="Query latency"
          before="Minutes to hours"
          after="Seconds for analytics"
        />
        <ComparisonRow
          label="Maintenance overhead"
          before="High (manual tuning)"
          after="Low (auto-optimized)"
        />
        <ComparisonRow
          label="Real-time insights"
          before="Batch processing only"
          after="Stream + batch"
        />
        <ComparisonRow
          label="TCO over 3 years"
          before="$1.2M+ (escalating)"
          after="Predictable, 40% savings"
        />
      </div>

      <Footer />
    </div>
  </div>
);

// ─── Export ──────────────────────────────────────────────────────────────────
export default [Agenda, Timeline, Journey, Milestones, Comparison] satisfies Page[];
