# PEDAGOGY.md

Le Méthodic is structured around a single pedagogical spine: seven typed content molds, applied across three proficiency levels (A2, B1, C1), organized into themed islands (îles). Every learning surface in the product renders content from this spine. This document is canonical for all learning design decisions. When PRODUCT.md, SITEMAP.md, or ARCHITECTURE.md conflict with PEDAGOGY.md on learning design questions, PEDAGOGY.md wins.

## The 7 Molds

Each île contains exactly one instance of each mold. Molds are typed React components with a fixed prop contract. Content lives in props; the component owns layout and interaction.

### Le Dialogue

A scene-based listening exercise. Audio recording with a full transcript, followed by comprehension checks. Grounds the learner in the theme's real-world context before any production is asked.

**Prop contract:** `audio`, `transcript`, `comprehensionChecks`

### L'Acte de Parole

A communicative function (e.g., se présenter, exprimer un désaccord, demander un service). Three to five phrase variations at different registers (familier, standard, soutenu). Optional turn-modeling showing the phrase in a mini-exchange.

**Prop contract:** `function`, `phrases`

### Le Chunk

Vocabulary in thematic clusters. Each chunk has a French phrase, English gloss, optional piège marker (false friend or anglicism trap), and a usage example sentence.

**Prop contract:** `items` (array of `{ fr, en, piege, example }`)

### La Règle

One grammar rule directly relevant to the île's theme and Tâche type. Three to five examples. Optional short practice item (fill-in or transformation). Kept to one rule per île to avoid cognitive overload.

**Prop contract:** `rule`, `examples`, `practice`

### Le Son

One phonetic challenge tied to the theme. A focal sound description plus two to four minimal pairs illustrating the contrast. Learners listen to distinguish, then are prompted to produce.

**Prop contract:** `sound`, `minimalPairs`

### L'Activité (four sub-types via `type` prop)

The practice layer. Four sub-types address different skill dimensions:

- **compréhension**: Comprehension questions on a short document or audio excerpt. Banks Le Propos couche signal.
- **réflexe**: Rapid-fire prompts targeting Les Pièges Anglais. Streak tracking rewards consecutive correct answers.
- **réemploi**: Structured production items (gap-fill, transformation, partial-frame). Banks La Construction and Le Plan couche signals.
- **conversation**: A 4-to-5 turn guided conversation scenario with Le Maître. Banks La Musique and Le Plan couche signals.

**Prop contract:** `type` (compréhension | réflexe | réemploi | conversation), `content` (shape varies by sub-type)

### La Tâche

The capstone production task: one oral task or one writing task per île, assigned by skill priority in the Target Profile. Uses a 5-couche rubric weighted by level (see Couche Weighting below). Gated until the learner has completed all other molds. Le Maître scores, comments by couche, and stores signals for level advancement tracking.

**Prop contract:** `type` (oral | writing), `consigne`, `rubricWeights`, optional `image`

## Two-View Pattern

Every île is accessible through two surfaces:

- **/ile/[theme]**: The syllabus view. All seven molds in sequence, top to bottom. Le Maître audio intro at the top, close at the bottom (revealed on completion). La Tâche locked until all other molds are complete. Progress tracked per mold via the user_progress BE table.
- **/seance**: The daily brain-game. A curated queue of five to seven mold instances targeting weak couches and mixing across îles. Optimized for a 20-minute daily habit rather than a single île deep-dive.

A learner may use either entry point freely. /seance does not require a completed syllabus pass.

## Le Maître

Le Maître is the unified tutor persona. Voice: ElevenLabs Chadi-clone (founder voice, distinct from the examiner voice used for Tâche consignes). Le Maître speaks at:

- **île intro**: Contextualizes the theme and sets expectations. Always played.
- **île close**: Celebrates completion and previews the next step. Always played.
- **activity transitions** (balanced + strict intensity): Short connective audio between molds.
- **mid-activity feedback** (strict intensity only): Real-time commentary during réflexe and conversation activities.

### Intensity Levels

- **soft**: Intro and close only. Minimal interruption. Good for review or high-confidence learners.
- **balanced**: Intro, close, and transitions. The default.
- **strict**: All of the above plus mid-activity feedback. Maximizes signal density. Recommended for high-stakes exam prep.

Intensity is set at /parametres and stored on the user's Target Profile. Default: balanced.

## Cross-Level Adaptation

One MDX file per (theme, level): `/content/iles/[theme]/[level].mdx`. The same seven molds appear in every file; content varies by level. Images are theme-keyed (shared across A2, B1, C1 of the same theme), stored at `/public/iles/[theme]/`.

