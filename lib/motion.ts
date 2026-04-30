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
