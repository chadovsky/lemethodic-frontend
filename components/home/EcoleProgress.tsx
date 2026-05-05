'use client'

import { Check } from 'lucide-react'

// ─── design tokens ───────────────────────────────────────────────────────────
const INK        = '#1A1A1A'
const INK_MUTED  = '#1A1A1A66'
const CTA_BG     = '#1A1A1A'
const DISPLAY_FONT = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'

interface Milestone {
  label: string
  range: string       // e.g. "Lessons 1–4"
  minLesson: number
  maxLesson: number
}

// F-087 — milestones rebalanced to the 27-lesson curriculum:
//   - Fondations (1-4): unchanged
//   - Approfondissement (5-16): celebrates ENTERING Phase 2 (the
//     "Approfondissement" curriculum phase begins at lesson 17, so the
//     badge earned at lesson 16 marks the transition)
//   - L'École Complète (17-27): full-curriculum completion
// Earlier "Mécaniques" + "Raccourci Complet" splits replaced.
const MILESTONES: Milestone[] = [
  { label: 'Fondations',          range: 'Lessons 1–4',   minLesson: 1,  maxLesson: 4  },
  { label: 'Approfondissement',   range: 'Lessons 5–16',  minLesson: 5,  maxLesson: 16 },
  { label: "L'École Complète",    range: 'Lessons 17–27', minLesson: 17, maxLesson: 27 },
]

interface EcoleProgressProps {
  completedCount: number   // 0–27
  totalCount: number       // 27 post-F-087 (was 16 pre-curriculum-expansion)
}

export default function EcoleProgress({
  completedCount,
  totalCount,
}: EcoleProgressProps) {
  const pct = Math.round((completedCount / totalCount) * 100)

  return (
    <div>
      {/* Section label */}
      <p
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          color: INK_MUTED,
          margin: 0,
          marginBottom: 6,
        }}
      >
        L'École
      </p>

      {/* Subtitle */}
      <h3
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 20,
          color: INK,
          margin: 0,
          marginBottom: 16,
        }}
      >
        Your path to B2
      </h3>

      {/* Progress bar + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div
          style={{
            flex: 1,
            height: 14,
            borderRadius: 100,
            backgroundColor: '#1A1A1A12',
            overflow: 'hidden',
          }}
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={totalCount}
          aria-label={`${completedCount} of ${totalCount} lessons complete`}
        >
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              backgroundColor: CTA_BG,
              borderRadius: 100,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
        <span
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: 13,
            color: INK,
            whiteSpace: 'nowrap',
          }}
        >
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* Milestone badges */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
        {MILESTONES.map((m) => {
          const reached = completedCount >= m.maxLesson
          const inRange = completedCount >= m.minLesson && completedCount < m.maxLesson

          return (
            <div
              key={m.label}
              style={{
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                gap: 3,
                padding: '8px 12px',
                borderRadius: 12,
                backgroundColor: reached ? CTA_BG : '#1A1A1A0C',
                border: inRange ? `1.5px solid ${CTA_BG}` : '1.5px solid transparent',
                transition: 'background-color 0.2s',
                flex: 1,
                minWidth: 0,
              }}
              aria-label={reached ? `${m.label} complete` : m.label}
            >
              {reached && (
                <Check size={12} strokeWidth={3} color="#FFFFFF" />
              )}
              <span
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 11,
                  color: reached ? '#FFFFFF' : INK_MUTED,
                  textAlign: 'center' as const,
                  lineHeight: '14px',
                }}
              >
                {m.label}
              </span>
              <span
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 500,
                  fontSize: 10,
                  color: reached ? '#FFFFFF99' : INK_MUTED,
                  letterSpacing: '0.02em',
                }}
              >
                {m.range}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
