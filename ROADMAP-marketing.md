# Le Méthodic, Marketing Track Roadmap

**Status:** Canonical
**Last updated:** 2026-06-02
**Related artifacts:** ROADMAP.md (product track), SITEMAP.md (surfaces), PRODUCT.md (positioning), BACKLOG.md

## Purpose

Marketing site work and product work are different workstreams. Different cadence, different dispatch patterns, different success metrics. Product milestones (M0 through M8 in ROADMAP.md) cover engineering on the authenticated app. This file covers the public site, the SEO funnel, and the store.

Per Session 5 lock (Option C, parallel track), the two roadmaps ship independently. Opening to a first audience is a marketing decision about scale, not a product version gate. The product is complete at any audience size.

## Milestone sequence

8 milestones. MS-0 through MS-4 ship before opening to a first audience. MS-5 through MS-7 can follow at any cadence without blocking the first audience opening.

| ID | Scope | Dependencies | Pre-launch |
|---|---|---|---|
| MS-0 | Audit current marketing surfaces | None | Yes |
| MS-1 | Homepage rewrite, top 3 exam landings | MS-0 | Yes |
| MS-2 | Public method explainer, free placement test | MS-0 | Yes |
| MS-3 | Pricing page, founder page, coaching booking | MS-0, Phase 4 (LemonSqueezy) | Yes |
| MS-4 | Help and legal table-stakes | MS-0 | Yes |
| MS-5 | Blog scaffolding, first 5 posts | MS-0 | No |
| MS-6 | Remaining exam landings, cluster hubs | MS-1 | No |
| MS-7 | `/librairie` store launch | Phase 4 (LemonSqueezy), MS-3, catalog ready | No |

---

## MS-0, Marketing surfaces audit

**Scope.** Inventory current state of all marketing surfaces. Source of truth for what exists vs proposed.

**Deliverables.**
- Audit report appended to ROADMAP.md under "Marketing audit" section
- Verification of `/`, `/exam-prep`, `/librairie`, `/onboarding`, `/auth/*` route presence and content
- Confirmation of `/faq`, `/contact`, `/confidentialite`, `/conditions`, `/cookies` route existence
- Confirmation of `/tarifs` or `/pricing` route existence

**Acceptance.** Single document at FE repo path `docs/marketing-audit-2026-05-31.md` listing every existing marketing route with current content state and proposed action.

---

## MS-1, Homepage rewrite plus top 3 exam landings

**Scope.** Apply Direction C copy to homepage. Build the three highest-priority exam landings.

