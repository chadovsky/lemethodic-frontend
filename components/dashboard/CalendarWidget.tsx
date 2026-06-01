'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { RecordingSummary } from '@/lib/types'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

// Monday-first weekday labels (fr-CA)
const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

interface DayCell {
  day: number | null
  hasActivity: boolean
  isToday: boolean
}

function buildMonthGrid(year: number, month: number, activeDays: Set<number>): DayCell[] {
  const firstDayOfMonth = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  // Monday-first offset: getDay() 0=Sun,1=Mon..6=Sat -> shift so Mon=0
  let startOffset = firstDayOfMonth.getDay() - 1
  if (startOffset < 0) startOffset = 6

  const cells: DayCell[] = []
  for (let i = 0; i < startOffset; i++) {
    cells.push({ day: null, hasActivity: false, isToday: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      hasActivity: activeDays.has(d),
      isToday:
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === d,
    })
  }
  return cells
}

// Derives activity days from recording createdAt timestamps.
// TODO(BE): replace with /api/users/me/activity-calendar when a dedicated
// endpoint lands (covering lesson study days, not just recording sessions).
function getActiveDays(recordings: RecordingSummary[], year: number, month: number): Set<number> {
  const active = new Set<number>()
  for (const r of recordings) {
    const d = new Date(r.createdAt)
    if (d.getFullYear() === year && d.getMonth() === month) {
      active.add(d.getDate())
    }
  }
  return active
}

type Status = 'loading' | 'ok' | 'error'

export default function CalendarWidget() {
  const [status, setStatus] = useState<Status>('loading')
  const [activeDays, setActiveDays] = useState<Set<number>>(new Set())

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  useEffect(() => {
    api.recordings
      .list()
      .then((recs) => {
        setActiveDays(getActiveDays(recs, year, month))
        setStatus('ok')
      })
      .catch(() => setStatus('error'))
  }, [year, month])

  const monthLabel = new Intl.DateTimeFormat('fr-CA', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month))

  const cells = buildMonthGrid(year, month, activeDays)

  return (
    <section
      data-testid="dashboard-widget-calendar"
      className="ed-card-lift"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 4,
        padding: 'clamp(20px, 2vw, 28px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
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
          textTransform: 'capitalize',
        }}
      >
        {monthLabel}
      </h2>

      {status === 'loading' ? (
        <div className="ed-skeleton" style={{ height: 120, borderRadius: 4 }} />
      ) : status === 'error' ? (
        <p
          data-testid="calendar-error"
          style={{
            fontFamily: SANS_FONT,
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            margin: 0,
          }}
        >
          Calendrier indisponible
        </p>
      ) : (
        <div
          data-testid="calendar-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}
        >
          {WEEKDAY_LABELS.map((label, i) => (
            <div
              key={`wday-${i}`}
              style={{
                textAlign: 'center',
                fontFamily: SANS_FONT,
                fontSize: '0.625rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                paddingBottom: 4,
              }}
            >
              {label}
            </div>
          ))}

          {cells.map((cell, i) => (
            <div
              key={`cell-${i}`}
              data-testid={cell.day ? `calendar-day-${cell.day}` : undefined}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                padding: '2px 0',
              }}
            >
              <span
                style={{
                  fontFamily: SANS_FONT,
                  fontSize: '0.6875rem',
                  fontWeight: cell.isToday ? 700 : 400,
                  color: cell.day
                    ? cell.isToday
                      ? 'var(--text-primary)'
                      : 'var(--text-muted)'
                    : 'transparent',
                  lineHeight: 1,
                }}
              >
                {cell.day ?? ' '}
              </span>
              {cell.hasActivity && (
                <span
                  aria-label="jour actif"
                  style={{
                    display: 'block',
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-primary)',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
