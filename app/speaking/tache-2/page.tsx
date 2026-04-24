import Tache2Picker from '@/components/speaking/Tache2Picker'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function Tache2Page() {
  return (
    <ProtectedRoute>
      <Tache2Picker />
    </ProtectedRoute>
  )
}
