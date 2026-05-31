# Sidebar Audit -- Le Methodic
**Date:** 2026-05-31
**Ticket:** F-341
**Author:** Claude Code (Sonnet 4.6)
**Scope:** Read-only audit. Consolidation, toggle, and token migration are OUT OF SCOPE for this dispatch and tracked in F-341 (Chunk 2 = follow-up work).

---

## Section 1: Component Inventory

Two sidebar implementations exist in the codebase.

### S1: Custom in-product sidebar (ACTIVE)

| File | Lines | Last commit | Last modified |
|------|-------|-------------|---------------|
| `components/layout/Sidebar.tsx` | 165 | 83b0082 (F-334) | 2026-05-31 |
| `components/layout/SidebarLink.tsx` | 66 | d99f6db (M2 shell sweep) | 2026-05-30 |
| `components/layout/AppShell.tsx` | 140 | d99f6db (M2 shell sweep) | 2026-05-30 |

**Sidebar.tsx** -- default export `Sidebar`. Imported exclusively by `AppShell.tsx`.

**SidebarLink.tsx** -- default export `SidebarLink`. Imported exclusively by `Sidebar.tsx`.

**AppShell.tsx** -- default export `AppShell`. Imported by `app/(app)/layout.tsx`. Composes Sidebar + mobile top bar + backdrop + EmailVerificationBanner + main content.

### S2: Radix UI sidebar library (UNUSED)

| File | Lines | Last commit | Last modified |
|------|-------|-------------|---------------|
| `components/ui/sidebar.tsx` | ~600 | initial shadcn scaffold | 2026-04-21 |

**Named exports (21):** `SidebarProvider`, `Sidebar`, `SidebarTrigger`, `SidebarRail`, `SidebarInset`, `SidebarInput`, `SidebarHeader`, `SidebarFooter`, `SidebarSeparator`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupAction`, `SidebarGroupContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuSkeleton`, `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton`.
**Hook:** `useSidebar`.

**Verdict:** This file is not imported anywhere in the application. It was scaffolded by shadcn's `npx shadcn@latest add sidebar` and has never been wired to a route or layout. It is a dead file for the purposes of this audit.

---

## Section 2: Usage Map

### (app) route group surfaces

ALL authenticated app surfaces render Sidebar through a single import chain:

```
app/(app)/layout.tsx
  -> AppShell (components/layout/AppShell.tsx)
    -> Sidebar (components/layout/Sidebar.tsx)
      -> SidebarLink (components/layout/SidebarLink.tsx)
