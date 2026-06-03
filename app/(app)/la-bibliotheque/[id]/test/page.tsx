import ProtectedRoute from '@/components/auth/ProtectedRoute'
import TestClient from './TestClient'

// F-323 — Le Vocabulaire test route. Sibling of /practice. Auth-gated.

interface Props {
  params: Promise<{ id: string }>
}

export default async function VocabularyTestPage({ params }: Props) {
  const { id } = await params
  return (
    <ProtectedRoute>
      <TestClient slug={id} />
    </ProtectedRoute>
  )
}
