'use client'

// M5 Wordmark — "LE MÉTHODIC" animated brand mark.
// Two contexts: size="nav" (static, small) and size="showcase" (animated, large).
//
// Animation layers (showcase only, triggered by IntersectionObserver):
//   1. Typewriter — CSS letter-in stagger, ~70ms/char
//   2. Caret blink — CSS, starts after last letter lands
//   3. Frame draw — WAAPI stroke-dashoffset on two SVG paths, 800ms
//   4. Breathing M — CSS scale+color loop, starts after frame draw
//
// Nav mode: all in final state immediately; caret blinks + M breathes (CSS).
// Reduced motion: all animations stripped; final static state shown.
//
// DESIGN.md §6 is authoritative for the spec.

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

// Mixed-case DOM text → CSS textTransform:uppercase renders "LE MÉTHODIC".
// Preserves test/accessibility compat: textContent = "Le Méthodic".
const WORD = 'Le Méthodic'
const CHARS = [...WORD]
const M_IDX = CHARS.indexOf('M')  // 3

// Timing constants (ms)
const STAGGER_MS     = 70
const LETTER_DUR_MS  = 100
// Last letter lands at: (len-1) × stagger + duration
const TYPEWRITER_END = (CHARS.length - 1) * STAGGER_MS + LETTER_DUR_MS  // ~870ms
const CARET_DELAY_MS = TYPEWRITER_END
const FRAME_DELAY_MS = TYPEWRITER_END + 600   // after ~half a caret blink cycle
const FRAME_DUR_MS   = 800
const BREATHE_DELAY  = FRAME_DELAY_MS + FRAME_DUR_MS  // after frame finishes

// Frame padding (px) around the word — tight for nav, generous for showcase.
const PAD = {
  nav:      { x: 11, y: 5  },
  showcase: { x: 20, y: 12 },
} as const

interface WordmarkProps {
  size?:          'nav' | 'showcase'
  animateReveal?: boolean
  href?:          string
}

