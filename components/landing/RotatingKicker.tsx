'use client'

// F-212 — flagship kicker. Sits ABOVE the H1 on landing. Rotates through
// exam names ("TCF / TEF / DELF / DALF") with a vertical-slide swap.
// Pauses on hover (gives users time to read). Honors prefers-reduced-
// motion: shows static "TCF · TEF · DELF · DALF" instead.
//
// Structure: small caps, ed-muted color, Geist 500, letter-spacing 0.05em.
// The prefix ("Prep for" EN / "Préparation" FR) is fixed; the rotating
// word is what changes.

import { useState } from 'react'
import { useRotatingText, ED_DUR, ED_EASE_CSS } from '@/lib/motion'
import type { Lang } from './copy'

const SANS = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'
const ED_MUTED = 'var(--ed-muted)'

const EXAMS = ['TCF', 'TEF', 'DELF', 'DALF'] as const

const PREFIX: Record<Lang, string> = {
  en: 'Prep for',
  fr: 'Préparation',
}

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

  // Reduced-motion: static "TCF · TEF · DELF · DALF" listing.
  if (reduced) {
    return (
      <p
        style={{
          fontFamily: SANS,
          fontWeight: 500,
          // V-001 — bumped from clamp(13px, 1.2vw, 15px) to
          // clamp(20px, 1.8vw, 24px). Tracking + color preserved.
          fontSize: 'clamp(20px, 1.8vw, 24px)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: ED_MUTED,
          margin: 0,
          marginBottom: 'clamp(16px, 2vw, 28px)',
        }}
      >
        {PREFIX[lang]} TCF · TEF · DELF · DALF
      </p>
    )
  }

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
        fontSize: 'clamp(13px, 1.2vw, 15px)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: ED_MUTED,
        margin: 0,
        marginBottom: 'clamp(12px, 1.5vw, 20px)',
        // Shape the rotating slot — fixed height so the H1 below doesn't
        // shift when the word swaps.
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 6,
        outline: 'none',
        // No focus ring on the kicker itself — focus shouldn't dominate
        // visually. Tab still moves through it for keyboard accessibility
        // (pauses rotation while focused).
      }}
      aria-label={`${PREFIX[lang]} ${EXAMS.join(', ')}`}
    >
      <span>{PREFIX[lang]}</span>
      <span
        aria-hidden="true"
        style={{
          // Mask + relative wrapper so the slide stays inside its lane.
          position: 'relative',
          display: 'inline-block',
          minWidth: '4ch',
          height: '1.1em',
          overflow: 'hidden',
        }}
      >
        {/* Two-state crossfade with translateY. Each render only mounts
            one word; the keyed remount gives us the slide-up. */}
        <span
          key={current}
          style={{
            display: 'inline-block',
            position: 'absolute',
            left: 0,
            top: 0,
            animation: `ed-kicker-slide ${ED_DUR.rotateWord}ms ${ED_EASE_CSS} both`,
          }}
        >
          {current}
        </span>
      </span>
      {/* keyframes ed-kicker-slide live in app/globals.css */}
    </p>
  )
}
