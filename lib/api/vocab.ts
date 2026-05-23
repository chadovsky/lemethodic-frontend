import { api } from '@/lib/api'
import type { VocabularyChunk } from '@/lib/types'

export async function fetchAllChunks(): Promise<VocabularyChunk[]> {
  const topics = await api.vocab.listTopics()
  const pages = await Promise.all(
    topics.map((t) => api.vocab.listChunks(t.slug, { limit: 500, offset: 0 })),
  )
  return pages.flatMap((p) => p.chunks)
}
