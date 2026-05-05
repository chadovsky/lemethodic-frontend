// F-200 — editorial typography system. Reusable across the F-2xx
// responsive sweep + interaction polish queue. Establishes the font
// stacks and type scale; component files import these constants instead
// of redeclaring inline.
//
// Coexists with the legacy `DISPLAY_FONT` constant in
// components/onboarding/OnboardingScreen.tsx, which surfaces Cabinet
// Grotesk for surfaces F-2xx hasn't migrated yet.

// Geist (loaded via next/font in app/layout.tsx) is the primary editorial
// sans. The CSS variable `--font-geist` is set on `<html>`, so any
// element inheriting `font-family: var(--font-geist)` picks it up.
// `font-feature-settings` enabled per Geist's recommended typography.
export const SANS_FONT = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'

// Source Serif 4 (loaded via next/font) for editorial accent typography:
// pull-quotes, methodology framing, named-concept callouts. Used
// sparingly — restraint is the point.
export const SERIF_FONT = 'var(--font-source-serif), Georgia, "Times New Roman", serif'

// Editorial type scale. Steps map to common rem values (× 16px base):
// 14 / 16 / 18 / 20 / 24 / 32 / 48 / 72 / 96 px.
export const TYPE_SCALE = {
  caption: '0.875rem',  // 14px — small UI, captions, footer rights
  body: '1rem',         // 16px — paragraphs
  bodyLg: '1.125rem',   // 18px — emphasized body, lead paragraphs
  bodyXl: '1.25rem',    // 20px — section subheads
  h6: '1.5rem',         // 24px — small headings
  h4: '2rem',           // 32px — section H2s
  h2: '3rem',           // 48px — large section headings
  h1: '4.5rem',         // 72px — hero on tablet+
  display: '6rem',      // 96px — hero on desktop
} as const

// Editorial line-heights / letter-spacing.
export const LINE_HEIGHT = {
  display: 1.05,        // tight for oversized type
  heading: 1.15,
  body: 1.6,
  bodyTight: 1.5,
} as const

export const LETTER_SPACING = {
  display: '-0.02em',
  heading: '-0.015em',
  body: '0',
  caption: '0.04em',
} as const

// Editorial palette as JS constants for inline `style={{ ... }}` callers
// that don't want to use Tailwind utilities. CSS variable references so
// dark-mode overrides (future) cascade cleanly.
export const ED = {
  bg: 'var(--ed-bg)',
  fg: 'var(--ed-fg)',
  accent: 'var(--ed-accent)',
  muted: 'var(--ed-muted)',
  rule: 'var(--ed-rule)',
  paper: 'var(--ed-paper)',
} as const

// Editorial motion as JS constants (companion to lib/motion.ts which
// holds the FluentPath spring system).
export const ED_MOTION = {
  ease: 'var(--ed-ease)',
  durationHover: 'var(--ed-duration-hover)',
  durationState: 'var(--ed-duration-state)',
  durationReveal: 'var(--ed-duration-reveal)',
} as const
