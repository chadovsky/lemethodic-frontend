'use client'

// P-230 — Recent activity. Linear list of last 5 recordings (date / tâche /
// cefr badge). Calendar grid view (GitHub-contribution-graph style)
// deferred to P-230.x — see commit 3 BACKLOG entry.
//
// Static for v1 (no tap-into-recording-detail interaction). Adding tap
// behavior is a polish follow-up.

import type { RecordingSummary } from '@/lib/types'

const INK = '#1A1A1A'
const INK_SOFT = '#1A1A1AB3'
const INK_MUTED = '#1A1A1A66'
const PAPER = '#FFFFFFCC'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

interface RecentActivitySectionProps {
  recordings: RecordingSummary[] | null
}

const TACHE_LABEL: Record<string, string> = {
  tache_1: 'T1',
  tache_2: 'T2',
  tache_3: 'T3',
}

function formatRelativeDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const now = new Date()
  const ms = now.getTime() - d.getTime()
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  if (days < 1) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function RecentActivitySection({
  recordings,
}: RecentActivitySectionProps) {
  // Fetch error → render nothing (other sections may have data).
  if (recordings === null) return null

  return (
    <section aria-label="Recent activity">
      <p
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color: INK_MUTED,
          margin: '0 0 12px',
        }}
      >
        Recent activity
      </p>

      {recordings.length === 0 ? (
        <article
          style={{
            backgroundColor: PAPER,
            borderRadius: 20,
            padding: '20px 22px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          }}
        >
          <p
            style={{
              fontWeight: 500,
              fontSize: 14,
              lineHeight: 1.5,
              color: INK_SOFT,
              margin: 0,
            }}
          >
            No recordings yet. Start your first Tâche.
          </p>
        </article>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            backgroundColor: PAPER,
            borderRadius: 20,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}
        >
          {recordings.slice(0, 5).map((r, i) => (
            <li
              key={r.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderBottom:
                  i < Math.min(recordings.length, 5) - 1
                    ? '1px solid #1A1A1A0F'
                    : 'none',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <TacheBadge tacheMode={r.tacheMode} />
                <span
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 600,
                    fontSize: 14,
                    color: INK,
                  }}
                >
                  {formatRelativeDate(r.createdAt)}
                </span>
              </div>
              {r.cefrLevel && <CefrBadge level={r.cefrLevel} />}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function TacheBadge({ tacheMode }: { tacheMode: string }) {
  const label = TACHE_LABEL[tacheMode] ?? tacheMode
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 24,
        borderRadius: 6,
        backgroundColor: '#1A1A1A0C',
        fontFamily: DISPLAY_FONT,
        fontWeight: 700,
        fontSize: 11,
        color: INK_MUTED,
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  )
}

function CefrBadge({ level }: { level: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 24,
        padding: '0 10px',
        borderRadius: 100,
        backgroundColor: INK,
        color: '#FFFFFF',
        fontFamily: DISPLAY_FONT,
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: '0.04em',
      }}
    >
      {level}
    </span>
  )
}
