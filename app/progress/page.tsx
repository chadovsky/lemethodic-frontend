// P-230 — /progress is the Overall Progress dashboard.
// V-015d — desktop ≥md gets ProgressDashboardDesktop bento; mobile <md
// keeps the existing ProgressDashboard stacked layout (gates via
// fp-mobile-only / fp-desktop-only in globals.css).

import ProgressDashboard from '@/components/dashboard/ProgressDashboard'
import ProgressDashboardDesktop from '@/components/dashboard/ProgressDashboardDesktop'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function ProgressPage() {
  return (
    <ProtectedRoute>
      <div className="fp-mobile-only">
        <ProgressDashboard />
      </div>
      <div className="fp-desktop-only">
        <ProgressDashboardDesktop />
      </div>
    </ProtectedRoute>
  )
}
