# Le Méthodic: ROADMAP

**Anti-drift OS** • Source of truth for lighting-up order.
Last updated: 2026-06-02.

---

## How this file works

- ROADMAP.md at FE repo root is canonical. BE has no separate roadmap; BACKLOG.md in each repo references phase tags from here.
- Each session opens with: **"Phase PX. Active: Y."** Y is the micro-feature.
- One micro-feature per session. Use `/compact` between to preserve focus.
- Polish work defers to Phase 5 (bientôt flip queue). Polish urges raised during Phases 1-4 go to BACKLOG.md tagged `polish-defer`.
- Two consecutive sessions that don't advance the active phase trigger an audit.
- A phase advances only when **all** acceptance criteria are met. No partial credit.

---

## Doctrine: one complete website

The product is one complete website from launch. Every surface is present. Unbuilt parts show as bientôt (coming soon), not as missing routes or errors. Lighting a surface up means content plus a feature flag, never a version bump. The spine is exam-agnostic; a Target Profile (exam, threshold, deadline, persona) overlays it. All four skills are present from the start. TCF is the first exam lit, not the only exam. Do not frame any launch moment as a beta or version release.

**Canonical names:**
- Le Méthodic (the product)
- La Méthode (the core loop, route /la-methode)
- La Bibliothèque (the resource library, route /la-bibliotheque)
- L'Examen (the diagnostic and exam tools, route /l-examen)
- /carte (the Atlas hub, home after onboarding)
- The five couches: Le Propos, Le Plan, La Construction, Les Pièges Anglais, La Musique

**Forbidden names (anywhere in the repo):** FluentPath, FluentPrep, Le Cours, Le Raccourci, Guide tier, Sophie, Stripe in user-facing surfaces, and version language used as a product state (V1, V1.1, V2, beta, soft-beta as a product label).

**Parallel marketing track.** Marketing site work (homepage, exam landings, public method explainer, pricing page, founder and coaching pages, help and legal, blog, /library store) is tracked in ROADMAP-marketing.md. The product and marketing tracks ship independently. Opening to a first audience is a marketing decision about scale, not a product version gate.

---

## Active

**Phase:** P1: Complete scaffold
**Active micro-feature:** [set at session start]

---

## Shipped

- **M2 Visual coherence:** closed. DESIGN.md v2 tokens applied, canonical names live, 5-couche rename complete.
- **M3 L'Examen e2e:** closed. Tâche 1/2/3 flow complete, 4-couche scoring, examiner voice (OpenAI TTS-1-HD).
- **M5.5 BE pre-monetization hardening:** shipped. Tier enforcement, rate-limiting, FK indexes, N+1 fixes.

---

## Lighting-up order

The forward path is the sequence of wiring functionality behind a complete facade, not a sequence of versions.

---

### Phase 1: Complete scaffold

Every surface present, navigation reads as fully running, bientôt state system in place.

**Scope:**
- All routes exist and render without empty or broken states
- Navigation coherent end to end: bienvenue, /carte, /la-methode, /la-bibliotheque, /l-examen, /tarifs
- Bientôt component and flag system wired: surfaces not yet lit show the bientôt state, not an error
- 0 console errors on primary routes
- Onboarding branches all reach a non-error terminal screen

**Acceptance:**
- Every route in SITEMAP.md returns 200 or a designed bientôt state
- Primary nav renders as fully running at 1440px and 375px
- F-225 Playwright captures for all primary routes
- 0 console errors at `/`, `/carte`, `/la-methode`, `/la-bibliotheque`, `/l-examen`

---

### Phase 2: Core loop (first exam, end to end)

The exam-agnostic spine is lit for the first exam (TCF Canada). A user completes a full session from Target Profile through progression.

**Scope:**
- Bienvenue (Target Profile): exam choice, threshold, deadline, persona
- /carte (Atlas hub): île navigation, CLB map, progression state
- La séance: lesson entry point, Le Maître narration
- The île with oral and listening: Tâche flow with Le Maître tutor and examiner voice separation
- Le Maître conversation and the five-couche gate: Le Propos, Le Plan, La Construction, Les Pièges Anglais, La Musique all scored and gated
- Progression and CLB: user advances through CLB bands, state persists

