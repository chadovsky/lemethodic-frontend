'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { UserProgress } from '@/lib/types'
import { SANS_FONT } from '@/lib/typography'
import DailyTargetWidget from '@/components/dashboard/DailyTargetWidget'

// F-467 — the only daily-target editor in the FE after F-464 removed
// DailyTargetWidget from the dashboard. Reads daily_target_minutes from
// GET /api/users/me/progress; writes via PATCH. Optimistic update, revert on
// error (re-throw keeps the widget in edit mode). One source of truth: the
// dashboard "Objectif du jour" card reads activity-calendar.todayTarget, which
// the BE derives from this same field — no second store, no lm.* mirror.
export default function DailyTargetSection() {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [progressError, setProgressError] = useState(false)

  useEffect(() => {
    api.users.getProgress().then(setProgress).catch(() => setProgressError(true))
  }, [])

  async function onPatchTarget(minutes: number) {
    const prev = progress
    // Optimistic: reflect the new target immediately.
    setProgress((p) => (p ? { ...p, dailyTargetMinutes: minutes } : p))
    try {
      const updated = await api.users.patchProgress({ daily_target_minutes: minutes })
      setProgress(updated)
    } catch (err) {
      setProgress(prev) // revert
      throw err // keep the widget in edit mode so the user can retry
    }
  }

  return (
    <div data-testid="parametres-objectif">
      <p
        style={{
          fontFamily: SANS_FONT,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--lm-text-secondary)',
          margin: '0 0 8px',
        }}
      >
        Objectif quotidien
      </p>
      <DailyTargetWidget
        progress={progress}
        progressError={progressError}
        onPatchTarget={onPatchTarget}
      />
    </div>
  )
}
