import { SERIF_FONT, SANS_FONT } from '@/lib/typography'
import { RECENT_ACTIVITY, ACTIVITY_DOT_COLOR } from '@/lib/data/dashboard'

export default function RecentActivityWidget() {
  return (
    <section
      data-testid="dashboard-widget-activite"
      className="ed-card-lift"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 4,
        padding: 'clamp(20px, 2vw, 28px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
      aria-labelledby="dashboard-activity-heading"
    >
      <h2
        id="dashboard-activity-heading"
        style={{
          fontFamily: SERIF_FONT,
          fontWeight: 500,
          fontSize: 'clamp(22px, 2.6vw, 30px)',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        Activité récente
      </h2>

      <ul
        aria-label="Activité récente"
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {RECENT_ACTIVITY.map((activity, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              paddingBottom: i < RECENT_ACTIVITY.length - 1 ? 12 : 0,
              borderBottom:
                i < RECENT_ACTIVITY.length - 1 ? '1px solid var(--rule-default)' : 'none',
            }}
          >
            <span
              data-testid="activity-dot"
              aria-hidden="true"
              style={{
                flexShrink: 0,
                marginTop: 5,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: ACTIVITY_DOT_COLOR[activity.category],
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span
                style={{
                  fontFamily: SANS_FONT,
                  fontWeight: 500,
                  fontSize: '0.9375rem',
                  color: 'var(--text-primary)',
                }}
              >
                {activity.label}
              </span>
              <span
                style={{
                  fontFamily: SANS_FONT,
                  fontWeight: 400,
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                }}
              >
                {activity.relativeTime}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
