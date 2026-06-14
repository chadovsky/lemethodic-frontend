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

**Status:** Shipped — squash-merged `8435aa8` (feat/ui-007-dashboard-shell → main)
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

**Status:** Shipped — squash-merged `05c934e` (feat/ui-008-ecole-lesson-list → main), resolves V-016c
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

**Status:** Shipped — squash-merged 7a13ce3 (feat/ui-009-ecole-lesson-detail → main)
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

**Status:** Shipped — squash-merged 9276812 (feat/ui-010-vocab-browse → main)
**Branch:** `feat/ui-010-vocab-browse` (FE, from `main`)
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

### UI-011 — Le Vocabulaire practice view

**Status:** Shipped — squash-merged 5a359c0 (feat/ui-011-vocab-practice → main)
**Branch:** `feat/ui-011-vocab-practice` (FE, from `main`)
**Effort:** 1 session (~3–4h)

#### Scope
**In:**
- `/vocabulaire/practice` route inside `(app)` shell at `app/(app)/vocabulaire/practice/page.tsx`.
- Entry point: a "Pratiquer" CTA added to the UI-010 browse-view header that routes here.
- Page header: "Pratique" + 1-line descriptor ("Révisez vos chunks, un par un.") + a "Retour à la liste" link back to `/vocabulaire`.
- Single flashcard surface centered in the content frame, max-width ~520px:
  - **Front (default state):** French chunk in display typography (large, serif-italic kicker), CEFR badge + source pill below.
  - **Back (revealed state):** English gloss in display typography, plus the French chunk in a smaller line above for reference.
  - Card flips via click anywhere on the card OR press of the spacebar; flip is a CSS `transform: rotateY(180deg)` with 250ms transition (respects `prefers-reduced-motion`).
- Below the card, in order:
  - Progress label: "Carte <n> sur <total>" (e.g. "Carte 3 sur 30").
  - Three action buttons in a row: "À revoir" (left) · "Suivant" (center, primary) · "Connu" (right). All three advance to the next card; the left/right buttons are visual-only tags (no persistence, no state — they exist so the affordance is real).
  - "Précédent" link in a smaller affordance above or to the side of the action row; disabled visually on card 1.
- Card source is the same `lib/data/chunks.ts` fixture from UI-010, iterated in array order. No shuffling, no spaced-repetition selection.
- End-of-deck state: after the last card's "Suivant" press, the card area is replaced with a "Vous avez terminé les 30 chunks." panel + a "Recommencer" button (resets to card 1) and a "Retour à la liste" link to `/vocabulaire`.

**Out:**
- Real audio playback of the French chunk (AI-XXX with TTS — see Notes; no `<audio>` element here).
- Real spaced-repetition scheduling / SM-2 / Leitner box logic (AI section).
- Persistence of "À revoir" / "Connu" tags — no `localStorage`, no BE call (BE-XXX wires it).
- Filtering the practice deck by CEFR or source (defer; deck is always the full 30-entry fixture).
- Shuffle / randomize button (defer).
- Keyboard shortcuts beyond spacebar-to-flip (arrow-keys advance, etc. — defer).
- Timer / per-card deadline (out of scope; practice is self-paced).
- Real audio elements of any kind — visual affordances only.

#### Acceptance (Given/When/Then)
1. **Given** a visitor on `/vocabulaire/practice`, **When** the page renders, **Then** the first chunk's French side is visible, the progress label reads "Carte 1 sur 30", and the three action buttons + "Précédent" affordance are present inside the `(app)` shell.
2. **Given** the front of a card is showing, **When** the user clicks the card (or presses spacebar), **Then** the card flips to the back state showing the English gloss; clicking/pressing again flips back.
3. **Given** card 5 of 30 is visible, **When** "Suivant" is clicked, **Then** card 6 renders in its front state and progress reads "Carte 6 sur 30".
4. **Given** card 1 is visible, **When** the user inspects "Précédent", **Then** it is rendered in a visually disabled state and clicking it does not change the card.
5. **Given** card 30 is visible, **When** "Suivant" is clicked, **Then** the end-of-deck panel is shown with a "Recommencer" button; clicking it returns the user to card 1.
6. **Given** mobile <768px, **When** the page renders, **Then** the card is full-width with comfortable padding and the three action buttons stack or remain single-row tap-friendly (≥44×44px each).

#### Tests
- `tests/unit/vocabulaire/PracticeDeck.test.tsx` (vitest) — renders the first card; "Suivant" advances state; "Précédent" disabled at index 0; end-of-deck panel renders after index 29; "Recommencer" resets to index 0.
- `tests/unit/vocabulaire/Flashcard.test.tsx` (vitest) — front renders French + CEFR + source; click toggles to back showing gloss; spacebar key event toggles flip.
- `tests/e2e/vocabulaire-practice.spec.ts` (Playwright) — load page, flip card, advance to card 2, advance to end, click "Recommencer", verify card 1 again; mobile viewport renders single-column.

#### Files Touched
- `app/(app)/vocabulaire/practice/page.tsx` — new
- `components/vocabulaire/PracticeDeck.tsx` — owns deck index + flip state
- `components/vocabulaire/Flashcard.tsx` — single card with front/back faces
- `components/vocabulaire/PracticeActions.tsx` — the 3-button action row + "Précédent" affordance
- `components/vocabulaire/EndOfDeck.tsx` — terminal panel
- `components/vocabulaire/VocabBrowse.tsx` — updated to add "Pratiquer" CTA in header
- `lib/data/chunks.ts` — unchanged from UI-010
- `tests/unit/vocabulaire/PracticeDeck.test.tsx`
- `tests/unit/vocabulaire/Flashcard.test.tsx`
- `tests/e2e/vocabulaire-practice.spec.ts`

#### Dependencies
- UI-006 Shipped (shell).
- UI-010 Shipped (chunks fixture + entry-point header to host the "Pratiquer" CTA).

#### Notes
- Do NOT add an `<audio>` element, Web Audio API, or any TTS library to play the French chunk. AI-XXX wires real audio. A speaker icon is acceptable as a visual affordance only — disabled or static, never wired.
- "À revoir" and "Connu" are intentionally non-persistent tags. The affordance has to feel real so beta cohort can react to the flow, but persistence is BE-XXX's job. Do not add `localStorage` — it creates a fake-state migration headache when BE wires up (same rule as UI-010 save icon).
- The flashcard flip is the one piece of motion polish in this entry. Keep the rest of the surface restrained — this is a study tool, not a game show.
- Deck order is fixture-array order. Spaced-repetition selection is AI-XXX work; do not approximate it here.

---

### UI-012 — Le Vocabulaire test view

**Status:** Shipped — squash-merged 48def59 (feat/ui-012-vocab-test → main)
**Branch:** `feat/ui-012-vocab-test` (FE, from `main`)
**Effort:** 1 session (~3–4h)

#### Scope
**In:**
- `/vocabulaire/test` route inside `(app)` shell at `app/(app)/vocabulaire/test/page.tsx`.
- Entry point: a "Tester" CTA added to the UI-010 browse-view header (alongside the "Pratiquer" CTA from UI-011) that routes here.
- Page header: "Test" + 1-line descriptor ("10 chunks, à vous de retrouver la traduction.") + "Retour à la liste" link to `/vocabulaire`.
- Quiz body, one question at a time, centered in the content frame, max-width ~600px:
  - **Question prompt:** French chunk in display typography (same kicker treatment as UI-011 flashcard front) + CEFR badge + source pill.
  - **Answer choices:** 4 English gloss options as full-width selectable cards, A/B/C/D labeled. One is the correct gloss; the other 3 are distractor glosses pulled from other chunks in the fixture (selected deterministically by index so tests are repeatable).
  - **Submit button:** primary CTA below the choices; disabled until a choice is selected.
- Feedback state after Submit: the selected choice gets a correct/incorrect visual treatment (green/red border-only, no celebratory animation), the correct answer is always highlighted in the correct state, and a "Question suivante" CTA replaces Submit.
- Progress label: "Question <n> sur 10" above the prompt.
- Quiz pulls the first 10 chunks from `lib/data/chunks.ts` (deterministic, no shuffling).
- End-of-quiz state after question 10's "Question suivante" press: results panel showing score in `n/10` format + 1-sentence flavor copy + "Recommencer" button (resets to question 1) + "Retour à la liste" link.
- Quiz-building logic lives in a pure function `lib/vocab/quiz.ts` so BE-XXX can later swap to a server-generated quiz without touching component code.

**Out:**
- Real scoring persistence — no `localStorage`, no BE call (BE-XXX wires it).
- Adaptive difficulty / spaced-repetition selection of questions (AI section).
- Audio prompts (no `<audio>`, no TTS — AI-XXX).
- Timer / per-question countdown (out of scope; test is self-paced).
- Question types beyond multi-choice (e.g. fill-in-the-blank, audio-match — defer).
- Per-question explanation / "why" reveal beyond the correct/incorrect indicator (defer).
- Difficulty / level filter on the question pool (defer).
- Hint button / 50-50 affordance (defer).
- Real audio elements of any kind.

#### Acceptance (Given/When/Then)
1. **Given** a visitor on `/vocabulaire/test`, **When** the page renders, **Then** question 1 of 10 is shown with the French prompt, 4 English-gloss choices labeled A–D, and a disabled Submit button inside the `(app)` shell.
2. **Given** no choice selected, **When** the user inspects Submit, **Then** it is visually disabled and clicking it does not advance.
3. **Given** the user selects choice B, **When** Submit is clicked, **Then** B and the correct choice both show feedback states (incorrect-red if B was wrong, correct-green if B was right; the correct choice is always shown in the correct state) and Submit is replaced by "Question suivante".
4. **Given** "Question suivante" is clicked on question 5, **When** the quiz advances, **Then** question 6 renders fresh (no selection, Submit disabled again) and progress reads "Question 6 sur 10".
5. **Given** the user answers all 10 questions correctly, **When** "Question suivante" is clicked on question 10, **Then** the results panel reads "10 / 10" and offers "Recommencer".
6. **Given** "Recommencer" is clicked, **When** the quiz resets, **Then** question 1 renders fresh with no selection.
7. **Given** mobile <768px, **When** the page renders, **Then** choice cards are full-width single-column with ≥44×44px tap targets.

#### Tests
- `tests/unit/vocabulaire/Quiz.test.tsx` (vitest) — renders question 1 with 4 choices; Submit disabled until selection; advances to question 2 after "Question suivante"; results panel shows score after question 10.
- `tests/unit/vocabulaire/QuizQuestion.test.tsx` (vitest) — renders prompt + 4 choices; click selects; correct/incorrect feedback after Submit.
- `tests/unit/vocabulaire/quiz-logic.test.ts` (vitest) — pure-function tests on `buildQuiz(chunks, count)`: returns N questions, each with 4 unique choices, exactly 1 correct, distractors drawn deterministically from other chunks.
- `tests/e2e/vocabulaire-test.spec.ts` (Playwright) — answer all 10 questions, verify results panel renders with score; "Recommencer" resets state; mobile viewport renders single-column.

#### Files Touched
- `app/(app)/vocabulaire/test/page.tsx` — new
- `components/vocabulaire/Quiz.tsx` — owns question index + selection + feedback state
- `components/vocabulaire/QuizQuestion.tsx` — single question (prompt + 4 choices + Submit)
- `components/vocabulaire/QuizResults.tsx` — terminal panel
- `components/vocabulaire/VocabBrowse.tsx` — updated to add "Tester" CTA in header
- `lib/vocab/quiz.ts` — pure `buildQuiz(chunks, count)` function
- `lib/data/chunks.ts` — unchanged from UI-010
- `tests/unit/vocabulaire/Quiz.test.tsx`
- `tests/unit/vocabulaire/QuizQuestion.test.tsx`
- `tests/unit/vocabulaire/quiz-logic.test.ts`
- `tests/e2e/vocabulaire-test.spec.ts`

