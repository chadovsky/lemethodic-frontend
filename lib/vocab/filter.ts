import type { CefrLevel, Chunk, ChunkSource } from '@/lib/data/chunks'
import type { VocabularyChunk } from '@/lib/types'

export type SourceFilter = 'all' | ChunkSource

export interface VocabFilterState {
  cefrLevels: CefrLevel[]
  source: SourceFilter
  search: string
}

export const DEFAULT_FILTER_STATE: VocabFilterState = {
  cefrLevels: ['A1', 'A2', 'B1', 'B2', 'C1'],
  source: 'all',
  search: '',
}

export function applyFilters(
  chunks: readonly Chunk[],
  state: VocabFilterState,
): Chunk[] {
  const search = state.search.trim().toLowerCase()
  return chunks.filter((chunk) => {
    if (!state.cefrLevels.includes(chunk.level)) return false
    if (state.source !== 'all' && chunk.source !== state.source) return false
    if (search.length > 0 && !chunk.fr.toLowerCase().includes(search)) return false
    return true
  })
}

export function applyLocalFilters(
  chunks: readonly VocabularyChunk[],
  state: VocabFilterState,
): VocabularyChunk[] {
  const search = state.search.trim().toLowerCase()
  return chunks.filter((chunk) => {
    if (!(state.cefrLevels as string[]).includes(chunk.cefrLevel)) return false
    if (state.source !== 'all' && chunk.source !== state.source) return false
    if (search.length > 0 && !chunk.chunkFr.toLowerCase().includes(search)) return false
    return true
  })
}
