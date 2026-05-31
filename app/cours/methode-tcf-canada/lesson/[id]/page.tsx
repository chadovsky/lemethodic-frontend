import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LessonDetailClient from './LessonDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function LessonPage({ params }: Props) {
  const { id } = await params
  const lessonNumber = Number.parseInt(id, 10)

  return (
    <ProtectedRoute>
      <LessonDetailClient lessonNumber={lessonNumber} />
    </ProtectedRoute>
  )
}
