// V-009 — user-facing brand labels for the 5-couche methodology, keyed
// by backend CoucheKey. FE-side override of BE's displayLabel* (which
// today still emit legacy "Content/Structure/Grammar/English Habits"
// labels). V-009.be aligned BE to score la_voix; la_voix is now a
// first-class CoucheKey. M-RENAME will update the user-facing names later.

import type { CoucheKey } from '@/lib/types'

export type Lang = 'en' | 'fr'

export const BRAND_LABEL: Record<CoucheKey, Record<Lang, string>> = {
  le_fond:              { en: 'Range',     fr: 'Étendue' },
  les_moules_des_idees: { en: 'Coherence', fr: 'Cohérence' },
  les_moules:           { en: 'Accuracy',  fr: 'Correction' },
  les_reflexes_anglais: { en: 'Fluency',   fr: 'Aisance' },
  la_voix:              { en: 'Voice',     fr: 'Voix' },
}

// Order convention: methodology-canonical (Le Fond first, La Voix last).
// Surfaces that need to render axes in a fixed order (e.g. Paywall radar)
// can import this; surfaces that sort by score use it for render order.
export const COUCHE_ORDER: CoucheKey[] = [
  'le_fond',
  'les_moules_des_idees',
  'les_moules',
  'les_reflexes_anglais',
  'la_voix',
]
