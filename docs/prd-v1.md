# Le Méthodic — Product Requirements Document v1
**UI-First Execution Plan · Manual Mode**

> **Generated:** May 21, 2026
> **Replaces:** `lemethodic-backlog-2026-05-18.md` (orchestrator backlog deprecated; parse_backlog / dispatch_agent / n8n-workflow files dead)
> **Source of truth:** this file. `BACKLOG.md` in each repo points back to PRD entries; do not let the two diverge.

---

## 1. Framework

### 1.1 Manual Mode (locked May 21)
The orchestrator path (parse_backlog → dispatch_agent → n8n) is killed. Cost projected $200–400/sprint, unaffordable at Y0 revenue. Replacement workflow:

- **Plan with Opus** (claude.ai) — one micro-feature briefed per session, brief becomes the PRD entry below
- **Execute with Sonnet** (Claude Code in VS Code) — implements the brief in one focused session
- **/compact between sessions** with focus directive, e.g. `/compact focus on UI-002 acceptance criteria`
- **Operating cost ceiling:** ~$20–50/mo Claude.ai

### 1.2 UI-First Sequencing
Backend moats (F-336–340 RAG retrieval modes, F-322 validator, F-327 voice pipeline, F-336+ embeddings) are scheduled in Sections 3–5 — **after** UI shells are complete. Rationale: a working UI with mocks generates user-flow feedback and lets beta cohorts validate experience. A backend without a UI cannot ship.

This is not "skipping the moat." Memory #23 V2-or-nothing posture holds: soft-beta = V2 with Le Maître + RAG + activation layer. The sequence just inverts the build order so user-visible surfaces compile first.

### 1.3 One Micro-Feature Per Session
Each PRD entry below is one Claude Code session. No multi-feature dispatches, no parallel agent work.

**Session discipline:**
1. Open session: paste the PRD entry as the first message to Sonnet
2. Sonnet writes tests first (or alongside), then code, then runs the tests
3. Close session: `git commit` + push the feature branch
4. Update the PRD entry `Status` line to `Shipped` and add the merge commit SHA
5. Between sessions: `/compact focus on <entry-id> <specific aspect>` before opening the next

### 1.4 Section Map (this PRD)
| § | Section | ID Range | Count | Maps to 4-Step Strategic Sequence |
|---|---------|----------|-------|-----------------------------------|
| 1 | UI Shells | UI-001 to UI-015 | 15 | Step 0 (parallel with data layer) |
| 2 | Mock Data + UI Polish | MOCK-001 to MOCK-012 | ~12 | Step 1 |
| 3 | Backend Wiring | BE-001 to BE-022 | ~22 | Step 2b |
| 4 | Content Pipeline | CON-001 to CON-014 | ~14 | Step 2b → 3 |
| 5 | AI Infrastructure | AI-001 to AI-018 | ~18 | Step 2a → 3 |
| 6 | Legal + Business Formation | LGL-001 to LGL-008 | ~8 | Step 3 |
| 7 | Launch | LCH-001 to LCH-009 | ~9 | Step 3 |
| | **Total** | | **~98** | |

---

## 2. Conventions

### 2.1 Git
- **Backend repo** (`chadovsky/lemethodic-backend`) — branch from `master`. Local: `C:\Users\pc\Downloads\tcf-oral-tool\tcf-oral-tool`
- **Frontend repo** (`chadovsky/lemethodic-frontend`) — branch from `main`. Local: `C:\Users\pc\Downloads\fluentpath-frontend`
- **Per-feature branch naming:** `feat/<id-lowercased>-<short-name>`
  - Example: `feat/ui-001-landing-hero`
  - Example: `feat/be-007-vocab-list-endpoint`
- **Merge strategy:** squash-merge to base branch
- **Tagging:** tag at end of each Section, or every 5 shipped entries — whichever comes first. Tag format: `v0.<section>.<count>` (e.g. `v0.1.5` after UI-005 ships)

### 2.2 Tests = Spec
Tests are written first or alongside code. Never after. If you find yourself writing tests after, stop and re-open the session.
- **Frontend:** vitest for unit/component tests, Playwright for e2e flows
- **Backend:** pytest for unit + integration tests
- Every PRD entry below lists specific test file paths and test names that must exist green before the branch can squash-merge

### 2.3 Acceptance Criteria
Format: **Given / When / Then**. 2–5 acceptance lines per entry. Each acceptance line must map to at least one named test.

### 2.4 Status Vocabulary
- `Not Started` — entry exists in this PRD, no branch created
- `In Progress` — branch exists, work underway, tests not all green
- `Shipped` — squash-merged to base, branch deleted, PRD updated with merge SHA

### 2.5 PowerShell-Safe Command Style
All shell commands written for Chadi must be single-line PowerShell-safe. Escape curly braces as `'stash@{N}'` (single quotes). No multi-line heredocs.

### 2.6 Out-of-Scope Discipline
Every entry has an explicit **Out** list. Items in Out are not "not needed for launch" — they are scheduled in a later section. Adding them in the current entry creates rework.

---

## Section 1 — UI Shells (UI-001 to UI-015)

**Goal:** every user-visible surface renders with placeholder content. No real data, no live API calls, no AI integrations. Each entry compiles, renders responsively, has a Playwright smoke test confirming it loads, and ships behind a feature branch.

**Why this section first:** rendering all surfaces validates information architecture before any backend cost is incurred. Beta cohort can be invited to navigate the shell and surface flow problems before AI/content investment.

---

### UI-001 — Landing page hero

**Status:** Shipped — squash-merged `547c712` (feat/ui-001-landing-hero → main)
**Branch:** `feat/ui-001-landing-hero` (FE, from `main`)
**Effort:** 1 session (~2–4h)

#### Scope
**In:**
- Headline: **"Pass TCF Canada. Get to Quebec."** (locked per memory — hero message)
- Subheadline: one-line positioning Le Méthodic as a method-based oral exam prep platform for anglophone TCF Canada candidates pursuing Quebec PR (exact wording iterates in MOCK-001)
- Primary CTA button: text placeholder "Start your prep" — routes to `/signup` (404 acceptable at this stage; route stub created here)
- Background: solid color drawn from brand palette via CSS variables (no images, no video, no avatar)
- Responsive: renders correctly at 375px (mobile), 768px (tablet), 1280px+ (desktop)
- Brand typography: pick a distinctive display font for the headline (not Inter, not Roboto, not system) and a refined body font — choices recorded in `tailwind.config.js` or `app/fonts.ts`

