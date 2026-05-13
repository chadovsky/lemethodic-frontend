import ProtectedRoute from '@/components/auth/ProtectedRoute'
import TestClient from './TestClient'

// F-323 — Le Vocabulaire test route. Sibling of /practice. Auth-gated.

interface Props {
  params: Promise<{ slug: string }>
}

export default async function VocabularyTestPage({ params }: Props) {
  const { slug } = await params
  return (
    <ProtectedRoute>
      <TestClient slug={slug} />
    </ProtectedRoute>
  )
}
