# M-VISUAL Audit: DESIGN.md v2

**Date:** 2026-06-01
**Branch:** main
**DESIGN.md v2 locked:** 2026-05-27
**t10 color token wiring:** 7c6042a (F-348 shipped)
**t11 Type A font loading:** 7c6042a (M2 t11 shipped)
**Supersedes:** docs/m2-visual-audit-2026-05-25.md (v1 direction, now obsolete)

---

## Audit baseline: what t10/t11 delivered

Before per-surface findings, the token and font infrastructure state must be clear.

**Color tokens (t10 — COMPLETE):**
`app/globals.css :root` now contains the full DESIGN.md v2 Palette A: `--dominant #14213D`, `--accent #C8102E`, `--paper #FFFFFF`, `--ink #0F1419`, `--rule`, `--ink-soft/faint/trace`, and all radius/motion tokens. The `.dark` block contains the correct night-paper overrides (`--paper #0E1626`, `--dominant #38598F`, `--accent #E23A54`). `ThemeProvider` is mounted in `app/layout.tsx` with `defaultTheme="system" enableSystem`. The `--lm-*` alias layer bridges 823 legacy usages to canonical tokens, so surfaces using `--lm-bg-base`, `--lm-text-primary`, etc. are effectively on v2 tokens already.

**Font loading (t11 — CSS ONLY, not yet wired to JS constants):**
`app/layout.tsx` now loads the 5 Type A fonts via `next/font/google`: Instrument Serif, Crimson Pro, Instrument Sans, Inter, DM Mono. CSS variables `--f-display`, `--f-body`, `--f-ui`, `--f-en`, `--f-mono` are defined in `app/globals.css`. However, **`lib/typography.ts` was NOT updated** as part of t11. It still exports stale v1 constants pointing to unloaded CSS variables. This is the single largest outstanding gap (see P0-2 below).

---

## Per-surface findings

### Group 1: Public marketing routes

#### `/` — Homepage

**Compliance:** PARTIAL

**Tokens:** `var(--bg-canvas)`, `var(--cta-primary)`, `var(--text-primary)`, `var(--text-muted)` used throughout. All resolve correctly via aliases. `--lm-pastel-*` used as accentColor in MethodologyPreview card backgrounds (5 occurrences) — legacy decorative tokens used beyond chip scope.
Hardcoded hex: `'#ffffff'` on CTA button text (1 in Hero.tsx — technically correct, defer).

**Typography:** `SERIF_FONT` and `SANS_FONT` imported from `lib/typography.ts`. Both resolve to undefined CSS variables (`--font-source-serif`, `--font-geist` are not loaded). Fallback chain: `--font-geist` not defined → `-apple-system, "Segoe UI", system-ui`. Hero H1 is rendering in system-ui, not Instrument Serif.

**Notable gaps:**
1. `Hero.tsx:23` — `fontStyle: 'italic'` on the H1 headline. DESIGN.md §8: "No italic in display type."
2. `Hero.tsx:22` — `fontFamily: SERIF_FONT` resolves to system-ui (unresolved CSS var). Should be `var(--f-display)`.
3. `MethodologyPreview.tsx:12-55` — `accentColor: 'var(--lm-pastel-peach/sage/butter/lavender/sky)'` on card slots. Pastels are decorative chip layer only per DESIGN.md v2. Card accent areas should use `var(--paper-tint)` or `var(--paper-edge)`.
4. `Hero.tsx:59` — CTA `borderRadius: 4`. Should be `var(--r-pill)` per DESIGN.md §4 (CTAs are pill-shaped).

---

#### `/fr` — French homepage

**Compliance:** PARTIAL

**Tokens:** Shares landing component pattern with `/`. Same `--lm-*` via-alias usage. Checked `app/fr/page.tsx` — thin wrapper over shared landing sections.

**Typography:** Same lib/typography.ts issue as `/`.

**Notable gaps:**
5. `app/fr/page.tsx` passes `lang="fr"` to the section component but `<html lang="en">` in layout.tsx means the CSS `[lang="en"]` selector applies at the document root, overriding the section-level lang attribute in the font cascade. French UI text gets Inter (English font), not Instrument Sans.

---

#### `/cours/methode-tcf-canada` — La Méthode course listing

