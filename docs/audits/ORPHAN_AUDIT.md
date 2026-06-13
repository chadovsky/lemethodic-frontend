# Orphan Route Audit — Stage 0

**HEAD SHA audited:** `af25f182a0bceef420941595f96395cbcf26130b` (main, clean tree, == origin/main)
**Date:** 2026-06-13
**Scope:** read-only enumeration. No route/nav/component changes.

## Method

- **Inventory:** every `app/**/page.tsx`, route-group prefixes `(app)` / `(shell)` stripped from the URL.
- **Reachable set:** `SITEMAP.md`, `components/nav/TopNav.tsx` (logged-out shell), `components/layout/Sidebar.tsx` (logged-in shell), `components/home/BottomNav.tsx` (mobile), `components/landing/Footer.tsx`, plus every `<Link href>` / `router.push` / `router.replace` across `app/`, `components/`, `lib/`.
- **Redirects:** `next.config.mjs` `redirects()` is treated as part of reachability. A legacy-prefix link that 308s to a real route counts the target as reachable (indirect). A redirect whose `source` equals a real page path **shadows** that page (the page becomes unreachable).

Key structural facts discovered:
- Catch-all 308s exist for `/examen/:path*`→`/l-examen/...`, `/speaking/:path*`→`/l-examen/expression-orale/...`, `/writing/:path*`→`/l-examen/expression-ecrite/...`, `/method/:path*`→`/la-methode/...`. Several component links still use these legacy prefixes; they resolve but cost a redirect hop (see Table 3, indirect section).
- `/cours/methode-tcf-canada` and `/cours/methode-tcf-canada/:path*` are **redirected to `/la-methode`** while page files still exist at `app/(app)/cours/methode-tcf-canada/`. The redirect shadows the pages → dead code.
- TopNav's "Library" IA slot (SITEMAP) is in code a **"Store" → `/librairie`** item; `/la-bibliotheque` is **not** in TopNav. It is reachable only via Footer + `/librairie` page + vocab back-links.

---

## Table 1 — Full route inventory (83 routes)

