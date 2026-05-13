'use client'

import { motion, useReducedMotion } from 'framer-motion'
import {
  staggerDiagnosticRow,
  durationDiagnosticReveal,
  durationBase,
  easeFpEnter,
} from '@/lib/motion'

// ─── design tokens (self-contained) ─────────────────────────────────────────
const INK          = 'var(--text-primary)'
const INK_MUTED    = 'var(--text-muted)'
const SAGE         = 'var(--fp-sage)'
const TRACK        = 'var(--fp-track)'
const DISPLAY_FONT = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'

// ─── types ───────────────────────────────────────────────────────────────────
// V-009 — `unscored` flag for the La Voix placeholder row. BE doesn't
// score Voice today; consumers append an unscored row at the bottom of
// the bars list with name + "Coming soon" badge instead of bar+score.
interface CoucheRow {
  name: string
  score: number
  cefr: string
  unscored?: boolean
}

interface Props {
  rows?: CoucheRow[]
}

// ─── default mock data — sorted ascending (worst first) ──────────────────────
// V-009 — extended to 5 brand-label rows (Aisance / Cohérence / Correction /
// Étendue / Voix). Voix is unscored ("Coming soon" placeholder) until
// V-009.be lands BE-side scoring.
const DEFAULT_ROWS: CoucheRow[] = [
  { name: 'Aisance',    score: 45, cefr: 'A2' },
  { name: 'Cohérence',  score: 62, cefr: 'B2' },
  { name: 'Correction', score: 71, cefr: 'B2' },
  { name: 'Étendue',    score: 78, cefr: 'C1' },
  { name: 'Voix',       score: 0,  cefr: '',   unscored: true },
]

// ─── target band constants ────────────────────────────────────────────────────
const BAND_LO = 70  // % of bar width
const BAND_HI = 85  // % of bar width

// ─── single bar row ───────────────────────────────────────────────────────────
function CoucheBarRow({ name, score, cefr, unscored, index, animate }: CoucheRow & { index: number; animate: boolean }) {
  const scorePct = `${score}%`
  const bandLoPct = `${BAND_LO}%`
  const bandWidthPct = `${BAND_HI - BAND_LO}%`
  const rowDelay = animate ? index * staggerDiagnosticRow : 0
  const initial = animate ? { opacity: 0 } : false
  const fillInitial = animate ? { width: 0 } : false
  const dotInitial = animate ? { left: '0%', opacity: 0 } : false

  return (
    <motion.div
      initial={initial}
      animate={{ opacity: 1 }}
      transition={{ delay: rowDelay, duration: durationDiagnosticReveal, ease: easeFpEnter }}
      style={{ display: 'flex', alignItems: 'center', gap: 12 }}
    >

      {/* LEFT — layer name */}
      <div style={{ width: '35%', flexShrink: 0 }}>
        <span
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 500,
            fontSize: 14,
            color: unscored ? INK_MUTED : INK,
            lineHeight: '20px',
            wordBreak: 'break-word' as const,
          }}
        >
          {name}
        </span>
      </div>

      {/* CENTER — bar track. V-009: unscored rows render only the empty
          track (no fill, no dot, no target band) to signal "not yet
          scored". The track stays for layout symmetry with scored rows. */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          height: 12,
          borderRadius: 999,
          backgroundColor: TRACK,
          overflow: 'hidden',
          opacity: unscored ? 0.5 : 1,
        }}
        role="img"
        aria-label={unscored ? `${name}: not yet scored` : `${name}: ${score} out of 100`}
      >
        {!unscored && (
          <>
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
                opacity: 0.85,
              }}
            />

            {/* User fill — solid black, from 0 to score */}
            <motion.div
              aria-hidden="true"
              initial={fillInitial}
              animate={{ width: scorePct }}
              transition={{ delay: rowDelay, duration: durationDiagnosticReveal, ease: easeFpEnter }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                backgroundColor: INK,
                borderRadius: 999,
              }}
            />

            {/* Score dot marker — sits at right edge of fill */}
            <motion.div
              aria-hidden="true"
              initial={dotInitial}
              animate={{ left: scorePct, opacity: 1 }}
              transition={{ delay: rowDelay, duration: durationDiagnosticReveal, ease: easeFpEnter }}
              style={{
                position: 'absolute',
                top: '50%',
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
          </>
        )}
      </div>

      {/* RIGHT — score + CEFR (or "Coming soon" badge when unscored) */}
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
        {unscored ? (
          <span
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 500,
              fontSize: 10,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: INK_MUTED,
              lineHeight: 1.2,
            }}
          >
            Coming soon
          </span>
        ) : (
          <>
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
          </>
        )}
      </div>

    </motion.div>
  )
}

// ─── main export ──────────────────────────────────────────────────────────────
export default function CouchesDiagnostic({ rows = DEFAULT_ROWS }: Props) {
  const reduceMotion = useReducedMotion()
  const animate = !reduceMotion
  // Bottleneck appears after all bars settle:
  // (rows-1) * stagger + bar duration, plus a small grace gap.
  const bottleneckDelay = animate
    ? Math.max(0, rows.length - 1) * staggerDiagnosticRow + durationDiagnosticReveal + 0.1
    : 0

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
        {rows.map((row, i) => (
          <CoucheBarRow key={row.name} {...row} index={i} animate={animate} />
        ))}
      </div>

      {/* Bottleneck note */}
      <motion.p
        initial={animate ? { opacity: 0, y: 4 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: bottleneckDelay, duration: durationBase, ease: easeFpEnter }}
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
      </motion.p>

    </div>
  )
}