```

Routes that inherit this sidebar (everything inside `app/(app)/`):

- `/dashboard`
- `/cours/methode-tcf-canada` and nested `lecon-*` routes
- `/la-bibliotheque`
- `/l-examen` (umbrella hub, F-335)
- `/l-examen/diagnostic`
- `/l-examen/expression-orale` (speaking surfaces)
- `/l-examen/expression-ecrite` (writing surfaces)
- `/l-examen/comprehension-orale` (skeleton, F-335)
- `/l-examen/comprehension-ecrite` (skeleton, F-335)
- `/account`
- `/progress`

**F-335 note:** Speaking and writing are now inside `(app)` and therefore DO inherit the sidebar. This was confirmed by the single shared layout at `app/(app)/layout.tsx`.

### Marketing/public surfaces

No sidebar. `StickyHeader` (`components/layout/StickyHeader.tsx`) handles marketing route navigation with a simple logo + sign-in + hamburger-triggered mobile menu. Not a sidebar by the definition in this audit.

### Auth surfaces

No sidebar. `/login` and `/signup` render standalone layouts.

### Standalone surfaces

None outside (app) or marketing paths.

### Multiple sidebars layered

No surface renders more than one sidebar. There are no nested `(app)` sub-layouts that introduce a second sidebar layer. `app/(app)/layout.tsx` is the only layout in the (app) route group.

---

## Section 3: Collapse Toggle Behavior

### S1: Custom sidebar (Sidebar.tsx)

**Desktop (>= 1024px):** NO TOGGLE. The sidebar is always visible as a fixed 240px left column. There is no button to collapse or hide it on desktop. Users cannot hide the sidebar on desktop.

**Mobile (< 1024px):** The sidebar is hidden by default (`transform: translateX(-100%)`). A hamburger button in the mobile top bar opens it as a full-height drawer. A close button (X icon) appears inside the sidebar header on mobile only (`className="lg:hidden"`). Clicking either the close button or the backdrop overlay closes the drawer.

| Attribute | Value |
|-----------|-------|
| Desktop collapse toggle | NONE |
| Mobile open trigger | Hamburger icon in AppShell mobile top bar |
| Mobile close trigger | X button in sidebar header (mobile only) OR backdrop click |
| Icon (open) | Custom SVG hamburger (3 horizontal strokes, 20x20) |
| Icon (close) | Custom SVG X (diagonal lines, 16x16) |
| Collapsed state persistence | Not applicable (no desktop toggle exists) |
| Keyboard shortcut | None |

**Verdict for S1:** NO TOGGLE for desktop. User cannot hide the sidebar on wide viewports.

### S2: Radix UI sidebar library (components/ui/sidebar.tsx)

This library (unused in the app) has full collapse capability:

| Attribute | Value |
|-----------|-------|
| Toggle button | `SidebarTrigger` (wraps shadcn `Button`) |
| Icon | `PanelLeftIcon` from lucide-react |
| Keyboard shortcut | Cmd+B / Ctrl+B |
| Persistence | Cookie (`sidebar_state`, 7-day TTL) |
| Collapsible modes | `offcanvas` (hide), `icon` (icon-only), `none` |
| Mobile | `Sheet` (slide-in from left) |
| Desktop collapsed width | 3rem (48px, icon-only) |

This library is feature-complete but has zero DESIGN.md v2 token integration. It uses shadcn defaults.

---

## Section 4: Design Token Compliance

### S1: Custom sidebar (Sidebar.tsx + SidebarLink.tsx)

| Token used | CSS variable | DESIGN.md v2 mapping | Compliant? |
|------------|-------------|----------------------|------------|
| Sidebar background | `var(--bg-elevated)` | `--paper` (light) / `--paper-tint` (dark) -- maps to `--dominant`-tinted whites | YES |
| Sidebar border | `var(--rule-default)` | `var(--rule)` = `rgba(15,20,25,0.08)` | YES |
| Nav link active text | `var(--text-primary)` | `var(--ink)` = `#0F1419` | YES |
| Nav link inactive text | `var(--text-muted)` | `var(--ink-faint)` | YES |
| Active bar indicator | `var(--cta-utility)` | `var(--dominant)` = `#14213D` | YES |
| Avatar background | `var(--cta-utility)` | `var(--dominant)` = `#14213D` | YES |
| Avatar text color | `#fff` (hardcoded) | white on `--dominant` -- correct usage | ACCEPTABLE |
| Mobile backdrop | `rgba(20, 18, 14, 0.45)` (hardcoded) | Off-palette -- should use `var(--ink)` at opacity | MINOR DRIFT |
| Sign-out button text | `var(--text-muted)` | `var(--ink-faint)` | YES |

**Typography compliance:**

- Font in use: `SANS_FONT` from `lib/typography.ts`, which resolves to `Geist` sans-serif.
- DESIGN.md v2 specifies `Instrument Sans` for nav items (Section 3, Type A fonts).
- **Gap:** nav items currently render in Geist, not Instrument Sans. This is the M2 token migration gap.

**Legacy fp-* tokens:** None found in S1. No `--fp-sage`, `--fp-peach`, `--fp-butter`, or similar in the sidebar component.

**Off-palette hardcoded colors:** One -- the mobile backdrop `rgba(20, 18, 14, 0.45)` in AppShell.tsx line 104. This is a near-black that is visually close to `var(--ink)` at 45% opacity but not using the variable.

### S2: Radix UI sidebar library (components/ui/sidebar.tsx)

Uses shadcn CSS custom properties (`--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-accent`, etc.). None of these variables are defined in `app/globals.css`. They are not DESIGN.md v2 tokens. This component would require full token replacement before it could match the Atelier Francais palette.

**Verdict for S2 design token compliance:** 1/5 (not applicable -- unused, and uses wrong variable names).

---

## Section 5: Navigation Items

### S1: Custom sidebar navigation tree

Defined in `NAV_ITEMS` constant in `Sidebar.tsx` lines 8-14:

