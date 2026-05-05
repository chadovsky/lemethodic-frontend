import EcoleIntro from '@/components/ecole/intro/EcoleIntro'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function EcoleIntroPage() {
  return (
    <ProtectedRoute>
      <EcoleIntro />
    </ProtectedRoute>
  )
}
