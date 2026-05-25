'use client'

// F-212 — flagship kicker. Sits ABOVE the H1 on landing. Rotates through
// exam names ("TCF / TEF / DELF / DALF") with a vertical-slide swap.
// Pauses on hover (gives users time to read). Honors prefers-reduced-
// motion: shows static "TCF · TEF · DELF · DALF" instead.
//
// V-016d revisions:
// - Font size bumped clamp(20-24) → clamp(24-32)
// - Color split: prefix in ed-fg-soft, exam name in warm-peach-deep
// - Spring-eased slide (200ms) replaces ED_EASE_CSS 600ms
// - Continuous infinite loop preserved (useRotatingText cycles forever)

import { useState } from 'react'
import { useRotatingText, ED_EASE_SPRING_CSS } from '@/lib/motion'
import type { Lang } from './copy'

const SANS = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'
const ED_FG_SOFT = 'var(--lm-text-secondary)'
const ED_WARM_PEACH_DEEP = 'var(--lm-warm-peach-deep)'

const EXAMS = ['TCF', 'TEF', 'DELF', 'DALF'] as const

const PREFIX: Record<Lang, string> = {
  en: 'Prep for',
  fr: 'Préparation',
}

// V-016d — kicker sizing + spacing tokens, hoisted so reduced-motion
// fallback and active branch share one source of truth.
const KICKER_FONT_SIZE = 'clamp(24px, 2.5vw, 32px)'
const KICKER_MARGIN_BOTTOM = 'clamp(20px, 2.4vw, 32px)'
const KICKER_LETTER_SPACING = '0.06em'

interface RotatingKickerProps {
  lang: Lang
}

export default function RotatingKicker({ lang }: RotatingKickerProps) {
  const [hovered, setHovered] = useState(false)
  const { current, reduced } = useRotatingText({
    words: [...EXAMS],
    intervalMs: 2500,
    pause: hovered,
  })

  // Reduced-motion: static "TCF · TEF · DELF · DALF" listing. Prefix in
  // ed-fg-soft + exam list in warm-peach-deep keeps the V-016d color
  // split for accessibility users.
  if (reduced) {
    return (
      <p
        style={{
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: KICKER_FONT_SIZE,
          letterSpacing: KICKER_LETTER_SPACING,
          textTransform: 'uppercase',
          margin: 0,
          marginBottom: KICKER_MARGIN_BOTTOM,
        }}
      >
        <span style={{ color: ED_FG_SOFT }}>{PREFIX[lang]}</span>{' '}
        <span style={{ color: ED_WARM_PEACH_DEEP }}>TCF · TEF · DELF · DALF</span>
      </p>
    )
  }

  // V-006 — find the widest exam by character count to use as the layout
  // sizer. Length is a sufficient proxy here (DELF/DALF tie at 4 chars;
  // both are wider than TCF/TEF). The chosen word is rendered invisibly
  // behind the visible animated word so the container width locks to the
  // widest case and 4-char words never clip.
  const widestExam = EXAMS.reduce((a, b) => (b.length > a.length ? b : a))

  return (
    <p
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
      style={{
        fontFamily: SANS,
        fontWeight: 500,
        fontSize: KICKER_FONT_SIZE,
        letterSpacing: KICKER_LETTER_SPACING,
        textTransform: 'uppercase',
        margin: 0,
        marginBottom: KICKER_MARGIN_BOTTOM,
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 8,
        outline: 'none',
      }}
      aria-label={`${PREFIX[lang]} ${EXAMS.join(', ')}`}
    >
      {/* V-016d — prefix in soft-warm-dark; exam name in warm-peach-deep. */}
      <span style={{ color: ED_FG_SOFT }}>{PREFIX[lang]}</span>
      <span
        aria-hidden="true"
        style={{
          // V-006 — width locked by invisible sizer (widest exam name).
          position: 'relative',
          display: 'inline-block',
          height: '1.1em',
          overflow: 'hidden',
          textAlign: 'center',
          color: ED_WARM_PEACH_DEEP,
        }}
      >
        <span style={{ visibility: 'hidden' }}>{widestExam}</span>
        {/* V-016d — keyed remount triggers ed-kicker-slide on every word
            change. Spring-eased 200ms (replaces F-212's 600ms ed-ease)
            for a tighter rotation rhythm per spec. */}
        <span
          key={current}
          style={{
            display: 'block',
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            animation: `ed-kicker-slide 200ms ${ED_EASE_SPRING_CSS} both`,
          }}
        >
          {current}
        </span>
      </span>
    </p>
  )
}
