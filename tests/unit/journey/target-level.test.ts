import { describe, expect, it } from 'vitest'
import { levelFromTargetProfile } from '@/lib/journey/target-level'

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
})
