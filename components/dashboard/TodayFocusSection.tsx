'use client'

// P-230 — Today's focus (Block 5 Dialogue Box). Skeleton in commit 1;
// commit 2 builds out the reason_code-driven copy + defensive dialogue_box
// rendering + practice CTA.

import type { TodayActionResponse } from '@/lib/types'

interface TodayFocusSectionProps {
  today: TodayActionResponse | null
}

export default function TodayFocusSection({ today }: TodayFocusSectionProps) {
  void today
  return null
}
