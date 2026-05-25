# M2 Visual Audit — DESIGN.md Coverage + Apostrophes + Dark Mode
**Date:** 2026-05-25  
**Branch:** main (adbe2de — after M2 t3 route renames)  
**Scope:** Three audit dimensions per M2 t4 spec.

---

## Summary Table

| Dimension | Gap Count | Severity |
|---|---|---|
| D1: DESIGN.md Token Coverage | 5 structural gaps, ~60 inline violations | **Critical** |
| D2: Apostrophe Consistency | 36 hits (curly vs. straight) | Medium |
| D3: Dark Mode Functional | 0% functional — toggle absent, ThemeProvider unmounted | **Critical** |

**Recommended fix tickets:**
- `t5`: Dark mode wiring (ThemeProvider mount + warm dark tokens + toggle UI) — ~1–2 sessions
- `t6`: Font stack replacement (Figtree → Geist, Fraunces → Cabinet Grotesk display-only) — ~1 session
- `t7`: Brand + per-couche color tokens (`--lm-*` in globals.css + surface wiring) — ~1–2 sessions
- `t8`: Apostrophe sweep (straight apostrophe normalization in all user-facing strings) — ~0.5 session
- `t9`: Inline color cleanup pass (non-white hex values → token references) — ~1 session

---

## Dimension 1: DESIGN.md Token Coverage

### 1.1 Token Namespace — Complete Absence of `--lm-*`

DESIGN.md v1 (§3, §4, §5, §14.1) defines a `--lm-*` token namespace:

```
--lm-brand: #C49A3A          --lm-bg-base: #FAF7F0 / #1A1612 (dark)
--lm-couche-propos: #BC4F2A  --lm-couche-plan: #A66A2E
--lm-couche-construction: #8E5A1F  --lm-couche-pieges: #E0701D
--lm-couche-musique: #D4A431  --lm-text-primary: #1E1A14 ...
```

**None of these tokens exist in `app/globals.css`.** The existing CSS uses:
- `--fp-*` — legacy onboarding pastel palette (decorative chips)
- `--ed-*` / F-VISUAL-001 (`--bg-canvas`, `--text-primary`, `--cta-primary`) — current editorial system
- shadcn defaults (`--background`, `--foreground`, etc.)

**Impact:** Every DESIGN.md color reference is unimplemented at the token layer. Surfaces cannot conform until tokens are defined.

### 1.2 Brand Color (#C49A3A)

**Status: Absent from codebase.**

The brand ochre `#C49A3A` and family (`#8B6914`, `#F5E8C0`, `#E8C77A`) appear in:
- DESIGN.md §3.1 (specified)
- Zero source files (grep confirmed: 0 matches)

Current primary CTA color is `--cta-primary: hsl(220 40% 21%)` ≈ `#1F2D4A` (editorial navy). This is a defensible choice for premium positioning but does not match the DESIGN.md brand token.

**Top offending files** (CTA color hardcoded instead of tokenized):
- `components/onboarding/OnboardingScreen.tsx:30` — `DISPLAY_FONT = 'var(--font-switzer)...'` (wrong font)
- `app/la-methode/lesson/[id]/LessonDetailClient.tsx:63` — `fontFamily: DISPLAY_FONT` throughout
- `components/landing/MethodologyPreview.tsx:11–39` — 5 couche slots use gray/beige (`#D4CBBA`→`#F5F1EA`) instead of warm per-couche identity colors

### 1.3 Per-Couche Colors

**Status: Not implemented. Zero usage of DESIGN.md couche hex values.**

DESIGN.md §3.2 requires each couche to have a distinct warm color applied consistently across every product surface:

| Couche | Required Hex | Actual Usage |
|---|---|---|
| Le Propos | `#BC4F2A` (terracotta) | Not used anywhere |
| Le Plan | `#A66A2E` (cinnamon) | Not used anywhere |
| La Construction | `#8E5A1F` (bronze) | Not used anywhere |
| Les Pièges Anglais | `#E0701D` (vivid burnt orange) | Not used anywhere |
| La Musique | `#D4A431` (honey gold) | Not used anywhere |

