import ProtectedRoute from '@/components/auth/ProtectedRoute'
import TopicDetail from './TopicDetail'

// F-325 — Le Vocabulaire topic detail (chunk list within a topic).
// Auth-gated. The `slug` segment is opaque (BE F-325 contract: [a-z0-9-]+).

interface Props {
  params: Promise<{ slug: string }>
}

export default async function VocabularyTopicPage({ params }: Props) {
  const { slug } = await params
  return (
    <ProtectedRoute>
      <TopicDetail slug={slug} />
    </ProtectedRoute>
  )
}
