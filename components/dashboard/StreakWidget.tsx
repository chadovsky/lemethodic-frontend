'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { RecordingSummary } from '@/lib/types'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

// Derives streak from recording dates. Covers only recording sessions (Tâches),
// not lesson-only study days.
// TODO(BE): replace with /api/users/me/streak when a dedicated endpoint lands.
function computeStreak(recordings: RecordingSummary[]): number {
  if (!recordings.length) return 0
  const days = new Set(recordings.map((r) => r.createdAt.slice(0, 10)))
  const sorted = Array.from(days).sort().reverse()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().slice(0, 10)
  const yesterday = new Date(today.getTime() - 86400000)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  if (sorted[0] !== todayStr && sorted[0] !== yesterdayStr) return 0

  let streak = 0
  let cursor = sorted[0] === todayStr ? today : yesterday

  for (const day of sorted) {
    if (day === cursor.toISOString().slice(0, 10)) {
      streak++
      cursor = new Date(cursor.getTime() - 86400000)
    } else {
      break
    }
  }
  return streak
}

type Status = 'loading' | 'ok' | 'error'

export default function StreakWidget() {
  const [streak, setStreak] = useState(0)
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    api.recordings
      .list()
      .then((recs) => {
        setStreak(computeStreak(recs))
        setStatus('ok')
      })
      .catch(() => setStatus('error'))
  }, [])

  return (
    <section
      data-testid="dashboard-widget-streak"
      className="ed-card-lift"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 4,
        padding: 'clamp(20px, 2vw, 28px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <h2
        style={{
          fontFamily: SERIF_FONT,
          fontWeight: 500,
          fontSize: 'clamp(16px, 1.8vw, 20px)',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        Série active
      </h2>

      {status === 'loading' ? (
        <div className="ed-skeleton" style={{ height: 48, borderRadius: 4 }} />
      ) : status === 'error' ? (
        <p
          data-testid="streak-error"
          style={{
            fontFamily: SANS_FONT,
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            margin: 0,
          }}
        >
          Données indisponibles
        </p>
      ) : (
        <>
          <span
            data-testid="streak-count"
            style={{
              fontFamily: SERIF_FONT,
              fontWeight: 500,
              fontSize: 'clamp(36px, 4vw, 52px)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            {streak}
          </span>
          <span
            style={{
              fontFamily: SANS_FONT,
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
            }}
          >
            {streak === 1 ? 'jour consécutif' : 'jours consécutifs'}
          </span>
        </>
      )}
    </section>
  )
}