#### Dependencies
- UI-006 Shipped (shell).
- UI-010 Shipped (chunks fixture + entry-point header to host the "Tester" CTA).
- UI-011 Shipped recommended (the "Pratiquer" and "Tester" CTAs share header real estate; UI-012 builds atop UI-011's header treatment).

#### Notes
- Distractor selection is deterministic by index, not random. This keeps tests stable and lets beta feedback be reproducible. Real adaptive distractor generation is AI-XXX.
- No score persistence. Same rule as UI-011 "À revoir"/"Connu" tags and UI-010 save icon: BE-XXX wires it, do not add `localStorage` shortcut.
- Feedback colors should respect the editorial palette — border-only treatment, no shouting green/red fills. Use `--ed-accent` ramp variants if needed; the test feels like an assessment, not a Duolingo confetti moment.
- Do NOT add an `<audio>` element to read the French prompt aloud. AI-XXX adds TTS.
- The first 10 chunks of `lib/data/chunks.ts` are the quiz pool. If that fixture is reordered in UI-010 follow-up work, this entry's snapshot tests may need a refresh — flag it in the migration commit.

---

### UI-013 — Le Diagnostic landing

**Status:** Shipped — squash-merged e315798
**Branch:** `feat/ui-013-diagnostic-landing` (FE, from `main`)
**Effort:** 1 session (~3–4h)

#### Scope
**In:**
- `/diagnostic` route inside `(app)` shell at `app/(app)/diagnostic/page.tsx`.
- Page header: "Le Diagnostic" + tagline ("Mesurez votre niveau réel en expression orale TCF Canada.").
- Persona-match section directly below header (matches the editorial tone of landing UI-002, but framed for an authenticated user about to take a test):
  - Heading: "Pourquoi un diagnostic ?"
  - 2–3 short paragraphs explaining what the diagnostic measures, why it matters for visa-urgent anglophone candidates, and that the assessment is method-based (5-couche) — not vocabulary recall.
- Exam overview section: "Le déroulé" with 3 horizontally-arranged cards (1-col mobile, 3-col tablet+):
  - **Tâche 1** — title "Tâche 1 : Échange d'informations" + 2-line descriptor + "Durée : ~3 min" placeholder.
  - **Tâche 2** — title "Tâche 2 : Échange d'opinions" + 2-line descriptor + "Durée : ~3 min 30" placeholder.
  - **Tâche 3** — title "Tâche 3 : Comparaison et argumentation" + 2-line descriptor + "Durée : ~5 min" placeholder.
  - Cards use the same `.ed-card-lift` treatment as UI-007 widgets and UI-008 lesson cards.
- 5-couche preview block (compact, not full visual): single-line list of the 5 layer names (Le Fond / Les Moules des Idées / Les Moules / Les Réflexes Anglais / La Voix) with 1-sentence framing copy: "Votre diagnostic produit un score sur les 5 couches."
- Primary CTA at the bottom: "Commencer le diagnostic" → routes to `/diagnostic/tache/1`.
- Static fixture `lib/data/taches.ts` exports 3 tâche objects `{ id, title, descriptor, durationLabel, prompt }` (the `prompt` field is consumed by UI-014; UI-013 only reads `title`, `descriptor`, `durationLabel`).
- Past-score panel near the top (small, dismissible-visual-only): "Dernier diagnostic : C1 — il y a 7 jours" + "Voir les résultats" link to `/diagnostic/results`. This mirrors the dashboard `DiagnosticScoreWidget` placeholder so the navigation loop reads consistent. Placeholder only; static.

**Out:**
- Real persona-match data (the copy is generic for now; no user-specific personalization).
- Real past-score data (BE-XXX).
- Pre-flight checks (mic permission, browser support — UI-014's concern, deferred there too as a placeholder).
- Diagnostic history list (defer).
- Comparative cohort benchmarks (defer; needs real data).
- Sample-question previews (defer).
- Estimated-time-to-complete calculator (defer).
- Onboarding tooltip / first-time walkthrough overlay (defer).

#### Acceptance (Given/When/Then)
1. **Given** a visitor on `/diagnostic`, **When** the page renders, **Then** the header, persona-match section, "Le déroulé" 3-card overview, 5-couche preview block, and primary CTA are all visible inside the `(app)` shell.
2. **Given** desktop ≥1024px, **When** the page renders, **Then** the 3 tâche cards display side-by-side in a row with equal heights.
3. **Given** mobile <768px, **When** the page renders, **Then** the 3 tâche cards stack vertically and the primary CTA remains visible without horizontal scroll.
4. **Given** the primary "Commencer le diagnostic" CTA, **When** clicked, **Then** the router navigates to `/diagnostic/tache/1`.
5. **Given** the past-score panel rendered, **When** "Voir les résultats" is clicked, **Then** the router navigates to `/diagnostic/results`.
6. **Given** the page rendered inside the `(app)` shell, **When** the sidebar shows, **Then** the "Le Diagnostic" link has active state.

#### Tests
- `tests/unit/diagnostic/DiagnosticLanding.test.tsx` (vitest) — renders header, persona-match section, 3 tâche cards, 5-couche preview, primary CTA, past-score panel.
- `tests/unit/diagnostic/TacheCard.test.tsx` (vitest) — renders title + descriptor + duration; respects fixture data shape.
- `tests/e2e/diagnostic-landing.spec.ts` (Playwright) — load page, verify all sections visible; CTA navigates to `/diagnostic/tache/1`; past-score link navigates to `/diagnostic/results`; mobile viewport stacks cards single-column.

#### Files Touched
- `app/(app)/diagnostic/page.tsx` — new
- `components/diagnostic/DiagnosticLanding.tsx`
- `components/diagnostic/TacheOverviewGrid.tsx`
- `components/diagnostic/TacheCard.tsx`
- `components/diagnostic/CouchesPreview.tsx`
- `components/diagnostic/PastScorePanel.tsx`
- `lib/data/taches.ts` — static fixture of 3 tâche objects (consumed by UI-013 + UI-014)
- `tests/unit/diagnostic/DiagnosticLanding.test.tsx`
- `tests/unit/diagnostic/TacheCard.test.tsx`
- `tests/e2e/diagnostic-landing.spec.ts`

#### Dependencies
- UI-006 Shipped (shell).
- UI-007 Shipped recommended (the past-score panel mirrors `DiagnosticScoreWidget` — they should read consistently).

#### Notes
- Tâche titles ("Échange d'informations" / "Échange d'opinions" / "Comparaison et argumentation") and durations are placeholders aligned to TCF Canada structure. Real curriculum-validated copy lands in CON-XXX. Don't invent rubric specifics that would need reconciliation.
- The past-score panel is a placeholder echo of the dashboard widget. When BE-XXX wires real scores, both surfaces consume the same endpoint — keep the component prop shape generic enough that the swap is trivial.
- 5-couche order is locked (same as UI-003, UI-007, UI-015): Le Fond, Les Moules des Idées, Les Moules, Les Réflexes Anglais, La Voix.
- `lib/data/taches.ts` is created here but UI-014 is the heavier consumer (it reads the full `prompt` field). Keep the shape stable across both entries.

---

### UI-014 — Le Diagnostic Tâche 1/2/3 unified shell

**Status:** Shipped — squash-merged c57fea8
**Branch:** `feat/ui-014-diagnostic-tache` (FE, from `main`)
**Effort:** 1 session (~4–5h)

#### Scope
**In:**
- `/diagnostic/tache/[n]` dynamic route inside `(app)` shell at `app/(app)/diagnostic/tache/[n]/page.tsx`, where `n` ∈ `1` | `2` | `3`.
- `Breadcrumb` component from UI-009 (`components/common/Breadcrumb.tsx`) reused at top: `Le Diagnostic > Tâche <n>`.
- Tâche header: tâche number badge, title, duration label — all read from `lib/data/taches.ts` by id.
- Timer affordance below the header, prominent on the right (desktop) or full-width row (mobile):
  - Visual countdown display in `MM:SS` format, initialized to the tâche's duration (Tâche 1 = `03:00`, Tâche 2 = `03:30`, Tâche 3 = `05:00`).
  - Start/Pause toggle button + "Réinitialiser" link.
  - Timer logic is local-only: a real `setInterval` decrementing a `useState` value once per second; pauses on toggle; resets on link click; stops at `00:00` and surfaces a "Temps écoulé" badge but does not auto-submit or auto-advance.
- Question display: prompt text from the fixture in editorial typography (serif kicker treatment), with a small "Lire l'énoncé" affordance icon (visual only, no `<audio>`).
- Recording UI placeholder, prominent below the prompt, centered:
  - Large circular "Enregistrer" button (mic icon) that toggles between Idle / Recording / Stopped visual states on click. State is local-only React state; **no `MediaRecorder` API, no `getUserMedia`, no real microphone access.**
  - Waveform visualizer placeholder beneath the button: static SVG bars or a CSS-animated bar set in Recording state (purely decorative; respects `prefers-reduced-motion`).
  - Status text below the button: "Cliquez pour commencer." / "Enregistrement en cours…" / "Enregistrement terminé." based on state.
  - In the Stopped state, "Réécouter" (visual-only, no `<audio>` element wired) and "Recommencer" (returns to Idle state, resets visualizer) affordances appear.
- Tâche navigation at bottom: "← Tâche précédente" links to `/diagnostic/tache/<n-1>` and "Tâche suivante →" links to `/diagnostic/tache/<n+1>`:
  - Tâche 1: no previous button.
  - Tâche 3: the next button is replaced by "Voir les résultats" → routes to `/diagnostic/results`.
- Invalid `n` (e.g. `/diagnostic/tache/4`, `/diagnostic/tache/abc`) renders Next.js 404 via `notFound()`.

**Out:**
- Real audio recording via `MediaRecorder` / `getUserMedia` (AI-XXX; F-327 voice pipeline).
- Real audio playback of the prompt or the recorded response — no `<audio>` element, no Web Audio API, no TTS library. AI section wires real audio.
- Real timer-driven auto-submit / auto-advance behavior (out of scope; timer reaches `00:00` and stops without side effects).
- Scoring of the response (UI-015 displays a placeholder; real scoring is AI-XXX 2-pass Diagnostic).
- Persisting recording state / timer state across navigation (out of scope; full reset on route change is acceptable).
- Mic permission pre-flight modal (defer to AI section when real recording wires up).
- Re-take limits / attempt counters (defer).
- Live waveform driven by real audio amplitude (defer; the placeholder is decorative-only).
- Real audio elements of any kind.

#### Acceptance (Given/When/Then)
1. **Given** `/diagnostic/tache/1` loaded, **When** the page renders, **Then** the breadcrumb, tâche header, timer at `03:00`, prompt text, recording UI placeholder in Idle state, and "Tâche suivante" link (with no "précédente" button) are visible inside the `(app)` shell.
2. **Given** `/diagnostic/tache/2` loaded, **When** the page renders, **Then** the timer initializes to `03:30` and both prev (→ `/diagnostic/tache/1`) and next (→ `/diagnostic/tache/3`) navigation buttons are visible.
3. **Given** `/diagnostic/tache/3` loaded, **When** the page renders, **Then** the timer initializes to `05:00`, the previous button links to `/diagnostic/tache/2`, and the bottom-right affordance is "Voir les résultats" linking to `/diagnostic/results` (no "Tâche suivante").
4. **Given** the timer is at `03:00` and idle, **When** "Démarrer" is clicked, **Then** the timer counts down once per second; clicking "Pause" stops the decrement; "Réinitialiser" returns the display to the tâche's starting duration.
5. **Given** the recording UI in Idle state, **When** the user clicks the mic button, **Then** it transitions to Recording state (status text "Enregistrement en cours…" and visualizer activates); clicking again transitions to Stopped state (status text "Enregistrement terminé." and "Réécouter" / "Recommencer" affordances appear).
6. **Given** `/diagnostic/tache/4` loaded, **When** the route handler runs, **Then** the Next.js 404 page renders.
7. **Given** mobile <768px, **When** the page renders, **Then** the timer row, prompt, and recording UI stack single-column with the mic button at least 88×88px tap target.

#### Tests
- `tests/unit/diagnostic/TacheShell.test.tsx` (vitest) — renders breadcrumb, header, timer, prompt, recording UI, and navigation; nav buttons reflect tâche id (1 → no prev, 3 → "Voir les résultats" instead of next, 2 → both).
- `tests/unit/diagnostic/Timer.test.tsx` (vitest) — initializes to passed duration; Start triggers decrement using fake timers; Pause stops decrement; Réinitialiser restores initial value; reaching `00:00` shows "Temps écoulé" badge without firing additional events.
- `tests/unit/diagnostic/RecordingPlaceholder.test.tsx` (vitest) — Idle → Recording → Stopped state transitions on click; status text and affordances render per state; component does not import or reference `MediaRecorder` / `navigator.mediaDevices`.
- `tests/e2e/diagnostic-tache.spec.ts` (Playwright) — load `/diagnostic/tache/1`, all elements visible; click next → land on `/diagnostic/tache/2`; on `/diagnostic/tache/3` click "Voir les résultats" → land on `/diagnostic/results`; load `/diagnostic/tache/4` → 404; mic button cycles through states.

#### Files Touched
- `app/(app)/diagnostic/tache/[n]/page.tsx` — new dynamic route
- `components/diagnostic/TacheShell.tsx`
- `components/diagnostic/Timer.tsx`
- `components/diagnostic/RecordingPlaceholder.tsx`
- `components/diagnostic/WaveformPlaceholder.tsx`
- `components/diagnostic/TacheNav.tsx`
- `components/common/Breadcrumb.tsx` — reused from UI-009 (no changes expected; if a prop shape gap appears, extend rather than fork)
- `lib/data/taches.ts` — unchanged from UI-013 (consumed here for `prompt` field)
- `tests/unit/diagnostic/TacheShell.test.tsx`
- `tests/unit/diagnostic/Timer.test.tsx`
- `tests/unit/diagnostic/RecordingPlaceholder.test.tsx`
- `tests/e2e/diagnostic-tache.spec.ts`

#### Dependencies
- UI-006 Shipped (shell).
- UI-009 Shipped (Breadcrumb component reused here per UI-009 Notes).
- UI-013 Shipped (taches fixture + landing page that links here).

#### Notes
- The hard rule from UI-009 holds and is reinforced: **no `<audio>` element, no `MediaRecorder`, no `getUserMedia`, no Web Audio API anywhere in this entry.** F-327 voice pipeline and AI-XXX TTS work wire real audio. Premature audio plumbing creates a permissions + browser-compat headache that will need to be undone.
- The timer is a real `setInterval` because pausing/resuming with accurate seconds is a real UX requirement even in placeholder mode — beta cohort will react to the cadence. But timer expiry does NOT trigger auto-submit; that interaction belongs to BE/AI integration.
- The waveform visualizer is decorative only. Driving it from real audio amplitude is AI-XXX scope.
- Reusing the UI-009 Breadcrumb is explicit and intentional. If a Diagnostic-specific breadcrumb need surfaces (e.g. richer back-navigation), extend the component generically — don't fork.
- Durations (`03:00` / `03:30` / `05:00`) are placeholders aligned to TCF Canada structure. Real exam-spec durations land in CON-XXX content review.

---

### UI-015 — Le Diagnostic results view

**Status:** Shipped — squash-merged 5750c11
**Branch:** `feat/ui-015-diagnostic-results` (FE, from `main`)
**Effort:** 1 session (~3–4h)

#### Scope
**In:**
- `/diagnostic/results` route inside `(app)` shell at `app/(app)/diagnostic/results/page.tsx`.
- `Breadcrumb` component from UI-009 reused at top: `Le Diagnostic > Résultats`.
- Header block: large overall score "C1" (display typography) + sub-line "Niveau estimé TCF Canada" + date stamp ("Évalué le <date>" with a placeholder date formatted via `Intl.DateTimeFormat('fr-CA', { dateStyle: 'long' })`).
- 5-couche score breakdown block:
  - Section heading: "Votre score par couche".
  - 5 rows, in the locked order: Le Fond, Les Moules des Idées, Les Moules, Les Réflexes Anglais, La Voix.
  - Each row shows the layer name, a placeholder CEFR sub-score (Le Fond: C1, Les Moules des Idées: B2, Les Moules: B2, Les Réflexes Anglais: B1, La Voix: B2), a horizontal bar visualizing the level (consistent visual ramp from A1→C2), and a 1-sentence placeholder gloss ("Vous maîtrisez les structures attendues.").
  - Bars are inline CSS-driven (same approach as the UI-007 Progression widget), not Recharts.
- Per-tâche summary block:
  - Section heading: "Vos tâches".
  - 3 rows (Tâche 1 / Tâche 2 / Tâche 3): tâche title + 1-line placeholder feedback + a "Réécouter" affordance (visual only, no `<audio>` element wired) + a "Relire l'énoncé" link routing to `/diagnostic/tache/<n>`.
- Recommendations stub: a panel titled "Vos prochaines étapes" with 3 placeholder recommendation rows, each showing a layer name + a 1-sentence suggestion + a CTA linking to an existing surface (e.g. "Renforcer Les Moules" → `/ecole`, "Étoffer Le Fond" → `/vocabulaire`, "Travailler La Voix" → `/diagnostic/tache/1`). Suggestions are static placeholders; real recommendation logic is AI-XXX.
- Bottom action row: "Recommencer le diagnostic" → routes to `/diagnostic/tache/1`, and "Retour au tableau de bord" → routes to `/dashboard`.
- All data on this page is static placeholder — no fixture file required; values can live inline in the component. This is the only exception to the "extract to fixture" pattern UI-008/UI-010/UI-013 follow, because UI-015's values are illustrative-only and BE-XXX will replace them wholesale with a scoring endpoint response shape that doesn't exist yet.

**Out:**
- Real scoring data (AI-XXX 2-pass Diagnostic; F-322 validator).
- Real recommendations engine (AI section + RAG retrieval).
- Audio playback of the recorded response — no `<audio>` element, no Web Audio API. The "Réécouter" affordance is visual only.
- Persistence of past results / results history list (BE-XXX; the past-score panel on UI-013 echoes this surface).
- PDF / shareable export of the report (defer).
- Comparison with a previous diagnostic (defer; requires history).
- Per-layer drill-down detail view (defer; this is the summary page only).
- Examiner-style transcript with timestamps (defer to AI section).
- Recharts integration (CSS bars only here; Recharts when real data justifies).
- Real audio elements of any kind.

#### Acceptance (Given/When/Then)
1. **Given** a visitor on `/diagnostic/results`, **When** the page renders, **Then** the breadcrumb, header with overall "C1" score, 5-couche breakdown (5 rows in locked order), per-tâche summary (3 rows), recommendations stub (3 rows), and bottom action row are all visible inside the `(app)` shell.
2. **Given** desktop ≥1024px, **When** the page renders, **Then** the layout uses comfortable two-column proportions where appropriate (e.g. score header + date side-by-side) without exceeding the 1200px content frame.
3. **Given** mobile <768px, **When** the page renders, **Then** all sections stack single-column with consistent vertical rhythm.
4. **Given** the per-tâche summary "Relire l'énoncé" link for Tâche 2, **When** clicked, **Then** the router navigates to `/diagnostic/tache/2`.
5. **Given** the "Recommencer le diagnostic" action, **When** clicked, **Then** the router navigates to `/diagnostic/tache/1`.
6. **Given** the "Retour au tableau de bord" action, **When** clicked, **Then** the router navigates to `/dashboard`.
7. **Given** the page rendered inside the `(app)` shell, **When** the sidebar shows, **Then** the "Le Diagnostic" link has active state (results live under the diagnostic surface).

#### Tests
- `tests/unit/diagnostic/Results.test.tsx` (vitest) — renders header, 5-couche breakdown (5 rows in correct order with correct French labels), per-tâche summary (3 rows), recommendations (3 rows), bottom action row.
- `tests/unit/diagnostic/CouchesBreakdown.test.tsx` (vitest) — renders 5 layer rows in locked order; each row has name + CEFR badge + bar.
- `tests/unit/diagnostic/RecommendationsStub.test.tsx` (vitest) — renders 3 recommendation rows; CTAs link to expected routes (`/ecole`, `/vocabulaire`, `/diagnostic/tache/1`).
- `tests/e2e/diagnostic-results.spec.ts` (Playwright) — load page, all sections visible; "Relire l'énoncé" for Tâche 2 navigates to `/diagnostic/tache/2`; "Recommencer le diagnostic" navigates to `/diagnostic/tache/1`; "Retour au tableau de bord" navigates to `/dashboard`; mobile viewport stacks single-column.

#### Files Touched
- `app/(app)/diagnostic/results/page.tsx` — new
- `components/diagnostic/Results.tsx`
- `components/diagnostic/CouchesBreakdown.tsx`
- `components/diagnostic/TacheSummary.tsx`
- `components/diagnostic/RecommendationsStub.tsx`
- `components/common/Breadcrumb.tsx` — reused from UI-009 (no changes expected)
- `tests/unit/diagnostic/Results.test.tsx`
- `tests/unit/diagnostic/CouchesBreakdown.test.tsx`
- `tests/unit/diagnostic/RecommendationsStub.test.tsx`
- `tests/e2e/diagnostic-results.spec.ts`

#### Dependencies
- UI-006 Shipped (shell).
- UI-009 Shipped (Breadcrumb component reused here per UI-009 Notes).
- UI-013 Shipped recommended (the landing page links here via the past-score panel; consistent navigation loop).
- UI-014 Shipped recommended (the per-tâche "Relire l'énoncé" links route into UI-014; consistent navigation loop).

#### Notes
- 5-couche order is locked across UI-003, UI-007, UI-013, and here: Le Fond, Les Moules des Idées, Les Moules, Les Réflexes Anglais, La Voix. Reordering anywhere is a brand-moat regression.
- All scoring values are illustrative placeholders. They exist to make the surface feel real for beta cohort; AI-XXX 2-pass Diagnostic produces the real shape. Do not fabricate rubric specifics (no methodology details, no exam-board references).
- No `<audio>` element on the "Réécouter" affordance. The same rule as UI-009 audio player placeholder and UI-014 mic button: visual only. AI-XXX wires real audio when the voice pipeline lands.
- This entry closes Section 1. After UI-015 ships, every user-visible surface in the V1 funnel renders end-to-end with placeholders, and Section 2 (Mock Data + UI Polish) can begin.

---

## Section 2 — Mock Data + UI Polish (MOCK-001 to MOCK-012)

**Goal:** every UI shell from Section 1 displays realistic-looking data, has motion polish, and feels like a finished product even though no backend is wired. This is the section that turns shells into a demo-able product. Beta cohort can be invited at end of this section.

**Strategic step:** maps to Step 1 (data layer continues in parallel; mocks here are JSON fixtures hand-curated by Chadi).

**ID range:** MOCK-001 to MOCK-012.

---

### MOCK-001 — Landing hero copy + Wispr-benchmark motion

**Status:** Shipped — squash-merged a533862
**Branch:** `feat/mock-001-hero-motion` (FE, from `main`)
**Effort:** 1 session (~3–4h)
**Benchmark:** Wispr Flow (landing hero motion, progressive header reveal)

#### Scope
**In:**
- Sub-headline copy iteration: "The only TCF Canada prep built on the 5-Couche method — for anglophone candidates racing the clock." (provisional; Chadi reviews before merge)
- Wire `ed-hero-rise` + `ed-hero-rise-delay-{1|2|3}` CSS classes (already defined in `app/globals.css`) to the headline, sub-headline, and CTA respectively — staggered entrance at 0ms / 250ms / 450ms
- `RotatingKicker` component (already built in F-212, exported from `lib/motion.ts`) wired into the hero kicker position above the headline; cycles "TCF Canada · TEF Canada · DELF · DALF" on a 2.5s interval
- Sticky header scroll state: when `scrollY > 60`, StickyHeader background transitions from `transparent` to `var(--ed-paper)` with a 1px `var(--ed-rule)` bottom border (200ms ease); Wispr-style progressive reveal
- `ed-btn-press` CSS class applied to the hero CTA (`:active` scale-down feedback — class already defined in `app/globals.css`)
- OG meta tags in `app/layout.tsx`: `og:title` "Le Méthodic", `og:description` (1-sentence positioning copy), `og:url` (production domain string)

**Out:**
- Animated product demo section (MOCK-002 — blocked on asset pre-work)
- RotatingKicker audio narration (AI-XXX TTS)
- A/B variant routing or copy experiments (Section 7)
- PostHog / Plausible analytics events (Section 7)
- Twitter Card / Facebook og:image (defer — requires real screenshot/artwork)

#### Acceptance (Given/When/Then)
1. **Given** desktop 1280×800 with no motion preference, **When** `/` loads, **Then** the headline enters with `ed-hero-rise`, sub-headline with `ed-hero-rise-delay-1`, and CTA with `ed-hero-rise-delay-2` — all complete within 700ms of first paint — and the RotatingKicker element cycles through all 4 exam-name strings.
2. **Given** `prefers-reduced-motion: reduce` is set, **When** `/` loads, **Then** no entrance animation fires (the `ed-hero-rise` classes are no-ops per `app/globals.css` reduced-motion rule).
3. **Given** the user scrolls to `scrollY ≥ 80`, **When** the header is inspected, **Then** its background is `var(--ed-paper)` and a 1px `var(--ed-rule)` bottom border is visible; at `scrollY = 0` neither applies.
4. **Given** mobile 375×667, **When** `/` loads, **Then** hero renders above the fold without horizontal overflow, RotatingKicker is visible, and the CTA has ≥44×44px tap target.

#### Tests
- `tests/unit/landing/Hero.test.tsx` (vitest) — update: assert hero child elements carry `ed-hero-rise` / `ed-hero-rise-delay-1` / `ed-hero-rise-delay-2` class names; assert RotatingKicker renders with at least one of the 4 exam name strings
- `tests/unit/layout/StickyHeader.test.tsx` (vitest) — update: simulate `window.scrollY = 80` scroll event and assert the header gains the scrolled CSS class; at `scrollY = 0` assert the class is absent
- `tests/e2e/landing-hero.spec.ts` (Playwright) — update: assert RotatingKicker element is visible and non-empty on desktop; assert no horizontal overflow on mobile; assert header gains solid background after programmatic scroll to 80px

#### Files Touched
- `components/landing/Hero.tsx` — wire animation classes, add `<RotatingKicker />`
- `components/layout/StickyHeader.tsx` — add `useEffect` scroll listener + conditional class
- `app/layout.tsx` — add static OG meta tags
- `tests/unit/landing/Hero.test.tsx` — update
- `tests/unit/layout/StickyHeader.test.tsx` — update
- `tests/e2e/landing-hero.spec.ts` — update

#### Dependencies
- UI-001 Shipped (Hero component exists)
- UI-004 Shipped (StickyHeader component lives in layout)

#### Notes
- Benchmark: **Wispr Flow landing** — the header transparency-to-solid progressive reveal is the key Wispr signature to replicate. Keep transition to 200ms; avoid elastic or bounce easing.
- `RotatingKicker` and `useRotatingText` already exist from F-212 editorial system. Import from `lib/motion.ts`; do not re-implement.
- Sub-headline copy above is provisional. Chadi must approve final wording before merge. Flag as a review gate in the commit message.
- OG `og:url`: use the production domain from `reference_vercel_production.md` memory. Do not invent a URL.

---

### MOCK-002 — Landing animated demo section

**Status:** Shipped — squash-merged b710185
**Branch:** `feat/mock-002-animated-demo` (FE, from `main`)
**Effort:** 1 session (~4–5h) — blocked until pre-work delivered
**Benchmark:** Wispr Flow (product-in-use demo reveal on scroll)

#### Scope
**In:**
- A "product demo" section inserted between `<MethodologyPreview />` and `<PricingTeaser />` on `/`
- Contains a stylized static image of the diagnostic tâche view in Recording state, overlapping with a cropped view of the results score card — two overlapping UI mockup images, desktop-angled perspective crop (Wispr aesthetic)
- `<RevealOnScroll>` wrapper: `translateY(40px) → 0` + `opacity 0 → 1` over 700ms on viewport entry
- Desktop: demo block centered, max-width 960px, with `ed-card-lift` shadow ramp on the image surface
- Mobile: single image, full viewport width, maintains aspect ratio, no overflow

**Out:**
- Live interactive demo (static image mock only in Section 2)
- Video embed or Lottie animation (defer)
- Real product screenshots (Section 7 marketing polish)

#### Dependencies
- UI-001–005 Shipped
- MOCK-001 Shipped (hero motion patterns established)
- **BLOCKING pre-work required before session starts:**
  1. Wispr Flow reference screenshots — Chadi must supply (URL or local capture of wispr.com demo section)
  2. Nanobanana sample images — Chadi must supply (product screenshots or art-directed illustration assets to serve as the mockup content)

#### Notes
- Benchmark: **Wispr Flow** — the scroll-triggered product reveal where the app appears "in context" is the specific pattern to replicate. The visual quality of the mockup image is load-bearing; without the pre-work assets a placeholder rectangle defeats the purpose.
- This entry is intentionally ordered after MOCK-004 in execution sequence so it does not block MOCK-003–004 from starting.
- The two overlapping images (tâche Recording + results score card) can be constructed as positioned `<div>` surfaces with border/shadow treatment if real screenshots aren't ready — flag in the PR.

---

### MOCK-003 — Landing persona + methodology visual upgrade

**Status:** Shipped — squash-merged cb8e4c8
**Branch:** `feat/mock-003-icons-polish` (FE, from `main`)
**Effort:** 1 session (~3–4h)
**Benchmark:** Wispr Flow (restrained premium palette, generous whitespace, confident typography sizing)

#### Scope
**In:**
- `PersonaMatch` section:
  - Replace 3 geometric SVG placeholders with final editorial SVGs — each a 2-color line icon matching the `--ed-accent` / `--ed-muted` palette: icon 1 TCF flag motif, icon 2 EN→FR arrow motif, icon 3 stacked-layer motif (5-couche reference)
  - Wrap each column in `<RevealOnScroll delay={N}>` for staggered scroll entry (col 1: delay 0ms, col 2: 100ms, col 3: 200ms) using the existing `<RevealOnScroll>` component from `lib/motion.ts`
  - Copy: Chadi reviews and approves the 3 column body texts before merge (current placeholder copy is acceptable in the interim)
- `MethodologyPreview` section:
  - Layer bands get a left-border accent (3px, per-layer color from `--fp-*` pastel tokens — purely decorative per F-200 color hierarchy: pastels are the chip/accent layer, not chrome)
  - Each layer row gets `.ed-card-lift` hover treatment (200ms translateY -2px + shadow ramp)
  - `<RevealOnScroll>` on the section heading + staggered reveals on each layer row (50ms stagger)
  - Layer descriptions: 1-sentence copy review — replace generic placeholder prose with specific 5-couche methodology framing; Chadi approves before merge

**Out:**
- Animated product demo (MOCK-002)
- Full illustration or photography (editorial SVGs only here)
- Per-layer drill-down link to the method page (deferred; `/method` stub remains)
- Animated layer-by-layer build sequence (defer)

#### Acceptance (Given/When/Then)
1. **Given** desktop, **When** the visitor scrolls to the persona section, **Then** the 3 columns each have a distinct editorial SVG icon (not a geometric placeholder) and enter with staggered `RevealOnScroll` reveals.
2. **Given** desktop, **When** the visitor hovers over a methodology layer band, **Then** it lifts 2px with the `ed-card-lift` shadow transition (200ms).
3. **Given** `prefers-reduced-motion: reduce`, **When** the persona or methodology section scrolls into view, **Then** no translateY entrance or hover-lift animation fires.
4. **Given** mobile 375px, **When** the visitor scrolls to the methodology section, **Then** all 5 layer names and left-border accents are visible single-column without overflow.

#### Tests
- `tests/unit/landing/PersonaMatch.test.tsx` (vitest) — update: assert 3 SVG icon elements render (`data-testid="persona-icon-{1,2,3}"`); assert RevealOnScroll wrapper elements present
- `tests/unit/landing/MethodologyPreview.test.tsx` (vitest) — update: assert each layer row has `.ed-card-lift` class; assert left-border style or `data-layer` attribute for per-layer color
- `tests/e2e/landing-persona.spec.ts` (Playwright) — update: persona icons visible; reduced-motion variant has no animation
- `tests/e2e/landing-methodology.spec.ts` (Playwright) — update: 5 layers visible with left-border accents; hover lifts on desktop; reduced-motion confirmed

#### Files Touched
- `components/landing/PersonaMatch.tsx` — add RevealOnScroll, replace icon placeholder references
- `components/landing/icons/icon-tcf.svg` — new final editorial SVG
- `components/landing/icons/icon-langue.svg` — new final editorial SVG
- `components/landing/icons/icon-methode.svg` — new final editorial SVG
- `components/landing/MethodologyPreview.tsx` — add ed-card-lift, left-border accents, RevealOnScroll
- `components/landing/CouchesLayer.tsx` — add per-layer pastel border-left prop and hover class
- `tests/unit/landing/PersonaMatch.test.tsx` — update
- `tests/unit/landing/MethodologyPreview.test.tsx` — update
- `tests/e2e/landing-persona.spec.ts` — update
- `tests/e2e/landing-methodology.spec.ts` — update

#### Dependencies
- UI-002 Shipped (PersonaMatch component exists)
- UI-003 Shipped (MethodologyPreview + CouchesLayer exist)

#### Notes
- Benchmark: **Wispr Flow** — the persona section tone is confident and specific ("built for X, not Y"). Do not soften copy to be inclusive; the targeting is the value prop.
- SVG icons must be inline (not `<img>` tags) so they inherit CSS color variables. Keep each SVG under 20 path elements — editorial simplicity, not illustration complexity.
- `RevealOnScroll` component already exists from F-200. Import from `lib/motion.ts`. Stagger values honor the `ED_STAGGER` constant from the same file.

---

### MOCK-004 — Landing pricing + footer visual polish

**Status:** Shipped — squash-merged 175bffa
**Branch:** `feat/mock-004-pricing-footer-polish` (FE, from `main`)
**Effort:** 1 session (~2–3h)
**Benchmark:** Wispr Flow (pricing section clarity, restrained "most popular" signal, premium footer)

#### Scope
**In:**
- `PricingTeaser`:
  - Add `.ed-card-lift` hover treatment to each tier card
  - Daily Bundle "Most popular" badge: upgrade from plain text to a styled pill (`--ed-accent` background, white text, `font-weight: 600`, 4px radius) — matches editorial system radii rule
  - Add `.ed-btn-press` to each tier CTA button
  - Highlighted Daily Bundle card gains `1px solid var(--ed-accent)` border on hover (200ms transition)
  - `<RevealOnScroll>` on the pricing section heading
- `Footer`:
  - Wordmark: implement as styled text using `DISPLAY_FONT` constant (Cabinet Grotesk italic) rather than a raster image — inline text node or inline SVG path; not `<img src>`
  - Social link row: GitHub + Twitter/X placeholder `<a>` elements with `href="#"` (visual only; real URLs in Section 7)
  - Copyright line "© 2026 Le Méthodic" — no change needed

**Out:**
- Live Stripe checkout (LGL-XXX after Atlas + EIN)
- Currency switcher (USD only at launch)
- Newsletter signup form in footer (Section 7)
- Full tier comparison table (defer)
- "What's included" expansion panels (defer)

#### Acceptance (Given/When/Then)
1. **Given** desktop, **When** the visitor hovers over the Daily Bundle card, **Then** the card lifts 2px, the border transitions to `var(--ed-accent)` color, and the "Most popular" pill is visible with accent background.
2. **Given** any tier CTA button pressed (mousedown), **When** the `.ed-btn-press` scale fires, **Then** the button scales to 0.98.
3. **Given** the footer rendered, **Then** the wordmark, 3 link columns, social placeholder links, and copyright line are all visible.
4. **Given** mobile 375px, **When** the pricing section renders, **Then** tier cards stack vertically with the Daily Bundle card still visually distinct (badge visible, no layout breakage).

#### Tests
- `tests/unit/landing/PricingTeaser.test.tsx` (vitest) — update: assert `.ed-card-lift` and `.ed-btn-press` classes present; assert Daily Bundle card has "Most popular" pill (`data-testid="pricing-badge-popular"`)
- `tests/unit/landing/Footer.test.tsx` (vitest) — update: assert wordmark element present; assert social link elements (`data-testid="footer-social-github"`, `data-testid="footer-social-twitter"`)
- `tests/e2e/landing-pricing.spec.ts` (Playwright) — update: Daily Bundle hover shows lift and accent border; mobile cards stack without overflow; social links present in footer

#### Files Touched
- `components/landing/PricingTeaser.tsx` — ed-card-lift, ed-btn-press, Daily Bundle border hover, badge upgrade, RevealOnScroll
- `components/landing/Footer.tsx` — wordmark text treatment, social links
- `tests/unit/landing/PricingTeaser.test.tsx` — update
- `tests/unit/landing/Footer.test.tsx` — update
- `tests/e2e/landing-pricing.spec.ts` — update

#### Dependencies
- UI-004 Shipped (PricingTeaser + Footer exist)
- MOCK-001 Shipped (ed-btn-press + scroll-reveal patterns confirmed)

#### Notes
- Benchmark: **Wispr Flow** — the Daily Bundle highlight should feel premium and authoritative, not Stripe-dashboard busy. One accent pill + one accent border is enough signal; resist adding gradient or shadow stacks.
- Wordmark in footer: `DISPLAY_FONT` constant is imported from `components/onboarding/OnboardingScreen.tsx` (also used by `components/Paywall.tsx`). Keep the same import path.
- Social links are placeholders with `href="#"`. Real URLs (GitHub profile, Twitter/X handle) land in Section 7 marketing setup.

---

### MOCK-005 — Sign-up form UX polish

**Status:** Shipped — squash-merged f875330
**Branch:** `feat/mock-005-signup-ux` (FE, from `main`)
**Effort:** 1 session (~2–3h)
**Benchmark:** Wispr Flow / shared standard (premium form affordances, ed-field focus treatment — transition point into Promova interior register)

#### Scope
**In:**
- `SignupForm`:
  - Apply `.ed-field` CSS class to all three input elements (focus-visible: `--ed-accent` border + 18%-opacity ring — already defined in `app/globals.css`)
  - Loading state visual upgrade: on Submit click (during the fake 300ms redirect), replace button text with an inline CSS spinner (`<span>` with `border-top` spin animation, respects `prefers-reduced-motion`); no external spinner library
  - Inline validation error messages: `color: var(--ed-accent)` + a small warning triangle inline SVG beside the message
  - "Already have an account? Sign in" link: `color: var(--ed-accent)` with underline on hover
  - Form card: `background: var(--ed-paper)` + 1px `var(--ed-rule)` border + 8px radius — lifts the form off the page background
- `PasswordStrength` sub-component (new): a 3-segment row below the password field; filled left-to-right as password length increases (0–4 chars → 1 red/blush segment; 5–7 → 2 amber/butter segments; 8+ → 3 green/sage segments); purely local React state, no library, no entropy analysis

**Out:**
- Real auth wiring (BE-001)
- OAuth providers (BE-001)
- hCaptcha (BE-001 / F-406)
- Entropy-based password strength (length threshold is sufficient for Section 2)
- Server-side validation
- Email verification flow

#### Acceptance (Given/When/Then)
1. **Given** the user focuses a form field, **When** the focus ring appears, **Then** it uses the `var(--ed-accent)` color + 18%-opacity ring from the `.ed-field` class.
2. **Given** a password of 6 characters typed, **When** the strength indicator renders, **Then** 2 of 3 segments are filled (amber/butter state).
3. **Given** valid form filled, **When** Submit is clicked, **Then** the button immediately shows the spinner and is disabled; after ≥300ms the router navigates to `/onboarding`.
4. **Given** `prefers-reduced-motion: reduce`, **When** Submit is clicked, **Then** the spinner icon is visible but does not rotate.

#### Tests
- `tests/unit/signup/SignupForm.test.tsx` (vitest) — update: assert `.ed-field` class on all inputs; assert PasswordStrength renders with correct segment count at password lengths 3, 6, and 9; assert spinner element appears in loading state
- `tests/e2e/signup-flow.spec.ts` (Playwright) — update: focus a field and confirm focus ring visible; type password and confirm segment count changes; submit and confirm spinner appears then redirect

#### Files Touched
- `components/auth/SignupForm.tsx` — ed-field, spinner, form card surface, link styling
- `components/auth/PasswordStrength.tsx` — new sub-component
- `components/auth/FormField.tsx` — ed-field class, styled error message with warning icon
- `tests/unit/signup/SignupForm.test.tsx` — update
- `tests/e2e/signup-flow.spec.ts` — update

#### Dependencies
- UI-005 Shipped (SignupForm + FormField exist)
- MOCK-001 Shipped (editorial palette + motion token conventions confirmed)

#### Notes
- The `.ed-field` class is already defined in `app/globals.css`. Apply it via `className` — no inline style needed.
- Password strength: 3 segments, length threshold only. `zxcvbn` or similar entropy libraries are overkill here and add an unnecessary dependency. Keep it pure CSS + React state.
- The spinner must be a pure CSS animation on a `<span>` element — no external icon library. Define the `@keyframes spin` in `app/globals.css` and wrap it with the `prefers-reduced-motion` guard already established there.

---

### MOCK-006 — App shell + sidebar polish

**Status:** Shipped — squash-merged 929e874
**Branch:** `feat/mock-006-app-shell-polish` (FE, from `main`)
**Effort:** 1 session (~3–4h)
**Benchmark:** Promova (mobile-app chrome polish, native-feel drawer, sidebar avatar treatment)

#### Scope
**In:**
- Sidebar header: add a user avatar placeholder — a 36×36px circle with initials "CH" (BE-001 will swap to real user identity from session); `--ed-accent` background, white text, `SANS_FONT`, `font-weight: 600`; accepts an `initials` prop defaulting to `"CH"` for a trivial BE-001 swap
- Sidebar active link: upgrade the active-state treatment from border-only to a full-bleed `var(--bg-elevated)` row background spanning the full sidebar width, plus a 4px-wide `var(--ed-accent)` left-tab indicator (full row height, 2px radius right side) — Promova pill-row pattern
- Mobile off-canvas drawer: add `transition: transform 300ms var(--ed-ease)` for open/close slide; backdrop `<div>` at `opacity 0 → 0.5` fade (200ms) — closes the drawer on click; respects `prefers-reduced-motion` (instant open if set)
- `ed-page-enter` fade-in on the `<main>` content frame: apply via `key={pathname}` on the main element (forces remount on route change, re-triggering the CSS animation); `pathname` from `usePathname()`

**Out:**
- Auth gate / redirect to login (BE-001)
- Persistent desktop sidebar-collapse toggle (defer)
- Notification center (Section 7)
- Real user identity from JWT / session (BE-001)
- Search bar in chrome (defer)

#### Acceptance (Given/When/Then)
1. **Given** desktop ≥1024px, **When** `/dashboard` loads, **Then** the sidebar shows the "CH" avatar circle at top, the active link row has full-bleed `--bg-elevated` background, and the 4px left-tab indicator is visible on the active row.
2. **Given** the user navigates from `/dashboard` to `/ecole`, **When** the route changes, **Then** the main content frame fades in via `ed-page-enter` (250ms) and the sidebar active state shifts to "L'École".
3. **Given** mobile <768px, **When** the hamburger is tapped, **Then** the drawer slides in with 300ms transform transition; the backdrop fades to 0.5 opacity simultaneously; tapping the backdrop closes the drawer with the reverse transition.
4. **Given** `prefers-reduced-motion: reduce`, **When** the drawer opens on mobile, **Then** no transform transition fires (instant open/close).

#### Tests
- `tests/unit/layout/Sidebar.test.tsx` (vitest) — update: assert avatar element with initials "CH" (`data-testid="sidebar-avatar"`); assert active link has `bg-elevated` class in its parent row element
- `tests/unit/layout/AppShell.test.tsx` (vitest) — update: assert main element has `ed-page-enter` class; assert `key` prop on main changes when mocked `usePathname` returns a different route
- `tests/e2e/app-shell.spec.ts` (Playwright) — update: desktop avatar visible; navigate dashboard→ecole, confirm page fade-in; mobile drawer slides with transition; backdrop click closes drawer

#### Files Touched
- `components/layout/Sidebar.tsx` — avatar placeholder, full-bleed active row, left-tab indicator
- `components/layout/SidebarLink.tsx` — active state treatment refactor
- `app/(app)/layout.tsx` — `key={pathname}` on main, backdrop element for mobile drawer
- `tests/unit/layout/Sidebar.test.tsx` — update
- `tests/unit/layout/AppShell.test.tsx` — update
- `tests/e2e/app-shell.spec.ts` — update

#### Dependencies
- UI-006 Shipped (AppShell + Sidebar exist)
- MOCK-005 Shipped (editorial palette + motion patterns consistent across surfaces)

#### Notes
- Benchmark: **Promova** — the sidebar chrome and drawer must feel like a native mobile app transplanted to web. The backdrop dim is the critical mobile-native signal; without it the drawer looks like a web overlay, not an app sheet.
- "CH" initials are a placeholder. BE-001 wires `user.initials` from session. The `initials` prop default is the only coupling point.
- `ed-page-enter` is already defined in `app/globals.css` (250ms fade-in). The `key={pathname}` technique is idiomatic React for forcing remount on route change; it replaces any manual animation re-trigger approach.

---

### MOCK-007 — Dashboard realistic data + widget motion

**Status:** Shipped — squash-merged cb57f34
**Branch:** `feat/mock-007-dashboard-polish` (FE, from `main`)
**Effort:** 1 session (~3–4h)
**Benchmark:** Promova (app-interior data density, widget card design, mobile-native widget grid)

#### Scope
**In:**
- `lib/data/dashboard.ts` — new typed fixture file (hand-curated by Chadi; Claude Code generates plausible values, Chadi reviews before merge):
  - `RECENT_ACTIVITY`: 5 rows `{ label: string; detail: string; relativeTime: string; category: 'lesson' | 'vocab' | 'diagnostic' }` — relativeTime pre-formatted in French (e.g. `"il y a 2 jours"`) via `Intl.RelativeTimeFormat('fr-CA')`
  - `PROGRESS_LAYERS`: the 5-couche layers with percent values (moved from inline in `ProgressWidget`)
  - `NEXT_LESSON`: pointer to `LESSONS[4]` (lesson 5) from `lib/data/lessons.ts` via its `id`
  - `DIAGNOSTIC_SCORE`: `{ level: 'C1'; lastEvaluatedLabel: 'il y a 7 jours' }`
- `ProgressWidget`: bars animate from 0% to target width on mount — CSS `transition: width 600ms var(--ed-ease) both` applied after a 1-frame `requestAnimationFrame` delay; respects `prefers-reduced-motion` (no animation, instant final width)
- `RecentActivityWidget`: expanded to 5 rows; each row gets a small 8px colored dot on the left (lesson → `--fp-sage`, vocab → `--fp-sky`, diagnostic → `--fp-lavender`) per F-200 decorative chip layer
- All 4 widget cards: add `.ed-card-lift` hover treatment
- Mobile single-column: add `1px solid var(--ed-rule)` bottom separator between stacked widgets

**Out:**
- Real progress data (BE-XXX endpoints)
- Streak / engagement counters (defer)
- Recharts radar/bar charts (CSS bars only; Recharts when real data lands)
- Per-user personalization (BE)
- Dismissible nudge banners (defer)

#### Acceptance (Given/When/Then)
1. **Given** `/dashboard` loaded on desktop, **When** the ProgressWidget mounts, **Then** each couche bar animates from 0px to its target width over ~600ms (Playwright: evaluate computed width after 700ms settle).
2. **Given** desktop ≥1280px, **When** all 4 widgets render, **Then** each has `.ed-card-lift` class and visibly lifts 2px on hover.
3. **Given** the RecentActivityWidget renders from fixture, **When** inspected, **Then** exactly 5 activity rows are visible, each with a colored left-dot (`data-testid="activity-dot"`).
4. **Given** mobile <768px, **When** widgets stack single-column, **Then** each widget has a `var(--ed-rule)` bottom separator and no horizontal overflow.

#### Tests
- `tests/unit/dashboard/Dashboard.test.tsx` (vitest) — update: assert 5 activity rows; assert ProgressWidget bars carry `data-testid="progress-bar-{layer-slug}"` with correct target width style from fixture
- `tests/unit/dashboard/ProgressWidget.test.tsx` (vitest) — update: assert each bar's final `width` style matches fixture value (animation timing not testable in jsdom; assert settled state)
- `tests/unit/dashboard/RecentActivityWidget.test.tsx` (vitest) — update: assert 5 rows; assert `data-testid="activity-dot"` per row
- `tests/e2e/dashboard.spec.ts` (Playwright) — update: wait 700ms then check bar widths have settled to >0; hover a widget card and confirm lift; mobile stacks with separators visible

#### Files Touched
- `lib/data/dashboard.ts` — new fixture
- `components/dashboard/Dashboard.tsx` — import from fixture, add ed-card-lift, mobile separator
- `components/dashboard/ProgressWidget.tsx` — CSS bar animation, import layers from fixture
- `components/dashboard/RecentActivityWidget.tsx` — expand to 5 rows, colored left-dot, import from fixture
- `components/dashboard/NextLessonWidget.tsx` — import lesson via fixture pointer
- `components/dashboard/DiagnosticScoreWidget.tsx` — import from fixture
- `tests/unit/dashboard/Dashboard.test.tsx` — update
- `tests/unit/dashboard/ProgressWidget.test.tsx` — update
- `tests/unit/dashboard/RecentActivityWidget.test.tsx` — update
- `tests/e2e/dashboard.spec.ts` — update

#### Dependencies
- UI-007 Shipped (dashboard widgets exist)
- UI-008 Shipped (`lib/data/lessons.ts` fixture exists; NextLessonWidget reads from it)
- MOCK-006 Shipped (ed-card-lift confirmed on shell surfaces)

#### Notes
- Benchmark: **Promova** — the dashboard is the first authenticated screen. It should feel like a capable personal tutor's dashboard, not a SaaS metrics board. Dense enough to feel alive; restrained enough to not overwhelm.
- `lib/data/dashboard.ts` is hand-curated by Chadi before this session starts. Claude Code generates plausible values; Chadi reviews and edits before the PR merges.
- ProgressWidget animation: `width` CSS transition on the bar element, initial width `0%`, target applied after `requestAnimationFrame`. Same approach as UI-007 / UI-015 bars — maintain consistency.
- The 5 activity rows should cover: 2 lesson completions, 1 vocab session, 1 diagnostic tâche, 1 vocab test — representative of the product's three surfaces.

---

### MOCK-008 — L'École fixture flesh-out + lesson card/detail polish

**Status:** Shipped — squash-merged 051d1b3
**Branch:** `feat/mock-008-ecole-polish` (FE, from `main`)
**Effort:** 1 session (~3–4h)
**Benchmark:** Promova (lesson-card grid state treatments, lesson detail typography, content card design)

#### Scope
**In:**
- `lib/data/lessons.ts` — flesh out all 27 lesson objects: add plausible French linguistics topic titles (e.g. "Leçon 7 : L'expression du doute", "Leçon 14 : La cause et la conséquence"), 1-sentence `description` per lesson, and a `cefr` field (provisionally `'B1'` for Fondations 1–16, `'B2'` for Approfondissement 17–27 — CON-XXX assigns real levels); do not invent 5-couche methodology rubric specifics that would need reconciliation; Chadi reviews all 27 titles before merge
- `LessonCard`:
  - State badge visual upgrade: "Terminée" → `--fp-sage` chip; "Disponible" → `--ed-accent` chip (white text, `font-weight: 600`); "Verrouillée" → `--ed-muted` text + lock icon (inline SVG, 16×16px) + card `opacity: 0.65`
  - Card layout: number badge top-left, state badge top-right, title + description below
  - Add `.ed-card-lift` to Disponible and Terminée cards (Verrouillée cards do not lift — they are locked)
- `AudioPlayerPlaceholder` (on LessonDetail):
  - Add a 15-bar static waveform thumbnail left of the play button (same approach as `WaveformPlaceholder` from UI-014, but static — no animation; `data-testid="lesson-waveform-bar"` per bar)
  - Add a CEFR badge displaying the lesson's `cefr` field
  - Static time label "12:34" styled more prominently (medium weight, `--ed-fg`)
- `LessonDetail`:
  - 3 content sections get 2-paragraph placeholder prose (general language-learning pedagogy tone; no invented 5-couche rubric)
  - Keyboard arrow navigation: `ArrowRight` → `router.push('/ecole/<id+1>')`, `ArrowLeft` → `router.push('/ecole/<id-1>')` via `useEffect` keydown listener on `window`; boundary-safe (lesson 1 ignores left; lesson 27 ignores right)

**Out:**
- Real lesson titles and body content (CON-XXX)
- Real audio (AI-XXX TTS)
- Progress marking / completion state (BE-XXX)
- Note-taking, highlights, bookmarks (defer)
- Quiz at end of lesson (defer)

#### Acceptance (Given/When/Then)
1. **Given** `/ecole` loaded, **When** the lesson grid renders, **Then** lessons 1–3 show Terminée sage chips; lessons 4–6 show Disponible accent chips; lessons 7–27 show Verrouillée muted text + lock icon at reduced opacity.
2. **Given** desktop, **When** a Disponible lesson card is hovered, **Then** it lifts 2px (ed-card-lift); a Verrouillée card does not change opacity further on hover.
3. **Given** `/ecole/5` loaded, **When** the page renders, **Then** the audio placeholder shows 15 waveform bars, a CEFR badge, a styled "12:34" time label, and 2 paragraphs per content section.
4. **Given** `/ecole/5` loaded, **When** the user presses `ArrowRight`, **Then** the router navigates to `/ecole/6`; pressing `ArrowLeft` navigates to `/ecole/4`.
5. **Given** `/ecole/1` loaded, **When** the user presses `ArrowLeft`, **Then** nothing happens (boundary guard).

#### Tests
- `tests/unit/ecole/LessonCard.test.tsx` (vitest) — update: assert state badge text per state; assert lock icon present for Verrouillée (`data-testid="lesson-lock-icon"`); assert `.ed-card-lift` absent on Verrouillée card; assert `opacity: 0.65` style on Verrouillée
- `tests/unit/ecole/LessonDetail.test.tsx` (vitest) — update: assert 15 bar elements (`data-testid="lesson-waveform-bar"`); assert CEFR badge; assert ArrowRight key event triggers `router.push` mock with correct path; assert ArrowLeft on lesson 1 does not trigger push
- `tests/e2e/ecole-list.spec.ts` (Playwright) — update: first 3 cards show sage badge; card 4 shows accent badge; card 7 shows lock icon; hover card 4 lifts; Verrouillée card does not lift
- `tests/e2e/ecole-detail.spec.ts` (Playwright) — update: waveform bars visible; ArrowRight navigates to next lesson; ArrowLeft boundary on lesson 1 does nothing

#### Files Touched
- `lib/data/lessons.ts` — update all 27 objects: titles, descriptions, cefr field
- `components/ecole/LessonCard.tsx` — state badge upgrade, lock icon SVG, ed-card-lift, opacity
- `components/ecole/LessonDetail.tsx` — 2-paragraph content, keyboard nav useEffect
- `components/ecole/AudioPlayerPlaceholder.tsx` — waveform bars, CEFR badge prop, time label
- `tests/unit/ecole/LessonCard.test.tsx` — update
- `tests/unit/ecole/LessonDetail.test.tsx` — update
- `tests/e2e/ecole-list.spec.ts` — update
- `tests/e2e/ecole-detail.spec.ts` — update

#### Dependencies
- UI-008 Shipped (`lib/data/lessons.ts` + LessonCard + LessonList exist)
- UI-009 Shipped (LessonDetail + AudioPlayerPlaceholder exist)
- MOCK-006 Shipped (ed-card-lift on shell confirmed)

#### Notes
- Benchmark: **Promova** — Promova's lesson card grid is the gold standard: clean number badge, clear state distinction, generous card padding. The lock icon + opacity treatment signals unavailable content without being aggressive.
- Lesson titles are placeholders. Chadi reviews all 27 before this PR merges. Claude Code generates plausible-sounding French linguistics topics; Chadi edits as needed.
- Keyboard navigation uses `window.addEventListener('keydown', ...)` in `useEffect` with a cleanup `removeEventListener`. Do not attach to the component element directly — focus should not be required to trigger navigation.

---

### MOCK-009 — Le Vocabulaire fixture expansion + browse / practice / test polish

**Status:** Shipped — squash-merged 3e6bca4
**Branch:** `feat/mock-009-vocab-polish` (FE, from `main`)
**Effort:** 1 session (~4–5h)
**Benchmark:** Airlearn (flashcard UX, quiz feedback presentation) + Promova (browse-view data density)

#### Scope
**In:**
- `lib/data/chunks.ts` — expand from 30 to 60 hand-curated chunks; Chadi authors the 60 entries before the session (or Claude Code generates plausible FR/EN pairs spanning all 5 CEFR levels and all 5 source categories, and Chadi reviews before merge); each entry: `{ id, french, gloss, cefr, source }`
- `VocabBrowse`:
  - Header badge: dynamic count label reading `chunks.length` (e.g. "60 chunks")
  - ChunkRow save icon: click toggles local `saved` boolean state — heart icon fills with `--ed-accent` on save, outlines on unsave; scale microanimation on toggle (scale 1 → 1.3 → 1, 150ms total); no persistence, no BE call
  - `.ed-card-lift` on each ChunkRow (row becomes a lifted card surface)
- `Flashcard` (practice view):
  - Full 3D flip: `perspective(1000px) rotateY(180deg)` CSS transform with `backface-visibility: hidden` on both face elements; 300ms `var(--ed-ease)` — Airlearn-style card turn
  - Front face: French chunk at 28px `SERIF_FONT`; CEFR badge + source pill below in `SANS_FONT`
  - Back face: English gloss at 28px `SERIF_FONT`; French chunk repeated at 16px above for reference
  - Card surface: `var(--ed-paper)` background, 1px `var(--ed-rule)` border, 12px radius, 32px padding desktop / 24px mobile
- `PracticeActions`:
  - "À revoir" button: `--fp-blush` chip (warm signal)
  - "Connu" button: `--fp-sage` chip (positive signal)
  - "Suivant" (center, primary): `--ed-accent` background + `ed-btn-press`
- `QuizQuestion` (test view):
  - Choice cards: full-width, 12px radius, 1px `var(--ed-rule)` border; selected state: `--ed-accent` 4px left-border accent
  - Correct feedback: `--fp-sage` left-border; incorrect: `--fp-blush` left-border (border-only — no fills per editorial restraint)
  - "Question suivante" button: delayed 250ms fade-in after Submit (user processes feedback before advancing); implemented as `setTimeout` + `useState` with `vi.useFakeTimers()` in tests
- `QuizResults`:
  - Score in display typography: `n/10` at large size, `SERIF_FONT`
  - Flavor copy by score range: 8–10 → "Excellent. Votre réservoir lexical est solide."; 5–7 → "Bien. Continuez à pratiquer."; ≤4 → "À revoir. Répétez la pratique régulièrement."

**Out:**
- Real save persistence (BE-XXX)
- Spaced-repetition deck selection (AI-XXX)
- Audio playback per chunk (AI-XXX)
- Server-side quiz generation (BE-XXX)
- More than 10 quiz questions (defer to BE-XXX)

#### Acceptance (Given/When/Then)
1. **Given** `/vocabulaire` loaded, **When** the browse view renders, **Then** 60 chunk rows are visible and the header badge reads "60 chunks".
2. **Given** a ChunkRow save icon clicked, **When** the icon state toggles, **Then** the heart fills with accent color and scales to 1.3 then back to 1 (150ms total); a second click reverses both.
3. **Given** `/vocabulaire/practice` with the Flashcard in front state, **When** the card is clicked, **Then** it rotates on the Y axis via 3D CSS transform; the back face shows the English gloss at 28px serif.
4. **Given** quiz Submit clicked on an incorrect answer, **When** feedback renders, **Then** the wrong choice shows `--fp-blush` left-border, the correct choice shows `--fp-sage` left-border, and "Question suivante" becomes visible after 250ms (not instantly).
5. **Given** a final score of 4/10 at quiz end, **When** QuizResults renders, **Then** "4 / 10" and the "À revoir" flavor copy are both visible.
6. **Given** mobile 375px at `/vocabulaire/practice`, **When** the Flashcard renders, **Then** it is full-width with 24px padding and the 3 action buttons are each ≥44px tall.

#### Tests
- `tests/unit/vocabulaire/VocabBrowse.test.tsx` (vitest) — update: assert 60 rows render; header badge shows "60 chunks"; save icon click adds filled class to icon
- `tests/unit/vocabulaire/Flashcard.test.tsx` (vitest) — update: assert front face text at 28px (inline style); after click assert back-face visible with gloss text; assert 3D transform class applied
- `tests/unit/vocabulaire/QuizQuestion.test.tsx` (vitest) — update: after Submit with wrong answer, assert `--fp-blush` border class on wrong choice and `--fp-sage` on correct; assert "Question suivante" not visible at t=0, visible after `vi.advanceTimersByTime(250)`
- `tests/unit/vocabulaire/QuizResults.test.tsx` — new: assert `"4 / 10"` renders for score 4; assert correct flavor copy for each of the 3 score ranges
- `tests/e2e/vocabulaire-browse.spec.ts` (Playwright) — update: 60 rows visible; save icon click toggles fill; ChunkRow hover lifts
- `tests/e2e/vocabulaire-practice.spec.ts` (Playwright) — update: card flip 3D transform visible; action button chip colors correct; mobile card full-width
- `tests/e2e/vocabulaire-test.spec.ts` (Playwright) — update: feedback borders correct; "Question suivante" visible after short wait; results flavor copy matches score range

#### Files Touched
- `lib/data/chunks.ts` — expand to 60 entries
- `components/vocabulaire/VocabBrowse.tsx` — count badge, ed-card-lift on rows
- `components/vocabulaire/ChunkRow.tsx` — save icon toggle state + microanimation
- `components/vocabulaire/Flashcard.tsx` — 3D flip transform, face typography, card surface
- `components/vocabulaire/PracticeActions.tsx` — chip color treatments
- `components/vocabulaire/QuizQuestion.tsx` — choice border accents, feedback colors, "Question suivante" delayed fade-in
- `components/vocabulaire/QuizResults.tsx` — display typography score, flavor copy variants
- `tests/unit/vocabulaire/VocabBrowse.test.tsx` — update
- `tests/unit/vocabulaire/Flashcard.test.tsx` — update
- `tests/unit/vocabulaire/QuizQuestion.test.tsx` — update
- `tests/unit/vocabulaire/QuizResults.test.tsx` — new
- `tests/e2e/vocabulaire-browse.spec.ts` — update
- `tests/e2e/vocabulaire-practice.spec.ts` — update
- `tests/e2e/vocabulaire-test.spec.ts` — update

#### Dependencies
- UI-010 Shipped (VocabBrowse + chunks fixture exist)
- UI-011 Shipped (Flashcard + PracticeActions exist)
- UI-012 Shipped (QuizQuestion + QuizResults exist)
- MOCK-006 Shipped (ed-card-lift confirmed)

#### Notes
- Benchmark: **Airlearn** for flashcard / quiz surfaces; **Promova** for browse-view data density.
- 60 chunks is the target. If the fixture hasn't been reviewed by Chadi before session start, Claude Code generates 30 plausible additions (the original 30 are baseline); Chadi reviews before merge. Do NOT block the session waiting for all 60 to be final.
- 3D card flip requires `transform-style: preserve-3d` on the card container and `backface-visibility: hidden` on both face elements. Test in both Chromium and Firefox (Playwright covers both by default).
- "Question suivante" delayed fade-in (250ms) is intentional — it gives the user a beat to process the feedback. Implement as `setTimeout` + `useState(false)`; `vi.useFakeTimers()` in unit tests.

---

### MOCK-010 — Le Diagnostic landing + tâche shell polish

**Status:** Shipped — squash-merged a59c4de
**Branch:** `feat/mock-010-diagnostic-tache-polish` (FE, from `main`)
**Effort:** 1 session (~3–4h)
**Benchmark:** Airlearn (recording UI, timer urgency states, assessment-surface typography)

#### Scope
**In:**
- `DiagnosticLanding`:
  - Tâche overview cards: add a 4px left accent bar per tâche (`--fp-lavender` for Tâche 1, `--fp-sky` for Tâche 2, `--fp-peach` for Tâche 3) on the white card body — decorative chip per F-200 color hierarchy
  - "Commencer le diagnostic" CTA: add `.ed-btn-press` + a right-arrow inline SVG beside the label
  - Past-score panel: upgrade to dismissible — a × button sets local `dismissed` boolean state (no persistence; re-appears on page reload); visual only
  - `<RevealOnScroll>` on the "Pourquoi un diagnostic ?" paragraphs
- `Timer`:
  - Urgency state: when `secondsLeft < 60` and timer is running, `MM:SS` display color shifts to `--fp-blush`; at `secondsLeft === 0` shifts to `--ed-muted`
  - Display font size upgrade: 32px `SANS_FONT` tabular-nums (`font-variant-numeric: tabular-nums`) — reads like a real exam timer
  - Start button: `--ed-accent` background fill + `ed-btn-press`; Pause button: `--ed-accent` border + text (outlined variant)
- `RecordingPlaceholder`:
  - Recording state: 2 concentric ripple rings radiating outward from the mic button (CSS `@keyframes` scale 1→2, opacity 1→0, 0.8s stagger between rings, infinite — Airlearn recording-active signature); respects `prefers-reduced-motion` (no animation if set)
  - Status text: `SANS_FONT`, `--ed-muted` color; Recording state adds a 2px blinking dot (`--fp-blush`, 1s blink interval, `prefers-reduced-motion` suppressed) beside the text
  - Réécouter / Recommencer buttons in Stopped state: pill style with `var(--ed-rule)` border
- `WaveformPlaceholder`: verify color transition between active/inactive states is exactly 200ms (from `app/globals.css` `.waveform-bar` definition); likely no code change needed — just confirm

**Out:**
- Real audio (AI-XXX)
- Real timer auto-submit on elapsed (out of scope)
- Mic permission pre-flight modal (defer to AI-XXX)
- Re-take limits / attempt counters (defer)

#### Acceptance (Given/When/Then)
1. **Given** `/diagnostic/tache/1`, timer started and running, **When** `secondsLeft` reaches 59, **Then** the timer display color shifts to the urgency color (`--fp-blush` value inspected via computed style).
2. **Given** the RecordingPlaceholder in Recording state, **When** rendered, **Then** 2 ripple ring elements (`data-testid="recording-ripple"`) are present in the DOM with the animation class.
3. **Given** `prefers-reduced-motion: reduce`, **When** the mic button is in Recording state, **Then** the ripple elements have no animation applied (animation-name resolves to `"none"`).
4. **Given** `/diagnostic` loaded with the past-score panel visible, **When** the × button is clicked, **Then** the panel is no longer in the DOM.
5. **Given** desktop, **When** a tâche card is inspected, **Then** a left accent bar element (`data-testid="tache-card-accent-bar"`) is present with the correct per-tâche `--fp-*` color.

#### Tests
- `tests/unit/diagnostic/Timer.test.tsx` (vitest) — update: advance timer via `vi.advanceTimersByTime` to 59s remaining, assert urgency CSS class applied; advance to 0, assert elapsed color class
- `tests/unit/diagnostic/RecordingPlaceholder.test.tsx` (vitest) — update: in Recording state, assert 2 elements with `data-testid="recording-ripple"`; assert ripple class absent when component rendered with a reduced-motion mock
- `tests/unit/diagnostic/DiagnosticLanding.test.tsx` (vitest) — update: assert past-score × button (`data-testid="past-score-dismiss"`); clicking it removes panel from DOM; assert tâche cards have `data-testid="tache-card-accent-bar"`
- `tests/e2e/diagnostic-tache.spec.ts` (Playwright) — update: timer color change at <60s; ripple rings visible in Recording state; reduced-motion suppresses ripple
- `tests/e2e/diagnostic-landing.spec.ts` (Playwright) — update: past-score × dismisses panel; tâche card accent bars visible with correct colors

#### Files Touched
- `components/diagnostic/DiagnosticLanding.tsx` — RevealOnScroll on persona paragraphs, CTA arrow
- `components/diagnostic/TacheCard.tsx` — left accent bar element + per-tâche color prop
- `components/diagnostic/PastScorePanel.tsx` — add × dismiss button + local dismissed state
- `components/diagnostic/Timer.tsx` — urgency color state (CSS class toggle), display font size, button styles
- `components/diagnostic/RecordingPlaceholder.tsx` — ripple rings, blinking dot, Stopped-state pill buttons
- `app/globals.css` — add `@keyframes recording-ripple` and `@keyframes blink-dot` with `prefers-reduced-motion` guards
- `tests/unit/diagnostic/Timer.test.tsx` — update
- `tests/unit/diagnostic/RecordingPlaceholder.test.tsx` — update
- `tests/unit/diagnostic/DiagnosticLanding.test.tsx` — update
- `tests/e2e/diagnostic-tache.spec.ts` — update
- `tests/e2e/diagnostic-landing.spec.ts` — update

#### Dependencies
- UI-013 Shipped (DiagnosticLanding + TacheCard + PastScorePanel exist)
- UI-014 Shipped (Timer + RecordingPlaceholder exist)
- MOCK-006 Shipped (motion conventions confirmed across shell)

#### Notes
- Benchmark: **Airlearn** — the concentric ripple rings during active recording are Airlearn's visual signature for the mic-active state. 2 rings, radiating outward, opacity fade, 0.8s stagger. Keep it tasteful — this is an exam tool, not a live-streaming interface.
- Per-tâche pastel accent bars (`--fp-lavender` / `--fp-sky` / `--fp-peach`) use the F-200 decorative chip layer — they are NOT structural chrome. The card body remains `--ed-paper` white.
- Timer urgency at <60s is a deliberate beta-feedback probe: does the user feel urgency? Does the color signal feel right? This is hard to validate without a real UI in front of real users.

---

### MOCK-011 — Le Diagnostic results polish

**Status:** Shipped — squash-merged 54863da
**Branch:** `feat/mock-011-diagnostic-results-polish` (FE, from `main`)
**Effort:** 1 session (~3–4h)
**Benchmark:** Airlearn (feedback card presentation, score visualization, post-assessment UX)

#### Scope
**In:**
- `Results.tsx` header block:
  - Score "C1" at 72px `SERIF_FONT`, `--ed-fg`; sub-line "Niveau estimé TCF Canada" at 14px `SANS_FONT` `--ed-muted`; date stamp at 12px `--ed-muted`
  - CEFR pill beside the score: background color mapped to CEFR band — `C1`/`C2` → `--fp-sage`; `B2` → `--fp-sky`; `B1` → `--fp-butter`; `A1`/`A2` → `--fp-blush`; define this mapping as a constant (`CEFR_PASTEL_MAP`) in `lib/data/` for reuse across surfaces
  - Score block mount animation: `opacity 0 → 1` + `scale(0.96) → scale(1)` over 400ms; respects `prefers-reduced-motion`
- `CouchesBreakdown`:
  - Bar fill animation on mount: CSS `transition: width 600ms var(--ed-ease) both` from 0% to target (same approach as MOCK-007 ProgressWidget)
  - Desktop hover: show a tooltip (`<div>` absolutely positioned) with the full `gloss` sentence on mouse-enter, hide on mouse-leave; mobile: gloss text always visible inline below the bar (no hover state required)
  - CEFR badge color: apply `CEFR_PASTEL_MAP` constant
- `TacheSummary`:
  - Feedback text expanded: each of 3 rows gets 2–3 sentences of placeholder evaluator-style notes (general oral fluency observations; no invented rubric specifics)
  - "Réécouter" button: pill style with `var(--ed-rule)` border + speaker inline SVG; `cursor: not-allowed` and `opacity: 0.5` (visual-only, not wired)
- `RecommendationsStub`:
  - Each row upgraded to a card: `var(--ed-paper)` surface, 1px `var(--ed-rule)` border, 8px radius, `.ed-card-lift` on hover
  - Left: a 36×36px circular layer-chip badge with 2-character initials (LF / MI / LM / RA / LV) using `--fp-*` token per layer; `SANS_FONT`, white text, `font-weight: 600`
  - Right: suggestion sentence + CTA pill button (`--ed-accent` background, `ed-btn-press`, 4px radius)
- Bottom action row: "Recommencer le diagnostic" gets a loop/restart inline SVG icon; "Retour au tableau de bord" styled as secondary outlined (`--ed-accent` border + text, no fill)

**Out:**
- Real scoring data (AI-XXX 2-pass Diagnostic)
- Per-layer drill-down view (defer)
- PDF / shareable export (defer)
- Historical comparison (defer; requires BE history endpoint)
- Recharts visualization (CSS bars only here)

#### Acceptance (Given/When/Then)
1. **Given** `/diagnostic/results` loaded, **When** the header mounts, **Then** the score "C1" enters with scale 0.96→1 + opacity 0→1 (400ms); the CEFR pill shows `--fp-sage` background.
2. **Given** desktop, **When** CouchesBreakdown mounts, **Then** bars animate from 0% to target width (Playwright: evaluate after 700ms); hovering a couche row shows the gloss tooltip.
3. **Given** mobile 375px, **When** CouchesBreakdown renders, **Then** gloss sentences are always visible inline (not behind a hover state); bars are full-width single-column.
4. **Given** the RecommendationsStub on desktop, **When** rendered, **Then** each of the 3 rows is a card with a 36px layer-chip badge, suggestion text, and a CTA pill; hovering lifts the card.
5. **Given** `prefers-reduced-motion: reduce`, **When** `/diagnostic/results` loads, **Then** no bar fill animation, no score scale/opacity animation, and no card hover-lift transition fires.

#### Tests
- `tests/unit/diagnostic/Results.test.tsx` (vitest) — update: assert CEFR pill element (`data-testid="results-cefr-pill"`) with expected token class; assert score entry animation class present; assert TacheSummary rows have 2+ sentence feedback
- `tests/unit/diagnostic/CouchesBreakdown.test.tsx` (vitest) — update: assert each bar has `transition` in its inline style; assert gloss element is in DOM (always present — tooltip visibility is CSS/JS, but the DOM node exists); assert CEFR badge has correct token class from `CEFR_PASTEL_MAP`
- `tests/unit/diagnostic/RecommendationsStub.test.tsx` (vitest) — update: assert layer-chip badge per row (`data-testid="recommendation-chip"`); assert chip initials correct (LF / MI / LM / RA / LV); assert CTA has `ed-btn-press` class; assert card has `.ed-card-lift`
- `tests/e2e/diagnostic-results.spec.ts` (Playwright) — update: wait 700ms then check bar widths settled; hover couche row and confirm tooltip visible; CEFR pill color; mobile gloss always visible without hover; reduced-motion prevents animation

#### Files Touched
- `lib/data/cefr.ts` — new: export `CEFR_PASTEL_MAP` constant (record of CEFR level → `--fp-*` CSS variable name)
- `components/diagnostic/Results.tsx` — score block animation, CEFR pill (using map), action button styling
- `components/diagnostic/CouchesBreakdown.tsx` — bar animation, tooltip (desktop) / inline gloss (mobile), CEFR badge colors via map
- `components/diagnostic/TacheSummary.tsx` — expanded 2–3 sentence feedback, "Réécouter" pill styling
- `components/diagnostic/RecommendationsStub.tsx` — card surface, layer-chip badge, CTA pill
- `tests/unit/diagnostic/Results.test.tsx` — update
- `tests/unit/diagnostic/CouchesBreakdown.test.tsx` — update
- `tests/unit/diagnostic/RecommendationsStub.test.tsx` — update
- `tests/e2e/diagnostic-results.spec.ts` — update

#### Dependencies
- UI-015 Shipped (all Results components exist)
- MOCK-010 Shipped (diagnostic motion vocabulary established)

#### Notes
- Benchmark: **Airlearn** — the results page is where Airlearn's feedback presentation excels. Each feedback sentence should feel evaluator-authored, not algorithmic. The recommendation card (chip + suggestion + CTA) mirrors Airlearn's "what to do next" pattern.
- `CEFR_PASTEL_MAP` in `lib/data/cefr.ts` will be reused in MOCK-008 (lesson CEFR badges), MOCK-009 (chunk CEFR badges in practice), and potentially by BE-XXX scoring responses. Define it once here; import everywhere else.
- Score entry animation (scale + opacity, 400ms) is subtle — the reveal should feel earned, not flashy. 400ms is the max; do not lengthen it.
- TacheSummary feedback text: 2–3 sentence general oral fluency notes. Do not invent TCF Canada rubric scoring language. Phrases like "Votre débit était adapté au contexte" are fine; "Vous avez atteint le niveau B2 selon le critère de cohérence pragmatique" are not — they would need reconciliation with AI-XXX.

---

### MOCK-012 — Global motion pass + PWA manifest

**Status:** Shipped — squash-merged 1414938
**Branch:** `feat/mock-012-audit` (FE, from `main`)
**Effort:** 1 session (~3–4h)
**Benchmark:** Shared standard (all three benchmarks share: slow confident motion, mobile-native feel, PWA installability)

#### Scope
**In:**
- **Motion consistency audit** — review every animated element added in MOCK-001 through MOCK-011; confirm timing values use `ED_DUR` / `ED_EASE_CUBIC` tokens from `lib/motion.ts` rather than raw millisecond literals; fix any deviations; document any intentional exception in a brief code comment
- **Global `prefers-reduced-motion` audit** — Playwright `{ reducedMotion: 'reduce' }` context visiting all 9 key routes (`/`, `/ecole/3`, `/vocabulaire`, `/vocabulaire/practice`, `/vocabulaire/test`, `/dashboard`, `/diagnostic`, `/diagnostic/tache/1`, `/diagnostic/results`); assert no animation fires on known animated elements across those routes
- **Touch target audit** — Playwright mobile (375×667) across the same 9 routes; enumerate all `button`, `a[href]`, and `[role="button"]` elements; assert each reports `height ≥ 44 && width ≥ 44` via `getBoundingClientRect()`; fix any failing elements in this entry
- **PWA manifest** — `public/manifest.json` with: `name: "Le Méthodic"`, `short_name: "Méthodic"`, `start_url: "/"`, `display: "standalone"`, `background_color` (hex of `--ed-bg`), `theme_color` (hex of `--ed-accent`), `icons` array with placeholder 192×192 and 512×512 PNGs in `public/icons/`; linked from `app/layout.tsx` via `<link rel="manifest" href="/manifest.json">`
- **Theme color meta** — `<meta name="theme-color" content="<ed-accent-hex>">` in `app/layout.tsx`; browser chrome matches app accent on Android / iOS Safari
- **Viewport meta** — verify `<meta name="viewport">` includes `viewport-fit=cover`; add if missing (required for iPhone notch safe-area-inset handling on fixed/sticky elements)

**Out:**
- Capacitor native wrap (P1+ — out of scope for Section 2; PWA manifest is the foundation layer before the native wrap)
- Service worker / offline mode (defer to Section 7 launch prep)
- Real app icon artwork (placeholder solid-color PNGs are fine here; final artwork is Section 7)
- Push notification manifest fields (defer — no push feature yet)
- Full Lighthouse audit (Section 7 gate — target scores not enforced here)

#### Acceptance (Given/When/Then)
1. **Given** `prefers-reduced-motion: reduce` set in Playwright context, **When** each of the 9 key routes is visited, **Then** no CSS animation or transition fires on known animated elements (verified via `getComputedStyle(el).animationName === 'none'` and `transitionDuration === '0s'` on elements identified by `data-testid`).
2. **Given** mobile 375×667 in Playwright, **When** every `button`, `a[href]`, and `[role="button"]` element is measured across the 9 key routes, **Then** all report ≥44×44px via `getBoundingClientRect()`.
3. **Given** `GET /manifest.json`, **When** the response is fetched, **Then** it returns valid JSON containing `name`, `short_name`, `start_url`, `display: "standalone"`, and at least 2 icon entries.
4. **Given** `app/layout.tsx`, **When** the `<head>` is inspected, **Then** `<link rel="manifest" href="/manifest.json">`, `<meta name="theme-color">`, and a `<meta name="viewport">` tag containing `viewport-fit=cover` are all present.

#### Tests
- `tests/e2e/reduced-motion.spec.ts` (Playwright) — new: a dedicated `{ reducedMotion: 'reduce' }` project (add to `playwright.config.ts`) visits all 9 routes; asserts `animationName === 'none'` on the key animated elements from MOCK-001–011 (identified by `data-testid`)
- `tests/e2e/touch-targets.spec.ts` (Playwright) — new: mobile viewport; for each of the 9 routes, query all interactive elements and assert height ≥ 44 AND width ≥ 44 via `getBoundingClientRect()`; build a reusable `getAllInteractiveElements(page)` helper in `tests/helpers/`
- `tests/unit/pwa/manifest.test.ts` (vitest) — new: `import manifest from '../../../public/manifest.json'`; assert `name`, `short_name`, `start_url`, `display === 'standalone'`, `icons.length ≥ 2`
- `tests/e2e/layout.spec.ts` (Playwright) — new: load `/`, assert `<link rel="manifest">` in document head; assert `<meta name="theme-color">` present; assert viewport meta contains `viewport-fit=cover`

#### Files Touched
- `public/manifest.json` — new
- `public/icons/icon-192.png` — new placeholder (solid-color PNG, `--ed-accent` hex fill)
- `public/icons/icon-512.png` — new placeholder
- `app/layout.tsx` — manifest link, theme-color meta, viewport-fit=cover on existing viewport meta
- `lib/motion.ts` — token alignment fixes only if audit reveals deviations (no new exports expected)
- `app/globals.css` — timing literal cleanup if audit reveals deviations
- `playwright.config.ts` — add `reducedMotion: 'reduce'` project variant
- `tests/helpers/interactiveElements.ts` — new reusable helper
- `tests/e2e/reduced-motion.spec.ts` — new
- `tests/e2e/touch-targets.spec.ts` — new
- `tests/unit/pwa/manifest.test.ts` — new
- `tests/e2e/layout.spec.ts` — new

#### Dependencies
- All MOCK-001 through MOCK-011 must be Shipped (this is the audit + cleanup pass over all their outputs)

#### Notes
- Benchmark: **Shared standard** — all three benchmarks (Wispr / Promova / Airlearn) share mobile-native feel and restrained motion. MOCK-012 enforces that shared floor across every surface.
- `display: "standalone"` makes the app installable on iOS/Android and removes the browser address bar — this is the foundation for the mobile-browser app-native feel goal before the Capacitor wrap (P1+). The PWA must feel app-native first.
- Touch target audit: the 44px threshold follows Apple HIG and Google Material guidance. The test will initially fail on some elements — fix those elements in this entry rather than adjusting the threshold. Do not widen the threshold.
- Placeholder icons: generate a solid `--ed-accent` fill PNG via Canvas API script or any simple tool. Final artwork is a Section 7 / design deliverable. The manifest must reference real, non-404 files.
- `viewport-fit=cover` is required for iPhone X+ notch (safe-area-inset) handling on fixed/sticky elements (sidebar, sticky header). Without it, content can be obscured on newer iPhones.
- If any `app/ecole` subroutes remain outside the `(app)` route group (route debt from pre-UI-008 era), flag them in the PR description during the motion audit. Do not migrate them in this entry.

---

## Section 3 — Backend Wiring (BE-001 to BE-022)

**Goal:** replace mock JSON fixtures with real API calls. One surface at a time. Auth first (BE-001), then read endpoints, then write endpoints. F-406 auth hardening (refresh tokens, rate limits, hCaptcha) ships in this section.

**Strategic step:** maps to Step 2b (surface wiring).

**ID range:** BE-001 to BE-022.

---

### BE-001 — Auth: signup → login → session → logout

**Status:** Shipped — squash-merged `ecdd1b0` (feat/be-001-auth-wiring → main)
**Branch:** `feat/be-001-auth-wiring` (FE, from `main`)
**Effort:** 1 session (~5–6h)

**Auth library choice: NextAuth v5 (Auth.js) with Credentials provider**

Rationale:
1. Native Next.js App Router integration — `auth()` helper works in Server Components, Route Handlers, and middleware without glue code
2. No external managed-service cost at Y0 (Supabase Auth: ~$25/mo; operating ceiling $20–50/mo total)
3. JWT strategy with token rotation covers the refresh-token requirement without a database session table
4. hCaptcha token verified server-side in the `authorize()` callback before any DB lookup (F-406)
5. Credentials provider is replaceable with OAuth in a future entry without restructuring session handling

Supabase Auth remains the fallback if the Neon/Prisma Postgres layer in BE-002 proves painful — it would absorb both auth and database. That migration is straightforward at Y0 user counts. Deferred.

#### Scope
**In:**
- `pnpm add next-auth@beta @auth/prisma-adapter bcryptjs @hcaptcha/react-hcaptcha`; `pnpm add -D @types/bcryptjs`
- `pnpm add prisma @prisma/client`; `pnpm add -D prisma` — Prisma ORM with Postgres (Neon serverless free tier at Y0; connection string in `.env.local` as `DATABASE_URL`)
- `prisma/schema.prisma` — initial schema: `User` (id, email, passwordHash, emailVerified, preferredName, createdAt), plus Auth.js adapter tables `Account`, `Session`, `VerificationToken`
- `auth.config.ts` at repo root — Credentials provider; JWT strategy; `session.maxAge: 60 * 60 * 24 * 7` (7 days); cookie flags `httpOnly: true, sameSite: 'lax', secure: NODE_ENV === 'production'`
- `app/api/auth/[...nextauth]/route.ts` — Auth.js v5 App Router catch-all handler
- **Signup Route Handler** `app/api/auth/register/route.ts`:
  - Server-side Zod validation (email format, password ≥ 8 chars, password match)
  - hCaptcha server-side verify via `POST https://hcaptcha.com/siteverify`; helper in `lib/auth/hcaptcha.ts`; uses `HCAPTCHA_SECRET` env var
  - Checks for duplicate email; returns 409 on conflict
  - `bcryptjs.hash(password, 12)` before `prisma.user.create()`
  - Returns `{ userId, email }` on 201; structured `{ error: string }` with 4xx on failure
- **Credentials `authorize()`**: receives `{ email, password, hcaptchaToken }`, verifies hCaptcha, queries Prisma, `bcryptjs.compare()`; returns `{ id, email, name: null }` on success, `null` on failure
- **Refresh tokens**: Auth.js `jwt` callback with access token expiry `NEXTAUTH_ACCESS_TOKEN_EXPIRY=900` (15 min); stateless token rotation — new JWT issued on expiry without a refresh-token DB table (sufficient at V1; add DB-backed refresh tokens in a future hardening entry)
- **Rate limiting** on `/api/auth/register` and the credentials login path: in-process `Map<ip, { count; resetAt }>` keyed by `x-forwarded-for` / `request.ip`; 5 attempts / 15 min window; 429 + `Retry-After` header on breach; logic in `lib/auth/rateLimit.ts`
- **Middleware** `middleware.ts` at repo root: `auth()` from Auth.js; redirects unauthenticated requests on `(app)` paths to `/login`; matcher: `['/((?!api|_next/static|_next/image|favicon.ico|public).*)']`; `(app)` paths: `/dashboard`, `/ecole`, `/vocabulaire`, `/diagnostic`, `/account`
- **TopNav coexistence** (carry-forward): `EXCLUDED_PREFIXES` constant in `components/layout/StickyHeader.tsx`; `usePathname()` check returns `null` when pathname starts with any of: `/dashboard`, `/ecole`, `/vocabulaire`, `/diagnostic`, `/account`, `/signup`, `/login`, `/onboarding`. Future cleanup: restructure landing routes into a `(marketing)` route group so StickyHeader is never mounted for `(app)` routes.
- **`LoginForm`** `components/auth/LoginForm.tsx` — email + password fields + `HCaptcha` widget; submit calls `signIn('credentials', { email, password, hcaptchaToken, callbackUrl: '/dashboard' })`; inline error on 401; `ed-field` class on inputs; `.ed-btn-press` on submit; form card surface matches `SignupForm` (MOCK-005 treatment)
- `app/login/page.tsx` — replaces UI-004 stub; renders `<LoginForm />`; must NOT render inside `(app)` shell
- **`SignupForm` update**: replace the fake 300ms redirect from UI-005 with a real `POST /api/auth/register`; on 201, call `signIn('credentials', ...)` programmatically; add `HCaptcha` widget; propagate hCaptchaToken into the request body
- **Signout**: `signOut({ callbackUrl: '/' })` wired to a "Déconnexion" link in a new `SidebarFooter` sub-component rendered at the bottom of `Sidebar.tsx`; icon: inline door/exit SVG
- **Sidebar session display**: `Sidebar.tsx` updated to call `useSession()` from `next-auth/react`; avatar initials derived from `session.user.name` (first letter of each word, max 2 chars) or first letter of email; removes the hardcoded `"CH"` default

**Out (deferred, do not add):**
- OAuth providers (Google, Apple) — deferred to BE-XXX
- Email verification email send (SES/Resend) — deferred to BE-XXX
- 2FA / TOTP — deferred
- Passwordless magic link — deferred
- Account deletion self-service — LGL-XXX (data subject rights)
- Prisma models for lessons/chunks/taches — BE-003/004/005
- Real user name / persona from onboarding persistence — BE-002
- DB-backed refresh token rotation (stateless JWT rotation is sufficient at V1) — BE-XXX hardening
- Redis-backed rate limiting (in-memory is sufficient at Y0) — BE-XXX hardening

#### Acceptance (Given/When/Then)
1. **Given** a valid signup form submission with a solved hCaptcha token, **When** `POST /api/auth/register` is called, **Then** a User row exists in Postgres, the response is 201 `{ userId, email }`, and the browser receives a session cookie.
2. **Given** a registered user on `/login`, **When** they submit valid credentials with a solved hCaptcha, **Then** `signIn()` resolves, the session cookie is set, and the router navigates to `/dashboard`.
3. **Given** an unauthenticated browser, **When** the user navigates to `/dashboard`, **Then** middleware redirects to `/login`.
4. **Given** an authenticated session, **When** the user navigates to `/ecole` or `/dashboard`, **Then** the `StickyHeader` is absent from those routes.
5. **Given** the same IP submits 6 `POST /api/auth/register` calls within 15 min, **When** the 6th arrives, **Then** the response is 429 with a `Retry-After` header.
6. **Given** an authenticated user in the sidebar, **When** "Déconnexion" is clicked, **Then** `signOut()` fires and the browser returns to `/`.
7. **Given** mobile 375px on `/login`, **When** the form renders, **Then** all inputs, the hCaptcha widget, and the submit button are visible without horizontal scroll; the submit button is ≥44px tall.

#### Tests
- `tests/unit/auth/register.test.ts` (vitest) — route handler returns 201 on valid input; 409 on duplicate email; 422 on Zod failure; 429 on 6th call within window; hCaptcha success + failure paths mocked via `vi.mock('lib/auth/hcaptcha')`
- `tests/unit/auth/login.test.tsx` (vitest) — `LoginForm` renders email + password + hCaptcha widget; submit disabled until both fields non-empty + hCaptcha token present; error message renders when `signIn` returns `{ error }`
- `tests/unit/auth/rateLimit.test.ts` (vitest) — allows 5 calls, blocks 6th, resets after window; uses `vi.useFakeTimers()`
- `tests/unit/layout/StickyHeader.test.tsx` (vitest) — update: assert returns `null` for `/dashboard`, `/ecole`, `/vocabulaire`, `/diagnostic`, `/account`; assert renders for `/`, `/signup`, `/login`
- `tests/e2e/auth-flow.spec.ts` (Playwright) — sign up with new email → lands on `/dashboard`; sign out → `/`; sign in → `/dashboard`; unauthenticated `/dashboard` redirects to `/login`; `StickyHeader` absent on `/dashboard`, present on `/`

#### Files Touched
- `auth.config.ts` — new
- `prisma/schema.prisma` — new
- `prisma/migrations/` — new (generated; commit the migration SQL)
- `app/api/auth/[...nextauth]/route.ts` — new
- `app/api/auth/register/route.ts` — new
- `app/login/page.tsx` — replaces UI-004 stub
- `components/auth/LoginForm.tsx` — new
- `components/auth/SignupForm.tsx` — update: wire `/api/auth/register`, add hCaptcha widget
- `components/layout/StickyHeader.tsx` — update: `EXCLUDED_PREFIXES` + `usePathname()` null guard
- `components/layout/Sidebar.tsx` — update: `useSession()` initials, `SidebarFooter`
- `components/layout/SidebarFooter.tsx` — new: signout link
- `middleware.ts` — new
- `lib/auth/rateLimit.ts` — new
- `lib/auth/hcaptcha.ts` — new
- `tests/unit/auth/register.test.ts` — new
- `tests/unit/auth/login.test.tsx` — new
- `tests/unit/auth/rateLimit.test.ts` — new
- `tests/unit/layout/StickyHeader.test.tsx` — update
- `tests/e2e/auth-flow.spec.ts` — new

#### Dependencies
- All MOCK-001 through MOCK-012 Shipped (auth is the first Section 3 entry; all UI + mock surfaces must be stable before real session state is introduced)
- `.env.local` variables required before session starts: `DATABASE_URL` (Neon), `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`), `NEXTAUTH_URL` (e.g. `http://localhost:3000`), `HCAPTCHA_SECRET`, `HCAPTCHA_SITE_KEY`
- Neon Postgres project created and connection string available

#### Notes
- **Auth.js v5 vs v4**: v5 is the App Router–native release with the `auth()` export. Do not install `next-auth@4` — the App Router integration is fundamentally different. Read the Auth.js v5 docs for the Prisma adapter setup and the `jwt` callback signature changes.
- **Prisma + Neon**: use `@neondatabase/serverless` HTTP adapter for Edge runtime compatibility (`previewFeatures = ["driverAdapters"]` in `schema.prisma`). `prisma generate` must run after schema changes; add it to `package.json` `postinstall`.
- **TopNav carry-forward**: the `EXCLUDED_PREFIXES` list must be updated whenever a new `(app)` route is added. Document this in the StickyHeader file with a comment. The permanent fix (route group restructure) is tracked as a future cleanup; do NOT do it in this entry.
- **Route debt flag**: if any `app/ecole` subroutes remain outside the `(app)` group, confirm the middleware matcher does not accidentally block them. Add them to `EXCLUDED_PREFIXES` in `StickyHeader` if they have chrome from the landing layout.
- **hCaptcha in CI**: use the hCaptcha test site key `10000000-ffff-ffff-ffff-000000000001` (always passes) in `HCAPTCHA_SITE_KEY` for test environments. Never hardcode keys — always read from env vars.
- **Password hash cost**: `bcryptjs` cost factor 12 is standard for Y0 traffic. If auth latency becomes a concern, this can be lowered to 10; do not go below 10.

---

### BE-002 — User profile API

**Status:** Not Started
**Branch:** `feat/be-002-user-profile` (FE, from `main`)
**Effort:** 1 session (~3–4h)

#### Scope
**In:**
- Extend `prisma/schema.prisma` `User` model with persona fields: `preferredName String?`, `goal String?` (TCF_CANADA | DALF_C1 | TEF_CANADA — locked taxonomy per onboarding), `currentLevel String?` (A1_A2 | A2_B1 | B1_B2 | B2_plus), `targetScore String?`, `examDate String?`; run `prisma migrate dev`
- `app/api/me/route.ts` — GET: requires Auth.js session (return 401 if missing); reads `prisma.user.findUnique({ where: { id: session.user.id } })`; returns `{ id, email, preferredName, emailVerified, persona: { goal, currentLevel, targetScore, examDate } }`
- `app/api/me/route.ts` — PATCH: Zod-validated body `{ preferredName?, goal?, currentLevel?, targetScore?, examDate? }`; `prisma.user.update()`; returns updated profile on 200
- `lib/api/me.ts` — typed fetch helpers `fetchMe(): Promise<UserProfile>` and `updateMe(patch): Promise<UserProfile>` that call `/api/me`; these are the sole import point for components — no component calls `fetch('/api/me')` directly
- **Dashboard greeting**: `app/(app)/dashboard/page.tsx` upgraded from a Client Component to a Server Component; calls `auth()` to get session; renders `Bonjour, {user.preferredName || user.name || 'vous'}` — replaces the plain "Bonjour" from UI-007
- **Sidebar session display**: `Sidebar.tsx` already updated in BE-001 to derive initials from session; no further change here unless the `preferredName` field improves initials derivation (update the initials logic if so)
- **Email verification banner**: `app/(app)/layout.tsx` renders a dismissible inline banner "Vérifiez votre adresse email pour activer votre compte." when `session.user.emailVerified === null`; local `dismissed` state only (no persistence); banner styled as `--fp-butter` background chip, 1-line, with × button; does NOT send an email (send is Scope Out)
- `/exam-prep` LandingPage.tsx flag: if `LandingPage.tsx` or any landing component imports user profile data, flag in PR description. This entry does NOT touch landing components.

**Out (deferred, do not add):**
- Email verification email send (SES/Resend/Postmark) — deferred to BE-XXX
- Onboarding persona persistence (wiring the existing onboarding state machine to POST `/api/me` on step-6 continue) — deferred to a separate BE entry; this entry only creates the GET + PATCH endpoint
- Avatar image upload — deferred
- Account settings page full implementation (`/account` is still a stub) — deferred
- Public profile / shareable diagnostic results — CON-XXX
- GDPR data export / deletion endpoint — LGL-XXX
- components/home/* legacy consumers (/vocab, /speaking, /writing, /profile, /more) — flag in PR if any read user state; do not touch in this entry

#### Acceptance (Given/When/Then)
1. **Given** an authenticated session, **When** `GET /api/me` is called, **Then** the response is 200 with `{ id, email, preferredName, emailVerified, persona: { goal, currentLevel, targetScore, examDate } }` matching the session user's DB record.
2. **Given** an unauthenticated request, **When** `GET /api/me` is called, **Then** the response is 401.
3. **Given** `PATCH /api/me` with `{ preferredName: "Chadi" }`, **When** the handler runs, **Then** the Postgres `User.preferredName` field is updated and the response returns the updated profile.
4. **Given** a logged-in user whose `emailVerified` is null, **When** any `(app)` route renders, **Then** the email-verification banner is visible; clicking × removes it from the DOM (page-reload restores it).
5. **Given** `/dashboard` loaded by an authenticated user with `preferredName: "Chadi"`, **When** the Server Component renders, **Then** the greeting reads "Bonjour, Chadi".

#### Tests
- `tests/unit/api/me.test.ts` (vitest) — GET returns 200 with correct shape for an authenticated mock session; GET returns 401 for unauthenticated; PATCH updates preferredName; PATCH with invalid goal enum returns 422
- `tests/unit/dashboard/Dashboard.test.tsx` (vitest) — update: assert greeting includes the name passed as prop (Server Component tested via mocked `auth()`)
- `tests/unit/layout/AppShell.test.tsx` (vitest) — update: assert email-verification banner renders when `emailVerified === null`; assert × click removes it
- `tests/e2e/profile-api.spec.ts` (Playwright) — sign in; `GET /api/me` returns session email; `PATCH /api/me` with new preferredName; refresh `/dashboard` and confirm greeting reflects new name; unverified email banner visible, × dismisses it

#### Files Touched
- `prisma/schema.prisma` — extend User model with persona fields
- `prisma/migrations/` — new migration
- `app/api/me/route.ts` — new
- `lib/api/me.ts` — new
- `app/(app)/dashboard/page.tsx` — convert to Server Component, add personalized greeting
- `app/(app)/layout.tsx` — add email-verification banner
- `tests/unit/api/me.test.ts` — new
- `tests/unit/dashboard/Dashboard.test.tsx` — update
- `tests/unit/layout/AppShell.test.tsx` — update
- `tests/e2e/profile-api.spec.ts` — new

#### Dependencies
- BE-001 Shipped (Auth.js session + Prisma + User model must exist; EXCLUDED_PREFIXES in StickyHeader already resolved)

#### Notes
- The `lib/api/me.ts` helper is the single import seam. When the data source changes (e.g. moves to the Python backend), only this file changes — no component updates.
- Dashboard conversion to Server Component requires removing the `'use client'` directive and any browser-only hooks. Date formatting via `Intl.DateTimeFormat` still works in Server Components; `useState` / `useEffect` must move to a child Client Component if needed.
- Persona field taxonomy (`goal`, `currentLevel`) must match the string values used in the existing onboarding components (`TCFGoalSelect`, `CurrentLevelSelect`). Check `OnboardingFlow.tsx` for the canonical string values before writing the Zod schema.
- `/exam-prep` dual landing (LandingPage.tsx) carry-forward: if `LandingPage.tsx` renders user-specific content gated on persona, that wiring is a separate BE entry. This entry only creates the endpoint.

---

### BE-003 — Lesson data API

**Status:** Shipped — squash-merged `7319141` (feat/be-003-ecole-wiring → main)
**Branch:** `feat/be-003-ecole-wiring`
**Effort:** 1 session (~3–4h)

#### Scope
**In:**
- Extend `prisma/schema.prisma` with `Lesson` model: `id Int @id`, `title String`, `description String`, `section String` (Fondations | Approfondissement), `cefr String` (B1 | B2), `position Int` (1–27, unique, used for ordering); run `prisma migrate dev`
- `prisma/seed.ts` — reads `lib/data/lessons.ts` fixture and `prisma.lesson.upsert()`s all 27 entries; run with `prisma db seed`; add `"prisma": { "seed": "ts-node prisma/seed.ts" }` to `package.json`
- `app/api/lessons/route.ts` — GET: no auth required (public curriculum); returns all 27 lessons ordered by `position` as `Lesson[]`; response shape matches the existing `lib/data/lessons.ts` export shape exactly
- `app/api/lessons/[id]/route.ts` — GET: `prisma.lesson.findUnique({ where: { id: parseInt(params.id) } })`; returns `Lesson` on 200, 404 if not found, 400 if `id` is non-numeric
- `lib/api/lessons.ts` — typed helpers `fetchLessons(): Promise<Lesson[]>` and `fetchLesson(id: number): Promise<Lesson | null>`; these are the sole import point for components
- **Frontend migration** for lesson consumers: replace all direct `import { LESSONS } from 'lib/data/lessons'` calls with calls to `lib/api/lessons.ts` helpers:
  - `components/ecole/LessonList.tsx` — use `fetchLessons()` (Server Component)
  - `app/(app)/ecole/[id]/page.tsx` — use `fetchLesson(id)` (Server Component); `notFound()` when null
  - `lib/data/dashboard.ts` `NEXT_LESSON` pointer — update to call `fetchLesson(4)` or derive from a Server Component fetch; see Notes
- **`lib/data/lessons.ts`** — keep file in place as the migration source (seed script reads it); add a deprecation comment: `// Deprecated: seed source only — use lib/api/lessons.ts for component data`
- **Route debt flag**: `app/ecole/` subroutes outside `(app)` group (`/intro`, `/lesson/[id]`, `/quiz`) — if any exist, they are documented in the PR description as route debt. This entry does NOT migrate them; they continue to import from `lib/data/lessons.ts` until a dedicated migration entry.

**Out (deferred, do not add):**
- Per-user completion state / progress tracking on lessons — BE-XXX (a `UserLesson` join table with `completedAt`)
- Lesson body content (real curriculum text for the 27 lessons) — CON-XXX
- Lesson audio files — AI-XXX (TTS)
- Filtering / sorting lessons by CEFR, section, state — covered by query params when per-user state lands
- Pre-requisite gating logic — BE-XXX
- Real audio elements of any kind

#### Acceptance (Given/When/Then)
1. **Given** `GET /api/lessons`, **When** the handler runs, **Then** the response is 200 JSON array of 27 Lesson objects in ascending `position` order, each with `id`, `title`, `description`, `section`, `cefr` fields.
2. **Given** `GET /api/lessons/5`, **When** the handler runs, **Then** the response is 200 with the lesson at position 5; `GET /api/lessons/99` returns 404; `GET /api/lessons/abc` returns 400.
3. **Given** `/ecole` rendered as a Server Component, **When** the page loads, **Then** `fetchLessons()` is called (no direct `lib/data/lessons` import); the 16 Fondations + 11 Approfondissement split renders correctly.
4. **Given** `/ecole/3` rendered as a Server Component, **When** the page loads, **Then** `fetchLesson(3)` populates the breadcrumb title and lesson header with DB data.
5. **Given** the seed script runs against an empty Postgres DB, **When** `pnpm prisma db seed` completes, **Then** exactly 27 Lesson rows exist in the `Lesson` table.

#### Tests
- `tests/unit/api/lessons.test.ts` (vitest) — GET returns 200 + 27 lessons in order; GET /5 returns lesson at id 5; GET /99 returns 404; GET /abc returns 400; no auth required
- `tests/unit/ecole/LessonList.test.tsx` (vitest) — update: mock `fetchLessons()` from `lib/api/lessons`; confirm it is called rather than the static import; rendering assertions unchanged from UI-008
- `tests/unit/ecole/LessonDetail.test.tsx` (vitest) — update: mock `fetchLesson(3)` from `lib/api/lessons`; rendering assertions unchanged from UI-009
- `tests/e2e/ecole-list.spec.ts` (Playwright) — update: lesson list still renders 27 cards split 16/11; data sourced from DB via API (seed must run before e2e suite)
- `tests/e2e/ecole-detail.spec.ts` (Playwright) — update: lesson detail title matches DB fixture; invalid id still 404s

#### Files Touched
- `prisma/schema.prisma` — add Lesson model
- `prisma/migrations/` — new migration
- `prisma/seed.ts` — new (or update if exists from BE-001)
- `app/api/lessons/route.ts` — new
- `app/api/lessons/[id]/route.ts` — new
- `lib/api/lessons.ts` — new
- `lib/data/lessons.ts` — add deprecation comment; do NOT delete (seed reads it)
- `components/ecole/LessonList.tsx` — update import to `lib/api/lessons`
- `app/(app)/ecole/[id]/page.tsx` — update to Server Component fetch via `lib/api/lessons`
- `lib/data/dashboard.ts` — update `NEXT_LESSON` pointer (see Notes)
- `tests/unit/api/lessons.test.ts` — new
- `tests/unit/ecole/LessonList.test.tsx` — update
- `tests/unit/ecole/LessonDetail.test.tsx` — update
- `tests/e2e/ecole-list.spec.ts` — update
- `tests/e2e/ecole-detail.spec.ts` — update

#### Dependencies
- BE-001 Shipped (Prisma + DB connection established; seed infrastructure exists)
- BE-002 recommended (Server Component conversion pattern established for dashboard — apply same pattern here)

#### Notes
- **Response shape must match fixture**: compare the TypeScript type in `lib/data/lessons.ts` before writing the Prisma query — column names must be identical so zero component changes are needed downstream. If any field name in `schema.prisma` differs from the fixture type, alias it in the Prisma `select` clause.
- **`lib/data/dashboard.ts` NEXT_LESSON**: this field currently holds a static reference to `LESSONS[4]`. After migration, it should either (a) be converted to a Server Component fetch in `NextLessonWidget.tsx` pulling `fetchLesson(5)` directly, or (b) remain static until BE-XXX wires per-user next-lesson logic. Option (a) is preferred — it removes the dashboard.ts fixture dependency on lessons data. Document the choice in the PR.
- **Route debt (`app/ecole/` outside `(app)`)**: if any such routes exist (flagged in MOCK-012), their `lib/data/lessons.ts` import is left untouched by this entry. Note them by filename in the PR description.
- **Seed idempotency**: `prisma.lesson.upsert()` on `id` ensures re-running `pnpm prisma db seed` is safe. Use `upsert` not `create` in the seed script.
- **No auth on lesson endpoints**: lesson data is public curriculum. Auth is not required for `GET /api/lessons` or `GET /api/lessons/[id]`. Per-user state (progress, completion) is a future endpoint.

---

### BE-004 — Chunk data API

**Status:** Shipped — squash-merged af1deb3
**Branch:** `feat/be-004-vocab-wiring` (FE, from `main`)
**Effort:** 1 session (~3–4h)

#### Scope
**In:**
- Extend `prisma/schema.prisma` with `Chunk` model: `id Int @id @default(autoincrement())`, `french String`, `gloss String`, `cefr String` (A1 | A2 | B1 | B2 | C1), `source String` (Média | Conversation | Travail | Voyage | Quotidien); run `prisma migrate dev`
- `prisma/seed.ts` — updated to also upsert the 60 chunks from `lib/data/chunks.ts`
- `app/api/chunks/route.ts` — GET: query params `cefr` (comma-separated, e.g. `?cefr=A1,B1`), `source` (single value), `q` (case-insensitive substring match on `french`); all params optional; no auth required; returns filtered `Chunk[]` ordered by `id`; filtering implemented as Prisma `where` clauses — NOT in application code
- `lib/api/chunks.ts` — typed helper `fetchChunks(params: ChunkFilterParams): Promise<Chunk[]>`; `ChunkFilterParams` matches the query param shape; this is the sole import point for components
- **`lib/vocab/filter.ts` becomes a thin client wrapper**: the function `applyFilters(chunks, filterState)` is replaced by `buildChunkParams(filterState): ChunkFilterParams` which constructs the query params for `fetchChunks()`; the actual filtering now happens server-side in the Postgres query; `filter.ts` is renamed to `lib/vocab/params.ts` (update all imports)
- **Frontend migration** for chunk consumers:
  - `components/vocabulaire/VocabBrowse.tsx` — replaces static import with a client-side `useSWR('/api/chunks', ...)` call (or `useEffect` fetch); pass active filter state as query params; `fetchChunks(filterState)` from `lib/api/chunks.ts` via a custom hook `useChunks(filterState)` in `lib/hooks/useChunks.ts`
  - `components/vocabulaire/PracticeDeck.tsx` — replaces static import with `fetchChunks({})` call (all chunks, no filter) on component mount
  - `lib/vocab/quiz.ts` `buildQuiz()` — updated to accept `Chunk[]` from the caller rather than importing from the fixture directly (function signature unchanged beyond input source)
- **components/home/* legacy consumers**: if any file under `components/home/` or `/vocab`, `/speaking`, `/writing`, `/profile`, `/more` routes imports from `lib/data/chunks.ts`, flag in PR description. This entry does NOT touch those consumers.
- `lib/data/chunks.ts` — add deprecation comment; keep as seed source

**Out (deferred, do not add):**
- Real save / collection (saving chunks to a user's list) — BE-XXX (`UserChunk` table with `savedAt`)
- Server-side pagination (client loads all chunks matching filters; pagination when chunk count justifies it)
- Spaced-repetition scoring and deck selection — AI-XXX
- Audio playback per chunk (TTS pronunciation) — AI-XXX
- Tag-based filters beyond source and CEFR — deferred
- Sorting — deferred

#### Acceptance (Given/When/Then)
1. **Given** `GET /api/chunks`, **When** no query params are sent, **Then** the response is 200 with all 60 chunks as a JSON array.
2. **Given** `GET /api/chunks?cefr=A1,B1`, **When** the handler runs, **Then** only chunks with `cefr` in `['A1', 'B1']` are returned.
3. **Given** `GET /api/chunks?source=Média`, **When** the handler runs, **Then** only chunks with `source === 'Média'` are returned.
4. **Given** `GET /api/chunks?q=tomber`, **When** the handler runs, **Then** only chunks whose `french` field contains "tomber" (case-insensitive) are returned.
5. **Given** `/vocabulaire` loaded, **When** the browse view renders, **Then** `fetchChunks({})` is called (no static import); 60 rows render; the CEFR chip filter triggers a new `fetchChunks({ cefr: [...] })` call.
6. **Given** all 5 CEFR chips deselected, **When** the filter applies, **Then** `GET /api/chunks?cefr=` is NOT called (empty selection = no results, show empty state — preserve existing empty-state UX from UI-010).

#### Tests
- `tests/unit/api/chunks.test.ts` (vitest) — GET 200 + 60 items unfiltered; CEFR filter; source filter; search filter; combined CEFR+source filter; empty result case
- `tests/unit/vocabulaire/filter-logic.test.ts` (vitest) — update: tests now call `buildChunkParams(filterState)` and assert the output query param object; rename file to `tests/unit/vocabulaire/params-logic.test.ts`
- `tests/unit/vocabulaire/VocabBrowse.test.tsx` (vitest) — update: mock `useChunks` from `lib/hooks/useChunks`; assert it is called on mount; assert filter chip toggle calls the hook with updated params
- `tests/e2e/vocabulaire-browse.spec.ts` (Playwright) — update: 60 rows visible; deselect A1 chip → only non-A1 rows; source dropdown → filtered rows; search → filtered rows; empty state appears when no match; e2e seed must include chunks

#### Files Touched
- `prisma/schema.prisma` — add Chunk model
- `prisma/migrations/` — new migration
- `prisma/seed.ts` — update to seed chunks
- `app/api/chunks/route.ts` — new
- `lib/api/chunks.ts` — new
- `lib/vocab/params.ts` — renamed from `lib/vocab/filter.ts`; exports `buildChunkParams()` instead of `applyFilters()`
- `lib/hooks/useChunks.ts` — new: client-side hook wrapping `fetchChunks()`
- `lib/data/chunks.ts` — add deprecation comment; keep as seed source
- `components/vocabulaire/VocabBrowse.tsx` — replace static import with `useChunks()`
- `components/vocabulaire/PracticeDeck.tsx` — replace static import with `fetchChunks({})` on mount
- `lib/vocab/quiz.ts` — update `buildQuiz()` to accept `Chunk[]` parameter (no longer imports fixture)
- `tests/unit/api/chunks.test.ts` — new
- `tests/unit/vocabulaire/params-logic.test.ts` — renamed + updated from `filter-logic.test.ts`
- `tests/unit/vocabulaire/VocabBrowse.test.tsx` — update
- `tests/e2e/vocabulaire-browse.spec.ts` — update

#### Dependencies
- BE-001 Shipped (Prisma + DB)
- BE-003 Shipped recommended (seed infrastructure and migration pattern established)

#### Notes
- **Filter logic moves server-side**: `applyFilters()` is deleted; the Prisma `where` clause is the new filter engine. The existing `filter-logic.test.ts` unit tests should be rewritten to test `buildChunkParams()` output shapes rather than in-memory filter behavior. The e2e tests catch the end-to-end filter correctness.
- **`useChunks` hook**: wrap `useSWR` or a simple `useEffect` + `useState` pattern. SWR is preferred — it handles deduplication, caching, and revalidation cleanly for this use case. `pnpm add swr` if not already installed.
- **VocabBrowse async state**: converting from synchronous static import to async fetch means a loading state is needed. Add a skeleton row (using the existing `.ed-skeleton` CSS utility from `app/globals.css`) visible while the fetch resolves. The skeleton should show 8–10 placeholder rows at the same height as ChunkRows.
- **Empty CEFR selection edge case**: when all 5 CEFR chips are deselected, the UI shows the empty state without making a network request (same behavior as UI-010 empty-state logic). Handle this in `buildChunkParams()` — return `null` (don't call the API) when the CEFR array is empty.
- **Legacy consumers flag**: `components/home/*` files were legacy consumers of vocab data per the carry-forward. If `VocabBrowse` or any home component imports `lib/data/chunks.ts`, flag the file path in the PR description. They are not migrated in this entry.

---

### BE-005 — Tâche data API

**Status:** Shipped — squash-merged d6c8a10
**Branch:** `feat/be-005-taches-wiring` (FE, from `main`)
**Effort:** 1 session (~2–3h)

#### Scope
**In:**
- Extend `prisma/schema.prisma` with `Tache` model: `id Int @id`, `title String`, `descriptor String`, `durationLabel String`, `durationSeconds Int`, `prompt String`; run `prisma migrate dev`
- `prisma/seed.ts` — updated to also upsert the 3 tâches from `lib/data/taches.ts`
- `app/api/taches/route.ts` — GET: no auth required; returns all 3 tâches as `Tache[]` ordered by `id`
- `app/api/taches/[id]/route.ts` — GET: `prisma.tache.findUnique({ where: { id: parseInt(params.id) } })`; returns `Tache` on 200; 404 if not found; 400 if `id` non-numeric
- `lib/api/taches.ts` — typed helpers `fetchTaches(): Promise<Tache[]>` and `fetchTache(id: number): Promise<Tache | null>`; sole import point for components
- **Frontend migration** for tâche consumers:
  - `app/(app)/diagnostic/page.tsx` — Server Component; replace `lib/data/taches.ts` import with `fetchTaches()` to populate the `TacheOverviewGrid`
  - `app/(app)/diagnostic/tache/[n]/page.tsx` — Server Component; replace with `fetchTache(n)`; `notFound()` when null (preserves the existing 404 behavior for `n > 3` or non-numeric)
- `lib/data/taches.ts` — add deprecation comment; keep as seed source
- `durationSeconds` field: add `durationSeconds` to `lib/data/taches.ts` fixture entries before seeding (Tâche 1: 180, Tâche 2: 210, Tâche 3: 300); the `Timer` component should read `durationSeconds` instead of parsing `durationLabel` — update `Timer.tsx` accordingly

**Out (deferred, do not add):**
- Real tâche prompt library expansion (50 scenarios — F-061.2 Livraison 2/2) — CON-XXX
- Per-user tâche attempt history / scoring — BE-XXX (a `UserTache` join table)
- Audio recording submission (MediaRecorder → Python backend) — AI-XXX (F-327 voice pipeline)
- Real scoring of tâche responses — AI-XXX (F-322 validator)
- Re-take limits / attempt counters — BE-XXX

#### Acceptance (Given/When/Then)
1. **Given** `GET /api/taches`, **When** the handler runs, **Then** the response is 200 with exactly 3 Tache objects in ascending `id` order, each with `id`, `title`, `descriptor`, `durationLabel`, `durationSeconds`, `prompt` fields.
2. **Given** `GET /api/taches/2`, **When** the handler runs, **Then** the response is 200 with the Tâche 2 record; `GET /api/taches/4` returns 404; `GET /api/taches/xyz` returns 400.
3. **Given** `/diagnostic` rendered as a Server Component, **When** the page loads, **Then** `fetchTaches()` is called; the 3-card tâche overview grid renders with DB-sourced titles and descriptors.
4. **Given** `/diagnostic/tache/1` rendered as a Server Component, **When** the page loads, **Then** `fetchTache(1)` populates the tâche header and prompt; the `Timer` initializes to `durationSeconds: 180` (3:00).
5. **Given** `/diagnostic/tache/4` loaded, **When** `fetchTache(4)` returns null, **Then** `notFound()` fires and the Next.js 404 page renders.

#### Tests
- `tests/unit/api/taches.test.ts` (vitest) — GET returns 200 + 3 tâches ordered by id; GET /2 returns tâche 2; GET /4 returns 404; GET /xyz returns 400; no auth required
- `tests/unit/diagnostic/TacheShell.test.tsx` (vitest) — update: mock `fetchTache(1)` from `lib/api/taches`; assert `Timer` receives `durationSeconds: 180`; rendering assertions unchanged from UI-014
- `tests/unit/diagnostic/Timer.test.tsx` (vitest) — update: Timer accepts `durationSeconds` prop (not parsed from string); existing urgency + reset tests pass with numeric input
- `tests/e2e/diagnostic-landing.spec.ts` (Playwright) — update: tâche cards render with DB-sourced titles (seed must run before e2e)
- `tests/e2e/diagnostic-tache.spec.ts` (Playwright) — update: `/diagnostic/tache/1` timer initializes to 3:00; `/diagnostic/tache/4` still 404s

#### Files Touched
- `prisma/schema.prisma` — add Tache model
- `prisma/migrations/` — new migration
- `prisma/seed.ts` — update to seed tâches
- `app/api/taches/route.ts` — new
- `app/api/taches/[id]/route.ts` — new
- `lib/api/taches.ts` — new
- `lib/data/taches.ts` — add `durationSeconds` field to fixture entries; add deprecation comment
- `app/(app)/diagnostic/page.tsx` — convert to Server Component; replace static import with `fetchTaches()`
- `app/(app)/diagnostic/tache/[n]/page.tsx` — convert to Server Component; replace static import with `fetchTache(n)`
- `components/diagnostic/Timer.tsx` — update to accept `durationSeconds: number` prop instead of parsing `durationLabel`
- `tests/unit/api/taches.test.ts` — new
- `tests/unit/diagnostic/TacheShell.test.tsx` — update
- `tests/unit/diagnostic/Timer.test.tsx` — update
- `tests/e2e/diagnostic-landing.spec.ts` — update
- `tests/e2e/diagnostic-tache.spec.ts` — update

#### Dependencies
- BE-001 Shipped (Prisma + DB)
- BE-003 Shipped recommended (seed + migration pattern established; consistent `durationSeconds` approach mirrors lesson fixture migration pattern)

#### Notes
- **`durationSeconds` refactor**: the `Timer` component currently parses `durationLabel` (e.g. `"03:00"`) into seconds. This entry adds a first-class `durationSeconds` field to the Prisma model and fixture, and updates `Timer` to accept it as a numeric prop. This is a non-breaking change — `durationLabel` remains in the API response for display use (the "Durée : ~3 min" label on TacheCard).
- **Only 3 tâches**: the tâche library expansion to 50 scenarios (F-061.2) is CON-XXX content work. This entry seeds exactly the 3 existing fixtures; do not generate placeholder additional tâches.
- **Lightest of the five BE entries**: tâches are the simplest dataset (3 items, no filtering). This entry is primarily a migration from static fixture to DB + API, following the patterns established in BE-003 and BE-004.
- **Timer prop change is the only logic change**: all other diagnostic component changes are pure import swaps (fixture → `lib/api/taches.ts`). Confirm `Timer.test.tsx` passes with the `durationSeconds` numeric prop before merging.

---

### BE-006 — Onboarding questionnaire wiring

**Status:** Not Started
**Branch:** `feat/be-006-onboarding-submit` (FE, from `main`)
**Effort:** 1 session (~3–4h)

#### Scope
**In:**
- `lib/api/onboarding.ts` — two typed fetch helpers:
  - `fetchOnboardingQuestions(): Promise<OnboardingQuestionsResponse>` — calls `GET /onboarding/questions`; returns 11 questions with `{ id, order, type, required, heading: { en, fr }, helper: { en, fr }, options?: [{ value, label: { en, fr } }] }`; used to populate option copy dynamically at runtime
  - `submitOnboarding(payload: OnboardingSubmitRequest): Promise<OnboardingSubmitResponse>` — calls `POST /onboarding/submit`; these are the sole import points — no component calls fetch directly
- **Schema reconciliation** — the FE `OnboardingState` shape diverges from the BE `OnboardingSubmitRequest`; the following mapping must be applied before the POST call:
  - `interface_language`: pass through from `LanguageSelect` (`"en" | "fr"`)
  - `q0_target_exam`: FE `TCFGoalSelect` currently emits custom goal slugs (`TCF_CANADA` etc.); normalize to BE contract slugs: `tcf_canada | tef_canada | delf_b1_b2 | another_exam | not_sure`; update the `TCFGoalSelect` option values to match the BE enum exactly and remove any separate mapping layer
  - `q1_current_level`: FE `CurrentLevelSelect` emits `A1_A2 | A2_B1 | B1_B2 | B2_plus`; BE expects `a2 | b1 | b2 | c1 | not_sure`; map A1_A2 → a2, A2_B1 → b1, B1_B2 → b2, B2_plus → c1; update the `CurrentLevelSelect` option values and the `CurrentLevel` type export
  - `q2_target_level`: FE `TargetScoreSelect` emits custom labels; normalize to `b1 | b2 | c1 | c2 | not_sure`; update option values and the `TargetScore` type export
  - `q3_exam_date / q3_no_exam_scheduled`: FE `ExamDateSelect` already captures a date string or a "quick" label; any "no exam scheduled" label must set `q3_no_exam_scheduled: true` and `q3_exam_date: null`; date values must be sent as ISO 8601 date strings (`YYYY-MM-DD`)
- **New onboarding step 6 "À propos de vous"** — inserted before the current EcoleReveal (which becomes step 7); collects the four required BE fields not yet present in the FE: `q7_hours_per_week` (`less_than_2 | 2_to_5 | 5_to_10 | more_than_10`), `q9_native_language` (`english | arabic | spanish | portuguese | mandarin | hindi | russian | german | italian | other`), `q10_prior_exam_history` (`never | recent_6mo | recent_12mo | older`), `q11_feedback_mode` (`calm | method`); all four displayed as single-select cards using the existing `OnboardingCard` / `OnboardingScreen` primitives; pressing continue advances to step 7 (EcoleReveal); `total={7}` and `filledUpTo` values updated throughout
- **EcoleReveal step 7** — continue CTA replaced: instead of `router.push('/paywall')`, calls `submitOnboarding(state)` first:
  - loading state: CTA shows inline spinner, is disabled during the fetch
  - on response `redirect_to_diagnostic: true` → `router.push('/diagnostic')`
  - on response `waitlist: true` → `router.push('/waitlist')`
  - on network / 4xx error → inline error message below the CTA: "Une erreur est survenue. Réessayez." with a retry button
- **`/waitlist` stub page** — `app/waitlist/page.tsx`: renders a centered card "Vous êtes sur la liste d'attente — nous vous contacterons dès l'ouverture de votre parcours." with a "Retour à l'accueil" link to `/`; no shell (public-facing, not behind `(app)` layout)
- `OnboardingFlow.tsx` — update `total={7}`, add step 6 `BackgroundStep` component, update `OnboardingState` type to include the four new fields; update all `filledUpTo` calculations
- Optional BE fields `q4_motivation`, `q5_strongest_skill`, `q6_weakest_skill`, `q8_topics_tested_on` — omit from the submit payload in V1 (all are `Optional` / default-empty in the BE schema); document omission in a comment on the payload builder

**Out (deferred, do not add):**
- Fully dynamic question rendering via `GET /onboarding/questions` (fetch is called and its copy is used to hydrate question option labels at runtime; the step components themselves remain statically structured — a full "render questions from API shape" re-architecture is a future dedicated entry)
- Optional questions Q4 (motivation), Q5 (strongest skill), Q6 (weakest skill), Q8 (topics tested on) — steps not added in this entry; fields will be null/omitted in the submit payload
- Capacity warning display (the response may return `capacity_warning: { weeks_to_exam, hours_per_week_selected, recommended_minimum_hours }`; it is received but not surfaced to the user in this entry)
- Re-onboarding flow (user who re-submits onboarding hits the same endpoint; enrollment is upserted on the BE; FE treats the response identically)
- L'École gating updates triggered by the `above_a2` flag (ECole gating is a future BE entry)
- Landing-page persona targeting based on onboarding responses

#### Acceptance (Given/When/Then)
1. **Given** a signed-in user has completed steps 1–5 of the onboarding flow, **When** they reach step 6, **Then** four single-select card questions render in order (hours/week, native language, prior exam history, feedback mode) with EN/FR copy driven by `fetchOnboardingQuestions()` and the `ProgressDots` show `filledUpTo=5 total=7`.
2. **Given** the user has selected answers for all four step-6 questions, **When** they press continue, **Then** the flow advances to step 7 (EcoleReveal) and the CTA button is enabled.
3. **Given** step 7 (EcoleReveal) rendered, **When** the user presses the continue CTA, **Then** the button shows an inline spinner + is disabled while `POST /onboarding/submit` is in-flight.
4. **Given** the submit response returns `{ redirect_to_diagnostic: true }`, **When** the response is received, **Then** the router navigates to `/diagnostic`.
5. **Given** the submit response returns `{ waitlist: true }`, **When** the response is received, **Then** the router navigates to `/waitlist` which renders the waitlist card without the `(app)` shell.
6. **Given** `POST /onboarding/submit` returns a 4xx or network error, **When** the error is caught, **Then** an inline error message "Une erreur est survenue. Réessayez." appears below the CTA and the button re-enables for retry.

#### Tests
- `tests/unit/onboarding/BackgroundStep.test.tsx` (vitest) — new: renders 4 question groups in order; continue button disabled until all 4 answered; back button renders; correct option values are passed to `onContinue`
- `tests/unit/onboarding/EcoleReveal.test.tsx` (vitest) — update: CTA click calls `submitOnboarding` mock; shows spinner during inflight; on `redirect_to_diagnostic: true` calls `router.push('/diagnostic')`; on `waitlist: true` calls `router.push('/waitlist')`; on error shows error text + re-enables button
- `tests/unit/api/onboarding.test.ts` (vitest) — new: `fetchOnboardingQuestions` makes GET to correct path; `submitOnboarding` makes POST with correct schema shape; q1_current_level mapping A2_B1 → b1 verified; q3_no_exam_scheduled true when "no exam" variant selected
- `tests/e2e/onboarding-flow.spec.ts` (Playwright) — update: complete all 7 steps; mock `POST /onboarding/submit` to return `redirect_to_diagnostic: true`; confirm navigation to `/diagnostic`; mock waitlist response; confirm navigation to `/waitlist`; step 6 four questions all required before advancing

#### Files Touched
- `lib/api/onboarding.ts` — new
- `components/onboarding/BackgroundStep.tsx` — new step 6 component
- `components/onboarding/OnboardingFlow.tsx` — add step 6, update total + filledUpTo, update EcoleReveal continue handler, update `OnboardingState` type
- `components/onboarding/EcoleReveal.tsx` — replace `router.push('/paywall')` with `submitOnboarding` call + navigation logic
- `components/onboarding/TCFGoalSelect.tsx` — normalize option values to BE enum slugs
- `components/onboarding/CurrentLevelSelect.tsx` — normalize option values + update `CurrentLevel` type export
- `components/onboarding/TargetScoreSelect.tsx` — normalize option values + update `TargetScore` type export
- `components/onboarding/ExamDateSelect.tsx` — ensure no-exam path sets `q3_no_exam_scheduled=true`
- `app/waitlist/page.tsx` — new stub
- `tests/unit/onboarding/BackgroundStep.test.tsx` — new
- `tests/unit/onboarding/EcoleReveal.test.tsx` — update
- `tests/unit/api/onboarding.test.ts` — new
- `tests/e2e/onboarding-flow.spec.ts` — update

#### Dependencies
- BE-001 Shipped (auth + session; submit endpoint requires authenticated user)
- BE-002 Shipped (user profile endpoint exists; onboarding answers persist to User model fields confirmed in backend schema)

#### Notes
- **Schema gap is the core work**: the FE option values (`A1_A2`, `TCF_CANADA`, etc.) were designed before the BE contract was locked. The schema reconciliation (normalize option values + type exports) is as important as the API call itself. Updating the `CurrentLevel`, `TargetScore`, `TargetExam` type exports ensures downstream code (any component reading `OnboardingState`) stays type-safe without manual casts.
- **Step 6 question copy**: `fetchOnboardingQuestions()` returns the canonical FR/EN option labels for all 11 questions. Step 6 should use these labels (indexed by `id` matching `q7_hours_per_week`, `q9_native_language`, etc.) so the step's displayed copy is always in sync with what the backend defines. Cache the response in a `useState` at the `OnboardingFlow` level on mount.
- **`q3_no_exam_scheduled` XOR validation**: the BE validates that exactly one of `q3_exam_date` or `q3_no_exam_scheduled=true` is set; sending both is a 422. The FE must guarantee the XOR before submitting — add an `assert`-style guard in the payload builder.
- **`q4–q6, q8` omission**: these optional fields default to `null` / empty list on the BE when absent. Explicitly omit them from the payload (don't send `undefined` — JSON serialization may vary) rather than sending nulls; let the BE defaults apply cleanly.
- **Navigation change**: the previous `EcoleReveal` → `/paywall` path is replaced by the dynamic redirect. The `/paywall` route and `Paywall.tsx` component are unchanged — they are reached via the Stripe checkout flow (BE-007), not from onboarding.
- **`/waitlist` is not behind `(app)` auth**: the user may hit the waitlist immediately after submitting onboarding, before ever paying. Keep it a standalone public page.

---

### BE-007 — Stripe checkout + subscription wiring

**Status:** Not Started
**Branch:** `feat/be-007-stripe-checkout` (FE, from `main`)
**Effort:** 1 session (~3–4h)

#### Scope
**In:**
- `pnpm add @stripe/stripe-js` — Stripe.js library for client-side Checkout redirect
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` env var required; `STRIPE_WEBHOOK_SECRET` already required by the BE (`app/services/webhooks.py`); add both to `.env.local` documentation in the PR
- `lib/api/stripe.ts` — typed helpers:
  - `createCheckoutSession(tierId: PricingTier): Promise<{ url: string }>` — calls `POST /api/stripe/checkout-session` (to be created by P-106 on the BE; this entry creates the FE caller and documents the required endpoint shape)
  - `fetchSubscriptionStatus(): Promise<{ subscription_tier: string; subscription_status: string | null }>` — calls `GET /api/users/me` (exists on the BE user router) and extracts the `subscription_tier` + `subscription_status` fields from the User model
- `components/Paywall.tsx` — wire each "Choisir ce forfait" CTA to call `createCheckoutSession(tier)`:
  - on success: `window.location.href = url` to redirect to Stripe-hosted Checkout page
  - loading state: the clicked tier card's CTA shows inline spinner + is disabled; other tier CTAs remain enabled
  - on error (network / BE not ready): inline error below the clicked CTA: "Impossible d'accéder au paiement. Réessayez."
  - `PricingTier` type: `"a_la_carte" | "daily_bundle" | "exam_bundle" | "pro" | "sprint"` — maps each of the 5 pricing cards to a slug the BE checkout endpoint can resolve to a Stripe Price ID
- **Success page** `app/paywall/success/page.tsx` — rendered when Stripe redirects to `?success=true`; displays "Paiement confirmé. Votre abonnement est en cours d'activation." + animated checkmark; polls `fetchSubscriptionStatus()` every 3 seconds up to 30 seconds until `subscription_status !== null`; on confirmation navigates to `/dashboard`; after 30s timeout shows "Votre abonnement sera activé sous peu — vérifiez votre tableau de bord." + "Aller au tableau de bord" link
- **Cancel page** `app/paywall/cancel/page.tsx` — rendered when Stripe redirects to `?canceled=true`; displays "Paiement annulé." + "Retour aux forfaits" link to `/paywall`; no polling
- **Subscription status badge** on the `Paywall.tsx` header area: fetch `fetchSubscriptionStatus()` on mount; if `subscription_tier !== "free"`, show a "Forfait actif : <tier_label>" chip near the page heading; if free, show nothing (preserve the existing CTA state)
- Stripe webhook route is already live on the BE (`POST /api/stripe/webhook`, `stripe_webhook.py`) — it verifies the signature and logs; no FE change needed for the webhook itself; note in the PR that P-106 adds DB-write dispatch to this handler

**Out (deferred, do not add):**
- `POST /api/stripe/checkout-session` endpoint on the BE (P-106 work; this entry creates the FE caller and documents the required shape: `POST body { tier_slug: string }, response: { url: string }`)
- Real subscription activation / entitlement gate (pending P-106 webhook dispatch + DB writes on the BE)
- Subscription management page (cancel, upgrade, billing portal — LGL-XXX after Atlas + EIN)
- Payment method updates, invoices, receipt emails (LGL-XXX)
- Free tier or trial flow (memory lock: no free tier at V1)
- Currency switcher (USD only at launch)
- Coupon / promo code redemption (defer)
- Per-route subscription gate (Middleware check that `subscription_tier !== "free"` — defer until P-106 activates real entitlements)

#### Acceptance (Given/When/Then)
1. **Given** a visitor on `/paywall`, **When** they click the "Daily Bundle" CTA, **Then** the button shows an inline spinner + is disabled; `createCheckoutSession("daily_bundle")` is called with the correct slug; on a 200 response `window.location.href` is set to the returned `url`.
2. **Given** `createCheckoutSession` returns a network error, **When** the promise rejects, **Then** an inline error message appears below the clicked CTA and the button re-enables for retry.
3. **Given** Stripe redirects the user to `GET /paywall/success`, **When** the page renders, **Then** the "Paiement confirmé" message and an animated checkmark are visible; `fetchSubscriptionStatus()` is called every 3 seconds; when it returns `subscription_status !== null`, the router navigates to `/dashboard`.
4. **Given** the polling runs for 30 seconds without a non-null `subscription_status`, **When** the timeout fires, **Then** the success page shows "Votre abonnement sera activé sous peu" + a "Aller au tableau de bord" link and polling stops.
5. **Given** Stripe redirects to `GET /paywall/cancel`, **When** the page renders, **Then** "Paiement annulé." and a "Retour aux forfaits" link to `/paywall` are visible.
6. **Given** a user whose `subscription_tier` is not `"free"`, **When** `/paywall` renders, **Then** a "Forfait actif" chip appears near the page heading.

#### Tests
- `tests/unit/paywall/Paywall.test.tsx` (vitest) — update: each CTA click calls `createCheckoutSession` mock with correct tier slug; loading state applied to clicked CTA; on error shows error text; active subscription badge renders when tier is not "free"
- `tests/unit/paywall/PaywallSuccess.test.tsx` (vitest) — new: renders confirmation message; polling mock calls `fetchSubscriptionStatus`; on `subscription_status !== null` calls `router.push('/dashboard')`; after 30s timeout shows fallback message and link; `vi.useFakeTimers()` for polling + timeout
- `tests/unit/paywall/PaywallCancel.test.tsx` (vitest) — new: renders "Paiement annulé" + "Retour aux forfaits" link to `/paywall`
- `tests/unit/api/stripe.test.ts` (vitest) — new: `createCheckoutSession` POST to correct path with tier slug; `fetchSubscriptionStatus` extracts `subscription_tier` + `subscription_status` from user response
- `tests/e2e/paywall-checkout.spec.ts` (Playwright) — new: load `/paywall`; click Daily Bundle; confirm spinner visible; mock checkout URL redirect; visit success page; mock subscription status polling resolves; lands on `/dashboard`; visit cancel page; "Retour aux forfaits" navigates to `/paywall`

#### Files Touched
- `lib/api/stripe.ts` — new
- `components/Paywall.tsx` — wire CTA buttons, loading state, error display, subscription badge
- `app/paywall/success/page.tsx` — new
- `app/paywall/cancel/page.tsx` — new
- `tests/unit/paywall/Paywall.test.tsx` — update
- `tests/unit/paywall/PaywallSuccess.test.tsx` — new
- `tests/unit/paywall/PaywallCancel.test.tsx` — new
- `tests/unit/api/stripe.test.ts` — new
- `tests/e2e/paywall-checkout.spec.ts` — new

#### Dependencies
- BE-001 Shipped (auth — checkout session requires authenticated user on the BE; `fetchSubscriptionStatus` reads the authenticated user's record)
- BE-006 Shipped recommended (onboarding flow navigates to `/diagnostic`; the old `/paywall` redirect from step 6 is removed; `/paywall` is now reached directly from landing CTA or explicit navigation)

#### Notes
- **`POST /api/stripe/checkout-session` BE contract**: this endpoint is not yet implemented (P-106). The FE caller in `createCheckoutSession()` documents the expected shape: `POST body { tier_slug: string }`, response `{ url: string }`. Until P-106 ships, this call will 404. The session gate in Paywall should handle the 404 gracefully (shows the error message) — beta cohort is on free trial and doesn't need Stripe until B-100 (Stripe Atlas LLC) completes.
- **Stripe.js vs backend redirect**: we use `createCheckoutSession` → BE creates a Stripe `checkout.session` and returns the hosted URL → FE does `window.location.href = url`. This approach keeps Stripe credentials server-side and avoids exposing Price IDs in FE code. Do NOT use `stripe.redirectToCheckout` with hardcoded Price IDs in the FE bundle.
- **Polling interval on success page**: 3-second interval, 30-second total cap. `clearInterval` on unmount. `vi.useFakeTimers()` in tests. The polling is a UX affordance — most Stripe webhooks fire within 2–5s of checkout completion in production.
- **B-100 sequencing**: Stripe Atlas LLC formation + EIN + Mercury bank account are Section 6 work (LGL-001 to LGL-008). This FE entry wires the UI now so no FE work blocks B-100's completion. When P-106 lands on the BE, the FE is already deployed and functional.

---

### BE-008 — Recording upload + two-step transcription flow

**Status:** Not Started
**Branch:** `feat/be-008-recording-upload` (FE, from `main`)
**Effort:** 1 session (~4–5h)

**Two-step flow (F-002):** the BE implements a correction loop: `POST /api/recordings/transcribe` (step 1 — STT only, no AI analysis) → user reviews transcript in UI → `POST /api/recordings/{id}/confirm-transcript` (step 2 — triggers Claude analysis). This replaces the placeholder recording UI and is the core diagnostic interaction for Tâche 3 (monologue mode). Tâche 1 and Tâche 2 use the conversation API (BE-010).

#### Scope
**In:**
- `pnpm add react-media-recorder` or implement raw `MediaRecorder` API via a custom hook — whichever is more testable; do NOT use any library that bundles its own audio processing beyond capture + encode to WebM/opus
- `lib/hooks/useRecorder.ts` — custom hook encapsulating `MediaRecorder` + `getUserMedia` lifecycle:
  - States: `Idle | RequestingPermission | Ready | Recording | Stopped | Uploading | Error`
  - Exposes: `start()`, `stop()`, `reset()`, `audioBlob: Blob | null`, `durationSeconds: number`, `error: string | null`
  - Permission pre-flight: on `start()` call, checks `navigator.permissions.query({ name: 'microphone' })`; on `denied` state returns the `RequestingPermission` state and surfaces the error without calling `getUserMedia`
  - Respects `prefers-reduced-motion` for any visual waveform state (no animation code in the hook; that's the component's responsibility)
- `lib/api/recordings.ts` — typed fetch helpers (sole import point for components):
  - `transcribeRecording(formData: FormData): Promise<TranscribeResponse>` — calls `POST /api/recordings/transcribe` (multipart); `TranscribeResponse: { id, transcript, words: WordToken[], low_conf_count, low_conf_ratio, trigger_re_record, stt_confidence, total_words, context }` where `WordToken: { i, text, conf, low, suggestion?: string }`
  - `confirmTranscript(recordingId: number, req: ConfirmTranscriptRequest): Promise<RecordingResult>` — calls `POST /api/recordings/{id}/confirm-transcript`; `ConfirmTranscriptRequest: { corrected_transcript: string; ui_language: string; exam_profile: string }`; `RecordingResult` is the full recording response shape including `diagnostic` block (see Notes for shape)
  - `fetchTache3Topics(uiLanguage?: string): Promise<Tache3TopicResponse>` — calls `GET /api/recordings/tache3-topics`; used by Tâche 3 topic picker
- **`RecordingPlaceholder.tsx` → `RecordingCapture.tsx`** — new component (replaces `RecordingPlaceholder.tsx` which remains but is only rendered when `tache_mode` is not yet wired or as a visual fallback on unsupported browsers):
  - Uses `useRecorder` hook for state
  - `Idle` state: large circular mic button ("Appuyez pour commencer") with the existing visual treatment from `RecordingPlaceholder`
  - `RequestingPermission` state: shows "Accès au microphone requis" message with a `<a href="#">` guide link (placeholder — AI-XXX adds real browser guidance)
  - `Recording` state: mic button red, timer running, waveform animation (the existing decorative CSS ripples from MOCK-010 are driven from local state, not real amplitude), "Appuyez pour arrêter" label
  - `Stopped` state: "Enregistrement terminé." status + "Recommencer" (→ `reset()`) + "Soumettre la réponse" primary CTA (→ triggers upload)
  - `Uploading` state: spinner + "Transcription en cours…" — CTA disabled
  - `Error` state: error message + "Réessayer" button
- **Transcript review UI** (`TranscriptReview.tsx`) — shown after `POST /api/recordings/transcribe` returns:
  - Displays the raw transcript text in an editable `<textarea>` or rich inline editor with word-level confidence highlights:
    - `low: true` words rendered with `--fp-butter` background highlight (warm-caution, not alarming)
    - `suggestion` field (Claude Haiku suggestions for low-confidence words) shown as an inline tooltip on hover or a tap-reveal on mobile
  - `trigger_re_record: true` path: if the STT confidence ratio is above threshold, show "La qualité audio était insuffisante — réenregistrez votre réponse." + "Réenregistrer" button (→ `reset()` hook); no transcript to review in this state
  - "Confirmer et analyser" primary CTA — calls `confirmTranscript()` with the (possibly edited) transcript text; loading state on CTA; on success calls `onAnalysisComplete(recordingId)`
  - "Modifier la transcription" affordance: a toggle that switches the transcript display from read-only (confidence-highlighted) to an editable textarea; default is read-only with highlights visible
- **`TacheShell.tsx` integration** — `RecordingCapture` replaces `RecordingPlaceholder` for Tâche 3 (`tache_mode="tache_3"`); Tâche 1 and Tâche 2 continue to render `RecordingPlaceholder` until BE-010 wires the conversation flow:
  - Pass `tache_mode` from the page's `fetchTache(n)` result to `TacheShell`; `tache_mode` maps: tâche_id=1 → `"tache_1"`, tâche_id=2 → `"tache_2"`, tâche_id=3 → `"tache_3"`
  - For Tâche 3: show `RecordingCapture`; after analysis completes, navigate to `/diagnostic/results?recordingId=<id>`
  - `topic_id` selection: for Tâche 3, add a topic picker above the recording UI using `fetchTache3Topics()`; shows a dropdown or card list of available topics; user must select a topic before recording is enabled; `topic_id` passed as a form field in the multipart upload
  - `target_level`, `ui_language`, `exam_profile` (defaults: `"B2"`, `"en"`, `"tcf_canada"`) read from user session via `useSession()` (BE-001 pattern); passed as form fields
- **`/diagnostic/results` route update** — replace the static placeholder values with a query param: `app/(app)/diagnostic/results/page.tsx` accepts `?recordingId=<id>` and calls `fetchRecording(recordingId)` (from `lib/api/recordings.ts`, to be added in BE-009) to populate the page; if `recordingId` is absent or the fetch fails, renders the existing static placeholder as a fallback (graceful degradation)

**Out (deferred, do not add):**
- Tâche 1 and Tâche 2 real recording via `RecordingCapture` — those tâche modes use the conversation API (BE-010), not the single-shot upload flow
- `POST /api/recordings/upload` (legacy one-shot path) — the two-step flow (`/transcribe` → `/confirm-transcript`) is the target implementation; the one-shot endpoint exists and could serve as a fallback but is not wired in this entry
- Real waveform driven by audio amplitude (Web Audio API + `AnalyserNode`) — the decorative CSS animation from MOCK-010 is preserved as-is; real amplitude waveform is AI-XXX scope
- Detected modules panel (`GET /api/recordings/{id}/detected-modules`) — wired in BE-009
- Full results page data (5-couche scores, per-tâche feedback, exam_profile block) — wired in BE-009
- Playback of candidate's own recording — there is no public audio URL for candidate recordings in the current BE; this requires a pre-signed URL endpoint (future entry; the "Réécouter" button in results remains visual-only)
- Re-take limits / diagnostic quota enforcement (the BE already applies `diagnostic_quota_required`; the FE should handle 429 with "Quota journalier atteint — réessayez demain." but no counter display in this entry)
- Writing mode recordings (`tache_mode="writing"` — rejected by `/api/recordings` endpoints; handled by `/api/writing`)

#### Acceptance (Given/When/Then)
1. **Given** Tâche 3 shell loaded (`/diagnostic/tache/3`), **When** the user clicks the mic button for the first time, **Then** `getUserMedia` is called; if permission is granted, the button transitions to Recording state with a running timer and the waveform ripple animation activates.
2. **Given** the recorder is in Recording state, **When** the user presses stop, **Then** the state transitions to Stopped; "Soumettre la réponse" CTA is enabled and "Recommencer" link is visible.
3. **Given** the user presses "Soumettre la réponse", **When** `POST /api/recordings/transcribe` completes, **Then** the `TranscriptReview` component renders with the transcript text; low-confidence words are highlighted in `--fp-butter`; words with suggestions show a tooltip affordance.
4. **Given** `trigger_re_record: true` in the transcribe response, **When** the review UI renders, **Then** the transcript is not shown; instead "La qualité audio était insuffisante — réenregistrez votre réponse." is displayed with a "Réenregistrer" button.
5. **Given** the user has confirmed the transcript (optionally edited), **When** "Confirmer et analyser" is clicked, **Then** `POST /api/recordings/{id}/confirm-transcript` is called with the (possibly modified) transcript; on 200 the router navigates to `/diagnostic/results?recordingId=<id>`.
6. **Given** the user's microphone permission is `denied`, **When** start() is called, **Then** `getUserMedia` is not invoked and the `RequestingPermission` error state renders with "Accès au microphone requis."
7. **Given** mobile <768px on Tâche 3, **When** the recording UI renders, **Then** the mic button is ≥88×88px, "Soumettre la réponse" is full-width, and `TranscriptReview` is single-column with full-width textarea.

#### Tests
- `tests/unit/hooks/useRecorder.test.ts` (vitest) — new: mock `navigator.mediaDevices.getUserMedia` and `MediaRecorder`; test Idle→Recording→Stopped transition; test `error` state when getUserMedia rejects; test `durationSeconds` increments during recording; test reset() returns to Idle
- `tests/unit/diagnostic/RecordingCapture.test.tsx` (vitest) — new: Idle state renders mic button; Recording state shows running timer + waveform; Stopped state enables "Soumettre la réponse"; component does NOT import `RecordingPlaceholder`; `MediaRecorder` / `getUserMedia` are mocked
- `tests/unit/diagnostic/TranscriptReview.test.tsx` (vitest) — new: renders transcript text; low-confidence words have highlight class; `trigger_re_record=true` hides transcript and shows re-record message; "Confirmer et analyser" calls `confirmTranscript` mock with edited text; loading state during inflight
- `tests/unit/api/recordings.test.ts` (vitest) — new: `transcribeRecording` POST to correct path with FormData; `confirmTranscript` POST to `/{id}/confirm-transcript`; `fetchTache3Topics` GET to correct path
- `tests/e2e/diagnostic-tache3-recording.spec.ts` (Playwright) — new: load `/diagnostic/tache/3`; mock `getUserMedia`; click mic → Recording state; click stop → Stopped state; click "Soumettre" → mock transcribe response → `TranscriptReview` renders; click "Confirmer" → mock confirmTranscript → navigates to `/diagnostic/results?recordingId=42`; test `trigger_re_record` path shows re-record message

#### Files Touched
- `lib/hooks/useRecorder.ts` — new
- `lib/api/recordings.ts` — new (partial: `transcribeRecording`, `confirmTranscript`, `fetchTache3Topics`; `fetchRecording` and `fetchHistory` added in BE-009)
- `components/diagnostic/RecordingCapture.tsx` — new
- `components/diagnostic/TranscriptReview.tsx` — new
- `components/diagnostic/TacheShell.tsx` — update: swap `RecordingPlaceholder` for `RecordingCapture` on tâche_3; add topic picker; wire `onAnalysisComplete` callback to navigate with `recordingId`
- `app/(app)/diagnostic/tache/[n]/page.tsx` — update: pass `tache_mode` derived from tâche id to `TacheShell`; keep `RecordingPlaceholder` for tâche 1+2 until BE-010
- `app/(app)/diagnostic/results/page.tsx` — update: accept `recordingId` query param; call `fetchRecording` from `lib/api/recordings` when present; fall back to static placeholders when absent
- `tests/unit/hooks/useRecorder.test.ts` — new
- `tests/unit/diagnostic/RecordingCapture.test.tsx` — new
- `tests/unit/diagnostic/TranscriptReview.test.tsx` — new
- `tests/unit/api/recordings.test.ts` — new
- `tests/e2e/diagnostic-tache3-recording.spec.ts` — new

#### Dependencies
- BE-001 Shipped (auth session needed; `tache_mode` + `target_level` read from session user profile)
- BE-005 Shipped (`TacheShell` consumes tâche data including tâche id → tache_mode mapping)

#### Notes
- **`tache_mode` mapping**: the FE tâche id (1, 2, 3 from `lib/api/taches.ts`) maps to BE `tache_mode` values: `1 → "tache_1"`, `2 → "tache_2"`, `3 → "tache_3"`. The BE rejects `tache_mode="writing"` on `/api/recordings` — never send it from this flow.
- **MediaRecorder codec**: prefer `audio/webm;codecs=opus` (Chrome/Firefox). Safari records in `audio/mp4` (AAC). The BE's STT service (AssemblyAI) accepts both. Test on Safari separately — `MediaRecorder.isTypeSupported("audio/webm;codecs=opus")` returns false on Safari; the hook should fall back to `audio/mp4` or `video/mp4`.
- **`useRecorder` and SSR**: `MediaRecorder` and `navigator.mediaDevices` don't exist in Node.js. Guard all calls behind `typeof window !== "undefined"` checks; the hook must not execute its setup code during server-side rendering or vitest jsdom without explicit mocking.
- **Two-step vs one-shot**: this entry wires the two-step flow exclusively. The one-shot `POST /api/recordings/upload` endpoint is not wired here. If the Transcript Review step proves confusing in beta, BE-XXX can add a "skip review" path that calls `confirmTranscript` immediately with the original transcript — but that decision belongs to a later entry.
- **`target_level` default**: use `user.target_level` from the session profile (stored after onboarding submit, BE-006). If absent (user hasn't completed onboarding), default to `"B2"`. Do not prompt the user inline — the default is acceptable for beta.
- **Quota 429 handling**: the BE applies a diagnostic quota (`diagnostic_quota_required`). If the user has exceeded their daily limit, `POST /api/recordings/transcribe` returns 429. The `RecordingCapture` or `TacheShell` must handle 429 with "Quota journalier atteint — réessayez demain." in the Error state. No quota counter display in this entry.

---

### BE-009 — Recording history + results wiring

**Status:** Not Started
**Branch:** `feat/be-009-recording-history` (FE, from `main`)
**Effort:** 1 session (~3–4h)

#### Scope
**In:**
- **`lib/api/recordings.ts` additions** (extends the file started in BE-008):
  - `fetchRecording(id: number): Promise<RecordingResult>` — calls `GET /api/recordings/{id}`; returns full recording response including `diagnostic` block (see Notes for complete shape)
  - `fetchRecordingHistory(): Promise<HistoryEntry[]>` — calls `GET /api/recordings/history`; returns `HistoryEntry[]` with `{ id, status, target_level, word_count, duration_seconds, created_at, transcript_preview, topic, theme, note_globale?, couches?: CoucheScore[], score_prononciation?, goulet_nom?, overall_score?, cefr_level?, clb_level? }`
  - `fetchRecordingList(limit?: number): Promise<RecordingListEntry[]>` — calls `GET /api/recordings?limit=<n>`; lean shape `{ id, tache_mode, created_at, cefr_level, clb_level, couches }` for the dashboard widget
  - `CoucheScore` type: `{ key: string; display_label_en: string; display_label_fr: string; score: number }` — matches the `couches_array()` output from the BE
- **`/diagnostic/results` page wiring** — `app/(app)/diagnostic/results/page.tsx` updated (continues from the BE-008 `recordingId` param change):
  - When `recordingId` present: call `fetchRecording(recordingId)`; wire all 5 surfaces:
    1. **Results header**: `note_globale` as the overall score display; `exam_profile.cefr_level` as the CEFR level string; `exam_profile.clb_level` as the CLB sub-label; replace the static "C1" placeholder and date stamp with real values
    2. **CouchesBreakdown**: replace static placeholder bars with `diagnostic.couches` array; each entry has `key`, `display_label_en`/`fr`, and `score` (0–5 scale) — map score to a percentage `(score / 5) * 100` for the bar width; use `display_label_fr` as the couche row label (already in `CEFR_PASTEL_MAP` logic from MOCK-011)
    3. **TacheSummary**: replace static placeholder feedback with `diagnostic.ce_qui_marche` (what works) and `diagnostic.next_step` (next step); the three "tâche" rows in TacheSummary are currently uniform — for the single-recording results page, collapse them to a single "Votre réponse" row with `ce_qui_marche` as content
    4. **RecommendationsStub**: replace static CTAs with `diagnostic.next_step` text in the first recommendation row; the other 2 rows keep their static content until AI-XXX generates real recommendations
    5. **`le_goulet` spotlight block** — new panel between CouchesBreakdown and TacheSummary: shows `diagnostic.le_goulet.nom` as the heading ("Votre goulet d'étranglement : <nom>") and `diagnostic.le_goulet.explication` as the body text; only rendered when `le_goulet.nom` is non-empty; styled as an `--ed-paper` card with a 3px `--fp-lavender` left accent (decorative chip per F-200)
- **Dashboard widgets wiring** (`app/(app)/dashboard/page.tsx`):
  - `DiagnosticScoreWidget` — calls `fetchRecordingList(1)` (the single most-recent recording); replaces the static "C1" placeholder with `cefr_level` from the response; replaces "il y a 7 jours" with a formatted relative date derived from `created_at`
  - `RecentActivityWidget` — calls `fetchRecordingHistory()` (limit 5); replaces the static 5-row fixture with real recording history rows; each row: `topic || tache_mode` as the label, formatted `created_at` as the relative time, category badge (tâche → `diagnostic`, lesson → `lesson`, vocab → `vocab` — all recordings from this route are `diagnostic`)
  - Both widgets show `.ed-skeleton` loading rows (4 rows, same height as data rows) while fetching; graceful empty state if history is empty ("Pas encore d'activité — commencez votre premier diagnostic.")
- **Detected modules panel** (`RecordingModules.tsx` — new optional panel in results page):
  - Calls `GET /api/recordings/{id}/detected-modules`; response: `{ primary_module, secondary_modules, detections }`
  - `primary_module` shape: `{ id, name_fr, name_en, category, severity, L1_interference_description_en, examples: [{wrong_utterance, corrected_utterance, explanation_fr}] }`
  - Renders only when `primary_module !== null`; placed below the `le_goulet` panel in the results layout
  - Shows: module name (`name_en`), 1-sentence `L1_interference_description_en`, the first `examples` entry with `wrong_utterance` → `corrected_utterance`
  - Secondary modules: if `secondary_modules.length > 0`, shows a collapsed "Autres points détectés" section with module names only (expand-on-click is optional UX; collapsed by default)
  - Loading state: `.ed-skeleton` placeholder; hide entirely if fetch returns 404 (recording predates detection) or if `primary_module === null`

**Out (deferred, do not add):**
- Full per-tâche turn-by-turn feedback for conversation recordings (the `conversation` field in `_format_recording` contains turn history; rendering it requires a separate "conversation replay" panel — defer to BE-010 follow-up)
- Candidate audio playback / "Réécouter" button activation — there is no public `audio_url` for candidate recordings in the current BE; the "Réécouter" affordance remains `cursor: not-allowed` + `opacity: 0.5` as wired in MOCK-011
- Examiner audio playback on the results page — examiner audio URLs (`/tts_audio/`) are on `ConversationTurn` rows, not on the Recording row; accessed via conversation fetch in BE-010
- Full `feedback_grid` 2x2 breakdown display (the grid has `what_works`, `what_doesnt_work`, `english_habits`, `structure_quality` keys; rendering this 4-quadrant panel is a dedicated future entry)
- `tache_rubric` pedagogical rubric panel (BE F-083 data; future entry)
- `patterns_detectes` / `patterns_manquants` / `corrections` lists (future entry — these require dedicated UI surfaces)
- Recharts radar/bar chart on the results or dashboard (CSS bars only)
- Full recording list page (`/diagnostic/history` or `/recordings`) — no new route added in this entry; the dashboard widget is the only history surface

#### Acceptance (Given/When/Then)
1. **Given** `/diagnostic/results?recordingId=42` loaded with a real recording response, **When** the page renders, **Then** the results header shows the real `cefr_level` string (e.g. "B2") and the date from `created_at` formatted in French long format; the static "C1" placeholder is absent.
2. **Given** the results page with `diagnostic.couches` data, **When** `CouchesBreakdown` renders, **Then** each of the 4 couche bars (Le Fond, Les Moules des Idées, Les Moules, Les Réflexes Anglais) has its width proportional to `(score / 5) * 100%`; the `display_label_fr` is shown as the row label.
3. **Given** `diagnostic.le_goulet.nom` is non-empty, **When** the results page renders, **Then** a `le_goulet` spotlight panel is visible between `CouchesBreakdown` and `TacheSummary` showing the nom as heading and explication as body.
4. **Given** `GET /api/recordings/{id}/detected-modules` returns a `primary_module`, **When** the results page renders, **Then** the `RecordingModules` panel is visible with the module's `name_en`, `L1_interference_description_en`, and first example `wrong_utterance → corrected_utterance`; if `primary_module` is null the panel is absent.
5. **Given** `/dashboard` loaded, **When** `DiagnosticScoreWidget` renders, **Then** it displays the `cefr_level` from the most-recent recording (not the static "C1") and a relative date from `created_at`.
6. **Given** `fetchRecordingHistory()` returns an empty array, **When** `RecentActivityWidget` renders, **Then** the "Pas encore d'activité — commencez votre premier diagnostic." empty state is shown; no 5-row skeleton or placeholder data.
7. **Given** widgets are fetching, **When** the network request is in-flight, **Then** `.ed-skeleton` loading rows are visible in both `DiagnosticScoreWidget` and `RecentActivityWidget`.

#### Tests
- `tests/unit/diagnostic/Results.test.tsx` (vitest) — update: mock `fetchRecording(42)` with full response; assert header shows `cefr_level` "B2"; assert `CouchesBreakdown` bar widths match `score/5*100`; assert `le_goulet` panel renders when non-empty; assert `le_goulet` panel absent when `nom` is empty string
- `tests/unit/diagnostic/RecordingModules.test.tsx` (vitest) — new: renders primary module `name_en` + description + first example; absent when `primary_module === null`; collapsed secondary modules section visible when `secondary_modules.length > 0`
- `tests/unit/dashboard/DiagnosticScoreWidget.test.tsx` (vitest) — update: mock `fetchRecordingList(1)`; assert `cefr_level` rendered; assert skeleton visible during loading; assert empty-state text when array is empty
- `tests/unit/dashboard/RecentActivityWidget.test.tsx` (vitest) — update: mock `fetchRecordingHistory()` with 5 rows; assert 5 rows render with topic/tache_mode as label; assert empty-state text when empty; assert skeleton during loading
- `tests/unit/api/recordings.test.ts` (vitest) — update: `fetchRecording` GET to correct path; `fetchRecordingHistory` GET to `/history`; `fetchRecordingList` GET to `?limit=1`
- `tests/e2e/diagnostic-results.spec.ts` (Playwright) — update: load with `?recordingId=42`; mock `GET /api/recordings/42` + `GET /api/recordings/42/detected-modules`; assert CEFR header renders; assert couche bars have non-zero widths; assert le_goulet panel visible; assert modules panel visible
- `tests/e2e/dashboard.spec.ts` (Playwright) — update: mock `fetchRecordingList` + `fetchRecordingHistory`; assert `DiagnosticScoreWidget` shows real cefr_level; assert `RecentActivityWidget` shows real rows

#### Files Touched
- `lib/api/recordings.ts` — update: add `fetchRecording`, `fetchRecordingHistory`, `fetchRecordingList`; add `RecordingResult`, `HistoryEntry`, `RecordingListEntry`, `CoucheScore` TypeScript types
- `app/(app)/diagnostic/results/page.tsx` — update: wire `recordingId` param to `fetchRecording`; add `le_goulet` spotlight panel
- `components/diagnostic/CouchesBreakdown.tsx` — update: accept `couches: CoucheScore[]` prop instead of static values; derive bar widths from `(score/5)*100`
- `components/diagnostic/Results.tsx` — update: pass `recordingId`-sourced data to sub-components; wire header score/CEFR/date
- `components/diagnostic/TacheSummary.tsx` — update: accept `ceQuiMarche` and `nextStep` props; show single row in single-recording mode
- `components/diagnostic/RecordingModules.tsx` — new
- `app/(app)/dashboard/page.tsx` — update: add `fetchRecordingList(1)` + `fetchRecordingHistory()` Server Component fetches; pass to `DiagnosticScoreWidget` + `RecentActivityWidget`
- `components/dashboard/DiagnosticScoreWidget.tsx` — update: accept `cefr_level` + `createdAt` props; show skeleton during null props
- `components/dashboard/RecentActivityWidget.tsx` — update: accept `activities: HistoryEntry[]` prop; render real rows or empty state
- `tests/unit/diagnostic/Results.test.tsx` — update
- `tests/unit/diagnostic/RecordingModules.test.tsx` — new
- `tests/unit/dashboard/DiagnosticScoreWidget.test.tsx` — update
- `tests/unit/dashboard/RecentActivityWidget.test.tsx` — update
- `tests/unit/api/recordings.test.ts` — update
- `tests/e2e/diagnostic-results.spec.ts` — update
- `tests/e2e/dashboard.spec.ts` — update

#### Dependencies
- BE-001 Shipped (auth — all recording endpoints require authenticated user)
- BE-005 Shipped (tâche data API wired; results page already has `TacheShell` + `Results` component tree)
- BE-008 Shipped (recording upload creates the `recordingId` that this entry consumes; `lib/api/recordings.ts` file exists and is extended here)

#### Notes
- **`CoucheScore` shape**: the BE `couches_array()` function returns `[{ key, display_label_en, display_label_fr, score }]` for the 4 main couches (Le Fond, Les Moules des Idées, Les Moules, Les Réflexes Anglais). `score` is on a 0–5 scale. Map to bar width: `(score / 5) * 100`. `display_label_fr` is the canonical French label — use it consistently in `CouchesBreakdown` so the labels never diverge from the BE's couche taxonomy.
- **`le_goulet` panel**: this is a key pedagogical signal from the BE — it identifies the single "bottleneck" couche blocking the user's progress. The panel should feel premium and diagnostic: a single couche name + one explanatory sentence. Never show it when `nom` is empty string or null (legacy recordings may have empty `le_goulet`).
- **Modules panel placement**: place `RecordingModules` below the `le_goulet` spotlight and above `TacheSummary`. It is conditionally rendered (absent when `primary_module === null`) so the layout should not leave a visible gap. Use a `min-h-0` / no min-height pattern on the container.
- **`fetchRecording` response key reference**: the full `_format_recording` response has `diagnostic.couches`, `diagnostic.le_goulet`, `diagnostic.ce_qui_marche`, `diagnostic.next_step`, `exam_profile.cefr_level`, `exam_profile.clb_level`, `exam_profile.overall_score`. Write a TypeScript interface `RecordingResult` that covers all consumed fields; mark unconsumed fields as `unknown` to prevent over-typing.
- **Dashboard Server Component pattern**: `app/(app)/dashboard/page.tsx` is already a Server Component (converted in BE-002). Add `fetchRecordingList(1)` and `fetchRecordingHistory()` as parallel `Promise.all` calls at the top of the component. Both calls require the auth token — pass the session from `auth()` as an Authorization header in the fetch helpers (same pattern established by BE-002 for `fetchMe()`).

---

### BE-010 — Conversation turn flow (Tâche 1 + Tâche 2)

**Status:** Not Started
**Branch:** `feat/be-010-conversation-flow` (FE, from `main`)
**Effort:** 1 session (~5–6h)

**Architecture:** Tâche 1 (Échange d'informations) and Tâche 2 (Échange d'opinions) are multi-turn dialogues, not monologue recordings. The BE has a full conversation engine: the examiner generates text + TTS audio per turn; the candidate submits audio; the FE plays the examiner turn and records the candidate turn. This entry replaces the static `RecordingPlaceholder` for tâche_1 and tâche_2 with a real conversation loop.

#### Scope
**In:**
- `lib/api/conversations.ts` — typed fetch helpers (sole import point):
  - `fetchScenarios(uiLanguage?: string): Promise<ScenariosResponse>` — calls `GET /api/conversations/scenarios`; returns `{ scenarios: Scenario[], gates: { above_a2: bool } }` where `Scenario: { id, code, title_fr, title_en, candidate_brief_fr, candidate_brief_en, register, difficulty, data_targets }`
  - `startConversation(req: StartConversationRequest): Promise<StartConversationResponse>` — calls `POST /api/conversations/start`; `StartConversationRequest: { tache_mode: "tache_1" | "tache_2", topic_id?: number, scenario_code?: string, target_level: string, ui_language: string, exam_profile: string }`; `StartConversationResponse: { conversation_id, examiner_turn_text, examiner_turn_audio_url, turn_number, conversation_status, tache_mode, max_candidate_turns, min_candidate_turns?, max_candidate_turns_hard?, scenario? }`
  - `submitTurn(conversationId: string, formData: FormData): Promise<TurnResponse>` — calls `POST /api/conversations/{id}/turn` (multipart); `TurnResponse: { candidate_transcript, candidate_turn_number, examiner_turn_text, examiner_turn_audio_url, examiner_turn_number, conversation_status, recording_id?, auto_ended, wrap_up_hint }`
  - `supersedeTurn(conversationId: string, turnNumber: number): Promise<SupersedeResponse>` — calls `POST /api/conversations/{id}/turn/{n}/supersede` for the re-record flow
  - `endConversation(conversationId: string): Promise<EndConversationResponse>` — calls `POST /api/conversations/{id}/end`; returns `{ conversation_status, recording_id, under_min_turns }`
  - `fetchConversation(conversationId: string): Promise<ConversationState>` — calls `GET /api/conversations/{id}`; used for page-refresh resume
- **Tâche 2 scenario picker** — new component `Tache2ScenarioPicker.tsx` shown on the `/diagnostic/tache/2` pre-screen before the conversation starts:
  - Calls `fetchScenarios(uiLanguage)` on mount; shows a list of scenario cards (`title_en`, `register`, `difficulty` badge, `candidate_brief_en` as a 2-line teaser)
  - Single-select; "Commencer avec ce scénario" CTA; passes `scenario_code` to `startConversation`
  - `register` badge uses `--fp-lavender` (formel) or `--fp-sky` (informel) chip — decorative layer per F-200
- **`ConversationShell.tsx` — new component** (replaces `RecordingPlaceholder` for tâche_1 and tâche_2):
  - Client component; owns the full conversation state machine:
    - `Idle` → user presses "Commencer la conversation" → `POST /api/conversations/start` → `ExaminerTurn`
    - `ExaminerTurn` → display examiner text; if `examiner_turn_audio_url` present, auto-play the examiner audio via `<audio>` element + a "Rejouer" button; after audio ends (or after 3s auto-advance for text-only) → `CandidateRecording`
    - `CandidateRecording` → `useRecorder` hook (reused from BE-008); mic button active; "Arrêter et envoyer" CTA → `Transcribing`
    - `Transcribing` → `POST /api/conversations/{id}/turn` (multipart audio); show "Transcription en cours…" skeleton; on response → if `auto_ended: true` → `Completed`; if `examiner_turn_text` present → `ExaminerTurn` with the next turn; if `wrap_up_hint: true` → show a subtle "Vous approchez de la fin — commencez à conclure." banner
    - `Completed` → navigate to `/diagnostic/results?recordingId=<id>` (same pattern as BE-008)
    - `EndButton` always visible (except Completed): "Terminer la conversation" → `POST /api/conversations/{id}/end`; on `under_min_turns: true` → show inline warning "Votre réponse était courte — les résultats seront partiels." + confirm before navigating
  - **Re-record flow** (F-062.3): in `CandidateRecording` state, after stopping recording, before sending, show a "Réécouter votre prise" toggle (plays the local blob via `URL.createObjectURL`) and a "Refaire cette prise" button; if "Refaire" pressed → call `supersedeTurn(conversationId, candidateTurnNumber)` then reset recorder to `CandidateRecording` state; the previously sent turn is marked superseded on the BE
  - **Turn counter**: "Tour <n> sur <max>" label derived from `candidate_turns_count` local state and `max_candidate_turns` from start response
  - **Timer integration**: reuse `Timer.tsx` from the tâche shell; start timer when `CandidateRecording` state begins; pause when in `ExaminerTurn`; the timer is advisory (does not auto-submit, consistent with the existing timer behavior)
  - **Page-refresh resume**: on mount, if `conversationId` is in `sessionStorage`, call `fetchConversation(conversationId)` and restore state; if conversation status is `completed`, navigate immediately to results
- **`TacheShell.tsx` update** — for tâche_1 and tâche_2: show `ConversationShell` instead of `RecordingPlaceholder`; for tâche_2 show `Tache2ScenarioPicker` as a pre-step before `ConversationShell` starts; `tache_1` skips the picker (examiner opens with a random greeting, no scenario selection)
- **Examiner audio autoplay**: `<audio autoPlay ref={audioRef} src={examiner_turn_audio_url} />` with a `onEnded` handler that advances to `CandidateRecording` state; URLs are `/tts_audio/<hash>.mp3` — public paths served by the FastAPI backend; mobile browsers may block autoplay — provide a "Lecture" play button as fallback; `muted={false}` is required for the examiner voice to audibly play

**Out (deferred, do not add):**
- Tâche 3 conversation (Tâche 3 is a monologue; it uses the single-shot recording flow from BE-008, not the conversation API)
- Live waveform driven by real audio amplitude for the examiner audio (the existing decorative waveform from MOCK-010 is fine)
- Conversation history / replay on the results page (`conversation.turns` field is returned in `fetchRecording` response; rendering the full turn-by-turn replay is a dedicated future entry)
- Text-only mode for the examiner turn (BE returns `examiner_turn_text` even when `examiner_turn_audio_url` is null; the UI falls back to text display automatically — no separate "text mode" toggle needed)
- Tâche 2 scenario difficulty gating UI (BE gates by `above_a2` L'École flag; the FE can show all scenarios from `fetchScenarios()` but the BE will 403 if a locked scenario_code is used; in this entry, don't show locked scenarios — filter `scenarios` to only show `difficulty === "A2_B1"` unless `gates.above_a2` is true)
- Writing pipeline (`tache_mode="writing"` — handled by `/api/writing`, not conversations)
- Real-time streaming of examiner text via SSE (the current BE returns complete text per turn; streaming is future scope)

#### Acceptance (Given/When/Then)
1. **Given** `/diagnostic/tache/1` loaded, **When** the user presses "Commencer la conversation", **Then** `POST /api/conversations/start` is called with `tache_mode: "tache_1"`; the examiner's opening text and TTS audio URL are received; the examiner text is displayed and the audio auto-plays; the turn counter shows "Tour 1 sur <max>".
2. **Given** the examiner audio has ended (or 3s auto-advance for text-only), **When** the `CandidateRecording` state activates, **Then** the mic button is enabled; the `Timer` starts counting; the `ConversationShell` renders "À vous — enregistrez votre réponse." status text.
3. **Given** the candidate has recorded and pressed "Arrêter et envoyer", **When** `POST /api/conversations/{id}/turn` returns with `auto_ended: false`, **Then** the `Transcribing` skeleton is shown briefly; the next examiner turn text + audio loads and auto-plays; the turn counter increments.
4. **Given** the candidate's last turn triggers `auto_ended: true` in the turn response, **When** the response is received, **Then** the router navigates to `/diagnostic/results?recordingId=<id>` (returned as `recording_id`).
5. **Given** the user presses "Terminer la conversation" with fewer than `min_candidate_turns` turns, **When** the `POST /api/conversations/{id}/end` response has `under_min_turns: true`, **Then** a warning "Votre réponse était courte — les résultats seront partiels." is shown with a confirm CTA; confirming navigates to `/diagnostic/results?recordingId=<id>`.
6. **Given** `/diagnostic/tache/2` loaded, **When** the `Tache2ScenarioPicker` renders, **Then** only scenarios matching the user's `above_a2` gate are shown; selecting a scenario and pressing "Commencer" calls `POST /api/conversations/start` with `tache_mode: "tache_2"` and the selected `scenario_code`.
7. **Given** the candidate pressed "Refaire cette prise" after recording, **When** the re-record flow fires, **Then** `POST /api/conversations/{id}/turn/{n}/supersede` is called; the recorder resets to `CandidateRecording` state; the previous turn's audio blob is released.
8. **Given** mobile <768px on Tâche 1, **When** the conversation is in `CandidateRecording` state, **Then** the mic button is ≥88×88px, the "Terminer" button is visible without scrolling, and the timer is full-width above the mic button.

#### Tests
- `tests/unit/diagnostic/ConversationShell.test.tsx` (vitest) — new: Idle → start → ExaminerTurn → CandidateRecording → Transcribing → ExaminerTurn cycle (mocked hooks + API); `auto_ended: true` triggers navigation; `under_min_turns: true` shows warning; re-record `supersedeTurn` called on "Refaire"; `audioRef` play() called when `examiner_turn_audio_url` present
- `tests/unit/diagnostic/Tache2ScenarioPicker.test.tsx` (vitest) — new: renders scenarios from mock `fetchScenarios`; CTA disabled until selection; `above_a2: false` filters to A2_B1 only; CTA calls `onScenarioSelected` with `scenario_code`
- `tests/unit/api/conversations.test.ts` (vitest) — new: each helper function calls the correct path with correct method + body; `submitTurn` builds FormData with audio + duration_seconds; `endConversation` calls `/{id}/end`
- `tests/unit/diagnostic/TacheShell.test.tsx` (vitest) — update: tâche_1 renders `ConversationShell` instead of `RecordingPlaceholder`; tâche_3 renders `RecordingCapture` (from BE-008); tâche_2 renders `Tache2ScenarioPicker` then `ConversationShell` after selection
- `tests/e2e/diagnostic-conversation.spec.ts` (Playwright) — new: load `/diagnostic/tache/1`; mock `POST /api/conversations/start`; click "Commencer"; mock examiner turn; assert examiner text visible; mock `POST .../turn`; assert turn counter increments; mock auto_ended response; assert navigation to `/diagnostic/results?recordingId=99`; test mobile viewport mic button ≥88px; test Tâche 2 scenario picker loads and selects scenario

#### Files Touched
- `lib/api/conversations.ts` — new
- `components/diagnostic/ConversationShell.tsx` — new
- `components/diagnostic/Tache2ScenarioPicker.tsx` — new
- `components/diagnostic/TacheShell.tsx` — update: swap `RecordingPlaceholder` for `ConversationShell` on tâche_1 and tâche_2; add `Tache2ScenarioPicker` pre-step for tâche_2
- `app/(app)/diagnostic/tache/[n]/page.tsx` — update: pass tâche_mode derived from id to TacheShell (same change as BE-008 for tâche_3; extend here for tâche_1/2)
- `tests/unit/diagnostic/ConversationShell.test.tsx` — new
- `tests/unit/diagnostic/Tache2ScenarioPicker.test.tsx` — new
- `tests/unit/api/conversations.test.ts` — new
- `tests/unit/diagnostic/TacheShell.test.tsx` — update
- `tests/e2e/diagnostic-conversation.spec.ts` — new

#### Dependencies
- BE-001 Shipped (auth — all conversation endpoints require authenticated user)
- BE-005 Shipped (tâche data API; TacheShell reads `tache_mode` from tâche fixture → conversation mode dispatch)
- BE-008 Shipped (`useRecorder` hook reused here; same MediaRecorder lifecycle; `RecordingCapture` and `ConversationShell` share the hook but render differently)
- BE-009 Shipped recommended (`/diagnostic/results?recordingId=<id>` must be wired to show real scores; otherwise after conversation ends the results page shows static placeholders)

#### Notes
- **Examiner audio autoplay and mobile policy**: mobile Safari and Chrome block autoplay of non-muted audio unless triggered by a user gesture. The "Commencer la conversation" button IS a user gesture — after its handler calls `startConversation` and receives `examiner_turn_audio_url`, calling `audioRef.current.play()` inside the same event handler's microtask should satisfy the gesture requirement. Verify in Playwright mobile emulation with `--enable-features=AutoplayPolicy`. If autoplay fails, the fallback "Lecture" button must be the first thing visible so the user is not blocked.
- **`sessionStorage` resume**: store `conversationId` in `sessionStorage` after `startConversation` returns; clear it on navigate to results or on reset. On mount, read it and call `fetchConversation(conversationId)` to resume. This handles browser-tab refreshes mid-conversation without losing progress. Do not use `localStorage` (persistence across tabs would cause a stale conversation to appear in a fresh session).
- **T1 vs T2 differences**:
  - Tâche 1: examiner opens (first turn is examiner); `max_candidate_turns` + `min_candidate_turns` in start response; auto-ends when `candidate_count >= max`
  - Tâche 2: candidate opens (first turn is candidate); `max_candidate_turns_hard` + `max_candidate_turns_hint`; `wrap_up_hint: true` after `hint` turns; scenario required; no `min_candidate_turns`
  - The `ConversationShell` state machine must handle both without branching the component — use the `tache_mode` prop to configure turn order and cap values.
- **`wrap_up_hint` UX**: render as a non-intrusive banner below the turn counter: "Commencez à conclure votre réponse." — `--fp-butter` background chip, dismissible via × button. Once shown, stays visible even if `wrap_up_hint` is false in subsequent turns.
- **F-062.3 re-record detail**: `supersedeTurn` marks the candidate's turn + the immediately-following examiner turn as superseded. The FE must also visually remove the stale examiner turn from the conversation display and regenerate it (the next `submitTurn` call after a re-record will produce a fresh examiner response contextually aware of the new candidate transcript).

---

### F-405 — Dialogue mold component

**Status:** Partial (Dialogue only; 6 remaining molds are Round 2+)
**Commit:** feat(iles): Dialogue mold + /ile tracer bullet (sample data, MDX wired)
**Effort:** 1 session

**Scope:** `'use client'` Dialogue component at `components/iles/molds/Dialogue.tsx`. Props: `audio` (string), `transcript` (Turn[]), `comprehensionChecks` (ComprehensionCheck[]). Renders: styled HTML5 audio player, collapsible transcript, instant per-question feedback in local React state. DESIGN.md v2 tokens throughout (no sharp corners, no italic, no em-dash, Atelier Francais palette). MDX configured via `@next/mdx` in `next.config.mjs`; `mdx-components.tsx` at repo root per Next.js App Router spec; `@mdx-js/loader` + `@mdx-js/react` installed as peer deps.

**Remaining molds (Round 2+):** L'Acte de Parole, Le Chunk, La Regle, Le Son, L'Activite (4 sub-types), La Tache.

---

### F-406 — /ile/[theme] page — full syllabus view (localStorage interim)

**Status:** Shipped
**Commit:** TBD (post-squash)
**Effort:** 2 sessions (tracer bullet in F-405 session; completed here)

**Scope:** Route renamed `[id]` → `[theme]`. Server page at `app/(app)/ile/[theme]/page.tsx` thin-wraps client `components/iles/IleShell.tsx`. IleShell reads `current_level` from localStorage (default `b1`), dynamically imports `content/iles/${theme}/${level}.mdx`, renders full mold sequence. Hero image via `next/image` with `onError` fallback (placeholder letter). Île header: display_title, level badge, duration chip, "En cours" progress chip (localStorage-persisted start timestamp). Bientôt state when (theme, level) MDX is absent. Le Maître close kept as disabled seam (opacity 0.45, same pattern as Tâche). Sub-routes `activites/` and `tache/` updated to `theme` param.

**BE seams committed in code:**
- `current_level` from localStorage (migrate to F-410 target_profile in Round 2)
- Per-île progress via `ile_started_${theme}_${level}` localStorage key (migrate to F-417 user_progress in Round 2)
- Le Maître intro/close audio deferred to F-417

**Filed follow-up:** migrate `current_level` + `ile_started_*` localStorage keys to F-410 / F-417 BE endpoints (Round 2).

---

### F-437 — Route cleanup: /method doublon (7), diagnostic home (8), Cabinet Grotesk (9)

**Status:** Shipped (10a7d6e)
**Commit:** 10a7d6e (3 commits: eab2c65, 09ff301, 10a7d6e)
**Effort:** 1 session

**Scope:**

**(7) /method doublon retired.**
- `/method` → `/la-methode` 308 redirect added to `next.config.mjs`.
- `Hero.tsx` + `MethodologyPreview.tsx` CTA `href` updated to `/la-methode`.
- `app/(app)/la-methode/page.tsx` moved to `app/la-methode/page.tsx` (public, no ProtectedRoute). Leçon cards render pre-login; `/la-methode/[id]` lesson detail stays gated via the `(app)` group layout. `app/method/page.tsx` stub deleted.
- TopNav `/maitre` nav entry removed (Le Maître has no URL per locked decision).

**(8) Diagnostic consolidated at /l-examen/diagnostic.**
- `app/(app)/l-examen/diagnostic/results/page.tsx` and `tache/[n]/page.tsx` created (moved from `app/(app)/maitre/diagnostic/`).
- `app/(app)/l-examen/diagnostic/page.tsx` (R1 band-aid, now live) promoted to real route.
- `beforeFiles` rewrite (`/l-examen/diagnostic/* → /maitre/diagnostic/*`) deleted from `next.config.mjs`.
- `app/(app)/maitre/` directory deleted entirely.
- `/maitre/diagnostic → /l-examen/diagnostic` backward-compat redirect preserved.
- `Activite.tsx` bientôt copy updated to remove stale `/maitre` URL.

**(9) Cabinet Grotesk reference removed.**
- Cabinet Grotesk was already absent from all code files before this entry.
- `CLAUDE.md` Fonts section updated to document the M2 t11 stack accurately.

**Tests:** Unit 433/433 + e2e 0 fails (pending confirm). `landing-hero.spec.ts`, `landing-methodology.spec.ts`, `Hero.test.tsx`, `MethodologyPreview.test.tsx` updated to assert `/la-methode`.

**Non-visual change note:** Diagnostic route move is backend-side file routing only; existing e2e diagnostic specs already asserted `/l-examen/diagnostic` paths through the former rewrite.

---

### F-439 — Progress endpoint FE wiring (replaces F-431 localStorage interim)

**Status:** Shipped (9f261ec)
**Commits:** 472eb83, 9f261ec
**Branch:** `main` (executed inline per brief)
**Effort:** 1 session

**Context:** BE F-438 shipped `GET /api/users/me/progress` and `PATCH /api/users/me/progress`. This entry wires the FE half: replaces the F-431 localStorage interim (`current_level` key + per-île completion writes) with real DB calls, with a public-visitor fallback (no token → default `b1`, no request fired).

**Scope:**
- `lib/types.ts`: `UserProgress` interface (camelCase FE view of the progress shape).
- `lib/api.ts`: `RawUserProgress` raw interface + `mapUserProgress` mapper + `api.users.getProgress()` + `api.users.patchProgress(body)`.
- `components/iles/IleShell.tsx`: token guard → `api.users.getProgress()` replaces `localStorage.getItem('current_level')`. Unauthenticated visitors default to `b1` with no request.
- `components/seance/SeancePlayer.tsx`: same token-guard pattern for `current_level`. On séance completion: authenticated → `api.users.patchProgress({ last_couche_signals: { [ile]: { level, completed_at } } })` (fire-and-forget); unauthenticated → localStorage fallback preserved.
- `tests/helpers/auth-e2e.ts`: specific mock for `/api/users/me/progress` registered after the catch-all (Playwright last-registered-wins). Returns correct shape so level-dependent UI assertions don't silently pass on fallback.
- `tests/unit/users/UserProgressApiClient.test.ts`: 16 unit tests covering GET mapper fields + PATCH body + response mapping.

**F-431 localStorage interim consumers removed for authenticated users:**
1. `IleShell.tsx:38` — `localStorage.getItem('current_level')` → `api.users.getProgress()`
2. `SeancePlayer.tsx:148` — `localStorage.getItem('current_level')` → `api.users.getProgress()`
3. `SeancePlayer.tsx:193` — `localStorage.setItem('seance_completed_*')` → `api.users.patchProgress()`

**Kept (not F-431 interim):**
- `localStorage.getItem('current_ile')` in SeancePlayer — navigation hint, not progress data.
- `localStorage.setItem('ile_started_*')` in IleShell — local start-timestamp UI hint.
- `app/bienvenue/page.tsx` `lm.targetProfile.v1` key — pre-auth /bienvenue visitor stub, intentionally kept.

**Public-visitor guarantee:** `/la-methode` and any route that renders IleShell or SeancePlayer without a token defaults to `b1` with zero API requests fired. No 401 possible on public surfaces.

**Dashboard widgets:** `StreakWidget` and `DailyTargetWidget` wired to `/progress` fields in F-440 (fast-follow, shipped 8068d03).

---

### F-440 — Wire dashboard widgets to /progress endpoint

**Status:** Shipped (8068d03)
**Branch:** `main` (executed inline per brief)
**Effort:** 1 session

**Context:** Fast-follow after F-439. Dashboard fetches `GET /api/users/me/progress` once at the container level and distributes to widgets. Eliminates the recordings-derived streak computation and the hardcoded daily-target placeholder.

**Scope:**
- `components/dashboard/Dashboard.tsx`: converted to `'use client'`; fetches `api.users.getProgress()` once in a `useEffect`; passes `progress` + `progressError` props to StreakWidget and DailyTargetWidget; exposes `handlePatchTarget` callback.
- `components/dashboard/StreakWidget.tsx`: removed `api.recordings.list()` + client-side streak computation; now reads `progress.streakDays` from props. Loading skeleton and error fallback preserved.
- `components/dashboard/DailyTargetWidget.tsx`: removed hardcoded `1` placeholder; reads `progress.dailyTargetMinutes`; adds inline "Modifier" edit control that PATCHes `{ daily_target_minutes }` via `api.users.patchProgress`. No "today vs target" bar (production_minutes_total is cumulative; today-minutes awaits activity-calendar endpoint).
- **Stubbed + flagged:** `CalendarWidget` remains on `api.recordings.list()` — flagged for dedicated BE `/api/users/me/activity-calendar` endpoint (next follow-up). Recommendations widget is a separate entry.
- `tests/unit/dashboard/Dashboard.test.tsx`: added `api.users` mock; updated daily-target assertion to expect `30` (from mocked `daily_target_minutes`).
- `tests/unit/dashboard/StreakWidget.test.tsx`: new — 7 cases covering loading/error/ok states and plural labels.
- `tests/unit/dashboard/DailyTargetWidget.test.tsx`: new — 9 cases covering loading/error/ok, edit mode open/close/save, cancel without patch, and sub-minimum guard.
- `tests/e2e/dashboard.spec.ts`: added explicit progress mock to `setupDashboardRoutes`; updated daily-target assertion to `'30'`; added edit-button e2e test.

**Acceptance:** build green · unit 466/466 · e2e 113 passed, 3 skipped, 0 failed.

**Non-visual change note:** widget data source change only; layout and styling are identical.

---

### F-441 -- TopNav + SITEMAP rebuild to locked IA

**Status:** Shipped (9dca1bf)
**Branch:** `feat/f-441-topnav-sitemap-ia`
**Effort:** 1 session

**Context:** The TopNav had French/internal labels (Séance, Méthode, Oral, Écrit, Progrès) and only rendered for authenticated users. F-441 rebuilds it to the locked product IA with English benefit labels visible to all visitors on product routes.

**Scope:**
- `components/nav/TopNav.tsx`: rebuilt to locked IA. Nav items: Vocabulary (/la-methode), Exams (dropdown: TCF live, DELF bientôt, French for Business bientôt), Library (/la-bibliotheque), Real French (bientôt chip), AI Tutor (bientôt chip), Coaching (/coaching). Right side: unauthenticated shows Pricing/Log in/Start Free; authenticated keeps ThemeToggle + avatar dropdown. Language toggle removed from nav. Added `hydrate()` call on mount so nav renders on (shell) routes (e.g. /la-methode) that don't pass through ProtectedRoute.
- `SITEMAP.md`: rebuilt at FE root to match F-441 IA. Previous content was stale (wrong route names, old architecture). New doc reflects actual live routes, TopNav IA table, auth-conditional right side, and bientôt surfaces.
- `BACKLOG.md`: F-441 entry added.
- `tests/e2e/f-441.spec.ts`: 28 cases covering nav labels, Exams dropdown (open, children, bientôt chips, close), bientôt chips, auth-conditional right side, mobile hidden behavior.
- `tests/screenshots/f-441-la-methode-{1440,375}.png`: F-225 captures.
- `tests/traces/f-441.zip`: Playwright trace for desktop nav test.

**Acceptance:** build green · unit 466/466 · e2e 735 passed (with retries), 1 pre-existing flake (landing-hero mobile scroll), 0 F-441 failures.

### F-450 — Hotfix: broken nav targets (live 404s)

**Status:** Committed (local, pending push) — commit 1 `c47e880`, commit 2 (this entry)
**Branch:** `main` (hotfix, direct)
**Effort:** 1 session (2 commits)

**Context:** Stage-0 orphan audit (`docs/audits/ORPHAN_AUDIT.md`, Table 3) surfaced four hard-broken nav targets resolving to live 404s on prod. Same bug class: links/redirects pointing at routes that were never built. Bundled under one ticket, fixed before a single Vercel deploy.

**Scope (commit 1, `c47e880`):**
- `next.config.mjs`: `/exam-prep` redirect repointed `/tcf-canada` (never built; MS-1) → `/examens/tcf` (the real, built TCF Canada landing). `:path*` variant collapsed to the bare target (no sub-routes under `/examens/tcf`).
- `app/coaching/page.tsx`: bientôt placeholder (existing `<Bientot>` pattern, F-359) so TopNav + Sidebar `/coaching` links resolve. Real Cal.com embed is a separate scoped build.
- `app/placement/page.tsx`: bientôt placeholder for the Hero CTA target. Hero CTA left intact.

**Scope (commit 2):**
- `components/landing/PlatformLanding.tsx` (×2: `href`, `seeMoreHref`) + `components/landing/LandingFooter.tsx` (EN branch of locale ternary): three direct `/tcf-canada` hrefs repointed to `/examens/tcf`. FR branches unchanged (`/fr`, pending `/fr/tcf-canada` at MS-1).
- `docs/prd-v1.md`: this entry.
- `tests/screenshots/f-450-{coaching,placement}-{1440,375}.png`: F-225 captures for the two new visible surfaces.

**Verification:** `pnpm build` exit 0 (both runs). Tree-wide grep confirms zero remaining live `/tcf-canada` references — only comments (MS-1 `/fr/tcf-canada` deferral notes) remain.

**Deferred (out of scope):** building `/tcf-canada` proper and the `/fr/tcf-canada` French landing (both MS-1). `/exam-prep` and the landing links now route to the canonical `/examens/tcf` until MS-1 reinstates a dedicated marketing page.

### F-451 — Signup reroute: make the real intent capture reachable

**Status:** Committed (local, pending push) — commit `8916bb0`
**Branch:** `main` (hotfix, direct)
**Effort:** 1 session

**Context:** Post-signup `SignupForm` redirected to `/onboarding` — the dismissible product tour (the `OnboardingFlow` state machine → `/paywall`). The real learner-intent capture lives at `/bienvenue` (F-365: the four-question Target Profile — exam, threshold, deadline, persona — persisted to `lm.targetProfile.v1`). New users were never routed through intent capture; the signal that personalises the parcours was being silently skipped.

**Verify findings (both routes read before change):**
- `/bienvenue` (`app/bienvenue/page.tsx`): the Target Profile capture. Four questions across three steps. Post-capture pushes `/tableau-de-bord` (already correctly wired — no dead-end). Guarded by `ProtectedRoute` (authed; redirects unauth to `/inscription`).
- `/onboarding` (`app/onboarding/page.tsx` → `OnboardingFlow`): the optional product tour. Left intact, only decoupled from the signup redirect.

**Scope:**
- `components/auth/SignupForm.tsx`: post-submit redirect `/onboarding` → `/bienvenue`.
- `tests/unit/signup/SignupForm.test.tsx`: redirect assertion + test name updated to `/bienvenue`.
- `tests/e2e/signup-flow.spec.ts` (×2): both URL assertions updated to `/bienvenue`.
- `docs/prd-v1.md`: this entry.

**Verification:** `pnpm build` exit 0. `SignupForm.test.tsx` 16/16 pass. `/onboarding` left in place as the optional tour. **F-225 captures: skipped — no visible surface changed** (signup form, `/bienvenue`, and `/onboarding` are all visually unchanged; the change is a redirect target, behaviourally covered by the updated e2e URL assertions).

**Deferred (out of scope):** BE persistence of the Target Profile (`lm.targetProfile.v1` → server-side `target_profiles`, F-366). `/onboarding` tour content unchanged.

### F-452 — Dead-route cleanup (final Stage-0 item)

**Status:** Committed (local, pending push) — commit (this entry)
**Branch:** `main` (Stage-0, direct)
**Effort:** 1 session

**Context:** Final Stage-0 orphan-audit item (`docs/audits/ORPHAN_AUDIT.md`). Four superseded route families removed without breaking inbound equity: every removal either already sat behind a 308 or got one added first.

**Verify-first table (confirmed before any removal):**

| Route | 308 existed? | Inbound | Sitemap | Path taken |
| --- | --- | --- | --- | --- |
| `/cours/methode-tcf-canada` + `/[id]` | Yes (`next.config.mjs:63-64`, `:path*` covers `[id]`) | none (shadowed dead code) | no | Removed page files only; redirect preserved |
| `/la-methode/lesson/[id]` + `/quiz` | No | self cross-links only; 0 live nav links (live scheme is `/la-methode/lecon-N`) | no | No 1:1 id map + zero inbound → **removed cleanly**, no redirect |
| `/legal/privacy` | No | none (empty `<main />` stub) | no | Added 308 → `/confidentialite`, then removed |
| `/legal/tos` | No | none (empty `<main />` stub) | no | Added 308 → `/cgv`, then removed |

**`/legal/tos` target choice:** both legal stubs were empty (`<main />`), so no content distinguished them. ToS (Terms of Service = the service-contract terms) maps to **CGV**, not Mentions légales (publisher-identity disclosure). The pre-existing `/terms`→`/mentions-legales` redirect (`next.config.mjs:76`) was left untouched (out of scope).

**Scope:**
- `next.config.mjs`: +2 308 rules (`/legal/tos`→`/cgv`, `/legal/privacy`→`/confidentialite`).
- Removed: `app/(app)/cours/` (methode-tcf-canada + `[id]`), `app/la-methode/lesson/` (`[id]` + `quiz`, incl. `LessonDetailClient`/`QuizClient`), `app/legal/` (privacy + tos). 8 files.
- `docs/prd-v1.md`: this entry.

**Verification:** full unit suite (vitest) — see gate report. `pnpm build` exit 0. **F-225 captures: skipped — non-visual change** (dead-route removals add no visible surface; the two new redirects resolve to already-shipped `/cgv` and `/confidentialite`).

**Deferred (out of scope):** descriptive references to the removed routes in dated audit docs (`docs/m0-fe-audit-*.md`, `docs/audits/ORPHAN_AUDIT.md`) and the `tests/e2e/m0-audit.spec.ts` route list (a point-in-time descriptive audit, no hard per-route assertion — left as historical snapshot). `Sidebar.test.tsx:92` keeps its `/la-methode/lesson/3` mock (tests prefix-match string logic; passes regardless of route existence).

### F-453 — v3 logged-in shell plumbing (app top bar + dashboard rewire)

**Status:** Committed (local, pending push) — commit (this entry)
**Branch:** `main`
**Effort:** 1 session

**Context:** First plumbing pass on the v3 logged-in shell. Structure, elements, and behavior only — frosted/blur, shadow elevation, and motion are deferred to **F-454**. Built on existing design tokens (`--accent`, `--bg-elevated`, `--bg-canvas`, `--rule-default`, `--text-*`), rounded corners, Inter (`SANS_FONT`); no new hex tokens introduced (token re-point to the v3 palette stays with the DESIGN.md v3 surface re-execution, F-449).

**App top bar (`components/layout/AppTopBar.tsx`, new):** lives in the content column (full-width on mobile carrying the hamburger; shifted to `left:240px` right of the sidebar on desktop). Replaces the prior mobile-only `<header class="app-shell-topbar">` in `AppShell`.
- **Search field** — left/center, rounded pill, `disabled`/inert, subtle placeholder. **Placed only.**
- **Notifications bell** — right cluster, desktop-only, `aria-disabled` + `tabIndex -1`, no badge/dropdown. **Placed only.**
- **Dark-mode toggle** — the existing `ThemeToggle` **moved** out of the sidebar into the top-bar right cluster; **functional**.
- **User dropdown** (`components/layout/UserMenu.tsx`, new) — trigger = deterministic colored avatar (name-hashed hue + first initial) + first name; menu = header (first name + email), Paramètres → `/parametres`, Abonnement → `/abonnement`, divider, Se déconnecter. Outside-click + Escape close. **Functional/wired.** De-orphans `/parametres` and `/abonnement` (previously unreachable from nav).

**Dashboard (`components/dashboard/Dashboard.tsx`):**
- **Heatmap `CalendarWidget` removed** from the surface. Component file + its unit test kept **parked** (not deleted). The **F-443 BE endpoint is untouched** (deployed, parked). The obsolete `tests/e2e/f-444.spec.ts` (asserted the widget on `/dashboard`) was removed.
- **`Commencer la séance`** (`components/dashboard/CommencerSeance.tsx`, new) — primary accent CTA at the top, **gated via the F-359 bientôt pattern** (`<Bientot level="surface">`): visible, accent-styled, honestly not-yet-active (dimmed, pointer-events off). **No fixture deep-link** (séance surface stays `bientot`).

**Shell adjustments:** sidebar `lg:!top-16` reservation removed (sidebar now `top:0` full height; its wordmark/avatar header fills the top-left corner). `.app-shell-main` top padding moved to CSS (72px mobile / 88px desktop) to clear the now-fixed top bar.

**Placed vs wired vs gated:** Placed/inert — search, notifications bell. Wired/functional — theme toggle, user dropdown (avatar, header, both nav targets, signout). Gated (bientôt) — Commencer la séance CTA.

**Verification:** full unit suite (vitest) **506/506 passed** (53 files); `pnpm build` exit 0. **F-225 captures (visible surface change):** `f-453-tableau-de-bord-{1440,375}.png` (top bar + heatmap-free dashboard), `f-453-user-menu-{1440,375}.png` (dropdown open), `f-453-parametres-{1440,375}.png` (de-orphan proof); trace `tests/traces/f-453.zip`. Capture spec `tests/e2e/f-453.spec.ts` (green serially; two assertions flake under parallel dev-server on-demand compilation — CI runs a prod build). E2E repointed: `f-446.spec.ts` (theme toggle now in top bar; `.app-shell-topbar` → `.app-topbar`), `dashboard.spec.ts` (calendar grid assertion → gated CTA).

**Deferred to F-454:** frosted/blur treatment, shadow elevation, motion/micro-interactions. The sidebar's own `Se déconnecter` row is left in place (second affordance) pending the F-454 polish pass.

### F-454 — v3 palette foundation (global token repoint, light + dark) + F-349 hex-sweep completion

**Status:** Committed (local, pending push) — commit (this entry)
**Branch:** `main`
**Effort:** 1 session (foundation ticket, deliberately larger than recent micro-tickets)

**Context:** Repoints every canonical color token in `app/globals.css` to the DESIGN.md v3 palette (both `:root` light and `.dark`), so the whole app renders v3 in both modes with zero v2 islands, then finishes the F-349 hex sweep by routing the deferred hardcoded component hexes through those tokens. No surface re-layout — colors only.

**ID note (naming collision):** F-453 punted its frosted/blur, shadow-elevation, and motion shell polish "to F-454." That polish is **not** this entry — this F-454 is the palette/token foundation. The shell-polish slice is re-designated as a **follow-up ticket** (see flags below); it was not executed here.

**Token variables repointed (app/globals.css):**
- **Surfaces:** added new `--canvas` (#F3F4F6 / #0A0C0E) as a distinct recessed page bg; `--paper` (surface) #FFFFFF / #1C1F22; `--paper-tint` folds to surface; `--paper-edge` (muted/subtle chip) #F3F4F6 / #2A2D31. `--bg-canvas`, `--background`, `--lm-bg-base` repointed off `--paper` onto `--canvas`. New Tailwind util `--color-canvas`.
- **Text:** `--ink` (primary) #4B5563 / #E0E3E8; `--ink-soft` (secondary/axes) #9CA3AF / #A0A5AC; `--ink-faint` folds to secondary (v3 interim); `--ink-trace` → hairline.
- **Borders:** `--rule` #D1D5DB / #2A2D31; `--rule-strong` #9CA3AF / #3A3E44.
- **Accent (single, one-accent rule):** `--accent` #E05C42 / #DC5D4B; `--accent-soft` (data-secondary coral) #F87171 / #F27A6C; `--accent-deep` derived hover. `--cta-utility`, `--primary` (shadcn), `--lm-brand`/`-deep`/`-glow` all collapsed onto the accent (in-product nav-blue retired as chrome).
- **Chart slate:** `--dominant`/`-soft`/`-deep` repointed to slate #4E5D70 (same both modes) — now chart-line only.
- **Status:** `--success` → #22C55E (both modes); `--lm-success`/`-25`/`-warning`/`-error` routed through `--success`/`--warning`/`--error`. `--warning`/`--error` retained (amber/muted-red, no v3 analog).
- **Misc:** `--lm-bg-blur` dark → night canvas rgba; `.ed-field` focus ring navy → v3 coral.

**Couche interim mapping:** `--couche-pieges` + `--lm-couche-pieges` → `--accent`; the other four couches (`--couche-default`, `--lm-couche-propos/plan/construction/musique`) → `--ink` (primary-text neutral interim). **FLAGGED for the couche-display surface paint** to refine to real per-couche identity.

**Hex sweep (F-349 completion):** routed the chrome hexes through v3 tokens — `#44794F`×11 (Activite/Dialogue correct-answer green → `--success`), error reds (profil `#D94F4F`, CorrectedLine `#C0392B`, RecordButton `#EF4444`×2, ModuleExamples `#C84A3F`) → `--error`, greens (profil `#3A6B35`, ModuleExamples `#3F7A4A`, ClusterHeader `#2D8B55`) → `--success`, ClusterHeader `#D9A441` → `--warning`, Tache3 coral `#FF8B6B` → `--accent-soft`, HomeScreen flame `#FF6B35` → `--accent`, l-examen hover `#F0F0F2` → `--paper-edge`, UserMenu banned `#C8102E` → v3 `#E05C42`, layout `themeColor` → `--canvas`. **The ~110 white occurrences are button/badge text (universal-contrast, correctly kept).** Whites used as `const PAPER` are white *text* (not surface bg), so they stay.

**Could-not-map (listed for follow-up, not forced):**
- Dark-chrome-in-light: `Footer.tsx` + `ProductDemo.tsx` `#1C1A16` (dark panel bg — v3 has no dark-chrome-in-light-mode token).
- `HomeScreen.tsx` `#6B4EAA` purple deadline label (no v3 purple).
- Decorative palettes intentionally kept: per-category tint maps (`#C7DFEA`/`#E8E4D8` in DetectedModuleCard/SecondaryModulesList/LearnModulePage/RecurringModuleCard), the UserMenu deterministic avatar palette, the onboarding `--lm-pastel-*` chip layer, ProductDemo fake-browser traffic-light dot.
- ~~**rgba v2-navy/-green/-vermillion tints**~~ — **DONE in the extension commit** (see below).
- **Shell polish** (frosted/blur, shadow elevation, motion) that F-453 tagged "F-454" — separate follow-up.

**Old-v2-literal grep:** `#14213D | #C8102E | #0F1419 | #F5F5F7 | #1D1D1F | #E5301C | #FF453A` across `*.ts/*.tsx/*.css` (excl. node_modules/.next/.claude/docs) → **ZERO remain.**

**Verification:** full unit suite (vitest) **506/506 passed** (53 files); `pnpm build` exit 0. **F-225 captures (both modes, since the repoint repaints every surface):** `f-454-{dashboard,la-methode,user-menu}-{light,dark}-{1440,375}.png` (12 total); trace `tests/traces/f-454.zip`. Capture spec `tests/e2e/f-454.spec.ts` reads the computed `--canvas` per mode and asserts it equals the v3 value (rgb(243,244,246) light / rgb(10,12,14) dark), so a broken var() chain fails the suite — all 4 green. Visual check: light = gray canvas + white cards + coral CTA (white text, contrast holds) + hairline borders; dark = near-black canvas + dark surfaces + coral accent + light text.

**Extension (2nd commit under F-454) — rgba/hsl form sweep:** the hex grep missed v2 colors written in `rgba()`/`hsl()` notation. Swept them all:
- **Semantic consts → tokens:** `INK_SOFT` (`rgba(20,33,61,.62/.55)` dead-navy secondary text) → `var(--text-secondary)`; `RULE` (`rgba(20,33,61,.10)` hairline) → `var(--rule-default)` across `/l-examen` + 4 comprehension/[exercise] pages, `/l-examen/mock`, `/carte`.
- **Themed tints → `color-mix` of the role token at the same alpha:** dead-navy chip/section tints → `color-mix(var(--dominant) N%)` (IleShell, Activite, SeancePlayer, ActeDeParole, Tache oral, CalendarWidget heatmap ramp 18/38/62); v2-green answer/status tints → `color-mix(var(--success) N%)` (Activite/Dialogue/IleShell); v2-vermillion incorrect/piège tints → `color-mix(var(--accent) N%)` (Activite/Dialogue incorrect, Regle piège, Tache non-oral). Preserves alpha + dark-adapts via the token.
- **Scrim:** CartDrawer backdrop `rgba(15,20,25,.45)` → neutral `rgba(0,0,0,.45)` (no v3 scrim token; black is the conventional role).
- **globals.css doc-header** rewritten v2→v3 (the stale "two-greens rule" block referenced dead `#8FA279`/`#44794F`).
- **Final all-form grep** (hex + rgba + dead-hsl, excl. archived docs) → **ZERO dead-palette colors remain in any form.** Out-of-scope (untouched per brief): decorative palettes (`#6B4EAA`, category/avatar/pastel).
- **Verification:** full suite **506/506**; `pnpm build` exit 0. F-225 recapture of the surfaces that shifted: `f-454ext-molds-{light,dark}-{1440,375}.png` (lesson molds: piège/chip/answer tints), `f-454ext-l-examen-{light,dark}-{1440,375}.png` (secondary text + hairlines); trace `tests/traces/f-454-ext.zip`. Spec `tests/e2e/f-454-ext.spec.ts` — all 4 green.

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
