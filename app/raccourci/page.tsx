import HomeScreen from '@/components/home/HomeScreen'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function RaccourciPage() {
  return (
    <ProtectedRoute>
      <HomeScreen />
    </ProtectedRoute>
  )
}