Phase 2 populates only B1 files. A2 and C1 routes exist and resolve to bientôt surfaces until Phase 5.

### Per-mold field map

| Mold | Stays across levels | Changes per level |
|---|---|---|
| Le Dialogue | Theme, scene, illustration, characters, situation | Audio recording, transcript, comprehension questions |
| L'Acte de Parole | Which actes are covered | Phrase variations, register, turn complexity |
| Le Chunk | Theme connection | Chunk list, example complexity, piège density |
| La Règle | Which grammar attaches | Grammar depth |
| Le Son | Theme link | Sound difficulty, minimal pair complexity |
| L'Activité (each sub-type) | Activity types are constant | Source difficulty (comp), prompt vocabulary (réf), sentence complexity (réem), turn count and response expectations (conv) |
| La Tâche | Theme, scenario, image | Consigne complexity, expected output length, rubric couche weights, scoring thresholds |

### Couche weighting per level

| Level | Le Propos | Le Plan | La Construction | Les Pièges Anglais | La Musique |
|---|---|---|---|---|---|
| A2 | 35% | 10% | 35% | 15% | 5% |
| B1 | 25% | 20% | 25% | 20% | 10% |
| C1 | 15% | 25% | 15% | 20% | 25% |

Logic: at A2, basic comprehension and construction dominate. At C1, sophistication of register (La Musique) and planning differentiate. Pièges Anglais holds relatively steady as the through-line differentiator. These weights are starting values, validated empirically when 5-couche scoring wires up against real Tâche submissions.

### User navigation across levels

