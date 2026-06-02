# CLAUDE.md

## Execution Source of Truth (Manual Mode, May 21 2026)
- Canonical PRD: docs/prd-v1.md
- Old BACKLOG.md superseded but retained for audit
- Current section: BE wiring (5/22 shipped). Latest: BE-005 (Tâches data wiring), main at 4fd9ea3, tag v0.3.5
- Mode: one micro-feature per session, UI-first sequencing, vitest + Playwright = spec, squash-merge to main

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Four principles

1. **No silent assumptions.** If you don't know what a function does or what shape an API returns, read the code. Don't guess.
2. **Scope is sacred.** A 50-line feature stays 50 lines. Don't expand to 500 because "it might be useful later." Deferred surfaces go to the bientôt queue, not a future version.
3. **Don't touch what wasn't requested.** Orthogonal changes (formatting, refactoring, renaming) are forbidden in feature work. Open a separate PR if it matters.
4. **No "it works" without evidence.** Run the tests. Say which ones passed. If they failed, fix the test or fix the code, don't skip it.

## Canonical names and complete-site doctrine

**Product spine (canonical):**
- Le Méthodic (the product)
- La Méthode (the core loop, route /la-methode)
- La Bibliothèque (the resource library, route /la-bibliotheque)
- L'Examen (the diagnostic and exam tools, route /l-examen)
- /carte (the Atlas hub, home after onboarding)
- The five couches: Le Propos, Le Plan, La Construction, Les Pièges Anglais, La Musique

**Forbidden names:** FluentPath, FluentPrep, Le Cours, Le Raccourci, Guide tier, Sophie, Stripe (in user-facing copy or new code), and version language used as a product state (V1, V1.1, V2, beta, soft-beta as a product label).

**Complete-site doctrine:** The product is one complete website from launch. Every surface is present. Unbuilt parts show as bientôt, not as missing routes or errors. Lighting a surface up is content plus a feature flag, never a version bump. The spine is exam-agnostic; a Target Profile (exam, threshold, deadline, persona) overlays it. All four skills are present from the start. TCF is the first exam lit, not the only one.

**Payment:** LemonSqueezy is the merchant of record for all new payment code. No Stripe references in new code or user-facing surfaces.

## Commands

Package manager is **pnpm** (lockfile is `pnpm-lock.yaml`).

- `pnpm dev`: start Next.js dev server on http://localhost:3000
- `pnpm build`: production build
- `pnpm start`: run the production build
- `pnpm lint`: `eslint .` (no ESLint config is checked in, so this is essentially a no-op until one is added)

Tests: **vitest** (unit, jsdom env) for component/lib tests, **Playwright** for e2e. Check `package.json` scripts for the exact commands (typically `pnpm test`, `pnpm test:e2e`). Test setup in `tests/setup.ts` stubs `IntersectionObserver` for Framer Motion `whileInView`. ~387 unit / ~250 e2e at last count.

## v0 integration

The repo is linked to a v0 project (see README). Edits in v0 push commits directly to this repo, and every merge to `main` auto-deploys. When making changes here, assume `main` is continuously deployed: don't merge half-finished work.

## Shipping verification protocol (F-225, amended 2026-05-23)

**Hard gate via Playwright.** Every FE ticket gets the `Shipped` status only after Playwright captures the receipts as part of the e2e suite. Manual screenshot capture is retired: humans should not do what the test runner can do for free.

Every ticket that touches a visible surface must have e2e coverage that:

1. Visits each affected route.
2. Captures `tests/screenshots/<ticket-id>-<route-slug>-1440.png` (1440px desktop viewport).
3. Captures `tests/screenshots/<ticket-id>-<route-slug>-375.png` (375px mobile viewport, iPhone SE width).
4. Runs the happy-path interaction (click, submit, navigate) the ticket introduced.
5. Records a Playwright trace (`--trace on`) committed to `tests/traces/<ticket-id>.zip`.

