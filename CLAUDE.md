# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (lockfile is `pnpm-lock.yaml`).

- `pnpm dev` — start Next.js dev server on http://localhost:3000
- `pnpm build` — production build
- `pnpm start` — run the production build
- `pnpm lint` — `eslint .` (no ESLint config is checked in, so this is essentially a no-op until one is added)

There is **no test runner** configured.

## v0 integration

The repo is linked to a v0 project (see README). Edits in v0 push commits directly to this repo, and every merge to `main` auto-deploys. When making changes here, assume `main` is continuously deployed — don't merge half-finished work.

## Shipping verification protocol (F-225, 2026-05-04)

**Hard gate.** Every FE ticket gets the `Shipped` status only after the following are attached to its `BACKLOG.md` entry:

1. **1440px desktop screenshot** of every affected route, captured on production (`lemethodic.com`).
2. **375px mobile screenshot** (iPhone SE width) of every affected route, captured on production.
3. If a ticket affects multiple screens (e.g. an onboarding-flow change spans 11 questions + reveal), attach all of them.
4. If the change is genuinely non-visual (BE-only, config, deps, copy/text that doesn't affect layout, doc updates), note `non-visual change — verification skipped` on the BACKLOG entry instead of attaching screenshots.
5. **Interactive verification (added 2026-05-04, F-225 amendment):** for tickets that change interactive behavior (handlers, navigation, form submission, state mutation), verification requires both: (a) 1440px + 375px screenshots of the affected screen, AND (b) a recorded interaction trace — either a Loom link, a screen recording, or a written test plan with pass/fail observed outcomes documented in the BACKLOG entry. Screenshots alone don't catch a Sign Out that does nothing on click; an interaction trace does.

The rule exists because mobile-first development without desktop verification has shipped broken desktop layouts repeatedly. The soft-beta scope locks in mobile + desktop as both first-class. Until a ticket's verification (screenshots + interaction trace where applicable) is attached or the non-visual exemption is noted, it stays in `Status: Awaiting verification` — not `Shipped`.

This protocol applies to every FE ticket, including hotfixes. The only ticket exempt from itself is F-225 (this doc commit) — the rule didn't exist when the work was done.

## Architecture

Next.js 16 App Router + React 19 + TypeScript (strict) + Tailwind v4. Styling is shadcn/ui ("new-york" style, neutral base, lucide icons); generator config in `components.json`. Path alias `@/*` resolves to the repo root, so `@/components`, `@/lib`, `@/hooks` all work.

### The onboarding flow is a client-side state machine

The root route (`app/page.tsx`) renders `components/onboarding/OnboardingFlow.tsx`, which holds a single `step` counter (1–6) plus an `OnboardingState` object and conditionally renders one of six step components:

1. `LanguageSelect` — UI language (`en` | `es`)
2. `TCFGoalSelect` — TCF goal
3. `CurrentLevelSelect` — self-assessed CEFR band (`A1_A2` | `A2_B1` | `B1_B2` | `B2_plus`)
4. `TargetScoreSelect` — depends on the chosen goal
5. `ExamDateSelect` — either a real `YYYY-MM` date or a "quick" label
6. `EcoleReveal` — summary screen; its continue CTA `router.push('/paywall')`

Each step component is self-contained and calls `onContinue(value)` + optional `onBack()` props. Step 6's types (`CurrentLevel`, `TargetScore`, `ExamDate`) are re-exported from their step files — `OnboardingFlow` imports types from each step.

When adding a step, update all three: (a) the component file, (b) `OnboardingState` in `OnboardingFlow.tsx`, and (c) the `total={6}` / `filledUpTo` values passed to `ProgressDots` across steps.

### Shared onboarding primitives

`components/onboarding/OnboardingScreen.tsx` is the design-system kernel for the onboarding flow and exports:

- **Color/font constants** — `INK`, `INK_SOFT`, `INK_MUTED`, `PAPER`, `CTA_DISABLED`, `DISPLAY_FONT`. These are re-used outside onboarding too (e.g. `components/Paywall.tsx` imports from this file).
- **`ProgressDots`**, **`OnboardingCard`**, **`CheckIcon`**, **`CTAButton`**, **`BackButton`** — the reusable pieces every step is assembled from.
- **`OnboardingScreen`** — layout wrapper that takes a pastel `bg`, illustration, headline, descriptor, CTA state, and cards as children. Most but not all steps use it; `EcoleReveal` and `LanguageSelect` render their own layout while still using the primitives above.

Prefer using these primitives over hand-rolling new buttons/cards — the press-animation and selection states (`scale(0.96)` → `scale(1.01)`) are implemented inline with pointer handlers, not via Tailwind classes.

### Design tokens

`app/globals.css` is the source of truth for Tailwind v4 styling. It defines a **FluentPath pastel palette** as CSS variables (`--fp-peach`, `--fp-sage`, `--fp-butter`, `--fp-lavender`, `--fp-sky`, `--fp-blush`) plus ink/paper/CTA neutrals, then exposes them as Tailwind utilities via `@theme inline` (so `bg-fp-peach`, `text-fp-ink`, etc. all work). shadcn's own `--background`/`--foreground`/etc. tokens also live here.

Note: each onboarding step currently hardcodes its background hex rather than using the Tailwind token (e.g. `style={{ backgroundColor: '#FFD8C2' }}`). When touching a step, keep that pattern unless you're doing a deliberate migration.

There is a **duplicate** `styles/globals.css` that is not imported anywhere — `app/layout.tsx` imports `./globals.css` (i.e. `app/globals.css`). Edit `app/globals.css`, not `styles/globals.css`.

### Fonts

Geist/Geist Mono are loaded via `next/font/google` in `app/layout.tsx` but the returned font variables are intentionally not applied (prefixed `_geist`). The display font is **Cabinet Grotesk**, loaded from `fonts.cdnfonts.com` via a plain `<link>` in `<head>` and referenced through the `DISPLAY_FONT` constant in inline styles.

### Other routes

- `/paywall` — `components/Paywall.tsx`, a long client component using Recharts (`RadarChart`) plus an expandable comparison table. Imports design tokens from the onboarding primitives. This is the final step of the onboarding funnel — the step-6 `EcoleReveal` CTA pushes here.

### Editorial design system primitives (F-200 → F-214)

The editorial system established by F-200 has these reusable primitives:

**CSS utilities (app/globals.css):**
- `.prose-legal` — long-form legal copy typography (B-102)
- `.ed-card-lift` — 200ms hover translateY -2px + shadow ramp. Apply to any ed-paper card.
- `.ed-btn-press` — scale 0.98 on :active. Apply to all CTAs.
- `.ed-field` — focus-visible ed-accent border + 18%-opacity ring. Apply to form inputs.
- `.ed-skeleton` — 1.5s shimmer for skeleton loaders (F-211).
- `.ed-page-enter` — 250ms route fade-in for major surface transitions (F-213).
- `.ed-hero-rise` + `.ed-hero-rise-delay-{1|2|3}` — landing first-paint sequence.
- All utilities respect `prefers-reduced-motion: reduce`.

**Tokens (CSS variables in `:root`):**
- `--ed-bg` / `--ed-fg` / `--ed-accent` / `--ed-muted` / `--ed-rule` / `--ed-paper` — palette
- `--ed-ease` — `cubic-bezier(0.16, 1, 0.3, 1)`
- `--ed-duration-hover` (200ms) / `--ed-duration-state` (600ms) / `--ed-duration-reveal` (700ms)

**JS constants (lib/typography.ts + lib/motion.ts):**
- `SANS_FONT` (Geist) / `SERIF_FONT` (Source Serif 4) / `TYPE_SCALE` / `LINE_HEIGHT` / `LETTER_SPACING`
- `ED` (palette object) / `ED_MOTION` (motion tokens)
- `ED_EASE_CUBIC` / `ED_EASE_CSS` / `ED_DUR` / `ED_STAGGER` (F-212 motion primitives)
- Hooks: `useRotatingText` / `useCountUp` / `useInViewOnce`

**React components:**
- `<RevealOnScroll delay={N} distance={D}>` — wrap any element for fade + Y-translate on viewport entry (F-200)
- `<RotatingKicker lang>` — flagship landing kicker that cycles TCF / TEF / DELF / DALF (F-212)
- `<TestimonialCard quote attribution examContext?>` — pattern only, not wired to data (F-214)

**OnboardingScreen primitives** (still load-bearing for /onboarding):
- `<OnboardingScreen>` — design-system kernel (720px desktop, ed-* tokens, optional illustration)
- `<OnboardingCard>` — selectable card with hover lift + press feedback built in
- `<CTAButton>` — primary CTA with built-in press feedback
- `<ProgressDots>`, `<CheckIcon>`, `<BackButton>` — accessory primitives

**Color hierarchy** (F-200):
- Page chrome: `--ed-bg` (warm off-white) is structural primary
- Cards/surfaces: `--ed-paper` (white) on bg, with 1px `--ed-rule` border + 0 shadow
- Primary CTA: `--ed-accent` (deep navy) — premium signal
- Secondary text: `--ed-muted` (warm gray)
- Pastels (`--fp-*`): preserved as decorative chip layer ONLY (per-question category, status indicators, exam type chips). Not chrome.

**Visual rules (F-200):**
- No bouncy gradients, emoji, cartoon illustrations, mascot energy
- Editorial typography (oversized H1, tight letter-spacing for display)
- Restrained palette (premium because it withholds, not because it adds)
- Real photography or art-directed illustration where imagery is needed
- Slow confident motion: 200ms hover, 300ms state, 600-800ms reveal
- 4px button radii (premium signal vs soft 14-16px tutorial-app radii)

### Build config gotchas

`next.config.mjs` sets:

- `typescript.ignoreBuildErrors: true` — **TypeScript errors do not fail the build**. Don't rely on `pnpm build` to catch type errors; run `tsc --noEmit` manually if you need type verification.
- `images.unoptimized: true` — Next's image optimizer is off. All illustrations in `/public` ship as-is; both `.png` (transparent) and `.jpg` versions exist for each illustration.

Analytics (`@vercel/analytics`) is rendered only when `NODE_ENV === 'production'`.
