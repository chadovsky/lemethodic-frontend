// LeMethodic motion language.
// All values sourced from LEMETHODIC-DESIGN.md §9 (Agent Prompt Guide → Motion).
// Do not hand-edit values without updating the DESIGN.md decision log.

// ── Easing curves ───────────────────────────────────────────────────────────
// Use as: transition={{ ease: easeFpEnter, duration: durationBase }}
// Or in CSS: transition: transform var(--fp-duration-base) var(--fp-ease-fp-enter);

/** Default for state transitions: snappy on enter, gentle on settle. */
export const easeFpDefault: [number, number, number, number] = [0, 0, 0.2, 1]

/** Entrance from offscreen: route transitions, modal open, sheet slide-up,
 *  fresh content arriving. "ease-out-expo"-feeling curve. */
export const easeFpEnter: [number, number, number, number] = [0.16, 1, 0.3, 1]

/** Exit / dismissal. ease-out-cubic — slightly slower decay than the default,
 *  so dismissals feel polished rather than abrupt. */
export const easeFpExit: [number, number, number, number] = [0.33, 1, 0.68, 1]

// ── Spring presets ──────────────────────────────────────────────────────────
// Strict ban on damping < 25 or stiffness > 500 outside pressSpring's
// near-instant calibration — those produce visible bounce, which the brand
// explicitly forbids.

/** Disclosure body height, selected-card lift, modal/sheet entrance.
 *  Damping 32 keeps overshoot ≤ ~2%. */
export const heightSpring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 32,
}

/** Reserved for non-button physics use cases — card flips, dial twists,
 *  any micro-interaction that wants spring physics but on a non-button
 *  surface.
 *
 *  **DO NOT USE FOR BUTTON PRESS FEEDBACK.** Button presses are
 *  duration-zero by spec — instant snap, no spring travel. Use a plain
 *  `transition={{ duration: 0 }}` (or no transition at all) for any
 *  pointerdown → pointerup scale change on a button or card press. The
 *  brand's tactile signature is *snap*, not *cushion*; encoding a spring
 *  here as the "press" preset would invite drift toward visible cushion
 *  on buttons. */
export const pressSpring = {
  type: 'spring' as const,
  stiffness: 800,
  damping: 60,
  mass: 0.5,
}

/** Button-press transition — explicit instant snap, zero duration.
 *  Use as `transition={pressInstant}` on any button/card pointer-down
 *  scale change. */
export const pressInstant = {
  duration: 0,
}

/** Selected-card lift (the scale(1.01) settle). Slightly softer than
 *  heightSpring so the lift feels like an embrace, not a click. */
export const liftSpring = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 30,
}

// ── Duration tokens (ms) ────────────────────────────────────────────────────
// Within the 200-400ms spec range from DESIGN.md. Anything ≥ 500ms requires
// explicit justification per §9.

/** 200ms — micro-interactions: press, hover, toggle thumb. */
export const durationFast = 0.2

/** 300ms — state transitions: selection, expansion, fade-in of new content. */
export const durationBase = 0.3

/** 400ms — section transitions: tab switch, modal open, route transition.
 *  Also bar-fill on diagnostic reveal. */
export const durationSlow = 0.4

// ── Stagger helpers ─────────────────────────────────────────────────────────

/** Per-row delay for the diagnostic bar reveal (worst-first → best-last so
 *  the eye reads the bottleneck arriving first). Apply via Framer Motion
 *  `delay: i * staggerDiagnosticRow`. */
export const staggerDiagnosticRow = 0.075

// ── Surface-specific duration overrides ────────────────────────────────────
// DESIGN.md §9 caps the standard range at 200-400ms; anything ≥ 500ms must
// carry an explicit justification.

/** 700ms — diagnostic bar fill. Justification: with 4 rows × 75ms stagger,
 *  the fastest the user can read each bar settle into place is ~600-800ms.
 *  Faster than that and bars feel like they're snapping (which undermines
 *  the methodology's "this is rigorous" stance); slower and the page feels
 *  laggy. 700ms is the midpoint of the spec's 600-800 window. Total
 *  reveal time ≈ 925ms (3 × 75ms stagger + 700ms bar). */
export const durationDiagnosticReveal = 0.7

// ── Pulse / loop configs ────────────────────────────────────────────────────

/** Recording-done pulse — a single scale pulse on the record icon when the
 *  recorder transitions out of "recording" into "transcribing"/"processing".
 *  Communicates "audio received" calmly. Not celebratory.
 *  Apply as: animate={{ scale: recordingDonePulseScale }} transition={{
 *    duration: recordingDonePulseDuration, ease: easeFpEnter }}. */
export const recordingDonePulseScale = [1, 1.08, 1]
export const recordingDonePulseDuration = durationSlow // 0.4s

/** Empty-state attention pulse — a slow loop that gently draws the eye to
 *  a primary CTA without feeling like an ad. Pause via whileHover/whileTap
 *  in the consuming component. Total cycle ≈ 3s (1.5s active + 1.5s gap). */
