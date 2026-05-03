// P-230 — /progress is the Overall Progress dashboard (curriculum §7.4 calm
// mode). Replaces the P-100 era surface (Snapshot / SustainedCouches /
// ActivityTimeline / RecurringModulesList). The P-100 components are
// deleted in commit 3 of this set.

import ProgressDashboard from '@/components/dashboard/ProgressDashboard'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function ProgressPage() {
  return (
    <ProtectedRoute>
      <ProgressDashboard />
    </ProtectedRoute>
  )
}
