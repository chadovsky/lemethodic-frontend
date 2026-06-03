import { notFound } from 'next/navigation'
import LessonDetailContainer from '@/components/ecole/LessonDetailContainer'

export const metadata = {
  title: 'Leçon | Le Méthodic',
}

type Params = Promise<{ id: string }>

const TOTAL_LESSONS = 27

export default async function LessonDetailPage({ params }: { params: Params }) {
  const { id } = await params
  const m = /^lecon-(\d+)$/.exec(id) ?? /^(\d+)$/.exec(id)
  if (!m) notFound()
  const numericId = Number(m[1])
  if (numericId < 1 || numericId > TOTAL_LESSONS) notFound()
  return <LessonDetailContainer id={numericId} />
}
