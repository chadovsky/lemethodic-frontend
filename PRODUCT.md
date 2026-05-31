# Le Méthodic: PRODUCT.md

> **Document type:** anchoring brief for AI coding assistants (impeccable, taste-skill, ui-ux-pro-max, Sonnet in Claude Code).
> **Audience:** any AI agent or human collaborator making design, copy, or product decisions inside this repo.
> **Companion:** `DESIGN.md`: visual constitution (warm palette, per-couche colors, motion direction, type system). To be authored after this is locked.
> **Status:** v1, decisions locked 2026-05-24. Iterate further only when product reality changes.

---

## 1. Mission

Le Méthodic exists to teach English speakers to **produce French**: to stop translating in their heads and start speaking, thinking, and being understood.

The acute version of this mission is exam prep. Most users land needing to pass **TCF Canada** for Quebec permanent residency, sometimes **TEF Canada**, **DELF**, or **DALF**. They need a measurable score by a specific date.

But Le Méthodic is not narrowly an exam-prep tool. It is a **French learning platform** built on a methodology that works for the exam *because* it works for the language. Users come for the exam. They stay, or leave with, actual French.

**Locked taglines (per F-300a/b, 2026-05-09):**

> **H1:** Stop translating. Start producing French.
> **Subhead:** The method, the exams, the books: built for English speakers.

The subhead is also the product architecture: **The Method · The Exams · The Books.** Three products. One platform.

---

## 2. Credibility & team

Le Méthodic's methodology is **developed in active collaboration with French university professors in the United States and Canada, and a PhD candidate specializing in language arts and French culture.**

The pedagogy is academic. The delivery is software.

This matters because:
- The 5-couche framework is not invented or AI-generated. It is observed expertise: what experienced educators have catalogued about anglophone French acquisition for years.
- Every product surface inherits that expertise. The lessons, the diagnostic rubrics, the chunk corpus selection, the exam scoring weights: all anchor to the same academic grounding.
- The credibility scaffolding belongs *everywhere*, not just in an "About" section. It surfaces in landing copy, in how diagnostic feedback is framed, in the voice of Le Maître.

**Anti-pattern in this section:** never lead with "founder" or "solo." The team is foundational; reference it when relevant, never as the brand spine. The user doesn't care about headcount; they care that the methodology is real.

---

## 3. Users: acquisition persona vs platform positioning

Two distinct things, often conflated. Keep them separate.

### Acquisition persona (90% of paid users)

**The Visa-Urgent TCF Canada anglophone.**

- English-speaking professional or student, 25-45 years old
- Source countries: India, Philippines, Nigeria, Brazil, Mexico, Pakistan (per GTM lock, May 17)
- Targeting Quebec permanent residency: needs B2 for application gate
- 6-12 month exam horizon (some shorter, some longer)
- High willingness to pay: Quebec PR fees alone run $1.5-2.5K; exam prep is small relative to outcome
- Has fragmented passive French (lived in Montreal, took school French) but cannot reliably *produce* under exam conditions
- May have failed TCF once already; the anxiety is real

### Secondary acquisition persona (10%)

**DALF C1/C2 candidates.**

- Academic or professional French validation, not visa-driven
- Higher proficiency bar, more methodology-tolerant
- Patient with content depth; values pedagogy

### Platform positioning

Le Méthodic positions as **a French learning platform for English speakers**, of which exam preparation is the most acute use case. This distinction matters operationally:

| Surface | Audience model |
|---|---|
| `lemethodic.com` (brand landing) | Platform positioning: speaks to the broad "produce French" promise |
| `/exam-prep` (conversion surface) | Acquisition persona: speaks to the visa-urgent pain directly |
| `/la-methode`, `/la-bibliotheque` | Platform: what users use after they sign up, regardless of why they came |
| `/l-examen` | Acquisition persona: the wedge made operational |

Long-term TAM grows along three axes: more exams (TEF, DELF, DALF, naturalisation interview), more L1s (Spanish, Portuguese, Arabic anglophones learning French), and more learning surfaces (conversation, writing, reading comprehension as services on the same engine).

