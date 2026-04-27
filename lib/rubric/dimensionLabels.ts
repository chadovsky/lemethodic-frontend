// F-084 — display labels for the F-083 per-Tâche rubric dimensions.
//
// The backend emits dimension keys as snake_case (`premiere_impression`,
// `formation_questions`, etc.) without per-language label fields. F-088
// established the precedent that TCF-pedagogical concept labels (Étendue
// / Cohérence / Correction / Aisance) stay French in both UI languages
// rather than getting translated; F-084 follows that precedent.
//
// If the backend ever ships dimension display labels alongside the keys
// (per-key label_fr / label_en), retire this file and read from the
// response directly.

export const DIMENSION_LABELS_FR: Record<string, string> = {
  // T1 — Entretien dirigé sans préparation
  premiere_impression: 'Première impression',
  presentation_de_soi: 'Présentation de soi',
  lexique_identite: "Lexique de l'identité",
  aisance_hesitations: 'Aisance',
  prononciation: 'Prononciation',
  // T2 — Exercice en interaction avec préparation
  formation_questions: 'Formation des questions',
  registre_approprie: 'Registre approprié',
  actes_de_parole: 'Actes de parole',
  reactivite: 'Réactivité',
  structuration_interactionnelle: 'Structuration',
  // T3 — Expression d'un point de vue
  position_claire: 'Position claire',
  argumentation_structuree: 'Argumentation structurée',
  connecteurs_logiques: 'Connecteurs logiques',
  developpement_thematique: 'Développement thématique',
  defense_calme: 'Défense face aux questions',
  aisance_sous_pression: 'Aisance sous pression',
}

// Defensive lookup. Falls back to the snake_case key prettified
// (underscores → spaces, first letter capitalized) when an unknown
// dimension surfaces — keeps the UI rendering instead of crashing on
// a stray dimension shape from a future backend change.
export function dimensionLabel(key: string): string {
  const mapped = DIMENSION_LABELS_FR[key]
  if (mapped) return mapped
  if (!key) return ''
  return key
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
}

// Sidebar labels: identical pattern. Stays French per the Étendue/
// Cohérence/Correction/Aisance precedent.
export const SIDEBAR_LABELS_FR: Record<string, string> = {
  conjugation: 'Conjugaison',
  grammar_structure: 'Structure grammaticale',
  sentence_construction: 'Construction des phrases',
}

export function sidebarLabel(key: string): string {
  return SIDEBAR_LABELS_FR[key] ?? key
}
