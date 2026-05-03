'use client'

// P-230 — Goulet Stack top 3 (Block 2). Skeleton in commit 1; commit 2
// builds out top 3 from getRecurringModules with severity bars + cluster
// names. Data-source overlap with /ecole F-080d documented in
// P-230.consolidate follow-up (commit 3).

import type { RecurringModule } from '@/lib/types'

interface GouletStackSectionProps {
  modules: RecurringModule[]
}

export default function GouletStackSection({ modules }: GouletStackSectionProps) {
  void modules
  return null
}
