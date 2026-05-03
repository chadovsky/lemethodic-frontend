'use client'

// P-234 — cluster header. Skeleton in commit 1; commit 2 builds out
// title + grammar/vocab/Tâche/CEFR chips + status + last_detection_result.

import type {
  ClusterDetailResponse,
  UserClusterStateResponse,
} from '@/lib/types'
import type { InterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'

interface ClusterHeaderProps {
  detail: ClusterDetailResponse
  state: UserClusterStateResponse | null
  language: InterfaceLanguage
}

export default function ClusterHeader({ detail, state, language }: ClusterHeaderProps) {
  void detail
  void state
  void language
  return null
}
