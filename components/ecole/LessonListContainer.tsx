'use client'

import { useEffect, useState } from 'react'
import { fetchLessons } from '@/lib/api/lessons'
import type { Lesson } from '@/lib/types'
import LessonList from './LessonList'

export default function LessonListContainer() {
  const [lessons, setLessons] = useState<Lesson[]>([])

  useEffect(() => {
    fetchLessons().then(setLessons).catch(() => {})
  }, [])

  return <LessonList lessons={lessons} />
}
