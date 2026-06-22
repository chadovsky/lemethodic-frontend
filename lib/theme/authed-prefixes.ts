// F-482 — single source of truth for which URL prefixes are authenticated (or
// auth-aware) surfaces, where dark mode is allowed. Everything NOT matched here
// is a logged-out / marketing surface and must always render the v3 light
// palette (the F-481 doctrine: marketing never renders dark).
//
// Consumed by:
//   - the pre-paint inline script in app/layout.tsx (serialized via JSON.stringify)
//   - components/theme/MarketingThemeGuard.tsx (the client-nav guard)
//
// GUARD-RAIL: never add a marketing route here. The token gate in the pre-paint
// script does NOT save a mis-listed marketing route from rendering dark for a
// logged-in user, because the MarketingThemeGuard skips authed paths. Keeping
// this list authed-only is what makes "marketing never renders dark" hold.
//
// Nuances baked into this list (do not "simplify"):
//   - /onboarding/waitlist is authed; /onboarding (the funnel) is PUBLIC. Listing
//     the deeper prefix keeps /onboarding light.
//   - /la-methode is AUTH-AWARE: the (shell) base is light when logged out and
//     dark-capable when authed. The pre-paint script's token gate resolves this
//     (apply stored theme only when a token exists), so listing /la-methode here
//     is correct and also covers /la-methode/intro and /la-methode/[id].

export const AUTHED_PREFIXES = [
  // (app) route group (URL-level; route groups are URL-invisible)
  '/tableau-de-bord',
  '/carte',
  '/ile',
  '/l-examen',
  '/la-bibliotheque',
  '/abonnement',
  '/parametres',
  '/profil',
  '/progression',
  '/seance',
  // (shell) auth-aware base + the authed /la-methode subtrees
  '/la-methode',
  // standalone authed routes that wrap ProtectedRoute directly at the app root
  '/bienvenue',
  '/more',
  '/progres/clb',
  '/onboarding/waitlist',
  '/learn',
  '/cluster',
] as const

// A path is authed when it equals a prefix exactly or sits beneath it. The
// `+ '/'` boundary stops '/onboarding' from matching '/onboarding/waitlist' and
// keeps sibling prefixes (e.g. /progres vs /progression) from colliding.
export function isAuthedPath(pathname: string): boolean {
  return AUTHED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
}
