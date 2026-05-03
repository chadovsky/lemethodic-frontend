'use client'

// P-230 — Recent activity. Skeleton in commit 1; commit 2 builds out a
// linear list of last 5 recordings (date / tâche / cefr badge). Calendar
// grid view deferred to P-230.x (commit 3 BACKLOG entry).

import type { RecordingSummary } from '@/lib/types'

interface RecentActivitySectionProps {
  recordings: RecordingSummary[] | null
}

export default function RecentActivitySection({ recordings }: RecentActivitySectionProps) {
  void recordings
  return null
}