**Compliance:** PARTIAL

**Tokens:** Canonical `--text-primary`, `--text-muted` used. `var(--bg-subtle)` on section backgrounds.

**Typography:** `SERIF_FONT` (unresolved), `SANS_FONT` (unresolved) from lib/typography.ts. `fontStyle: 'italic'` on the "La Méthode" page H1 (`LessonList.tsx:24`).

**Notable gaps:**
6. `LessonList.tsx:24` — `fontStyle: 'italic'` on H1 "La Méthode". DESIGN.md §8 violation.
7. `LessonList.tsx:22` — `fontFamily: SERIF_FONT` — unresolved CSS var.

---

#### `/cours/methode-tcf-canada/[id]` — Lesson detail

**Compliance:** PARTIAL

**Tokens:** Mix of `var(--text-primary)`, `--lm-*` aliases, and one hardcoded hex (`app/cours/methode-tcf-canada/lesson/[id]/LessonDetailClient.tsx` — 1 hex occurrence). Quiz client has 7 hardcoded hex occurrences.

**Typography:** `DISPLAY_FONT` imported from `lib/typography.ts` (v1, unresolved). `fontStyle: 'italic'` visible in lesson H1 display.

**Notable gaps:**
8. `LessonDetailClient.tsx` — `DISPLAY_FONT` resolves to system-ui at runtime.
9. `QuizClient.tsx` — 7 hardcoded hex values (`#1A4A2E`, `#7A1C20`, etc.) for quiz feedback states. Should be `var(--lm-success)` / `var(--lm-error)`.

---

#### Exam-specific marketing pages (/tcf-canada, /tef-canada, /tcf-quebec, /dalf-c1)

**Status: Routes do not exist yet.** No `app/tcf-canada/`, `app/tef-canada/`, `app/tcf-quebec/`, or `app/dalf-c1/` directories found. Skipped — deferred to post-MS-1 milestone. Note in PRD that these surfaces are unbuilt, not failing audit.

---

### Group 2: Auth flows

#### `/login`, `/signup`, `/password-reset`, `/verify-email`

**Compliance:** FAIL (font stack broken)

**Tokens:** Use `BG = 'var(--lm-bg-base)'` (aliases correctly to `var(--paper)`). `INK`, `INK_SOFT`, `INK_MUTED` imported from `OnboardingScreen.tsx` — these correctly resolve to `var(--text-primary)`, `var(--text-secondary)`, `var(--text-muted)`. Hardcoded hex: `'#FFFFFFCC'` for `PAPER` constant in `OnboardingScreen.tsx:27`. `'#1A1A1A4D'` for `CTA_DISABLED` constant (`OnboardingScreen.tsx:28`).

**Typography:** `DISPLAY_FONT` re-exported from `OnboardingScreen.tsx:29` points to `var(--font-cabinet)`. `--font-cabinet` is NOT defined in layout.tsx; falls to `"Cabinet Grotesk"` string, which is not loaded, then to system-ui. All auth forms render in system-ui sans-serif.
`OnboardingScreen.tsx:40`: local `SANS` constant also uses `var(--font-geist)` — same broken chain.

**Notable gaps:**
10. `app/login/page.tsx:8-13` — imports `DISPLAY_FONT` from OnboardingScreen (v1 font, unresolved at runtime).
11. `app/password-reset/page.tsx` — `fontStyle: 'italic'` usage in heading elements.
12. `OnboardingScreen.tsx:27-28` — `PAPER = '#FFFFFFCC'` and `CTA_DISABLED = '#1A1A1A4D'` are hardcoded hex; won't flip in dark mode.

---

### Group 3: App canonical routes

#### `/dashboard`

**Compliance:** PARTIAL

**Tokens:** `var(--text-primary)`, `var(--text-muted)`, `--lm-*` alias usage in dashboard widgets. Dashboard component file composition is clean at the page level.

**Typography:** `SERIF_FONT` (unresolved) and `fontStyle: 'italic'` on the greeting H1 in `DashboardGreeting.tsx:29`. "Bonjour, [name]" should be the flagship Instrument Serif display — it's rendering in Georgia (SERIF_FONT fallback after unresolved CSS var).

