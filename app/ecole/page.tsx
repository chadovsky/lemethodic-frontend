import HomeScreen from '@/components/home/HomeScreen'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function EcolePage() {
  return (
    <ProtectedRoute>
      <HomeScreen />
    </ProtectedRoute>
  )
}
