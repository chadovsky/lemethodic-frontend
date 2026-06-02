// Doctrine: the product is one complete website. Unbuilt parts render as
// bientot (coming soon) on a complete-feeling site. Flipping a flag is a
// content plus config change, never a new version bump or deployment gate.

export type FeatureStatus = 'live' | 'bientot'

// Start permissive; narrow to a literal union as keys are registered.
export type FeatureKey = string

// Seed empty. Subsequent tickets populate this record as surfaces are wired.
export const FEATURES: Record<FeatureKey, FeatureStatus> = {}

// Returns true only when the key is explicitly set to 'bientot'.
// Unknown keys default to live by absence, so adding a key is opt-in.
export function isBientot(key: FeatureKey): boolean {
  return FEATURES[key] === 'bientot'
}