**Notable gaps:**
13. `DashboardGreeting.tsx:28-30` — `fontFamily: SERIF_FONT` (unresolved → Georgia), `fontStyle: 'italic'` on primary greeting. Two violations in one element: wrong font AND italic forbidden.
14. DESIGN.md §9 specifies `"Bonjour, [name]."` in Instrument Serif with a vermillion hand-drawn accent line. Current implementation has neither the correct font nor the accent line.

---

#### `/la-methode` — DEAD ROUTE (P0)

**Compliance:** FAIL

`app/(app)/la-methode/page.tsx` exists as a real Next.js page but is unreachable. `next.config.mjs:15` contains:
```js
{ source: '/la-methode', destination: '/cours/methode-tcf-canada', permanent: true }
```
Next.js processes `redirects()` before the filesystem router. Every request to `/la-methode` is 308-redirected to `/cours/methode-tcf-canada`. The `(app)` group page is dead code. `app/(app)/la-methode/[id]/page.tsx` is similarly unreachable.

This is tracked as P0-1 below.

---

#### `/la-bibliotheque` — La Bibliothèque browse

**Compliance:** PARTIAL

**Tokens:** `var(--text-primary)`, `var(--text-muted)` used. Some `--lm-*` aliases in FilterBar and ChunkRow.

**Typography:** `SERIF_FONT` (unresolved) and `SANS_FONT` (unresolved) from lib/typography.ts in VocabBrowse, FilterBar, ChunkRow, and all vocabulary components. `fontStyle: 'italic'` on La Bibliothèque H1 (`VocabBrowse.tsx:37`).

**Notable gaps:**
15. `VocabBrowse.tsx:36-38` — Same pattern: `fontFamily: SERIF_FONT` (unresolved), `fontStyle: 'italic'` on H1.
16. Legacy practice/test routes under `app/la-bibliotheque/[slug]/` (non-(app) group) remain alongside the canonical `app/(app)/la-bibliotheque/` routes. Dual-route presence creates ambiguity — recommend verifying which set is live.

---

#### `/l-examen` — L'Examen hub

**Compliance:** FAIL

**Tokens:** Local constants defined inline: `INK = '#14213D'`, `VERMILLON = '#C8102E'`, `PAPER = '#FFFFFF'`, `PAPER_TINT = '#FAFAFA'`, `INK_SOFT = 'rgba(20, 33, 61, 0.62)'`, `RULE = 'rgba(20, 33, 61, 0.10)'` — all hardcoded hex (5 occurrences). These are the canonical v2 values but are defined as literals, not token references. Won't flip in dark mode.

**Typography:** `SERIF_FONT` (unresolved) and `SANS_FONT` (unresolved). `fontStyle: 'italic'` on "L'Examen" H1.

**Notable gaps:**
17. `app/(app)/l-examen/page.tsx:5-11` — Six hardcoded hex values replacing token references. Every value is correct in light mode but breaks dark mode.
18. `app/(app)/l-examen/page.tsx:65` — `fontStyle: 'italic'` on H1 "L'Examen".
19. `app/(app)/l-examen/page.tsx:108` — `borderRadius: 8` inline. Should be `var(--r-sm): 10px` or `var(--r-md): 16px`.

---

#### `/account` — Account settings

**Compliance:** PARTIAL

**Tokens:** shadcn component base; uses `--background`, `--foreground` which alias to canonical tokens. `var(--lm-*)` aliases in custom elements.

**Typography:** `SANS_FONT` (unresolved) in form labels and section headings.

---

### Group 4: L'Examen sub-surfaces

#### `/l-examen/expression-orale` — SpeakingLanding (mobile) + SpeakingDesktop

**Compliance:** FAIL (font + italic + hardcoded hex)

**Tokens:** `SpeakingLanding.tsx`: local `DISPLAY_FONT = 'var(--font-geist)...'` — same dead CSS var. `PEACH = 'var(--lm-pastel-peach)'`, `SAGE`, `LAVENDER` as card backgrounds (pastel chip tokens used beyond chip scope). `BG = 'var(--lm-bg-base)'` (aliases OK). `SpeakingDesktop.tsx`: 1 hardcoded hex.