---

## 4. Product purpose: the transformation

The before/after Le Méthodic delivers:

**Before:** the user is overwhelmed. The exam is opaque. Self-study materials are scattered across YouTube, blog posts, and downloaded PDFs of dubious quality. Tutors are expensive ($60-100/hour) and rarely structured around the exam. Time is short. They have *some* French but cannot produce it on demand.

**After:** the user understands the exam architecture, has practiced under simulated conditions, knows which of their five couches are weakest, and can predict their score within a few points before they sit down. They have moved from translating in their head to building French sentences directly.

Le Méthodic compresses what would otherwise be 6 months of confused self-study into a focused 1-3 month sprint.

---

## 5. The 5-couche methodology

Le Méthodic's core IP is a 5-layer model of how French oral production breaks down. Every product surface manifests this model. Every diagnostic scores against it. Every lesson reinforces it.

| # | Name (FR) | Name (EN) | What the learner understands |
|---|---|---|---|
| 1 | **Le Propos** | **The Point** | What you actually mean to say: the substance before the language |
| 2 | **Le Plan** | **The Plan** | How your ideas organize: argumentation, transitions, narrative structure |
| 3 | **La Construction** | **The Build** | How French puts a sentence together: grammar as engineering, not as rules |
| 4 | **Les Pièges Anglais** | **Anglo Traps** | The English-speaker mistakes you don't see coming: false cognates, word-order reflexes, English-shaped French |
| 5 | **La Musique** | **The Music** | How French sounds: rhythm, intonation, prosody, the flow that separates *understanding French* from *sounding French* |

### Why these names

Each name describes the **skill the learner is building**, not the linguistic layer being analyzed. They are diagnostic-friendly ("you're weak on Le Plan"), pedagogically transparent ("here's a Piège Anglais you fell into"), and they form a coherent French-flavored system that anglophone learners can absorb without translation glossaries.

### The differentiator

**Les Pièges Anglais (Anglo Traps) is the defensible IP.** No other major TCF prep tool teaches against anglophone-specific interference patterns systematically. Generic French apps treat all learners the same; tutors catch individual mistakes but don't have a catalogued framework. Le Méthodic does. The name owns it explicitly.

### Visibility in product

The methodology **must be VISIBLE** in-product, not hidden behind branding:
- Each couche has its own color in the warm palette (specifics in DESIGN.md)
- Diagnostic feedback panels show per-couche scores explicitly
- Lessons name which couche(s) they target up front
- The dashboard surfaces couche-level mastery over time

If a user finishes a Tâche and can't tell you which couches they scored well on, the product has failed at making methodology visible.

---

## 6. The three products

The three products map directly to the three nouns in the subhead: **method · exams · books**.

### 6.1 La Méthode (The Method)

The 27-lesson curriculum teaching the 5-couche methodology. Fondations 1-16 (foundational, accessible from A2) + Approfondissement 17-27 (advanced application, B2→C1). Le Maître is the instructor voice.

Status: shipped. Internal name in code/legacy: `L'École`. Rename in progress.

This is the *namesake* product. The platform is **Le Méthodic**; the foundational product is **La Méthode**. The pun is intentional: methodology as brand, brand as methodology.

### 6.2 La Bibliothèque (The Library)

A library of resources: chunk-based vocabulary acquisition, book recommendations, free PDFs, exam strategy guides. Vocabulary modes: browse, practice, test, tutor. Sources include OQLF BDL and Académie française via RAG over a 945K-chunk corpus (9,249 native CEFR-tagged).

Status: MVP shipped (chunk-based vocab); books and free resources surface to be built. Internal name in code/legacy: `Le Vocabulaire`. Rename in progress.

The Library is the **data-layer moat made visible to users.** The corpus that powers the platform also gives users a resource they can browse independently. Future: paid PDFs, e-books, downloadable exam strategy packs.

### 6.3 L'Examen (Exam Prep)

