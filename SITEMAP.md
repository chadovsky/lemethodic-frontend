# SITEMAP -- Le Méthodic FE

**Status:** Canonical
**Last updated:** F-441, 2026-06-09
**Related artifacts:** DESIGN.md, BACKLOG.md, docs/prd-v1.md

## Overview

Le Méthodic is one complete website. Every surface is present from launch.
Unbuilt surfaces display a bientôt state -- lighting one up is content plus a
feature flag, never a new version. The spine is exam-agnostic. TCF is the
first exam lit. All four skills are present from the start.

## Status legend

- `live` -- route in production, content rendered
- `bientôt` -- navigable, shows bientôt state, never a 404
- `tbd` -- not yet created

---

## TopNav IA (F-441)

TopNav is mounted globally. It is hidden on marketing, auth, and conversion
surfaces (see `EXCLUDED_PREFIXES` and `EXCLUDED_EXACT` in
`components/nav/TopNav.tsx`). It shows on all other routes.

**Left/center -- in order:**

| Label | Route | Notes |
|---|---|---|
| Vocabulary | `/la-methode` | Active on /la-methode/*, /cluster/*, /learn/* |
| Exams | `/l-examen` | Parent link. Dropdown: TCF (live), DELF (bientôt), French for Business (bientôt) |
| Library | `/la-bibliotheque` | Active on /la-bibliotheque/* |
| Real French | -- | Bientôt chip. Phase 3 surface. No route yet. |
| AI Tutor | -- | Bientôt chip. Le Maître. No route yet. |
| Coaching | `/coaching` | Route TBD |

**Right -- auth-conditional:**

| State | Items |
|---|---|
| Unauthenticated | Pricing → `/tarifs`, Log in → `/connexion`, Start Free → `/inscription` |
| Authenticated | ThemeToggle, avatar dropdown (Profile, Settings, Account, About, Sign out) |

---

## Public / Marketing (TopNav hidden)

| Route | Surface | Status |
|---|---|---|
| `/` | TCF Canada landing | live |
| `/fr` | French-language landing | live |
| `/tarifs` | Pricing | live |
| `/a-propos` | About | live |
| `/faq` | FAQ | live |
| `/blog` | Blog index | live |
| `/blog/:slug` | Blog post | live |
| `/examens` | Exams hub | live |
| `/librairie` | Public book store (LemonSqueezy) | live |
| `/library` | Library stub | live |
| `/pieges` | Les Pièges Anglais index | live |
| `/pieges/:slug` | Individual Pièges article | live |
| `/mentions-legales` | Legal notices | live |
| `/confidentialite` | Privacy policy | live |
| `/cgv` | Terms of sale | live |
| `/refund` | Refund policy | live |

---

## Auth / Conversion (TopNav hidden)

| Route | Surface | Status |
|---|---|---|
| `/connexion` | Log in | live |
| `/inscription` | Sign up (hCaptcha gated) | live |
| `/onboarding` | Onboarding flow (6 steps) | live |
| `/paywall` | Paywall | live |
| `/password-reset` | Password reset | live |
| `/bienvenue` | Welcome / post-onboarding | live |

---

## Product surfaces (TopNav visible)

### Vocabulary -- /la-methode

| Route | Surface | Status |
|---|---|---|
| `/la-methode` | Lesson list (public, no auth gate) | live |
| `/la-methode/:id` | Lesson detail (auth gated) | live |
| `/cluster/:id` | Cluster view | live |
| `/learn/:id` | Learn session | live |

### Exams -- /l-examen

| Route | Surface | Exam | Status |
|---|---|---|---|
| `/l-examen` | L'Examen hub | TCF | live |
| `/l-examen/diagnostic` | Diagnostic landing | TCF | live |
| `/l-examen/diagnostic/tache/:n` | Diagnostic tâche | TCF | live |
| `/l-examen/expression-orale` | Oral expression hub | TCF | live |
| `/l-examen/expression-orale/tache1/:topic` | Oral tâche 1 | TCF | live |
| `/l-examen/expression-orale/tache2/:scenario` | Oral tâche 2 | TCF | live |
| `/l-examen/expression-orale/tache3/:topic` | Oral tâche 3 | TCF | live |
| `/l-examen/expression-orale/feedback/:session` | Oral feedback | TCF | live |
| `/l-examen/expression-ecrite` | Written expression hub | TCF | live |
| `/l-examen/expression-ecrite/:id` | Written prompt | TCF | live |
| `/l-examen/expression-ecrite/history` | Written history | TCF | live |
| `/l-examen/comprehension-orale` | Oral comprehension | TCF | live |
| `/l-examen/comprehension-ecrite` | Written comprehension | TCF | live |
| `/l-examen/mock` | Mock exam | TCF | live |

### Library -- /la-bibliotheque

| Route | Surface | Status |
|---|---|---|
| `/la-bibliotheque` | Vocabulary library index | live |
| `/la-bibliotheque/:slug` | Library resource / practice | live |

### Real French (bientôt)

Phase 3 surface. Route TBD.

### AI Tutor (bientôt)

Le Maître (ElevenLabs Chadi-clone). Route TBD.

### Coaching

| Route | Surface | Status |
|---|---|---|
| `/coaching` | Coaching hub | tbd |

---

## Product surfaces (app shell, no TopNav)

These routes are wrapped by the (app) route group with its sidebar shell. They
do not show the TopNav.

| Route | Surface | Status |
|---|---|---|
| `/tableau-de-bord` | Dashboard (streak, daily target, progress widgets) | live |
| `/seance` | Séance player | live |
| `/ile` | Learning island | live |
| `/carte` | Atlas hub | live |
| `/cours/:id` | Cours detail | live |
| `/progression` | Progress overview | live |
| `/profil` | Profile and account info | live |
| `/parametres` | Settings | live |
| `/abonnement` | Subscription management | live |
| `/progres` | Progress detail | live |

---

## Dev / Internal

| Route | Surface | Notes |
|---|---|---|
| `/dev` | Dev utilities | Dev only |

---

## Persona-driven surfaces
- /onboarding: persona (Target Profile) selection plus the persona diagnostic. Public (only /onboarding/waitlist is authed).
- La Methode -> La Carte: the active persona's themes x the persona's levels grid. Cells are summaries of their stations. Twin-view toggle: theme | skill (co-primary). Le Cap session-plan slot on top. Global rail: SRS, Mock, Reading. Readiness signal visible.
- Station routes: L'Ile (islands), plus audio, conversation, writing, and pieges stations at the same cell coordinate; global stations (SRS, Mock, Reading) on the rail.
- La Seance: one station engagement.
- L'Examen: terminus. Exam personas: mock, surfaced only past a readiness threshold. Learning personas (Business, Hobby): capstone or competence milestones.
- Le Lexique (/le-lexique): user-global vocabulary, a derived view.
All non-lit stations, methods, and personas render bientot.
