# Le Méthodic, Site Architecture (SITEMAP)

**Status:** Canonical
**Last updated:** 2026-05-31
**Related artifacts:** PRODUCT.md, DESIGN.md, ROADMAP.md, ROADMAP-marketing.md

## Overview

Le Méthodic spans three zones across roughly 115 surfaces.

- **Public zone**, about 55 pages. SEO targets and conversion funnel for logged-out visitors.
- **Auth gateway**, 6 routes for signup, login, and onboarding.
- **Authenticated app**, about 60 pages across product surfaces, progress tracking, and account management.

Primary persona: TCF Canada anglophone (90% per locked positioning in PRODUCT.md). Secondary: DALF C1 (10%). Marketing surfaces prioritize the primary persona. Exam landings convert. The homepage builds desire for French itself.

## Status legend

- `live`, route in production
- `stub`, placeholder route, no real content
- `v1`, scoped for V1, not yet built
- `v1.1`, deferred to V1.1
- `v2`, deferred to V2

## Tier gating (authenticated surfaces)

Four tiers plus à la carte, per Session 4 lock:

- `Découverte` ($0), public surfaces, free placement test, Fondation 1 of `/cours`, Bibliothèque browse mode, L'Examen diagnostic, free trial-class
- `Engagement` ($29 monthly or $290 annual), full `/cours`, full L'Examen, full La Bibliothèque, Progrès, 15% off `/library`
- `Maîtrise` ($79 monthly or $790 annual), everything in Engagement plus Le Maître unlimited, monthly mock review, 25% off `/library`
- `Sprint TCF Canada` ($499 one-time, 90 days), everything in Maîtrise plus 4 coaching sessions with Chadi, personalized study plan, priority feedback, 30% off `/library`
- À la carte, coaching sessions ($99 each, first trial free), `/library` items ($9 to $49)

---

## Public zone

### Homepage hub

| Path | Purpose | Status |
|---|---|---|
| `/` | Brand-led hub. Hero copy locked Direction C (Session 2). Homepage builds desire for French itself, exam landings handle conversion. | live (copy needs rewrite to Direction C) |

**Homepage hero copy (locked, Direction C):**

- H1: "There's a method to French. Now there's Le Méthodic."
- Sub: "Built by an author of 28 French linguistics books. Used by anglophones who want their French to sound native, not assembled."
- Primary CTA: "See how it works"
- Secondary CTA: "Start with a free placement"

### Exam landings, immigration and citizenship cluster

| Path | Purpose | Status |
|---|---|---|
| `/immigration-canada` | Hub for Canada immigration intent | v1 |
| `/tcf-canada` | TCF Canada exam-specific landing, primary SEO target | v1 |
| `/tef-canada` | TEF Canada exam-specific landing | v1 |
| `/immigration-quebec` | Hub for Quebec immigration intent | v1 |
| `/tcf-quebec` | TCF Québec landing | v1 |
| `/tefaq` | TEFAQ (TEF for Quebec) landing | v1 |
| `/naturalisation` | French citizenship hub | v1.1 |
| `/tcf-naturalisation` | TCF Naturalisation landing | v1.1 |
| `/tef-naturalisation` | TEF Naturalisation landing | v1.1 |

### Exam landings, studies and residence cluster

| Path | Purpose | Status |
|---|---|---|
| `/etudier-en-france` | Hub for study-in-France intent | v1.1 |
| `/tcf-dap` | TCF DAP (university admission) landing | v1.1 |
| `/residence-france` | Hub for France residence permit | v1.1 |
| `/tcf-residence` | TCF Résidence landing | v1.1 |
| `/clb-calculator` | Free tool. TCF/TEF score to CLB level. Lead capture surface | v1 |
| `/express-entry-calculator` | Free tool. CRS calculator with French bonus | v1 |

### Exam landings, diplomas and professional cluster

| Path | Purpose | Status |
|---|---|---|
| `/delf` | DELF hub (A1 through B2) | v1.1 |
| `/delf-a1` | DELF A1 landing | v1.1 |
| `/delf-a2` | DELF A2 landing | v1.1 |
| `/delf-b1` | DELF B1 landing | v1.1 |
| `/delf-b2` | DELF B2 landing | v1.1 |
| `/dalf` | DALF hub (C1 through C2). Secondary persona surface | v1 |
| `/dalf-c1` | DALF C1 landing | v1 |
| `/dalf-c2` | DALF C2 landing | v1.1 |
| `/dilf` | DILF (basic French) landing | v2 |
| `/dcl` | DCL (professional French) landing | v2 |
| `/delf-pro` | DELF Pro landing | v2 |

