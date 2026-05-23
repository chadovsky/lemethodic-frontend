'use client'

import { useEffect, useState } from 'react'
import { fetchAllChunks } from '@/lib/api/vocab'
import type { VocabularyChunk } from '@/lib/types'

export interface UseChunksResult {
  chunks: VocabularyChunk[]
  isLoading: boolean
  error: Error | null
  total: number
}

export function useChunks(): UseChunksResult {
  const [chunks, setChunks] = useState<VocabularyChunk[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchAllChunks()
      .then((data) => {
        if (!cancelled) {
          setChunks(data)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)))
          setIsLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { chunks, isLoading, error, total: chunks.length }
}
