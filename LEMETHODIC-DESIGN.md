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
| `--fp-butter` | `#FFF0C2` | Onboarding card variant. **REVIEW:** no current canonical use — Chadi to confirm if butter is "warning/in-progress" or just a third pastel option. |
| `--fp-lavender` | `#E0D4F0` | Onboarding card variant. **REVIEW:** as above. |
| `--fp-sky` | `#CFE4F5` | Onboarding card variant. **REVIEW:** as above. |
| `--fp-blush` | `#F5D6D6` | Onboarding card variant. **REVIEW:** as above; not yet bound to "error/destructive" — destructive currently uses the OKLCH shadcn `--destructive` token. |

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

### One-off colors observed in the codebase (NOT yet tokenized)

These appear inline and should be promoted to tokens before P-115. **REVIEW** each.

| Value | Where | Suggested token |
|---|---|---|
| `#FAFAF7` | Paywall main background (`Paywall.tsx:128`); ScoreDot border in CouchesDiagnostic | `--fp-canvas` (off-white page background, distinguishes from card surface) |
| `#E8E8E5` | Bar track in CouchesDiagnostic | `--fp-track` (the empty-bar / progress-track surface) |
| `#E0A890` | Radar fill + stroke in Paywall (`#E0A890`, 35% opacity fill) | `--fp-peach-deep` (a saturated peach used only against monochrome charts — currently single-use) |
| `#2D8B55` | "Save 43%" badge in billing toggle, also free-tier check icon at 25% alpha | `--fp-sage-deep` (a saturated green used only for "win" microcopy — currently single-use) |

### Semantic mapping (for Claude Code agents to reach for first)

- **Primary action / methodology voice:** `--fp-ink` on `--fp-paper-solid` or `--fp-paper`.
- **Secondary action ("Maybe later"):** transparent button, `--fp-ink-muted` text.
- **Success / target-met:** `--fp-sage` (background fill) or `#2D8B55` (text/icon, see token-promotion note above).
- **Warmth / introduction / non-stakes choice:** `--fp-peach` for the dominant moment, other pastels for variety in option lists.
- **Destructive / error:** **REVIEW** — currently inherits shadcn's OKLCH `--destructive` (`oklch(0.577 0.245 27.325)`, a saturated red). Chadi to decide if the brand wants a softer destructive (e.g. `--fp-blush` for non-irreversible warnings, OKLCH red only for "are you sure?" confirmations).

### Dark mode

`app/globals.css:62-95` defines a full OKLCH dark-mode token set, but the LeMethodic `--fp-*` tokens are **not** dark-mode aware — they stay the same in `.dark`. **REVIEW:** dark mode is not a launch requirement. Either (a) explicitly drop the dark-mode tokens before launch, or (b) extend `--fp-*` with dark variants in a follow-up. Default position: skip dark mode for v1.

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

Chevron rotates 180deg over 200ms; content appears with no separate transition. Source: `Paywall.tsx:626-644`. **REVIEW:** P-115 should add a height-spring on the disclosure body to feel less abrupt.

### Empty state

**REVIEW:** observed pattern is a snapshot card with placeholders + a single primary CTA ("Take your diagnostic to unlock your dashboard" — see P-100 spec). No standardized empty-state component yet. P-115 should formalize:
- Single illustration or no illustration.
- Headline (Cabinet Grotesk 800/22px), one-sentence subhead, single primary CTA.
- No secondary action in empty states unless the user can actually do something else.

---

## 5. Layout Principles

**Mobile-first single column.** Every reviewed component lives in a `max-w-[440px]` flex column with horizontal padding `px-5` (20px each side). The verified narrowest viewport is 380px. Tablets and desktops inherit the same column with side gutters — the brand does not have a desktop-native layout (yet). **REVIEW** before any desktop-specific work.

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

**REVIEW:** there is no formal grid system (no columns, no gutters). Mobile single-column makes this fine; if/when desktop ships, decide on a 12-column or simply continue with centered max-width.

---

## 6. Depth & Elevation

**Three tiers. No more.**

| Tier | Use | Shadow | Border |
|---|---|---|---|
| 0 — flush | Page background, divider lines | none | optional 1px `#1A1A1A0A`–`#1A1A1A18` hairline |
| 1 — surface | Default cards, social-proof stats, frosted badges | `0 1px 6px-8px rgba(0,0,0,0.04-0.06)` | none |
| 2 — emphasis | Selected state, large content cards (pricing, radar, score-dot) | `0 2px 12px-16px rgba(0,0,0,0.05-0.08)` | optional 2px `--fp-ink` (selected only) |

**Backdrop blur is part of elevation, not decoration.** Tier-1 and Tier-2 surfaces both use `backdrop-filter: blur(8px)` over `--fp-paper` (80% white). This is what gives the surface its "frosted glass over warm canvas" feel against the `#FAFAF7` page background.

**No tier-3 (modal / sheet) defined yet.** **REVIEW:** the existing TurnReviewSheet (Tâche 2) and modal flows likely sit at tier-3 with stronger shadows. Audit before P-115 to confirm or define.

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
- **Don't use the radar chart as the primary diagnostic surface.** The Paywall radar (`Paywall.tsx:160-215`) is a paywall pitch, not the methodology view. The methodology view is the bar stack. **REVIEW:** Chadi to confirm — the radar's continued use on the paywall is a tension with "bars over radars." Either retire the paywall radar (preferred for brand coherence) or constrain it explicitly to "the radar is a sales tool, never a coaching tool."
- **Don't ship dark mode in v1.** The OKLCH dark tokens in `globals.css` are scaffold, not product.
- **Don't ship emoji in product copy.** "Visa-Urgent" persona reads as serious; emoji breaks the register.
- **Don't add a third typeface.** Cabinet Grotesk + Geist is the entire palette.
- **Don't introduce gradients.** Solid fills only. (The TCF C1 sage band is a *fill at 0.85 opacity*, not a gradient.)
- **Don't break the bottleneck-first sort.** A "sort by alphabetical" or "sort by topic" toggle on the diagnostic would dilute the methodology. The order is the diagnosis.

