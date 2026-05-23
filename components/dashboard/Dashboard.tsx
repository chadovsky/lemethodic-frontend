import DashboardGreeting from './DashboardGreeting'
import ProgressWidget from './ProgressWidget'
import RecentActivityWidget from './RecentActivityWidget'
import NextLessonWidget from './NextLessonWidget'
import DiagnosticScoreWidget from './DiagnosticScoreWidget'

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingTop: 8 }}>
      <DashboardGreeting />

      <div className="dashboard-grid">
        <ProgressWidget />
        <RecentActivityWidget />
        <NextLessonWidget />
        <DiagnosticScoreWidget />
      </div>
    </div>
  )
}
