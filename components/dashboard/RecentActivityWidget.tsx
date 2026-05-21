import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

const ACTIVITIES = [
  { label: 'Leçon 4 terminée', when: 'il y a 2 jours' },
  { label: '10 chunks révisés', when: 'il y a 3 jours' },
  { label: 'Diagnostic Tâche 1 essayée', when: 'il y a 5 jours' },
] as const

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
          fontStyle: 'italic',
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
        {ACTIVITIES.map((activity, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              paddingBottom: i < ACTIVITIES.length - 1 ? 12 : 0,
              borderBottom:
                i < ACTIVITIES.length - 1 ? '1px solid var(--rule-default)' : 'none',
            }}
          >
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
              {activity.when}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