**Typography:** `SERIF_FONT` (unresolved) + `fontStyle: 'italic'` pattern repeated. `SpeakingDesktop.tsx` uses `fontStyle: 'italic'` in section headers.

**Notable gaps:**
20. `SpeakingLanding.tsx:13` — `DISPLAY_FONT = 'var(--font-geist)...'` — locally redefined stale constant.
21. `SpeakingLanding.tsx:29-30` — Tâche card backgrounds use `--lm-pastel-peach/sage/lavender`. v2 eliminates pastel card backgrounds; cards should be `--paper-tint`.

---

#### `/l-examen/expression-orale/tache-1`, tache-2, tache-3 — Recording sessions

**Compliance:** FAIL

**Tokens:** `Tache1Session.tsx`, `Tache2Session.tsx`, `Tache3Session.tsx` — 4, 5, 3 hardcoded hex values respectively. `RecordButton.tsx` — 4 hardcoded hex values. These include recording-state UI colors that must flip in dark mode.

**Typography:** `SERIF_FONT`/`SANS_FONT` (unresolved) throughout. `fontStyle: 'italic'` in session phase headings.

**Notable gaps:**
22. `RecordButton.tsx` — 4 hardcoded hex recording state colors. Critical for dark mode since the recording UI is a high-attention surface.
23. `Tache2Session.tsx` — 5 hardcoded hex values including conversation bubble colors. `ChatBubble.tsx` also has 3 hardcoded hex values.

---

#### `/l-examen/diagnostic` — Diagnostic results

**Compliance:** PARTIAL

**Tokens:** `CouchesBreakdown.tsx` — couche bar fill uses `var(--cta-utility)` (aliases to `var(--dominant)`) for ALL 5 bars. Les Pièges Anglais bar should use `var(--accent)` per DESIGN.md §7. CEFR_PASTEL_MAP used for score badge colors — acceptable as level indicator.

**Typography:** `SERIF_FONT` (unresolved) + `fontStyle: 'italic'` on couche names in `CouchesBreakdown.tsx:76-77`. Multiple diagnostic components inherit same pattern.

**Notable gaps:**
24. `CouchesBreakdown.tsx:118` — All couche bars fill with `var(--cta-utility)`. Les Pièges Anglais must use `var(--couche-pieges)` = `var(--accent)` (vermillion). DESIGN.md §7: "Fill in the couche's identity color."
25. `CouchesBreakdown.tsx:68` — `borderRadius: 4` (sharp). Should use `var(--r-xs): 6px`.
26. `CouchesBreakdown.tsx:76-77` — `fontStyle: 'italic'` on couche name labels.

---

#### `/l-examen/expression-ecrite`, `/l-examen/comprehension-orale`, `/l-examen/comprehension-ecrite`

**Compliance:** PARTIAL to FAIL

**Tokens:** Comprehension pages (`app/(app)/l-examen/comprehension-orale/page.tsx`, `comprehension-ecrite/page.tsx`) — 2 hardcoded hex values each. Exercise sub-pages — 2 hardcoded hex each.

**Typography:** `SERIF_FONT`/`SANS_FONT` (unresolved). `fontStyle: 'italic'` on page headings in comprehension pages.

**Notable gaps:**
27. `/l-examen/comprehension-orale/page.tsx` and `comprehension-ecrite/page.tsx` — 2 hardcoded hex each, plus italic H1 pattern.
28. `WritingSubmissionClient.tsx` and `WritingHistoryClient.tsx` — 5 and 1 hardcoded hex respectively. `WritingPromptPicker.tsx` — 2.

---

#### `/l-examen/mock` — Mock exam

**Compliance:** FAIL

**Tokens:** `app/(app)/l-examen/mock/page.tsx` — 3 hardcoded hex values.

**Typography:** `fontStyle: 'italic'` on mock exam headings.

---

### Group 5: La Bibliothèque sub-surfaces

#### Browse, practice, test, vocab modes

**Compliance:** FAIL (font + italic + hardcoded hex)

**Tokens:** `app/la-bibliotheque/[slug]/practice/PracticeClient.tsx` — 7 hardcoded hex values. `app/la-bibliotheque/[slug]/test/TestClient.tsx` — 14 hardcoded hex values (highest single-file count). `app/la-bibliotheque/[slug]/TopicDetail.tsx` — 3 hardcoded hex values.