The exam simulation tool. Tâche 1, 2, and 3 with AI examiner, 4-couche scoring, full diagnostic feedback. Supports TCF Canada (primary), TEF Canada, DELF, DALF. Multi-exam routing is built into the architecture.

Status: in progress. Internal name in code/legacy: `Le Diagnostic`. Rename in progress.

L'Examen uses **OpenAI TTS-1-HD as the examiner voice**, intentionally NOT Le Maître. The voice separation preserves the boundary between *La Méthode-as-classroom* and *L'Examen-as-exam-room*. This separation is non-negotiable; the brand depends on it.

### Pedagogical coherence

These three products tell a learning journey:

> **La Méthode**: you LEARN the patterns.
> **La Bibliothèque**: you have RESOURCES to draw on.
> **L'Examen**: you PROVE you can do it.

That's the journey, named. Three sentences in the subhead, three products on the platform, three tabs in the nav.

---

## 7. Register: brand vs product

Le Méthodic has both BRAND and PRODUCT surfaces, and they get treated differently.

### Brand register applies to:
- `lemethodic.com` landing page
- `/exam-prep` conversion surface
- `/pricing`, `/about`, `/methode` (marketing version of the method explainer)
- Blog and programmatic SEO landing pages
- `/le-methodic-vs-{competitor}` comparison pages (planned, Phase A.3)
- Marketing emails, social assets

**Brand philosophy:** editorial confidence, expert authority, French linguistic identity made tangible. Bigger typography, more space, more rhetorical commitment. The brand IS the design here: visual identity gets to show up. Motion can be more expressive (within reason).

### Product register applies to:
- `/la-methode` (lesson player) and its routes
- `/la-bibliotheque` (chunk browser, practice, test, tutor)
- `/l-examen` (Tâche 1/2/3, results, history)
- `/dashboard`, `/settings`, `/onboarding`
- All authenticated in-app surfaces

**Product philosophy:** clean utility, no decorative noise, fast feedback loops. The user is in flow with content. Surfaces serve the content. Motion is functional (transitions that aid comprehension, feedback that confirms action): never decorative.

---

## 8. Voice & tone

### Across both registers

- **Confident, not arrogant.** The methodology is researched and academically grounded (see Credibility section above). There's no need to oversell.
- **Direct, not friendly-bouncy.** Substance over chirpiness. The user is stressed; meet them there.
- **Expert, not coachy.** Not "you got this!" energy. More: "here's what TCF Section 2 tests, here's the pattern you missed."
- **Anchored, not branded.** Reference the academic team where it adds weight. Avoid hollow brand-voice phrasing.

### Adaptive bilingual rule

The bilingual ratio scales with the learner's level. Beginners get more English scaffolding; advanced learners get more immersion.

| Learner level | UI chrome | Instructional copy | Content (lessons, examples) | Feedback / explanations |
|---|---|---|---|---|
| A2 / beginner | English | English-led, French examples | French with English glosses | English-led, French citations |
| B1 / intermediate | English | Mixed | French | French-led, English when scaffolding |
| B2 / advanced | French (with English fallback toggle) | French | French | French |
| C1+ | French | French | French | French |

The user's level is captured at onboarding and adapts every surface. **A B2 user should never see a phrase translated into English they didn't ask for.** A beginner should never face a French-only error message they can't decode.

### Tone moves to avoid

- No emojis in product copy. Sparingly OK in marketing if they serve a real signal.
- No exclamation points unless something objectively merits one (a score achievement, a real milestone).
- No motivational quotes, no "you can do it" affirmations.
- No "language learning is fun!" framing. This is exam prep when needed, mastery when desired, never gamified.
- No first-person plural in product copy ("we're excited to..." → never).
- No leading with founder-as-brand ("Hi, I'm Chadi..."). The team is foundational; never the spine.

---

## 9. Voice persona: Le Maître

The single unified tutor voice across La Méthode, La Bibliothèque onboarding, and L'Examen onboarding. **ElevenLabs Chadi-clone**, approximately $1.2K/year. This voice IS the brand sonically: it is the moat.