| Path | Reachable | Entry point |
|---|---|---|
| `/` | Y | root landing |
| `/fr` | Y | sitemap hreflang / locale landing |
| `/fr/library` | Y (SEO) | sitemap hreflang alt only (no nav) |
| `/a-propos` | Y | Footer, tarifs, faq |
| `/faq` | Y | Footer |
| `/blog` | Y | Footer |
| `/blog/[slug]` | Y | blog index list |
| `/pieges` | Y | Footer, StickyHeader |
| `/pieges/[slug]` | Y | pieges index list |
| `/tarifs` | Y | TopNav, Footer, StickyHeader, Sidebar |
| `/examens` | Y | Footer, StickyHeader |
| `/examens/tcf` | Y | examens page |
| `/examens/[exam]` | **N** | only `/examens/tcf` linked (served by static route) |
| `/librairie` | Y | TopNav (Store), Footer, CartDrawer |
| `/librairie/[slug]` | Y | librairie catalog cards |
| `/librairie/livres` | Y | librairie sub-nav |
| `/librairie/audio` | Y | librairie sub-nav |
| `/librairie/telechargements` | Y | librairie sub-nav |
| `/librairie/ressources-gratuites` | Y | librairie sub-nav |
| `/library` | Y | PlatformLanding |
| `/mentions-legales` | Y | Footer, More |
| `/confidentialite` | Y | Footer, More |
| `/cgv` | Y | Footer |
| `/refund` | Y | More |
| `/legal/privacy` | **N** | superseded by `/confidentialite` |
| `/legal/tos` | **N** | superseded by `/cgv` + `/mentions-legales` |
| `/connexion` | Y | TopNav, StickyHeader, auth forms |
| `/inscription` | Y | TopNav, examens/tcf, Paywall |
| `/onboarding` | Y | SignupForm, connexion |
| `/onboarding/waitlist` | **N** | no inbound link/push; robots-disallowed |
| `/paywall` | Y | OnboardingFlow, EcoleReveal |
| `/password-reset` | Y | connexion |
| `/verify-email` | Y | EmailVerificationBanner, OnboardingFlow |
| `/bienvenue` | **N** | no inbound; onboarding routes to /la-methode\|/paywall |
| `/carte` | **N** | no inbound; bienvenue pushes /tableau-de-bord; robots-disallowed |
| `/tableau-de-bord` | Y | Sidebar, bienvenue, connexion |
| `/seance` | Y | Sidebar |
| `/more` | Y | BottomNav |
| `/progression` | Y | BottomNav, ClusterDetailPage, diagnostic Results |
| `/progres/clb` | **N** | no inbound link |
| `/profil` | Y | Sidebar, HomeScreen |
| `/parametres` | **N** | no inbound; bientot-config=bientot |
| `/abonnement` | **N** | no inbound; bientot-config=bientot |
| `/la-methode` | Y | TopNav, Sidebar, BottomNav, Footer |
| `/la-methode/[id]` | Y | HomeScreen/cards `/la-methode/lecon-N`, LessonNav |
| `/la-methode/intro` | Y | OnboardingFlow push |
| `/la-methode/lesson/[id]` | **N** | superseded by `/la-methode/[id]`; only self↔quiz links |
| `/la-methode/lesson/[id]/quiz` | **N** | only from orphan lesson/[id] |
| `/cluster/[slug]` | Y | TodayFocusSection |
| `/learn/[module_id]` | Y | HomeScreen, GouletStack, LearnModuleSheet |
| `/ile/[theme]` | Y | IleLeconCard |
| `/ile/[theme]/activites` | **N** | bientot-config=bientot; no link |
| `/ile/[theme]/tache` | **N** | no link |
| `/la-bibliotheque` | Y | Footer, librairie page, vocab back-links |
| `/la-bibliotheque/practice` | Y | VocabBrowse |
| `/la-bibliotheque/test` | Y | VocabBrowse |
| `/la-bibliotheque/[id]` | **N** | index (VocabBrowse) links only to top-level practice/test |
| `/la-bibliotheque/[id]/practice` | **N** | only from orphan [id] |
| `/la-bibliotheque/[id]/test` | **N** | only from orphan [id] |
| `/l-examen` | Y | Sidebar, TopNav (Exams), Footer, DiagnosticScoreWidget |
| `/l-examen/diagnostic` | Y | l-examen hub |
| `/l-examen/diagnostic/results` | Y | TacheNav, PastScorePanel |
| `/l-examen/diagnostic/tache/[n]` | Y | DiagnosticLanding, TacheNav, TacheSummary |
| `/l-examen/expression-orale` | Y | BottomNav, l-examen hub, session backlinks |
| `/l-examen/expression-orale/tache-1` | **N** | links target tache-1/[topic], not bare index |
| `/l-examen/expression-orale/tache-1/[topic]` | Y | SpeakingLanding (`/tache-1/interview`) |
| `/l-examen/expression-orale/tache-2` | Y | SpeakingLanding/Desktop, Tache2Session |
| `/l-examen/expression-orale/tache-2/[scenario]` | Y | HomeScreen, SpeakingLanding (`agence-voyages`) |
| `/l-examen/expression-orale/tache-3/[topic]` | Y | SpeakingLanding (`environnement`) |
| `/l-examen/expression-orale/feedback/[session]` | **N** | no inbound; sessions push elsewhere |
| `/l-examen/expression-ecrite` | Y | BottomNav, l-examen hub |
| `/l-examen/expression-ecrite/[prompt_id]` | Y (indirect) | WritingPromptPicker `/writing/[id]` → 308 |
| `/l-examen/expression-ecrite/history` | **N** | no inbound link |
| `/l-examen/comprehension-orale` | Y | l-examen hub (bientot) |
| `/l-examen/comprehension-orale/[exercise]` | **N** | parent bientot; no link |
| `/l-examen/comprehension-ecrite` | Y | l-examen hub (bientot) |
| `/l-examen/comprehension-ecrite/[exercise]` | **N** | parent bientot; no link |
| `/l-examen/mock` | Y | l-examen hub (bientot) |
| `/l-examen/[checkpoint]` | **N** | bientot-config=bientot |
| `/cours/methode-tcf-canada` | **N** | shadowed by 308 → /la-methode |
| `/cours/methode-tcf-canada/[id]` | **N** | shadowed by 308 → /la-methode |
| `/dev/bientot` | **N** | dev-only, no nav |
| `/dev/molds` | **N** | dev-only, no nav |

---

## Table 2 — Orphans