**Typography:** Vocabulary practice components (`QuizQuestion.tsx`, `Flashcard.tsx`, `PracticeDeck.tsx`, `Quiz.tsx`) all import `SANS_FONT`/`SERIF_FONT` from lib/typography (unresolved). `fontStyle: 'italic'` on vocabulary heading elements.

**Notable gaps:**
29. `TestClient.tsx` — 14 hardcoded hex. Highest concentration in a single file. Includes state colors for quiz feedback that are critical for dark mode.
30. `PracticeClient.tsx` — 7 hardcoded hex including background and text colors.
31. Vocabulary quiz components (`QuizQuestion.tsx`, `Flashcard.tsx`) use `fontStyle: 'italic'` on French-side text display. This may be intentional (French words italicized for visual distinction) but DESIGN.md §8 is unambiguous; document as a decision point.

---

## Top issues prioritized

### P0 — Blocks soft-beta visual coherence

**P0-1: `/la-methode` 308 redirect conflicts with live page file**
`next.config.mjs:14-16` permanently redirects `/la-methode` → `/cours/methode-tcf-canada`. `app/(app)/la-methode/page.tsx` and `app/(app)/la-methode/[id]/page.tsx` are unreachable dead code. Next.js processes `redirects()` before the filesystem router — the page files cannot be reached regardless of auth state. Any link in the product that still points to `/la-methode` silently 308s to the canonical course page (which may or may not be the intended behavior). Dead code must be resolved: either remove the page files, or remove the redirect and canonicalize at the route level.

**P0-2: `lib/typography.ts` v1 constants unresolved at runtime**
`lib/typography.ts` exports `DISPLAY_FONT`, `SANS_FONT`, `SERIF_FONT` referencing CSS variables `--font-cabinet`, `--font-geist`, `--font-source-serif`. None of these variables are defined in `app/layout.tsx` after the t11 migration to Type A fonts. The CSS variable resolution falls through to the string fallbacks (`"Cabinet Grotesk"`, `-apple-system, "Segoe UI"`, `Georgia`) — fonts that are not loaded and in some cases not installed. Every component importing from `lib/typography.ts` is rendering in the system font stack. Affected scope: 144 files. This negates the entire t11 font loading work. The fix is to update the three exported constants to reference the v2 CSS variables (`--f-display`, `--f-ui`, `--f-body`).

`OnboardingScreen.tsx:29` independently re-exports a stale `DISPLAY_FONT = 'var(--font-cabinet)...'` consumed by auth flows (login, signup). Same issue, separate fix point.

**P0-3: `fontStyle: 'italic'` on display headings — 67 files**
DESIGN.md §8: "No italic in display type." The primary page H1 on every canonical app surface uses `fontStyle: 'italic'`: Dashboard greeting, La Méthode, La Bibliothèque, L'Examen, lesson detail headers, couche breakdown labels. This is a pervasive pattern that survives from v1. At scale, italic on serif display headings is the single most visible design-system violation to a first-time visitor.

**P0-4: `<html lang="en">` defeats language-aware font switching**
`app/layout.tsx:95` sets `lang="en"` on the root HTML element. DESIGN.md §3 requires `lang="fr"` as the document default, with English fragments marked `lang="en"`. The current setup makes the CSS rule `[lang="en"] { font-family: var(--f-en) }` match the entire document, assigning Inter (the English UI font) to all elements. Instrument Sans (the French UI font) can never apply to default-lang elements. Language-aware font switching is non-functional until this is flipped.

---

### P1 — Visible polish needed before public

**P1-1: Hardcoded hex colors — 171 occurrences across 71 TSX files**
These values are correct in light mode but will not flip when the user's system prefers dark mode or when the theme toggle is activated. Highest concentrations: `TestClient.tsx` (14), `Tache2Session.tsx` (5), `WritingSubmissionClient.tsx` (5), `PracticeClient.tsx` (7), `QuizClient.tsx` (7 × 2 instances). Pattern: recording state colors, quiz feedback states, conversation bubble backgrounds.

