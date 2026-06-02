import ProtectedRoute from '@/components/auth/ProtectedRoute'
import TopicDetail from './TopicDetail'

// F-325 — Le Vocabulaire topic detail (chunk list within a topic).
// Auth-gated. The `id` segment is opaque (BE F-325 contract: [a-z0-9-]+).

interface Props {
  params: Promise<{ id: string }>
}

export default async function VocabularyTopicPage({ params }: Props) {
  const { id } = await params
  return (
    <ProtectedRoute>
      <TopicDetail slug={id} />
    </ProtectedRoute>
  )
}