**What's used instead:**

- `components/landing/MethodologyPreview.tsx:6–42` — 5 couches colored with near-identical gray/beige tones (`#D4CBBA`, `#DDD6C4`, `#E6E0D3`, `#EEE9DF`, `#F5F1EA`) plus `--fp-*` pastel accents. Les Pièges Anglais has no visual differentiation from Le Plan.
- `components/diagnostic/CouchesBreakdown.tsx:86,93` — Uses `CEFR_PASTEL_MAP` from `lib/data/cefr.ts` which maps CEFR *level* (A1/B1/B2/C1) to fp-pastels (sage, sky, butter, blush). These are proficiency-level colors, not couche-identity colors. DESIGN.md §3.2 requires couche-specific colors, not level-specific.
- `components/diagnostic/Results.tsx:98` — Calls `CouchesBreakdown` component (inherits wrong colors)
- `components/landing/sections/MethodologySection.tsx` — No per-couche color differentiation visible

**DESIGN.md §5 compliance:** "If a user finishes a Tâche and can't tell you which couches they scored well on, the product has failed at making methodology visible." The current color system makes couches visually indistinguishable.

### 1.4 Typography Stack

**Status: Both fonts are non-compliant. Forbidden font (Figtree) is the primary UI font.**

**DESIGN.md §4.1 approved stack:** Cabinet Grotesk (display) / Geist (UI/body) / Source Serif 4 (editorial lesson)  
**PRODUCT.md §10 forbidden list includes:** Figtree explicitly listed as "AI template fingerprint"

**Actual stack (app/layout.tsx:2, 26–37):**

| Loaded | Role | DESIGN.md verdict |
|---|---|---|
| **Figtree** (`--font-figtree`) | Primary UI/sans/body | ❌ **FORBIDDEN** — PRODUCT.md §10 explicitly calls this out |
| **Fraunces** (`--font-fraunces`) | Display/serif accents | ❌ Not in approved 3-font stack; DESIGN.md §4.6 doesn't list it as forbidden but it's not approved |
| Cabinet Grotesk | — | ❌ **Not loaded.** Only referenced in one comment (`components/cluster/LessonBody.tsx:4`) |
| Geist | — | ❌ **Not loaded.** Referenced as `SANS_FONT` in `lib/typography.ts` docs but `SANS_FONT` resolves to Figtree |
| Source Serif 4 | — | ❌ **Not loaded.** Referenced in comments only; `SERIF_FONT` resolves to Fraunces |

**Key files with font violations:**

- `lib/typography.ts:12` — `SANS_FONT = 'var(--font-figtree)...'` (should be Geist)
- `lib/typography.ts:17` — `SERIF_FONT = 'var(--font-fraunces)...'` (should be Source Serif 4)
- `components/onboarding/OnboardingScreen.tsx:30` — `DISPLAY_FONT = 'var(--font-switzer)...'` (switzer aliased to Figtree)
- `app/la-bibliotheque/[slug]/practice/PracticeClient.tsx:154,252,302` — `var(--font-switzer)` (Figtree) ×18+ inline usages
- `app/la-bibliotheque/[slug]/TopicDetail.tsx:74,111,141` — `var(--font-switzer)` (Figtree) ×10+ usages
- `app/la-methode/lesson/[id]/LessonDetailClient.tsx:63` — `DISPLAY_FONT` throughout (Figtree)
- `app/globals.css:83` — `--font-figtree` CSS variable definition
- `app/globals.css:879,880` — `hero-atmosphere-char` uses `var(--font-fraunces)` (not approved)

### 1.5 Animation: Raw CSS Keyframes vs Framer Motion