**P1-2: `app/(app)/l-examen/page.tsx` local hex constants**
This file defines six inline constants that are the correct v2 hex values but are not token references. Any `.dark` mode activation renders this surface in light-mode colors. These should be `var(--dominant)`, `var(--accent)`, `var(--paper)`, `var(--ink)`, `var(--ink-soft)`, `var(--rule)`.

**P1-3: Les Pièges Anglais couche bar uses wrong fill color**
`CouchesBreakdown.tsx:118` fills all 5 couche bars with `var(--cta-utility)` (dominant blue). Les Pièges Anglais must use `var(--couche-pieges)` = `var(--accent)` (vermillion). This is the only visual differentiator between the "bottleneck couche" and the others — the entire couche identity system depends on it.

**P1-4: `--lm-pastel-*` used as card backgrounds on marketing + speaking surfaces**
`MethodologyPreview.tsx` uses pastel tokens (peach, sage, butter, lavender, sky) as card accent backgrounds for the 5-couche section. `SpeakingLanding.tsx` uses the same pastels for Tâche card backgrounds. DESIGN.md v2 limits pastels to "decorative chip layer ONLY." Card surfaces should use `var(--paper)` / `var(--paper-tint)` / `var(--paper-edge)`.

**P1-5: Dashboard "Bonjour" greeting incomplete**
DESIGN.md §9 locks "Bonjour, [name]." in Instrument Serif with a vermillion accent line under the name. Current state: `DashboardGreeting.tsx` uses `fontFamily: SERIF_FONT` (unresolved → Georgia) + `fontStyle: 'italic'` (forbidden). Neither the correct font nor the accent line is implemented. The flagship in-product hero moment is broken.

---

### P2 — Cosmetic, can defer

**P2-1: `--lm-*` token migration (F-349 already queued)**
823 usages of `--lm-*` aliases remain. Aliases resolve correctly to canonical tokens, so this is a code hygiene issue only. F-349 is queued.

**P2-2: Inline `borderRadius` values not using radius tokens**
`CouchesBreakdown.tsx:68`, `app/(app)/l-examen/page.tsx:108`, and a handful of other surfaces use numeric `borderRadius: 4` or `borderRadius: 8` inline instead of `var(--r-xs)` / `var(--r-sm)`. Minor; does not affect visual output since the token values match.

**P2-3: `OnboardingScreen.tsx` legacy constant exports**
`PAPER = '#FFFFFFCC'` and `CTA_DISABLED = '#1A1A1A4D'` are hardcoded with opacity. Consumed by unmigrated auth surfaces. Low visual impact but breaks dark mode on those surfaces' disabled states.

**P2-4: `styles/globals.css` unreachable file still present**
Unreachable (not imported anywhere, as noted in CLAUDE.md). Safe to delete; no audit impact but file hygiene.

**P2-5: Legacy `app/la-bibliotheque/[slug]/` non-(app) routes**
`app/la-bibliotheque/[slug]/practice/` and `app/la-bibliotheque/[slug]/test/` exist outside the `(app)` route group alongside canonical `app/(app)/la-bibliotheque/practice` and `app/(app)/la-bibliotheque/test`. Potential dual-serving ambiguity. Low risk if redirects are in place but worth verifying routing precedence.

---

## Surfaces audited

| Surface group | Routes covered | Status |
|---|---|---|
| Public marketing | `/`, `/fr`, `/cours/methode-tcf-canada`, `/cours/methode-tcf-canada/[id]` | Audited |
| Exam marketing pages | `/tcf-canada`, `/tef-canada`, `/tcf-quebec`, `/dalf-c1` | **Not built — skipped** |
| Auth flows | `/login`, `/signup`, `/password-reset`, `/verify-email` | Audited |
| App canonical | `/dashboard`, `/la-methode` (dead), `/cours/methode-tcf-canada`, `/la-bibliotheque`, `/l-examen`, `/account` | Audited |
| L'Examen sub-surfaces | `expression-orale`, `tache-1/2/3`, `expression-ecrite`, `comprehension-orale`, `comprehension-ecrite`, `diagnostic`, `mock` | Audited |
| La Bibliotheque sub-surfaces | browse, practice, test, vocab modes | Audited |
| Onboarding / paywall | `/onboarding`, `/paywall` | Spot-checked via imports |

