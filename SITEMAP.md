# Le Méthodic, Site Architecture (SITEMAP)

**Status:** Canonical  
**Last updated:** 2026-06-02  
**Related artifacts:** PRODUCT.md, DESIGN.md, BACKLOG.md  

## Overview

Le Méthodic is one complete website. Every surface is present from launch. Unbuilt surfaces display a polished coming-soon state (bientôt); lighting one up is a content drop plus a feature flag, never a new version or a new tier. The spine is exam-agnostic. A Target Profile (exam, threshold, deadline, persona) overlays it at onboarding. All four skills (oral comprehension, written comprehension, oral expression, written expression) are present from the start. TCF is the first exam lit.

Roughly 40 templates across four zones: Public, Auth, Onboarding, La Méthode (authenticated), Account.

The product routes in French. Public SEO surfaces serve English and French via hreflang. No Next.js i18n framework; hreflang is applied at the page level.

## Status legend

- `live`, route in production, content rendered
- `bientôt`, navigable and polished, coming-soon state, never broken

## Bientôt presentation pattern

Every bientôt surface is a first-class page. It renders its route, shows its position in the navigation, displays its purpose, and presents a clear coming-soon signal. It offers a relevant next action (return to /carte, continue a live sibling surface, or join a notification list). No 404. No locked-icon overlays. No paywall messaging. The page should feel like a place the product will inhabit, not an empty shell.

---

## Public zone

### Accueil

| Path | Purpose | Status |
|---|---|---|
| `/` | Brand-led hub. Builds desire for French itself. Exam conversion is handled by /examens. | live |

### À propos

| Path | Purpose | Status |
|---|---|---|
| `/a-propos` | Founder, methodology, and credentials. Coaching enquiries link out to Preply. No internal booking surface. | live |

### Examens

Exam landings share one template. TCF is the first exam lit. All others render bientôt.

| Path | Purpose | Status |
|---|---|---|
| `/examens` | Exam hub. All supported exams listed with their live or bientôt state. | bientôt |
| `/examens/tcf` | TCF exam landing. Primary SEO target. Covers TCF Canada, Québec, DAP, and Naturalisation variants. | live |
| `/examens/tef` | TEF exam landing. | bientôt |
| `/examens/dalf` | DALF exam landing (C1 and C2). | bientôt |
| `/examens/delf` | DELF exam landing (A1 through B2). | bientôt |
| `/examens/general` | General French proficiency, non-exam intent. | bientôt |

### Les Pièges Anglais (SEO library)

The growth engine. Each page targets a specific anglicism, false cognate, or structural interference pattern. Programmatic generation; each article also links into /ile for practice.

| Path | Purpose | Status |
|---|---|---|
| `/pieges` | Pièges index. Browse by category, search by interference pattern. | bientôt |
| `/pieges/[slug]` | Individual pièges article. SEO-targeted, contextual link to the corresponding île activity. | live |

### Blog

| Path | Purpose | Status |
|---|---|---|
| `/blog` | Blog index. Authored and programmatic content. | live |
| `/blog/[slug]` | Individual post. | live |

### Resources

| Path | Purpose | Status |
|---|---|---|
| `/faq` | Frequently asked questions. | live |
| `/tarifs` | Pricing. Single plan, no tier ladder. | live |
| `/contact` | Contact form. Submits to founder inbox via Postmark (or mailto fallback until Phase 4 wires Postmark). Public. | live |
| `/aide` | Help center hub. MDX-backed, distinct from /faq (faq = short answers, aide = depth). Public. Nav: StickyHeader. | live |
| `/aide/[slug]` | Individual help article. Sections: getting started, method explainer, exam coverage, technical setup, account and billing. Public. | live |

### Outils (public tools, no auth)

| Path | Purpose | Status |
|---|---|---|
| `/outils/clb` | Free CLB/TCF score calculator. Lead magnet. User enters section scores, gets CLB equivalents, optional email capture. SEO-optimized. No auth required. Nav: StickyHeader. | live |

### La Librairie

The public digital book store. Sells the Book-Lab French catalog (books, audio, downloads, and free resources) through LemonSqueezy. Digital products only. Note: /librairie (the public store) is distinct from /la-bibliotheque (the in-app vocabulary product for authenticated learners). These are two separate surfaces with separate purposes.

| Path | Purpose | Status |
|---|---|---|
| `/librairie` | Book store hub. Four categories: Livres, Audio, Téléchargements, Ressources gratuites. LemonSqueezy-backed. | bientôt |
| `/librairie/livres` | Books from the Book-Lab French catalog. | bientôt |
| `/librairie/audio` | Audio packs from the Book-Lab French catalog. | bientôt |
| `/librairie/telechargements` | Digital downloads from the Book-Lab French catalog. | bientôt |
| `/librairie/ressources-gratuites` | Free resources, email-gated lead magnets. | bientôt |
| `/librairie/[item-slug]` | Individual product page. | bientôt |

### Search

| Path | Purpose | Status |
|---|---|---|
| `/recherche` | Search results page. Full-text search across pièges, îles, blog posts, and bibliothèque entries. Authenticated. Nav: TopNav. | live |

### Programmatic SEO

