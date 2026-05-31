import { notFound } from 'next/navigation'
import LessonDetailContainer from '@/components/ecole/LessonDetailContainer'

export const metadata = {
  title: 'Leçon | Le Méthodic',
}

type Params = Promise<{ id: string }>

const TOTAL_LESSONS = 27

export default async function LessonDetailPage({ params }: { params: Params }) {
  const { id } = await params
  // Accept both "lecon-5" (canonical new format) and bare numeric "5" (redirect passthrough)
  const match = id.match(/^(?:lecon-)?(\d+)$/)
  if (!match) notFound()
  const numericId = Number(match[1])
  if (numericId < 1 || numericId > TOTAL_LESSONS) notFound()
  return <LessonDetailContainer id={numericId} />
}