Le Maître's character:

- Speaks French with the cadence of an experienced teacher who has seen this exam many times
- Switches to English when scaffolding a concept for anglophone comprehension; switches back to French when modeling correct production
- Adapts to learner level (per the adaptive bilingual rule above)
- Never breaks immersion with meta-commentary about being an AI, a product, or "your tutor"
- Becomes recognizable enough that users would notice if it changed: sonic identity is the moat

**The examiner voice in L'Examen is intentionally NOT Le Maître.** It uses OpenAI TTS-1-HD: more neutral, more institutional. The separation preserves the *La Méthode-as-classroom / L'Examen-as-exam-room* distinction.

Both voices are **brand-critical and non-negotiable.** No cost-reduction migration ever applies to Le Maître or the examiner voice.

---

## 10. Anti-patterns: what Le Méthodic must NEVER be

If the product or any surface starts to look like the following, it has drifted.

### Naming anti-patterns
- **Never** "FluentPrep" or "FluentPath": those names are dead and must not appear anywhere.
- **Never** "Le Raccourci": predecessor name, obsolete.
- **Never** old internal couche names in user-facing surfaces: "Le Fond", "Les Moules des Idées", "Les Moules", "Les Réflexes Anglais." The renamed couches (Le Propos / Le Plan / La Construction / Les Pièges Anglais / La Musique) are the only correct surface labels.
- **Never** old internal product names in user-facing surfaces: "L'École", "Le Vocabulaire", "Le Diagnostic." Use La Méthode / La Bibliothèque / L'Examen.
- **Never** brand Le Maître as an "AI tutor" or "chatbot": he is a *teacher voice*, not framed as machinery.

### Visual anti-patterns (the "AI template" tells)
- Never the AI-marketing-template aesthetic: purple-to-blue gradients, Inter-for-everything, cards-nested-in-cards, the rounded-square icon tile above every heading, gray text on colored backgrounds.
- Never **Fraunces, Figtree, Recoleta, Newsreader, Playfair, Cormorant, Tiempos** as primary hero typography. These specific serifs fingerprint AI-generated marketing pages from late-2025 and early-2026.
- Never an uppercase letter-spaced eyebrow chip directly above a hero h1.

### Approved type stack
- **Cabinet Grotesk**: primary display / hero typography
- **Geist**: UI / body / interface text
- **Source Serif 4**: editorial body copy where serif is pedagogically right (lesson content, long-form reading)

No other typefaces enter the stack without an explicit decision logged in DESIGN.md.

### Voice anti-patterns
- Never "Hey there!", "Welcome aboard!", "We're so excited to have you!": Le Méthodic is not a B2C SaaS.
- Never expose the AI machinery in user-facing copy.
- Never gamify with badges, streaks, daily-goal-met confetti: French mastery is serious work, not habit tracking.

### Strategic anti-patterns
- Never optimize for engagement minutes; optimize for exam-pass rate, predicted-score accuracy, and demonstrable French production.
- Never add features outside the methodology (no community forums, no peer chat, no "study together"): these are anglophone-SaaS instincts that don't serve the persona.
- Never compromise Le Maître's voice consistency to save cost.
- Never compromise the OpenAI TTS-1-HD examiner voice to save cost.

---

## 11. Visual identity signals (preview: DESIGN.md will go deep)

The product's visual language must communicate:

| Signal | How |
|---|---|
| **Methodology-driven** | The 5 couches are visible everywhere: distinct color per couche, naming consistency, dedicated feedback panels |
| **French linguistic identity** | French chrome (date formats, accents, typographic conventions: espace fine insécable in numerals, French quote marks « » where pedagogically right) |
| **Editorial confidence on brand surfaces** | Generous type scale, serif accents, long-form rhythm, room for argument |
| **Utility-first on product surfaces** | Tight spacing, fast feedback, no decorative chrome |
| **Warm, not cold** | Warm palette anchors the system. Specifics in DESIGN.md but the direction is *warm*, never the cool-blue SaaS-template default. |
| **Motion present, never decorative** | Motion is welcomed where it serves comprehension or delight at the right moment. Reduced-motion preferences respected. No autoplay loops, no scroll-jacking, no parallax-as-decoration. |

