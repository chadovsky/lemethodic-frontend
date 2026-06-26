'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { fetchLessons } from '@/lib/api/lessons'
import type { Lesson } from '@/lib/types'
import LessonList from './LessonList'

export default function LessonListContainer({
  methodology,
}: {
  // F-483 - forwarded to LessonList so the methodology visualizer renders as the
  // h2 section directly under the page h1.
  methodology?: ReactNode
}) {
  const [lessons, setLessons] = useState<Lesson[]>([])

  useEffect(() => {
    fetchLessons().then(setLessons).catch(() => {})
  }, [])

  return <LessonList lessons={lessons} methodology={methodology} />
}
