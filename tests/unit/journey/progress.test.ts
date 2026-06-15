import { describe, expect, it, beforeEach } from 'vitest'
import {
  JOURNEY_PROGRESS_KEY,
  completedFromRaw,
  withIleCompleted,
  readCompletedIles,
  markIleCompleted,
  isThemeId,
} from '@/lib/journey/progress'

describe('isThemeId', () => {
  it('accepts the 7 canonical theme ids and rejects others', () => {
    expect(isThemeId('education')).toBe(true)
    expect(isThemeId('economie')).toBe(true)
    expect(isThemeId('not-a-theme')).toBe(false)
    expect(isThemeId(null)).toBe(false)
    expect(isThemeId(42)).toBe(false)
  })
})

describe('completedFromRaw', () => {
  it('returns [] for null / empty / malformed JSON', () => {
    expect(completedFromRaw(null, 'B1')).toEqual([])
    expect(completedFromRaw('', 'B1')).toEqual([])
    expect(completedFromRaw('{not json', 'B1')).toEqual([])
  })

  it('reads the completed ids for the given level only', () => {
    const raw = JSON.stringify({ B1: ['education', 'famille'], A2: ['culture'] })
    expect(completedFromRaw(raw, 'B1')).toEqual(['education', 'famille'])
    expect(completedFromRaw(raw, 'A2')).toEqual(['culture'])
    expect(completedFromRaw(raw, 'C1')).toEqual([])
  })

  it('filters invalid theme ids and dedupes', () => {
    const raw = JSON.stringify({ B1: ['education', 'bogus', 'education'] })
    expect(completedFromRaw(raw, 'B1')).toEqual(['education'])
  })

  it('returns [] when the level value is not an array', () => {
    expect(completedFromRaw(JSON.stringify({ B1: 'education' }), 'B1')).toEqual([])
  })
})

describe('withIleCompleted', () => {
  it('adds an ile and is idempotent', () => {
    const first = withIleCompleted(null, 'B1', 'education')
    expect(completedFromRaw(first, 'B1')).toEqual(['education'])
    const second = withIleCompleted(first, 'B1', 'education')
    expect(completedFromRaw(second, 'B1')).toEqual(['education'])
  })

  it('preserves other levels untouched', () => {
    const raw = JSON.stringify({ A2: ['culture'] })
    const next = withIleCompleted(raw, 'B1', 'education')
    expect(completedFromRaw(next, 'A2')).toEqual(['culture'])
    expect(completedFromRaw(next, 'B1')).toEqual(['education'])
  })
})

describe('browser readers / writers', () => {
  beforeEach(() => localStorage.clear())

  it('readCompletedIles is empty by default and reflects markIleCompleted', () => {
    expect(readCompletedIles('B1')).toEqual([])
    markIleCompleted('B1', 'education')
    expect(readCompletedIles('B1')).toEqual(['education'])
    markIleCompleted('B1', 'famille')
    expect(readCompletedIles('B1')).toEqual(['education', 'famille'])
  })

  it('persists under the documented key', () => {
    markIleCompleted('B1', 'education')
    expect(localStorage.getItem(JOURNEY_PROGRESS_KEY)).toContain('education')
  })
})
