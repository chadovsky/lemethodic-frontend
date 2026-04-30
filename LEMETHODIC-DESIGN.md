# LEMETHODIC-DESIGN.md

**Project:** LeMethodic — TCF/TEF speaking practice for serious adult learners.
**Audience:** Adults preparing for TCF Canada (Visa-Urgent persona). Anglophones in Canada, primarily.
**Brand position:** Confident, methodical, calm. Pedagogy made visible. **Not** playful Duolingo. **Not** corporate Coursera.
**Mobile-first benchmark:** Promova.
**Owner identity:** Chadi, 7,000+ hours teaching anglophones French. La Méthode en Couches is the proprietary 4-layer diagnostic framework. The product is the methodology made interactive.

This file codifies the existing visual identity from the FE codebase (`app/globals.css`, `components/onboarding/OnboardingScreen.tsx`, `components/diagnostic/CouchesDiagnostic.tsx`, `components/Paywall.tsx`) and extends it where consistency requires. **REVIEW** markers flag decisions deferred to Chadi rather than committed unilaterally.

---

## 1. Visual Theme & Atmosphere

**Stance:** disciplined warmth. Soft pastels anchor moments where the user is making a choice or being welcomed (onboarding cards, peach loaders, butter highlights). Monochrome ink-on-paper takes over in moments where the user is being assessed or coached (diagnostic, recording, École lessons). Pastels say "you're safe here." Monochrome says "this is rigorous."

**Atmosphere keywords:** Cabinet-Grotesk-display, generous whitespace, frosted-glass cards (`backdrop-filter: blur(8px)` over `rgba(255,255,255,0.8)`), single-column mobile, no decorative chrome. Animations are short and physics-flavored (200-400ms eased) — never bouncy, never sparkly.

**Anti-patterns explicitly rejected:**
- Gamification confetti, streak fireworks, mascot animations.
- Rounded "cute" iconography. Icons are stroked SVG line work, 1.25–1.75px stroke width.
- Neon gradients, glassmorphism beyond the existing frosted card pattern.
- Emoji in UI copy. Internal docs may use them; the product does not.

**Tone of UI copy:** declarative present tense. "Your bottleneck is the top row. Fix it first." (CouchesDiagnostic.tsx:210) is the canonical voice. Not "Great job!" Not "Oops, let's try again!" The methodology is a tutor's voice, not a coach's.

---

## 2. Color Palette & Roles