| Order | Label | Target route | Icon | Active match |
|-------|-------|-------------|------|--------------|
| 1 | Tableau de bord | `/dashboard` | None | exact match |
| 2 | La Methode | `/cours/methode-tcf-canada` | None | exact + prefix |
| 3 | La Bibliotheque | `/la-bibliotheque` | None | exact + prefix |
| 4 | L'Examen | `/l-examen` | None | exact + prefix |
| 5 | Compte | `/account` | None | exact + prefix |

**Icons:** No icons on any nav item. Text-only labels.

**Active state indication:**
- 4px wide vertical bar on left edge of row, colored `var(--cta-utility)`
- Font-weight increases from 500 to 600
- Text color changes from `var(--text-muted)` to `var(--text-primary)`
- `aria-current="page"` attribute set on the active link
- Left padding reduces from 17px to 13px (to accommodate the 4px bar without layout shift)
- Row background: `var(--bg-elevated)` via `.sidebar-active-row` CSS class

**Nested items:** None. Navigation is flat (no submenus).

**Footer item:**
- "Se deconnecter" (sign-out button) -- rendered only when `onSignOut` prop is provided. Separated by a top border from the nav section.

---

## Section 6: Mobile Responsive Behavior

### S1: Custom sidebar

**Below 1024px (mobile/tablet):**

1. Mobile top bar (`<header class="app-shell-topbar">`, 56px, sticky) replaces the TopNav desktop bar. Contains hamburger button + wordmark.
2. Sidebar is hidden off-screen to the left: `.app-shell-sidebar { transform: translateX(-100%); }`.
3. Hamburger click sets `drawerOpen = true` in AppShell state.
4. Sidebar slides in: `.app-shell-sidebar[data-drawer-open="true"] { transform: translateX(0); }` with `300ms var(--lm-ease)` transition.
5. Backdrop overlay appears at z-index 40 with fade-in animation (200ms). Clicking backdrop closes drawer.
6. Sidebar X button (visible only below lg breakpoint, `className="lg:hidden"`) closes the drawer.
7. Any nav link click calls `onLinkClick` which also closes the drawer.
8. `prefers-reduced-motion: reduce` disables the slide transition and backdrop fade.

**At 1024px and above (desktop):**

1. Mobile top bar hidden: `.app-shell-topbar { display: none; }`.
2. Backdrop hidden: `.app-shell-backdrop { display: none; }`.
3. Sidebar always visible: `.app-shell-sidebar { transform: translateX(0); }`.
4. Main content offset: `.app-shell-main { margin-left: 240px; }`.
5. TopNav (`components/nav/TopNav.tsx`) renders above the sidebar at 64px; sidebar offsets with `lg:!top-16` class.

**Separate mobile nav component:** No dedicated mobile nav component -- the sidebar itself transforms into the drawer. The mobile top bar is part of AppShell.

**What replaces sidebar on mobile:** Mobile top bar (sticky header with hamburger) serves as the entry point. Sidebar appears as a drawer overlay when triggered.

---

## Section 7: Accessibility

### S1: Custom sidebar

| Criterion | Implementation | Status |
|-----------|---------------|--------|
| `<nav>` landmark | `<nav aria-label="App sections">` -- line 124 of Sidebar.tsx | PASS |
| Active item `aria-current` | `aria-current={active ? 'page' : undefined}` -- SidebarLink.tsx line 44 | PASS |
| Close button label | `aria-label="Close navigation"` on X button | PASS |
| Hamburger label | `aria-label="Open navigation menu"` + `aria-expanded={drawerOpen}` + `aria-controls="app-shell-sidebar"` | PASS |
| Sidebar landmark `id` | `id="app-shell-sidebar"` -- matches `aria-controls` on hamburger | PASS |
| Sidebar landmark `aria-label` | `aria-label="Primary"` on `<aside>` | PASS |
| Focus management on drawer open | NOT implemented. Focus does not move to sidebar or first nav item when drawer opens. | FAIL |
| Focus trap in open drawer | NOT implemented | FAIL |
| Keyboard shortcut for collapse | None (no desktop toggle exists) | N/A |
| Icon buttons have labels | Yes -- both hamburger and X have aria-label | PASS |
| Skip-to-content link | Implemented in TopNav.tsx (desktop only) | PARTIAL |

