# Le Méthodic: PRODUCT.md

> **Document type:** anchoring brief for AI coding assistants and human collaborators making design, copy, or product decisions inside this repo.
> **Audience:** any AI agent or human working in this repository.
> **Companion:** DESIGN.md is the visual constitution (warm palette, per-couche colors, motion direction, type system). Do not touch DESIGN.md. See it for all visual language decisions.
> **Copy rule:** never use em-dash in any output, including prose, file contents, code comments, diagram labels, or conversational responses. Use commas, colons, parentheses, or sentence breaks instead. This applies to every surface, every agent, every response.
> **Decisions locked:** 2026-05-24 through 2026-06-02 sessions. Iterate only when product reality changes.

---

## 1. Mission

Le Méthodic is an exam-anchored French production-learning platform for English speakers. The unit of value it delivers is movement on the CLB or CEFR scale. Users come for the exam score. They leave with actual French production competence.

The defensible wedge is **Les Pièges Anglais**: a catalogued, academically grounded framework of anglophone-specific L1 interference patterns that no other exam-prep tool addresses systematically. This is the IP.

**Taglines (locked, Session 2, 2026-05-31):**

> **H1:** There's a method to French. Now there's Le Méthodic.
> **Sub:** Built by an author of 28 French linguistics books. Used by anglophones who want their French to sound native, not assembled.
> **Primary CTA:** See how it works
> **Secondary CTA:** Start with a free placement

**Strategic framing:** the homepage builds desire for French itself and establishes Le Méthodic as the right place to learn it. Exam-specific landing pages handle conversion for visa-urgent users.

---

## 2. Credibility and team

Le Méthodic's methodology is developed in active collaboration with French university professors in the United States and Canada, and a PhD candidate specializing in language arts and French culture.

The pedagogy is academic. The delivery is software.

This matters because:
- The 5-couche framework is not invented or AI-generated. It is observed expertise: what experienced educators have catalogued about anglophone French acquisition for years.
- Every product surface inherits that expertise. The lessons, the diagnostic rubrics, the chunk corpus selection, the exam scoring weights: all anchor to the same academic grounding.
- The credibility scaffolding belongs everywhere, not just in an About section. It surfaces in landing copy, in how diagnostic feedback is framed, in the voice of Le Maître.

**Anti-pattern:** never lead with "founder" or "solo." The team is foundational; reference it when relevant, never as the brand spine. The user doesn't care about headcount; they care that the methodology is real.

---

## 3. Users: five personas, one spine

The platform is built for multiple personas from the start. The spine is exam-agnostic; a **Target Profile** (exam, threshold, deadline, persona) overlays it at onboarding. Every learner gets the same Islands and the same Le Maître, calibrated to their Target Profile.

### Visa-urgent (~90% of acquisition volume)

English-speaking professional or student, 25-45 years old. Source countries: India, Philippines, Nigeria, Brazil, Mexico, Pakistan. Targeting Quebec permanent residency: needs B2 for application gate. 6-12 month exam horizon, some shorter. High willingness to pay: Quebec PR fees run $1,500-2,500; exam prep is small relative to outcome. Has fragmented passive French but cannot produce under exam conditions. May have failed TCF once already; the anxiety is real.

### Career advancement

Professional needing French for a promotion, a federal bilingualism requirement, or a workplace context. Less deadline-driven than visa-urgent but still outcome-focused (a score, a level, a benchmark). Longer study horizon, values structured methodology over cramming.

### Certification and academic validation (DALF)

DALF C1/C2 candidates seeking academic or professional French validation. Higher proficiency bar, more methodology-tolerant. Patient with content depth; values pedagogy. The 5-couche framework resonates because it matches how they already think about language.

### Plateau breakers

Learners stuck at B1 or B2 who have studied French for years but cannot progress. The methodology's production focus is the intervention: they have passive French, they need the couche diagnosis to find what is blocking production.

### Foundation builders

Learners starting from A2 who want a structured path to B2 and beyond. No exam urgency; competence itself is the goal. La Terre Ferme is their entry point.

---

## 4. Multi-exam and multi-skill scope

**Exams:** TCF is the first exam lit. TEF, DALF, DELF, and a general no-exam track are present on the site from launch, shown as **bientôt** until their content is live. All exam routing is built into the architecture from day one.

