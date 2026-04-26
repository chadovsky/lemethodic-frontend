import HomeScreen from '@/components/home/HomeScreen'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function ÉcolePage() {
  return (
    <ProtectedRoute>
      <HomeScreen />
    </ProtectedRoute>
  )
}
