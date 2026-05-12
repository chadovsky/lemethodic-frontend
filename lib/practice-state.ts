// F-322 — Le Vocabulaire practice state persistence.
//
// V1 = localStorage stash; V2 SRS ticket promotes to user-scoped server
// lists. The shape here is forward-compatible with SRS — the V2 ticket
// reads this same record + layers ease-factor / next-due-at / interval
// columns on top, so a user's V1 history isn't lost on migration.
//
// Storage keys live in lib/storage-keys.ts. All access is try/catch
// wrapped: private-browsing tabs can throw on localStorage.setItem
// (quota / disabled), and we'd rather drop the persistence than crash
// the session. Callers get null on read failures and ignore write
// failures silently.

import {
  VOCAB_PRACTICE_PREF_KEY,
  VOCAB_PRACTICE_STATE_KEY,
} from './storage-keys'

export type PracticeGrade = 'pass' | 'fail'
export type PracticeDirection = 'fr' | 'en'

export interface PracticeGradeRecord {
  lastGrade: PracticeGrade
  lastGradedAt: string  // ISO 8601
  attempts: number
}

export interface PracticeStateMap {
  [chunkId: string]: PracticeGradeRecord
}

export interface PracticePreferences {
  direction: PracticeDirection
}

// ── Grade history ─────────────────────────────────────────────────────────

export function readAllGrades(): PracticeStateMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(VOCAB_PRACTICE_STATE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as PracticeStateMap
  } catch {
    return {}
  }
}

export function getGrade(chunkId: number | string): PracticeGradeRecord | null {
  const map = readAllGrades()
  return map[String(chunkId)] ?? null
}

export function recordGrade(
  chunkId: number | string,
  grade: PracticeGrade,
): void {
  if (typeof window === 'undefined') return
  try {
    const map = readAllGrades()
    const key = String(chunkId)
    const prior = map[key]
    map[key] = {
      lastGrade: grade,
      lastGradedAt: new Date().toISOString(),
      attempts: (prior?.attempts ?? 0) + 1,
    }
    window.localStorage.setItem(VOCAB_PRACTICE_STATE_KEY, JSON.stringify(map))
  } catch {
    // Private-browsing / quota — drop persistence; session state in
    // PracticeClient continues fine off React state.
  }
}

export function clearAllGrades(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(VOCAB_PRACTICE_STATE_KEY)
  } catch {
    // ignore
  }
}

// ── Preferences ───────────────────────────────────────────────────────────

export function readDirectionPref(): PracticeDirection | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(VOCAB_PRACTICE_PREF_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PracticePreferences> | null
    if (parsed?.direction === 'fr' || parsed?.direction === 'en') {
      return parsed.direction
    }
    return null
  } catch {
    return null
  }
}

export function writeDirectionPref(direction: PracticeDirection): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      VOCAB_PRACTICE_PREF_KEY,
      JSON.stringify({ direction }),
    )
  } catch {
    // ignore
  }
}
