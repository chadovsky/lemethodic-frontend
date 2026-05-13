# F-VISUAL-001 X.5 — Nanobanana asset slot manifest

This document catalogs every imagery slot in Le Méthodic that benefits
from Nanobanana (Google Gemini image gen) generation, with suggested
prompts grounded in the F-VISUAL-001 design language:

- **Aesthetic anchor**: editorial-luxury (Wispr Flow benchmark — quiet
  luxury, soft neutrals, restrained accent).
- **Accent green**: `#8FA279` sage. NOT a brand fill — used as decoration,
  not as the dominant color of any composition.
- **Canvas**: warm cream `#F8F4ED`. Generated imagery should sit on or
  near this background, so compositions should match its warmth.
- **Restraint rule**: NO purple gradients, NO maximalist illustrations,
  NO emoji or mascot energy. Editorial composition discipline — single
  focal subject, generous negative space, natural light, real-world
  texture (paper, linen, ceramic, glass) over abstract gradients.
- **Two-greens reminder**: sage `#8FA279` is the accent; deeper sage
  `#44794F` is the success-state token. Prompts should reference sage
  generally; the design system applies tonal precision per surface.

## Generation guidance — universal prompt prefix

Prepend the following to every prompt below for consistent output:

> "Editorial photographic style, soft natural light, warm cream background
> (#F8F4ED), restrained sage green accent (#8FA279) used sparingly as a
> single small element. No text or typography in the image. No people's
> faces. No purple gradients, no synthetic AI aesthetic, no maximalist
> illustration. Composition: single focal subject, generous negative
> space, real-world texture (paper / linen / ceramic / glass). 4:3 aspect
> unless noted otherwise. Output crisp, retina-resolution."

## One-accent + No-secondary-accent reminder

The system commits to **sage as the only accent color**. Imagery should
NOT introduce a secondary brand hue (no royal blue overlays, no warm
amber highlights as "second accent," no peach as anything more than
a decorative pastel). When prompted to generate imagery for a surface
that calls for warmth, anchor on the existing `--fp-peach` / `--fp-sage`
/ `--ed-warm-*` pastel layer — these are decorative chip tones, not
competing accents.

## Slot manifest

### Landing / marketing surfaces

| Slot | Surface | Current file | Suggested prompt | Aspect |
|---|---|---|---|---|
| hero-landing | `/` (onboarding root) | `/public/onboarding-illustration.jpg` | "A French café terrace at golden hour, warm sage and cream palette, a steaming espresso on a marble bistro table beside a leather-bound notebook, no people in frame, shallow depth of field, golden hour light through linen curtains" | 16:9 |
| hero-exam-prep | `/exam-prep` | (TBD if exists) | "A formal French exam booklet on a linen tabletop, beside a fountain pen and a single sage-leaf bookmark, soft north-facing window light, no logos or text on the booklet cover, restrained editorial composition" | 16:9 |
| platform-card-feature | `/` platform cards | (none today) | "Three editorial still lifes side by side: (1) an espresso cup and a notebook for L'École, (2) a microphone on a velvet pad for Le Diagnostic, (3) a stack of index cards bound with twine for Le Vocabulaire — all on the same warm cream surface, top-down composition, soft shadow" | 3:1 wide |
| testimonial-photo | landing testimonial cards | (none today; TestimonialCard pattern exists) | "Anonymized editorial portrait of a person reading a French book in a sunlit café, framed from chest down (no face visible), holding the book with both hands, warm cream and sage tones" | 4:5 |

### Onboarding flow

| Slot | Surface | Current file | Suggested prompt | Aspect |
|---|---|---|---|---|
| onboarding-language | step 1 LanguageSelect | `/public/illustration-language.{jpg,png}` | "A single open dictionary on a warm cream surface, page showing a hand-pressed sage-leaf bookmark on the French side, north-facing window light, generous negative space" | 4:3 |
| onboarding-goal | step 2 TCFGoalSelect | `/public/illustration-goal.{jpg,png}` | "A French exam booklet (no recognizable exam name visible) closed on a linen surface, beside a sage ribbon bookmark, top-down composition, editorial restraint" | 4:3 |
| onboarding-level | step 3 CurrentLevelSelect | `/public/illustration-level.{jpg,png}` | "A staircase of three vintage hardback French dictionaries ascending in size, on a warm cream surface, soft side-lit shadow, sage accent on the topmost dictionary's spine" | 4:3 |
| onboarding-score | step 4 TargetScoreSelect | `/public/illustration-score.{jpg,png}` | "A vintage French exam result card on a linen surface, the numerical score artfully obscured by a sage-leaf overlay, editorial north-light composition" | 4:3 |
| onboarding-date | step 5 ExamDateSelect | `/public/illustration-date.{jpg,png}` | "A single page from a leather desk calendar with a sage-leaf marker on a chosen date (date itself obscured), warm cream surface, soft natural light" | 4:3 |
| onboarding-ecole | step 6 EcoleReveal | `/public/illustration-ecole.{jpg,png}` | "An editorial still life of three French textbooks stacked on a marble café table, an espresso cup beside, a sage stem laid across the top book, golden hour window light filtering in" | 4:3 |

### Paywall

| Slot | Surface | Current file | Suggested prompt | Aspect |
|---|---|---|---|---|
| paywall-hero | `/paywall` hero | (none — uses radar chart only) | "An editorial composition of a French exam booklet open on a linen tabletop, a fountain pen resting on the page, a single sage stem laid diagonally across the spread, soft north-facing window light, no readable text" | 3:2 |
| paywall-tier-comparison | `/paywall` comparison band | (none today) | "Three glass jars on a warm cream surface, each containing a different quantity of dried sage leaves (representing the three tier levels), top-down composition, editorial restraint" | 16:9 |

### L'École

| Slot | Surface | Current file | Suggested prompt | Aspect |
|---|---|---|---|---|
| ecole-empty-hero | `/ecole/intro` first-visit | (none today) | "A single open notebook on a warm cream surface, the page partially filled with French handwriting (text artfully blurred/illegible), a fountain pen resting in the gutter, soft north-facing light, sage ribbon bookmark" | 16:9 |
| lesson-illustration | per-lesson hero | (some lessons have `illustration-level.jpg` reused) | "Per-lesson custom illustration: still-life composition reflecting the lesson topic (preposition usage = travel ticket on a map; verb tense = a vintage clock; sentence structure = scrabble tiles arranged on linen). Common visual language: warm cream BG, sage accent, editorial restraint" | 4:3 |

### Vocabulaire

| Slot | Surface | Current file | Suggested prompt | Aspect |
|---|---|---|---|---|
| vocab-empty-corpus | `/vocabulaire` empty state | (none today) | "A stack of blank linen-bound notebooks on a warm cream surface, awaiting use, a single sage stem laid across the top notebook, golden hour window light" | 16:9 |
| vocab-topic-cover | per-topic header (optional) | (none — Topic detail uses text-only header) | "Per-topic custom illustration matching the topic theme (e.g. 'Voyages' = vintage train ticket on a marble surface; 'Loisirs' = a leather-bound photo album open to a sage-leaf pressing). Common visual language: warm cream BG, sage accent" | 16:9 |

### Diagnostic

| Slot | Surface | Current file | Suggested prompt | Aspect |
|---|---|---|---|---|
| diagnostic-empty | `/diagnostic` first-visit | (none today) | "A single vintage microphone on a velvet pad, on a warm cream surface, soft side-lit shadow, sage ribbon laid across the base, editorial restraint" | 16:9 |
| recording-state | mid-recording fallback | (none — uses VuMeter only) | "Abstract editorial composition: a single open glass jar on a warm cream surface, ripples visible in the still water inside catching warm light, sage-leaf floating on the surface" | 16:9 |

### Writing

| Slot | Surface | Current file | Suggested prompt | Aspect |
|---|---|---|---|---|
| writing-prompt-illustration | per-prompt visual | (none today — text prompts only) | "Per-prompt custom illustration matching the writing theme (e.g. 'argumentative essay' = a balanced scale with sage stems on each pan; 'narrative' = a leather-bound journal with a fountain pen). Common visual language: warm cream BG, sage accent" | 4:3 |
| writing-empty-history | `/writing/history` empty | (none today) | "An empty linen-bound journal lying open on a warm cream surface, fountain pen resting beside, sage ribbon bookmark, soft north-facing light" | 16:9 |

### Auth + verification

| Slot | Surface | Current file | Suggested prompt | Aspect |
|---|---|---|---|---|
| verify-email-illustration | `/verify-email` empty state | (none today) | "A single wax-sealed letter on a warm cream surface, the seal in sage-leaf imprint, an envelope opener beside, soft side-lit shadow" | 4:3 |
| password-reset-illustration | `/password-reset` confirm | (none today) | "A brass key on a linen surface, beside an open ring of similar keys, soft natural light, restrained editorial composition, sage ribbon tied to the key's bow" | 4:3 |

## Generation workflow

1. **Pick a slot** from the manifest above.
2. **Compose the prompt**: universal prefix (Generation guidance section)
   + slot-specific prompt (table column 4) + any per-context refinements
   (season, time of day, regional French signifiers — Lyon, Marseille,
   Quebec, etc.).
3. **Generate at retina resolution** (target 1600×1200 minimum for 4:3
   slots; 2400×1350 for 16:9). Save to `/public/` with the slot name as
   filename (e.g. `paywall-hero.jpg` and a matching `.png` for
   transparency if the surface needs it).
4. **Manual visual QC pass**: confirm the sage accent reads correctly
   against the warm cream — if the generated image's sage skews too
   muddy or too saturated, regenerate with prompt refinement ("muted
   sage with grey undertone" vs "vibrant sage").
5. **Drop the file** into `/public/` and update the consuming surface's
   image reference. Existing `/public/illustration-*.{jpg,png}` files
   stay as fallback until replaced.

## What NOT to generate

- **People's faces** (privacy + brand consistency across geographies).
- **Specific exam logos** (TCF, DELF, TEF) — copyright + ambiguity.
- **Synthetic AI aesthetic** (overly smooth, hyper-rendered, perfect
  symmetry). Real-world photographic texture is the brand.
- **Purple, royal blue, or hot pink** in any visible element. Single
  accent rule applies to generated imagery too.

## Filing this manifest

This doc lives at `docs/nanobanana-asset-slots.md` and is checked into
the repo as the canonical asset-slot reference. As the product surface
evolves, new slots get added here in lockstep with their consuming
component commit.
