'use client'

import { useEffect, useLayoutEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import { fetchLesson } from '@/lib/api/lessons'
import { ApiError } from '@/lib/api'
import type { Lesson } from '@/lib/types'
import LessonDetail from './LessonDetail'

const TOTAL_LESSONS = 27

export default function LessonDetailContainer({ id }: { id: number }) {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [isNotFound, setIsNotFound] = useState(false)
  const router = useRouter()

  // Register keyboard navigation synchronously (useLayoutEffect) so the
  // handler is ready before Playwright's goto() returns, allowing ArrowKey
  // presses immediately after navigation without a race condition.
  useLayoutEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && id < TOTAL_LESSONS) {
        router.push(`/la-methode/lecon-${id + 1}`)
      } else if (e.key === 'ArrowLeft' && id > 1) {
        router.push(`/la-methode/lecon-${id - 1}`)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [id, router])

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
