import Tache1Session from '@/components/speaking/Tache1Session'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

// Tâche 1 is a single personal-interview flow with no picker. The URL
// slug (typically "interview") exists only to keep the path shape
// consistent with tache-2/[scenario] and tache-3/[topic]; the session
// itself doesn't branch on it. Backend randomizes the examiner's opening
// prompt from tache1_openings.
export default function Tache1InterviewPage() {
  return (
    <ProtectedRoute>
      <Tache1Session />
    </ProtectedRoute>
  )
}
