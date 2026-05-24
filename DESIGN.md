# Le Méthodic — DESIGN.md

> **Document type:** visual constitution. Encodes every decision an AI agent or human collaborator needs to make Le Méthodic surfaces *coherent*, *credible*, and *unmistakably Le Méthodic*.
> **Companion:** `PRODUCT.md` (positioning, voice, methodology, anti-patterns) — read it first.
> **Audience:** Sonnet in Claude Code, design skills (impeccable, taste-skill, ui-ux-pro-max), and any human collaborator.
> **Status:** v1 — decisions locked 2026-05-24. Iterate when product reality changes or after impeccable audit surfaces material gaps.

---

## 1. Visual references — what we're learning from

Le Méthodic doesn't emulate a single brand. It triangulates from three reference points, each contributing something specific.

### 1.1 [Mautic](https://mautic.org/) — credibility through structural rigor
What to learn: how a serious, open-source product communicates **institutional credibility** without slick marketing artifice. The "Mautic VS Alternatives" footer pattern is the comparative-positioning approach Le Méthodic adopts (Phase A.3 `M-VS` ticket family). The information density, clear hierarchy, and resistance to sales-y polish are the spine.
What NOT to take: Mautic's navy-blue chrome is a B2B-marketing convention that conflicts with our warm/academic positioning.

### 1.2 [Wispr Flow](https://wisprflow.ai/) — modern audio-product motion and refinement
What to learn: how a 2025-era AI-audio product handles **state transitions**, **waveform visualization**, and **microinteraction polish**. Le Méthodic's recording → transcription → result flow is mechanically similar; Wispr Flow's solutions are reference-grade.
What to study at audit time: Wispr Flow's loading states, recording-in-progress animation, transcript reveal, error recovery flows. These map almost 1:1 to our diagnostic recording flow.

### 1.3 [Mobbin](https://mobbin.com/) — the quality bar, plural
Mobbin is a *library*, not a brand. The reference is "we pull patterns from many high-quality apps rather than emulate one." Practical implication: when authoring a new surface, consult Mobbin for the pattern (onboarding, dashboard, profile, settings, etc.) before inventing. **The quality floor for any Le Méthodic surface is the median Mobbin-curated app for that pattern.** Below that floor = amateur drift.

### Synthesized direction
Combining the three: **warm academic positioning** (mustard/ochre, French linguistic identity) + **iOS-influenced component sensibility** (soft shadows, generous spacing, type-led hierarchy) + **audio-product motion polish** (Wispr Flow patterns) + **multi-app pattern quality** (Mobbin floor). This is the aesthetic.

---

## 2. The aesthetic in one paragraph

Le Méthodic looks like **a serious French publication that happens to live in software**. It's mustard-and-ochre warm, type-led, lightly editorial, iOS-influenced in component language, and unhurried in motion. The brand surfaces have rhetorical confidence — generous type, French quote marks, room for an argument. The product surfaces are quiet utility — soft cards, fast feedback, no decorative noise. Across both registers, the same warm palette and the same Le Méthodic chrome bind everything together. A user moving from `lemethodic.com` to `/la-methode` should feel they're in the same world, just with different jobs to do.

---

## 3. Color system

### 3.1 Brand chrome (mustard/ochre)

The brand color is **warm ochre** — academic, French, classical. Specifics:

| Token | Hex (light mode) | Hex (dark mode) | Use |
|---|---|---|---|
| `--lm-brand` | `#C49A3A` | `#D4A847` | Primary brand mark, hero accents, key interactive states |
| `--lm-brand-deep` | `#8B6914` | `#A88830` | Text emphasis on light surfaces, headings on brand backgrounds |
| `--lm-brand-tint` | `#F5E8C0` | `#3A2F18` | Subtle backgrounds, hover states, soft fills |
| `--lm-brand-glow` | `#E8C77A` | `#C9A04A` | Accent borders, focus rings, decorative warmth |

The brand color appears in: the logo, primary CTAs (sparingly), focus rings, key navigation accents. **Never as a flat background covering significant area** — it's too saturated for sustained reading.

### 3.2 Per-couche colors

Each of the 5 couches gets its own warm color. All read distinctly side-by-side. **Les Pièges Anglais gets the boldest accent — it is the differentiator and must visually own that role.**

