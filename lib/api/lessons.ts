import { api } from '@/lib/api'
import type { Lesson, LessonDetail } from '@/lib/types'

export async function fetchLessons(): Promise<Lesson[]> {
  return api.lessons.list()
}

export async function fetchLesson(id: number): Promise<LessonDetail> {
  return api.lessons.get(id)
}