**Out (deferred, do not add):**
- Le Maître avatar (scheduled in Section 5 alongside ElevenLabs voice work; adding the avatar shell here creates rework when the real persona ships)
- Wispr Flow–style animated product demo (scheduled in MOCK-002; blocked on pre-work: Wispr reference screenshots, Nanobanana sample images)
- Social proof badges, testimonials (UI-003)
- Pricing teaser (UI-004)
- Footer (UI-004)
- A/B variant routing
- Analytics (PostHog/Plausible) — Section 7

#### Acceptance (Given/When/Then)
1. **Given** a visitor on desktop (1280×800), **When** they load `/`, **Then** headline, subheadline, and CTA all render above the fold without scroll.
2. **Given** a visitor on mobile (375×667), **When** they load `/`, **Then** the hero renders without horizontal overflow and the CTA has a minimum 44×44px tap target.
3. **Given** a visitor on the hero, **When** they click the CTA, **Then** the router navigates to `/signup` (a stub page that renders an empty container is acceptable).
4. **Given** the hero rendered, **When** Lighthouse runs against `/`, **Then** Accessibility ≥ 95 and Performance ≥ 90 (no images means this is easy to hit).

#### Tests
- `tests/unit/landing/Hero.test.tsx` (vitest) — renders headline, subheadline, CTA; CTA has correct href; passes ARIA role checks
- `tests/e2e/landing-hero.spec.ts` (Playwright) — desktop viewport loads `/`, hero visible, CTA click navigates to `/signup`; repeats on mobile viewport

#### Files Touched
- `app/page.tsx` — root landing route, renders `<Hero />`
- `app/signup/page.tsx` — stub page so the CTA click doesn't 404 (empty container is fine)
- `components/landing/Hero.tsx` — new component
- `tailwind.config.js` or `app/fonts.ts` — font registration if using next/font
- `tests/unit/landing/Hero.test.tsx`
- `tests/e2e/landing-hero.spec.ts`

#### Dependencies
None. This is the first UI shell — no upstream blockers.

#### Notes
- Headline copy is locked. Sub and CTA copy may iterate in MOCK-001 polish pass.
- Do not add Le Maître avatar. ElevenLabs work happens in Section 5 (AI Infrastructure). Premature avatar placement creates rework.
- Distinctive font choice matters here — this is the first impression and the brand signal. Pick something with character; do not default to Inter.

---

### UI-002 — Landing persona-match section

**Status:** Shipped — squash-merged `b4677e0` (feat/ui-002-landing-persona → main)
**Branch:** `feat/ui-002-landing-persona` (FE, from `main`)
**Effort:** 1 session (~2–4h)

#### Scope
**In:**
- Section heading: "Built for visa-urgent anglophone candidates" (or similar — exact copy provisional)
- Three-column value-prop block (1 column on mobile, 3 on desktop ≥1024px):
  - Column 1: TCF Canada–specific (not generic French exam prep)
  - Column 2: Designed for English speakers (5-couche layer "Les Réflexes Anglais" surfaces here)
  - Column 3: Method-based, not vocabulary memorization
- Each column: icon placeholder (geometric SVG, not avatar/photo), heading, 1–2 sentence body
- Renders directly below `<Hero />` on `/`
- Responsive: stacks vertically below 1024px

**Out:**
- Real icons (placeholder geometric SVGs only; final iconography is MOCK-003)
- Animated reveal on scroll (Motion library — scheduled in MOCK-005)
- Stats / numbers ("90% of users pass" — needs real data, scheduled in Section 7)
- DALF C1 secondary persona — not surfaced here (primary persona only on landing per GTM lock May 17)

#### Acceptance (Given/When/Then)
1. **Given** desktop ≥1024px, **When** the visitor scrolls past the hero, **Then** three columns render side-by-side with equal height.
2. **Given** mobile <1024px, **When** the visitor scrolls past the hero, **Then** columns stack vertically with consistent spacing.
3. **Given** the section rendered, **When** Lighthouse audits accessibility, **Then** all heading hierarchy is correct (h2 for section, h3 for columns) and contrast ratios pass WCAG AA.

#### Tests
- `tests/unit/landing/PersonaMatch.test.tsx` (vitest) — renders 3 columns, correct heading hierarchy
- `tests/e2e/landing-persona.spec.ts` (Playwright) — desktop shows 3 columns, mobile shows stacked layout

#### Files Touched
- `app/page.tsx` — add `<PersonaMatch />` below `<Hero />`
- `components/landing/PersonaMatch.tsx` — new component
- `components/landing/icons/` — geometric SVG placeholders (3 files)
- `tests/unit/landing/PersonaMatch.test.tsx`
- `tests/e2e/landing-persona.spec.ts`

#### Dependencies
- UI-001 must be `Shipped` (this section attaches below the hero)

---

### UI-003 — Landing methodology preview (5-couche visual)

**Status:** Shipped — squash-merged `ba435e4` (feat/ui-003-landing-methodology → main)
**Branch:** `feat/ui-003-landing-methodology` (FE, from `main`)
**Effort:** 1 session (~3–5h)

#### Scope
**In:**
- Section heading: "The 5-Couche Method" (locked terminology per memory)
- Visual representation of the five layers, in order:
  1. Le Fond
  2. Les Moules des Idées
  3. Les Moules
  4. Les Réflexes Anglais
  5. La Voix
- Each layer renders as a horizontal band, stacked, with the layer name and a 1-sentence description
- Layers are visually distinct (different background tones from a single palette ramp — no rainbow)
- Bottom CTA: "See how it works" → routes to `/method` (stub page, can 404 or render empty)

**Out:**
- Real interactive demo of the method (deferred to MOCK-006 with placeholder audio, then AI-005 with real voice)
- Animated layer reveal (MOCK-005)
- Linkage to L'École lesson list (Section 3 wires this)
- Beacco / FEI rubric references (these stay in admin/methodology docs, not user-facing landing)

