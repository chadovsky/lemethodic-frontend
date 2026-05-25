'use client'

// F-VISUAL-001 X.4.4 — bottleneck card staggers in after the 4 couche
// bars finish their 925ms reveal sequence (bar fill 700ms + 3×75ms
// stagger). Delay set to 1.0s so the goulet arrives AFTER the bars
// have settled, completing the "diagnostic results reveal" beat.
// Framer Motion respects prefers-reduced-motion automatically.

import { motion } from 'framer-motion'
import { duration, ease } from '@/lib/motion'

const INK          = 'var(--text-primary)'
const INK_SOFT     = 'var(--text-secondary)'
const INK_MUTED    = 'var(--text-muted)'
const PEACH        = 'var(--fp-peach)'
const DISPLAY_FONT = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'

interface Props {
  layer: string
  score: number
  band: string
  estimatedGain: number
  body: string
}

export default function GouletCard({ layer, score, band, estimatedGain, body }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.slow, ease: ease.out, delay: 1.0 }}
      style={{
        backgroundColor: PEACH,
        borderRadius: 24,
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Label */}
      <p
        style={{
          margin: 0,
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: INK_MUTED,
        }}
      >
        Le Goulet · Your Bottleneck
      </p>

      {/* Heading */}
      <h2
        style={{
          margin: 0,
          fontFamily: DISPLAY_FONT,
          fontWeight: 800,
          fontSize: 22,
          color: INK,
          lineHeight: 1.2,
        }}
      >
        {layer}
      </h2>

      {/* Body */}
      <p
        style={{
          margin: 0,
          fontFamily: DISPLAY_FONT,
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '22px',
          color: INK_SOFT,
        }}
      >
        {body}
      </p>

      {/* Inline metric */}
      <div
        style={{
          marginTop: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: 'rgba(255,255,255,0.45)',
          borderRadius: 100,
          padding: '8px 16px',
          alignSelf: 'flex-start',
        }}
      >
        {/* Up arrow */}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M7 12V2M7 2L3 6M7 2L11 6"
            stroke={INK}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 600,
            fontSize: 13,
            color: INK,
            whiteSpace: 'nowrap',
          }}
        >
          Estimated +{estimatedGain} TCF points if you close this gap
        </span>
      </div>
    </motion.div>
  )
}
