// P-234 — auth-protected cluster detail. Reachable from /progress
// GouletStack / TodayFocus, /ecole, and direct URL. Renders the BE
// ClusterDetailResponse + UserClusterStateResponse via ClusterDetailPage.

'use client'

import { use } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import ClusterDetailPage from '@/components/cluster/ClusterDetailPage'

interface PageParams {
  slug: string
}

export default function ClusterRoute({ params }: { params: Promise<PageParams> }) {
  const { slug } = use(params)
  return (
    <ProtectedRoute>
      <ClusterDetailPage slug={slug} />
    </ProtectedRoute>
  )
}