#### Acceptance (Given/When/Then)
1. **Given** the methodology section loaded, **When** rendered on desktop, **Then** five layers display in vertical stack with consistent height and clear visual separation.
2. **Given** the section on mobile, **When** rendered, **Then** the five-layer stack remains readable (text doesn't truncate, layer names visible).
3. **Given** the CTA at the bottom, **When** clicked, **Then** the router navigates to `/method`.

#### Tests
- `tests/unit/landing/MethodologyPreview.test.tsx` (vitest) — renders 5 layers in correct order with correct French labels
- `tests/e2e/landing-methodology.spec.ts` (Playwright) — section visible, layer order correct, CTA navigates

#### Files Touched
- `app/page.tsx` — add `<MethodologyPreview />` below `<PersonaMatch />`
- `app/method/page.tsx` — stub page
- `components/landing/MethodologyPreview.tsx` — new component
- `components/landing/CouchesLayer.tsx` — single-layer sub-component
- `tests/unit/landing/MethodologyPreview.test.tsx`
- `tests/e2e/landing-methodology.spec.ts`

#### Dependencies
- UI-001, UI-002 must be `Shipped`

#### Notes
- The 5-couche is the brand moat surfaced visually. Get the typography and layer differentiation right — it's the proof point that Le Méthodic isn't another Duolingo clone.
- Exact French copy for each layer description should be reviewed by Chadi before merge.

---

### UI-004 — Landing pricing teaser + footer

**Status:** Shipped — squash-merged `2c92c69` (feat/ui-004-pricing-footer → main)
**Branch:** `feat/ui-004-pricing-footer` (FE, from `main`)
**Effort:** 1 session (~3–4h)

#### Scope
**In:**
- Pricing teaser section (above footer):
  - 5 tiers as cards: $9–19 à la carte / $19 Daily Bundle / $29 Exam Bundle / $49 Pro / $199 Sprint (one-time)
  - Each card: tier name, price, 2-line description, "Choose" CTA (routes to `/signup?tier=<slug>`)
  - Daily Bundle visually highlighted as "Most popular" (positioning per memory)
- Footer:
  - Logo placeholder
  - 3 link columns: Product (L'École, Le Vocabulaire, Le Diagnostic), Company (About, Method, Blog), Legal (ToS, Privacy — both stub `/legal/tos` and `/legal/privacy`)
  - Copyright line: "© 2026 Le Méthodic"
- Sticky nav header on top of page: logo + Sign in (routes to `/login` stub)

**Out:**
- Live Stripe checkout integration (Section 6 — LGL after Atlas + EIN)
- Free tier promotion (free funnel deferred to V1.1 per memory #23 Q8 — do not surface a free option here)
- Tier comparison table (deferred — current cards are enough for landing teaser)
- Currency switcher (USD only at launch)
- Newsletter signup in footer (deferred to Section 7 marketing)

#### Acceptance (Given/When/Then)
1. **Given** desktop, **When** the visitor scrolls to pricing, **Then** five tier cards render in a row (or 3+2 grid below 1280px) with Daily Bundle visually distinct.
2. **Given** mobile, **When** the visitor scrolls to pricing, **Then** cards stack vertically with Daily Bundle still visually distinct.
3. **Given** any tier card, **When** the CTA is clicked, **Then** the router navigates to `/signup?tier=<tier-slug>` with the correct query param.
4. **Given** the footer rendered, **When** the visitor clicks ToS or Privacy, **Then** the router navigates to the stub legal page.
5. **Given** the sticky header, **When** the visitor scrolls down the page, **Then** the header remains visible at the top.

#### Tests
- `tests/unit/landing/PricingTeaser.test.tsx` (vitest) — renders 5 tiers, Daily Bundle highlighted, CTAs have correct query params
- `tests/unit/landing/Footer.test.tsx` (vitest) — renders 3 link columns + copyright
- `tests/unit/landing/StickyHeader.test.tsx` (vitest) — renders logo + Sign in link
- `tests/e2e/landing-pricing.spec.ts` (Playwright) — clicks Daily Bundle CTA, lands on `/signup?tier=daily-bundle`
- `tests/e2e/landing-footer.spec.ts` (Playwright) — footer links navigate correctly

#### Files Touched
- `app/page.tsx` — add `<PricingTeaser />` and `<Footer />`
- `app/layout.tsx` — add `<StickyHeader />` to root layout
- `app/legal/tos/page.tsx`, `app/legal/privacy/page.tsx` — stub pages
- `app/login/page.tsx` — stub page
- `components/landing/PricingTeaser.tsx`, `components/landing/Footer.tsx`, `components/layout/StickyHeader.tsx`
- 5 test files as listed

#### Dependencies
- UI-001, UI-002, UI-003 must be `Shipped`

#### Notes
- Pricing copy is locked per memory. Do not invent new tiers or rename.
- The "Most popular" highlight on Daily Bundle is a GTM positioning decision (memory: $19 Daily Bundle is the anchor tier).

---

### UI-005 — Sign-up form shell

**Status:** Shipped — squash-merged `7052165` (feat/ui-005-signup-form-shell → main)
**Branch:** `feat/ui-005-signup-form-shell` (FE, from `main`)
**Effort:** 1 session (~3–5h)

#### Scope
**In:**
- `/signup` page replaces the empty stub from UI-001
- Form fields: email, password, confirm-password
- Client-side validation only at this stage:
  - Email format
  - Password ≥ 8 chars
  - Password match
- Validation errors shown inline below each field
- Submit button: disabled until validation passes; on click, shows a loading state then redirects to `/onboarding` (stub page)
- Reads `?tier=<slug>` query param from URL (set by pricing CTAs in UI-004) and displays "Signing up for: <tier>" above the form
- "Already have an account? Sign in" link → routes to `/login` stub
- Responsive: form is single column, max-width ~440px, centered

**Out:**
- Real auth wiring (Supabase / NextAuth / custom JWT — Section 3, BE-001)
- OAuth (Google, Apple) — scheduled in Section 3
- Email verification flow — scheduled in Section 3
- hCaptcha integration — scheduled in Section 3 (F-406 auth hardening)
- Password strength meter beyond length check — defer to MOCK-008
- Server-side validation — defer to BE-001

#### Acceptance (Given/When/Then)
1. **Given** a fresh visitor on `/signup`, **When** they leave the email field empty and click Submit, **Then** the Submit button stays disabled and inline error shows "Email is required."
2. **Given** valid email and matching passwords, **When** Submit is clicked, **Then** button shows a loading state for ≥300ms then router navigates to `/onboarding`.
3. **Given** the URL `/signup?tier=daily-bundle`, **When** the page renders, **Then** "Signing up for: Daily Bundle" displays above the form.
4. **Given** mismatched passwords, **When** the user blurs the confirm-password field, **Then** inline error shows "Passwords don't match" and Submit is disabled.
5. **Given** mobile viewport, **When** the page renders, **Then** the form fits in viewport without horizontal scroll and inputs have 44×44px minimum tap target.

#### Tests
- `tests/unit/signup/SignupForm.test.tsx` (vitest) — validation behavior, error messages, submit disabled/enabled states, tier query param display
- `tests/e2e/signup-flow.spec.ts` (Playwright) — fills form, submits, lands on `/onboarding`; tests validation errors; tests tier param

#### Files Touched
- `app/signup/page.tsx` — replaces UI-001 stub with `<SignupForm />`
- `app/onboarding/page.tsx` — stub page
- `components/auth/SignupForm.tsx` — new component
- `components/auth/FormField.tsx` — reusable field with inline error
- `lib/validation/signup.ts` — pure validation logic, easy to unit test
- `tests/unit/signup/SignupForm.test.tsx`
- `tests/e2e/signup-flow.spec.ts`

#### Dependencies
- UI-001 must be `Shipped` (the `/signup` stub from UI-001 is replaced here)
- UI-004 should be `Shipped` (pricing CTAs need to be wired to land here with `?tier=<slug>`)

#### Notes
- This is the last UI shell before app interior begins (UI-006 = dashboard shell).
- All validation is client-side. Do NOT wire to any auth backend in this entry. Real auth is BE-001. Adding even a fake POST endpoint creates confusion about what's mocked vs real.

---

### UI-006 — App shell (post-login)

**Status:** Shipped — squash-merged `fca3ffd` (feat/ui-006-app-shell → main)
**Branch:** `feat/ui-006-app-shell` (FE, from `main`)
**Effort:** 1 session (~4–5h)

#### Scope
**In:**
- New Next.js route group `(app)/` establishes the authenticated app shell (no URL prefix; sidebar chrome only).
- `app/(app)/layout.tsx` renders `<AppShell>` composing `<Sidebar />` + a `<main>` content frame.
- Sidebar (left rail, 240px desktop, off-canvas drawer on mobile):
  - Wordmark "Le Méthodic" at top (serif italic, matches landing wordmark).
  - 5 nav links, in order: **Tableau de bord** (`/dashboard`), **L'École** (`/ecole`), **Le Vocabulaire** (`/vocabulaire`), **Le Diagnostic** (`/diagnostic`), **Compte** (`/account`).
  - Active link highlighted via `usePathname()` — `--ed-accent` left border + bold weight + `--bg-elevated` row background.
  - On mobile (≤768px), sidebar collapses behind a hamburger button rendered in a thin top bar; clicking opens an off-canvas drawer.
- Main content frame: padded container, max-width 1200px, gutter `clamp(16px, 3vw, 32px)`, applies `.ed-page-enter` on route change.
- Stub pages created for new routes: `/dashboard` and `/account` (each renders a heading + "Bientôt disponible." placeholder under the shell).
- Existing routes that already live outside the group (`/ecole` and any others) continue to render under their current layout for now — they migrate into `(app)` in their respective UI entries (UI-008+).

**Out:**
- Auth gate / redirect-to-login (deferred to BE-001).
- User avatar + dropdown menu in the top bar (deferred to UI-007 polish or a Section 2 entry).
- Notifications center (Section 7).
- Search bar in the chrome (deferred).
- Persistent sidebar-collapse preference / desktop collapse toggle (defer to MOCK).
- Real dashboard, lesson list, vocab list, diagnostic content (UI-007 through UI-013).
- Onboarding nudges / first-run banner (defer).

#### Acceptance (Given/When/Then)
1. **Given** a visitor on `/dashboard`, **When** the page renders, **Then** the sidebar with 5 nav links is visible on the left and the content frame on the right.
2. **Given** desktop ≥1024px, **When** the page loads, **Then** the sidebar is permanently visible at 240px and no hamburger button is rendered.
3. **Given** mobile <768px, **When** the page loads, **Then** the sidebar is hidden behind a hamburger button; clicking it opens an off-canvas drawer containing the 5 nav links.
4. **Given** the visitor is on `/dashboard`, **When** the sidebar renders, **Then** the "Tableau de bord" link has the active state and the other 4 do not.
5. **Given** the visitor clicks "Compte" from the sidebar, **When** the click fires, **Then** the router navigates to `/account` and the active state shifts to "Compte".

#### Tests
- `tests/unit/layout/AppShell.test.tsx` (vitest) — renders `<Sidebar />` + children slot.
- `tests/unit/layout/Sidebar.test.tsx` (vitest) — renders 5 nav links with correct hrefs; active state matches a mocked `usePathname`.
- `tests/e2e/app-shell.spec.ts` (Playwright) — desktop: shell renders on `/dashboard`, sidebar links navigate, active state updates. Mobile: hamburger opens drawer, link click navigates and closes drawer.

#### Files Touched
- `app/(app)/layout.tsx` — new shell layout
- `app/(app)/dashboard/page.tsx` — stub
- `app/(app)/account/page.tsx` — stub
- `components/layout/AppShell.tsx` — new
- `components/layout/Sidebar.tsx` — new
- `components/layout/SidebarLink.tsx` — single nav link with active state
- `tests/unit/layout/AppShell.test.tsx`
- `tests/unit/layout/Sidebar.test.tsx`
- `tests/e2e/app-shell.spec.ts`

#### Dependencies
- UI-001 through UI-005 Shipped (marketing surfaces stable; interior work begins here).

#### Notes
- The `(app)` route group is the convention from this entry forward — UI-007 through UI-013 all live inside it. Do not add an `/app` URL prefix; the route group is invisible in URLs and keeps `/dashboard`, `/ecole`, etc. clean.
- Existing `/ecole` page (with empty-state / network-error handling from F-BUGS-001-FE-C, F-BUGS-001-FE-D) is **not** migrated here. It keeps rendering under its current layout. UI-008 replaces it with the shell-wrapped lesson list view.
- Sidebar typography and the active-state treatment are inherited by every authenticated screen — get them right here so UI-007–UI-015 don't need to revisit.
- Do NOT add auth gating. BE-001 wraps the `(app)` layout with a session check. For now any visitor can reach `/dashboard`.

---

### UI-007 — Dashboard shell

**Status:** Not Started
**Branch:** `feat/ui-007-dashboard-shell` (FE, from `main`)
**Effort:** 1 session (~3–4h)

#### Scope
**In:**
- `/dashboard` page (replaces the UI-006 stub) renders inside the `(app)` shell.
- Welcome heading: "Bonjour" (no name interpolation yet — BE-001 wires user identity).
- Sub-heading: today's date in French long format using `Intl.DateTimeFormat('fr-CA', { dateStyle: 'full' })`.
- 4 widget cards in a responsive grid (1-col mobile, 2-col tablet, 2×2 desktop, 4-col ≥1440px):
  1. **Progression** — 5-couche stack with placeholder fill levels per layer (Le Fond 80%, Les Moules des Idées 60%, Les Moules 50%, Les Réflexes Anglais 35%, La Voix 20%) rendered as horizontal bars.
  2. **Activité récente** — list of 3 hardcoded rows (e.g. "Leçon 4 terminée — il y a 2 jours", "10 chunks révisés — il y a 3 jours", "Diagnostic Tâche 1 essayée — il y a 5 jours").
  3. **Prochaine leçon** — card showing "Leçon 5 : Les expressions de probabilité" + CTA "Reprendre" → `/ecole/5`.
  4. **Score Diagnostic** — placeholder score "C1" with sub-text "Dernière évaluation : il y a 7 jours" + CTA "Voir le détail" → `/diagnostic`.
- Each widget is a `<section>` with its own heading and the `.ed-card-lift` hover treatment.

**Out:**
- Real progress data (BE-XXX endpoints).
- Real activity log (BE).
- Streak / engagement counters (defer).
- Charts via Recharts (placeholders are CSS bars; Recharts only when real data lands).
- Onboarding tour / coach marks (defer).
- Dismissible banners / nudges (defer).
- Per-user personalization (BE).
- Extracting placeholder data to a fixture file (keep it inline in the widget component — fixture lands in MOCK-XXX).

#### Acceptance (Given/When/Then)
1. **Given** a visitor on `/dashboard`, **When** the page renders, **Then** the welcome heading, today's date, and all 4 widget cards are visible inside the `(app)` shell.
2. **Given** desktop ≥1280px, **When** the page renders, **Then** the 4 widgets render in a 2×2 grid with equal heights.
3. **Given** mobile <768px, **When** the page renders, **Then** the 4 widgets stack vertically with consistent vertical rhythm.
4. **Given** the "Prochaine leçon" CTA, **When** clicked, **Then** the router navigates to `/ecole/5`.
5. **Given** the "Score Diagnostic" CTA, **When** clicked, **Then** the router navigates to `/diagnostic`.

#### Tests
- `tests/unit/dashboard/Dashboard.test.tsx` (vitest) — renders heading, date, and all 4 widget cards.
- `tests/unit/dashboard/ProgressWidget.test.tsx` (vitest) — renders 5 layer bars in the locked order.
- `tests/unit/dashboard/RecentActivityWidget.test.tsx` (vitest) — renders 3 activity rows.
- `tests/e2e/dashboard.spec.ts` (Playwright) — page loads, all widgets visible, "Prochaine leçon" CTA navigates to `/ecole/5`, mobile layout stacks single-column.

#### Files Touched
- `app/(app)/dashboard/page.tsx` — replaces UI-006 stub
- `components/dashboard/Dashboard.tsx` — composes the 4 widgets
- `components/dashboard/ProgressWidget.tsx`
- `components/dashboard/RecentActivityWidget.tsx`
- `components/dashboard/NextLessonWidget.tsx`
- `components/dashboard/DiagnosticScoreWidget.tsx`
- `tests/unit/dashboard/Dashboard.test.tsx`
- `tests/unit/dashboard/ProgressWidget.test.tsx`
- `tests/unit/dashboard/RecentActivityWidget.test.tsx`
- `tests/e2e/dashboard.spec.ts`

#### Dependencies
- UI-006 must be Shipped (shell must exist).

#### Notes
- All widget data is hardcoded inline in component files. Do NOT extract to a fixture or "fake API" hook — that abstraction lands in MOCK-XXX once realistic data takes shape.
- The 5-couche order in the Progression widget is locked: Le Fond, Les Moules des Idées, Les Moules, Les Réflexes Anglais, La Voix.
- This is the first screen a logged-in user sees. The widgets are visual stubs; the layout and typography are real and should not need to change when live data lands.

---

### UI-008 — L'École lesson list view

**Status:** Not Started
**Branch:** `feat/ui-008-ecole-lesson-list` (FE, from `main`)
**Effort:** 1 session (~3–4h)

#### Scope
**In:**
- `/ecole` route moves into the `(app)` route group at `app/(app)/ecole/page.tsx`, displacing the existing standalone page.
- Page header: "L'École" + tagline ("La méthode en 27 leçons.") + 1-sentence intro paragraph.
- Two sections, in order:
  - **Fondations** — section heading, then a grid of 16 lesson cards (lessons 1–16).
  - **Approfondissement** — section heading, then a grid of 11 lesson cards (lessons 17–27).
- Lesson card: number badge, title (placeholder), 1-sentence description (placeholder), state badge — one of "Terminée" / "Disponible" / "Verrouillée". Placeholder distribution: first 3 Terminée, next 3 Disponible, remaining 21 Verrouillée.
- Card grid: 1-col mobile, 2-col tablet (≥640px), 3-col desktop (≥1024px), 4-col ≥1280px.
- Each card is a `<Link>` to `/ecole/[id]` where `[id]` is the lesson number (1–27).
- Static fixture `lib/data/lessons.ts` exports 27 lesson objects `{ id, title, description, section, state }`.

**Out:**
- Real lesson titles, descriptions, and body content (CON-XXX).
- Per-user completion state (BE-XXX; placeholders are static).
- Pre-requisite gating logic (BE).
- Search / filter / sort (defer).
- Lesson preview on hover (defer).
- Old `/ecole` empty-state and network-error logic from F-BUGS-001-FE-C / FE-D — not applicable here because data is static. The bug-fix code is removed as part of this migration.

#### Acceptance (Given/When/Then)
1. **Given** a visitor on `/ecole`, **When** the page renders, **Then** "Fondations" shows exactly 16 cards (lessons 1–16) and "Approfondissement" shows exactly 11 (lessons 17–27), in numerical order.
2. **Given** desktop ≥1024px, **When** the page renders, **Then** cards display in a 3-col grid with equal heights and consistent gutters.
3. **Given** mobile <640px, **When** the page renders, **Then** cards stack 1-col with consistent vertical rhythm.
4. **Given** lesson card #5, **When** clicked, **Then** the router navigates to `/ecole/5`.
5. **Given** the page rendered inside the `(app)` shell, **When** the sidebar shows, **Then** the "L'École" link has active state.

#### Tests
- `tests/unit/ecole/LessonList.test.tsx` (vitest) — renders 27 cards split into 16/11 across the two sections in correct numerical order.
- `tests/unit/ecole/LessonCard.test.tsx` (vitest) — renders with passed props; href matches lesson id.
- `tests/e2e/ecole-list.spec.ts` (Playwright) — section counts correct (16 + 11), card click navigates to `/ecole/<id>`, mobile stacks 1-col.

#### Files Touched
- `app/(app)/ecole/page.tsx` — new (replaces existing `app/ecole/page.tsx`; delete the old file)
- `components/ecole/LessonList.tsx` — composes the two sections + grid
- `components/ecole/LessonCard.tsx` — single card
- `lib/data/lessons.ts` — static fixture of 27 lesson objects
- `tests/unit/ecole/LessonList.test.tsx`
- `tests/unit/ecole/LessonCard.test.tsx`
- `tests/e2e/ecole-list.spec.ts`

#### Dependencies
- UI-006 must be Shipped (shell must exist).

#### Notes
- The 16 Fondations + 11 Approfondissement split is locked methodology terminology. Do not rename or re-segment.
- Existing `/ecole` page is deleted. Its empty-state + network-error logic (F-BUGS-001-FE-C, F-BUGS-001-FE-D) is removed — the static fixture has no network call. If those edge-state UI components have value, lift them into `components/common/` for reuse by BE-XXX-wired views; otherwise drop.
- Lesson titles and descriptions are placeholders. Real titles land in CON-XXX. Pick plausible-sounding French placeholders; do not invent methodology terms that would need reconciliation later.
- State distribution (3 Terminée / 3 Disponible / 21 Verrouillée) is illustrative. Real state comes from BE-XXX progress endpoints.

---

### UI-009 — L'École lesson detail view

**Status:** Not Started
**Branch:** `feat/ui-009-ecole-lesson-detail` (FE, from `main`)
**Effort:** 1 session (~3–4h)

#### Scope
**In:**
- `/ecole/[id]` dynamic route inside the `(app)` shell at `app/(app)/ecole/[id]/page.tsx`.
- Breadcrumb at top: `L'École > Leçon <num> : <title>`.
- Lesson header: section badge ("Fondations" or "Approfondissement"), lesson number, lesson title.
- Audio player placeholder (top of content area): rounded surface with play button, scrubber visual (static fill, e.g. `0:00 / 12:34`), volume icon. Non-functional — clicks do nothing.
- Content area: 3 stacked sections, each with its own heading:
  1. **Introduction** — 2–3 placeholder paragraphs.
  2. **Méthode** — 2–3 placeholder paragraphs (where the 5-couche layer for this lesson would be surfaced).
  3. **Pratique** — placeholder prompt block (e.g. "Essayez à voix haute : ...") with 2–3 example prompts.
- Lesson navigation at bottom: "← Leçon précédente" (links to `/ecole/<id-1>`) and "Leçon suivante →" (links to `/ecole/<id+1>`):
  - Lesson 1: no prev button rendered.
  - Lesson 27: no next button rendered.
- Reads lesson title/section from `lib/data/lessons.ts` fixture by id.
- Invalid id (e.g. `/ecole/99`, `/ecole/abc`) renders Next.js 404 via `notFound()`.

**Out:**
- Real audio playback (AI-XXX with TTS).
- Real lesson body content (CON-XXX).
- Progress tracking, mark-as-complete (BE-XXX).
- Note-taking, highlights, bookmarks (defer).
- Quiz at end of lesson (defer to dedicated entry).
- Comments / discussion (out of scope indefinitely).
- Transcript toggle on the audio (defer).
- Playback speed control (defer).

#### Acceptance (Given/When/Then)
1. **Given** `/ecole/3` loaded, **When** the page renders, **Then** breadcrumb, header, audio-player placeholder, 3 content sections, and nav buttons are visible inside the `(app)` shell.
2. **Given** `/ecole/1` loaded, **When** the page renders, **Then** the previous-lesson button is not rendered and the next-lesson button links to `/ecole/2`.
3. **Given** `/ecole/27` loaded, **When** the page renders, **Then** the next-lesson button is not rendered and the previous-lesson button links to `/ecole/26`.
4. **Given** `/ecole/99` loaded, **When** the route handler runs, **Then** the Next.js 404 page renders.
5. **Given** mobile <768px, **When** the page renders, **Then** content stacks single-column and the audio player is full-width.

#### Tests
- `tests/unit/ecole/LessonDetail.test.tsx` (vitest) — renders header, 3 content sections, audio placeholder; nav buttons reflect lesson id (1 → no prev, 27 → no next, mid → both).
- `tests/unit/ecole/AudioPlayerPlaceholder.test.tsx` (vitest) — renders play button + scrubber + volume; click does nothing.
- `tests/e2e/ecole-detail.spec.ts` (Playwright) — load `/ecole/3`, all elements visible; click next → land on `/ecole/4`; load `/ecole/27` → no next button; load `/ecole/99` → 404.

#### Files Touched
- `app/(app)/ecole/[id]/page.tsx` — new dynamic route
- `components/ecole/LessonDetail.tsx`
- `components/ecole/AudioPlayerPlaceholder.tsx`
- `components/ecole/LessonNav.tsx`
- `components/common/Breadcrumb.tsx` — new generic breadcrumb (reusable by UI-014/015)
- `lib/data/lessons.ts` — updated if needed (already exists from UI-008)
- `tests/unit/ecole/LessonDetail.test.tsx`
- `tests/unit/ecole/AudioPlayerPlaceholder.test.tsx`
- `tests/e2e/ecole-detail.spec.ts`

#### Dependencies
- UI-006 Shipped (shell).
- UI-008 Shipped (lesson fixture + list view that links here).

#### Notes
- Audio player is visual only. Do NOT add an `<audio>` element, Web Audio API, or any playback library. AI-XXX wires the real player when TTS audio lands.
- Lesson body content is placeholder prose. Don't fabricate methodology — keep paragraphs generic (e.g. "Dans cette leçon, vous découvrirez...") rather than invent fake 5-couche content that would later need reconciliation with real curriculum.
- The Breadcrumb component is intentionally generic and reusable — UI-014/015 will reuse it.

---

### UI-010 — Le Vocabulaire browse view

**Status:** Not Started
**Branch:** `feat/ui-010-vocabulaire-browse` (FE, from `main`)
**Effort:** 1 session (~4–5h)

#### Scope
**In:**
- `/vocabulaire` route inside `(app)` shell at `app/(app)/vocabulaire/page.tsx`.
- Page header: "Le Vocabulaire" + tagline ("Les chunks qui font la différence.").
- Filter bar (sticky below header on desktop, collapsible on mobile behind a "Filtres" button):
  - **CEFR level** chips — `A1` `A2` `B1` `B2` `C1` (multi-select; click toggles inclusion; default = all 5 selected).
  - **Source** dropdown — single-select; options: "Toutes les sources", "Média", "Conversation", "Travail", "Voyage", "Quotidien".
  - **Search** input — text field; filters by case-insensitive substring match in the French chunk.
- Chunk list: scrollable single-column list (no virtualization library). Each row shows:
  - French chunk (e.g. "Ça tombe à pic")
  - English gloss (e.g. "That's perfect timing")
  - CEFR badge
  - Source pill
  - Save icon (heart or bookmark, visual only — not wired)
- Static fixture `lib/data/chunks.ts` of 30 hand-crafted chunks spanning all 5 CEFR levels and all 5 sources.
- Empty state: when no chunks match the active filter combination, render an inline message ("Aucun chunk ne correspond à vos filtres.") + "Réinitialiser les filtres" button that restores defaults.
- Filter logic lives in a pure function `lib/vocab/filter.ts` so BE-XXX can later swap the data source without touching filter code.

**Out:**
- Real chunk data (CON-001+ vocab CSV review; 1,684 chunks awaiting Chadi triage).
- Real save / collection wiring (BE-XXX).
- Practice mode (UI-011).
- Test mode (UI-012).
- Audio playback per chunk (AI-XXX).
- Spaced-repetition logic (AI section).
- Server-side pagination, search, or filter (client-side over the 30-entry fixture only).
- Sorting (defer).
- Tag-based filters beyond source (defer).
- Save-state persistence — no `localStorage`, no BE call (BE-XXX wires it).

#### Acceptance (Given/When/Then)
1. **Given** `/vocabulaire` loaded, **When** the page renders, **Then** the filter bar and 30 chunk rows are visible inside the `(app)` shell.
2. **Given** the user deselects the `A1` chip (with all 5 selected initially), **When** the filter applies, **Then** the list re-renders showing only rows whose CEFR is `A2`, `B1`, `B2`, or `C1`.
3. **Given** the user selects "Média" from the source dropdown, **When** the filter applies, **Then** the list shows only rows tagged with source `Média`.
4. **Given** the user types "tomber" into the search input, **When** the filter applies, **Then** the list shows only rows whose French chunk contains "tomber" (case-insensitive).
5. **Given** the user combines filters such that no chunk matches, **When** the list re-renders, **Then** the empty state with "Réinitialiser les filtres" button is shown; clicking the button restores all filters to default.
6. **Given** mobile <768px, **When** the page renders, **Then** the filter bar collapses behind a "Filtres" button and chunk rows are full-width single-column.

#### Tests
- `tests/unit/vocabulaire/VocabBrowse.test.tsx` (vitest) — renders header, filter bar, and 30 chunks from fixture.
- `tests/unit/vocabulaire/FilterBar.test.tsx` (vitest) — CEFR chip toggle, source dropdown, search input update state correctly.
- `tests/unit/vocabulaire/ChunkRow.test.tsx` (vitest) — renders chunk + gloss + CEFR + source + save icon.
- `tests/unit/vocabulaire/filter-logic.test.ts` (vitest) — pure-function tests on `applyFilters(chunks, filterState)` covering CEFR + source + search combinations and empty-result case.
- `tests/e2e/vocabulaire-browse.spec.ts` (Playwright) — deselect A1 filters list; source dropdown filters list; search input filters list; empty state appears when no match; mobile "Filtres" button opens collapsed filter bar.

#### Files Touched
- `app/(app)/vocabulaire/page.tsx` — new
- `components/vocabulaire/VocabBrowse.tsx`
- `components/vocabulaire/FilterBar.tsx`
- `components/vocabulaire/ChunkRow.tsx`
- `components/vocabulaire/EmptyState.tsx`
- `lib/data/chunks.ts` — 30-entry static fixture
- `lib/vocab/filter.ts` — pure `applyFilters(chunks, filterState)` function
- `tests/unit/vocabulaire/VocabBrowse.test.tsx`
- `tests/unit/vocabulaire/FilterBar.test.tsx`
- `tests/unit/vocabulaire/ChunkRow.test.tsx`
- `tests/unit/vocabulaire/filter-logic.test.ts`
- `tests/e2e/vocabulaire-browse.spec.ts`

#### Dependencies
- UI-006 must be Shipped (shell).

#### Notes
- The 30 chunks in the fixture are plausible-looking placeholders. F-321 vocab CSV (1,684 chunks awaiting Chadi triage per memory) lands in CON-001. UI-010 does not touch real data.
- Filter logic lives in a pure function so BE-XXX can swap data source from fixture to API without rewriting filter code.
- Save icon is visual only. BE-XXX adds the save endpoint. Do NOT add `localStorage` persistence here — it creates a fake-state migration headache when BE wires up.
- "Source" taxonomy ("Média", "Conversation", "Travail", "Voyage", "Quotidien") is provisional. CON-001 vocab review will validate or revise it.

---

### UI-011 to UI-015 — Section 1 remaining entries (titles only)

To be populated in subsequent planning sessions. Order reflects user journey through the app.

| ID | Title | Purpose |
|----|-------|---------|
| UI-011 | Le Vocabulaire practice view | Flashcard-style shell, front/back placeholder |
| UI-012 | Le Vocabulaire test view | Multi-choice quiz shell |
| UI-013 | Le Diagnostic landing | Persona match, exam overview, "Start Diagnostic" CTA |
| UI-014 | Le Diagnostic Tâche 1/2/3 unified shell | Question display + recording UI placeholder + timer |
| UI-015 | Le Diagnostic results view | 5-couche score breakdown placeholder + recommendations stub |

Each will be populated with the same template structure (Scope/Out/Acceptance/Tests/Files/Dependencies/Notes) when its planning session opens.

---

## Section 2 — Mock Data + UI Polish (MOCK-001 to MOCK-012)

**Goal:** every UI shell from Section 1 displays realistic-looking data, has motion polish, and feels like a finished product even though no backend is wired. This is the section that turns shells into a demo-able product. Beta cohort can be invited at end of this section.

**Strategic step:** maps to Step 1 (data layer continues in parallel; mocks here are JSON fixtures hand-curated by Chadi).

**ID range:** MOCK-001 to MOCK-012. To be populated in subsequent planning sessions.

---

## Section 3 — Backend Wiring (BE-001 to BE-022)

**Goal:** replace mock JSON fixtures with real API calls. One surface at a time. Auth first (BE-001), then read endpoints, then write endpoints. F-406 auth hardening (refresh tokens, rate limits, hCaptcha) ships in this section.

**Strategic step:** maps to Step 2b (surface wiring).

**ID range:** BE-001 to BE-022. To be populated in subsequent planning sessions.

---

## Section 4 — Content Pipeline (CON-001 to CON-014)

**Goal:** real content lives behind the surfaces. F-321 vocab review (1,684 Phase 1 chunks awaiting Chadi triage) lands here. L'École 27 lessons get methodology-visible content. Le Diagnostic Tâche library expands to 50 scenarios (F-061.2 Livraison 2/2).

**Strategic step:** maps to Step 2b → Step 3.

**ID range:** CON-001 to CON-014. To be populated in subsequent planning sessions.

**Critical note:** F-321 vocab CSV review is the highest-leverage Chadi-bottlenecked work right now. CON-001 will be the entry that absorbs that workstream into the PRD.

---

## Section 5 — AI Infrastructure (AI-001 to AI-018)

**Goal:** Le Maître ElevenLabs voice deployed across L'École, Le Vocabulaire, Le Diagnostic onboarding. OpenAI TTS-1-HD remains the examiner voice for Tâches (brand-critical, non-negotiable). RAG layer goes live with 6 retrieval modes. F-322 validator (3 tiers, web admin + Slack + CSV, eager sample Tier B). 2-pass Diagnostic scoring: Pass 2 V1, Pass 1 V1.5+.

**Strategic step:** maps to Step 2a (runtime stack swap) → Step 3.

**ID range:** AI-001 to AI-018. To be populated in subsequent planning sessions.

**Critical note:** Whisper (STT) and Piper (vocab TTS narration) are fine in this section. **Never** swap OpenAI TTS-1-HD for the examiner voice — that's the brand signal locked May 19.

---

## Section 6 — Legal + Business Formation (LGL-001 to LGL-008)

**Goal:** Delaware LLC via Stripe Atlas → EIN → Mercury bank → Stripe activation (B-100 sequence). Lawyer engagement immediate at start of this section, 4-week lead time (B-101, $3–5K CAD legal budget). ToS, privacy policy, pseudonym + NER + retention policy (per architecture lock Q4). Data subject rights + cookie banner.

**Strategic step:** maps to Step 3.

**ID range:** LGL-001 to LGL-008. To be populated in subsequent planning sessions.

---

## Section 7 — Launch (LCH-001 to LCH-009)

**Goal:** Stripe live, payments confirmed end-to-end, monitoring (Sentry / PostHog / uptime), programmatic SEO foundation (M-013), authored blog scaffolding, YouTube channel structure, beta cohort invited (30–50 beta → 200–500 soft → 5K+ Y1 public).

**Strategic step:** maps to Step 3.

**ID range:** LCH-001 to LCH-009. To be populated in subsequent planning sessions.

**Launch gate:** all of Section 1 (UI shells) + all of Section 2 (mocks) + critical path through Sections 3–5 + all of Section 6 must be `Shipped` before LCH-009 (public launch) can ship. Quality-gated, no date pressure (memory lock).

---

## Appendix A — Migration from Old Backlog

The following old-style ticket IDs are absorbed into PRD entries below. As each old ticket is migrated, this table gets a new row.

| Old ID | New PRD ID | Notes |
|--------|-----------|-------|
| _(empty)_ | _(empty)_ | Populated as entries are written |

Old IDs continue to appear in git commit history and the deprecated `lemethodic-backlog-2026-05-18.md`. New work must use PRD IDs.

---

## Appendix B — Files Killed by This PRD

The following files are deprecated as of May 21, 2026. Do not reference, do not regenerate:
- `parse_backlog.py` (orchestrator)
- `dispatch_agent.py` (orchestrator)
- `n8n-workflow.json` (orchestrator)
- `lemethodic-workload-allocation.html` (assumed multi-agent capacity, obsolete in solo mode)
- `LeMethodic_Master_Backlog.docx` (was already dead per prior memory lock)

The strategic artifacts from May 17–18 (`lemethodic-architecture-v2.html`, `lemethodic-gtm-v2.html`, `lemethodic-ops-blueprint-v1.html`, `lemethodic-revenue-estimator.html`) remain valid reference documents — they inform the PRD but the PRD is now the execution source of truth.

---

*End of PRD v1.*