| Path | Classification | Recommendation | Attach point |
|---|---|---|---|
| `/carte` | WIRE | Intended Atlas hub / post-onboarding home (SITEMAP + memory F-437). Currently superseded by `/tableau-de-bord`. **Decide: wire or kill.** | post-onboarding redirect + Sidebar; today onboarding→/la-methode, bienvenue→/tableau-de-bord |
| `/bienvenue` | WIRE | Post-signup Target Profile capture (F-365). Currently unreached — SignupForm→/onboarding. **Decide: insert into signup flow or kill.** | SignupForm success / onboarding completion |
| `/parametres` | WIRE | Real Settings surface, flagged bientot. | Sidebar avatar / More menu (SITEMAP avatar dropdown) |
| `/abonnement` | WIRE | Real Subscription surface, flagged bientot. | Sidebar / More / avatar dropdown |
| `/progres/clb` | WIRE | CLB-per-skill + CRS points (F-337). | `/progression` or dashboard CLB widget |
| `/la-bibliotheque/[id]` | WIRE | Topic detail. Index (VocabBrowse) links only to top-level `/practice` + `/test`, never to a topic. Whole subtree stranded. | la-bibliotheque topic cards |
| `/la-bibliotheque/[id]/practice` | WIRE | Reachable only from orphan `[id]`. | parent `[id]` (lights up once `[id]` wired) |
| `/la-bibliotheque/[id]/test` | WIRE | Reachable only from orphan `[id]`. | parent `[id]` |
| `/ile/[theme]/activites` | WIRE | **Île detail — "Commencer la séance" wiring target.** bientot-config=bientot. | île detail "Commencer la séance" CTA |
| `/ile/[theme]/tache` | WIRE | **Île detail — "Commencer la séance" wiring target.** | île detail "Commencer la séance" CTA |
| `/l-examen/expression-orale/feedback/[session]` | WIRE | Oral feedback view with no inbound; sessions currently push to `/l-examen` or legacy `/examen/diagnostic`. | post-recording submit redirect |
| `/l-examen/expression-ecrite/history` | WIRE | Writing history, no inbound. | expression-ecrite hub / submission view |
| `/l-examen/expression-orale/tache-1` | WIRE/verify | Bare index; all links go to `tache-1/[topic]`. Confirm the index is needed vs redirect to a default topic. | speaking landing, or redirect→`/interview` |
| `/onboarding/waitlist` | WIRE/verify | Waitlist capture (WaitlistScreen), robots-disallowed, no inbound push found. | onboarding "not ready"/quick-date branch |
| `/l-examen/comprehension-orale/[exercise]` | INTENTIONAL | Parent is bientot; exercise deferred until CO is lit. | wire when CO content lands |
| `/l-examen/comprehension-ecrite/[exercise]` | INTENTIONAL | Same as above. | wire when CE content lands |
| `/l-examen/[checkpoint]` | INTENTIONAL | bientot-config=bientot placeholder. | n/a until lit |
| `/examens/[exam]` | INTENTIONAL | SEO catch-all; only `tcf` linked and served by the static `/examens/tcf` route. | n/a (or kill if no multi-exam SEO plan) |
| `/fr/library` | INTENTIONAL | SEO/locale alt; sitemap hreflang only, deliberately un-nav'd. | n/a |
| `/dev/bientot` | INTENTIONAL | Dev-only utility. | n/a |
| `/dev/molds` | INTENTIONAL | Dev-only mold gallery. | n/a |
| `/cours/methode-tcf-canada` | DEAD | Page **shadowed** by 308 → `/la-methode` (next.config:63). Unreachable dead code. | remove page files |
| `/cours/methode-tcf-canada/[id]` | DEAD | Shadowed by 308 → `/la-methode` (next.config:64). | remove page files |
| `/la-methode/lesson/[id]` | DEAD | Superseded by `/la-methode/[id]` (`lecon-N`). Only self↔quiz cross-links, no external entry. | remove or fold into `/la-methode/[id]` |
| `/la-methode/lesson/[id]/quiz` | DEAD | Reachable only from orphan `lesson/[id]`. | remove with parent |
| `/legal/privacy` | DEAD | Superseded by `/confidentialite` (footer + `/privacy` 308). No inbound. | remove |
| `/legal/tos` | DEAD | Superseded by `/cgv` + `/mentions-legales`. No inbound. | remove |

---

## Table 3 — Broken & indirect nav targets

### Hard-broken (no route, no redirect → 404)

| Nav source | Target route | Exists |
|---|---|---|
| `components/landing/Hero.tsx:80` | `/placement` | **N** — no route, no redirect |
| `components/nav/TopNav.tsx:107` (NAV_ITEMS coaching) | `/coaching` | **N** — SITEMAP marks `tbd`; currently 404 |
| `components/layout/Sidebar.tsx:43` (REVENUE_ITEMS) | `/coaching` | **N** — same |
| `next.config.mjs:67` (redirect destination) | `/tcf-canada` | **N** — `/exam-prep`→`/tcf-canada` lands on a non-existent page |

### Indirect (legacy prefix, resolves via 308 — tech debt, should point at canonical)

| Nav source | Target → resolves to | Note |
|---|---|---|
| `components/writing/WritingPromptPicker.tsx:305` | `/writing/[id]` → `/l-examen/expression-ecrite/[id]` | only entry into `[prompt_id]`; via redirect |
| `components/cluster/PracticeCTA.tsx:53` | `/examen/expression-orale/tache-N` → `/l-examen/...` | legacy `/examen` prefix |
| `components/speaking/Tache1Session.tsx:211` | `/examen/diagnostic` → `/l-examen/diagnostic` | legacy prefix |
| `components/speaking/Tache2Session.tsx:508` | `/examen/diagnostic` → `/l-examen/diagnostic` | legacy prefix |
| `components/dashboard/SnapshotSection.tsx:139` | `/speaking/tache-N` → `/l-examen/expression-orale/tache-N` | legacy `/speaking` prefix |
| `components/speaking/Tache2Picker.tsx:336` | `/speaking/tache-2/[code]` → `/l-examen/expression-orale/tache-2/[code]` | legacy prefix |
| `components/landing/Footer.tsx:22` | `/method` → `/la-methode` | legacy `/method` |

### SITEMAP drift (documented but not in code)

- SITEMAP TopNav row "Library → `/la-bibliotheque`" — code ships "Store → `/librairie`"; `/la-bibliotheque` is absent from TopNav.
- SITEMAP authenticated avatar dropdown (Profile/Settings/Account/About) — TopNav returns `null` when authed (F-446); Sidebar has no Settings/Account links, leaving `/parametres` and `/abonnement` unreachable (Table 2).
