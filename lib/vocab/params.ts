import type { VocabFilterState } from '@/lib/vocab/filter'

export interface ChunkQueryParams {
  cefrLevels: string[]
}

export function buildChunkParams(state: VocabFilterState): ChunkQueryParams | null {
  if (state.cefrLevels.length === 0) return null
  return { cefrLevels: state.cefrLevels }
}
