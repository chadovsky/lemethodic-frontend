// TODO(BE): wire to a dedicated /api/users/me/daily-target endpoint when it
// lands. No such endpoint exists today. Renders a static placeholder (1 session)
// until the BE ticket is filed and wired.
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

export default function DailyTargetWidget() {
  return (
    <section
      data-testid="dashboard-widget-daily-target"
      className="ed-card-lift"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 4,
        padding: 'clamp(20px, 2vw, 28px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <h2
        style={{
          fontFamily: SERIF_FONT,
          fontWeight: 500,
          fontSize: 'clamp(16px, 1.8vw, 20px)',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        Objectif du jour
      </h2>

      <span
        data-testid="daily-target-value"
        style={{
          fontFamily: SERIF_FONT,
          fontWeight: 500,
          fontSize: 'clamp(36px, 4vw, 52px)',
          lineHeight: 1,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
        }}
      >
        1
      </span>

      <span
        style={{
          fontFamily: SANS_FONT,
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
        }}
      >
        session aujourd&apos;hui
      </span>
    </section>
  )
}