export default function Wordmark({
  size          = 'nav',
  animateReveal = false,
  href,
}: WordmarkProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const textRef    = useRef<HTMLSpanElement>(null)
  const svgRef     = useRef<SVGSVGElement>(null)
  const [triggered, setTriggered] = useState(false)
  const [dims,      setDims]      = useState<{ w: number; h: number } | null>(null)

  // Measure the word span (excluding caret) for SVG frame sizing.
  // Re-measures after font-load to handle DM Mono async loading.
  useEffect(() => {
    const measure = () => {
      const el = textRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      if (r.width > 0) setDims({ w: r.width, h: r.height })
    }
    measure()
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(measure)
    }
    window.addEventListener('resize', measure, { passive: true })
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Showcase: IntersectionObserver triggers the animation sequence once.
  useEffect(() => {
    if (!animateReveal || triggered) return
    const el = wrapperRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true)
          io.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [animateReveal, triggered])

  // Frame draw via WAAPI (needs runtime path length — can't use pure CSS keyframe).
  const shouldAnimate = animateReveal && triggered
  useEffect(() => {
    if (!shouldAnimate || !svgRef.current || !dims) return
    const pad  = PAD[size]
    const svgW = dims.w + pad.x * 2
    const svgH = dims.h + pad.y * 2
    const pLen = svgW + svgH

    svgRef.current.querySelectorAll<SVGPathElement>('path').forEach((path) => {
      path.animate(
        [
          { strokeDashoffset: String(pLen) },
          { strokeDashoffset: '0' },
        ],
        {
          duration: FRAME_DUR_MS,
          delay:    FRAME_DELAY_MS,
          easing:   'ease',
          fill:     'forwards',
        }
      )
    })
  }, [shouldAnimate, dims, size])

  const isNav = size === 'nav'
  const pad   = PAD[size]
  const svgW  = dims ? dims.w + pad.x * 2 : 0
  const svgH  = dims ? dims.h + pad.y * 2 : 0
  const pLen  = svgW + svgH

  // Responsive font size per context.
  const fontSize  = isNav ? '1rem' : 'clamp(1.25rem, 2.5vw, 2rem)'
  const tracking  = isNav ? '0.08em' : '0.10em'

  // Per-letter CSS animation string.
  const letterAnim = (i: number): string =>
    `wordmark-letter-in ${LETTER_DUR_MS}ms cubic-bezier(0,0.5,0.25,1) ${i * STAGGER_MS}ms both`

  // M chains letter-in + breathe (both on the same element).
  const mAnim = (i: number): string =>
    `${letterAnim(i)}, wordmark-m-breathe 3600ms ease-in-out ${BREATHE_DELAY}ms infinite`

  const content = (
    <div
      ref={wrapperRef}
      data-testid="wordmark"
      aria-label="Le Méthodic"
      style={{
        position:  'relative',
        display:   'inline-block',
        whiteSpace: 'nowrap',
        // Isolate the breathing-M transform so it doesn't shift the frame.
        isolation: 'isolate',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'baseline' }}>
        {/* Word — measured by textRef for frame sizing */}
        <span
          ref={textRef}
          style={{
            display:       'inline-block',
            fontFamily:    'var(--f-mono)',
            fontWeight:    500,
            fontSize,
            letterSpacing: tracking,
            textTransform: 'uppercase',
            color:         'var(--ink)',
          }}
        >
          {CHARS.map((char, i) => {
            const isM = i === M_IDX

            let anim: string | undefined
            if (shouldAnimate) {
              // Showcase playing: letter entrance + breathing M on the M
              anim = isM ? mAnim(i) : letterAnim(i)
            } else if (!animateReveal && isM) {
              // Nav: only the M has the breathing loop (no letter-in)
              anim = 'wordmark-m-breathe 3600ms ease-in-out 0ms infinite'
            }

            return (
              <span
                key={i}
                data-wm-letter=""
                {...(isM ? { 'data-wm-m': '' } : {})}
                style={{
                  display:   'inline-block',
                  // Pre-animation showcase: letters invisible until IntersectionObserver fires.
                  // Nav + settled showcase: opacity managed by animation fill (or just 1).
                  opacity:   (animateReveal && !triggered) ? 0 : (shouldAnimate ? undefined : 1),
                  animation: anim,
                }}
              >
                {char}
              </span>
            )
          })}
        </span>

        {/* Caret — blinking vermillion cursor */}
        <span
          aria-hidden="true"
          data-wm-caret=""
          style={{
            display:    'inline-block',
            fontFamily: 'var(--f-mono)',
            fontWeight: 500,
            fontSize,
            color:      'var(--accent)',
            marginLeft: '0.05em',
            opacity:    (animateReveal && !triggered) ? 0 : (shouldAnimate ? 0 : 1),
            animation:  shouldAnimate
              ? `wordmark-caret-appear 60ms ease ${CARET_DELAY_MS}ms forwards, wordmark-caret-blink 1000ms step-start ${CARET_DELAY_MS + 60}ms infinite`
              : (!animateReveal ? 'wordmark-caret-blink 1000ms step-start 0ms infinite' : undefined),
          }}
        >
          {'|'}
        </span>
      </span>

      {/* Frame SVG — two paths from top-center, meeting at bottom-center */}
      {dims && svgW > 0 && (
        <svg
          ref={svgRef}
          aria-hidden="true"
          style={{
            position:      'absolute',
            top:           -pad.y,
            left:          -pad.x,
            width:         svgW,
            height:        svgH,
            overflow:      'visible',
            pointerEvents: 'none',
          }}
        >
          {/* Path A: top-center → left edge → bottom-center */}
          <path
            data-wm-path=""
            d={`M ${svgW / 2} 0 L 0 0 L 0 ${svgH} L ${svgW / 2} ${svgH}`}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="1.4"
            strokeLinejoin="miter"
            strokeLinecap="square"
            style={{
              strokeDasharray:  pLen,
              // Showcase: path starts hidden (draws in via WAAPI). Nav: fully visible.
              strokeDashoffset: animateReveal ? pLen : 0,
            }}
          />
          {/* Path B: top-center → right edge → bottom-center */}
          <path
            data-wm-path=""
            d={`M ${svgW / 2} 0 L ${svgW} 0 L ${svgW} ${svgH} L ${svgW / 2} ${svgH}`}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="1.4"
            strokeLinejoin="miter"
            strokeLinecap="square"
            style={{
              strokeDasharray:  pLen,
              strokeDashoffset: animateReveal ? pLen : 0,
            }}
          />
        </svg>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', minHeight: 44 }}>
        {content}
      </Link>
    )
  }
  return content
}