**DESIGN.md §6.2:** "Use Framer Motion for layout transitions, presence animations, gesture handling, spring physics."

**Current state:** The majority of animations are raw CSS `@keyframes` in `app/globals.css`, not Framer Motion:

| CSS animation class | Line | Type | DESIGN.md verdict |
|---|---|---|---|
| `recording-ripple` | 573 | Decorative pulsing ring | ❌ Framer Motion preferred; also §6.5 "never decorative" |
| `blink-dot` | 586 | State indicator | ✓ Acceptable; tiny state signal |
| `results-score-enter` | 598 | Entrance animation | ⚠️ Should be Framer Motion (`AnimatePresence`) |
| `ed-shimmer` | 774 | Skeleton shimmer | ✓ CSS acceptable for shimmer |
| `ed-kicker-slide` | 796 | Text slide-in | ⚠️ Should be Framer Motion |
| `ed-hero-rise` | 810 | Hero entrance | ⚠️ Should be Framer Motion |
| `ed-page-enter` | 828 | Route transition | ⚠️ Should use Framer Motion `AnimatePresence` |
| `hero-drift-{1–5}` | 951–970 | Atmospheric character drift | ❌ §6.5: "no parallax for primary content" — borderline; atmospheric not primary |

The `recording-ripple` animation also contradicts §6.5 ("decorative background elements" should not animate unless serving audio visualization).

### 1.6 Component Pattern: Borders vs Shadows

**DESIGN.md §7.2:** "No border. Soft elevation: `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)`"

Current state: `--rule-default` borders (`var(--rule-default)`) appear on cards and dividers throughout. The soft-shadow-over-border iOS pattern is not applied as a default. Examples:
- `app/globals.css:985` — `ecole-intro-block { border-left: 1px solid var(--ed-rule) }` (design language mismatch — this one is deliberate editorial column, acceptable)
- `app/globals.css:543` — `.pricing-popular-card { border: 2px solid var(--cta-primary) }` (border on card — DESIGN.md says no border on cards)

### 1.7 Top 5 Offending Files (Inline Color + Font Violations Combined)

1. **`app/la-bibliotheque/[slug]/practice/PracticeClient.tsx`** — 30+ `fontFamily: var(--font-switzer/fraunces)` + 10+ `color: '#FFFFFF'` inline
2. **`components/landing/MethodologyPreview.tsx`** — Per-couche color identity completely absent; gray beige tones erase the couche visual system
3. **`app/la-methode/lesson/[id]/LessonDetailClient.tsx`** — `DISPLAY_FONT` (Figtree) throughout; `#1A1A1A0A` skeleton colors inline
4. **`components/ecole/intro/EcoleIntro.tsx`** — Curly apostrophes + `SERIF` constant (Fraunces)
5. **`components/diagnostic/CouchesBreakdown.tsx`** — CEFR-level pastels used instead of couche-identity colors

**Inline violation count summary:**
- `style={{` usages: **1,791** across app/ + components/
- Non-trivial inline hex values (excluding `#FFFFFF`/`#1A1A1A` variants): **~60 distinct occurrences**
- `fontFamily` inline strings: **55+** in app/ + components/ (not counting lib/)

---

## Dimension 2: Apostrophe Consistency

**M2 t2 canonical:** straight apostrophe (`'` U+0027)  
**Total curly apostrophe hits:** 36 locations (user-facing strings + test copy)

### 2.1 User-Facing String Violations

All instances use curly right apostrophe (`'` U+2019) or curly left (`'` U+2018):

