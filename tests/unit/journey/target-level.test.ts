import { describe, expect, it } from 'vitest'
import {
  levelFromTargetProfile,
  levelFromThreshold,
  isLevel,
} from '@/lib/journey/target-level'

const profile = (threshold: unknown) => JSON.stringify({ exam: 'TCF', threshold })

describe('levelFromTargetProfile', () => {
  it('defaults to B1 when no profile is stored', () => {
    expect(levelFromTargetProfile(null)).toBe('B1')
    expect(levelFromTargetProfile('')).toBe('B1')
  })

  it('extracts the leading CEFR token from a TCF threshold', () => {
    expect(levelFromTargetProfile(profile('B1 (CLB 4-6)'))).toBe('B1')
    expect(levelFromTargetProfile(profile('B2 (CLB 7-8)'))).toBe('B2')
    expect(levelFromTargetProfile(profile('C1 (CLB 9-10)'))).toBe('C1')
  })

  it('handles a bare CEFR threshold (DELF/TEF style)', () => {
    expect(levelFromTargetProfile(profile('A2'))).toBe('A2')
    expect(levelFromTargetProfile(profile('A1'))).toBe('A1')
  })

  it('is case-insensitive on the token', () => {
    expect(levelFromTargetProfile(profile('b2 (clb 7-8)'))).toBe('B2')
  })

  it('falls back to B1 for the GENERAL track (no CEFR token)', () => {
    expect(levelFromTargetProfile(profile("Pas d'examen, je veux progresser"))).toBe('B1')
  })

  it('falls back to B1 for malformed JSON or a missing threshold', () => {
    expect(levelFromTargetProfile('not json at all')).toBe('B1')
    expect(levelFromTargetProfile(JSON.stringify({ exam: 'TCF' }))).toBe('B1')
    expect(levelFromTargetProfile(JSON.stringify({ threshold: 42 }))).toBe('B1')
  })

  // F-459: the diagnostic writes an explicit `level`; it wins over `threshold`.
  it('prefers an explicit level field over the threshold token', () => {
    expect(
      levelFromTargetProfile(JSON.stringify({ threshold: 'B2 (CLB 7-8)', level: 'A2' })),
    ).toBe('A2')
    expect(
      levelFromTargetProfile(JSON.stringify({ threshold: 'C1 (CLB 9-10)', level: 'B1' })),
    ).toBe('B1')
  })

  it('uses the explicit level even when no threshold is present', () => {
    expect(levelFromTargetProfile(JSON.stringify({ level: 'C1' }))).toBe('C1')
  })

  it('ignores an invalid level and falls back to the threshold token', () => {
    expect(
      levelFromTargetProfile(JSON.stringify({ threshold: 'B2 (CLB 7-8)', level: 'Z9' })),
    ).toBe('B2')
    expect(levelFromTargetProfile(JSON.stringify({ threshold: 'A2', level: 42 }))).toBe('A2')
  })
})

describe('levelFromThreshold', () => {
  it('extracts the leading CEFR token, case-insensitively', () => {
    expect(levelFromThreshold('B2 (CLB 7-8)')).toBe('B2')
    expect(levelFromThreshold('a1')).toBe('A1')
  })

  it('defaults to B1 for an absent token', () => {
    expect(levelFromThreshold('')).toBe('B1')
    expect(levelFromThreshold("Pas d'examen, je veux progresser")).toBe('B1')
  })
})

describe('isLevel', () => {
  it('accepts the five CEFR bands and rejects anything else', () => {
    for (const lvl of ['A1', 'A2', 'B1', 'B2', 'C1']) {
      expect(isLevel(lvl)).toBe(true)
    }
    expect(isLevel('C2')).toBe(false)
    expect(isLevel('b1')).toBe(false)
    expect(isLevel(42)).toBe(false)
    expect(isLevel(null)).toBe(false)
  })
})
