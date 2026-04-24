import Tache2Session from '@/components/speaking/Tache2Session'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

interface Props {
  params: Promise<{ scenario: string }>
}

export default async function Tache2ScenarioPage({ params }: Props) {
  const { scenario } = await params
  return (
    <ProtectedRoute>
      <Tache2Session scenario={scenario} />
    </ProtectedRoute>
  )
}