**A11y gaps:**
1. When the mobile drawer opens, focus stays on the hamburger button behind the backdrop. A screen reader user navigating by tab will not land in the sidebar. Focus should move to the first nav item or the close button when `drawerOpen` becomes `true`.
2. No focus trap inside the open drawer. Tab key can pass through the backdrop to the main content while the overlay is visible.
3. Skip-to-content is in TopNav (desktop) but not in the mobile top bar (AppShell).

---

## Section 8: Quality Benchmark Comparison

Reference: "Pro Sidebar" pattern -- free, polished, collapsible, icon + label, hamburger toggle, hover states, nested submenu support.

### S1: Custom sidebar (Sidebar.tsx -- the ACTIVE sidebar)

| Dimension | Score (1-5) | Notes |
|-----------|-------------|-------|
| Collapse mechanism | 2 | Mobile drawer works cleanly (300ms slide, reduce-motion safe). Desktop has no toggle. User cannot hide sidebar at wide viewports. |
| Visual polish | 3 | Clean token usage, 4px active bar, text weight change on active. No icons on nav items. No hover state beyond color transition. No icon-only collapsed mode. Functional but below Pro Sidebar baseline. |
| Mobile pattern | 4 | Proper drawer with backdrop, hamburger with aria attributes, smooth transition, reduce-motion safe. Missing: focus management on open. |
| Accessibility | 3 | nav landmark, aria-current, labeled buttons are correct. Critical gaps: no focus trap, no focus move on drawer open. |
| Design token compliance | 4 | All semantic tokens from DESIGN.md v2 palette correctly used. One hardcoded backdrop color. Typography gap: Geist instead of Instrument Sans for nav items. |

### S2: Radix UI sidebar library (components/ui/sidebar.tsx -- UNUSED)

| Dimension | Score (1-5) | Notes |
|-----------|-------------|-------|
| Collapse mechanism | 5 | Full toggle (offcanvas / icon-only / none), Cmd+B shortcut, cookie persistence. |
| Visual polish | 4 | shadcn quality primitives, tooltip on icon-only, skeleton loader, group labels. Token migration required before it matches Atelier Francais. |
| Mobile pattern | 5 | Sheet-based drawer with proper mobile detection via `useIsMobile`. |
| Accessibility | 5 | Full ARIA, keyboard shortcut documented, tooltip on icon-only collapse. |
| Design token compliance | 1 | Uses shadcn `--sidebar-*` variables not defined in globals.css. Zero Atelier Francais integration. Would require full re-token before use. |

---

## Section 9: Recommendation

### CONSOLIDATE

The codebase has one active sidebar (S1) and one unused component library (S2). There is no consolidation problem for the active surfaces -- S1 is the only sidebar rendering in the app. The recommendation here is about what to do in F-341 follow-up work:

**Recommended approach:** Keep `Sidebar.tsx` as the base. It is production-proven, tested (12 unit tests in `Sidebar.test.tsx`), uses correct DESIGN.md v2 tokens, and is fully wired into the app. Do NOT replace it with the Radix UI `ui/sidebar.tsx` -- the re-token cost is high and the API surface is much larger than what the app needs.

Adopt specific patterns from `ui/sidebar.tsx` selectively:
- Cookie persistence pattern for collapse state
- Keyboard shortcut (Cmd+B) for desktop toggle
- Icon-only collapsed mode (48px) as the collapsed target width

### TOGGLE

**Add a desktop collapse toggle.** The highest-priority gap. The sidebar has no way to be hidden on viewports >= 1024px.

Recommended implementation:
- Toggle button position: inside sidebar header, far right (same row as wordmark), visible only at >= 1024px (mirror of the current close button which is mobile-only).
- Icon: chevron-left (expanded state) / chevron-right (collapsed state). More semantic than hamburger for a collapse action.
- Collapsed state: icon-only mode (48px width) showing avatars + nav icons. Nav items currently have no icons -- adding icons is a prerequisite.
- Persistence: cookie-based, 7-day TTL (same approach as `ui/sidebar.tsx`).
- Keyboard shortcut: Cmd+B / Ctrl+B.
- Mobile behavior unchanged (drawer pattern is correct).