| Path | Purpose | Status |
|---|---|---|
| `/[seo]` | Programmatic landing pages. CLB calculator, exam-prep intent clusters, keyword-targeted entry points. Served in French and English via hreflang. | live |

### Legal

| Path | Purpose | Status |
|---|---|---|
| `/mentions-legales` | Legal notices. | live |
| `/confidentialite` | Privacy policy. | live |
| `/cgv` | General terms of sale. | live |

---

## Auth

| Path | Purpose | Status |
|---|---|---|
| `/inscription` | Account creation. hCaptcha gated. | live |
| `/connexion` | Sign in. | live |

---

## Onboarding

Post-signup setup sequence. Establishes the Target Profile (exam, threshold, deadline, persona) that overlays the exam-agnostic spine. Feeds all /carte widgets.

| Path | Purpose | Status |
|---|---|---|
| `/bienvenue` | Target Profile setup. Exam selection, CEFR self-assessment, exam date, daily target. | live |
| `/maitre/diagnostic` | Initial diagnostic with Le Maître. Establishes a baseline across all four skills before the first séance. | live |

---

## La Méthode (authenticated)

The core learning loop. All surfaces are present. Unbuilt surfaces render bientôt per the pattern above.

### La Carte (hub home)

| Path | Purpose | Status |
|---|---|---|
| `/carte` | The Atlas. Hub home. Exam countdown, streak, next séance, entrance to every surface. | live |

### La Séance

| Path | Purpose | Status |
|---|---|---|
| `/seance` | Daily séance launcher. Surfaces the next recommended activity based on Target Profile and progression state. | bientôt |

### Les Îles (learning islands)

An île is a self-contained unit anchored to one segment of the 5-couche spine: Le Propos, Le Plan, La Construction, Les Pièges Anglais, La Musique. Each île contains activities and a scored tâche. The tâche surfaces are live from the start; île navigation and activity lists are bientôt.

| Path | Purpose | Status |
|---|---|---|
| `/ile/[id]` | Île home. Overview of its couche, activity list, and current progression. | bientôt |
| `/ile/[id]/activites` | Activity list for this île. Vocabulary, listening, and reading practice anchored to the couche. | bientôt |
| `/ile/[id]/tache` | Oral or written tâche for this île. Scored by Le Maître. | live |

### Le Maître (AI tutor)

Le Maître is the unified tutor persona (ElevenLabs voice). It scores tâches, conducts the diagnostic, and leads conversation practice. AI-led vocabulary drilling is absorbed here rather than split across surfaces.

| Path | Purpose | Status |
|---|---|---|
| `/maitre` | Le Maître hub. Conversation entry, session history, pronunciation work. | bientôt |

### La Bibliothèque

| Path | Purpose | Status |
|---|---|---|
| `/bibliotheque` | Vocabulary chunk library. Browse, practice, and test modes. | live |
| `/bibliotheque/[id]` | Individual chunk or topic page. | bientôt |

### L'Examen

Unified exam-format practice hub across all four skills. Oral expression and written expression are accessible via /ile/[id]/tache. Oral and written comprehension practice render bientôt until content is uploaded.

| Path | Purpose | Status |
|---|---|---|
| `/examen` | Exam-format practice hub. All four skills listed with live or bientôt state. | live |
| `/examen/[checkpoint]` | Checkpoint session: a timed, scored sequence across one or more skills. Full timed TCF mock (four sections, total timer, section timers, submit, aggregated scoring) when F-376 ships. | bientôt (live with F-376) |

### L'École (bientôt)

Structured courses anchored to the 5-couche spine. The spine exists; course content uploads complete the surface.

| Path | Purpose | Status |
|---|---|---|
| `/ecole` | Course catalog. | bientôt |
| `/ecole/[id]` | Individual course: lessons, glossary, audio, notes. | bientôt |

### La Progression

| Path | Purpose | Status |
|---|---|---|
| `/progression` | Progress dashboard. CEFR level, CLB mapping, per-skill breakdown, streak, history. | bientôt |

---

## Account

| Path | Purpose | Status |
|---|---|---|
| `/profil` | Account overview and personal information. Includes recording management (replay, download, delete per F-374). | live |
| `/parametres` | Display, audio, and notification preferences. | bientôt |
| `/abonnement` | Subscription management. | bientôt |
| `/notifications` | In-app notifications list. Full page view; mark-as-read; types: dispute response, payment receipt, content updates, milestones. Authenticated. Nav: TopNav. | live |

## Internal

Internal surfaces not in the public navigation. Accessed only by the founder.

| Path | Purpose | Status |
|---|---|---|
| `/admin` | Admin dashboard (founder-only, gated to founder email). Surfaces: users list (filter, search, impersonate), revenue (LemonSqueezy data), content health, dispute queue, support inbox, telemetry summary. No StickyHeader or TopNav; its own minimal chrome. | live |

---

## Cross-references

- **PRODUCT.md**, vision, positioning, audience, product systems, 5-couche, pricing
- **DESIGN.md v2**, Atelier Français visual system, color tokens, typography, wordmark spec
- **BACKLOG.md** (per repo), tickets including deviation-driven actions
