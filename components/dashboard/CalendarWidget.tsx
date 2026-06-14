'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { ActivityCalendar, ActivityCalendarDay } from '@/lib/types'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

// ── Date helpers ────────────────────────────────────────────────────────────

// Returns "YYYY-MM-DD" in local time — avoids UTC offset bugs when comparing
// to API day strings (which are also local-date strings from the BE).
function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ── Heatmap helpers ─────────────────────────────────────────────────────────

// 5-level intensity: 0 = empty, 1 = low … 4 = full
function countToLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 9) return 3
  return 4
}

// Heatmap intensity ramp — graduated slate tints routed through --dominant via
// color-mix (F-454 ext), so the ramp flows through v3 tokens in both modes.
const HEATMAP_BG: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'var(--ink-trace)',
  1: 'color-mix(in srgb, var(--dominant) 18%, transparent)',
  2: 'color-mix(in srgb, var(--dominant) 38%, transparent)',
  3: 'color-mix(in srgb, var(--dominant) 62%, transparent)',
  4: 'var(--dominant)',
}

// Build a grid: 7 rows (Mon=0 … Sun=6) × N week-columns.
// Returns cells oldest→newest; each cell is one of:
//   - null (padding before first real day)
//   - an ActivityCalendarDay
interface GridCell {
  day: ActivityCalendarDay | null
  isToday: boolean
}

function buildGrid(days: ActivityCalendarDay[]): GridCell[][] {
  if (days.length === 0) return []

  // Sort oldest first for safety
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date))

  const todayStr = localDateStr(new Date())

  // Map date → day data
  const byDate = new Map<string, ActivityCalendarDay>()
  for (const d of sorted) byDate.set(d.date, d)

  // Determine the full date range to display.
  // Start = first Monday on or before the first day in the array.
  const firstDate = new Date(sorted[0].date + 'T00:00:00')
  // getDay(): 0=Sun … 6=Sat. Monday-first offset:
  let dow = firstDate.getDay()
  // Convert to Mon=0 … Sun=6
  dow = (dow + 6) % 7
  // Rewind to the Monday of that week
  const gridStart = new Date(firstDate)
  gridStart.setDate(gridStart.getDate() - dow)

  const lastDate = new Date(sorted[sorted.length - 1].date + 'T00:00:00')

  // Total days in grid (from gridStart to lastDate inclusive)
  const totalDays = Math.round((lastDate.getTime() - gridStart.getTime()) / 86400000) + 1
  const totalCols = Math.ceil(totalDays / 7)

  // Build columns (each column = one week)
  const columns: GridCell[][] = []
  for (let col = 0; col < totalCols; col++) {
    const weekCells: GridCell[] = []
    for (let row = 0; row < 7; row++) {
      const d = new Date(gridStart)
      d.setDate(gridStart.getDate() + col * 7 + row)
      const dateStr = localDateStr(d)
      const dayData = byDate.get(dateStr) ?? null
      // Only include cells up to lastDate; pad future days in last week as null
      if (d > lastDate) {
        weekCells.push({ day: null, isToday: false })
      } else {
        weekCells.push({
          day: dayData,
          isToday: dateStr === todayStr,
        })
      }
    }
    columns.push(weekCells)
  }

  return columns
}

// Row-day labels: Mon … Sun abbreviated in French
const ROW_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

// ── Component ────────────────────────────────────────────────────────────────

type Status = 'loading' | 'ok' | 'error'

