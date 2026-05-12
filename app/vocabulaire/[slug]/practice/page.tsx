import ProtectedRoute from '@/components/auth/ProtectedRoute'
import PracticeClient from './PracticeClient'

// F-322 — Le Vocabulaire practice route. Nested under the topic detail
// surface (sibling to /vocabulaire/[slug]). Auth-gated.

interface Props {
  params: Promise<{ slug: string }>
}

export default async function VocabularyPracticePage({ params }: Props) {
  const { slug } = await params
  return (
    <ProtectedRoute>
      <PracticeClient slug={slug} />
    </ProtectedRoute>
  )
}
