// F-457 - target-level resolver for the carte.
// F-459 - Le Diagnostic now owns real level assignment: /bienvenue writes an
// explicit `level` field (A1..C1) on the target profile. This resolver reads
// that field first; for legacy profiles that predate the diagnostic (no
// `level`), it falls back to the F-365 `threshold` string, whose leading CEFR
// token ('B2 (CLB 7-8)', 'A2', "Pas d'examen...") seeded the carte before. Both
// paths default to B1 for anything unparseable (GENERAL track, missing profile,
// malformed JSON). This closes the read-only seam the F-457 stub left open.

import type { Level } from './journey'

export const TARGET_PROFILE_KEY = 'lm.targetProfile.v1'

const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1']
const DEFAULT_LEVEL: Level = 'B1'

// Type guard for a stored level value (A1..C1). Exported for the diagnostic
// picker + tests.
export function isLevel(value: unknown): value is Level {
  return typeof value === 'string' && (LEVELS as string[]).includes(value)
}

// Legacy seam: derive a Level from a threshold string's leading CEFR token.
// Returns the default when the token is absent (GENERAL track, empty string).
export function levelFromThreshold(threshold: string): Level {
  const token = threshold.trim().slice(0, 2).toUpperCase()
  return LEVELS.find((level) => level === token) ?? DEFAULT_LEVEL
}

// Pure resolver: parse a raw localStorage value into a Level. Exported so the
// mapping is unit-testable without a DOM. Prefers the explicit `level` field
// (F-459 diagnostic) and falls back to the `threshold` token (F-365 legacy).
export function levelFromTargetProfile(raw: string | null): Level {
  if (!raw) return DEFAULT_LEVEL
  try {
    const parsed = JSON.parse(raw) as { level?: unknown; threshold?: unknown }
    if (isLevel(parsed.level)) return parsed.level
    const threshold = typeof parsed.threshold === 'string' ? parsed.threshold : ''
    return levelFromThreshold(threshold)
  } catch {
    return DEFAULT_LEVEL
  }
}

// Browser reader: SSR-safe (returns the default when window is absent).
export function readTargetLevel(): Level {
  if (typeof window === 'undefined') return DEFAULT_LEVEL
  return levelFromTargetProfile(window.localStorage.getItem(TARGET_PROFILE_KEY))
}