**Acceptance:**
- A user can complete the full loop from onboarding through a scored Tâche and back to /carte
- Le Maître (ElevenLabs Chadi-clone) plays in lesson narration. OpenAI TTS-1-HD plays in Tâches only. Voices do not cross.
- CLB progression updates after a completed session
- F-225 Playwright captures for all loop surfaces

---

### Phase 3: Growth surface

The Pièges SEO library lit, Tarifs page live. These surfaces drive acquisition before payment is switched on.

**Scope:**
- /les-pieges-anglais SEO library: browseable, indexed, shareable articles on Anglophone interference patterns
- /tarifs: pricing tiers visible with LemonSqueezy as merchant of record. Purchase flow visible but not yet active (links to waitlist or contact until Phase 4 completes)
- Exam landing pages: /tcf-canada, /tef-canada, /tcf-quebec (bientôt for unlit exams)
- /methode public explainer: 5-couche overview, free placement test

**Acceptance:**
- /les-pieges-anglais index and at least 5 article slugs live
- /tarifs renders the full tier ladder with LemonSqueezy pricing, no Stripe references
- Three exam landings live with full content
- /methode and /placement live
- F-225 Playwright captures for all growth surfaces

---

### Phase 4: Payment via LemonSqueezy

LemonSqueezy wired end to end. Revenue infrastructure operational. Switched on only once Phase 2 (core loop) works end to end.

**Scope:**
- LemonSqueezy as merchant of record (handles VAT and payment compliance)
- Paywall gates premium content correctly
- At least one tier completes an end-to-end purchase
- Tier enforcement: free token rejected from paid endpoints (server-side, already done in M5.5)
- Subscriber discounts apply in /la-bibliotheque store

**Acceptance:**
- At least one tier purchases end to end via LemonSqueezy
- Paywall gates correctly
- Auth hardening and token control prerequisites landed
- No Stripe references in any user-facing surface or new code

**Note:** LemonSqueezy is the merchant of record. It handles VAT and payment compliance, which reduces the need for immediate LLC formation. LLC timing is a separate decision that does not gate Phase 4.

---

### Phase 5: Bientôt to live (ongoing, content-driven)

Flip bientôt surfaces to live as content is built. No engineering phase gate; each flip is content plus a feature flag.

**Sequence (order follows content readiness, not locked in advance):**
- Reading and writing skills (all four skills present from launch; oral and listening are lit first)
- La Bibliothèque modes: browse, practice, test, tutor fully lit
- Full L'Examen checkpoints across all skill areas
- More themes and islands in /carte
- More exams: TEF, DALF, DELF (the spine is already exam-agnostic)
- L'École: coaching, live sessions, founder pages
- Spaced review and adaptive scheduling

**Principle:** Each flip is content plus a flag. No version bump. No announcement of a new version. The site reads as complete throughout.

---

## Polish-deferred

Items in BACKLOG.md that do not gate any phase:

- S-001 / S-002: Whisper async STT swap (Tâche 3 + vocab + batch only via Groq or CPU self-host; streaming Tâche 1/2 stays AssemblyAI until volume justifies local GPU)
- M-013: programmatic SEO at scale
- M-018-028: content marketing workflows
- Native app wrappers (Capacitor)
- Non-Anglophone UI localization (ES/PT/AR)
- B2B tutor mode with student dashboards

---

## Session opener template

```
Phase PX. Active: <micro-feature>.
```

If a session opens without this, the first task is to set it.

---

## Appendix: Visual debt (folded from M-VISUAL-AUDIT.md, 2026-05-31)

This appendix folds the M-VISUAL-AUDIT.md findings into ROADMAP.md per the file consolidation plan (Sessions 1-5).

The 49 findings from the 2026-05-25 audit are categorized as:

- Category A, off-palette hex values
- Category B, off-system Tailwind classes
- Category C, tokenization opportunities
- Category D, contrast risks
- Category E, copy violations

Status as of 2026-05-30: Several findings resolved through M2 visual coherence work (A-007 cascade, Cat E copy sweep, 5-couche restate, wordmark sweep, shell sweep). Remaining items become tickets in BACKLOG.md tagged with their original M-VISUAL-AUDIT category.

The original M-VISUAL-AUDIT.md file is deleted as part of this consolidation. This appendix is the canonical reference for the audit findings going forward.
