'use client'

// F-325 (A5) — tier-gate stub. Returns 'unknown' until F-311.fe lands
// the real subscription contract. Call sites can branch on tier ===
// 'free' to surface the locked-card upsell; 'unknown' falls through
// to the unlocked path so the surface degrades gracefully until live
// tier reads exist.
//
// F-311.fe contract assumed (to validate when it ships):
//   - GET /api/auth/me returns { ..., tier: 'free' | 'paid' }
//     (or 'monthly' / 'sprint' / 'premium' all collapse to 'paid' for
//      the gate — the gate is binary).
//   - useUserTier reads it from useAuthStore once the User shape gains
//     the field; until then the override below covers the F-225
//     screenshot capture path.
//
// Dev/screenshot override: append ?tier=free to any /vocabulaire URL
// to force the 'free' branch for one render. Used by Chadi to capture
// the F-225 locked-card screenshot before F-311.fe lands. The override
// is intentionally non-persistent (search-param scoped to the URL) so
// it can't leak into normal browsing.

import { useSearchParams } from 'next/navigation'

export type UserTier = 'unknown' | 'free' | 'paid'

export function useUserTier(): { tier: UserTier } {
  const params = useSearchParams()
  const override = params.get('tier')
  if (override === 'free' || override === 'paid') {
    return { tier: override }
  }
  return { tier: 'unknown' }
}