### Per-couche color anchoring (direction, not specification)

| Couche | Color direction |
|---|---|
| Le Propos | Warm foundational (terra, ochre family): the substance under everything |
| Le Plan | Warm structural (sienna, brick): architecture |
| La Construction | Warm mechanical (rust, copper): engineered |
| **Les Pièges Anglais** | **Boldest accent: this is the differentiator and must read as such** |
| La Musique | Warm sonic (amber, gold): light, frequency |

Specifics: exact hex values, contrast ratios, dark mode behavior. Locked in DESIGN.md.

---

## 12. Strategic context

Le Méthodic is the **first service** in a long-term **Linguistic Infrastructure Platform** play. The data layer (945K chunks, RAG, scoring rubrics, the 5-couche framework, the academic collaboration) is the underlying asset. Le Méthodic is the first product to surface that asset to end users.

Future products consume the same engine without rebranding:
- **More exams:** TEF Canada (already routed), DELF B1/B2, DALF C2, naturalisation interview prep
- **More L1s:** Spanish, Portuguese, Arabic anglophones learning French (non-anglophone UI localization is Phase A.3+ work)
- **More French use cases:** writing, reading comprehension, immersive conversation, professional French

This is the **Druide trinity pattern** (per May 18 strategic lock): one engine → multiple services → many clients.

**Design implication:** build for compositional reuse, not one-off polish. Components, design tokens, copy patterns, the 5-couche visual language, and the Le Maître voice should all generalize across future surfaces without rebranding.

---

## 13. Pricing context

- **$9-19 à la carte** (individual lessons, single Tâche, chunks)
- **$19 Daily Bundle** (per-day pricing)
- **$29 Exam Bundle** (subscription)
- **$49 Pro** (full platform access)
- **$199 Sprint** (one-time, the headline product: focused 1-3 month exam prep)

LTV target: $1,500+ via multi-exam pathways and platform retention.

Pricing surfaces communicate value-anchored to the exam outcome and to long-term French acquisition, **not** feature-counted. The Sprint at $199 is positioned against the alternative cost of failure: re-applying for visa (~$1,500 in fees), missing eligibility window (potentially uncountable opportunity cost), or hiring a private tutor at $60-100/hr (8-15 sessions to reach the same point, $500-1,500 with no guarantee of structured progress).

---

## 14. What "team-quality" means concretely

The user must never have a moment of *"wait, is this serious?"* Specifically:

- No visible solo-founder shortcuts. No "made with v0.dev" branding anywhere. No obviously-templated landing pages. No Lorem ipsum shipped to production.
- No design inconsistencies between surfaces. Button styles, spacing rhythm, type scale, color usage must feel unified across La Méthode, La Bibliothèque, and L'Examen.
- No copy that suggests an MVP. No "coming soon" placeholders that ship to production. No broken images. No 404 routes that should exist.
- No interaction lag in core loops: recording → transcription → result must feel as close to instant as physics allows. Vercel cold-start delays are unacceptable on critical paths; preload aggressively.
- No untranslated or auto-translated French. Every French string is either authored by a fluent writer (ideally from the academic team) or explicitly approved by Chadi.
- No exposed technical chrome: internal field names like `tache_rubric`, `couche_score`, `le_goulet` never surface to users in their raw form.

The bar: a TCF Canada candidate who has paid $199 for the Sprint should perceive Le Méthodic as a real product built by people who care, end-to-end. Every micro-interaction reinforces that perception.

---

## 15. Competitive positioning (preview: separate strategic artifact)

Le Méthodic competes for attention with three distinct sets of products. The competitive comparison pages (`/le-methodic-vs-{competitor}`) will be authored as a Phase A.3 work item (`M-VS` ticket family).

