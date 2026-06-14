'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { UserProgress } from '@/lib/types'
import DashboardGreeting from './DashboardGreeting'
import CountdownWidget from './CountdownWidget'
import StreakWidget from './StreakWidget'
import DailyTargetWidget from './DailyTargetWidget'
import NextLessonWidget from './NextLessonWidget'
import CommencerSeance from './CommencerSeance'

export default function Dashboard() {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [progressError, setProgressError] = useState(false)

  useEffect(() => {
    api.users
      .getProgress()
      .then(setProgress)
      .catch(() => setProgressError(true))
  }, [])

  async function handlePatchTarget(minutes: number) {
    const updated = await api.users.patchProgress({ daily_target_minutes: minutes })
    setProgress(updated)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingTop: 8 }}>
      <DashboardGreeting />

      <CommencerSeance />

      <div className="dashboard-grid">
        <CountdownWidget />
        <StreakWidget progress={progress} progressError={progressError} />
        <DailyTargetWidget
          progress={progress}
          progressError={progressError}
          onPatchTarget={handlePatchTarget}
        />
        <NextLessonWidget />
      </div>
    </div>
  )
}