**Deliverables.**
- Homepage `/` rewritten with locked hero (per SITEMAP.md Direction C copy)
- `/tcf-canada` landing page, full content (hero, why this exam, what's tested, how Le Méthodic prepares, pricing CTA, testimonials)
- `/tef-canada` landing page, parallel structure
- `/tcf-quebec` landing page, parallel structure
- `/exam-prep` redirected to `/tcf-canada` (closes deviation #2)

**Dependencies.** MS-0 audit complete. Direction C copy in PRODUCT.md.

**Acceptance.** All 4 routes ship visible on production. Hero copy matches PRODUCT.md exactly. `/exam-prep` returns 308 redirect to `/tcf-canada`. Sonnet verifies via Playwright smoke before claiming shipped.

---

## MS-2, Public method explainer plus free placement test

**Scope.** Build the 5-couche public-facing pedagogy explainer and the free placement test.

**Deliverables.**
- `/methode` 5-couche overview page
- `/methode/les-pieges-anglais` standalone page for the differentiator couche (highest SEO leverage)
- `/placement` free placement test: 5 to 10 questions, CLB result delivered via email, lead capture

**Dependencies.** MS-0 audit. PRODUCT.md couche descriptions current.

**Acceptance.** Both `/methode` pages live. Placement test produces a CLB-mapped score email within 60 seconds of submission. Email capture rate measurable in analytics.

---

## MS-3, Pricing page plus founder page plus coaching booking

**Scope.** Pricing transparency, founder positioning, coaching as live bookable service.

**Deliverables.**
- `/tarifs` with 4-tier ladder visible (Découverte, Engagement, Maîtrise, Sprint), à la carte options, subscriber discounts
- `/chadi` founder page (photo, intro video, bio emphasizing 7000+ tutoring hours, 28-book Book-Lab catalog, 5-couche method authorship)
- `/coaching` 1-on-1 booking with Chadi (LemonSqueezy-backed payment, calendar integration)
- `/coaching/trial-class` free first session route

**Dependencies.** MS-0 audit. Phase 4 (LemonSqueezy) milestone complete (for `/coaching` booking and payment). PRODUCT.md tier descriptions current.

**Acceptance.** All 4 routes live. `/coaching` can take a booking, charge $99 (or free for trial-class), and add session to Chadi's calendar. Tier ladder on `/tarifs` matches PRODUCT.md exactly.

---

## MS-4, Help and legal table-stakes

**Scope.** Ship the help and legal pages every legitimate platform must have.

**Deliverables.**
- `/faq` with 15 to 25 common questions
- `/contact` form (subject, message, email; routes to Chadi's inbox)
- `/confidentialite` privacy policy (GDPR + Canadian privacy law)
- `/conditions` terms of service
- `/cookies` cookie policy

**Dependencies.** MS-0 audit. Legal review of privacy and terms ($3 to $5K CAD legal budget per Memory entry on Q1-Q8 architecture).

**Acceptance.** All 5 routes live. Legal pages reviewed by counsel. Contact form delivers email reliably.

---

## MS-5, Blog scaffolding plus first 5 posts

**Scope.** Stand up the blog surface and ship 5 SEO-targeted authored posts.

**Deliverables.**
- `/blog` index page with category filtering
- `/blog/[slug]` post template
- 5 authored posts targeting high-intent keywords (suggested topics: "How to pass TCF Canada in 90 days", "TCF Canada CLB scoring explained", "TCF Canada vs TEF Canada for immigration", "Common French mistakes English speakers make", "Express Entry French points calculator")

**Dependencies.** MS-0 audit. Content authoring time from Chadi.

**Acceptance.** Blog index and 5 posts live. Posts have proper schema markup for SEO. Each targets a specific search query identified via keyword research.

---

## MS-6, Remaining exam landings and cluster hubs

**Scope.** Complete the exam-landing surface area.

**Deliverables.**
- `/dalf`, `/dalf-c1` (secondary persona surfaces)
- `/delf`, `/delf-a1`, `/delf-a2`, `/delf-b1`, `/delf-b2` (diploma cluster)
- `/tcf-naturalisation`, `/tef-naturalisation`, `/naturalisation` (citizenship cluster)
- `/tcf-dap`, `/etudier-en-france`, `/tcf-residence`, `/residence-france` (studies and residence cluster)

**Dependencies.** MS-1 patterns established.

**Acceptance.** All routes live with full content. Each page ranks on its target keyword within 90 days of launch (measured via Search Console).

---

## MS-7, `/librairie` store launch

**Scope.** LemonSqueezy-backed digital store for the Book-Lab French catalog. Public-zone e-commerce surface. Digital products only (books, audio, downloads, free resources). Distinct from /la-bibliotheque, which is the in-app vocabulary product for authenticated learners.

**Deliverables.**
- `/librairie` hub with 4 category navigation (Livres, Audio, Téléchargements, Ressources gratuites)
- `/librairie/livres` populated with 8 to 10 Book-Lab titles
- `/librairie/audio` populated with 3 to 5 audio packs
- `/librairie/telechargements` populated with 5 to 8 download items
- `/librairie/ressources-gratuites` populated with 5 to 8 lead magnets (email-gated)
- `/librairie/[item-slug]` individual product pages
- `/librairie/checkout` LemonSqueezy checkout with subscriber discount logic (15% Engagement, 25% Maîtrise, 30% Sprint)
- 3 bundles: TCF Canada Complete Pack ($79), Anglophone Starter Pack ($49), Sprint Companion ($99)

**Dependencies.** Phase 4 (LemonSqueezy) complete. MS-3 pricing page live. Book-Lab catalog ready with at least 8 titles in deliverable format.

**Acceptance.** Store accepts payments via LemonSqueezy, applies discounts correctly per tier, delivers digital products via email or download link. Free resources require email capture and trigger drip campaign. Bundles purchasable at advertised prices.

---

## Cross-track dependencies (marketing depends on product)

| Marketing milestone | Depends on product milestone |
|---|---|
| MS-3 (coaching booking) | Phase 4 (LemonSqueezy) |
| MS-7 (store) | Phase 4 (LemonSqueezy), MS-3 |

If product milestone slips, dependent marketing milestone slips with it. Otherwise tracks are independent.

## Status as of 2026-06-02

All 8 milestones unstarted. Ready for backlog ticketing in BACKLOG.md.
