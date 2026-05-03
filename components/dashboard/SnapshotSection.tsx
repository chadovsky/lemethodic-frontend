'use client'

// P-230 — Snapshot section. Skeleton in commit 1; commit 2 builds out
// the level + confidence visualizer + agreement copy + diagnostic-in-progress
// fallback.

import type { DiagnosticStateResponse, LevelResponse } from '@/lib/types'

interface SnapshotSectionProps {
  level: LevelResponse | null
  diagnostic: DiagnosticStateResponse | null
  examDate: string | null
}

export default function SnapshotSection({ level, diagnostic, examDate }: SnapshotSectionProps) {
  void level
  void diagnostic
  void examDate
  return null
}
