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
        // V-001 — kicker bumped to clamp(20px, 1.8vw, 24px); marginBottom
        // proportional. Earlier V-001 edit only caught the reduced-motion
        // branch due to an indentation mismatch; V-006 brings the active
        // branch into line.
        fontSize: 'clamp(20px, 1.8vw, 24px)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: ED_MUTED,
        margin: 0,
        marginBottom: 'clamp(16px, 2vw, 28px)',
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
          // V-006 — width is locked by the invisible sizer (the widest
          // exam name). Container always sizes to widest case so 4-char
          // names never clip on right edge. textAlign:center keeps the
          // 3-char names visually balanced inside the 4-char slot.
          position: 'relative',
          display: 'inline-block',
          height: '1.1em',
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        {/* Width sizer — invisible widest word locks container width. */}
        <span style={{ visibility: 'hidden' }}>{widestExam}</span>
        {/* Visible animated word — absolute over the sizer. The keyed
            remount triggers ed-kicker-slide on every word change. */}
        <span
          key={current}
          style={{
            display: 'block',
            position: 'absolute',
            left: 0,
            right: 0,
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
