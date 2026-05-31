# /fr/* Tree Discovery Audit
**Date:** 2026-05-31
**Scope:** Read-only survey of all files under `app/fr/`, English-drift analysis, hreflang correctness, internal reference mapping, and classification.

---

## Section 1: i18n Configuration

**Short answer: none.** The `/fr/*` tree is hand-rolled, not framework-managed.

| Check | Finding |
|---|---|
| `next.config.mjs` i18n block | Not present |
| `middleware.ts` | File does not exist |
| `next-intl` / `next-i18next` / similar | Not in `package.json` |
| `messages/` or `dictionaries/` folder | Neither folder exists |
| `[locale]` dynamic segment in `app/` | Not present |

**How /fr/* is routed:** Plain static App Router segments. `app/fr/page.tsx` serves `/fr`, `app/fr/exam-prep/page.tsx` serves `/fr/exam-prep`, etc. Each file manually passes `lang="fr"` to a shared component. There is no locale detection, redirect-to-locale middleware, or shared translation catalog. Users who land on `/fr` get French; users on `/` get English. No automatic detection or switching.

---

## Section 2: /fr/* Page Inventory

3 files found under `app/fr/`:

| File | URL | Size (bytes) | Last modified | Last commit SHA | Created | Creating commit SHA |
|---|---|---|---|---|---|---|
| `app/fr/page.tsx` | `/fr` | 794 | 2026-05-30 | fe4b897 | 2026-05-02 | 138674e |
| `app/fr/exam-prep/page.tsx` | `/fr/exam-prep` | 567 | 2026-05-07 | 49f491a | 2026-05-02 | 138674e |
| `app/fr/library/page.tsx` | `/fr/library` | 620 | 2026-05-30 | fe4b897 | 2026-05-07 | c24004f |

**Commit context:**
- `138674e` (2026-05-02): `refactor: M-101a commit 1 - landing page scaffolding` -- both `/fr` and `/fr/exam-prep` born here
- `c24004f` (2026-05-07): `fix: V-016a.fix + V-016g - writing result crash + /library stub` -- `/fr/library` created
- `49f491a` (2026-05-07): `feat: F-300b - preserve exam-prep landing at /exam-prep + /fr/exam-prep` -- last `/fr/exam-prep` touch
- `fe4b897` (2026-05-30): `M-VISUAL Cat E: copy sweep - em-dashes, brand mark, nav i18n, couche count, legacy names` -- `/fr` and `/fr/library` touched together (probably a pass across both files)

---

## Section 3: English Equivalent Comparison

| /fr URL | English counterpart | English exists? | English last modified | /fr last modified | Drift (days) |
|---|---|---|---|---|---|
| `/fr` | `/` | Yes (`app/page.tsx`) | 2026-05-30 | 2026-05-30 | 0 |
| `/fr/exam-prep` | `/exam-prep` | No -- deleted by F-332 (2026-05-31), now 308 -> `/tcf-canada` | 2026-05-07 (last before delete) | 2026-05-07 | 0 at deletion; English route no longer a page |
| `/fr/library` | `/library` | Yes (`app/library/page.tsx`) | 2026-05-30 | 2026-05-30 | 0 |

**Note on /fr/exam-prep:** At every point in history, `/fr/exam-prep` and `/exam-prep` were touched in lock-step (0-day drift). The problem is architectural, not staleness: the English route was deleted in F-332 and replaced by a redirect to `/tcf-canada`, which does not yet exist. The French page now serves content (old `LandingPage` funnel) that has no English equivalent page.

---

## Section 4: Unique-to-French Pages

**None.** Every `/fr/*` page has or had an English counterpart. No French-only content exists in the `/fr/` tree. The three `/fr/*` pages are all mirrors of English files, with `lang="fr"` passed down.

---

## Section 5: English Pages with No French Version

The `/fr/*` tree covers only 3 URLs. The full English surface has 40+ routes. Below are the marketing/public routes with no `/fr/*` counterpart (authed surfaces omitted -- they are English-only by design):

| English URL | Category | Notes |
|---|---|---|
| `/tcf-canada` | Marketing landing | MS-1 page, not yet created |
| `/method` | Marketing | No French stub |
| `/paywall` | Conversion funnel | English-only by design |
| `/onboarding` | Conversion funnel | English-only by design |
| `/signup`, `/login`, `/password-reset`, `/verify-email` | Auth | English-only by design |
| `/privacy`, `/terms`, `/refund` | Legal | English-only |
| `/legal/privacy`, `/legal/tos` | Legal | English-only |
| `/library` | Marketing stub | Has `/fr/library` -- covered |
| `/` | Root | Has `/fr` -- covered |

All authed surfaces (`/dashboard`, `/cours/*`, `/la-bibliotheque/*`, `/l-examen/*`, `/speaking/*`, `/writing/*`, `/progress`, `/account`, `/more`, `/profile`) are English-only with no `/fr/*` equivalents. This appears intentional -- the product UI is English, only the acquisition funnel has French variants.

---

## Section 6: Hreflang Audit

### /fr/* pages declaring hreflang

| /fr URL | hreflang `en` target | hreflang `fr` target | `en` target valid? | `fr` target valid? |
|---|---|---|---|---|
| `/fr` | `/` | `/fr` | Yes | Yes |
| `/fr/exam-prep` | `/exam-prep` | `/fr/exam-prep` | **No -- 308 redirect to `/tcf-canada`** | Yes (page exists) |
| `/fr/library` | `/library` | `/fr/library` | Yes | Yes |

**Stale hreflang:** `app/fr/exam-prep/page.tsx` declares `en: '/exam-prep'`. That path now returns a 308 redirect to `/tcf-canada`. Search engines will follow the redirect, but the canonical signal is muddied. This should be updated to `en: '/tcf-canada'` once MS-1 ships that page, or the `/fr/exam-prep` page should be redirected to a `/fr/tcf-canada` equivalent.

### English pages declaring hreflang to /fr

| English URL | File | hreflang `fr` target | Target valid? |
|---|---|---|---|
| `/library` | `app/library/page.tsx:17` | `/fr/library` | Yes |
| `/` | `app/page.tsx` (via component) | N/A (no hreflang on root) | -- |

Previously `app/exam-prep/page.tsx` declared `fr: '/fr/exam-prep'`. That file was deleted by F-332 so the signal is gone.

---

## Section 7: Internal References

**Active codebase only** (excluding `.claude/worktrees/` snapshots and `.md` historical records):

| File | Line | /fr URL | Usage |
|---|---|---|---|
| `app/library/page.tsx` | 17 | `/fr/library` | hreflang alternate in `metadata.alternates.languages` |
| `components/landing/LandingFooter.tsx` | 78 | `/fr/exam-prep` | `<Link href>` rendered when `lang === 'fr'` (footer on `/fr` and `/fr/library`) |
| `components/landing/PlatformLanding.tsx` | 95 | `/fr/exam-prep` | Card `href` for Exam Prep card when `lang === 'fr'` (rendered on `/fr`) |
| `components/landing/PlatformLanding.tsx` | 117 | `/fr/exam-prep` | `seeMoreHref` for methodology section when `lang === 'fr'` (rendered on `/fr`) |
| `components/layout/StickyHeader.tsx` | 15, 17 | `/fr/exam-prep`, `/fr/library` | MARKETING_EXACT exclusion list (suppresses sticky header on these routes) |
| `components/nav/TopNav.tsx` | 43, 45 | `/fr/exam-prep`, `/fr/library` | EXCLUDED_EXACT set (suppresses in-product nav on these routes) |
| `tests/e2e/m0-audit.spec.ts` | 56, 57 | `/fr/exam-prep`, `/fr/library` | Route audit fixture entries |
| `tests/e2e/t5-dark-mode-gallery.spec.ts` | 48, 49 | `/fr/exam-prep`, `/fr/library` | Dark mode gallery route list |

**Reachability summary:**
- `/fr` is linked from nowhere internally (direct URL or external link only).
- `/fr/exam-prep` is linked from `PlatformLanding` (3 places) when `lang === 'fr'` and from `LandingFooter` when `lang === 'fr'`. It is reachable from `/fr` via product cards and footer.
- `/fr/library` is linked from `LandingFooter` when `lang === 'fr'`. Also reachable from the Exam Prep card footer on `/fr/exam-prep`.

**Entry point:** A user must navigate to `/fr` directly (no English-side link routes there). Once on `/fr`, the French flow is internally connected.

---

## Section 8: Recommendation

### 1. Classification: MIXED

| Page | Classification | Reason |
|---|---|---|
| `/fr` | INTENTIONAL | 0-day drift with English counterpart. Updated in the same commit on 2026-05-30. Internally linked from footer (via `/fr/exam-prep` chain). Component parity with `/` is exact. |
| `/fr/library` | INTENTIONAL | 0-day drift with English counterpart. Updated together with English in the M-VISUAL sweep. Component parity with `/library` is exact. |
| `/fr/exam-prep` | LEGACY | English counterpart deleted (F-332). Stale hreflang pointing at a 308 redirect. Content (`LandingPage`) is the old TCF funnel, not updated since 2026-05-07. Still linked from `/fr` PlatformLanding but leads to content that no longer has an English equivalent route. |

### 2. Estimated effort per scenario

**a. Keep /fr/* as a complete mirror of English (bring to parity)**

- `/fr/exam-prep`: resolve the hreflang (`en: '/exam-prep'` is stale). Once MS-1 ships `/tcf-canada`, either redirect `/fr/exam-prep` to a `/fr/tcf-canada` page, or update this page to render a French version of the MS-1 TCF Canada landing. Effort: 1 ticket (mirrors MS-1 FE work). Blocked on MS-1.
- `/fr` + `/fr/library`: no action needed, both are 0-day drift.
- All authed surfaces, `/onboarding`, `/paywall`, etc.: no French equivalents and none appear planned. Parity here is out of scope for V1.

**b. Delete /fr/* entirely (5 files to remove, links to clean up)**

Files to remove:
1. `app/fr/page.tsx`
2. `app/fr/exam-prep/page.tsx`
3. `app/fr/library/page.tsx`

Links to clean up (3 components):
1. `components/landing/LandingFooter.tsx` -- remove `lang === 'fr' ? '/fr/exam-prep' : ...` ternary, use `/tcf-canada` unconditionally
2. `components/landing/PlatformLanding.tsx` -- remove French card hrefs and `seeMoreHref` for `/fr/*` paths (2 locations)
3. `components/layout/StickyHeader.tsx` + `components/nav/TopNav.tsx` -- remove `/fr/exam-prep` and `/fr/library` from exclusion sets
4. `app/library/page.tsx` -- remove `fr: '/fr/library'` hreflang alternate
5. Tests: remove `/fr/exam-prep` + `/fr/library` from `m0-audit.spec.ts` and `t5-dark-mode-gallery.spec.ts`

Estimated effort: 1 ticket, straightforward. Zero risk of breaking authed flows.

**c. Keep some, delete some (recommended path)**

- **Keep `/fr`** -- it is the natural entry point for the French acquisition funnel. PlatformLanding French copy is maintained and was updated 2026-05-30.
- **Keep `/fr/library`** -- 0-day drift, hreflang correct, internally linked.
- **Delete or redirect `/fr/exam-prep`** -- its English counterpart is now a redirect. Its hreflang is stale. When MS-1 ships `/tcf-canada`, create `/fr/tcf-canada` as the French exam landing and redirect `/fr/exam-prep` to it (308). Until then, redirect `/fr/exam-prep` to `/fr` (the French platform landing) to avoid the French flow landing on stale content.

Effort for option c: small -- 1 redirect rule added to `next.config.mjs`, update 3 component link references from `/fr/exam-prep` to `/fr/tcf-canada` (placeholder until MS-1).

### 3. Risk of deleting /fr/*

- **No authed surfaces depend on /fr/*.** All authenticated routes are English-only.
- **No conversion funnel depends on /fr/*.** The onboarding and paywall are English-only.
- **External links risk:** If any French-language marketing links (social, ads, email) point to `/fr` or `/fr/exam-prep`, deleting those pages would 404 for those visitors. This is UNKNOWN -- founder should check external link profile before deleting.
- **SEO risk:** `/fr` and `/fr/library` have correct hreflang and are indexed (UNKNOWN -- founder to verify via Search Console). Deleting them without redirects would drop any French-locale organic traffic. Low risk given the product is early, but nonzero.
- **Internal link risk:** 3 components link to `/fr/exam-prep`. All would need updating before or alongside deletion. Easy to do -- see option c above.

**Bottom line:** The `/fr/*` tree is a thin, mostly-maintained French acquisition layer. The only broken piece is `/fr/exam-prep`, which became a dead end after F-332. The recommended immediate action is to add a redirect rule `/fr/exam-prep -> /fr` as a temporary fix, and scope a proper `/fr/tcf-canada` page as part of the MS-1 French-locale work.
