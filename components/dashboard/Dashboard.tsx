import DashboardGreeting from './DashboardGreeting'
import CountdownWidget from './CountdownWidget'
import StreakWidget from './StreakWidget'
import DailyTargetWidget from './DailyTargetWidget'
import CalendarWidget from './CalendarWidget'
import NextLessonWidget from './NextLessonWidget'

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingTop: 8 }}>
      <DashboardGreeting />

      <div className="dashboard-grid">
        <CountdownWidget />
        <StreakWidget />
        <DailyTargetWidget />
        <NextLessonWidget />
        <CalendarWidget />
      </div>
    </div>
  )
}