A user has one current_level field in their profile. /ile/[theme] resolves to the MDX content for (theme, current_level). Optional ?level=a2 query param surfaces lower levels in read-only review mode (does not affect the user's current_level state).

Level advancement is gated by Le Maître's 5-couche pass rate over the current level's îles. The threshold is configurable and validated against real signal once scoring lands.

## Image Pipeline

### Aesthetic

Linocut-inspired French editorial style with watercolor wash, more illustrative direction (less photographic). The Atelier Français palette (paper white, ink #14213D, vermillion #C8102E) reads naturally with this medium.

Reference anchor: the Hermès 2026 homepage redesign commissioned hand-drawn linocut and lithograph illustrations from French illustrator Linda Merad. The 2026 illustration trend rewards visible craft over polished AI output; this aesthetic positions Le Méthodic as a serious French product, not a stack of stock visuals.

### Density per île

Five essential plus 2 to 3 supplementary images per île. Total around 6 to 8 images. Phase 2 (3 îles) ships approximately 18 to 24 images total.

### Reference anchor protocol

4 to 6 style anchor references are locked at Phase 2 start, before any île image work begins. Anchors include style references (capturing medium, palette, mood) and content references (capturing scene types: dialogue, conversation, Tâche). The cap of 6 reflects Nano Banana Pro fidelity guidance (more references degrade structural accuracy beyond 6).

### Prompt protocol

Three layered techniques used together for each image:

**Style and content reference split.** Each prompt attaches both a style reference image and a content reference image, plus the master template phrasing:

> Create an image of the content as shown in [content reference] but with the same medium, color palette, mood, rendering technique, saturation level, textures, and overall style of [style reference].

**Variable-token prompting.** Treat the prompt like pseudo-code; define key elements as variables (CHARACTER_A, SETTING_B, MOOD_C) and refer to those variables in the prompt body. Reduces drift.

**Trait locking with verbatim phrasing.** Reuse the same descriptive vocabulary across every île prompt. "Visible brush strokes" stays "visible brush strokes" everywhere; never paraphrase as "soft brush effect" or "watercolour rendering" elsewhere.

### Required prompt vocabulary (always present)

visible brush strokes, uneven watercolor wash, imperfect line weight, paper texture visible, natural color bleed at edges, asymmetric composition, hand-drawn imperfections, illustrated character, drawn figures, stylized line work, linocut-inspired

### Required negative prompt (always present)

4K, 8K, photorealistic, hyperreal, Unreal Engine, plastic, smooth, polished, glossy, perfect lighting, AI generated, stock photo, gradient mesh, 3D render

### Multi-round refinement

Iterate in short turns rather than one-shot prompting. First generation establishes the base; follow-up turns adjust specific aspects (saturation, composition, character expression). Each refinement preserves the locked style anchors.

### Storage

Phase 2: /public/iles/[theme]/ in the FE repo. Vercel auto-CDNs the /public folder globally; next/image optimizes per-device resolution; build-time inclusion is negligible at this volume. Image swaps require a commit and Vercel redeploy (acceptable when the founder is sole author).

Phase 5: migrate to DigitalOcean Spaces with CDN when île count grows past 15 or content team joins. The migration is a planned future move, not a Phase 2 concern.

## Content Schema

### MDX frontmatter (YAML)

```yaml
theme: famille
level: b1
display_title: La famille
prerequisites: []
estimated_minutes: 22
persona_priority: [visa-urgent, habit-builder]
image_set: /iles/famille
maitre_audio:
  intro: /iles/famille/audio/b1/intro.mp3
  close: /iles/famille/audio/b1/close.mp3
couche_weights:
  le_propos: 0.25
  le_plan: 0.20
  la_construction: 0.25
  les_pieges_anglais: 0.20
  la_musique: 0.10
actes_de_parole: [se-presenter, decrire-relations, exprimer-affection]
```

### Body

The body of each MDX file is composed of seven typed React mold components. Each component has a fixed prop contract. Content variations live in props, not in custom JSX.

```mdx
<Dialogue 
  audio="/iles/famille/audio/b1/dialogue.mp3"
  transcript={...}
  comprehensionChecks={...}
/>

<ActeDeParole function="se-presenter" phrases={[...]} />

<Chunks items={[
  { fr: "...", en: "...", piege: null, example: "..." },
]} />

<Regle rule="..." examples={[...]} practice={[...]} />

<Phonetique sound="liaison-obligatoire" minimalPairs={[...]} />

<Activite type="comprehension" content={...} />
<Activite type="reflexe" prompts={[...]} />
<Activite type="reemploi" items={[...]} />
<Activite type="conversation" scenario={...} />

<Tache type="oral" consigne="..." rubricWeights={...} />
```

### Architectural note

Content (MDX) ships with the FE bundle. Pages import MDX directly via Next.js MDX support. The BE never reads content; it only tracks state (user_progress, scoring, conversations, recordings). This simplification removes the need for an MDX content loader endpoint and keeps content edits in the git/deploy workflow.

### MDX vs Payload

MDX is locked for Phase 2 (solo author, VS Code workflow, git-versioned, component-driven). The feat/payload-cms branch remains scaffolded and activates at Phase 5 if content help joins and live edits without redeploys become valuable.

## Phase 2 Scope

Phase 2 ships:

- Schema supports all three levels; only B1 is populated
- Three B1 îles (themes selected by founder during authoring)
- Seven mold components built and operational
- /ile/[theme] syllabus view, /ile/[theme]/activites, /ile/[theme]/tache
- /seance daily brain-game with mold queue
- /maitre conversation hub
- /carte persona-adaptive primary CTA
- Le Maître intensity setting at /parametres
- 5-couche scoring per Tâche, level-weighted
- Activity sub-type scoring endpoints
- Level advancement gate (stub at Phase 2; everyone stays at B1)

Phase 2 does not ship:

- A2 and C1 île content (Phase 5)
- Live level advancement logic (stub; activates Phase 5)
- /bibliotheque chunk persistence (Phase 3+)
- Payment activation (Phase 4)
- Pièges authoring catalog (Phase 3 authoring task)

## Dispatch Sequence

Phase 2 spine wiring follows a tracer-bullet pattern. Build one vertical slice end-to-end first, then extend mold by mold. This catches architecture issues early.

1. Foundation: PEDAGOGY.md (this doc) plus islands schema plus user_progress plus target_profile persistence.
2. Vertical slice 1: Dialogue mold plus /ile/[theme] rendering one Dialogue plus progress tracked.
3. Vertical slices 2 through 7: Add each remaining mold one at a time (Chunks, ActeDeParole, Regle, Phonetique, Activite, Tache).
4. Surfaces expand: /ile/[theme]/activites plus /tache, /seance, /maitre.
5. State and scoring: 5-couche scoring per Tâche, activity sub-type scoring, Le Maître orchestration, level advancement gate.
6. Persona and settings: /carte adaptive CTA, /parametres intensity.

Founder authoring track runs in parallel:

- A1: 4 to 6 style reference images locked.
- A2: approximately 18 to 24 image batch generated for 3 îles.
- A3: 3 B1 îles authored as MDX.
- A4: Le Maître audio intros and closes (3 îles, 6 audio files) recorded via ElevenLabs founder voice clone.

## Validation Path

Several design choices are baked in starting values that get tuned against real signal:

- Couche weights per level. Adjusted once 5-couche scoring runs against real Tâche submissions.
- Persona-to-view mapping. Validated once first cohort tests; may add more granular persona assignments.
- Level advancement threshold. Calibrated against pass-rate distributions once real users hit the gate.

PEDAGOGY.md is the canonical place to update these as they validate. Treat the doc as living; commit updates with rationale.
