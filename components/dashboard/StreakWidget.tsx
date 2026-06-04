'use client'

import type { UserProgress } from '@/lib/types'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

interface Props {
  progress: UserProgress | null
  progressError: boolean
}

export default function StreakWidget({ progress, progressError }: Props) {
  const status = progressError ? 'error' : progress === null ? 'loading' : 'ok'
  const streak = progress?.streakDays ?? 0

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