**Prerequisite for icon-only collapse:** Add icons to all 5 nav items. Currently text-only. Collapsed sidebar requires icon fallback. Lucide icons are already in the dependency tree.

### TOKEN MIGRATION

Remaining token work:
1. **Typography:** Replace `SANS_FONT` (Geist) with Instrument Sans in `Sidebar.tsx` and `SidebarLink.tsx` for nav label text. Instrument Sans is already defined as the M2 body font in DESIGN.md v2.
2. **Mobile backdrop:** Replace hardcoded `rgba(20, 18, 14, 0.45)` in `AppShell.tsx` line 104 with `color-mix(in srgb, var(--ink) 45%, transparent)` or a dedicated CSS variable.

### ACCESSIBILITY

Gaps to fix in the follow-up:
1. Focus management: move focus to first nav item (or close button) when mobile drawer opens (`useEffect` watching `drawerOpen`).
2. Focus trap: `Tab` inside open mobile drawer should cycle within the sidebar until it is closed.
3. Skip-to-content: add a visually-hidden skip link in the AppShell mobile top bar, matching the TopNav desktop implementation.
4. Desktop toggle: when implemented, include `aria-label="Collapse navigation"` / `aria-label="Expand navigation"` + `aria-expanded` on the toggle button.

### ESTIMATED EFFORT

| Work | Estimate |
|------|----------|
| Add icons to 5 nav items | 1 small dispatch (30 min) |
| Desktop collapse toggle + cookie persistence + Cmd+B + icon-only mode | 1 medium dispatch (2-3 hours) |
| Instrument Sans for nav items + backdrop token fix | 1 small dispatch (30 min), can be bundled with icons |
| Focus trap + focus management + mobile skip link | 1 small dispatch (1-2 hours) |
| **Total** | **2 medium dispatches if bundled: (icons + tokens) then (toggle + a11y)** |

F-341 in BACKLOG.md covers all of this. No new ticket needed -- scope is already correct.

---

## Section 10: Files Affected

Every file that imports any sidebar component (direct or transitive):

### Direct importers

| File | Imports |
|------|---------|
| `components/layout/Sidebar.tsx` | `SidebarLink` (from `./SidebarLink`); `SANS_FONT` (from `@/lib/typography`); `Wordmark` (from `@/components/Wordmark`) |
| `components/layout/AppShell.tsx` | `Sidebar` (from `./Sidebar`); `SERIF_FONT` (from `@/lib/typography`); `useAuthStore`, `signOut` (from `@/lib/auth`); `EmailVerificationBanner` |
| `app/(app)/layout.tsx` | `AppShell` (from `@/components/layout/AppShell`) |
| `tests/unit/layout/Sidebar.test.tsx` | `Sidebar` (from `@/components/layout/Sidebar`) |
| `tests/unit/layout/AppShell.test.tsx` | `AppShell` (from `@/components/layout/AppShell`) |

### Transitive blast radius (all (app) routes)

Any change to `Sidebar.tsx`, `SidebarLink.tsx`, or `AppShell.tsx` affects every route inside `app/(app)/`, including:

- `app/(app)/dashboard/`
- `app/(app)/cours/`
- `app/(app)/la-bibliotheque/`
- `app/(app)/l-examen/` (and all sub-routes: diagnostic, expression-orale, expression-ecrite, comprehension-orale, comprehension-ecrite)
- `app/(app)/account/`
- `app/(app)/progress/`

**No other file imports `components/ui/sidebar.tsx`.** It is safe to delete or leave dormant.

### CSS entrypoints

`app/globals.css` contains all sidebar-related CSS rules:
- `.app-shell-sidebar` (lines 1083-1086): transform/transition
- `.app-shell-sidebar[data-drawer-open="true"]` (line 1087): open state
- `@media (min-width: 1024px)` block (lines 1088-1093): desktop layout
- `.sidebar-active-row` (line 1096): active row background
- `@keyframes backdrop-fade-in` (lines 1099-1102): backdrop animation
- `.app-shell-backdrop` (line 1103): backdrop animation class
- `@media (prefers-reduced-motion: reduce)` block (lines 1106-1109): reduced motion overrides

Any collapse/icon-only work will need new CSS rules in `app/globals.css`.

---

*End of sidebar audit. No code was modified during this audit.*
