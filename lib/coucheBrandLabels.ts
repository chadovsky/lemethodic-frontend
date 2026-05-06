// V-009 — user-facing brand labels for the 5-couche methodology, keyed
// by backend CoucheKey. FE-side override of BE's displayLabel* (which
// today still emit legacy "Content/Structure/Grammar/English Habits"
// labels). V-009.be will align BE to emit brand labels directly; until
// then, FE consumers should import from here and ignore BE's display
// label fields on couche surfaces.
//
// Voice (la_voix) is the new 5th couche locked 2026-05-05. BE doesn't
// score it yet; consumers render it as "Coming soon" placeholder until
// V-009.be ships.

import type { CoucheKey } from '@/lib/types'

export type Lang = 'en' | 'fr'

// Extended CoucheKey set including the FE-only la_voix until BE adds it.
export type ExtendedCoucheKey = CoucheKey | 'la_voix'

export const BRAND_LABEL: Record<ExtendedCoucheKey, Record<Lang, string>> = {
  le_fond:              { en: 'Range',     fr: 'Étendue' },
  les_moules_des_idees: { en: 'Coherence', fr: 'Cohérence' },
  les_moules:           { en: 'Accuracy',  fr: 'Correction' },
  les_reflexes_anglais: { en: 'Fluency',   fr: 'Aisance' },
  la_voix:              { en: 'Voice',     fr: 'Voix' },
}

// Order convention: methodology-canonical (Le Fond first, La Voix last).
// Surfaces that need to render axes in a fixed order (e.g. Paywall radar)
// can import this; surfaces that sort by score (e.g. diagnostic bars) use
// it only for the unscored Voice placeholder appended at the bottom.
export const COUCHE_ORDER: ExtendedCoucheKey[] = [
  'le_fond',
  'les_moules_des_idees',
  'les_moules',
  'les_reflexes_anglais',
  'la_voix',
]
