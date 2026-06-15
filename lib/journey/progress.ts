// F-460 - La Seance progress seam (localStorage only, no BE).
//
// The linear Practice walk (La Seance) marks an ile completed when the learner
// finishes its 5 activities. That signal lives in localStorage so the loop
// visibly closes on the carte (the next ile becomes 'current') without any BE.
// Phase 3 will move this to the target_profiles / island_activities tables; the
// shape here (completed theme ids, per level) maps cleanly onto that later.
//
// SSR-safe: every browser reader guards `window`. The pure parser is exported
// so the mapping is unit-testable without a DOM.

import { THEMES, type Level, type ThemeId } from './journey'

export const JOURNEY_PROGRESS_KEY = 'lm.journeyProgress.v1'

const THEME_IDS = new Set<string>(THEMES.map((theme) => theme.id))

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && THEME_IDS.has(value)
}

// Stored shape: { [level]: ThemeId[] }. Pure parser: returns the completed
// theme ids for a level, filtered to valid ids, deduped, never throwing.
export function completedFromRaw(raw: string | null, level: Level): ThemeId[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const list = parsed?.[level]
    if (!Array.isArray(list)) return []
    const seen = new Set<ThemeId>()
    for (const entry of list) {
      if (isThemeId(entry)) seen.add(entry)
    }
    return [...seen]
  } catch {
    return []
  }
}

// Browser reader: the completed theme ids for a level (empty when SSR / unset).
export function readCompletedIles(level: Level): ThemeId[] {
  if (typeof window === 'undefined') return []
  return completedFromRaw(window.localStorage.getItem(JOURNEY_PROGRESS_KEY), level)
}

// Pure writer: fold a newly-completed theme into a raw store value, returning
// the next raw value. Idempotent; preserves other levels untouched.
export function withIleCompleted(raw: string | null, level: Level, theme: ThemeId): string {
  let store: Record<string, ThemeId[]> = {}
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>
      if (parsed && typeof parsed === 'object') {
        for (const [key, value] of Object.entries(parsed)) {
          if (Array.isArray(value)) {
            store[key] = value.filter(isThemeId)
          }
        }
      }
    } catch {
      store = {}
    }
  }
  const current = new Set(store[level] ?? [])
  current.add(theme)
  store[level] = [...current]
  return JSON.stringify(store)
}

// Browser writer: mark an ile completed for a level (no-op when SSR).
export function markIleCompleted(level: Level, theme: ThemeId): void {
  if (typeof window === 'undefined') return
  const next = withIleCompleted(
    window.localStorage.getItem(JOURNEY_PROGRESS_KEY),
    level,
    theme,
  )
  window.localStorage.setItem(JOURNEY_PROGRESS_KEY, next)
}