---

## 8. Responsive Behavior

### Breakpoints

**Default — and only currently verified — is mobile.** `Paywall.tsx:131` uses `max-w-[440px]`. The DoD on P-100 specifies "mobile-first verified at 380px width."

**REVIEW:** no tablet or desktop breakpoint is defined. Three options for v1:
1. **Stay mobile-only**, render a centered 440px column on any viewport. Acceptable for launch; the audience is on phones.
2. **Add a `>=md` breakpoint at 768px** that widens the column to 600-680px. Minimal effort.
3. **Build a real desktop layout** (split-pane diagnostic, side rail). Out of scope pre-launch.

Default position pre-launch: **option 1**. Defer 2 + 3 to post-launch.

### Touch targets

Observed minimums:
- Primary CTA: **58px tall** (Paywall.tsx:459).
- Onboarding card: **88px min-height** (OnboardingScreen.tsx:64).
- Toggle billing pill: **38px tall** (Paywall.tsx:293).
- Switch track: **28px tall, 48px wide** (Paywall.tsx:384-385).
- Progress dots: **8px** (visual; the touch target is the surrounding container, not the dot itself).

**Rule:** any tappable element exposed to the user as a primary action must be ≥44px in its smallest dimension (Apple HIG floor). The toggle pill at 38px is borderline — **REVIEW** whether to bump to 44px.

### Text readability at 380px

All observed font sizes (11–52px) work at 380px without overflow. Long French strings (e.g. "Approfondissement") use `word-break: break-word` only on bar labels (`CouchesDiagnostic.tsx:54`). **REVIEW:** apply `word-break` consistently to any user-facing French label that can exceed its container.

### Safe areas

`min-height: 100dvh` is used on full-page loaders (`app/page.tsx:44-45`) — this respects iOS safe areas. **REVIEW:** confirm `pb-safe` or equivalent padding is applied to bottom CTAs on iOS to avoid the home indicator overlap.

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
PAGE BACKGROUND:       #FAFAF7          (off-white canvas)
TARGET BAND (sage):    #D4E4D0          (--fp-sage)
WARMTH (peach):        #FFD8C2          (--fp-peach)
TRACK (bar empty):     #E8E8E5
SAVE BADGE GREEN:      #2D8B55          (saturated, sparing use)
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

**Easing** — **REVIEW:** P-115 needs to commit a standard. Recommendation:
- Most state transitions: `ease-out` (snappy on enter, gentle on settle).
- Entrance from offscreen: `cubic-bezier(0.16, 1, 0.3, 1)` (Vercel's standard "ease-out-expo"-feeling curve).
- Press feedback: no easing — instant `scale(0.96)` then instant return.
- Bar fill on diagnostic reveal: `ease-out`, 400ms, with a tiny initial delay (50-100ms per row, staggered) so the user reads them filling in order.

**Physics**
- The brand permits **subtle spring** on selected-card lift (the `scale(1.01)` settle) and on disclosure body height. **No bounce** anywhere — the spring should overshoot by ≤2% or not at all. Framer Motion's `spring` config: `{ stiffness: 300, damping: 30 }` as a starting point. **REVIEW** the actual values during P-115.

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

## Open decisions for review (consolidated)

For Chadi to resolve before P-115 ships:

1. **Pastel semantics.** Bind butter / lavender / sky / blush to specific roles, or document them as "pastel rotation, no fixed meaning."
2. **Destructive color.** Keep shadcn's saturated OKLCH red, or introduce a softer brand destructive using `--fp-blush`.
3. **Dark mode.** Drop the OKLCH dark tokens, or commit to dark variants of the `--fp-*` set.
4. **Paywall radar.** Retire it (recommended), or constrain it explicitly to "sales surface only, never coaching."
5. **Token promotion.** Promote `#FAFAF7`, `#E8E8E5`, `#E0A890`, `#2D8B55` to formal `--fp-*` tokens.
6. **Tablet/desktop breakpoint.** Stay mobile-only for v1, or add a 768px breakpoint.
7. **Touch target floor.** Bump 38px billing pill to 44px, or accept the borderline size.
8. **Word-break consistency.** Apply `word-break: break-word` to all French labels, not just bar labels.
9. **iOS safe area padding.** Audit bottom CTAs across all routes.
10. **Disclosure body animation.** Add a height-spring (Framer Motion) or accept the abrupt expand.
11. **Easing standard for P-115.** Lock the canonical ease curve before motion work begins.
12. **Modal / sheet / drawer tier.** Define a tier-3 elevation pattern, or audit and document the existing TurnReviewSheet.

---

**Source files:** `app/globals.css` · `app/page.tsx` · `components/onboarding/OnboardingScreen.tsx` · `components/diagnostic/CouchesDiagnostic.tsx` · `components/Paywall.tsx`.
**Format basis:** the 9-section pattern from VoltAgent/awesome-design-md. Content is LeMethodic-specific and codified from the existing repo, not imported from external systems.
