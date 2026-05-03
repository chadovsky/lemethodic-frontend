'use client'

// P-234 — practice prompt + record CTA. Skeleton in commit 1; commit 2
// builds out: best-effort prompt preview (practice_prompt is JSONB —
// loose extraction of `text`/`prompt`/`description` strings) + Practice
// now CTA → /speaking/tache-{N}?promptCluster={slug}.

import type { ClusterDetailResponse } from '@/lib/types'

interface PracticeCTAProps {
  detail: ClusterDetailResponse
}

export default function PracticeCTA({ detail }: PracticeCTAProps) {
  void detail
  return null
}
