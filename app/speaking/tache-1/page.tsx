import Tache1Session from '@/components/speaking/Tache1Session'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function Tache1Page() {
  return (
    <ProtectedRoute>
      <Tache1Session />
    </ProtectedRoute>
  )
}