| File | Line | String excerpt |
|---|---|---|
| `app/password-reset/page.tsx` | 245 | `'Passwords don't match'` |
| `components/dashboard/ProgressDashboardDesktop.tsx` | 74 | `'Où vous en êtes aujourd'hui.'` |
| `components/dashboard/ProgressDashboardDesktop.tsx` | 435 | `"aujourd'hui"` |
| `components/ecole/intro/EcoleIntro.tsx` | 81 | `'that's dragging'` |
| `components/ecole/intro/EcoleIntro.tsx` | 140 | `"you're solid"` |
| `components/ecole/intro/EcoleIntro.tsx` | 151 | `"L'IA évalue chaque couche"` |
| `components/ecole/intro/EcoleIntro.tsx` | 159 | `"Jusqu'à ce que les cinq"` |
| `components/ecole/intro/EcoleIntro.tsx` | 197 | `"Là où ça s'affine"` |
| `components/ecole/intro/EcoleIntro.tsx` | 203 | `"jusqu'à l'automatisme"` |
| `components/ecole/intro/EcoleIntro.tsx` | 204 | `"l'application"` |
| `components/library/LibraryStub.tsx` | 38 | `"l'ouverture du catalogue"` |
| `components/more/MorePageClient.tsx` | 79 | `"l'examen"` |
| `components/more/MorePageClient.tsx` | 97 | `"d'utilisation"` |
| `components/speaking/SpeakingDesktop.tsx` | 115 | `"L'examinateur pose des questions"` |
| `components/speaking/SpeakingDesktop.tsx` | 118 | `"l'examinateur pose 2–4 questions"` |
| `components/speaking/SpeakingDesktop.tsx` | 130 | `"L'examinateur-agent répond"` |
| `components/speaking/SpeakingDesktop.tsx` | 138 | `"d'accepter la première réponse"` |
| `components/speaking/SpeakingDesktop.tsx` | 151 | `"d'un contre-argument"` |
| `components/speaking/Tache3Session.tsx` | 38 | `"Qu'en pensez-vous"` |
| `components/writing/WritingSubmissionClient.tsx` | 77 | `"l'anglais"` |
| `lib/vocab-copy.ts` | 237 | `"d'élargir la plage CEFR"` |
| `lib/vocab-copy.ts` | 292 | `"d'exercice, une direction"` |
| `lib/vocab-copy.ts` | 293 | `"d'exercice"` |
| `lib/data/chunks.ts` | 30 | `"S'il vous plaît"` |
| `lib/data/chunks.ts` | 40 | `"À tout à l'heure"` |
| `lib/data/chunks.ts` | 54 | `"Il n'empêche que"` |
| `lib/data/chunks.ts` | 58 | `"À l'étranger"` |
| `lib/data/chunks.ts` | 105 | `"Quoi qu'il en soit"` |

### 2.2 Test File Violations (Non-User-Facing, Lower Priority)

| File | Line | String |
|---|---|---|
| `tests/unit/ecole/LessonList.test.tsx` | 53 | `"L'école"` in test selector |
| `tests/unit/vocabulaire/PracticeDeck.test.tsx` | 23 | `"chunk's French side"` |
| `tests/unit/vocabulaire/quiz-logic.test.ts` | 27 | `"prompt chunk's English gloss"` |
| `tests/e2e/diagnostic-tache.spec.ts` | 64,70,75,93 | Arrow strings (`→`) — different char, not apostrophe |

### 2.3 Known Regex Reference

`lib/test-engine.ts:133` defines `PUNCT_SMART = /[…]/g  // smart quotes + en/em dashes` — confirms the codebase has known smart-quote/curly-apostrophe handling awareness, but the sweep hasn't reached JSX string literals.

### 2.4 Note on French Language

French typographic convention uses the curly apostrophe (`'` U+2019) in editorial French typography. However, M2 t2 established straight (`'` U+0027) as canonical for consistency in JSX string literals (avoids encoding surprises, consistent with the codebase ESLint/source convention). The 28 user-facing hits should all convert to straight.

---

## Dimension 3: Dark Mode Functional Check

### 3.1 Toggle Existence

**No dark mode toggle UI exists anywhere in the product.** Search for toggle components, theme buttons, or settings UI that controls dark mode returned zero results. The `ThemeProvider` component at `components/theme-provider.tsx` exists as a re-export of `next-themes` but is not mounted.