All values mirror `app/globals.css` and `components/onboarding/OnboardingScreen.tsx`. Tokens are CSS variables prefixed `--fp-*` (kept from the project's pre-rename FluentPath era) and exposed to Tailwind as `fp-*` utility classes via `@theme inline`.

### Pastels — onboarding / warmth anchors

| Token | Hex | Role |
|---|---|---|
| `--fp-peach` | `#FFD8C2` | Primary onboarding accent. Loader background (`app/page.tsx:20`). Tâche 2 examiner bubble. Retry callout cards. |
| `--fp-sage` | `#D4E4D0` | **Target-band fill** in CouchesDiagnostic (70–85% TCF C1 zone). The single semantic green in the product. Also milestone-met badges. |
| `--fp-butter` | `#FFF0C2` | Rotation palette — see "Rotation palette" note below. |
| `--fp-lavender` | `#E0D4F0` | Rotation palette — see "Rotation palette" note below. |
| `--fp-sky` | `#CFE4F5` | Rotation palette — see "Rotation palette" note below. |
| `--fp-blush` | `#F5D6D6` | Rotation palette — see "Rotation palette" note below. Destructive states use the dedicated `--fp-error` token (see Neutrals → Error tokens), not blush. |

**Rotation palette (butter, lavender, sky, blush):** these four are a **rotation palette for visual variety** across lesson cards, achievements, content sections, and onboarding option lists. They are **not role-bound** — none means "warning," none means "info," none means "success." Pick one per card for visual diversity, cycle them across a sequence. The constraint is consistency-within-context: a given lesson type or achievement category should pin to one rotation color so a returning user recognizes it. Sage and peach are **excluded** from the rotation — sage is reserved for target/success semantics, peach for warmth anchors.

### Neutrals — ink-on-paper

| Token | Hex / RGBA | Role |
|---|---|---|
| `--fp-ink` | `#1A1A1A` | Body text, primary CTA fill, score-bar fill, score numbers. **The methodology's voice.** |
| `--fp-ink-soft` | `#1A1A1AB3` (70% alpha) | Secondary body copy, axis labels, descriptors under headings. |
| `--fp-ink-muted` | `#1A1A1A66` (40% alpha) | Captions, eyebrow text, inactive state, CEFR-band labels under bar scores. |
| `--fp-paper` | `#FFFFFFCC` (80% alpha) | Frosted card surface — used **with** `backdrop-filter: blur(8px)`. Never as opaque white. |
| `--fp-paper-solid` | `#FFFFFF` | Solid white. Toggle thumbs, billing-toggle active pill, top of card stacks. |

### CTA tokens

| Token | Hex | Role |
|---|---|---|
| `--fp-cta-bg` | `#1A1A1A` | Primary button background. Same as `--fp-ink`. |
| `--fp-cta-text` | `#FFFFFF` | Primary button text. |
| `--fp-cta-disabled` | `#1A1A1A4D` (30% alpha) | Disabled CTA. |

### Promoted tokens (formerly inline one-offs)

These four values were inline in the codebase at first audit; promoted to formal tokens on 2026-05-01 to make them addressable from `globals.css` and reusable.

| Token | Hex | Role | Original site |
|---|---|---|---|
| `--fp-canvas` | `#FAFAF7` | Off-white page background (distinguishes from card surface). Also score-dot border in CouchesDiagnostic. | `Paywall.tsx:128`; `CouchesDiagnostic.tsx:114` |
| `--fp-track` | `#E8E8E5` | Empty bar track / progress-track surface. | `CouchesDiagnostic.tsx:7` |
| `--fp-peach-deep` | `#E0A890` | Saturated peach. Restricted use: paywall radar fill/stroke. Not for body UI — pastels handle warmth in-app. | `Paywall.tsx:198-200` |
| `--fp-sage-deep` | `#2D8B55` | Saturated green. Restricted use: "win" microcopy badges (Save %, free-tier check icons at low alpha). Not for body UI — `--fp-sage` handles target/success semantics. | `Paywall.tsx:319, 708, 711` |
| `--fp-sage-deep-25` | `#2D8B5540` | 25% alpha variant of `--fp-sage-deep`. Free-tier check-icon background on the Paywall comparison table. | `Paywall.tsx:708` |

**Alpha-variant naming convention (added 2026-05-01):** when a single discrete alpha level is needed for an existing token, define a sibling token named `<token>-NN` where `NN` is the alpha percentage (e.g. `--fp-sage-deep-25` for 25% alpha). Use 8-character hex (e.g. `#2D8B5540`) to match the existing alpha-on-hex pattern used elsewhere in `:root` (`--fp-cta-disabled`, `--fp-ink-soft`, `--fp-ink-muted`). Do **not** use inline `color-mix()` for this — although browser support is fine, the token form is more readable, makes the alpha discoverable in `:root`, and avoids the small risk of `color-mix()` not parsing correctly inside SVG presentation attributes. Multiple alpha siblings of the same token are allowed (e.g. you could later add `--fp-sage-deep-50`); proliferation is the signal to revisit whether the base token wants a chroma adjustment instead.

**Migration note:** these tokens are documented here ahead of the `globals.css` PR. The codebase still has the inline values; promoting them is a mechanical follow-up that should land before P-115 motion work begins (so motion sites referencing these colors can use the tokens directly).

### Error / destructive tokens

| Token | Hex | Role |
|---|---|---|
| `--fp-error` | `#D08272` | **Gentle redirect**, not system failure. A desaturated terracotta sitting between `--fp-blush` (#F5D6D6) and the OKLCH shadcn destructive (`oklch(0.577 0.245 27.325)` ≈ saturated red). Use for: form validation errors, "are you sure?" confirmations, undo prompts, retry callouts that imply user action without alarm. |

**Why not raw `--fp-blush`?** Blush at full saturation reads as "soft pink decoration," not "stop." `--fp-error` carries enough chroma to register as a state signal while staying within the brand's warm-paper palette.

**Migration:** the OKLCH `--destructive` token from shadcn stays in `globals.css` for any third-party shadcn component that hardcodes it, but every LeMethodic-authored surface should use `--fp-error` instead. Audit and migrate as part of P-115 prep.

### Semantic mapping (for Claude Code agents to reach for first)

- **Primary action / methodology voice:** `--fp-ink` on `--fp-paper-solid` or `--fp-paper`.
- **Secondary action ("Maybe later"):** transparent button, `--fp-ink-muted` text.
- **Success / target-met:** `--fp-sage` (background fill) or `#2D8B55` (text/icon, see token-promotion note above).
- **Warmth / introduction / non-stakes choice:** `--fp-peach` for the dominant moment, other pastels for variety in option lists.
- **Destructive / error:** `--fp-error` (`#D08272`). Gentle redirect, not system failure. Use for form validation, undo prompts, retry callouts. The OKLCH shadcn `--destructive` is still present in `globals.css` for unmodified third-party shadcn components but should not appear in LeMethodic-authored surfaces.

### Dark mode

**Deferred to post-launch (filed as P-150 or similar).** The brand identity is light-first — the warm-paper canvas, frosted card surfaces, and ink-on-paper diagnostic only exist in light mode. The OKLCH dark-mode token set in `app/globals.css:62-95` is unused scaffold inherited from shadcn; it can stay (it costs nothing) but must not be considered a supported product surface.

When dark mode is revisited, the design challenge is non-trivial: "frosted glass over warm canvas" doesn't translate directly to a dark palette without redefining the brand atmosphere. A dark-mode pass should be treated as a brand extension, not a token recolor.

---

## 3. Typography Rules

**Font stack** (from `app/globals.css:97-100`):

```
--font-sans:    'Geist', 'Geist Fallback'
--font-mono:    'Geist Mono', 'Geist Mono Fallback'
--font-display: 'Cabinet Grotesk', 'Geist', sans-serif
```

**Cabinet Grotesk is the brand voice.** Used for:
- Every heading.
- Every score number, every CEFR badge.
- Every CTA label.
- Eyebrow / section-label uppercase text.
- Bar labels in CouchesDiagnostic.

**Geist is the body voice.** Used for:
- Multi-sentence prose (descriptors, value rows, social-proof copy).
- Form inputs.

**The split is deliberate:** Cabinet Grotesk says "this is the methodology." Geist says "this is what the methodology is telling you about yourself."

### Hierarchy table (observed values, mobile)

| Use | Font | Weight | Size | Line-height | Letter-spacing | Source |
|---|---|---|---|---|---|---|
| Hero numeric (price) | Cabinet Grotesk | 800 | 52px | 60px | -0.03em | Paywall.tsx:337-341 |
| Page title (large) | Cabinet Grotesk | 800 | 30px | 38px | (default) | Paywall.tsx:236-239 |
| Page title (medium) | Cabinet Grotesk | 800 | 26px | 34px | (default) | Paywall.tsx:139-142 |
| Stat number | Cabinet Grotesk | 800 | 20px | (default) | (default) | Paywall.tsx:540-543 |
| CTA primary | Cabinet Grotesk | 700 | 16px | (default) | -0.01em | Paywall.tsx:464-469 |
| Score number | Cabinet Grotesk | 600 | 15px | 1 | (default) | CouchesDiagnostic.tsx:135-140 |
| Body large | Geist | 500 | 15px | 23px | (default) | Paywall.tsx:88-91 (ValueRow) |
| Bar label | Cabinet Grotesk | 500 | 14px | 20px | (default) | CouchesDiagnostic.tsx:50-54 |
| Body default | Geist | 500 | 14px | 22px | (default) | Paywall.tsx:147-152 |
| Section eyebrow | Cabinet Grotesk | 700 | 13px | (default) | 0.05em uppercase | Paywall.tsx:51-58 |
| Caption / bottleneck note | Cabinet Grotesk | 500 | 13px | 20px | (default) | CouchesDiagnostic.tsx:202-208 |
| CEFR label | Cabinet Grotesk | 500 | 11px | 1 | (default) | CouchesDiagnostic.tsx:146-151 |
| Stat label / footnote | Geist | 500 | 11px | 16px | (default) | Paywall.tsx:548-553 |

### Rules

- **Ink intensity tracks importance**, not size. A 13px caption in `--fp-ink-muted` is calmer than a 13px eyebrow in `--fp-ink-muted` with `font-weight: 700` and uppercase tracking.
- **Negative letter-spacing on display text** (-0.01em CTA, -0.03em hero numerics) — never on body text.
- **Numerals use Cabinet Grotesk display weight 600-800.** Never Geist for a score, price, or stat.
- **Uppercase tracking is 0.04em–0.05em.** Never tighter (looks crammed) and never looser than 0.06em (looks unintentional).

---

## 4. Component Stylings

### Primary CTA (the "Start free trial" / "Start subscription" / "Take your diagnostic" button)

```
height: 58px
border-radius: 16px
background: --fp-ink (#1A1A1A)
color: white
font: Cabinet Grotesk 700 / 16px / -0.01em
border: none
press feedback: transform: scale(0.97) on pointerdown, scale(1) on pointerup/leave
no transition declared on transform — visual snap
```

Source: `Paywall.tsx:453-476`. Pattern: pointer-controlled scale, no Framer Motion needed yet (P-115 will replace the inline style transforms).

### Onboarding card / selectable option

```
backgroundColor: --fp-paper (#FFFFFFCC)
backdrop-filter: blur(8px)
border-radius: 24px
padding: 20px 24px
border: 2px solid transparent (unselected) / 2px solid --fp-ink (selected)
box-shadow:
  unselected: 0 2px 8px rgba(0,0,0,0.06)
  selected:   0 4px 16px rgba(0,0,0,0.08)
transform:
  press:       scale(0.96)
  selected:    scale(1.01)
  default:     scale(1)
transition: all 150ms (className: "transition-all duration-150")
```

Source: `OnboardingScreen.tsx:59-100`. **The hierarchy of feedback:** press depresses (0.96), selection lifts (1.01), idle is flat (1.0). The lift on selection is the key brand signal — selection is *embraced*, not just marked.

### Progress dots (onboarding step indicator)

```
unfilled dot: 8×8px, transparent fill, 1.5px solid --fp-ink-muted border, full radius
filled dot:   8×8px, --fp-ink fill, no border
current dot:  20×8px (pill), --fp-ink fill
transition: all 300ms (className: "transition-all duration-300")
```

Source: `OnboardingScreen.tsx:22-48`. **The pill expansion is a brand signature** — current step swells, not just colors.

### Frosted card (pricing, social proof, badges)

```
backgroundColor: --fp-paper (#FFFFFFCC)
backdrop-filter: blur(8px)
border-radius:
  large content card:  24px (pricing card, radar wrapper)
  medium content card: 16px (social proof stats)
  badge / pill:        100px (guarantee shield, fully rounded)
padding (large):  28px 24px (pricing) / 16px 20px (proof stats)
box-shadow:
  large:  0 2px 12px rgba(0,0,0,0.05)
  medium: 0 1px 8px rgba(0,0,0,0.04)
  badge:  0 1px 6px rgba(0,0,0,0.06)
```

Source: `Paywall.tsx:160-172, 502-560, 562-603`. **Three depth tiers**, never more.

### Bar diagnostic row (THE methodology component)

This is the brand's most distinctive UI element. Bars over radars, bottleneck-first prose, target zone overlay.

```
row: flex, gap 12px, vertical align center
left:   35% width — Cabinet Grotesk 500/14px/20px ink, layer name, word-break allowed
center: flex 1 — bar track:
  - 12px tall, 999px radius, --fp-track (#E8E8E5) background
  - target band: positioned absolute, left 70%, width 15%, --fp-sage fill, opacity 0.85
  - user fill:   positioned absolute, left 0, width score%, --fp-ink fill, 999px radius
  - score dot:   10×10px circle at score% position, --fp-ink fill, 2px #FAFAF7 border,
                 box-shadow 0 1px 3px rgba(0,0,0,0.18), z-index 2
right:  15% width — score (Cabinet Grotesk 600/15px ink) over CEFR (500/11px ink-muted)
```

Source: `components/diagnostic/CouchesDiagnostic.tsx`. **The score dot's white border is non-negotiable** — it makes the dot legible against any fill state (high score → dot on ink fill; low score → dot on track).

### Bar component — anti-patterns

- **No bar without a target band.** The methodology is target-relative; an unbanded bar is just a progress bar.
- **No bar gradient.** The fill is solid `--fp-ink`. Gradients soften the score; the brand wants score honesty.
- **No bar animation that bounces past the score and settles.** Ease-out only. The score is the score. (See §9 motion language for P-115.)

### Toggle / switch (free trial, billing period)

```
billing toggle (pill-style, two options):
  container: --fp-ink at 5% alpha, 14px radius, 4px padding, 4px gap
  active option: --fp-paper-solid background, 10px radius, 0 1px 6px shadow
  inactive option: transparent, --fp-ink-muted text
  transition: all 200ms

binary switch (free trial on/off):
  track: 48×28px, 14px radius, --fp-ink (on) / --fp-ink at 20% alpha (off)
  thumb: 22×22px, white, 0 1px 4px shadow, position absolute, transitions left only
  transition: background-color 200ms, left 200ms
```

Source: `Paywall.tsx:275-330, 379-410`. **Both toggles use 200ms.** Same easing, same duration — coherence.

### Disclosure (collapsed → expanded)

Chevron rotates 180deg over 200ms. Body uses a **height-spring via Framer Motion** (matching the rest of P-115's motion stack):

```tsx
<motion.div
  initial={{ height: 0, opacity: 0 }}
  animate={{ height: 'auto', opacity: 1 }}
  exit={{ height: 0, opacity: 0 }}
  transition={{ type: 'spring', stiffness: 300, damping: 32 }}
  style={{ overflow: 'hidden' }}
>
  {/* disclosure content */}
</motion.div>
```

Why Framer Motion over the CSS `grid-template-rows: 0fr → 1fr` trick: P-115 introduces Framer Motion as a project dependency, so disclosure body lives on the same animation primitive as the rest of the motion language. Coherence beats avoiding the dependency. The CSS grid trick is documented as an acceptable fallback for non-Framer surfaces (e.g. a static page). Source pattern: `Paywall.tsx:626-644` (chevron); body animation lands with P-115.

### Empty state

Observed pattern: snapshot card with placeholders + a single primary CTA (e.g. "Take your diagnostic to unlock your dashboard" — see P-100 spec). P-115 will formalize the standard:
- Single illustration or no illustration (no decorative mascots).
- Headline (Cabinet Grotesk 800/22px), one-sentence subhead, single primary CTA.
- No secondary action in empty states unless the user can actually do something else.

**Note:** this is a P-115 deliverable, not an open decision — the principles above are the standard; the component primitive lands during the motion pass.

---

## 5. Layout Principles

**Mobile-first single column.** Every reviewed component lives in a `max-w-[440px]` flex column with horizontal padding `px-5` (20px each side). The verified narrowest viewport is 380px. Tablets and desktops inherit the same column with side gutters — graceful degradation, not optimization. A real desktop layout is filed as P-115.1, post-launch (see §8 Breakpoints).

### Spacing scale (observed, in px)

The codebase uses a mix of Tailwind `gap-*` / `mt-*` and inline `px` values. Consolidating:

```
4   — tightest gap (pill content, badge internals)
6   — heading-to-subhead
8   — small block separations (gap between badge and label)
12  — bar-row internal gaps, dot stack vertical
16  — chart-to-legend, value-row to value-row
20  — section internal padding, bar-row vertical rhythm
24  — card horizontal padding, hero-to-supporting block
28  — card vertical padding (pricing card top/bottom)
32  — page bottom spacer
36  — major section breaks
40  — pricing → social proof
48  — first-section top padding from page top
```

**The pivot point is 24px.** Below 24, you're spacing within a component. At 24+, you're spacing between sections. P-115 motion language should mirror this: micro-interactions affect within-component (under 200ms), section transitions are cross-component (300-400ms).

### Vertical rhythm

- Hero block: 48px top padding, 6-8px between H1 and subhead, 16-24px to the next block.
- Within a card: 28px vertical padding (large cards), 16px between rows.
- Between cards: 24-40px depending on whether the cards are part of the same logical group (24) or distinct sections (40).

### Whitespace philosophy

The brand values whitespace over content density. **Empty space is the methodology breathing.** Anti-pattern: filling a card with sidebars, alternative CTAs, or "you might also like" rails. The product should feel under-decorated, not over-engineered.

**No formal grid system** (no columns, no gutters) — mobile single-column makes this unnecessary. If/when desktop layout ships under P-115.1, the choice between a 12-column grid and a continued centered-max-width pattern is a decision for that ticket.

---

## 6. Depth & Elevation

**Four tiers. No more.**

| Tier | Use | Shadow | Border |
|---|---|---|---|
| 0 — flush | Page background, divider lines | none | optional 1px `#1A1A1A0A`–`#1A1A1A18` hairline |
| 1 — surface | Default cards, social-proof stats, frosted badges | `0 1px 6px-8px rgba(0,0,0,0.04-0.06)` | none |
| 2 — emphasis | Selected state, large content cards (pricing, radar, score-dot) | `0 2px 12px-16px rgba(0,0,0,0.05-0.08)` | optional 2px `--fp-ink` (selected only) |
| 3 — overlay | Modal, sheet, drawer, toast (anything that floats above all page content) | `0 24px 48px -12px rgba(0,0,0,0.18)` | none; relies on shadow alone for separation |

**Backdrop blur is part of elevation, not decoration.** Tier-1 and Tier-2 surfaces both use `backdrop-filter: blur(8px)` over `--fp-paper` (80% white). This is what gives the surface its "frosted glass over warm canvas" feel against the `--fp-canvas` (`#FAFAF7`) page background.

**Tier-3 specifics.** Modals/sheets/drawers use a solid surface (`--fp-paper-solid`, not the 80% frosted `--fp-paper`) — at this elevation, you want the content unambiguously separated from what's behind it, not partially translucent. The `0 24px 48px -12px` shadow is a deliberate jump from tier-2's `0 2px 16px` — the negative spread (-12px) keeps the shadow's footprint contained while the larger Y-offset and blur read as "this is well above the page." Existing TurnReviewSheet (Tâche 2) and any future bottom sheets should be migrated to this spec as part of P-115's component pass.

**Shadow direction is always straight down** (no offset-x, no inset). The product does not have a directional light source — it has a paper plane.

---

## 7. Do's and Don'ts

### Do

- **Use Cabinet Grotesk for every numeric, every score, every CEFR badge.** The methodology speaks in numbers; the numbers wear the brand voice.
- **Put a target band on every bar.** Bars without a target are progress bars; bars with a target are diagnostics.
- **Lead with the bottleneck.** The bottleneck-first principle is in the copy ("Your bottleneck is the top row. Fix it first."). Apply it everywhere: lesson lists sort weakest-first, recommendations name the deficit, scores list ascending.
- **Use sage exactly once per screen** — the target band, the success badge, or the milestone — never multiple. Sage is a methodology signal, not a decoration.
- **Use peach as a warmth anchor** — loaders, retry callouts, examiner bubbles in T2. Once per moment, not as a background pattern.
- **Embrace whitespace.** When in doubt, add 8-16px before adding a divider.
- **Animate scale on tap (0.96-0.97).** It's the brand's tactile signature.

### Don't

- **Don't gamify.** No streak fireworks, no level-up modals, no XP bars. (Streaks are out of scope per BACKLOG.md / F-067; the absence is intentional.)
- **Don't use multiple pastels in the same view as decoration.** Onboarding cycles through pastels because each card is a different choice; a dashboard with peach + butter + sage + lavender on one screen reads like a kid's app.
- **Radar charts are restricted to conversion/sales surfaces only.** Paywall, marketing pages, and external-facing landing pages may use a radar (the existing `Paywall.tsx:160-215` is the canonical site). **Diagnostic, dashboard, and any in-app analytical view uses the bar pattern** (`components/diagnostic/CouchesDiagnostic.tsx`) per the methodology principle: bars carry a target band and a bottleneck-first sort; a radar reads as "spider visualization," which is decorative on a paywall but misleading as a coaching surface. The rule is binary: pre-conversion = radar permitted; post-conversion or coaching = bars only.
- **Don't ship dark mode in v1.** The OKLCH dark tokens in `globals.css` are scaffold, not product.
- **Don't ship emoji in product copy.** "Visa-Urgent" persona reads as serious; emoji breaks the register.
- **Don't add a third typeface.** Cabinet Grotesk + Geist is the entire palette.
- **Don't introduce gradients.** Solid fills only. (The TCF C1 sage band is a *fill at 0.85 opacity*, not a gradient.)
- **Don't break the bottleneck-first sort.** A "sort by alphabetical" or "sort by topic" toggle on the diagnostic would dilute the methodology. The order is the diagnosis.

---

## 8. Responsive Behavior

### Breakpoints

**Phase 1 is mobile-first, 380px–440px viewport.** `Paywall.tsx:131` uses `max-w-[440px]`; the P-100 DoD specifies verification at 380px. Tablet and desktop receive the same centered column with side gutters — **graceful degradation, not optimization**. This is intentional: the launch audience (Visa-Urgent persona) is overwhelmingly on phones.

A real tablet/desktop pass (split-pane diagnostic, side-rail navigation, multi-column dashboard) is filed as **P-115.1** follow-up, post-launch. Until P-115.1 lands, do not introduce `md:` / `lg:` Tailwind utilities for layout reflow — they create maintenance burden without an audience.

### Touch targets

Observed minimums and the post-resolution standard:

| Element | Observed | Standard | Source |
|---|---|---|---|
| Primary CTA | 58px tall | ≥58px | Paywall.tsx:459 |
| Onboarding card | 88px min-height | ≥88px | OnboardingScreen.tsx:64 |
| Toggle billing pill | 38px tall | **44px tall** (bump pending) | Paywall.tsx:293 |
| Switch track | 28×48px | ≥28×48px (the thumb provides the visual hit area; the gesture target is the full row) | Paywall.tsx:384-385 |
| Progress dots | 8px visual | ≥44px gesture surround | OnboardingScreen.tsx:34-43 |

**Rule:** any tappable element ≥44px in its smallest dimension (Apple HIG floor). **The 38px billing pill is a non-conformance to fix** — bump to 44px in the next pass through `Paywall.tsx`. Accessibility floor is non-negotiable.

### Text readability at 380px

All observed font sizes (11–52px) work at 380px without overflow. **Global standard: `word-break: break-word; hyphens: auto;` on every label-bearing component** (bar labels, lesson titles, milestone names, achievement names, scenario names — anything carrying user-visible French strings that can exceed its container). The `hyphens: auto` lets the browser insert soft hyphens at French syllable boundaries, which reads more naturally than mid-word breaks.

The current single application on `CouchesDiagnostic.tsx:54` is the prototype. P-115 should fold the standard into a shared `<Label>` primitive (or Tailwind utility class) so future labels inherit it automatically.

### Safe areas

iOS safe areas matter on every full-bleed surface. Standard:

- **Bottom navigation / bottom CTAs:** `padding-bottom: env(safe-area-inset-bottom)` (in addition to the layout's existing bottom padding).
- **Headers / top bars:** `padding-top: env(safe-area-inset-top)`.
- **Full-screen modals/sheets (tier-3):** both insets applied.
- **Page content (`min-height: 100dvh`):** already correct on `app/page.tsx:44-45`; `100dvh` respects safe areas natively.

**Affected components requiring an audit pass before launch:**
- `components/onboarding/OnboardingFlow.tsx` (bottom CTAs)
- `components/Paywall.tsx` (bottom CTA + Maybe later)
- `components/speaking/Tache1Session.tsx` / `Tache2Session.tsx` / `Tache3Session.tsx` (record button + review sheet)
- `components/home/HomeScreen.tsx` (any bottom nav)
- `app/diagnostic/page.tsx` (retry CTA at the bottom of layer 4)
- Any future bottom-sheet (TurnReviewSheet → migrate to tier-3 spec from §6 with `env(safe-area-inset-bottom)` baked in)
- Top headers in `/ecole`, `/progress`, `/profile`, `/more`

The audit is mechanical: grep for `position: fixed` and `position: sticky` at top/bottom edges, add the env() padding. Filed as part of P-115 prep.

---

## 9. Agent Prompt Guide

**Audience:** Claude Code (and any future LLM coding agent) generating UI for LeMethodic.

### Quick color reference

```
PRIMARY INK:           #1A1A1A          (--fp-ink)
INK SOFT (70%):        rgba(26,26,26,0.7)   (--fp-ink-soft)
INK MUTED (40%):       rgba(26,26,26,0.4)   (--fp-ink-muted)
PAPER (frosted):       rgba(255,255,255,0.8)  with backdrop-blur(8px)   (--fp-paper)
PAPER (solid):         #FFFFFF          (--fp-paper-solid)
PAGE BACKGROUND:       #FAFAF7          (--fp-canvas)
TARGET BAND (sage):    #D4E4D0          (--fp-sage)
WARMTH (peach):        #FFD8C2          (--fp-peach)
TRACK (bar empty):     #E8E8E5          (--fp-track)
PEACH DEEP (radar):    #E0A890          (--fp-peach-deep, sales surface only)
SAGE DEEP (badge):     #2D8B55          (--fp-sage-deep, sparing use)
SAGE DEEP 25% alpha:   #2D8B5540        (--fp-sage-deep-25, free-tier check bg)
ERROR (gentle):        #D08272          (--fp-error)
```

### Ready-to-use prompts

#### "Build a [foo] bar diagnostic"

> Build a horizontal bar diagnostic component for LeMethodic. Reference `components/diagnostic/CouchesDiagnostic.tsx`. Each bar has: a left-aligned label (Cabinet Grotesk 500/14px ink, 35% width), a 12px-tall track (`--fp-track`, 999px radius) with a sage target band (positioned absolute, opacity 0.85), an ink-fill (solid `--fp-ink`, 999px radius) clipped to the score percentage, a 10px score dot at the fill's right edge with a 2px `#FAFAF7` border, and a right-aligned score+CEFR label stack (15% width, score 600/15px, CEFR 500/11px ink-muted). Sort rows ascending by score (worst first). Below the bars, render a single ink-muted caption naming the bottleneck. **No bar without a target band. No fill gradient. No radar chart.**

#### "Build a [foo] CTA"

> Build a primary CTA button for LeMethodic. Full-width within its container, 58px tall, 16px border radius, `--fp-ink` background, white text, Cabinet Grotesk 700/16px with -0.01em letter-spacing. On pointerdown, scale to 0.97; on pointerup/leave, scale back to 1. No transition on the transform (snap, not ease). No hover state on touch devices. Disabled state uses `--fp-cta-disabled` (`#1A1A1A4D`) for the background.

#### "Build a [foo] selectable card"

> Build a selectable onboarding-style card for LeMethodic. Reference `components/onboarding/OnboardingScreen.tsx::OnboardingCard`. `--fp-paper` background with `backdrop-filter: blur(8px)`, 24px radius, 20px×24px padding, 88px min-height. Border 2px transparent (default) / 2px `--fp-ink` (selected). Box-shadow `0 2px 8px rgba(0,0,0,0.06)` (default) / `0 4px 16px rgba(0,0,0,0.08)` (selected). Transform `scale(0.96)` on press, `scale(1.01)` when selected, `scale(1)` idle. `transition: all 150ms`.

#### "Build a [foo] frosted card"

> Build a frosted content card for LeMethodic. `--fp-paper` background with `backdrop-filter: blur(8px)`, large radius (24px) for hero content / medium (16px) for supporting content / pill (100px) for badges. Box-shadow scales with size: `0 1px 6-8px rgba(0,0,0,0.04-0.06)` for tier-1, `0 2px 12-16px rgba(0,0,0,0.05-0.08)` for tier-2. No borders unless the surface is a selected state. Padding 28×24 (large) / 16×20 (medium) / 10×20 (badge).

#### "Animate [foo]" — motion language for P-115

**Durations**
- Micro-interactions (press, hover, toggle thumb): **150-200ms**.
- State transitions (selection, expansion, fade-in of new content): **200-300ms**.
- Section transitions (tab switch, modal open, route transition): **300-400ms**.
- **Anything ≥500ms requires explicit justification.** The brand is calm but not slow.

**Easing — committed standard (locked 2026-05-01):**
- **Default for every state transition:** `ease-out`. Snappy on enter, gentle on settle. Tailwind `ease-out` and CSS `cubic-bezier(0, 0, 0.2, 1)` are equivalent.
- **Entrance from offscreen** (route transitions, modal open, sheet slide-up, fresh content arriving): `cubic-bezier(0.16, 1, 0.3, 1)`. The "ease-out-expo"-feeling curve — content enters confidently, settles without overshoot. Tailwind alias to add: `ease-fpEnter`.
- **Press feedback** (button down/up, card press): no easing — instant `scale(0.96)` and instant return. The brand's tactile signature is *snap*, not *cushion*.
- **Bar fill on diagnostic reveal:** `ease-out`, 400ms, with 50-100ms staggered delay per row (worst-first → best-last so the eye reads the bottleneck arriving first).
- **No bounce anywhere.** No `cubic-bezier` curves with overshoot. No CSS `easing` keywords like `cubic-bezier(.68, -.55, .27, 1.55)`.

**Physics — committed:**
- Subtle spring permitted on: selected-card lift (the `scale(1.01)` settle), disclosure body height (per §4), modal/sheet entrance.
- Framer Motion config: `{ type: 'spring', stiffness: 300, damping: 32 }`. Damping ≥ 30 keeps overshoot ≤ ~2%, which is the brand ceiling. If a future component needs more characterful motion, propose new params in PR description rather than tuning silently.
- Strict ban: any spring config where damping is < 25 or stiffness > 500 — those produce visible bounce.

**Anti-motion**
- No parallax.
- No marquee / auto-scrolling content.
- No looping idle animations on charts or numbers.
- No animated gradients.
- No rotating loaders longer than 800ms — if a load takes longer than that, show a skeleton, not a spinner.

### When to deviate

The codebase is the source of truth. If this DESIGN.md and a shipped component disagree, the shipped component wins **unless** it's marked **REVIEW** above. Flag the disagreement in PR description; don't silently update DESIGN.md to match a one-off.

### When to ask Chadi

- Any new pastel-color promotion (butter/lavender/sky/blush) to a semantic role.
- Any new component category (modal, sheet, drawer, toast, banner) — these don't yet have a defined tier.
- Any tone shift in copy ("Great job!" should be flagged, not committed).
- Any animation that uses bounce or rotation.
- Any chart that isn't a bar or a single-stat number.

---

## Decision log

All 12 REVIEW items from the 2026-04-30 first draft were resolved on **2026-05-01**. Each row records the resolution and the one-line rationale. New decisions get appended below as the brand evolves.

| # | Item | Resolution | Rationale |
|---|---|---|---|
| 1 | Pastel semantics (butter/lavender/sky/blush) | **Rotation palette, not role-bound.** Pin one color per content category for recognition; cycle for variety. | Treating four pastels as semantic roles forces invented meanings ("butter = warning?") that nothing in the methodology actually requires. Rotation is honest about what they're for. |
| 2 | Destructive color | **New `--fp-error` token at `#D08272`.** Desaturated terracotta between `--fp-blush` and shadcn's saturated OKLCH red. | "Gentle redirect, not system failure" matches the brand's calm voice. Raw blush reads as decoration; raw shadcn red reads as alarm. The middle is the brand. |
| 3 | Dark mode | **Deferred to post-launch (P-150).** Light-first identity. OKLCH dark tokens left as unused scaffold. | Dark mode is a brand extension, not a recolor. The "frosted glass over warm canvas" identity doesn't translate without rethinking atmosphere. Not a v1 problem. |
| 4 | Paywall radar | **Constrained: radars only on conversion/sales surfaces.** Diagnostic, dashboard, and analytical views use the bar pattern. | The methodology's defensibility is "bottleneck-first prose + target band + ascending sort." A radar undermines that on a coaching surface; on a paywall, it's just a sales visual. |
| 5 | Token promotion (4 inline one-offs) | **Promoted:** `--fp-canvas` (#FAFAF7), `--fp-track` (#E8E8E5), `--fp-peach-deep` (#E0A890), `--fp-sage-deep` (#2D8B55). | Names match existing `--fp-*` convention. `-deep` suffix signals "saturated variant of an existing pastel, restricted use." Migration is mechanical — lands before P-115. |
| 6 | Tablet/desktop breakpoint | **Deferred. Phase 1 is mobile-first 380-440px. Tablet/desktop = graceful degradation.** Filed as P-115.1 follow-up. | Visa-Urgent persona is on phones. Adding `md:` / `lg:` reflows pre-launch creates maintenance burden without an audience. Real desktop layout is a post-launch product decision. |
| 7 | 38px toggle pill (touch target) | **Bump to 44px.** Apple HIG floor is non-negotiable. | Accessibility floor. No exceptions. The 6px addition has no visual cost. |
| 8 | Word-break for French labels | **Global standard: `word-break: break-word; hyphens: auto;` on every label-bearing component.** | French has long compounds ("Approfondissement", "Réflexes anglais"). Soft hyphens at syllable boundaries read more naturally than mid-word breaks. Fold into a `<Label>` primitive in P-115. |
| 9 | iOS safe-area padding | **Apply `env(safe-area-inset-*)` standard.** Affected components listed in §8. | Mechanical audit. Grep for `position: fixed`/`sticky` at top/bottom edges; add env() padding. Pre-launch hygiene. |
| 10 | Disclosure body animation | **Framer Motion height-spring.** `<motion.div>` with `animate={{ height: 'auto' }}`, `transition={{ type: 'spring', stiffness: 300, damping: 32 }}`. | P-115 introduces Framer Motion as a project dependency. Disclosure body should live on the same primitive as the rest of the motion language. CSS grid trick documented as fallback. |
| 11 | P-115 easing standard | **Locked.** Default `ease-out`; entrances `cubic-bezier(0.16, 1, 0.3, 1)`; press feedback `{ duration: 0 }` (instant snap, no spring); springs `{ stiffness: 300, damping: 32 }` for non-press physics; **no bounce anywhere**. Tailwind 4 utilities shipped: `ease-fp-default`, `ease-fp-enter`, `ease-fp-exit` (hyphenated per TW4 token-to-utility convention). Documented in §9; tokens live in `lib/motion.ts` and `app/globals.css`. | Single standard prevents drift across components. Damping ≥ 30 caps overshoot at ~2%, which is the brand ceiling. Press feedback is duration-zero (not a spring) to faithfully mirror the existing instant-snap UX — `pressSpring` is exported but reserved for non-button physics use cases. |
| 12 | Modal/sheet/drawer tier-3 elevation | **`0 24px 48px -12px rgba(0,0,0,0.18)` over solid `--fp-paper-solid`.** Documented in §6. | The big jump from tier-2 (0 2px 16px / 0.08) to tier-3 (0 24px 48px / 0.18) is intentional — modals must read as "well above the page." Negative spread keeps the footprint contained. |

---

**Source files:** `app/globals.css` · `app/page.tsx` · `components/onboarding/OnboardingScreen.tsx` · `components/diagnostic/CouchesDiagnostic.tsx` · `components/Paywall.tsx`.
**Format basis:** the 9-section pattern from VoltAgent/awesome-design-md. Content is LeMethodic-specific and codified from the existing repo, not imported from external systems.
**Status:** all 12 review items from the first draft are resolved. Ready for P-115.
