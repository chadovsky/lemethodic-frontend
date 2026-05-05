'use client'

const INK          = '#1A1A1A'
const INK_SOFT     = '#1A1A1AB3'
const INK_MUTED    = '#1A1A1A66'
const DISPLAY_FONT = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'

interface Props {
  number: string   // '01', '02', '03'
  title: string
  description: string
  duration: string // '10 min'
  onStart?: () => void
}

export default function OrdonnanceExerciseCard({
  number,
  title,
  description,
  duration,
  onStart,
}: Props) {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #1A1A1A12',
        borderRadius: 16,
        padding: '16px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {/* Top row: badge + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Number badge */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#1A1A1A0F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 800,
              fontSize: 11,
              color: INK,
              letterSpacing: '0.04em',
            }}
          >
            {number}
          </span>
        </div>
        <span
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: 15,
            color: INK,
            flex: 1,
          }}
        >
          {title}
        </span>
      </div>

      {/* Description */}
      <p
        style={{
          margin: 0,
          fontFamily: DISPLAY_FONT,
          fontWeight: 500,
          fontSize: 13,
          lineHeight: '20px',
          color: INK_SOFT,
        }}
      >
        {description}
      </p>

      {/* Footer: duration + start button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 2,
        }}
      >
        <span
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 500,
            fontSize: 12,
            color: INK_MUTED,
          }}
        >
          {duration}
        </span>
        <button
          onClick={onStart}
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: 13,
            color: INK,
            backgroundColor: 'transparent',
            border: `1.5px solid ${INK}`,
            borderRadius: 100,
            padding: '6px 18px',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            transition: 'opacity 0.15s',
          }}
        >
          Start
        </button>
      </div>
    </div>
  )
}
