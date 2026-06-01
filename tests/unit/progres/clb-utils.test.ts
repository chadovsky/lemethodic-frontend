import { describe, expect, it } from 'vitest'
import {
  clbToCrs,
  derivePageState,
  deriveSkills,
  parseClb,
} from '@/app/progres/clb/utils'

describe('clbToCrs (IRCC table, single skill, principal applicant)', () => {
  it('returns 0 for CLB 1', () => expect(clbToCrs(1)).toBe(0))
  it('returns 0 for CLB 4', () => expect(clbToCrs(4)).toBe(0))
  it('returns 1 for CLB 5', () => expect(clbToCrs(5)).toBe(1))
  it('returns 1 for CLB 6', () => expect(clbToCrs(6)).toBe(1))
  it('returns 5 for CLB 7', () => expect(clbToCrs(7)).toBe(5))
  it('returns 5 for CLB 8', () => expect(clbToCrs(8)).toBe(5))
  it('returns 6 for CLB 9', () => expect(clbToCrs(9)).toBe(6))
  it('returns 6 for CLB 10', () => expect(clbToCrs(10)).toBe(6))
  it('returns 6 for CLB 12', () => expect(clbToCrs(12)).toBe(6))
})

describe('parseClb', () => {
  it('returns null for null', () => expect(parseClb(null)).toBeNull())
  it('returns null for undefined', () => expect(parseClb(undefined)).toBeNull())
  it('returns null for empty string', () => expect(parseClb('')).toBeNull())
  it('returns null for "0"', () => expect(parseClb('0')).toBeNull())
  it('parses "7" as 7', () => expect(parseClb('7')).toBe(7))
  it('parses "10" as 10', () => expect(parseClb('10')).toBe(10))
  it('parses "CLB 8" as 8', () => expect(parseClb('CLB 8')).toBe(8))
  it('parses "CLB9" as 9', () => expect(parseClb('CLB9')).toBe(9))
})

describe('deriveSkills', () => {
  it('sets speaking CLB and CRS when raw is present', () => {
    const skills = deriveSkills('7')
    const speaking = skills.find((s) => s.key === 'speaking')!
    expect(speaking.clb).toBe(7)
    expect(speaking.crs).toBe(5)
  })

  it('listening/reading/writing are always null', () => {
    const skills = deriveSkills('7')
    const others = skills.filter((s) => s.key !== 'speaking')
    for (const s of others) {
      expect(s.clb).toBeNull()
      expect(s.crs).toBeNull()
    }
  })

  it('sets speaking CLB null when raw is null', () => {
    const skills = deriveSkills(null)
    expect(skills.find((s) => s.key === 'speaking')!.clb).toBeNull()
  })

  it('produces exactly 4 rows in canonical order', () => {
    const skills = deriveSkills('8')
    expect(skills.map((s) => s.key)).toEqual(['speaking', 'listening', 'reading', 'writing'])
  })
})

describe('derivePageState', () => {
  it('returns empty when hasRecordings is false', () => {
    const skills = deriveSkills(null)
    expect(derivePageState(skills, false)).toBe('empty')
  })

  it('returns empty when recordings exist but CLB is null', () => {
    const skills = deriveSkills(null)
    expect(derivePageState(skills, true)).toBe('empty')
  })

  it('returns partial when speaking is assessed but others are not', () => {
    const skills = deriveSkills('7')
    expect(derivePageState(skills, true)).toBe('partial')
  })

  it('returns full when all 4 skills are assessed', () => {
    const allAssessed = [
      { key: 'speaking' as const,  clb: 7, crs: 5 },
      { key: 'listening' as const, clb: 8, crs: 5 },
      { key: 'reading' as const,   clb: 9, crs: 6 },
      { key: 'writing' as const,   clb: 6, crs: 1 },
    ]
    expect(derivePageState(allAssessed, true)).toBe('full')
  })
})
