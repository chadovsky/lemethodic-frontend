'use client'

// V-003 — atmospheric SVG-style typographic background for landing hero.
// 5 French accent characters rendered as massive Fraunces glyphs at very
// low opacity, drifting slowly with subtle rotation. Parallax binds them
// to scroll at 0.2x speed for the duration the hero is in viewport.
//
// All animation is CSS-driven (keyframes in globals.css). Parallax is
// JS-driven via a single rAF-throttled scroll listener and IntersectionObserver
// gate so the listener only runs while hero is on screen.
//
// prefers-reduced-motion: drift animation gated in CSS; parallax also
// disabled (effectiveScrollY stays at 0). Static state shows the
// characters in their initial positions.

import { useEffect, useRef, useState } from 'react'

// 5 characters distributed across 5 positional slots. Numbering matches
// the .hero-atmosphere-char-N CSS rules in globals.css.
const ATMOSPHERE_CHARS = ['é', 'à', 'ç', 'ô', 'î'] as const

export default function HeroAtmosphere() {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const [reduced, setReduced] = useState(false)

  // Detect reduced-motion preference. Same end-state is visible (static
  // characters in initial positions); only parallax + drift are skipped.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Parallax driver. IntersectionObserver enables/disables the scroll
  // listener so it only fires while the hero is in viewport. rAF throttle
  // collapses scroll-spam into one render per frame.
  useEffect(() => {
    if (reduced || typeof window === 'undefined') return
    const el = wrapRef.current
    if (!el) return

    let inView = true
    let raf = 0
    let pendingY = window.scrollY

    const tick = () => {
      raf = 0
      setScrollY(pendingY)
    }
    const onScroll = () => {
      pendingY = window.scrollY
      if (!raf) raf = window.requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        const wasIn = inView
        inView = !!entry?.isIntersecting
        if (inView && !wasIn) {
          window.addEventListener('scroll', onScroll, { passive: true })
        } else if (!inView && wasIn) {
          window.removeEventListener('scroll', onScroll)
          if (raf) {
            window.cancelAnimationFrame(raf)
            raf = 0
          }
        }
      },
      { threshold: 0 },
    )
    io.observe(el)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [reduced])

  // 0.2x parallax. Computed off scrollY so it stays in sync even when the
  // listener (re)attaches mid-viewport.
  const parallaxY = reduced ? 0 : scrollY * 0.2

  return (
    <div
      ref={wrapRef}
      className="hero-atmosphere"
      aria-hidden="true"
      style={{ transform: `translate3d(0, ${parallaxY}px, 0)` }}
    >
      {ATMOSPHERE_CHARS.map((char, i) => (
        <div key={i} className={`hero-atmosphere-char hero-atmosphere-char-${i + 1}`}>
          <span className="hero-atmosphere-char-inner">{char}</span>
        </div>
      ))}
    </div>
  )
}
