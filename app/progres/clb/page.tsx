import ProtectedRoute from '@/components/auth/ProtectedRoute'
import ClbMappingPage from './ClbMappingPage'

export default function ClbPage() {
  return (
    <ProtectedRoute>
      <ClbMappingPage />
    </ProtectedRoute>
  )
}
