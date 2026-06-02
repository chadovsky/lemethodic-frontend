// Doctrine: the product is one complete website. Unbuilt parts render as
// bientot (coming soon) on a complete-feeling site. Flipping a flag is a
// content plus config change, never a new version bump or deployment gate.

export type FeatureStatus = 'live' | 'bientot'

// Start permissive; narrow to a literal union as keys are registered.
export type FeatureKey = string

// Seed empty. Subsequent tickets populate this record as surfaces are wired.
export const FEATURES: Record<FeatureKey, FeatureStatus> = {
  'examens/tef': 'bientot',
  'examens/dalf': 'bientot',
  'examens/delf': 'bientot',
  'examens/general': 'bientot',
  'blog': 'bientot',
  'pieges': 'bientot',
  // F-369: public librairie surfaces
  'librairie': 'bientot',
  'librairie-livres': 'bientot',
  'librairie-audio': 'bientot',
  'librairie-telechargements': 'bientot',
  'librairie-ressources-gratuites': 'bientot',
  // F-371: in-product surface scaffolds
  'seance': 'bientot',
  'ile': 'bientot',
  'ile-activites': 'bientot',
  'ile-tache': 'bientot',
  'maitre': 'bientot',
  'examen-checkpoint': 'bientot',
  'parametres': 'bientot',
  'abonnement': 'bientot',
}

// Returns true only when the key is explicitly set to 'bientot'.
// Unknown keys default to live by absence, so adding a key is opt-in.
export function isBientot(key: FeatureKey): boolean {
  return FEATURES[key] === 'bientot'
}
