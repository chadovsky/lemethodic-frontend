'use client'

// ─── design tokens (self-contained) ─────────────────────────────────────────
const INK          = '#1A1A1A'
const INK_MUTED    = '#1A1A1A66'
const SAGE         = '#D4E4D0'
const TRACK        = 'var(--fp-track)'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

// ─── types ───────────────────────────────────────────────────────────────────
interface CoucheRow {
  name: string
  score: number
  cefr: string
}

interface Props {
  rows?: CoucheRow[]
}

// ─── default mock data — sorted ascending (worst first) ──────────────────────
// F-088 — labels now match the TCF criteria the backend exposes via
// `display_label_*`. Demo mode (no real diagnostic) falls back to
// these so the visual matches a real session's bar names.
const DEFAULT_ROWS: CoucheRow[] = [
  { name: 'Aisance',    score: 45, cefr: 'A2' },
  { name: 'Cohérence',  score: 62, cefr: 'B2' },
  { name: 'Correction', score: 71, cefr: 'B2' },
  { name: 'Étendue',    score: 78, cefr: 'C1' },
]

// ─── target band constants ────────────────────────────────────────────────────
const BAND_LO = 70  // % of bar width
const BAND_HI = 85  // % of bar width

// ─── single bar row ───────────────────────────────────────────────────────────
function CoucheBarRow({ name, score, cefr }: CoucheRow) {
  const scorePct = `${score}%`
  const bandLoPct = `${BAND_LO}%`
  const bandWidthPct = `${BAND_HI - BAND_LO}%`

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

      {/* LEFT — layer name */}
      <div style={{ width: '35%', flexShrink: 0 }}>
        <span
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 500,
            fontSize: 14,
            color: INK,
            lineHeight: '20px',
            wordBreak: 'break-word' as const,
          }}
        >
          {name}
        </span>
      </div>

      {/* CENTER — bar track */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          height: 12,
          borderRadius: 999,
          backgroundColor: TRACK,
          overflow: 'hidden',
        }}
        role="img"
        aria-label={`${name}: ${score} out of 100`}
      >
        {/* Target band — sage fill between 70% and 85% */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: bandLoPct,
            width: bandWidthPct,
            height: '100%',
            backgroundColor: SAGE,
            opacity: 0.85, // sage at 40% of a lighter value — renders ~35% on white
          }}
        />

        {/* User fill — solid black, from 0 to score */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: scorePct,
            height: '100%',
            backgroundColor: INK,
            borderRadius: 999,
          }}
        />

        {/* Score dot marker — sits at right edge of fill */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: scorePct,
            transform: 'translate(-50%, -50%)',
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: INK,
            border: '2px solid var(--fp-canvas)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
            zIndex: 2,
          }}
        />
      </div>

      {/* RIGHT — score + CEFR */}
      <div
        style={{
          width: '15%',
          flexShrink: 0,
          textAlign: 'right',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 1,
        }}
      >
        <span
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 600,
            fontSize: 15,
            color: INK,
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 500,
            fontSize: 11,
            color: INK_MUTED,
            lineHeight: 1,
          }}
        >
          {cefr}
        </span>
      </div>

    </div>
  )
}

// ─── main export ──────────────────────────────────────────────────────────────
export default function CouchesDiagnostic({ rows = DEFAULT_ROWS }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Inline legend note */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Sage swatch */}
        <div
          aria-hidden="true"
          style={{
            width: 12,
            height: 12,
            borderRadius: 3,
            backgroundColor: SAGE,
            flexShrink: 0,
            border: '1px solid #1A1A1A18',
          }}
        />
        <span
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 500,
            fontSize: 12,
            color: INK_MUTED,
          }}
        >
          Target band: 70–85 (TCF C1 zone)
        </span>
      </div>

      {/* Bar rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {rows.map((row) => (
          <CoucheBarRow key={row.name} {...row} />
        ))}
      </div>

      {/* Bottleneck note */}
      <p
        style={{
          margin: 0,
          fontFamily: DISPLAY_FONT,
          fontWeight: 500,
          fontSize: 13,
          color: INK_MUTED,
          lineHeight: '20px',
        }}
      >
        Your bottleneck is the top row. Fix it first.
      </p>

    </div>
  )
}