export const attentionPulseScale = [1, 1.02, 1]
export const attentionPulseDuration = 1.5
export const attentionPulseRepeatDelay = 1.5

// ── Lesson-unlock animation ────────────────────────────────────────────────

/** Lesson card just unlocked — single scale-up + elevation flash + settle.
 *  Total animation 1s. Stoic, not celebratory. */
export const lessonUnlockScale = [0.96, 1.0]
export const lessonUnlockBoxShadow = [
  '0 1px 6px rgba(0,0,0,0.04)',
  '0 4px 16px rgba(0,0,0,0.08)',
  'none',
]
/** Times for the boxShadow keyframes — peak at 40% of the 1s, settle by 100%. */
export const lessonUnlockBoxShadowTimes = [0, 0.4, 1]
export const lessonUnlockDuration = 1.0

// ── Press scale values ──────────────────────────────────────────────────────
// Mirrors the existing inline scale(0.96) / scale(0.97) / scale(1.01)
// pattern. Use these instead of magic numbers in component code.

/** Card press: 0.96. Onboarding cards. */
export const scaleCardPress = 0.96

/** Button press: 0.97. Primary CTAs. */
export const scaleButtonPress = 0.97

/** Selected lift: 1.01. The brand signal that selection is embraced. */
export const scaleSelectedLift = 1.01

// ── Motion-reduce honor ─────────────────────────────────────────────────────
// Components consuming this module should respect prefers-reduced-motion.
// Framer Motion has `useReducedMotion()` for this; CSS sites should wrap
// transitions in @media (prefers-reduced-motion: no-preference).

// ─────────────────────────────────────────────────────────────────────────────
// F-212 — Editorial motion primitives (companion to the FluentPath system
// above). The editorial system uses CSS variable easing (`--ed-ease`) +
// strict no-bounce, no-spring rules per F-200 spec.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'

/** F-212 editorial easing — mirrors `--ed-ease` from globals.css.
 *  Use with framer-motion or CSS transitions. */
export const ED_EASE_CUBIC = [0.16, 1, 0.3, 1] as const
export const ED_EASE_CSS = 'cubic-bezier(0.16, 1, 0.3, 1)' as const

/** V-012a soft-spring easing — mirrors `--ease-spring` from globals.css.
 *  Default for color / bg / border / shadow state transitions in the
 *  V-012 warmth refit. Transforms on buttons stay on short ease-out for
 *  tactile snap; transforms on cards (hover lift) use this spring. */
export const ED_EASE_SPRING_CUBIC = [0.32, 0.72, 0, 1] as const
export const ED_EASE_SPRING_CSS = 'cubic-bezier(0.32, 0.72, 0, 1)' as const

/** F-212 duration tokens (ms). Match the `--ed-duration-*` CSS vars. */
export const ED_DUR = {
  hover: 200,
  press: 150,
  state: 300,
  reveal: 700,
  heroEntry: 600,
  rotateWord: 600,
  counterCount: 1200,
} as const

/** F-212 stagger gaps between sibling reveals (ms). */
export const ED_STAGGER = {
  cards: 80,         // landing differentiation, pricing tiers, FAQ items
  heroSequence: 200, // landing hero kicker → h1 → subhead first-paint
} as const

// ── useRotatingText — flagship hero kicker rotation ────────────────────────
// Cycles through a list of words; pauses on hover (caller wires `pause`).
// Honors prefers-reduced-motion: returns words[0] frozen + reduced=true so
// the consumer can swap to a static "TCF · TEF · DELF · DALF" listing.

export interface UseRotatingTextOptions {
  words: string[]
  intervalMs?: number
  pause?: boolean
}

export function useRotatingText({
  words,
  intervalMs = 2500,
  pause = false,
}: UseRotatingTextOptions): { current: string; index: number; reduced: boolean } {
  const [index, setIndex] = useState(0)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (pause || words.length <= 1 || reduced) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % words.length)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [pause, reduced, words.length, intervalMs])

  return { current: words[index] ?? '', index, reduced }
}

// ── useCountUp — counter animation for stat numbers ────────────────────────
// Eases from 0 → target. Honors prefers-reduced-motion (returns target
// instantly). Uses requestAnimationFrame.

export function useCountUp(target: number, durationMs: number = ED_DUR.counterCount): number {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic
      setValue(Math.round(target * eased))
      if (t < 1) raf = window.requestAnimationFrame(tick)
    }
    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
  }, [target, durationMs])
  return value
}

// ── useInViewOnce — IntersectionObserver one-shot reveal trigger ──────────

export function useInViewOnce(threshold: number = 0.2): {
  ref: (node: Element | null) => void
  inView: boolean
} {
  const [inView, setInView] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const ref = (node: Element | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
          observerRef.current?.disconnect()
        }
      },
      { threshold },
    )
    observerRef.current.observe(node)
  }
  return { ref, inView }
}