### 3.2 ThemeProvider Mount Status

**`components/theme-provider.tsx`** — exists, correct implementation:
```tsx
import { ThemeProvider as NextThemesProvider } from 'next-themes'
export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

**`app/layout.tsx:70–91`** — ThemeProvider is **NOT included**:
```tsx
<html lang="en" className={`${figtree.variable} ${fraunces.variable}`}>
  <body className="font-sans antialiased">
    <QueryProvider>          {/* ← no ThemeProvider here */}
      <StickyHeader />
      <TopNav />
      {children}
    </QueryProvider>
  </body>
</html>
```

The `.dark` class is never applied to `<html>`, so `@custom-variant dark (&:is(.dark *))` in globals.css is effectively dead.

### 3.3 Dark Mode Token Quality (Even If Mounted)

The `.dark` block in `app/globals.css:225–258` contains **shadcn cold oklch defaults only** — not the warm Le Méthodic dark palette:

| Token | Current `.dark` value | DESIGN.md §3.4 requires |
|---|---|---|
| `--background` | `oklch(0.145 0 0)` ≈ near-black | `--lm-bg-base: #1A1612` (warm dark) |
| `--card` | `oklch(0.145 0 0)` = same as bg | `--lm-bg-surface: #241F1A` |
| `--foreground` | `oklch(0.985 0 0)` = cold white | `--lm-text-primary: #F5F0E5` (warm cream) |
| `--primary` | `oklch(0.985 0 0)` = cold white | `--lm-brand: #D4A847` (adjusted brand ochre) |

The warm-dark `--fp-*` and `--ed-*` tokens also have **no dark variants** defined — only light values in `:root`. If `.dark` were applied today, only shadcn-consumed components would shift (to cold dark), while all `--fp-*`/`--ed-*`/inline-styled surfaces would stay in light mode values.

### 3.4 Surfaces Respecting Dark State

Since dark mode is not functional, this is a projection of what would happen if `.dark` were applied:

| Surface | Would respect `.dark`? | Notes |
|---|---|---|
| shadcn `<Button>`, `<Card>`, `<Input>` | Partial — cold shift only | Uses `--background`/`--foreground` which have `.dark` values |
| Onboarding flow | No | Uses `--fp-*` tokens, no dark variants |
| Landing page | No | Uses `--ed-*` and `--bg-canvas`, no dark variants |
| `/la-methode` lesson reader | No | Uses `DISPLAY_FONT`, `BG` hardcoded via `INK`/`PAPER` constants |
| `/la-bibliotheque` vocab browser | No | `var(--font-switzer)`, `--ed-*` tokens only |
| `/l-examen` diagnostic | No | `--ed-*` tokens, inline hex colors |
| TopNav / StickyHeader | Partial | shadcn-based components |
| Paywall | No | Recharts + `--fp-*` tokens |

**Summary: 0% of surfaces would render correctly in a functional warm dark mode.** Even fixing the ThemeProvider mount requires also defining the full warm dark token set.

### 3.5 System Preference Default

DESIGN.md §11.1: "Default: respect `prefers-color-scheme` on first visit." This is also not configured — `next-themes` would require `defaultTheme="system"` prop. Current layout has no ThemeProvider at all.

### 3.6 Playwright Capture for Dark Mode

Visual captures were **not taken** because dark mode is non-functional. There is no mechanism to apply `.dark` to the document during a Playwright run without mounting ThemeProvider and providing a toggle.

---

## Recommended Fix Ticket Breakdown

### t5 — Dark Mode Wiring (~1–2 sessions, HIGH priority)
**Scope:**
1. Mount `ThemeProvider` in `app/layout.tsx` with `attribute="class" defaultTheme="system" enableSystem`
2. Define warm dark tokens in `app/globals.css .dark` block (DESIGN.md §3.4 hex values)
3. Add dark variants for `--fp-*` and `--ed-*` aliases
4. Build `<ThemeToggle>` component (sun/moon icon, settings panel or nav dropdown)
5. Expose toggle in sidebar settings or TopNav
6. Playwright capture of all 3 canonical routes in both modes after wiring