| Couche | Token | Hex (light) | Hex (dark) | Character |
|---|---|---|---|---|
| **Le Propos** | `--lm-couche-propos` | `#BC4F2A` | `#D66A47` | Terracotta clay — the substance, earthen, foundational |
| **Le Plan** | `--lm-couche-plan` | `#A66A2E` | `#BC8447` | Cinnamon — structural, organized, architectural |
| **La Construction** | `--lm-couche-construction` | `#8E5A1F` | `#B07A38` | Bronze — engineered, mechanical, slightly cooler |
| **Les Pièges Anglais** | `--lm-couche-pieges` | `#E0701D` | `#F08940` | **Vivid burnt orange — the punchiest color in the system, the differentiator** |
| **La Musique** | `--lm-couche-musique` | `#D4A431` | `#E0BC50` | Honey gold — sonic, light, glowing |

**Usage rule:** each couche's color is its identity across every product surface. The Le Propos color appears wherever Le Propos appears — feedback panels, lesson tags, diagnostic breakdowns, icon backgrounds. Consistency is the methodology made visual.

**Light/dark mode shifting:** dark mode versions lift in lightness and slightly desaturate to maintain contrast against warm-dark backgrounds. Never invert the hue — Le Propos is terracotta in both modes; just calibrated for the surface.

### 3.3 Functional colors

For success, warning, error, info — kept compatible with the warm palette (no cold blues, no template-default reds/greens).

| Token | Hex (light) | Hex (dark) | Use |
|---|---|---|---|
| `--lm-success` | `#6B8E3B` | `#8FB058` | Successful submission, passed item, completed lesson |
| `--lm-warning` | `#C8841B` | `#E2A040` | Soft warnings, "review this" prompts |
| `--lm-error` | `#A8341B` | `#D45A3A` | Blocking errors only — never used for soft warnings |
| `--lm-info` | `#7B6A8B` | `#9B8AAB` | Muted info, secondary metadata, neutral state |

### 3.4 Background and text systems

**Light mode:**

| Token | Hex | Use |
|---|---|---|
| `--lm-bg-base` | `#FAF7F0` | Page background — warm off-white, never pure white |
| `--lm-bg-surface` | `#FFFFFF` | Card and panel surfaces |
| `--lm-bg-subtle` | `#F0EBE0` | Section dividers, soft fills |
| `--lm-text-primary` | `#1E1A14` | Body text, primary content |
| `--lm-text-secondary` | `#5C544A` | Secondary text, captions, metadata |
| `--lm-text-tertiary` | `#8B8275` | Tertiary text, placeholders, faint chrome |
| `--lm-border-subtle` | `#E5DFD2` | Subtle dividers (use sparingly per shadow-over-border rule §6) |

**Dark mode:**

| Token | Hex | Use |
|---|---|---|
| `--lm-bg-base` | `#1A1612` | Page background — warm dark, never pure black |
| `--lm-bg-surface` | `#241F1A` | Card and panel surfaces — lifted from base |
| `--lm-bg-subtle` | `#2C2620` | Section dividers, soft fills |
| `--lm-text-primary` | `#F5F0E5` | Body text, primary content |
| `--lm-text-secondary` | `#B5AC9C` | Secondary text, captions, metadata |
| `--lm-text-tertiary` | `#857D70` | Tertiary text, placeholders, faint chrome |
| `--lm-border-subtle` | `#3A332B` | Subtle dividers |

### 3.5 Accessibility

**WCAG 2.2 AA minimum across all surfaces.** Contrast targets:

- Body text (`--lm-text-primary` on `--lm-bg-base`): ≥ 7:1 (AAA) light mode; ≥ 7:1 dark mode
- Secondary text: ≥ 4.5:1 (AA)
- Tertiary text: ≥ 3:1 (acceptable for non-essential metadata only)
- Couche colors on backgrounds: ≥ 4.5:1 where text overlays the color; ≥ 3:1 where used purely as decoration/identity

**No couche color appears as a flat background under body text without verifying contrast** — fill behind text uses the tint variant or a layered overlay.

### 3.6 What this palette is NOT
- Not the cool-blue SaaS default
- Not the purple-to-blue AI-marketing gradient
- Not a high-contrast monochrome editorial palette
- Not a multi-hue rainbow

Cohesion comes from the warm-only temperature constraint.

---

## 4. Type system

### 4.1 Stack

Three typefaces, each with a clearly delineated role. No others enter the stack without an explicit decision in this document.

