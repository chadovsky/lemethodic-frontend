import { describe, expect, it } from 'vitest'
import { CHUNKS, CEFR_LEVELS, CHUNK_SOURCES } from '@/lib/data/chunks'
import { applyFilters, DEFAULT_FILTER_STATE } from '@/lib/vocab/filter'

describe('applyFilters — fixture sanity', () => {
  it('has 60 chunks', () => {
    expect(CHUNKS).toHaveLength(60)
  })

  it('every CEFR level (A1–C1) is represented at least once', () => {
    for (const level of CEFR_LEVELS) {
      const count = CHUNKS.filter((c) => c.level === level).length
      expect(count).toBeGreaterThan(0)
    }
  })

  it('every source is represented at least once', () => {
    for (const source of CHUNK_SOURCES) {
      const count = CHUNKS.filter((c) => c.source === source).length
      expect(count).toBeGreaterThan(0)
    }
  })
})

describe('applyFilters — defaults', () => {
  it('default state returns all 60 chunks', () => {
    expect(applyFilters(CHUNKS, DEFAULT_FILTER_STATE)).toHaveLength(60)
  })
})

describe('applyFilters — CEFR filtering', () => {
  it('removing A1 from levels excludes A1 rows', () => {
    const result = applyFilters(CHUNKS, {
      ...DEFAULT_FILTER_STATE,
      cefrLevels: ['A2', 'B1', 'B2', 'C1'],
    })
    expect(result.every((c) => c.level !== 'A1')).toBe(true)
    expect(result.length).toBe(CHUNKS.filter((c) => c.level !== 'A1').length)
  })

  it('empty cefrLevels returns no chunks', () => {
    expect(applyFilters(CHUNKS, { ...DEFAULT_FILTER_STATE, cefrLevels: [] })).toHaveLength(0)
  })

  it('only A1 returns just A1 chunks', () => {
    const result = applyFilters(CHUNKS, { ...DEFAULT_FILTER_STATE, cefrLevels: ['A1'] })
    expect(result.every((c) => c.level === 'A1')).toBe(true)
    expect(result.length).toBe(CHUNKS.filter((c) => c.level === 'A1').length)
  })
})

describe('applyFilters — source filtering', () => {
  it('source = "all" returns all chunks', () => {
    expect(applyFilters(CHUNKS, { ...DEFAULT_FILTER_STATE, source: 'all' })).toHaveLength(60)
  })

  it('source = "Média" returns only Média chunks', () => {
    const result = applyFilters(CHUNKS, { ...DEFAULT_FILTER_STATE, source: 'Média' })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((c) => c.source === 'Média')).toBe(true)
  })

  it('source = "Voyage" returns only Voyage chunks', () => {
    const result = applyFilters(CHUNKS, { ...DEFAULT_FILTER_STATE, source: 'Voyage' })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((c) => c.source === 'Voyage')).toBe(true)
  })
})

describe('applyFilters — search filtering', () => {
  it('search "tomber" matches "Tomber sur" (case-insensitive)', () => {
    const result = applyFilters(CHUNKS, { ...DEFAULT_FILTER_STATE, search: 'tomber' })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((c) => c.fr.toLowerCase().includes('tomber'))).toBe(true)
  })

  it('search "TOMBER" matches the same rows (case-insensitive)', () => {
    const lower = applyFilters(CHUNKS, { ...DEFAULT_FILTER_STATE, search: 'tomber' })
    const upper = applyFilters(CHUNKS, { ...DEFAULT_FILTER_STATE, search: 'TOMBER' })
    expect(upper.map((c) => c.id)).toEqual(lower.map((c) => c.id))
  })

  it('search "xyzzy-no-match" returns empty', () => {
    expect(
      applyFilters(CHUNKS, { ...DEFAULT_FILTER_STATE, search: 'xyzzy-no-match' }),
    ).toHaveLength(0)
  })

  it('search with leading/trailing whitespace is trimmed', () => {
    const a = applyFilters(CHUNKS, { ...DEFAULT_FILTER_STATE, search: 'tomber' })
    const b = applyFilters(CHUNKS, { ...DEFAULT_FILTER_STATE, search: '  tomber  ' })
    expect(b.map((c) => c.id)).toEqual(a.map((c) => c.id))
  })

  it('empty search treats every chunk as matching', () => {
    expect(applyFilters(CHUNKS, { ...DEFAULT_FILTER_STATE, search: '' })).toHaveLength(60)
  })
})

describe('applyFilters — combined filters', () => {
  it('combining mismatched filters returns empty', () => {
    const result = applyFilters(CHUNKS, {
      cefrLevels: ['A1'],
      source: 'Média',
      search: '',
    })
    expect(result).toHaveLength(0)
  })

  it('combining CEFR + source + search narrows correctly', () => {
    const result = applyFilters(CHUNKS, {
      cefrLevels: ['B2'],
      source: 'Conversation',
      search: 'tomber',
    })
    expect(result.length).toBe(1)
    expect(result[0].fr.toLowerCase()).toContain('tomber')
    expect(result[0].level).toBe('B2')
    expect(result[0].source).toBe('Conversation')
  })
})