**Hard gates:** ThemeProvider mounted, `.dark` on `<html>`, warm-dark token values (not cold oklch), toggle accessible from UI.

### t6 — Font Stack Replacement (~1 session, HIGH priority)
**Scope:**
1. Replace Figtree → Geist in `app/layout.tsx` (next/font/google swap)
2. Replace Fraunces → Cabinet Grotesk for display; Source Serif 4 for editorial
3. Update `lib/typography.ts`: `SANS_FONT` → Geist, `SERIF_FONT` → Source Serif 4
4. Update `DISPLAY_FONT` constant in `components/onboarding/OnboardingScreen.tsx`
5. Update `--font-figtree`/`--font-fraunces` CSS vars in globals.css
6. Audit all `var(--font-switzer)` and `var(--font-fraunces)` inline usages

**Hard gates:** No Figtree or Fraunces rendered on any surface. PRODUCT.md §10 compliance.

### t7 — Brand + Per-Couche Color Tokens (~1–2 sessions, HIGH priority)
**Scope:**
1. Define `--lm-brand`, `--lm-couche-{propos|plan|construction|pieges|musique}` in globals.css
2. Wire per-couche colors into `CouchesBreakdown.tsx` (replace CEFR-pastel map)
3. Wire per-couche colors into `MethodologyPreview.tsx` (replace gray/beige backgrounds)
4. Wire per-couche colors into `MethodologySection.tsx` and any other couche-labeled surface
5. Define `--lm-brand` as primary CTA color or document deliberate divergence (navy CTA may be correct — audit decision needed)
6. Update CEFR_PASTEL_MAP to be level-indicator only, separate from couche-identity colors

**Hard gates:** Each couche visually distinguishable by its canonical color on landing + diagnostic surfaces. Les Pièges Anglais visually boldest (burnt orange).

### t8 — Apostrophe Sweep (~0.5 session, MEDIUM priority)
**Scope:** Replace curly apostrophes (`'`/`'`) with straight (`'`) in 28 user-facing string locations across:
- `components/ecole/intro/EcoleIntro.tsx` (8 hits — highest concentration)
- `components/speaking/SpeakingDesktop.tsx` (5 hits)
- `lib/data/chunks.ts` (5 hits)
- `lib/vocab-copy.ts` (3 hits)
- `components/dashboard/ProgressDashboardDesktop.tsx` (2 hits)
- 5 remaining single-file hits

**Note:** Add ESLint rule or prettier config to prevent reintroduction.

### t9 — Inline Color Cleanup (~1 session, LOWER priority, can defer)
**Scope:** Replace ~60 non-trivial inline hex values with token references. Primary targets:
- `components/landing/MethodologyPreview.tsx:11–39` (5 couche `backgroundColor` hardcodes)
- `app/la-methode/lesson/[id]/LessonDetailClient.tsx:126–129` (`#1A1A1A0A` skeleton colors)
- `app/la-methode/lesson/[id]/quiz/QuizClient.tsx:277` (`#1A4A2E`/`#7A1C20` feedback colors — should use `--lm-success`/`--lm-error`)
- `components/landing/Footer.tsx:35` (`#1C1A16` — close to `--lm-bg-base` dark, should token)
- `components/landing/ProductDemo.tsx:61,83` (`#1C1A16`, `#E05252` inline)

**Defer:** The ~50 `color: '#FFFFFF'` occurrences on CTA buttons are correct (white text on dark background) — these can be replaced with `var(--primary-foreground)` but are not visually broken.

---

*Audit complete. No source files modified. Findings represent current state of main at adbe2de.*
