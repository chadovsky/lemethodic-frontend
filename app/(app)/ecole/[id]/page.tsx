import { notFound } from 'next/navigation'
import LessonDetail from '@/components/ecole/LessonDetail'
import { getLessonById } from '@/lib/data/lessons'

export const metadata = {
  title: 'Leçon — Le Méthodic',
}

type Params = Promise<{ id: string }>

export default async function LessonDetailPage({ params }: { params: Params }) {
  const { id } = await params
  if (!/^\d+$/.test(id)) notFound()
  const numericId = Number(id)
  const lesson = getLessonById(numericId)
  if (!lesson) notFound()
  return <LessonDetail lesson={lesson} />
}