**Competitive set 1: General French learning apps:**
Babbel, Duolingo, Rosetta Stone, Lingoda, Lawless French, FluentU, Pimsleur

**Competitive set 2: Tutoring marketplaces:**
Preply, italki, Verbling (1:1 tutors, marketplace dynamics)

**Competitive set 3: Exam prep specific:**
RFI Savoirs (free, public broadcaster), TV5MONDE Apprendre, Bonjour de France, niche TCF/DELF prep tools

**Le Méthodic's differentiation across all three:**
- vs general apps: actual exam preparation, not "language learning as journey"
- vs tutoring marketplaces: structured methodology, predictable progress, no tutor variability
- vs other exam prep: the 5-couche methodology (especially Les Pièges Anglais), academically grounded, anglophone-specific

The actual VS pages need their own authoring round. This section exists in PRODUCT.md to declare them as planned, not to draft them.

---

## 16. Implementation impact note

This PRODUCT.md represents the canonical naming and positioning going forward. Several pieces of the existing codebase use the legacy names:

| Legacy (code/docs) | Canonical (PRODUCT.md) | Migration owner |
|---|---|---|
| L'École, `/ecole` | La Méthode, `/la-methode` | M-RENAME (Phase A.3) |
| Le Vocabulaire, `/vocabulaire` | La Bibliothèque, `/la-bibliotheque` | M-RENAME (Phase A.3) |
| Le Diagnostic, `/diagnostic` | L'Examen, `/l-examen` | M-RENAME (Phase A.3) |
| Le Fond, Les Moules des Idées, etc. | Le Propos, Le Plan, La Construction, Les Pièges Anglais, La Musique | M-RENAME (Phase A.3) |

The rename migration is **substantial**: it touches routes, copy, internal API field names where they were named after the legacy concepts (`tache_rubric`, `couche_score`, etc., audit needed), the PRD ticket specs in `73d898f`, BACKLOG.md entries, and the soft-beta visual capture baseline. **PRODUCT.md is now the source of truth; the codebase and PRD will catch up via M-RENAME.**

---

## Appendix: Locked decisions reference

- **Tagline (H1):** "Stop translating. Start producing French." *(locked F-300a, 2026-05-09)*
- **Subhead:** "The method, the exams, the books: built for English speakers." *(locked F-300a, 2026-05-09)*
- **5-couche names:** Le Propos / Le Plan / La Construction / Les Pièges Anglais / La Musique *(locked 2026-05-24)*
- **3 product names:** La Méthode / La Bibliothèque / L'Examen *(locked 2026-05-24)*
- **Approved type stack:** Cabinet Grotesk, Geist, Source Serif 4 *(locked from memory)*
- **Voice persona:** Le Maître (ElevenLabs) for La Méthode + onboarding flows; OpenAI TTS-1-HD examiner voice for L'Examen Tâches *(locked May 19)*
- **Color direction:** Warm palette, per-couche colors, with Les Pièges Anglais getting boldest accent *(locked 2026-05-24)*
- **Motion:** Present and welcomed; never decorative; reduced-motion preferences respected *(locked 2026-05-24)*
- **Bilingual rule:** Adaptive, scales with learner level *(locked 2026-05-24)*

---

*End of PRODUCT.md v1. Next: DESIGN.md authoring (visual constitution, exact palette, per-couche specifications, motion conventions, component-level direction). After DESIGN.md is locked, design skills (impeccable first) install with full anchoring context.*

---

## Homepage positioning (locked 2026-05-31, Session 2)

**Hero direction.** Direction C, brand-forward.

- H1: There's a method to French. Now there's Le Méthodic.
- Sub: Built by an author of 28 French linguistics books. Used by anglophones who want their French to sound native, not assembled.
- Primary CTA: See how it works
- Secondary CTA: Start with a free placement

**Strategic framing.** Homepage builds desire for French itself and establishes Le Méthodic as the right place to learn it. Exam-specific landing pages handle conversion for visa-urgent users.

