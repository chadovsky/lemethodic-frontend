// F-457 — target-level resolver for the carte.
//
// The carte renders the journey at the learner's target level. Until the
// diagnostic ticket owns real level assignment, the carte reads the level from
// the F-365 target-profile stub in localStorage ('lm.targetProfile.v1'). That
// profile has no explicit level field; its `threshold` string leads with a
// CEFR token ('B2 (CLB 7-8)', 'A2', "Pas d'examen..."). We pull that token and
// fall back to B1 for anything unparseable (GENERAL track, missing profile,
// malformed JSON). This is the read-only seam the diagnostic replaces later.

import type { Level } from './journey'

export const TARGET_PROFILE_KEY = 'lm.targetProfile.v1'

const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1']
const DEFAULT_LEVEL: Level = 'B1'

// Pure resolver: parse a raw localStorage value into a Level. Exported so the
// mapping is unit-testable without a DOM.
export function levelFromTargetProfile(raw: string | null): Level {
  if (!raw) return DEFAULT_LEVEL
  try {
    const parsed = JSON.parse(raw) as { threshold?: unknown }
    const threshold = typeof parsed.threshold === 'string' ? parsed.threshold : ''
    const token = threshold.trim().slice(0, 2).toUpperCase()
    return LEVELS.find((level) => level === token) ?? DEFAULT_LEVEL
  } catch {
    return DEFAULT_LEVEL
  }
}

// Browser reader: SSR-safe (returns the default when window is absent).
export function readTargetLevel(): Level {
  if (typeof window === 'undefined') return DEFAULT_LEVEL
  return levelFromTargetProfile(window.localStorage.getItem(TARGET_PROFILE_KEY))
}
