'use client'

// P-100 Section 3 — Activity timeline (last 14 days, dot calendar).
//
// Two parallel rows of 14 dots each: top row tracks recordings, bottom
// row tracks lesson completions. Today is rightmost; 13 days back is
// leftmost. Empty days = grey, active days = filled. Plain divs — no
// chart library, satisfies P-100's "no new chart libraries" gate.
//
// Day-bucketing uses LOCAL timezone so the calendar matches what the
// user sees on their device clock (a recording at 11pm local on a
// Wednesday counts as Wednesday, not Thursday UTC).

import { useInterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'
import type { Lesson, RecordingSummary } from '@/lib/types'

const INK         = '#1A1A1A'
const INK_SOFT    = '#1A1A1AB3'
const INK_MUTED   = '#1A1A1A66'
const PEACH       = '#FFD8C2'
const SAGE        = '#D4E4D0'
const DOT_EMPTY   = '#1A1A1A14'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

const WINDOW_DAYS = 14
const DOT_SIZE = 12
const DOT_GAP = 6

// Build a YYYY-MM-DD key from an ISO timestamp using the LOCAL clock.
// Backend stores UTC; users perceive their local date.
function localDayKey(timestamp: string): string | null {
  const d = new Date(timestamp)
  if (Number.isNaN(d.getTime())) return null
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// Same shape but for a Date object.
function localDayKeyFromDate(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

interface DayBucket {
  date: Date
  hasRecording: boolean
  hasLesson: boolean
}

function buildBuckets(
  recordings: RecordingSummary[],
  lessons: Lesson[],
): DayBucket[] {
  const recordingDays = new Set<string>()
  for (const r of recordings) {
    const key = localDayKey(r.createdAt)
    if (key) recordingDays.add(key)
  }
  const lessonDays = new Set<string>()
  for (const l of lessons) {
    if (l.status === 'completed' && l.completedAt) {
      const key = localDayKey(l.completedAt)
      if (key) lessonDays.add(key)
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const buckets: DayBucket[] = []
  for (let i = WINDOW_DAYS - 1; i >= 0; i--) {
    const day = new Date(today)
    day.setDate(today.getDate() - i)
    const key = localDayKeyFromDate(day)
    buckets.push({
      date: day,
      hasRecording: recordingDays.has(key),
      hasLesson: lessonDays.has(key),
    })
  }
  return buckets
}

interface Props {
  recordings: RecordingSummary[]
  lessons: Lesson[] | null
}

export default function ActivityTimeline({ recordings, lessons }: Props) {
  const lang = useInterfaceLanguage()
  const buckets = buildBuckets(recordings, lessons ?? [])

  const labels =
    lang === 'fr'
      ? {
          eyebrow: 'Activité',
          subhead: '14 derniers jours.',
          rowRecordings: 'Enregistrements',
          rowLessons: 'Leçons',
        }
      : {
          eyebrow: 'Activity',
          subhead: 'Last 14 days.',
          rowRecordings: 'Recordings',
          rowLessons: 'Lessons',
        }

  return (
    <section
      aria-label={labels.eyebrow}
      style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      <div>
        <p
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: INK_MUTED,
            margin: '0 0 6px',
          }}
        >
          {labels.eyebrow}
        </p>
        <p
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 500,
            fontSize: 13,
            color: INK_SOFT,
            margin: 0,
          }}
        >
          {labels.subhead}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <DotRow
          label={labels.rowRecordings}
          buckets={buckets}
          activeColor={PEACH}
          activeKey="hasRecording"
        />
        <DotRow
          label={labels.rowLessons}
          buckets={buckets}
          activeColor={SAGE}
          activeKey="hasLesson"
        />
      </div>
    </section>
  )
}

interface DotRowProps {
  label: string
  buckets: DayBucket[]
  activeColor: string
  activeKey: 'hasRecording' | 'hasLesson'
}

function DotRow({ label, buckets, activeColor, activeKey }: DotRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 600,
          fontSize: 12,
          color: INK_SOFT,
          width: 96,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: 'flex',
          gap: DOT_GAP,
          flex: 1,
          justifyContent: 'flex-end',
        }}
        role="img"
        aria-label={`${label}: ${buckets.filter((b) => b[activeKey]).length} of ${buckets.length} days`}
      >
        {buckets.map((b) => {
          const active = b[activeKey]
          return (
            <span
              key={b.date.toISOString()}
              aria-hidden="true"
              style={{
                width: DOT_SIZE,
                height: DOT_SIZE,
                borderRadius: '50%',
                backgroundColor: active ? activeColor : DOT_EMPTY,
                border: active ? `1px solid ${INK}24` : 'none',
                flexShrink: 0,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