### Méthode and trust

| Path | Purpose | Status |
|---|---|---|
| `/methode` | Public 5-couche method explainer. Distinct from authenticated `/cours` | v1 |
| `/methode/le-propos` | Couche 1 detail | v1.1 |
| `/methode/le-plan` | Couche 2 detail | v1.1 |
| `/methode/la-construction` | Couche 3 detail | v1.1 |
| `/methode/les-pieges-anglais` | Couche 4 detail, locked differentiator, highest SEO leverage | v1 |
| `/methode/la-musique` | Couche 5 detail | v1.1 |
| `/placement` | Free placement test with CLB mapping. Competitor table-stakes | v1 |
| `/tarifs` | Pricing tiers, four-tier ladder (Découverte, Engagement, Maîtrise, Sprint) | v1 |

### Coaching (founder-led, V1 active per Session 1 lock)

| Path | Purpose | Status |
|---|---|---|
| `/chadi` | Founder content and video library | v1 |
| `/chadi/videos` | Embedded YouTube library | v1.1 |
| `/coaching` | 1-on-1 booking with Chadi | v1 |
| `/coaching/forfaits` | Coaching packages | v1.1 |
| `/coaching/trial-class` | Discounted first session, conversion mechanic | v1 |

### Resources and content

| Path | Purpose | Status |
|---|---|---|
| `/blog` | Blog index, programmatic SEO plus authored content | v1 |
| `/blog/[slug]` | Individual posts | v1 |
| `/blog/categorie/[cat]` | Category index | v1.1 |
| `/ressources` | Free downloads hub, lead magnets | v1 |
| `/ressources/[item]` | Individual downloads | v1 |
| `/webinaires` | Events and webinars | v1.1 |
| `/webinaires/[event]` | Event detail | v1.1 |
| `/sample-tasks` | Free Tâche 1/2/3 samples, top-of-funnel proof | v1 |

### About and trust

| Path | Purpose | Status |
|---|---|---|
| `/a-propos` | About hub | v1 |
| `/a-propos/equipe` | Team and partners | v1.1 |
| `/a-propos/mission` | Mission statement | v1.1 |
| `/a-propos/methodologie` | Pedagogy credentials | v1.1 |
| `/temoignages` | Testimonials | v1 |
| `/presse` | Press and media kit | v1.1 |

### Partners (B2B)

| Path | Purpose | Status |
|---|---|---|
| `/partenaires` | Partner program hub, RCICs plus study agencies | v1.1 |
| `/partenaires/rcic` | RCIC referral details | v1.1 |
| `/partenaires/agences` | Study abroad agency partners | v1.1 |
| `/partenaires/inscription` | Self-serve partner signup | v1.1 |

### `/library` (Stripe store, per Session 1 lock plus Session 5 catalog)

| Path | Purpose | Status |
|---|---|---|
| `/library` | Store hub, 4 categories | v1 |
| `/library/livres` | Books from Book-Lab catalog (digital, downloadable). V1 launches 8 to 10 most exam-relevant titles, $19 to $29 per book | v1 |
| `/library/audio` | Audiobook versions plus pronunciation packs plus listening comprehension packs. V1 launches 3 to 5 packs, $19 to $39 per item | v1 |
| `/library/telechargements` | PDFs, cheat sheets, worksheets, sample mock-exam packs. V1 launches 5 to 8 items, $9 to $19 per item | v1 |
| `/library/ressources-gratuites` | Lead magnets (free placement PDF, sample TCF tasks, 5-couche cheat sheet, CLB mapping reference). Email-gated. V1 launches 5 to 8 items | v1 |
| `/library/[item-slug]` | Individual product page | v1 |
| `/library/checkout` | Stripe checkout, subscriber discounts applied at checkout (15% Engagement, 25% Maîtrise, 30% Sprint) | v1 |

**Bundles for V1 (3 bundles):**

- "TCF Canada Complete Pack", $79 (saves vs $120 a la carte): 3 books, 2 audio, 5 worksheets
- "Anglophone Starter Pack", $49 (saves vs $75): 2 books, 3 worksheets
- "Sprint Companion", $99 (saves vs $150): everything in TCF Complete plus 2 mock-exam audio packs

### Help and legal

| Path | Purpose | Status |
|---|---|---|
| `/aide` | Help center | v1 |
| `/aide/[article]` | Help articles | v1.1 |
| `/faq` | FAQ | v1 |
| `/contact` | Contact form | v1 |
| `/confidentialite` | Privacy policy | v1 |
| `/conditions` | Terms of service | v1 |
| `/cookies` | Cookie policy | v1 |
| `/accessibilite` | Accessibility statement | v1.1 |