**Supersedes.** F-300a tagline lock ("Stop translating. Start producing French.") from 2026-05-07.

---

## Service architecture and pricing (locked 2026-05-31, Sessions 4-5)

**Four tiers plus à la carte.**

| Tier | Price | Surfaces included |
|---|---|---|
| Découverte | $0 | Public, /placement, Fondation 1 of /cours, Bibliothèque browse, L'Examen diagnostic, /coaching/trial-class |
| Engagement | $29 monthly or $290 annual | Full /cours, full L'Examen, full Bibliothèque, Progrès, 15% off /library |
| Maîtrise | $79 monthly or $790 annual | Engagement + Le Maître unlimited + monthly mock review + 25% off /library |
| Sprint TCF Canada | $499 one-time, 90 days | Maîtrise + 4 coaching sessions + study plan + priority feedback + 30% off /library |

**À la carte.**
- Coaching sessions: $99 each, first trial session free
- /library items: $9 to $49 (books, audio packs, downloads), 3 bundles ($49, $79, $99)

**Trial mechanic.** 14-day Engagement trial with card-on-file (auto-cancels if user does not actively convert).

**Free hooks.** /placement (no auth), Fondation 1 of /cours (email signup), /coaching/trial-class (first 30-minute session free).

---

## Product surfaces (locked 2026-05-31, Session 3)

**Four top-level product surfaces:**

1. /cours, the curriculum (27 lessons across Fondations 1-16 and Approfondissement 17-27). Route: /cours/methode-tcf-canada/lecon-N
2. La Bibliothèque, vocab chunks (browse, practice, test modes). Le Maître absorbs the former tutor mode.
3. Le Maître, AI tutor with ElevenLabs Chadi voice clone (top-level surface per Session 1 lock)
4. L'Examen, unified exam-format practice for all 4 TCF Canada sections:
   - /l-examen/comprehension-orale (listening)
   - /l-examen/comprehension-ecrite (reading)
   - /l-examen/expression-orale (Tâches 1, 2, 3)
   - /l-examen/expression-ecrite (formerly top-level L'Écrit, now folded in)
   - /l-examen/mock (full 4-section mock exam)
   - /l-examen/diagnostic (initial assessment)

See SITEMAP.md for the full surface inventory across all zones.

---

## Strategic decisions (Sessions 1-5 locks)

**Coaching V1 active (locked 2026-05-31, Session 1).** /chadi (founder content + video library) and /coaching (1-on-1 booking with Chadi) are V1 active surfaces. This reverses the prior "human support dropped" lock. /coaching/trial-class offers a free first 30-minute session as conversion mechanic.

**Capacity note.** At 30 to 45 hours per week sustainable work ceiling, realistic coaching availability is 6 to 10 sessions per week. Sprint users get 4 sessions over 90 days. Watch capacity as Sprint adoption scales; consider waitlist or price increase at ~30 active Sprint users.

---

## /library positioning (locked 2026-05-31, Sessions 1 and 5)

/library is the Stripe-backed digital store, repositioned from its original LemonSqueezy-era stub purpose. Catalog has 4 categories:

- Livres: Book-Lab catalog (digital books), $19 to $29 per title
- Audio: audiobook versions, pronunciation packs, listening comprehension packs, $19 to $39 per item
- Téléchargements: PDFs, cheat sheets, worksheets, sample mock-exam packs, $9 to $19 per item
- Ressources gratuites: lead magnets, email-gated, free

V1 launches with curated subset: 8-10 books, 3-5 audio, 5-8 downloads, 5-8 free resources. Plus 3 bundles for upsell mechanics. Subscriber discounts (15/25/30% by tier) applied at checkout.

See SITEMAP.md /library section and ROADMAP-marketing.md MS-7 for full launch scope.

---

## Editorial rules

**Em-dash hard rule.** Never use em-dash (—) in any output, including prose, file contents, code comments, diagram labels, conversational responses. Use commas, colons, parentheses, or sentence breaks instead. This is a recurring violation that requires explicit vigilance every response.
