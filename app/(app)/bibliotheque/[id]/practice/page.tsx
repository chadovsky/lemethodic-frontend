import ProtectedRoute from '@/components/auth/ProtectedRoute'
import PracticeClient from './PracticeClient'

// F-322 — Le Vocabulaire practice route. Nested under the topic detail
// surface (sibling to /bibliotheque/[id]). Auth-gated.

interface Props {
  params: Promise<{ id: string }>
}

export default async function VocabularyPracticePage({ params }: Props) {
  const { id } = await params
  return (
    <ProtectedRoute>
      <PracticeClient slug={id} />
    </ProtectedRoute>
  )
}
