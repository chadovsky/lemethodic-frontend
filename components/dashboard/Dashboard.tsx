import { SERIF_FONT, SANS_FONT } from '@/lib/typography'
import ProgressWidget from './ProgressWidget'
import RecentActivityWidget from './RecentActivityWidget'
import NextLessonWidget from './NextLessonWidget'
import DiagnosticScoreWidget from './DiagnosticScoreWidget'

function formatTodayInFrench(date = new Date()): string {
  return new Intl.DateTimeFormat('fr-CA', { dateStyle: 'full' }).format(date)
}

export default function Dashboard() {
  const today = formatTodayInFrench()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingTop: 8 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h1
          style={{
            fontFamily: SERIF_FONT,
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 'clamp(32px, 4vw, 52px)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          Bonjour
        </h1>
        <p
          data-testid="dashboard-today"
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 400,
            fontSize: '0.9375rem',
            color: 'var(--text-muted)',
            margin: 0,
            textTransform: 'capitalize',
          }}
        >
          {today}
        </p>
      </header>

      <div className="dashboard-grid">
        <ProgressWidget />
        <RecentActivityWidget />
        <NextLessonWidget />
        <DiagnosticScoreWidget />
      </div>
    </div>
  )
}