| Family | Role | Weights used |
|---|---|---|
| **Cabinet Grotesk** | Display, hero, marketing headings | 500 Medium, 700 Bold, 900 Black (display only) |
| **Geist** | UI, body, interface chrome, in-app text | 400 Regular, 500 Medium, 600 SemiBold, 700 Bold |
| **Source Serif 4** | Long-form lesson content, editorial reading sections, French textual examples | 400 Regular, 600 SemiBold, 700 Bold (sparingly) |

### 4.2 Scale

Modular scale with **1.25 ratio** (major third) — generous enough for editorial confidence without inflating chrome.

| Size token | px (mobile) | px (desktop) | Use |
|---|---|---|---|
| `--lm-text-3xs` | 11 | 12 | Microcopy, badge text, footer fine print |
| `--lm-text-2xs` | 12 | 13 | Captions, metadata, timestamps |
| `--lm-text-xs` | 13 | 14 | Secondary UI labels, helper text |
| `--lm-text-sm` | 14 | 15 | Body small, dense UI text |
| `--lm-text-base` | 16 | 16 | Body default — never smaller for primary content |
| `--lm-text-lg` | 18 | 18 | Body emphasis, lead paragraphs |
| `--lm-text-xl` | 20 | 22 | Subheadings (h4) |
| `--lm-text-2xl` | 24 | 28 | Section headings (h3) |
| `--lm-text-3xl` | 30 | 36 | Page headings (h2) |
| `--lm-text-4xl` | 36 | 48 | Marketing display (h1 product) |
| `--lm-text-5xl` | 48 | 64 | Hero display (h1 brand surfaces) |
| `--lm-text-6xl` | 60 | 80 | Hero oversized (rare — landing page headline only) |

### 4.3 Line heights

| Token | Value | Use |
|---|---|---|
| `--lm-leading-tight` | 1.1 | Display headings (5xl, 6xl) |
| `--lm-leading-snug` | 1.25 | Headings (xl through 4xl) |
| `--lm-leading-normal` | 1.5 | Body UI text |
| `--lm-leading-relaxed` | 1.625 | Long-form lesson content, editorial reading |
| `--lm-leading-loose` | 1.75 | French citation blocks, poetic content (rare) |

### 4.4 Letter spacing

Geist and Cabinet Grotesk both work well at default tracking. Adjust only for display sizes:

| Token | Value | Use |
|---|---|---|
| `--lm-tracking-tighter` | -0.025em | Hero display (5xl, 6xl Cabinet Grotesk) |
| `--lm-tracking-tight` | -0.01em | Display headings (3xl, 4xl) |
| `--lm-tracking-normal` | 0 | All other text |
| `--lm-tracking-wide` | 0.025em | Small uppercase eyebrow labels (use SPARINGLY — eyebrow chips are AI fingerprints per PRODUCT.md anti-patterns) |

### 4.5 Type usage by surface

- **Brand surfaces** (landing, /exam-prep, /pricing, /about): Cabinet Grotesk hero (5xl-6xl), Geist body, Source Serif 4 for any pull-quotes or editorial passages.
- **Product chrome** (nav, dashboard, settings, forms): Geist throughout.
- **Lesson content** (La Méthode reading sections): Source Serif 4 body at `--lm-text-lg` with `--lm-leading-relaxed`. Geist for UI affordances (next-button, progress, interactive cells).
- **French citations and example sentences** within lessons: Source Serif 4 italic OR Geist italic depending on context (italic French serif feels more textbook; italic Geist feels more example-y).
- **Numerals** in scores, timing, statistics: Geist tabular-nums variant for alignment.

### 4.6 What's forbidden
Per PRODUCT.md anti-patterns, never use as primary hero typography: **Fraunces, Figtree, Recoleta, Newsreader, Playfair, Cormorant, Tiempos**. These specific serifs fingerprint AI-generated marketing pages from late-2025 and early-2026 and immediately undermine Le Méthodic's credibility.

---

## 5. Spacing system

Base unit: **4px** (iOS convention). All spacing decisions snap to multiples of 4.