If the change is genuinely non-visual (BE-only, config, deps, copy that doesn't affect layout, doc updates), note `non-visual change: verification skipped` on the PRD entry instead.

**Debt accepted (2026-05-23):** UI-001 through BE-005 shipped before this amendment landed. Their individual receipts are lost (production today is the layered superset). A one-time full-surface battery will be captured at first audience launch and serve as the canonical baseline.

The rule exists because mobile-first development without desktop verification has shipped broken desktop layouts repeatedly. Automating it removes the ceremony cost so the rule actually gets followed.

## Architecture

Next.js 16 App Router + React 19 + TypeScript (strict) + Tailwind v4. Styling is shadcn/ui ("new-york" style, neutral base, lucide icons); generator config in `components.json`. Path alias `@/*` resolves to the repo root, so `@/components`, `@/lib`, `@/hooks` all work.

### The onboarding flow is a client-side state machine

The root route (`app/page.tsx`) renders `components/onboarding/OnboardingFlow.tsx`, which holds a single `step` counter (1–6) plus an `OnboardingState` object and conditionally renders one of six step components:

1. `LanguageSelect`: UI language (`en` | `es`)
2. `TCFGoalSelect`: TCF goal
3. `CurrentLevelSelect`: self-assessed CEFR band (`A1_A2` | `A2_B1` | `B1_B2` | `B2_plus`)
4. `TargetScoreSelect`: depends on the chosen goal
5. `ExamDateSelect`: either a real `YYYY-MM` date or a "quick" label
6. `EcoleReveal`: summary screen; its continue CTA `router.push('/paywall')`

Each step component is self-contained and calls `onContinue(value)` + optional `onBack()` props. Step 6's types (`CurrentLevel`, `TargetScore`, `ExamDate`) are re-exported from their step files; `OnboardingFlow` imports types from each step.

When adding a step, update all three: (a) the component file, (b) `OnboardingState` in `OnboardingFlow.tsx`, and (c) the `total={6}` / `filledUpTo` values passed to `ProgressDots` across steps.

### Shared onboarding primitives

`components/onboarding/OnboardingScreen.tsx` is the design-system kernel for the onboarding flow and exports:

- **Color/font constants**: `INK`, `INK_SOFT`, `INK_MUTED`, `PAPER`, `CTA_DISABLED`, `DISPLAY_FONT`. These are re-used outside onboarding too (e.g. `components/Paywall.tsx` imports from this file).
- **`ProgressDots`**, **`OnboardingCard`**, **`CheckIcon`**, **`CTAButton`**, **`BackButton`**: the reusable pieces every step is assembled from.
- **`OnboardingScreen`**: layout wrapper that takes a pastel `bg`, illustration, headline, descriptor, CTA state, and cards as children. Most but not all steps use it; `EcoleReveal` and `LanguageSelect` render their own layout while still using the primitives above.

Prefer using these primitives over hand-rolling new buttons/cards: the press-animation and selection states (`scale(0.96)` → `scale(1.01)`) are implemented inline with pointer handlers, not via Tailwind classes.

### Design tokens

`app/globals.css` is the source of truth for Tailwind v4 styling. It defines a pastel palette as CSS variables (`--fp-peach`, `--fp-sage`, `--fp-butter`, `--fp-lavender`, `--fp-sky`, `--fp-blush`: the `fp-` prefix is legacy from the prior product name; **do not reintroduce FluentPath/FluentPrep in new code or copy**) plus ink/paper/CTA neutrals, then exposes them as Tailwind utilities via `@theme inline` (so `bg-fp-peach`, `text-fp-ink`, etc. all work). shadcn's own `--background`/`--foreground`/etc. tokens also live here.

Note: each onboarding step currently hardcodes its background hex rather than using the Tailwind token (e.g. `style={{ backgroundColor: '#FFD8C2' }}`). When touching a step, keep that pattern unless you're doing a deliberate migration.

There is a **duplicate** `styles/globals.css` that is not imported anywhere: `app/layout.tsx` imports `./globals.css` (i.e. `app/globals.css`). Edit `app/globals.css`, not `styles/globals.css`.

### Fonts

Geist/Geist Mono are loaded via `next/font/google` in `app/layout.tsx` but the returned font variables are intentionally not applied (prefixed `_geist`). The display font is **Cabinet Grotesk**, loaded from `fonts.cdnfonts.com` via a plain `<link>` in `<head>` and referenced through the `DISPLAY_FONT` constant in inline styles.

The editorial system (F-200+) introduces a second font pairing via `lib/typography.ts`: **Geist** as `SANS_FONT`, **Source Serif 4** as `SERIF_FONT`. Both are used by the editorial primitives below.

### Other routes

- `/paywall`: `components/Paywall.tsx`, a long client component using Recharts (`RadarChart`) plus an expandable comparison table. Imports design tokens from the onboarding primitives. This is the final step of the onboarding funnel; the step-6 `EcoleReveal` CTA pushes here.

### Editorial design system primitives (F-200 → F-214)

The editorial system established by F-200 has these reusable primitives:

**CSS utilities (app/globals.css):**
- `.prose-legal`: long-form legal copy typography (B-102)
- `.ed-card-lift`: 200ms hover translateY -2px + shadow ramp. Apply to any ed-paper card.
- `.ed-btn-press`: scale 0.98 on :active. Apply to all CTAs.
- `.ed-field`: focus-visible ed-accent border + 18%-opacity ring. Apply to form inputs.
- `.ed-skeleton`: 1.5s shimmer for skeleton loaders (F-211).
- `.ed-page-enter`: 250ms route fade-in for major surface transitions (F-213).
- `.ed-hero-rise` + `.ed-hero-rise-delay-{1|2|3}`: landing first-paint sequence.
- All utilities respect `prefers-reduced-motion: reduce`.

**Tokens (CSS variables in `:root`):**
- `--ed-bg` / `--ed-fg` / `--ed-accent` / `--ed-muted` / `--ed-rule` / `--ed-paper`: palette
- `--ed-ease`: `cubic-bezier(0.16, 1, 0.3, 1)`
- `--ed-duration-hover` (200ms) / `--ed-duration-state` (600ms) / `--ed-duration-reveal` (700ms)

**JS constants (lib/typography.ts + lib/motion.ts):**
- `SANS_FONT` (Geist) / `SERIF_FONT` (Source Serif 4) / `TYPE_SCALE` / `LINE_HEIGHT` / `LETTER_SPACING`
- `ED` (palette object) / `ED_MOTION` (motion tokens)
- `ED_EASE_CUBIC` / `ED_EASE_CSS` / `ED_DUR` / `ED_STAGGER` (F-212 motion primitives)
- Hooks: `useRotatingText` / `useCountUp` / `useInViewOnce`

**React components:**
- `<RevealOnScroll delay={N} distance={D}>`: wrap any element for fade + Y-translate on viewport entry (F-200)
- `<RotatingKicker lang>`: flagship landing kicker that cycles TCF / TEF / DELF / DALF (F-212)
- `<TestimonialCard quote attribution examContext?>`: pattern only, not wired to data (F-214)

**OnboardingScreen primitives** (still load-bearing for /onboarding):
- `<OnboardingScreen>`: design-system kernel (720px desktop, ed-* tokens, optional illustration)
- `<OnboardingCard>`: selectable card with hover lift + press feedback built in
- `<CTAButton>`: primary CTA with built-in press feedback
- `<ProgressDots>`, `<CheckIcon>`, `<BackButton>`: accessory primitives

**Color hierarchy** (F-200):
- Page chrome: `--ed-bg` (warm off-white) is structural primary
- Cards/surfaces: `--ed-paper` (white) on bg, with 1px `--ed-rule` border + 0 shadow
- Primary CTA: `--ed-accent` (deep navy), premium signal
- Secondary text: `--ed-muted` (warm gray)
- Pastels (`--fp-*`): preserved as decorative chip layer ONLY (per-question category, status indicators, exam type chips). Not chrome.

**Visual rules (F-200):**
- No bouncy gradients, emoji, cartoon illustrations, mascot energy
- Editorial typography (oversized H1, tight letter-spacing for display)
- Restrained palette (premium because it withholds, not because it adds)
- Real photography or art-directed illustration where imagery is needed
- Slow confident motion: 200ms hover, 300ms state, 600-800ms reveal
- 4px button radii (premium signal vs soft 14-16px tutorial-app radii)

### BE wiring conventions (Section 3, established BE-001–005)

- **API clients** live in `lib/api/<feature>.ts`. Schema reconciliation (BE shape → FE shape) happens here, not in components. Examples: `lib/api/lessons.ts`, `lib/api/vocab.ts`, `lib/api/taches.ts`.
- **Feature helpers** live in `lib/<feature>/*`: `lib/taches/normalize.ts`, `lib/vocab/params.ts`.
- **Fixtures** in `lib/data/*` are being phased out as BE wiring lands. Don't add new fixture files for features that have BE endpoints.
- **Flatten hierarchical BE shapes** for current surfaces. Hierarchy is deferred to the bientôt queue (see BE-004 vocab reconciliation precedent: BE returns nested topics→subtopics→chunks, FE flattens to a single chunk list with topic metadata inline).
- **Auth** wraps the authed `(app)` route group via `ProtectedRoute`. Sidebar has signout. hCaptcha is on the auth surfaces. EXCLUDED_PREFIXES in TopNav governs marketing-nav hiding.

### FastAPI BE is preserved (Architecture Path A, locked 2026-05-23)

- The BE repo `chadovsky/lemethodic-backend` (branch: `master`) is 53.8K LOC of FastAPI + SQLAlchemy + Postgres on DigitalOcean FRA1 (production: `seal-app-75fiu.ondigitalocean.app`). **Do not propose rewriting it** in Next.js Route Handlers, Prisma, Drizzle, or anything else.
- We wire to existing `/api/*` endpoints. New endpoints require BE work in the other repo, not Next.js Route Handlers in this one.
- **BE surfaces in the bientôt queue** (do not wire yet): `/api/writing/*`, `/api/analytics/*`, `/api/today/*`, `/api/modules` + `/api/users/me/recurring_modules`, `/api/oral/generate-structure`. These endpoints exist and work, but the FE surfaces for them are deferred.

### Build config gotchas

`next.config.mjs` sets:

- `typescript.ignoreBuildErrors: true`: **TypeScript errors do not fail the build**. Don't rely on `pnpm build` to catch type errors; run `tsc --noEmit` manually if you need type verification.
- `images.unoptimized: true`: Next's image optimizer is off. All illustrations in `/public` ship as-is; both `.png` (transparent) and `.jpg` versions exist for each illustration.

Analytics (`@vercel/analytics`) is rendered only when `NODE_ENV === 'production'`.

## Git workflow + environment

- Branch name: `feat/<id>-<name>` (e.g., `feat/be-006-recording-upload`).
- Squash-merge to `main`. Always. No merge commits.
- Update PRD status on feature branch before squash-merge: the status line in `docs/prd-v1.md` should move to `Shipped` with the post-squash SHA.
- Tag every 5 shipped entries within a section: `v0.<section>.<count>` (e.g., `v0.3.5` after 5 BE entries shipped).
- **PRD (`docs/prd-v1.md`) is the source of truth.** If the work drifts, update the PRD before the next entry.
- Dev machine: Windows + PowerShell. Use `code.cmd` not `code` (PATH hijack).
- PowerShell escapes curly braces in stash refs: `'stash@{0}'` (single quotes).
- Multi-line pastes break PowerShell: single-line, joined with `;`.
- **BE repo uses `master`. This repo uses `main`. Not interchangeable.**
- **Never call the product FluentPrep or FluentPath.** It's Le Méthodic.
- **Le Maître** (ElevenLabs Chadi-clone) is the unified tutor persona. OpenAI TTS-1-HD is examiner-only for Tâches. Sophie is dead.

## Done definition

A feature is done when:

1. All tests pass (unit + e2e for the touched surface).
2. Playwright e2e captures the 1440px + 375px screenshots and trace per the F-225 amended protocol (or `non-visual change` is noted on the PRD entry).
3. PRD status line moved to `Shipped` with the SHA on the feature branch.
4. Squash-merged to main.
5. If at a 5-count milestone, tag pushed.
6. Branch deleted locally and on origin.

## Collaboration Contract (Chadi + Claude.ai + Claude Code)

### Roles
- Chadi: vision, lock decisions, paste briefs to Claude Code, report results, 
  content authoring (last in sequence)
- Claude.ai (Opus): write briefs, maintain canonical files, maintain memory, 
  enforce sequencing, open every product-state session with snapshot
- Claude Code (Sonnet): execute briefs in repo, commit + push as gate, 
  self-stop on ambiguity, report results

### Sequencing (locked, per Memory entry on UI-first work)
FE shells with mocks, then BE wires real data, then Chadi uploads content.
Claude.ai never recommends content work (vocab review, book uploads, lesson 
content, lead magnets) until FE and BE are done. Period.

### Workflow loop
1. Chadi states intent (which ticket or milestone)
2. Claude.ai writes brief with ambiguities pre-resolved
3. Chadi opens or names a VS Code sidepanel after the ticket (e.g. "F-331")
4. Chadi pastes brief to that sidepanel
5. Sonnet executes, commits, pushes to origin
6. Sonnet reports acceptance gates
7. Chadi reports back to Claude.ai (paste gate report)
8. Claude.ai updates memory and proposes next dispatch

### Speed commitments from Claude.ai
- Briefs anticipate ambiguities so Sonnet does not have to ask back
- Per session: one strategic decision OR one execution dispatch, not both
- New canonical files require explicit justification (default is no)
- Em-dash never used in any output

### Anti-stall: things Claude.ai must NEVER do
- Suggest content work during FE or BE phases
- Propose more than 1 strategic decision per session
- Generate proposal documents without checking what is already locked
- Use vague language that forces Sonnet to ask follow-up questions
- Add canonical files when a section in an existing file would do

### VS Code agent discipline
- One sidepanel per active ticket
- Sidepanel renamed to match the ticket ID
- Close sidepanel after PR merged to origin/main
- Do not open parallel sidepanels touching overlapping files

### Contract updates
When this contract gets violated, the violation goes here as a numbered 
incident with date. Pattern detection prevents recurrence.