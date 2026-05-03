'use client'

// P-234 — lesson body. Skeleton in commit 1; commit 2 renders per
// ClusterLesson.format: markdown via react-markdown + remark-gfm,
// pdf via iframe, video deferred.

import type { ClusterLesson } from '@/lib/types'

interface LessonBodyProps {
  lesson: ClusterLesson
}

export default function LessonBody({ lesson }: LessonBodyProps) {
  void lesson
  return null
}