| Token | Value | Use |
|---|---|---|
| `--lm-space-1` | 4px | Tightest spacing — within-component padding |
| `--lm-space-2` | 8px | Compact padding, small gaps |
| `--lm-space-3` | 12px | Default tight padding |
| `--lm-space-4` | 16px | Default padding for UI elements |
| `--lm-space-5` | 20px | Larger UI gaps |
| `--lm-space-6` | 24px | Card padding, comfortable spacing |
| `--lm-space-8` | 32px | Section-internal spacing |
| `--lm-space-10` | 40px | Section spacing on dense surfaces |
| `--lm-space-12` | 48px | Section spacing on standard surfaces |
| `--lm-space-16` | 64px | Section spacing on editorial surfaces |
| `--lm-space-20` | 80px | Major section breaks on brand surfaces |
| `--lm-space-24` | 96px | Hero spacing, generous editorial rhythm |
| `--lm-space-32` | 128px | Page-level breathing room on landing surfaces |

**Density rule:** product surfaces use `--lm-space-3` through `--lm-space-8` predominantly. Brand surfaces use `--lm-space-8` through `--lm-space-24`. Density signals which register you're in.

---

## 6. Motion system

### 6.1 Principle

**Motion exists to convey state or aid comprehension. Never to decorate.**

Every animation must answer: *what does this motion teach the user, or what state change does it communicate?* If neither, remove it.

### 6.2 Library

**Framer Motion** (already in the stack per FE `settings.json`). Use it for:
- Layout transitions (`layout` prop for shared-element transitions between routes)
- Presence animations (`AnimatePresence` for mount/unmount)
- Gesture handling (drag, drag-to-dismiss on sheets)
- Spring physics for natural feel

For pure CSS transitions on hover/focus states, **don't reach for Framer Motion** — Tailwind `transition-*` utilities are lighter and sufficient.

### 6.3 Where motion belongs (surface-by-surface)

| Surface | What moves | Purpose |
|---|---|---|
| **Audio playback** (Le Maître, examiner, recordings) | Waveform amplitude (real-time), play/pause icon morph, scrubber position | Convey audio state; waveform = "audio is happening, here's what's happening sonically" |
| **Recording flow** | Pulsing record indicator, waveform during recording, transition to "transcribing" spinner, reveal of transcript text | Communicate state machine progression — user always knows what's happening |
| **Diagnostic reveal** | Score number count-up (1-1.5s), per-couche bars filling in sequence, **subtle warm glow** on the lowest-scoring couche to draw attention | The high-stakes reveal moment deserves choreography. Sequence: overall score → per-couche scores → recommendations |
| **Lesson progression** | Smooth scroll between cells (interactive notebook style), gentle reveal of new content on "next" tap, completion animation on lesson finish | Pace the reading; signal progress without rushing |
| **Vocabulary practice** | Card flip on browse (3D rotate, 250ms), correct/incorrect feedback (subtle scale + color flash, 150ms) | Confirmation and engagement without gamification |
| **Microinteractions** | Button press (95% scale, 100ms), hover (subtle background shift, 150ms), focus rings (instant) | Tactile feedback — the iOS convention |
| **Page transitions** | Cross-fade for route changes within a section (150ms); no transition for nav between top-level products (instant feels faster on the dashboard) | Match user mental model — sub-route changes feel continuous, top-level switches feel decisive |
| **Modals and sheets** | iOS-style bottom sheet slide-up on mobile (250ms ease-out), centered modal fade-in on desktop (150ms) | Spatial coherence with iOS sensibility |

### 6.4 Easing and duration

| Type | Easing | Duration |
|---|---|---|
| State changes (toggles, focus) | `ease-out` | 100-150ms |
| Entrances (mount, reveal) | `ease-out` | 200-300ms |
| Exits (unmount, dismiss) | `ease-in` | 150-200ms |
| Bidirectional (drag, scrub) | `ease-in-out` | 200-250ms |
| Diagnostic reveal sequence | spring (Framer Motion default) | 600-1500ms total sequence |
| Page transitions | `ease-out` | 150ms (subtle, fast) |

### 6.5 What NEVER animates
- **Headings or body text on scroll** — no scroll-jacking, no parallax, no reveal-on-scroll for primary content. The user is reading; let them read.
- **Decorative background elements** unless they serve audio visualization or active state.
- **Autoplay video or audio loops** anywhere in the product. (Audio examples in lessons require explicit user trigger.)
- **Confetti, badges flying in, streaks lighting up** — per PRODUCT.md anti-patterns, no gamification.
- **Hero illustrations or hero typography** — they sit still. Confidence does not need to jiggle.

### 6.6 Reduced motion