export default function CalendarWidget() {
  const [status, setStatus] = useState<Status>('loading')
  const [data, setData] = useState<ActivityCalendar | null>(null)

  useEffect(() => {
    api.users
      .getActivityCalendar(90)
      .then((cal) => {
        setData(cal)
        setStatus('ok')
      })
      .catch(() => setStatus('error'))
  }, [])

  const columns = data ? buildGrid(data.days) : []
  const todayPct =
    data && data.todayTarget > 0
      ? Math.min(100, Math.round((data.todayCount / data.todayTarget) * 100))
      : 0

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
        }}
      >
        Activité
      </h2>

      {status === 'loading' ? (
        <div className="ed-skeleton" style={{ height: 140, borderRadius: 4 }} />
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
        <>
          {/* ── Streak stats ─────────────────────────────────────── */}
          <div
            data-testid="calendar-streak-row"
            style={{ display: 'flex', gap: 24 }}
          >
            <StreakStat
              testId="calendar-current-streak"
              label="Série actuelle"
              value={data!.currentStreak}
              unit={data!.currentStreak === 1 ? 'jour' : 'jours'}
            />
            <StreakStat
              testId="calendar-longest-streak"
              label="Record"
              value={data!.longestStreak}
              unit={data!.longestStreak === 1 ? 'jour' : 'jours'}
            />
          </div>

          {/* ── Today-vs-target bar ──────────────────────────────── */}
          <div
            data-testid="calendar-today-bar"
            style={{ display: 'flex', flexDirection: 'column', gap: 5 }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <span
                style={{
                  fontFamily: SANS_FONT,
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}
              >
                Aujourd&apos;hui
              </span>
              <span
                data-testid="calendar-today-count"
                style={{
                  fontFamily: SANS_FONT,
                  fontSize: '0.6875rem',
                  color: 'var(--text-muted)',
                }}
              >
                {data!.todayCount} / {data!.todayTarget} min
              </span>
            </div>
            <div
              style={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'var(--ink-trace)',
                overflow: 'hidden',
              }}
            >
              <div
                data-testid="calendar-today-bar-fill"
                style={{
                  height: '100%',
                  width: `${todayPct}%`,
                  borderRadius: 3,
                  backgroundColor:
                    todayPct >= 100 ? 'var(--accent)' : 'var(--dominant)',
                  transition: 'width 400ms var(--ed-ease)',
                }}
              />
            </div>
          </div>

          {/* ── 90-day heatmap ───────────────────────────────────── */}
          {columns.length > 0 && (
            <div
              data-testid="calendar-grid"
              style={{ overflowX: 'auto', paddingBottom: 2 }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 3,
                  minWidth: 'min-content',
                  alignItems: 'flex-start',
                }}
              >
                {/* Row-day labels column */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    paddingTop: 0,
                    flexShrink: 0,
                  }}
                >
                  {ROW_LABELS.map((label, i) => (
                    <div
                      key={`row-${i}`}
                      style={{
                        width: 10,
                        height: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        fontFamily: SANS_FONT,
                        fontSize: '0.5625rem',
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        color: 'var(--text-muted)',
                        flexShrink: 0,
                      }}
                    >
                      {i % 2 === 0 ? label : ''}
                    </div>
                  ))}
                </div>

                {/* Week columns */}
                {columns.map((week, colIdx) => (
                  <div
                    key={`week-${colIdx}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      flexShrink: 0,
                    }}
                  >
                    {week.map((cell, rowIdx) => {
                      if (cell.day === null && !cell.isToday) {
                        return (
                          <div
                            key={`cell-${colIdx}-${rowIdx}`}
                            style={{ width: 10, height: 10 }}
                          />
                        )
                      }
                      const level = cell.day ? countToLevel(cell.day.count) : 0
                      const bg = HEATMAP_BG[level]
                      const targetMet = cell.day?.targetMet ?? false
                      return (
                        <div
                          key={`cell-${colIdx}-${rowIdx}`}
                          data-testid={
                            cell.isToday ? 'calendar-cell-today' : undefined
                          }
                          aria-label={
                            cell.day
                              ? `${cell.day.date}: ${cell.day.count} min${targetMet ? ', objectif atteint' : ''}`
                              : undefined
                          }
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            backgroundColor: bg,
                            outline: targetMet
                              ? '1.5px solid var(--accent)'
                              : cell.isToday
                                ? '1.5px solid var(--dominant)'
                                : 'none',
                            outlineOffset: targetMet || cell.isToday ? '0px' : undefined,
                            flexShrink: 0,
                          }}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StreakStat({
  testId,
  label,
  value,
  unit,
}: {
  testId: string
  label: string
  value: number
  unit: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span
        style={{
          fontFamily: SANS_FONT,
          fontSize: '0.6875rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        {label}
      </span>
      <span
        data-testid={testId}
        style={{
          fontFamily: SERIF_FONT,
          fontWeight: 500,
          fontSize: 'clamp(22px, 2.5vw, 30px)',
          lineHeight: 1,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: SANS_FONT,
          fontSize: '0.6875rem',
          color: 'var(--text-muted)',
        }}
      >
        {unit}
      </span>
    </div>
  )
}