### Legacy and consolidation

| Path | Current state | Resolution |
|---|---|---|
| `/exam-prep` | Old exam landing preserved by F-300b (May 7), duplicate of `/` | V1 ticket: redirect `/exam-prep` to `/tcf-canada` (matches new exam-landing strategy). MS-1 milestone owns this. |
| `/library` (old stub) | LemonSqueezy-era stub | Repositioned per Session 1 lock. Now the active Stripe store. MS-7 milestone owns the launch. |

---

## Auth gateway

| Path | Purpose | Status |
|---|---|---|
| `/auth/signup` | Account creation | live |
| `/auth/login` | Sign in | live |
| `/auth/verify-email` | Email verification gate | live |
| `/auth/forgot-password` | Password reset trigger | live |
| `/auth/reset-password` | Password reset | live |
| `/onboarding` | Post-signup flow. Exam selection, exam date, level estimate, daily target. Feeds dashboard widgets | live (F-327 shipped 5/25) |

---

## Authenticated app

Four top-level product surfaces (per Session 3 lock): `/cours`, La Bibliothèque, Le Maître, L'Examen. Plus support surfaces (Progrès, Calendrier, Compte).

### Dashboard hub

| Path | Purpose | Tier | Status |
|---|---|---|---|
| `/dashboard` | Personalized hub: countdown, streak, daily target, next lesson, calendar, recent activity. Coursera-density. | Découverte+ | live (M2 visual coherence in progress, needs widget expansion) |

### `/cours` (curriculum)

| Path | Purpose | Tier | Status |
|---|---|---|---|
| `/cours` | Course catalog. V1 shows 1 course, scales to N | Découverte+ | v1 |
| `/cours/methode-tcf-canada` | Course landing page for the 27-lesson Fondations + Approfondissement curriculum | Découverte+ (Fondation 1 free, rest Engagement+) | v1 (rename from `/la-methode`) |
| `/cours/methode-tcf-canada/lecon-N` | Individual lesson (N from 1 to 27) | Découverte for Fondation 1, Engagement+ for 2 through 27 | v1 |
| `/cours/methode-tcf-canada/glossaire` | Cross-lesson glossary | Engagement+ | v1.1 |
| `/cours/methode-tcf-canada/lexique` | Key terms by lesson | Engagement+ | v1.1 |
| `/cours/methode-tcf-canada/notes` | User notes across lessons | Engagement+ | v1.1 |
| `/cours/methode-tcf-canada/favoris` | Bookmarked lessons | Engagement+ | v1.1 |
| `/cours/methode-tcf-canada/exercices` | Cross-lesson exercises | Engagement+ | v1.1 |
| `/cours/methode-tcf-canada/audio` | Audio library | Engagement+ | v1.1 |
| `/cours/methode-tcf-canada/parcours` | Learning paths (TCF Canada, DALF, etc.) | Engagement+ | v2 |

### La Bibliothèque (vocab chunks)

| Path | Purpose | Tier | Status |
|---|---|---|---|
| `/la-bibliotheque` | Hub | Découverte+ | live (MVP) |
| `/la-bibliotheque/browse` | Discovery mode | Découverte+ | live (MVP) |
| `/la-bibliotheque/practice` | Drilling mode | Engagement+ | live (MVP) |
| `/la-bibliotheque/test` | Graded mode | Engagement+ | live (MVP) |
| `/la-bibliotheque/[topic]` | Topic page | Engagement+ | v1.1 |
| `/la-bibliotheque/favoris` | Saved chunks | Engagement+ | v1.1 |
| `/la-bibliotheque/historique` | Recently practiced | Engagement+ | v1.1 |
| `/la-bibliotheque/maitrise` | Mastery stats | Engagement+ | v1.1 |

Note: `/la-bibliotheque/tutor` (MVP) is REMOVED. Le Maître absorbs the AI-led drilling per Session 1 lock.

### Le Maître (AI tutor, top-level per Session 1 lock)

| Path | Purpose | Tier | Status |
|---|---|---|---|
| `/le-maitre` | Tutor hub, conversation entry | Maîtrise+ | v1 |
| `/le-maitre/conversation` | Start new conversation | Maîtrise+ | v1 |
| `/le-maitre/conversation/[id]` | Resume past conversation | Maîtrise+ | v1 |
| `/le-maitre/historique` | All conversations | Maîtrise+ | v1 |
| `/le-maitre/sujets` | Topic library | Maîtrise+ | v1.1 |
| `/le-maitre/prononciation` | Pronunciation drills | Maîtrise+ | v1.1 |

