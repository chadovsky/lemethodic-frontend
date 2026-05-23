'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { fetchLesson } from '@/lib/api/lessons'
import { ApiError } from '@/lib/api'
import type { Lesson } from '@/lib/types'
import LessonDetail from './LessonDetail'

export default function LessonDetailContainer({ id }: { id: number }) {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [isNotFound, setIsNotFound] = useState(false)

  useEffect(() => {
    fetchLesson(id)
      .then((detail) => setLesson(detail.lesson))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setIsNotFound(true)
        }
      })
  }, [id])

  if (isNotFound) {
    notFound()
  }

  if (!lesson) {
    return null
  }

  return <LessonDetail lesson={lesson} />
}