Respect `prefers-reduced-motion: reduce` everywhere. Reduced-motion fallbacks:
- Replace all entrance/exit animations with instant show/hide
- Replace state-change animations with instant value swaps
- **Keep audio waveform animations** (they're informational, not decorative — the user opted into audio playback)
- Keep diagnostic reveal sequence but compress to 200ms instant reveal of all values (no sequenced fill)

---

## 7. Component direction

iOS-influenced sensibility throughout. Soft, considered, type-led.

### 7.1 Buttons

| Property | Value |
|---|---|
| Corner radius | 12px default; 16px for primary CTAs on brand surfaces |
| Border | None |
| Shadow | None on default state; soft elevation on hover (light mode), subtle glow (dark mode) |
| Background | Filled (primary), translucent (secondary), text-only (tertiary) |
| Padding | 12px vertical, 20px horizontal (default); 16px / 28px (large) |
| Font | Geist 500 Medium |
| Press feedback | 95% scale, 100ms |

Variants:

- **Primary**: `--lm-brand` background, white text. The hero CTA. One per view ideally.
- **Secondary**: `--lm-bg-subtle` background, `--lm-text-primary`. Default action.
- **Tertiary**: transparent background, `--lm-brand-deep` text. Less prominent action.
- **Destructive**: `--lm-error` background, white text. Rare — only true destructive actions.

### 7.2 Cards

| Property | Value |
|---|---|
| Corner radius | 12px (compact), 16px (default), 20px (hero/featured) |
| Border | None |
| Shadow | Soft elevation. Light mode: `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)`. Dark mode: `0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)` |
| Background | `--lm-bg-surface` |
| Padding | `--lm-space-6` (24px) default; `--lm-space-8` (32px) for content-heavy cards |
| Hover elevation | Slightly deeper shadow if interactive; no lift translation (avoid the "card jumps up" AI-template fingerprint) |

### 7.3 Form inputs

iOS-influenced — favor underlined / minimal where appropriate, bordered where density demands clarity.

- **Text inputs** (forms, search): bordered 1px `--lm-border-subtle`, 12px radius, `--lm-space-3` padding, Geist Regular. Focus state: `--lm-brand-glow` ring (no thickness change, no layout shift).
- **Inline-edit inputs** (lesson interactions): underlined only, no border box. Editable text feels continuous with reading.
- **Select / dropdowns**: same as text inputs, iOS-style chevron icon at right.
- **Checkboxes and radios**: custom-styled, 20px tap target on mobile, brand color when active.

### 7.4 Navigation

- **Top nav (brand surfaces)**: horizontal, Geist 500 Medium, transparent background with backdrop blur on scroll (iOS frosted glass pattern). Logo left, primary links center, CTA right.
- **App nav (product surfaces)**: persistent sidebar on desktop (collapses to bottom tab bar on mobile, iOS-style). Three top-level destinations match the three products: **La Méthode, La Bibliothèque, L'Examen**. Dashboard separate icon.
- **Breadcrumbs**: only on deep product surfaces (within a lesson, within a Tâche). Subtle, Geist 400, secondary text color.

### 7.5 Modals and sheets

- **Mobile**: bottom sheets, iOS-style. Drag-to-dismiss. `--lm-bg-surface` background, 24px top radius, no bottom radius. Backdrop dimmed (`rgba(0,0,0,0.4)` light mode; `rgba(0,0,0,0.6)` dark mode).
- **Desktop**: centered modal, 20px radius all corners, soft shadow, max-width based on content. Same backdrop convention.

### 7.6 Loading states

- **Spinners**: subtle, `--lm-brand` color, modest size. Used only when waiting >300ms.
- **Skeleton loading**: preferred for content surfaces. Match the actual content's shape. `--lm-bg-subtle` shimmer animation, 1.5s cycle.
- **Inline progress**: text-based ("Transcribing… 12s") for known-duration operations. More honest than indeterminate spinners.

---

## 8. Iconography

### 8.1 Library

**Lucide React** (already in FE stack). Style: 1.5px stroke, 24px default size, no fill (outlined). Consistency across the entire product.

### 8.2 Per-couche iconic representations

Each couche gets a small icon that appears next to its name in feedback panels, lesson tags, and diagnostic breakdowns. Initial directions (refined during component implementation):

| Couche | Icon direction | Lucide candidates |
|---|---|---|
| Le Propos | Speech / quote / message | `quote`, `message-square`, `message-circle` |
| Le Plan | Architecture / outline / structure | `list-tree`, `network`, `layout-list` |
| La Construction | Building blocks / construction | `blocks`, `boxes`, `wrench` |
| **Les Pièges Anglais** | Alert / filter / shield (the differentiator gets a distinct visual identity) | `shield-alert`, `filter`, `triangle-alert` |
| La Musique | Music / waveform / sound | `audio-waveform`, `music`, `volume-2` |

Final icon selection happens during component implementation; lock in DESIGN.md addendum once chosen.

### 8.3 Icon usage rules
- 16px for inline icons (next to text)
- 20px for nav and chrome icons
- 24px for standalone icons (cards, feature blocks)
- 32-40px for hero / feature illustrations
- **Never** the rounded-square icon tile above a heading (PRODUCT.md anti-pattern — AI template fingerprint)
- Icons inherit the surrounding text color by default

---

## 9. Layout principles

### 9.1 Responsive approach

**Mobile-first.** Build the smallest surface first; layer up.

| Breakpoint | px | Tailwind alias |
|---|---|---|
| Base | 0+ | (default) |
| sm | 640+ | small tablets |
| md | 768+ | tablets, small laptops |
| lg | 1024+ | desktop |
| xl | 1280+ | large desktop |
| 2xl | 1536+ | xl displays (rare use) |

### 9.2 Container widths

| Surface type | Max width | Notes |
|---|---|---|
| Brand surfaces (landing, marketing) | 1280px | Generous, full editorial rhythm |
| Product chrome (dashboard, nav) | 1440px | More density warranted |
| Lesson reading content | 720px | Optimal reading measure |
| Editorial articles, blog posts | 720px | Same — reading measure rules |
| Forms (settings, onboarding cards) | 480px | Focused, single-task width |

### 9.3 Grid system

- **Brand surfaces**: 12-column grid, 32px gutter desktop / 16px mobile.
- **Product surfaces**: simpler — flexbox layouts with clear stacking on mobile, side-by-side on desktop. CSS Grid for cases that genuinely need 2D placement.

### 9.4 Mobile-specific patterns

- Bottom tab bar nav (iOS convention)
- Bottom sheets for modal content (per §7.5)
- 44pt minimum tap target (iOS guideline)
- Pull-to-refresh disabled by default (jarring on data-bound product surfaces)

---

## 10. Surface-specific patterns

### 10.1 Brand surfaces

**Landing page (`lemethodic.com`)**

Architecture (per F-300a/b lock, May 9):
- Hero: locked H1 + subhead + primary CTA "Start free diagnostic" → /onboarding
- Three product cards (The Method · The Library · The Exams) with equal visual weight
- Methodology section explaining the 5 couches
- Credibility section (the academic team)
- Comparative positioning (Le Méthodic vs Preply / Babbel / etc. — Phase A.3 M-VS pages linked)
- Testimonials (when available — real users only, no fabrications)
- Pricing summary
- Footer with Mautic-inspired comparative-VS structure

Visual: Cabinet Grotesk display at `--lm-text-5xl` or `--lm-text-6xl` for H1, `--lm-text-2xl` Geist for subhead, Source Serif 4 for any pull-quotes. Mustard accent on primary CTA. Generous `--lm-space-20` and up between sections.

**`/exam-prep` (the conversion surface for the Visa-Urgent persona)**

Sharper, more direct than the landing page. Single CTA flow: "Take the free diagnostic." Designed for users who arrived via "TCF Canada prep" search intent. Heavy use of social proof, exam-specific imagery, and the urgency of the visa context (without being manipulative).

### 10.2 Lesson reader pattern (La Méthode)

**Interactive notebook hybrid.** Each lesson is composed of "cells" stacked vertically:

| Cell type | Content | Visual treatment |
|---|---|---|
| **Concept** | Methodology explanation (which couche, why this matters) | Source Serif 4 body, `--lm-text-lg`, generous line-height |
| **Audio** | Le Maître speaking the example | Inline audio player, waveform visualization on play, transcript expandable |
| **Example (French)** | Native French example sentence | Source Serif 4 italic, Le Propos color tag if introducing concept |
| **Interactive prompt** | "Try producing this. Tap when ready." | Geist UI, contained card, clear interaction affordance |
| **Comparison** | Anglo-trap reveal (the differentiator moment) | **Les Pièges Anglais color tag**, side-by-side "what you'd say in English / what works in French" |
| **Practice** | User produces audio, gets feedback | Recording flow surface embedded |
| **Synthesis** | Lesson wrap-up, key takeaway | Editorial moment — wider type, room to breathe |

For Approfondissement lessons (17-27), allow longer-form editorial passages within the notebook spine — those advanced learners are reading more, practicing in larger units.

### 10.3 Diagnostic feedback panels (L'Examen results)

The high-stakes reveal moment. Choreography matters.

Sequence (per §6.3):
1. Overall predicted TCF score, count-up animation (~1s)
2. Per-couche scores fill in sequence (250ms each, total ~1.5s)
3. Lowest-scoring couche gets subtle attention treatment (warm glow, brief pulse)
4. Recommended next actions surface (linked to specific La Méthode lessons targeting the weak couches)

Visually: each couche row gets its color, its icon, its score bar (filled to width = `score / max * 100%`), and a one-line summary. No clutter. No "great job!" — just the data, presented seriously.

### 10.4 Vocabulary browser (La Bibliothèque)

Three modes — browse, practice, test, tutor — each with its own treatment:

- **Browse**: gallery of chunks (cards), filterable by CEFR level, theme, source. Tap to expand into full chunk view with examples, audio, related chunks.
- **Practice**: single-chunk-at-a-time flashcard interaction. Flip animation (250ms 3D rotate), correct/incorrect feedback (subtle), spaced repetition queue management invisible to user.
- **Test**: timed, no-feedback drilling. Stripped-down surface — focus on the chunk, the answer prompt, the timer. Score reveal after.
- **Tutor** (Le Maître): conversational mode where Le Maître drills you on chunks adaptively. Audio-led.

### 10.5 Recording flow

The mechanical heart of L'Examen. Per Wispr Flow reference patterns:

1. Pre-recording state: prompt clearly visible, "Tap to record" CTA
2. Recording state: waveform live-animating amplitude, timer counting up, pulsing record indicator, "Tap to stop"
3. Transcribing state: spinner with text ("Transcribing… 8s"), transcript appears as it's processed
4. Review state: transcript editable, "Confirm" or "Re-record"
5. Result state: diagnostic feedback panel (per §10.3)

Each state transition is smooth (250ms cross-fade or layout animation). The user always knows where they are in the state machine.

---

## 11. Dark mode

**Required for v1.** Both modes ship simultaneously. Every design token has a light and dark variant (defined in §3.4).

### 11.1 Implementation
- Tailwind dark mode via `class` strategy (not `media`) — user can override system preference
- Toggle in settings, persisted to user preference
- Default: respect `prefers-color-scheme` on first visit

### 11.2 Dark mode design principles
- Warm dark, never pure black (per §3.4 — `--lm-bg-base` is `#1A1612`)
- Per-couche colors lift in lightness, maintain hue
- Mustard chrome lightens slightly (more visible against warm dark)
- Shadows shift to slight glows (downward shadow conflicts with the assumption that the surface is the light source)
- All contrast targets met in both modes (WCAG AA minimum, AAA for body text)

### 11.3 What's different in dark mode
- Recording-flow waveform is brighter (clear visual against dark background)
- Editorial reading sections (Source Serif 4 in La Méthode lessons) get slightly increased letter-spacing for serif legibility on dark backgrounds
- Soft shadows replaced with subtle inner glow on cards to maintain elevation hierarchy

---

## 12. Do / Don't rules

### Do
- Anchor every design decision in the warm palette
- Maintain per-couche color consistency wherever a couche is referenced
- Use motion to convey state, never to decorate
- Respect reduced-motion preference
- Maintain WCAG AA contrast (AAA for body text)
- Use Source Serif 4 for long-form lesson reading
- Use Cabinet Grotesk for hero/display only
- Use Geist for everything else
- Use Lucide icons throughout
- Soft shadows over borders (iOS sensibility)
- Generous spacing on brand surfaces, denser on product surfaces

### Don't
- Inter-for-everything (the universal AI tell)
- Purple-to-blue gradients
- Cards nested in cards
- Rounded-square icon tiles above headings
- Eyebrow chips above hero h1s
- Fraunces, Figtree, Recoleta, Newsreader, Playfair, Cormorant, Tiempos as hero typography
- Scroll-jacking or parallax for primary content
- Autoplay loops
- Confetti, streaks, badges, gamification
- "Card jumps up on hover" elevation animations
- Pure white (`#FFFFFF`) page backgrounds — always warm off-white
- Pure black (`#000000`) dark mode backgrounds — always warm dark
- Cool blue accent colors — they conflict with the warm palette
- More than one primary CTA per view

---

## 13. Quality gates

Before any UI ships:

1. **Contrast check**: every text/background combination passes WCAG AA minimum (AAA preferred for body text)
2. **Type stack check**: only Cabinet Grotesk / Geist / Source Serif 4 in use; no Inter, no forbidden serifs
3. **Color check**: only documented tokens in use; no off-palette colors introduced
4. **Spacing check**: all gaps snap to the 4px scale
5. **Reduced-motion check**: surface renders correctly with `prefers-reduced-motion: reduce`
6. **Dark mode check**: surface renders correctly in both light and dark modes
7. **Couche consistency check**: any couche reference uses its documented color and icon
8. **No anti-patterns**: nothing on the "Don't" list above appears

These can be partially automated via the `playwright-capture` skill (visual regression) and `le-methodic-ship` skill (forbidden string detection). The rest requires the impeccable audit pass (once installed).

---

## 14. Implementation notes

### 14.1 Design token storage

Tokens documented in this file become CSS custom properties in `app/globals.css`:

```css
:root {
  --lm-brand: #C49A3A;
  --lm-brand-deep: #8B6914;
  /* ... full palette */
}

.dark {
  --lm-brand: #D4A847;
  --lm-brand-deep: #A88830;
  /* ... full dark palette */
}
```

Tailwind config extends with the same tokens for utility classes:

```js
theme: {
  extend: {
    colors: {
      'lm-brand': 'var(--lm-brand)',
      'lm-couche-propos': 'var(--lm-couche-propos)',
      // ...
    }
  }
}
```

### 14.2 Component library

No external component library beyond shadcn/ui (already implied by FE stack). Custom components live in `components/`. Each component should:

- Use only documented design tokens
- Support both light and dark modes
- Pass the §13 quality gates
- Have a brief docstring linking back to relevant DESIGN.md section

### 14.3 Migration impact

This DESIGN.md represents the canonical visual constitution. Current FE surfaces likely diverge from it in places. **The M-RENAME ticket family (Phase A.3, per PRODUCT.md §16) should be paired with an M-VISUAL ticket family** that audits each existing surface against this document and brings it into alignment. The impeccable audit pass (once installed) will surface the gap list.

---

## 15. What this enables next

With PRODUCT.md and DESIGN.md both in place at FE repo root, the design skill installation finally has full anchoring:

1. **Install impeccable** (`npx skills add pbakaus/impeccable -a claude-code`)
2. Run `/impeccable load-context` — it picks up both PRODUCT.md and DESIGN.md automatically
3. Run `/impeccable audit` on a representative Le Méthodic surface (suggested first targets: landing page, /la-methode lesson player, /l-examen diagnostic results)
4. Review impeccable's findings — what's amateur, what's drifted, what's missing
5. Generate M-VISUAL ticket family from the findings
6. Iterate DESIGN.md to v2 if impeccable surfaces gaps in the visual constitution itself

---

## Appendix — Locked decisions reference

- **Visual references:** Mautic (positioning rigor), Wispr Flow (audio motion), Mobbin (quality bar plural) *(locked 2026-05-24)*
- **Palette direction:** Warm mustard/ochre *(locked 2026-05-24)*
- **Per-couche colors:** Terracotta / Cinnamon / Bronze / Burnt Orange / Honey Gold (see §3.2 for hex) *(locked 2026-05-24)*
- **Component sensibility:** Apple/iOS — soft shadows over borders *(locked 2026-05-24)*
- **Motion library:** Framer Motion (existing) *(locked 2026-05-24)*
- **Motion principle:** convey state or aid comprehension; never decorate *(locked 2026-05-24)*
- **Dark mode:** required for v1 *(locked 2026-05-24)*
- **Lesson reader:** interactive notebook hybrid *(locked 2026-05-24)*
- **Type stack:** Cabinet Grotesk (display) / Geist (UI) / Source Serif 4 (editorial lesson content) *(locked from memory + PRODUCT.md)*
- **Icon library:** Lucide React *(locked from FE stack)*

---

*End of DESIGN.md v1. Iterate after impeccable audit surfaces material gaps in the visual constitution.*
