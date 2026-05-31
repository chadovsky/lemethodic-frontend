# Le Méthodic: ROADMAP

**Anti-drift OS** • Source of truth for milestone sequencing.
Last updated: 2026-05-25.

---

## How this file works

- ROADMAP.md at FE repo root is canonical. BE has no separate roadmap; BACKLOG.md in each repo references milestone tags from here.
- Each session opens with: **"Milestone MX. Active: Y."** Y is the micro-feature.
- One micro-feature per session. Use `/compact` between to preserve focus.
- Polish work defers to M7. Polish urges raised during M1-M6 go to BACKLOG.md tagged `polish-defer`.
- Two consecutive sessions that don't advance the active milestone trigger an audit.
- Milestone advances only when **all** acceptance criteria are met. No partial credit.

---

## Active

**Milestone:** M0: Audit + ROADMAP
**Active micro-feature:** ROADMAP authoring (this file)

---

## Milestones

**Parallel marketing track.** Marketing site work (homepage, exam landings, public method explainer, pricing page, founder + coaching pages, help and legal, blog, /library store) is tracked separately in ROADMAP-marketing.md. The product milestones M0 through M8 cover the authenticated app and backend. Both tracks ship independently. M8 soft-beta requires both tracks ready.

### M0: Audit + ROADMAP

Establish the source of truth before any further work.

**Acceptance:**
- ROADMAP.md exists at FE root with M0-M8 acceptance criteria locked
- FE route inventory captured (every route, render state, console errors, screenshots) → `docs/m0-fe-audit-2026-05-25.md`
- BE endpoint inventory captured (every route, status, FE consumer) → `docs/m0-be-audit-2026-05-25.md`
- Every BACKLOG.md ticket tagged with `Milestone: MX` (or `polish-defer`) in both repos
- Both commits pushed (FE `main`, BE `master`)

---

### M1: Surface parity

Every shipped surface renders without empty states, broken routes, or 500s.

**Acceptance:**
- 0 empty surfaces across `/`, `/ecole` (→ `/la-methode` in M2), `/vocabulaire` (→ `/la-bibliotheque` in M2), `/diagnostic` (→ `/l-examen` in M2), and all sub-routes
- 0 console errors at `/` and at the three product entry points
- Onboarding A/B/C branches (F-327) all reach a non-error terminal screen
- All three product entry points reachable from primary nav
- V-016c resolved (/ecole Fondations + Approfondissement render)
- `NEXT_PUBLIC_API_URL` resolves in production

**In-scope (initial map, Step 4 confirms):**
F-328, F-329, F-330, V-016c, V-vercel-dup, W-* surface wiring tickets.

---

### M2: Visual coherence (DESIGN.md + M-RENAME + 5-couche)

DESIGN.md v1 applied across all surfaces. Canonical names live everywhere.

**Acceptance:**
- DESIGN.md tokens applied to every surface: Cabinet Grotesk display / Geist UI / Source Serif 4 lesson; warm mustard/ochre palette; per-couche hex
- Dark mode toggle functional on all routes
- Zero user-facing strings containing legacy names: `FluentPath`, `FluentPrep`, `Le Vocabulaire`, `Le Diagnostic`, `L'École`, `Le Fond`, `Moules des Idées`, `Moules`, `Réflexes Anglais`, `La Voix`
- Canonical names live: La Méthode, La Bibliothèque, L'Examen, Le Propos, Le Plan, La Construction, Les Pièges Anglais, La Musique
- M-RENAME ticket family executed
- M-VISUAL audit ticket closes

**Status:** Active. Visual coherence work in progress. Per recent feedback, Coursera-density dashboard widgets are added scope for M2.

**In-scope:** M-RENAME family, M-VISUAL family.

---

### M3: L'Examen e2e (F-322 + F-336-340)

Complete diagnostic flow: Tâche 1 → 2 → 3 → scored report with examiner voice.

**Acceptance:**
- User completes a full Tâche 1 / Tâche 2 / Tâche 3 run end-to-end without manual intervention
- F-322 validator core operational
- F-336-340 scoring components live (Step 4 confirms scope)
- 4-couche scoring renders in the report
- Examiner voice (OpenAI TTS-1-HD, **examiner-only**) plays during Tâches
- V-009.be La Voix scoring decisions locked
- D-036 free CEFR sources (CoE Companion 2020 + FEI rubric) wired into scoring

**In-scope:** F-322, F-336, F-337, F-338, F-339, F-340, V-009.be, D-035, D-036, F-061.1, F-061.2.

---

