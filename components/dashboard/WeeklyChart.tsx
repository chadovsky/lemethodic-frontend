'use client'

import { SANS_FONT } from '@/lib/typography'
import type { ActivityCalendarDay } from '@/lib/types'

// F-464 — right-rail weekly progress chart. Seven bars from the most recent
// week of real activity-calendar days (minutes per day). A day that met its
// target is coral (--accent); the rest use the slate chart token (--dominant).
// No fabricated values: the parent only renders this when the calendar resolved.

// French single-letter weekday initials, Monday-first (matches CalendarWidget).
const DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

function dowIndex(dateStr: string): number {
  // getDay(): 0=Sun..6=Sat -> Mon=0..Sun=6
  const d = new Date(dateStr + 'T00:00:00')
  return (d.getDay() + 6) % 7
}

export default function WeeklyChart({ days, target }: { days: ActivityCalendarDay[]; target: number }) {
  // Take the last 7 days (oldest -> newest).
  const week = [...days].sort((a, b) => a.date.localeCompare(b.date)).slice(-7)
  const max = Math.max(target, ...week.map((d) => d.count), 1)
  const totalWeek = week.reduce((sum, d) => sum + d.count, 0)

  return (
    <section
      data-testid="dashboard-weekly-chart"
      aria-label="Progression de la semaine"
      className="ed-card-lift"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 'var(--r-lg)',
        padding: 'clamp(16px, 1.8vw, 22px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <h3 style={{ fontFamily: SANS_FONT, fontWeight: 600, fontSize: '0.8125rem', letterSpacing: '0.02em', color: 'var(--heading)', margin: 0 }}>
          Cette semaine
        </h3>
        <span style={{ fontFamily: SANS_FONT, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {totalWeek} min
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6, height: 88 }}>
        {week.map((d) => {
          const h = Math.max(3, Math.round((d.count / max) * 72))
          return (
            <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <div
                data-testid="weekly-bar"
                data-target-met={d.targetMet ? 'true' : 'false'}
                aria-label={`${d.date}: ${d.count} min${d.targetMet ? ', objectif atteint' : ''}`}
                style={{
                  width: '100%',
                  maxWidth: 18,
                  height: h,
                  borderRadius: 3,
                  backgroundColor: d.targetMet ? 'var(--accent)' : 'var(--dominant)',
                }}
              />
              <span aria-hidden="true" style={{ fontFamily: SANS_FONT, fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {DOW[dowIndex(d.date)]}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
