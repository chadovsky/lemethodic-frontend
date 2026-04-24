import Tache3Session from '@/components/speaking/Tache3Session'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

interface Props {
  params: Promise<{ topic: string }>
}

export default async function Tache3TopicPage({ params }: Props) {
  const { topic } = await params
  return (
    <ProtectedRoute>
      <Tache3Session topicSlug={topic} />
    </ProtectedRoute>
  )
}