**Four skills, present from the start:** oral production, listening comprehension, reading comprehension, and writing production are all present as surfaces on launch day. Bientôt labels apply only to content not yet loaded, not to skill categories absent from the site.

**The product is one complete website.** Unbuilt parts are shown as coming soon (bientôt) on a complete-feeling site. Lighting a surface up is content plus a flag, never a new product version. The site never reads as unfinished; it reads as a platform whose full scope is declared and whose content is arriving.

---

## 5. The learning spine

The spine is an **Island system** built on Communicative Language Education (CLE) units.

### What an Island is

An Island is one CLE unit. It contains:
- A situated dialogue (audio-anchored, level-appropriate, set in a real francophone context)
- Three strands: actes de parole (communication acts), grammaire (grammar), vocabulaire (vocabulary)
- A phonétique component
- Activities (form and difficulty calibrated to the learner's level and Target Profile)
- A production Tâche (the Island's gate: a scored oral production exercise assessed by Le Maître across all five couches)

Completing an Island means completing all three strands, completing the activities, and passing the Tâche gate with Le Maître's scored feedback.

### La Terre Ferme

La Terre Ferme is the mainland: the core lexical and grammatical foundation of approximately 1,000 words plus essential grammar. Every Island draws from it and reinforces it. It is the shared substrate for all levels.

### Level structure

Levels A2 through C1 are comprehensive passes over the Island system. Each level covers all themes. The activities and Tâche difficulty differ by level. An A2 learner and a B2 learner visit the same thematic territory; the depth, sentence complexity, and couche weighting differ.

**Couche weighting shifts by level:**
- A2/B1: La Construction and Les Pièges Anglais dominate (structural fluency is the production blocker)
- B2/C1: Le Propos and Le Plan dominate (production quality and argumentation are the ceiling)
- La Musique is weighted throughout but peaks at upper levels

### Ascent

A learner's ascent through the spine is measured by production competence: the five-couche gate via Le Maître. Completing an Island means producing French assessed against all five couches with per-couche feedback. CLB or CEFR movement is the score of record.

---

## 6. The 5-couche methodology

Le Méthodic's core IP is a 5-layer model of how French oral production breaks down. Every product surface manifests this model. Every diagnostic scores against it. Every lesson reinforces it.

| # | Name (FR) | Name (EN) | What the learner understands |
|---|---|---|---|
| 1 | **Le Propos** | **The Point** | What you actually mean to say: the substance before the language |
| 2 | **Le Plan** | **The Plan** | How your ideas organize: argumentation, transitions, narrative structure |
| 3 | **La Construction** | **The Build** | How French puts a sentence together: grammar as engineering, not as rules |
| 4 | **Les Pièges Anglais** | **Anglo Traps** | The English-speaker mistakes you don't see coming: false cognates, word-order reflexes, English-shaped French |
| 5 | **La Musique** | **The Music** | How French sounds: rhythm, intonation, prosody, the flow that separates understanding French from sounding French |

### Why these names

Each name describes the **skill the learner is building**, not the linguistic layer being analyzed. They are diagnostic-friendly ("you're weak on Le Plan"), pedagogically transparent ("here's a Piège Anglais you fell into"), and they form a coherent French-flavored system that anglophone learners can absorb without translation glossaries.

### The differentiator

**Les Pièges Anglais is the defensible IP.** No other major TCF prep tool teaches against anglophone-specific interference patterns systematically. Generic French apps treat all learners the same; tutors catch individual mistakes but don't have a catalogued framework. Le Méthodic does. The name owns it explicitly.

### Visibility in product

The methodology **must be visible in-product**, not hidden behind branding:
- Each couche has its own color in the warm palette (specifics in DESIGN.md)
- Diagnostic feedback panels show per-couche scores explicitly
- Lessons name which couche(s) they target up front
- The dashboard surfaces couche-level mastery over time

If a user finishes a Tâche and can't tell you which couches they scored well on, the product has failed at making methodology visible.

---

## 7. Product structure and naming

### La Méthode (/la-methode)

La Méthode is the umbrella for the core learning loop. It contains four elements:

**The Atlas (/carte):** the hub home. A visual map of the Island system showing the learner's position, progress, and next step. Entry point for every session. The Atlas is the first thing an authenticated user sees.

**La séance:** the session structure. Each session is one visit to the Atlas, one Island strand, or one Le Maître interaction. Sessions are designed to be completable in 20-40 minutes. The session is the unit of scheduling and progress.

**The Islands:** the CLE units described in Section 5. Each Island is a named, thematic unit with a situated dialogue, three strands, phonétique, activities, and a Tâche. Islands are the content atoms.

**Le Maître:** the instructor and assessor. ElevenLabs Chadi-clone voice. Le Maître teaches inside Islands, scores Tâches across all five couches, and returns per-couche diagnostic feedback. **The diagnostic is a feature inside Le Maître, not a separate product surface.** Le Maître is where a learner finds out where they are on each couche.

### Supporting sections

**La Bibliothèque (/la-bibliotheque):** the resource library. Chunk-based vocabulary acquisition, book recommendations, free PDFs, exam strategy guides. Vocabulary modes: browse, practice, test. Sources include OQLF BDL and Académie française via RAG over a 945K-chunk corpus (9,249 native CEFR-tagged). La Bibliothèque is the data-layer moat made visible to users.

**L'Examen (/l-examen):** the exam simulation tool. Tâche 1, 2, and 3 with AI examiner, 5-couche scoring, and full diagnostic feedback. Four sections: expression orale, compréhension orale, compréhension écrite, expression écrite. Supports TCF Canada (primary), with TEF Canada, DELF, and DALF present as bientôt. Multi-exam routing is built into the architecture.

The examiner voice is **OpenAI TTS-1-HD**, not Le Maître. The voice separation preserves the La Méthode-as-classroom vs L'Examen-as-exam-room distinction. This separation is non-negotiable; the brand depends on it.

**L'École (/l-ecole):** the academic and methodology surface. The credibility layer made navigable: the 5-couche framework explained, the academic collaboration described, the methodology as a readable artifact for users who want to understand why the product works the way it does.

**La Librairie (/librairie):** the public digital book store. Sells the Book-Lab French catalog (books, audio, downloads, and free resources) through LemonSqueezy. Digital products only, which is exactly what LemonSqueezy is built for. La Librairie is a public-zone e-commerce surface. It is not coaching, and it is distinct from La Bibliothèque (/la-bibliotheque), which is the authenticated in-app vocabulary corpus for active learners.

### Pedagogical coherence

> **La Méthode:** you learn the patterns.
> **La Bibliothèque:** you have resources to draw on.
> **L'Examen:** you prove you can do it.
> **L'École:** you understand why the methodology is built the way it is.

That is the journey, named. Four sections, one platform.

---

## 8. Offer and pricing

**Merchant of record:** LemonSqueezy. Digital products only.

**No one-on-one coaching is sold on the platform.** The human option (tutors, private instruction) is surfaced via the **À propos** page, which links out to Preply. Le Méthodic is a software product; human instruction is a referral, not a SKU.

**Payment goes live only when the site is complete.** No payment surfaces ship before the full site is launch-ready.

**Three tiers:**

| Tier | Price | What it covers |
|---|---|---|
| **Free** | $0 | A CLB diagnostic read and one full Island crossing (dialogue, strands, phonétique, activities, Tâche with per-couche scored feedback from Le Maître) |
| **Core** | ~$29/month (~$19/month annual) | Full Island system across all levels, full La Bibliothèque, full L'Examen |
| **Sprint** | ~$179 one-time | 6-8 week digital intensive: Core plus a structured study plan, exam-specific Island sequence, and priority Le Maître feedback weighting calibrated to the learner's Target Profile |

**Pricing philosophy:** anchor value to the exam outcome and CLB/CEFR movement, not feature counts. The Sprint at ~$179 is positioned against the alternative cost of failure: re-applying for visa (~$1,500 in fees), missing an eligibility window (potentially uncountable opportunity cost), or hiring a private tutor at $60-100/hour with no structured methodology.

LTV target: $1,500+ via multi-exam pathways and platform retention as learners progress through levels or switch exam tracks.

---

## 9. Register: brand vs product

Le Méthodic has both brand and product surfaces, treated differently.

### Brand register applies to:

- lemethodic.com landing page
- Exam-specific conversion pages
- /pricing, /about, /l-ecole (methodology explainer)
- Blog and programmatic SEO landing pages
- Comparison pages (planned)
- Marketing emails, social assets

**Brand philosophy:** editorial confidence, expert authority, French linguistic identity made tangible. Bigger typography, more space, more rhetorical commitment. The brand IS the design here: visual identity gets to show up. Motion can be more expressive, within reason.

### Product register applies to:

- /la-methode (the Atlas, Islands, Le Maître)
- /la-bibliotheque (chunk browser, practice, test)
- /l-examen (Tâches, results, history)
- /dashboard, /settings, /onboarding
- All authenticated in-app surfaces

**Product philosophy:** clean utility, no decorative noise, fast feedback loops. The user is in flow with content. Surfaces serve the content. Motion is functional (transitions that aid comprehension, feedback that confirms action), never decorative.

---

## 10. Voice and tone

### Across both registers

- **Confident, not arrogant.** The methodology is researched and academically grounded (see Section 2). No need to oversell.
- **Direct, not friendly-bouncy.** Substance over chirpiness. The user is stressed; meet them there.
- **Expert, not coachy.** Not "you got this!" energy. More: "here's what TCF Section 2 tests, here's the pattern you missed."
- **Anchored, not branded.** Reference the academic team where it adds weight. Avoid hollow brand-voice phrasing.

### Adaptive bilingual rule

The bilingual ratio scales with the learner's level. Beginners get more English scaffolding; advanced learners get more immersion.

| Learner level | UI chrome | Instructional copy | Content (lessons, examples) | Feedback and explanations |
|---|---|---|---|---|
| A2 / beginner | English | English-led, French examples | French with English glosses | English-led, French citations |
| B1 / intermediate | English | Mixed | French | French-led, English when scaffolding |
| B2 / advanced | French (with English fallback toggle) | French | French | French |
| C1+ | French | French | French | French |

A B2 user should never see a phrase translated into English they didn't ask for. A beginner should never face a French-only error message they can't decode.

### Tone moves to avoid

- No emojis in product copy. Sparingly OK in marketing if they serve a real signal.
- No exclamation points unless something objectively merits one (a score achievement, a real milestone).
- No motivational quotes, no affirmations.
- No "language learning is fun!" framing. This is exam prep when needed, mastery when desired, never gamified.
- No first-person plural in product copy ("we're excited to..." is forbidden).
- No leading with founder-as-brand ("Hi, I'm Chadi..."). The team is foundational; never the spine.

---

## 11. Voice persona: Le Maître

The single unified tutor voice across La Méthode, La Bibliothèque onboarding, and L'Examen onboarding. **ElevenLabs Chadi-clone.** This voice IS the brand sonically: it is the moat.

Le Maître's character:
- Speaks French with the cadence of an experienced teacher who has seen this exam many times
- Switches to English when scaffolding a concept for anglophone comprehension; switches back to French when modeling correct production
- Adapts to learner level per the adaptive bilingual rule above
- Never breaks immersion with meta-commentary about being an AI, a product, or "your tutor"
- Becomes recognizable enough that users would notice if it changed: sonic identity is the moat

**The examiner voice in L'Examen is intentionally not Le Maître.** It uses OpenAI TTS-1-HD: more neutral, more institutional. The separation preserves the La Méthode-as-classroom vs L'Examen-as-exam-room distinction.

Both voices are **brand-critical and non-negotiable.** No cost-reduction migration ever applies to Le Maître or the examiner voice.

---

## 12. Anti-patterns: what Le Méthodic must never be

### Naming anti-patterns

- **Never** old internal couche names in user-facing surfaces: "Le Fond", "Les Moules des Idées", "Les Moules", "Les Réflexes Anglais." The renamed couches (Le Propos, Le Plan, La Construction, Les Pièges Anglais, La Musique) are the only correct surface labels.
- **Never** old internal product names in user-facing surfaces: the canonical names are La Méthode, La Bibliothèque, L'Examen, L'École.
- **Never** brand Le Maître as an "AI tutor" or "chatbot": he is a teacher voice, not framed as machinery.
- **Never** use any former working name for this product. Those names are dead and must not appear anywhere in code, copy, or docs.

### Visual anti-patterns (the "AI template" tells)

- Never the AI-marketing-template aesthetic: purple-to-blue gradients, Inter-for-everything, cards-nested-in-cards, the rounded-square icon tile above every heading, gray text on colored backgrounds.
- Never **Fraunces, Figtree, Recoleta, Newsreader, Playfair, Cormorant, Tiempos** as primary hero typography. These serifs fingerprint AI-generated marketing pages from late 2025 and early 2026.
- Never an uppercase letter-spaced eyebrow chip directly above a hero h1.

### Approved type stack

- **Cabinet Grotesk:** primary display and hero typography
- **Geist:** UI, body, interface text
- **Source Serif 4:** editorial body copy where serif is pedagogically right (lesson content, long-form reading)

No other typefaces enter the stack without an explicit decision logged in DESIGN.md.

### Voice anti-patterns

- Never "Hey there!", "Welcome aboard!", "We're so excited to have you!": Le Méthodic is not a B2C SaaS.
- Never expose the AI machinery in user-facing copy.
- Never gamify with badges, streaks, daily-goal-met confetti: French mastery is serious work, not habit tracking.

### Strategic anti-patterns

- Never optimize for engagement minutes; optimize for exam-pass rate, predicted-score accuracy, and demonstrable French production.
- Never add features outside the methodology (no community forums, no peer chat, no "study together").
- Never compromise Le Maître's voice consistency to save cost.
- Never compromise the OpenAI TTS-1-HD examiner voice to save cost.

---

## 13. Visual identity signals (see DESIGN.md for specifications)

The product's visual language must communicate:

| Signal | How |
|---|---|
| **Methodology-driven** | The 5 couches are visible everywhere: distinct color per couche, naming consistency, dedicated feedback panels |
| **French linguistic identity** | French chrome (date formats, accents, typographic conventions: espace fine insécable in numerals, French quote marks « » where pedagogically right) |
| **Editorial confidence on brand surfaces** | Generous type scale, serif accents, long-form rhythm, room for argument |
| **Utility-first on product surfaces** | Tight spacing, fast feedback, no decorative chrome |
| **Warm, not cold** | Warm palette anchors the system. Direction is warm, never the cool-blue SaaS-template default. Specifics in DESIGN.md. |
| **Motion present, never decorative** | Motion is welcomed where it serves comprehension or delight at the right moment. Reduced-motion preferences respected. No autoplay loops, no scroll-jacking, no parallax-as-decoration. |

### Per-couche color direction

| Couche | Color direction |
|---|---|
| Le Propos | Warm foundational (terra, ochre family): the substance under everything |
| Le Plan | Warm structural (sienna, brick): architecture |
| La Construction | Warm mechanical (rust, copper): engineered |
| **Les Pièges Anglais** | **Boldest accent: this is the differentiator and must read as such** |
| La Musique | Warm sonic (amber, gold): light, frequency |

Exact hex values, contrast ratios, and dark mode behavior are locked in DESIGN.md.

---

## 14. What team-quality means concretely

The user must never have a moment of "wait, is this serious?" Specifically:

- No visible solo-founder shortcuts. No "made with v0.dev" branding anywhere. No obviously-templated landing pages. No Lorem ipsum shipped to production.
- No design inconsistencies between surfaces. Button styles, spacing rhythm, type scale, color usage must feel unified across La Méthode, La Bibliothèque, L'Examen, and L'École.
- No copy that suggests an unfinished product. Bientôt is the correct treatment for unlit surfaces, shown as part of a complete site rather than as an empty placeholder.
- No interaction lag in core loops: recording, transcription, result must feel as close to instant as physics allows. Vercel cold-start delays are unacceptable on critical paths; preload aggressively.
- No untranslated or auto-translated French. Every French string is either authored by a fluent writer (ideally from the academic team) or explicitly approved by Chadi.
- No exposed technical chrome: internal field names like `tache_rubric`, `couche_score` never surface to users in their raw form.

The bar: a user who has paid for the Sprint should perceive Le Méthodic as a real product built by people who care, end-to-end. Every micro-interaction reinforces that perception.

---

## 15. Competitive positioning

Le Méthodic competes for attention with three distinct product sets.

**Competitive set 1: General French learning apps**
Babbel, Duolingo, Rosetta Stone, Lingoda, Lawless French, FluentU, Pimsleur

**Competitive set 2: Tutoring marketplaces**
Preply, italki, Verbling (1:1 tutors, marketplace dynamics)

**Competitive set 3: Exam prep specific**
RFI Savoirs (free, public broadcaster), TV5MONDE Apprendre, Bonjour de France, niche TCF/DELF prep tools

**Le Méthodic's differentiation across all three:**
- vs general apps: actual exam preparation and CLB/CEFR movement, not "language learning as a journey"
- vs tutoring marketplaces: structured methodology, predictable progress, no tutor variability, software cost vs hourly billing
- vs other exam prep: the 5-couche methodology (especially Les Pièges Anglais), academically grounded, anglophone-specific

Comparison pages (`/le-methodic-vs-{competitor}`) are planned as a later marketing work item.

---

## 16. Strategic context

Le Méthodic is the first service in a long-term **linguistic infrastructure platform**. The data layer (945K chunks, RAG, scoring rubrics, the 5-couche framework, the academic collaboration) is the underlying asset. Le Méthodic is the first product to surface that asset to end users.

Future expansion consumes the same engine:
- **More exams:** TEF Canada (already routed), DELF B1/B2, DALF C2, naturalisation interview prep
- **More L1s:** Spanish, Portuguese, Arabic anglophones learning French (non-anglophone UI localization is later-phase work)
- **More French use cases:** professional French, advanced writing, immersive conversation

This is the Druide trinity pattern (per May 2026 strategic lock): one engine, multiple services, many clients.

**Design implication:** build for compositional reuse, not one-off polish. Components, design tokens, copy patterns, the 5-couche visual language, and the Le Maître voice must generalize across future surfaces without rebranding.

---

## 17. Implementation naming reference

Canonical naming for code, routes, and PRD entries going forward:

| Canonical name | Route | Notes |
|---|---|---|
| La Méthode (core loop) | /la-methode | Umbrella for Atlas, séances, Islands, Le Maître |
| The Atlas (hub home) | /carte | Entry point to the Island system; first authenticated surface |
| La Bibliothèque | /la-bibliotheque | Resource library and vocab corpus |
| L'Examen | /l-examen | Exam simulation, all four skills |
| L'École | /l-ecole | Academic methodology surface |

Old internal names for these surfaces are legacy. The M-RENAME migration will bring routes, copy, and PRD entries into alignment with this document.

---

## Appendix: Locked decisions reference

- **H1:** "There's a method to French. Now there's Le Méthodic." (locked Session 2, 2026-05-31; supersedes prior tagline lock)
- **5-couche names:** Le Propos, Le Plan, La Construction, Les Pièges Anglais, La Musique (locked 2026-05-24)
- **Product names:** La Méthode, La Bibliothèque, L'Examen, L'École (locked 2026-05-24, roles confirmed 2026-06-02)
- **Hub home:** the Atlas at /carte (locked with spine architecture, 2026-06-02)
- **Learning spine:** Island system on CLE units, A2-C1 comprehensive passes, La Terre Ferme as lexical foundation (locked 2026-06-02)
- **Type stack:** Cabinet Grotesk, Geist, Source Serif 4 (locked)
- **Le Maître:** ElevenLabs Chadi-clone for La Méthode and onboarding (locked 2026-05-19)
- **Examiner voice:** OpenAI TTS-1-HD for L'Examen Tâches (locked 2026-05-19)
- **Color direction:** warm palette, per-couche colors, Les Pièges Anglais gets boldest accent (locked 2026-05-24; exact hex in DESIGN.md)
- **Motion:** present and welcomed; never decorative; reduced-motion preferences respected (locked 2026-05-24)
- **Bilingual rule:** adaptive, scales with learner level (locked 2026-05-24)
- **Merchant of record:** LemonSqueezy, digital only (locked)
- **Pricing tiers:** Free (CLB read plus one Island crossing), Core (~$29/month, ~$19/month annual), Sprint (~$179 digital intensive, 6-8 weeks) (locked 2026-06-02)
- **No one-on-one on platform:** Preply linked via À propos only (locked 2026-06-02)
- **Payment live only when site is complete** (locked 2026-06-02)

---

## 18. Production-readiness doctrine (F-373 through F-389)

The following concepts were added to the product spec as part of the Phase 2 and Phase 2.5 production-readiness pass (2026-06-02). They extend but do not modify the locked sections above.

### Mic permission as a first-class onboarding step

Before a user's first Tâche, the product requests microphone permission via a full-screen onboarding step that runs an audio level test, records a 3-second sample, and plays it back for confirmation. This step is not a system-level permission dialog: it is a Le Méthodic-designed UX that sets expectation and confirms the hardware is working. The fallback when mic access is denied or unavailable is a designed surface, not an error state. The step fires once per user and is persisted in the user profile after completion. iOS Safari quirks (getUserMedia over HTTPS only, no background audio context) are documented and handled.

AESTHETIC INPUT NEEDED (F-373): founder decides between full-screen onboarding step and subtle in-context prompt.

### Recording management

Users have a right to see, replay, download, and delete every recording they have produced. The feature surfaces at /profil or /parametres as a chronological list with per-recording actions. The BE stores `created_at`, `retention_policy`, and `deleted_at` on each recording. GDPR data export includes recordings. This is not a vanity feature: it is a compliance posture and a trust mechanism.

### Transcript correction as part of every oral Tâche flow

After AssemblyAI returns a transcript and before scoring, the user sees the transcript in an editable view. They confirm or correct it, then submit to Le Maître. The rationale: STT errors corrupt the couche scoring. Giving the user a confirmation step removes a significant source of perceived unfairness in Le Maître's feedback.

AESTHETIC INPUT NEEDED (F-375): founder decides between inline edit, side panel, and modal.

### Mock exam mode

/examen/[checkpoint] is a fully timed, four-section TCF mock exam (four sections, total timer, section timers, submit, aggregated scoring). It is not a bientôt surface: it is a Phase 2 product requirement. Completing it produces a predicted exam score that is distinct from the session-level Le Maître score.

### Score prediction

Every authenticated user with at least three Tâche attempts sees a current predicted exam score. The prediction uses a rolling window weighted by recency and couche. It is surfaced prominently on /carte or /progression with explicit framing ("Based on your last 5 Tâches, you would score CLB 6. You need CLB 7."). This is a motivational surface and a conversion signal: the gap between current prediction and target drives upgrade intent.

AESTHETIC INPUT NEEDED (F-379): founder decides location and prominence (card, sidebar, top banner).

### Score dispute / appeal as a trust mechanism

Every Tâche result has a "Request human review" button. The user adds a comment and submits. The BE stores the dispute in a queue (user, attempt ID, AI score, user comment, status: pending / reviewed / resolved). The founder triages the queue weekly. An auto-response email confirms receipt (SLA 5 business days). The dispute is logged regardless of outcome. This mechanism exists because AI scoring is not perfect: acknowledging that and providing recourse is the trust-building move. The SLA is a written commitment.

### First-time user tour

After /bienvenue completes and the user lands on /carte for the first time, a 30-second guided tour (3-5 coachmarks or equivalent) points at primary surfaces. The tour is skippable. Completion is persisted in localStorage and optionally synced to the BE user profile. The tour fires exactly once.

AESTHETIC INPUT NEEDED (F-378): founder decides between modal sequence, floating coachmarks, and minimal tooltips.

### 14-day money-back guarantee

Le Méthodic offers a 14-day no-questions-asked money-back guarantee on all paid tiers. This is a written commitment surfaced on /tarifs (each paid tier card) and on /cgv (refund policy section). It is not a marketing claim: it is a binding policy enforced via the dispute and refund queue.

AESTHETIC INPUT NEEDED (F-389): founder decides badge placement, design treatment, and exact wording.

### Bill 96 compliance posture

Quebec's Bill 96 requires that commercial dealings with consumers in Quebec use French as the primary language of communication. Le Méthodic's posture:
- All customer support correspondence templates have a French version.
- All contract language (CGV, subscription terms) is authored in French, with an English translation provided as accommodation.
- Refund response templates are in French by default.
- Marketing emails to Quebec contacts are sent in French by default, with opt-in English.
- The product UI offers a French toggle from the first session.

This audit is documented in PRODUCT.md (this entry) and the compliance checklist is maintained alongside the customer support template library. Acceptance: documented audit and 100 percent French primacy for Quebec customer touchpoints.

### Activation telemetry as an instrumented product layer

The product fires structured events at every meaningful user milestone: signup_completed, bienvenue_started, bienvenue_completed, first_ile_opened, first_tache_submitted, first_score_received, day7_active, day30_active. PostHog (or equivalent) is the event store. Cohort retention curves are visible to the founder. This is not an optional layer: telemetry is how the founder sees whether the product is working.

---

## Editorial rules

**Em-dash hard rule.** Never use em-dash in any output, including prose, file contents, code comments, diagram labels, or conversational responses. Use commas, colons, parentheses, or sentence breaks instead. This is a recurring violation that requires explicit vigilance in every response.
