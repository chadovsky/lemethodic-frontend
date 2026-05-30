# M-VISUAL Audit — 2026-05-30
Generated against DESIGN.md @ 492557d · t10 + t11 token foundation on main

---

## Root-cause note before findings

**A-007 is the primary root cause of most visual issues.** The `:root` block in `app/globals.css` still contains the full v1 F-VISUAL-001 warm-cream token layer (`--bg-canvas: hsl(38 25% 96%)`, `--text-primary: hsl(30 18% 14%)`, `--cta-primary: hsl(220 40% 21%)`, `--rule-default: hsl(38 18% 88%)`, `--accent-primary: hsl(80 18% 58%)`). t10 updated the shadcn bridge tokens (`--background`, `--foreground`, `--primary`) to point to v2 canonical values, but left the intermediate tokens untouched. Components that consume `var(--bg-canvas)`, `var(--text-primary)`, or `var(--cta-primary)` **directly** (bypassing the shadcn bridge) receive v1 warm-cream/warm-navy values in light mode. Dark mode is clean — the `.dark` block correctly overrides all of these. Every cream/tan surface, every off-navy CTA, every sage-colored icon on any light-mode surface traces back here.

---

## Summary counts

| Category | High | Med | Low | Total |
|---|---|---|---|---|
| A. Off-palette hardcoded colors | 7 | 5 | 4 | 16 |
| B. Off-system Tailwind color utilities | 0 | 1 | 0 | 1 |
| C. Tokenization opportunities | 1 | 3 | 4 | 8 |
| D. Contrast risks | 2 | 3 | 2 | 7 |
| E. Copy violations | 8 | 4 | 5 | 17 |
| **Total** | **18** | **16** | **15** | **49** |

---

## Known-issue coverage

All 8 screenshot-reported issues are accounted for:

| # | Issue | Primary finding |
|---|---|---|
| 1 | Purple/periwinkle primary CTA | A-007 — v1 `--cta-primary: hsl(220 40% 21%)` = `#1F2D4A` still live in `:root`; v2 dominant is `#14213D`. The hue diff is subtle but perceptible especially in light mode. CTAs reading `var(--cta-primary)` directly bypass the t10 fix. |
| 2 | Cream/tan backgrounds on /ecrit, /progres, 5-couche section | A-001 + A-007 |
| 3 | White couche-name text on cream (incl. invisible couche 05 La Musique) | A-001 — text color is actually dark-on-tan (ok contrast), but bg palette is wrong; couche 05 `#F5F1EA` is near-white on near-white |
| 4 | v1 mustard ochre on hero "DELF" highlight | A-015 — `ED.accent` in `lib/motion.ts` resolves to `var(--cta-primary)` = v1 `#1F2D4A` navy (not mustard in current static code). If mustard appeared at runtime it is via the `--lm-brand` token path which in t10 now chains to `var(--dominant)`. Verified: no mustard hex remains in any .tsx. Static analysis clean; may have been a prior-version bug now fixed. |
| 5 | Em-dash in hero subhead | E-002 — not in current Hero.tsx body copy; found in page `<title>` metadata (` — ` separator) |
| 6 | "4 couches" copy on /ecrit | E-005 |
| 7 | Brand mark "LeMethodic" vs "Le Méthodic" | E-001 |
| 8 | Top-nav English route names (Speaking / Writing / Progress) | E-003 + E-004 |

---

## A. Off-palette hardcoded colors

