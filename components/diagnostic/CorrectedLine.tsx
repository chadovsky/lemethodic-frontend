'use client'

const INK          = '#1A1A1A'
const INK_SOFT     = '#1A1A1AB3'
const INK_MUTED    = '#1A1A1A66'
const SAGE         = '#D4E4D0'
const DISPLAY_FONT = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'

export interface Correction {
  wrong: string
  right: string
}

interface Segment {
  text?: string           // plain text
  correction?: Correction // inline correction
}

interface Props {
  segments: Segment[]
  coachingNote?: string   // shown in Le Diagnostic complet view
  showCoaching?: boolean
}

export default function CorrectedLine({ segments, coachingNote, showCoaching = false }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* The sentence with inline corrections */}
      <p
        style={{
          margin: 0,
          fontFamily: DISPLAY_FONT,
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '22px',
          color: INK,
        }}
      >
        {segments.map((seg, i) => {
          if (seg.text) {
            return <span key={i}>{seg.text}</span>
          }
          if (seg.correction) {
            return (
              <span key={i} style={{ display: 'inline' }}>
                {/* Wrong word — red strikethrough */}
                <span
                  style={{
                    textDecoration: 'line-through',
                    color: '#C0392B',
                    fontWeight: 600,
                  }}
                >
                  {seg.correction.wrong}
                </span>
                {/* Arrow */}
                <span style={{ color: INK_MUTED, margin: '0 3px', fontSize: 12 }}>→</span>
                {/* Correct word — sage pill */}
                <span
                  style={{
                    backgroundColor: SAGE,
                    borderRadius: 6,
                    padding: '1px 6px',
                    fontWeight: 700,
                    color: INK,
                    fontSize: 13,
                  }}
                >
                  {seg.correction.right}
                </span>
              </span>
            )
          }
          return null
        })}
      </p>

      {/* Coaching note — shown only in diagnostic view */}
      {showCoaching && coachingNote && (
        <p
          style={{
            margin: 0,
            fontFamily: DISPLAY_FONT,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 12,
            lineHeight: '18px',
            color: INK_MUTED,
            paddingLeft: 2,
          }}
        >
          {coachingNote}
        </p>
      )}
    </div>
  )
}
