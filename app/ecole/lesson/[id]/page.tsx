import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LessonDetailClient from './LessonDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function LessonPage({ params }: Props) {
  const { id } = await params
  // Route param `id` is a lesson_number (1-27); kept as-is to match the
  // rest of the /ecole/lesson route surface. Non-numeric inputs fall
  // through to NaN and the client renders a "Lesson not found" state.
  const lessonNumber = Number.parseInt(id, 10)

  return (
    <ProtectedRoute>
      <LessonDetailClient lessonNumber={lessonNumber} />
    </ProtectedRoute>
  )
}