**Note:** Exam-specific marketing pages (/tcf-canada etc.) do not exist in the current router tree. Not failed — marked as unbuilt. Should be tracked in PRD as MS-1 surfaces to build.

---

## Recommended next dispatches

### t1-v2 — Typography bridge (P0-2 + P0-4)
**Scope:** Update `lib/typography.ts` to replace the three stale v1 constants: `DISPLAY_FONT → 'var(--f-display)'`, `SANS_FONT → 'var(--f-ui)'`, `SERIF_FONT → 'var(--f-body)'`. Update `OnboardingScreen.tsx:29` DISPLAY_FONT export and the local `SANS` constant at line 40 to match. Fix `app/layout.tsx:95` `lang="en"` → `lang="fr"`. These four edits unlock the entire t11 font loading investment: 144 files immediately render the correct v2 typefaces with no further changes. Highest return-per-line dispatch in the v2 sprint.
**Priority:** P0. **Estimated effort:** 1 session.

### t2-v2 — Italic display sweep (P0-3)
**Scope:** Remove `fontStyle: 'italic'` from every display heading (H1, H2, and comparable large-text elements) across all 67 affected files. Primary targets: `DashboardGreeting.tsx`, `LessonList.tsx`, `VocabBrowse.tsx`, `app/(app)/l-examen/page.tsx`, `CouchesBreakdown.tsx`, lesson detail headers, speaking session phase headings. Note: vocabulary card French-side display (`Flashcard.tsx`, `QuizQuestion.tsx`) is a decision point — if italic is intentional for French word presentation, document the exception explicitly rather than leaving it as a DESIGN.md violation.
**Priority:** P0. **Estimated effort:** 1 session.
**Depends on:** t1-v2 (confirm fonts render correctly before removing italic — italic was compensating for unresolved serif font appearance).

### t3-v2 — Hardcoded hex token sweep (P1-1 + P1-2)
**Scope:** Replace the 171 hardcoded hex occurrences across 71 TSX files with canonical token references. Priority order: (1) `app/(app)/l-examen/page.tsx` 6 inline hex constants — highest impact, smallest file; (2) `TestClient.tsx` 14 occurrences; (3) speaking session files (`Tache1/2/3Session.tsx`, `RecordButton.tsx`, `ChatBubble.tsx`) totaling ~19 occurrences; (4) diagnostic components. Defer: `'#ffffff'` on CTA text (correct, not worth chasing). After sweep, dark mode should render correctly across all audited surfaces.
**Priority:** P1. **Estimated effort:** 1-2 sessions.

### t4-v2 — /la-methode dead code + couche bar fix (P0-1 + P1-3 + P1-4)
**Scope:** Part A — remove `app/(app)/la-methode/page.tsx` and `app/(app)/la-methode/[id]/page.tsx` (dead code, unreachable via redirect). Confirm `/cours/methode-tcf-canada` is the canonical in-product destination and all sidebar/nav links point there. Part B — fix `CouchesBreakdown.tsx:118` to apply `var(--couche-pieges)` = `var(--accent)` to the Les Pièges Anglais bar fill. Part C — replace `--lm-pastel-*` card backgrounds in `MethodologyPreview.tsx` and `SpeakingLanding.tsx` with `var(--paper-tint)` / `var(--paper-edge)`.
**Priority:** P0/P1 mixed. **Estimated effort:** 1 session.

### t5-v2 — Dashboard hero implementation (P1-5)
**Scope:** Implement the locked "Bonjour, [name]." hero gesture in `DashboardGreeting.tsx`: correct font (`var(--f-display)` after t1-v2 lands), no italic, vermillion hand-drawn accent line under the name (SVG underline animation, `var(--accent)` stroke). This is the product's flagship in-product moment per DESIGN.md §9 and should be prioritized before soft-beta.
**Priority:** P1. **Estimated effort:** 1 session.
**Depends on:** t1-v2 (font resolution) + t2-v2 (italic sweep done first to avoid regressions).

---

*Audit complete. No source files modified. Findings represent current state of main at 7c6042a.*
*t10/t11 infrastructure work confirmed complete. Primary v2 sprint blockers are in the application layer (lib/typography.ts, italic pattern, hex sweep), not the token layer.*