### L'Examen (unified exam-format practice, per Session 3 lock)

Umbrella for all 4 TCF Canada sections. L'Écrit (formerly top-level) is now `/l-examen/expression-ecrite`.

| Path | Purpose | Tier | Status |
|---|---|---|---|
| `/l-examen` | Hub for all exam-format practice | Découverte+ | live (currently scoped to oral expression only, needs expansion) |
| `/l-examen/diagnostic` | Initial assessment | Découverte+ | v1 |
| `/l-examen/comprehension-orale` | Listening comprehension practice (TCF section 1) | Engagement+ | v1 (net-new product surface) |
| `/l-examen/comprehension-orale/[exercise]` | Individual listening exercise | Engagement+ | v1 |
| `/l-examen/comprehension-ecrite` | Reading comprehension practice (TCF section 2) | Engagement+ | v1 (net-new product surface) |
| `/l-examen/comprehension-ecrite/[exercise]` | Individual reading exercise | Engagement+ | v1 |
| `/l-examen/expression-orale` | Oral expression practice (TCF section 3) | Engagement+ | live (currently `/l-examen`, refactor) |
| `/l-examen/expression-orale/tache-1` | Tâche 1 (interview) | Engagement+ | live |
| `/l-examen/expression-orale/tache-2` | Tâche 2 (information request) | Engagement+ | live |
| `/l-examen/expression-orale/tache-3` | Tâche 3 (argumentation) | Engagement+ | live |
| `/l-examen/expression-ecrite` | Written expression practice (TCF section 4). Was top-level L'Écrit, now folded in | Engagement+ | live (currently `/ecrit`, refactor) |
| `/l-examen/expression-ecrite/tache-[n]` | Writing tasks | Engagement+ | live |
| `/l-examen/mock` | Full 4-section mock exam | Engagement+ | v1 |
| `/l-examen/historique` | Past attempts across all sections | Engagement+ | v1 |
| `/l-examen/feedback/[id]` | Detailed feedback per attempt | Engagement+ | v1 |

### Progrès

| Path | Purpose | Tier | Status |
|---|---|---|---|
| `/progres` | Progress dashboard | Engagement+ | v1 (verify state in repo) |
| `/progres/cefr` | CEFR level breakdown | Engagement+ | v1.1 |
| `/progres/clb` | CLB mapping (TCF Canada primary persona anchor) | Engagement+ | v1 |
| `/progres/competences` | Per-skill breakdown (4 TCF sections) | Engagement+ | v1 |
| `/progres/timeline` | Historical progress | Engagement+ | v1.1 |
| `/progres/succes` | Achievements and badges | Engagement+ | v1.1 |
| `/progres/certificat` | Completion certificate | Engagement+ | v2 |

### Calendrier

| Path | Purpose | Tier | Status |
|---|---|---|---|
| `/calendrier` | Study schedule | Engagement+ | v1.1 |
| `/calendrier/examen` | Exam day countdown setup | Engagement+ | v1 |
| `/calendrier/sessions` | Booked coaching sessions (depends on `/coaching`) | Sprint or à la carte | v1 |
| `/calendrier/integrer` | Google Calendar sync | Engagement+ | v2 |

### Compte and settings

| Path | Purpose | Tier | Status |
|---|---|---|---|
| `/compte` | Account overview | Découverte+ | live |
| `/compte/profil` | Personal info | Découverte+ | v1.1 |
| `/compte/abonnement` | Subscription management (M6 Stripe milestone) | Découverte+ | v1 |
| `/compte/factures` | Invoices | Découverte+ | v1.1 |
| `/compte/securite` | Password, 2FA | Découverte+ | v1.1 |
| `/compte/notifications` | Notification preferences | Découverte+ | v1.1 |
| `/compte/integrations` | Google Calendar, etc. | Découverte+ | v2 |
| `/compte/preferences` | Display, audio, language | Découverte+ | v1.1 |

---

## Cross-references

- **PRODUCT.md**, vision, positioning, audience, product systems, 5-couche, pricing tiers, em-dash hard rule
- **DESIGN.md v2**, Atelier Français visual system, color tokens, typography, wordmark spec
- **ROADMAP.md**, milestone sequence M0 through M8, visual debt appendix
- **ROADMAP-marketing.md**, parallel marketing track MS-0 through MS-7
- **BACKLOG.md** (per repo), tickets including deviation-driven actions
- **F-300 ticket family** (revived per Session 1 lock), F-300c through F-300g as scope-rewrite-owing
