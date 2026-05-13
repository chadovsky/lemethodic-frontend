// F-VISUAL-001 X.1 — typography constants point at Figtree (sans) +
// Fraunces (display + serif accents). Switzer retired (was Fontshare
// CDN-loaded via V-005); Figtree replaces via next/font/google in
// app/layout.tsx with subsets ['latin', 'latin-ext'] for French
// diacritics + œ.
//
// SANS_FONT consumers: every editorial surface that inlines
// font-family in style={{...}}, plus the prose-legal block in
// globals.css. CSS variable indirection means a single source-of-truth
// swap touches everywhere consistently.

export const SANS_FONT = 'var(--font-figtree), -apple-system, "Segoe UI", system-ui, sans-serif'

// Fraunces — variable serif with optical-size + SOFT axes. Used for
// editorial accent typography (pull-quotes, methodology framing, hero
// display). Used sparingly — restraint is the point.
export const SERIF_FONT = 'var(--font-fraunces), Georgia, "Times New Roman", serif'

// Legacy step names — kept for back-compat. Same family, values
// aligned with the semantic TYPE_SCALE_SEMANTIC below.
export const TYPE_SCALE = {
  caption: '0.875rem',  // 14px
  body: '1rem',         // 16px
  bodyLg: '1.125rem',   // 18px
  bodyXl: '1.25rem',    // 20px
  h6: '1.5rem',         // 24px
  h4: '2rem',           // 32px
  h2: '3rem',           // 48px
  h1: '4.5rem',         // 72px
  display: '6rem',      // 96px
} as const

// F-VISUAL-001 — semantic type scale per the design system.
// Each entry carries size + weight + line-height + letter-spacing +
// family + (optional) style. Surfaces consume TYPE.* and apply via
// inline style. Values mirror the locked spec in BACKLOG F-VISUAL-001.
//
// C3 evaluation point: display1/display2/h1/h2 are locked to Fraunces
// italic. F-225 Batch 2 (paywall + ecole) is the decision moment for
// h2 specifically — if h2-italic-serif feels mannered across every
// card, swap h2.family/style/weight here (single edit; all consumers
// follow). Tracked in BACKLOG F-VISUAL-001 entry as "known evaluation
// point."
export const TYPE = {
  display1: {
    size: 'clamp(40px, 6vw, 88px)',
    weight: 500,
    lineHeight: 1.05,
    letterSpacing: '-0.025em',
    family: SERIF_FONT,
    style: 'italic',
  },
  display2: {
    size: 'clamp(32px, 4.5vw, 60px)',
    weight: 400,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    family: SERIF_FONT,
    style: 'italic',
  },
  h1: {
    size: 'clamp(28px, 3.5vw, 44px)',
    weight: 500,
    lineHeight: 1.15,
    letterSpacing: '-0.015em',
    family: SERIF_FONT,
    style: 'italic',
  },
  h2: {
    size: 'clamp(22px, 2.6vw, 30px)',
    weight: 500,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
    family: SERIF_FONT,
    style: 'italic',
  },
  h3: {
    size: 'clamp(18px, 2vw, 22px)',
    weight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.005em',
    family: SANS_FONT,
    style: 'normal',
  },
  bodyLg: {
    size: '17px',
    weight: 400,
    lineHeight: 1.55,
    letterSpacing: '0',
    family: SANS_FONT,
    style: 'normal',
  },
  body: {
    size: '15px',
    weight: 400,
    lineHeight: 1.55,
    letterSpacing: '0',
    family: SANS_FONT,
    style: 'normal',
  },
  bodySm: {
    size: '14px',
    weight: 400,
    lineHeight: 1.5,
    letterSpacing: '0',
    family: SANS_FONT,
    style: 'normal',
  },
  eyebrow: {
    size: '12px',
    weight: 600,
    lineHeight: 1.4,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    family: SANS_FONT,
    style: 'normal',
  },
  code: {
    size: '13px',
    weight: 500,
    lineHeight: 1.4,
    letterSpacing: '0',
    family: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    style: 'normal',
  },
} as const

// Editorial line-heights / letter-spacing (legacy — kept for callers
// that compose these manually).
export const LINE_HEIGHT = {
  display: 1.05,
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

// Editorial palette as JS constants. CSS variable indirection means a
// single :root edit cascades to inline-style consumers without code
// touches. F-VISUAL-001 — ED.* aliases the new canonical tokens.
export const ED = {
  bg: 'var(--bg-canvas)',          // canonical (was var(--ed-bg))
  fg: 'var(--text-primary)',       // canonical (was var(--ed-fg))
  accent: 'var(--cta-primary)',    // canonical (was var(--ed-accent))
  muted: 'var(--text-muted)',      // canonical (was var(--ed-muted))
  rule: 'var(--rule-default)',     // canonical (was var(--ed-rule))
  paper: 'var(--bg-elevated)',     // canonical (was var(--ed-paper))
} as const

// Editorial motion as JS constants (companion to lib/motion.ts which
// holds the FluentPath spring system).
export const ED_MOTION = {
  ease: 'var(--ed-ease)',
  durationHover: 'var(--ed-duration-hover)',
  durationState: 'var(--ed-duration-state)',
  durationReveal: 'var(--ed-duration-reveal)',
} as const