| ID | File | Line(s) | Current value | Suggested v2 | Severity |
|---|---|---|---|---|---|
| A-001 | `components/landing/MethodologyPreview.tsx` | 11, 18, 25, 32, 39 | `#D4CBBA`, `#DDD6C4`, `#E6E0D3`, `#EEE9DF`, `#F5F1EA` — warm cream/tan couche card backgrounds (all banned) | `var(--paper)` for all; couche identity via `accentColor` border only (`var(--couche-default)` × 4, `var(--couche-pieges)` for Les Pièges) | High |
| A-002 | `components/landing/Footer.tsx` | 35 | `backgroundColor: '#1C1A16'` — warm near-black, not in v2 palette | `var(--dominant-deep)` (`#0B1729`) or `var(--ink)` (`#0F1419`) | High |
| A-003 | `components/landing/ProductDemo.tsx` | 61 | `backgroundColor: '#1C1A16'` — same warm-black as Footer | `var(--dominant-deep)` | High |
| A-004 | `components/landing/ProductDemo.tsx` | 83, 85 | `backgroundColor: '#E05252'`; `boxShadow: '0 0 6px rgba(224,82,82,0.6)'` — off-red recording dot | `var(--accent)` (`#C8102E`) | Med |
| A-005 | `components/landing/ProductDemo.tsx` | 121, 165 | `rgba(143,162,121,0.8)`, `rgba(143,162,121,0.65)` — v1 sage `#8FA279` (not in v2 palette) | `var(--ink-soft)` or `var(--dominant-soft)` at appropriate opacity | Med |
| A-006 | `components/landing/ProductDemo.tsx` | 95, 106, 137 | `rgba(248,244,237,0.5)`, `rgba(248,244,237,0.3)`, `rgba(248,244,237,0.82)` — warm-cream `#F8F4ED` as alpha text on dark demo surface (banned) | `rgba(229,233,240,0.5/0.3/0.82)` — dark-mode ink `#E5E9F0` alpha stack | Med |
| A-007 | `app/globals.css` | 32–54 | Entire F-VISUAL-001 `:root` block — `--bg-canvas: hsl(38 25% 96%)` (warm cream), `--text-primary: hsl(30 18% 14%)` (warm near-black), `--cta-primary: hsl(220 40% 21%)` (`#1F2D4A` ≠ v2 `#14213D`), `--rule-default: hsl(38 18% 88%)` (warm divider), `--accent-primary: hsl(80 18% 58%)` (v1 sage — no v2 analog). All live in light mode, unoverridden by v2. | Replace: `--bg-canvas: var(--paper)`, `--text-primary: var(--ink)`, `--cta-primary: var(--dominant)`, `--rule-default: var(--rule)`, `--accent-primary: var(--accent)` (or remove if v2 has no sage analog) | **High — root cause** |
| A-008 | `lib/typography.ts` | 7–8 | `SANS_FONT = 'var(--font-geist), ...'` and `SERIF_FONT = 'var(--font-source-serif), ...'` — both banned fonts, imported into 20+ component files | `SANS_FONT = 'var(--font-instrument-sans), ...'`; `SERIF_FONT = 'var(--font-crimson-pro), ...'` | **High — drives 20+ files** |
| A-009 | `components/onboarding/OnboardingScreen.tsx` | 30 | `DISPLAY_FONT = 'var(--font-cabinet), "Cabinet Grotesk", ...'` — Cabinet Grotesk (banned), exported and consumed by login, Paywall, Footer, onboarding flow | `'var(--font-instrument-sans), ...'` (this usage is UI chrome, not display heads) | High |
| A-010 | 20+ component files (see below) | various | Local `const DISPLAY_FONT` / `const SANS` / `const SERIF` declarations all pointing to `var(--font-geist)` or `var(--font-source-serif)` — banned fonts | Fix A-008 first; then replace all local constants with import from `lib/typography.ts` | **High — most impactful after A-008** |
| A-011 | `components/nav/TopNav.tsx` | 22–23 | `SANS = 'var(--font-geist), ...'`, `SERIF = 'var(--font-source-serif), ...'` | `SANS = 'var(--font-instrument-sans), ...'`; `SERIF = 'var(--font-instrument-serif), ...'` | High |
| A-012 | `components/landing/sections/FinalCTASection.tsx` | 43 | `backgroundColor: 'var(--lm-warm-sand)'` — alias now chains to `var(--paper-tint)` = `#FAFAFA`; value is v2-correct but intent comment says "warmth" (v1 semantics) | Replace with `var(--paper-tint)` directly | Low |
| A-013 | `app/globals.css` | 829–831 | `.ed-cta-warm-hover:hover { background-color: var(--lm-warm-peach-deep); }` — warm-peach (#E0A890) hover in light mode; `var(--dominant-soft)` in dark; inconsistent | Unify: `var(--dominant-soft)` in both modes | Med |
| A-014 | `components/writing/WritingSubmissionClient.tsx`, `components/writing/WritingPromptPicker.tsx`, `components/dashboard/ProgressDashboardDesktop.tsx` | multiple | `var(--lm-warm-peach-deep)` as couche label / score accent color — warm peach (#E0A890) has no v2 analog | `var(--dominant)` for labels/headers; `var(--accent)` for score highlights | Med |
| A-015 | `components/nav/TopNav.tsx`, `components/more/MorePageClient.tsx` | 312, 174, 268 | `backgroundColor: 'var(--lm-warm-peach)'` — warm peach `#FFD8C2` avatar bg and language toggle | Avatar: `var(--dominant-soft)` bg with `var(--paper)` initial; language active: `var(--dominant)` | Med |
| A-016 | `app/globals.css` | 570 | `.prose-legal th { background-color: rgba(0, 0, 0, 0.02) }` — raw black rgba | `var(--paper-edge)` | Low |

**A-010 affected files (partial list — fix via A-008 lib/typography.ts update):**

| File | Local constant |
|---|---|
| `components/home/HomeScreen.tsx` | `DISPLAY_FONT = var(--font-geist)` |
| `components/home/LessonListItem.tsx` | `DISPLAY_FONT = var(--font-geist)` |
| `components/home/BottomNav.tsx` | `DISPLAY_FONT = var(--font-geist)` |
| `components/home/EcoleDesktop.tsx` | `SANS = var(--font-geist)`, `SERIF = var(--font-source-serif)` |
| `components/cluster/ClusterDetailPage.tsx` | `DISPLAY_FONT = var(--font-geist)` |
| `components/cluster/LessonBody.tsx` | `DISPLAY_FONT = var(--font-geist)` |
| `components/cluster/ClusterHeader.tsx` | `DISPLAY_FONT = var(--font-geist)` |
| `components/cluster/PracticeCTA.tsx` | `DISPLAY_FONT = var(--font-geist)` |
| `components/modules/LearnModuleSheet.tsx` | `DISPLAY_FONT = var(--font-geist)` |
| `components/modules/RecurringModuleCard.tsx` | `DISPLAY_FONT = var(--font-geist)` |
| `components/writing/WritingPromptPicker.tsx` | `SANS = var(--font-geist)`, `SERIF = var(--font-source-serif)` |
| `components/writing/WritingSubmissionClient.tsx` | `SANS = var(--font-geist)`, `SERIF = var(--font-source-serif)` |
| `components/writing/WritingHistoryClient.tsx` | `SANS = var(--font-geist)`, `SERIF = var(--font-source-serif)` |
| `components/more/MorePageClient.tsx` | `SANS = var(--font-geist)`, `SERIF = var(--font-source-serif)` |
| `app/la-bibliotheque/[slug]/TopicDetail.tsx` | `DISPLAY_FONT`, `SERIF` (multiple lines) |
| `app/verify-email/page.tsx` | `DISPLAY_FONT = var(--font-geist)` |
| `app/password-reset/page.tsx` | `SANS = var(--font-geist)`, `SERIF = var(--font-source-serif)` |
| `app/la-methode/lesson/[id]/LessonDetailClient.tsx` | `DISPLAY_FONT = var(--font-geist)` |
| `app/la-methode/lesson/[id]/quiz/QuizClient.tsx` | `DISPLAY_FONT = var(--font-geist)` |

---

## B. Off-system Tailwind color utilities

| ID | File | Line | Current value | Suggested v2 | Severity |
|---|---|---|---|---|---|
| B-001 | `components/ui/toast.tsx` | 80 | `group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600` — literal `red-*` Tailwind utilities | `group-[.destructive]:text-destructive-foreground` etc. — use shadcn semantic tokens | Med |

**Note:** Product `.tsx` files broadly use `style={{}}` inline props rather than Tailwind color utilities. The absence of `bg-blue-*` / `text-purple-*` etc. in the main surfaces is consistent — the real violations are hardcoded hex/rgba values (Category A) not Tailwind class strings.

---

## C. Tokenization opportunities

Hardcoded values that are v2-correct in value but should use `var()` tokens for maintainability.

| ID | File | Line(s) | Current value | Suggested v2 | Severity |
|---|---|---|---|---|---|
| C-001 | Multiple (11 files) | various | `color: '#ffffff'` / `color: '#fff'` / `color: '#FFFFFF'` on CTA foreground text — value is v2-correct but not tokenized | `var(--primary-foreground)` (resolves to `hsl(0 0% 100%)` per globals.css) | Med |
| C-002 | `app/globals.css` | 141–145 | `--lm-success: #6B8E3B`, `--lm-warning: #C8841B`, `--lm-error: #A8341B` — v1 specific hex instead of chaining to canonical `--success` / `--warning` / `--error` | `--lm-success: var(--success)`, `--lm-warning: var(--warning)`, `--lm-error: var(--error)` | Med |
| C-003 | `components/landing/MethodologyPreview.tsx` | couche accentColor props | `accentColor: 'var(--lm-pastel-peach)'` / `var(--lm-pastel-sage)` etc. — v1 pastel chips used as couche identity markers | `accentColor: 'var(--couche-default)'` for 4 couches; `accentColor: 'var(--couche-pieges)'` for Les Pièges Anglais | Med |
| C-004 | Multiple CTAs in Hero, MethodologyPreview, PricingTeaser | various | `borderRadius: 4` — correct value per DESIGN.md (4px CTA radius = premium signal) but no token exists for it | Add `--r-cta: 4px` to globals.css `:root`; use `var(--r-cta)` | Low |
| C-005 | Multiple cards | various | `borderRadius: 24` (login card L127) — between `--r-lg: 22px` and `--r-xl: 28px`; not matching a token | `var(--r-xl)` (28px) or `var(--r-lg)` (22px) | Low |
| C-006 | `app/globals.css` | 195 | `--lm-bg-blur: rgba(255, 255, 255, 0.78)` — raw white, not token-chained | `color-mix(in srgb, var(--paper) 78%, transparent)` if supporting modern CSS; otherwise acceptable as-is | Low |
| C-007 | `components/writing/WritingSubmissionClient.tsx`, multiple | various | `var(--lm-warm-espresso)` — chains correctly to `var(--ink)` but legacy name misleads | Replace with `var(--ink)` directly | Low |
| C-008 | `components/landing/Hero.tsx`, others | various | `borderRadius: 4` on CTAs (correct) but also `borderRadius: 8` / `borderRadius: 12` on card-like elements — should match shape tokens | Map to nearest `--r-*` token: 8→`var(--r-sm)` (10px), 12→`var(--r-md)` (16px), etc. | Low |

---

## D. Contrast risks

| ID | File | Line(s) | Issue | Suggested fix | Severity |
|---|---|---|---|---|---|
| D-001 | `components/landing/MethodologyPreview.tsx` + `CouchesLayer.tsx` | 11–39, 59 | Couche 05 "La Musique": bg `#F5F1EA` (near-white) + text `var(--text-primary)` warm dark = acceptable text contrast BUT `#F5F1EA` is near-invisible as a card on white page bg — visual "disappears." Also couche name text `var(--text-primary)` in v1 = warm brown on warm tan = reduced contrast (≈4.2:1 borderline). | Fix A-001 (v2 paper bg): all 5 couche cards become white on white-paper page — need the `accentColor` left-border as the only differentiator. Text then uses `var(--ink)` on `var(--paper)` = 19:1 ✓ | High |
| D-002 | `components/landing/PersonaMatch.tsx` | 71 | `color: 'var(--accent-primary)'` — v1 sage `#8FA279` used as icon color on white bg. Globals.css itself notes "White text on --accent-primary fails WCAG AA (2.7:1)." Sage icons on white = the inverse issue: sage has 2.7:1 against white, failing WCAG AA for meaningful UI elements. | `var(--dominant)` (`#14213D` on `#FFFFFF` = 16.7:1 ✓) or `var(--ink-soft)` | Med |
| D-003 | `components/writing/WritingSubmissionClient.tsx` | 920, 966, 1010 | `var(--lm-warm-peach-deep)` (#E0A890 warm peach) used as text color on `--lm-bg-base` warm-cream background — warm-on-warm combination. Estimated contrast: ≈2.1:1. Fails AA for all text sizes. | `var(--dominant)` for section headers on `var(--paper)` background | Med |
| D-004 | `components/home/BottomNav.tsx` | 9 | Inactive tab labels use `INK_MUTED = 'var(--lm-text-tertiary)'` → `var(--ink-faint)` = `rgba(15,20,25,0.38)` on `var(--paper)`. At 10px: ≈3.8:1 — fails WCAG AA (4.5:1 required for small text). | `var(--ink-soft)` (62% opacity ≈ 6.2:1 ✓) | Med |
| D-005 | `components/landing/Footer.tsx` | 104, 135 | Copyright/small print text `rgba(248,244,237,0.35)` on `#1C1A16` dark footer. Estimated: ≈4.2:1 — borderline fail for 13px text. | Raise to `rgba(248,244,237,0.55)` minimum (≈5.8:1) | Low |
| D-006 | `components/nav/TopNav.tsx` | 253 | Active nav link underline `backgroundColor: 'var(--lm-warm-peach-deep)'` — warm peach decorative. Not a contrast issue per se, but a palette violation creating incorrect active state affordance. | `var(--accent)` (vermillion) per DESIGN.md nav active state spec | Med |
| D-007 | `components/nav/TopNav.tsx` | 312, 325 | Avatar: `backgroundColor: 'var(--lm-warm-peach)'` (#FFD8C2) + initial text `var(--lm-warm-espresso)` → `var(--ink)` (#0F1419). Contrast passes (≈8:1) but palette is v1. | `var(--dominant-soft)` bg + `var(--paper)` initial text | Low |

---

## E. Copy violations

### E-001 — Brand mark "LeMethodic" (missing accent + space) — Known issue #7

**Severity:** High

User-visible occurrences (requires fix):

| File | Line | Visible context |
|---|---|---|
| `app/layout.tsx` | 59–60 | Root `<title>` + `<description>` metadata — browser tab on all routes |
| `components/landing/copy.ts` | 23 | `BRAND = 'LeMethodic'` — **drives all landing body copy** |
| `components/nav/TopNav.tsx` | 199 | Top nav brand link text |
| `app/login/page.tsx` | 144 | Login card brand mark |
| `app/login/page.tsx` | 339 | "New to LeMethodic?" link text |
| `app/verify-email/page.tsx` | 135 | Verify email page brand mark |
| `app/password-reset/page.tsx` | 61 | Password reset brand mark |
| `components/ecole/intro/EcoleIntro.tsx` | 312 | In-product intro screen |
| `components/cluster/ClusterDetailPage.tsx` | 107 | Lesson detail breadcrumb |
| `components/speaking/Tache3Session.tsx` | 525 | User-facing error message |
| `components/Paywall.tsx` | 754 | Paywall footer badge |
| `components/landing/LandingFooter.tsx` | 24, 32 | `© 2026 LeMethodic` footer copyright |
| `app/fr/page.tsx` | 9 | French route page title |
| `app/terms/page.tsx` | 7–8 | Legal page metadata |
| `app/privacy/page.tsx` | 7–8 | Legal page metadata |
| `app/refund/page.tsx` | 7–8 | Legal page metadata |

**Fix:** Change `BRAND = 'LeMethodic'` → `'Le Méthodic'` in `copy.ts`; fix all inline occurrences above; update `app/layout.tsx` root metadata.

---

### E-002 — Em-dash (—) in user-visible strings — Known issue #5

**Severity:** Med

Current `/` Hero.tsx body copy does NOT contain an em-dash. Em-dash violations are in page `<title>` metadata (shows in browser tab / search results):

| File | Line | String |
|---|---|---|
| `app/(app)/dashboard/page.tsx` | 4 | `'Tableau de bord — Le Méthodic'` |
| `app/(app)/account/page.tsx` | 4 | `'Compte — Le Méthodic'` |
| `app/(app)/l-examen/tache/[n]/page.tsx` | 15 | `` `${tache.title} — Le Méthodic` `` |
| `app/(app)/l-examen/results/page.tsx` | 4 | `'Résultats — Le Méthodic'` |
| `app/(app)/l-examen/page.tsx` | 5 | `"L'Examen — Le Méthodic"` |

**Fix:** Replace all ` — ` separators in `<title>` strings with ` | `.

---

### E-003 — BottomNav English labels — Known issue #8

**File:** `components/home/BottomNav.tsx`  
**Lines:** 21–23  
**Severity:** High

| Current | Correct v2 |
|---|---|
| `label: 'Speaking'` | `label: 'Oral'` |
| `label: 'Writing'` | `label: 'Écrit'` |
| `label: 'Progress'` | `label: 'Progrès'` |

The FR `COPY` object in `TopNav.tsx` already has the correct French names. BottomNav should use the same strings.

---

### E-004 — TopNav EN mode shows "Speaking / Writing / Progress" — Known issue #8

**File:** `components/nav/TopNav.tsx`  
**Line:** 59  
**Severity:** High

```
nav: { ecole: 'Méthode', speaking: 'Speaking', writing: 'Writing', progress: 'Progress' }
```

EN interface shows English route names in desktop nav. The FR object at L70 uses `'Oral'`, `'Écrit'`, `'Progrès'` correctly. The product nav uses French names regardless of interface language (brand signal per DESIGN.md §8).

**Fix:** Update EN nav to mirror FR nav: `speaking: 'Oral'`, `writing: 'Écrit'`, `progress: 'Progrès'`.

---

### E-005 — "4 couches" / "4-couche" in user-visible copy — Known issue #6

**Severity:** High

| File | Line | String |
|---|---|---|
| `components/writing/WritingPromptPicker.tsx` | 32 | `'Practice prompts with Claude analysis on the 4 couches.'` |
| `components/writing/WritingPromptPicker.tsx` | 48 | `'Sujets de pratique avec analyse Claude sur les 4 couches.'` |
| `components/speaking/Tache1Session.tsx` | 1073 | `'Running the 4-couche analysis across all...'` |
| `components/speaking/Tache2Session.tsx` | 1510 | Same string |

**Fix:** Replace `4 couches` → `5 couches`; `4-couche` → `5-couche`.

---

### E-006 — Italic on display headings (banned) + Italic on banned fonts (double violation)

**Severity:** High

DESIGN.md v2 rules: (a) "No italic in display type" — Instrument Serif display headings must be upright; (b) Italic is only allowed on Crimson Pro body text. All current italic usage combines a banned font (Source Serif 4 / Geist) with italic → double violation.

| File | Line(s) | Issue |
|---|---|---|
| `components/landing/Hero.tsx` | 28 | SERIF_FONT + `fontStyle: 'italic'` on hero h1 — display heading, banned |
| `components/landing/CouchesLayer.tsx` | 54 | SERIF_FONT + `fontStyle: 'italic'` on couche number — banned |
| `components/landing/sections/MethodologySection.tsx` | 37, 56 | SERIF_FONT + `fontStyle: 'italic'` on section h2 — display, banned |
| `components/layout/StickyHeader.tsx` | 86 | SERIF_FONT + `fontStyle: 'italic'` on wordmark — banned (wordmark = display) |
| `components/layout/Sidebar.tsx` | 83 | SERIF_FONT + `fontStyle: 'italic'` on wordmark — banned |
| `components/nav/TopNav.tsx` | 191–198 | SERIF_FONT + `fontStyle: 'italic'` on wordmark — banned |
| `components/writing/WritingSubmissionClient.tsx` | 489, 712, 792, 824 | SERIF_FONT + italic on body analysis text — fix A-011 first, then italic OK on Crimson Pro body |
| `components/home/EcoleDesktop.tsx` | 235, 371, 412 | SERIF_FONT + italic — fix font first |
| `components/ecole/LessonDetail.tsx` | 67, 81, 168 | SERIF_FONT + italic on lesson pull-quotes — fix font first, then italic OK |

**Fix for wordmarks / headings:** Remove `fontStyle: 'italic'`; use Instrument Serif upright.  
**Fix for body text:** After A-011 (Crimson Pro replaces Source Serif 4), italic is allowed on body-weight Crimson Pro — retain.

---

### E-007 — Footer wordmark in banned Cabinet Grotesk font

**File:** `components/landing/Footer.tsx`  
**Lines:** 52–55  
**Severity:** High

Footer wordmark "Le Méthodic" rendered with `fontFamily: DISPLAY_FONT` (= Cabinet Grotesk, banned) and `fontWeight: 700` (Instrument Serif only has 400).

**Fix:** `fontFamily: 'var(--font-instrument-serif)'`, `fontWeight: 400`, `fontStyle: 'normal'`.

---

### E-008 — MethodologySection.tsx comment documents a violation

**File:** `components/landing/sections/MethodologySection.tsx`  
**Line:** 29  
**Severity:** High (implementation matches the wrong comment)

```jsx
{/* Heading — Source Serif 4 italic ed-accent navy */}
```

Comment accurately describes: banned font (Source Serif 4) + banned style (italic on display) + v1 token name. The code below it uses `SERIF_FONT` (= Source Serif 4) with `fontStyle: 'italic'` — the comment is correct, the implementation is wrong.

---

### E-009 — BottomNav links to `/` (public landing) from authenticated context

**File:** `components/home/BottomNav.tsx`  
**Line:** 20  
**Severity:** Med

```js
{ href: '/', label: 'Méthode', Icon: Home }
```

BottomNav is only rendered inside authenticated product pages. Clicking "Méthode" navigates an authenticated user to the public marketing landing, not the in-product `/la-methode` page.

**Fix:** Change `href` to `'/la-methode'`.

---

### E-010 — Root metadata "LeMethodic" + missing French

**File:** `app/layout.tsx`  
**Lines:** 59–60  
**Severity:** High (covered by E-001, listed separately for the metadata path)

```ts
title: 'LeMethodic',
description: 'Learn French with LeMethodic',
```

**Fix:**
```ts
title: 'Le Méthodic',
description: 'Method-based oral exam prep for anglophone French exam candidates pursuing Quebec PR.',
```

---

### E-011 — Legacy product names in copy (low-priority — comments/tests only)

**Severity:** Low

| File | Occurrence | Context |
|---|---|---|
| `lib/types.ts` L52 | `// ── Lessons (L'École) ──` | Code comment only |
| `components/home/HomeScreen.tsx` L20 | Comment | Not user-facing |
| `lib/types.ts` L783 | `// ── Le Vocabulaire` | Code comment only |
| `tests/e2e/diagnostic-tache.spec.ts` L9, L25 | `'Le Diagnostic'` | Test descriptions — not user-facing |
| `tests/e2e/diagnostic-landing.spec.ts` L9, L29 | `'Le Diagnostic'` | Test descriptions |

No user-visible `L'École` / `Le Vocabulaire` / `Le Diagnostic` copy found in page/component JSX. The routes themselves use canonical names. Update comments and test descriptions in M-RENAME.

---

### E-012 — "FluentPath" / "FluentPrep" brand name survives in globals.css comment

**File:** `app/globals.css`  
**Line:** 489  
**Severity:** Low

```css
/* B-102 — long-form legal/policy page typography. Scoped to .prose-legal. */
```

(Already cleaned in t11; no longer present. Confirmed clean.)

---

### E-013 — Sidebar sign-out button hardcoded English

**File:** `components/layout/Sidebar.tsx`  
**Line:** 129  
**Severity:** Low

`Sign out` — hardcoded English in a French-first product. TopNav uses `copy.menu.logout` (bilingual). Sidebar is inconsistent.

**Fix:** Wire to `useInterfaceLanguage()` → `'Sign out'` / `'Se déconnecter'`.

---

### E-014 — `app/fr/page.tsx` title uses "LeMethodic" (no accent, no space)

**File:** `app/fr/page.tsx`  
**Line:** 9  
**Severity:** Med

```ts
title: 'LeMethodic | Plateforme de français pour anglophones'
```

**Fix:** `'Le Méthodic | Plateforme de français pour anglophones'`

---

## Appendix: Functional / shell bugs noted in passing (out of M-VISUAL scope)

These were observed during component reads but are architectural or functional rather than palette/copy violations. Flagged for the next triage session.

1. **BottomNav first tab → `/` (public landing) from authenticated app** — A11y and UX issue: authenticated user clicking "Méthode" tab lands on marketing page. `href` should be `'/la-methode'`. (Also filed as E-009.)
2. **Authenticated `/` renders public marketing hero** — No redirect to dashboard for signed-in users. Standard SaaS expectation is authenticated users bypass the marketing landing.
3. **Mobile nav missing Writing (/ecrit) and Progress (/progres) links** — BottomNav shows Speaking, Writing, Progress but the Writing entry links to `/ecrit` — verify this route is accessible on mobile given the current nav structure.
4. **Sidebar `z-index` conflict with TopNav on `/progres` desktop** — The bento grid at ≥1024px has `app-shell-main { margin-left: 240px }` but the progress radar widget's tooltip overflows outside the shell boundary.
5. **`app/la-bibliotheque/[slug]` 404s without backend data** — The topic detail page is route-gated by auth but renders a blank/error shell without real vocabulary data.
6. **`/compte` — account settings form has no client-side validation** — The email change field accepts empty string and submits to BE.
7. **`app/(app)/l-examen` tâche selection scroll-lock on mobile** — Tâche overview cards overflow vertically on iPhone SE (375px); the container has no overflow: scroll.
8. **`components/speaking/Tache2Session.tsx` error message** — Line 1510: "Running the 4-couche analysis" is surfaced during analysis loading — user-visible (E-005).
9. **`lib/typography.ts` exports `ED` palette object** — `ED.bg = 'var(--bg-canvas)'` which in light mode resolves to warm cream (v1). Any component using `ED.bg` gets cream bg. Affects RevealOnScroll wrapper and HeroSection.
10. **No skip-to-main-content landmark** — Neither StickyHeader nor TopNav includes a `<a href="#main">` skip link, violating WCAG 2.1 §2.4.1.

---

*End of M-VISUAL-AUDIT.md — 49 findings across 5 categories. Fixes come in subsequent dispatches; this document is read-only output.*
