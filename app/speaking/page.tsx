import SpeakingLanding from '@/components/speaking/SpeakingLanding'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function SpeakingPage() {
  return (
    <ProtectedRoute>
      <SpeakingLanding />
    </ProtectedRoute>
  )
}
