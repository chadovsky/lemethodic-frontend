import { describe, expect, it } from 'vitest'
import { buildChunkParams } from '@/lib/vocab/params'
import { DEFAULT_FILTER_STATE } from '@/lib/vocab/filter'

describe('buildChunkParams', () => {
  it('returns all 5 levels for the default filter state', () => {
    const params = buildChunkParams(DEFAULT_FILTER_STATE)
    expect(params).not.toBeNull()
    expect(params!.cefrLevels).toEqual(['A1', 'A2', 'B1', 'B2', 'C1'])
  })

  it('returns null when cefrLevels is empty', () => {
    expect(buildChunkParams({ ...DEFAULT_FILTER_STATE, cefrLevels: [] })).toBeNull()
  })

  it('returns only the selected levels', () => {
    const params = buildChunkParams({ ...DEFAULT_FILTER_STATE, cefrLevels: ['B1', 'B2'] })
    expect(params).not.toBeNull()
    expect(params!.cefrLevels).toEqual(['B1', 'B2'])
  })

  it('source and search fields do not affect the returned params shape', () => {
    const params = buildChunkParams({
      cefrLevels: ['A1'],
      source: 'Média' as const,
      search: 'tomber',
    })
    expect(params).not.toBeNull()
    expect(params!.cefrLevels).toEqual(['A1'])
  })
})
