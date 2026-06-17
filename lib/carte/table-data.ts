// F-472 — La Carte table: per-theme palette + Focus blurbs (editable data map).
//
// Small, swappable maps so copy + colour are easy to retune (could move to an
// i18n dict later). Keyed by IslandKey (grammaire + the 7 themes). NO coral here:
// the carte table is deliberately off the brand --accent so it reads as an
// informative surface, not a CTA-heavy one.

import type { IslandKey } from '@/lib/journey/island-art'

// Per-theme colour. Drives the row tile + the progress-bar fill; the current
// row's Continuer button uses the current theme's colour. Edit freely.
export const THEME_COLOR: Record<IslandKey, string> = {
  grammaire: '#4F46E5', // indigo
  education: '#0EA5E9', // sky
  famille: '#14B8A6', // teal
  culture: '#22C55E', // green
  sante: '#EC4899', // pink
  technologie: '#8B5CF6', // violet
  environnement: '#84CC16', // lime
  economie: '#06B6D4', // cyan
}

// Short "Focus" blurb per row. Placeholder copy (FR, one line each) — swap here.
export const FOCUS_BLURB: Record<IslandKey, string> = {
  grammaire: "Les bases grammaticales pour structurer chaque réponse.",
  education: "Parler d'études, de parcours et d'apprentissage.",
  famille: "Le foyer, les proches et la vie quotidienne.",
  culture: "Patrimoine, francophonie et traditions vivantes.",
  sante: "Bien-être, prévention et système de santé.",
  technologie: "Numérique, réseaux sociaux et vie privée.",
  environnement: "Climat, énergies renouvelables et biodiversité.",
  economie: "Emploi, télétravail et pouvoir d'achat.",
}

// Indigo for the NIVEAU pill (explicitly not coral).
export const LEVEL_PILL_COLOR = '#4F46E5'

// Green for the "Terminé" done pill (not a theme colour, a status colour).
export const DONE_GREEN = '#16A34A'