### M4: La Bibliothèque (F-321 + modes)

Vocab product live with all 4 modes and Phase 1 corpus loaded.

**Acceptance:**
- F-321 Phase 1 vocab review complete (1,684 chunks triaged and live)
- 4 modes pass smoke: browse / practice / test / tutor
- Chunk-database scoring integrated
- D-034 B2 enrichment landed (B2 scarcity resolved)
- F-225 verification battery captured

**In-scope:** F-321, D-034, F-225, M-014 (if scoped here vs M3).

---

### M5: Le Maître (F-351)

ElevenLabs Chadi-clone wired as unified tutor persona.

**Acceptance:**
- Le Maître voice plays in La Méthode lesson narration
- Le Maître voice plays in La Bibliothèque tutor mode
- Le Maître voice plays in L'Examen onboarding (not Tâches themselves)
- OpenAI TTS-1-HD remains **examiner-only** during Tâches. Non-negotiable brand separation.
- F-351 voice selection locked

**In-scope:** F-351.

---

### M5.5: BE pre-monetization hardening

Backend hardening required before revenue infrastructure is safe to expose.

**Acceptance:**
1. Tier enforced server-side; free token rejected from paid endpoints (P-105)
2. AI endpoints rate-limited per user, 429 on breach (F-401)
3. FK indexes present and used (F-402)
4. Flagged endpoints free of N+1 (F-403)

---

### M6: Paywall + Stripe/LLC (B-104 + B-100 + D-028/029/033)

Revenue infrastructure operational end-to-end.

**Acceptance:**
- Delaware LLC formed via Stripe Atlas
- EIN obtained
- Mercury bank account active
- Stripe live (production keys)
- Activation layer live: D-028, D-029, D-033
- Paywall (B-104) gates premium content correctly
- At least one tier completes end-to-end purchase
- B-101 legal counsel engagement complete (4-week lead time satisfied)
- F-405 token control + F-406 auth hardening landed (revenue prerequisites)

**In-scope:** B-100, B-101, B-104, D-028, D-029, D-033, F-405, F-406.

**Note:** "Tier enforcement (returning the correct tier from DB) is M5.5 scope (P-105), not M6 scope. M6 only populates real subscription_tier values into the DB via Stripe webhook handling."

---

### M7: Satisfaction gate

Quality sign-off before exposing to users. One session.

**Acceptance:**
- 3 smoke test runs pass (full onboarding → product use → checkout)
- 24-hour observation window with zero critical bugs
- Sign-off completed
- Polish-deferred tickets reviewed; release-blockers escalated, rest stay deferred to V1.1+

---

### M8: Soft-beta 30-50

Beta cohort onboarded, feedback loop running.

**Acceptance:**
- 30-50 beta users with confirmed product access
- Feedback capture mechanism live
- First iteration loop closed (at least one beta-driven change shipped)

---

## Polish-deferred (V1.1+)

These exist in BACKLOG.md but do not gate soft-beta:

- **S-001 / S-002**: Whisper async STT swap (Tâche 3 + vocab + batch only via Groq or CPU self-host; **streaming Tâche 1/2 stays AssemblyAI until V2+**, local Whisper needs GPU for sub-1s latency, doesn't pencil pre-volume)
- **M-013**: programmatic SEO at scale
- **M-018-028**: content marketing workflows
- Native app wrappers (Capacitor)
- Non-Anglophone UI localization (ES/PT/AR)
- B2B tutor mode with student dashboards
- Multi-exam expansion (TEF, DELF B2, naturalisation interview prep)

---

## Session opener template

```
Milestone MX. Active: <micro-feature>.
```

If a session opens without this, the first task is to set it.

---

## Appendix, Visual debt (folded from M-VISUAL-AUDIT.md, 2026-05-31)

This appendix folds the M-VISUAL-AUDIT.md findings into ROADMAP.md per the file consolidation plan (Sessions 1-5).

The 49 findings from the 2026-05-25 audit are categorized as:

- Category A, off-palette hex values
- Category B, off-system Tailwind classes
- Category C, tokenization opportunities
- Category D, contrast risks
- Category E, copy violations

Status as of 2026-05-30: Several findings resolved through M2 visual coherence work (A-007 cascade, Cat E copy sweep, 5-couche restate, wordmark sweep, shell sweep). Remaining items become tickets in BACKLOG.md tagged with their original M-VISUAL-AUDIT category.

The original M-VISUAL-AUDIT.md file is deleted as part of this consolidation. This appendix is the canonical reference for the audit findings going forward.
