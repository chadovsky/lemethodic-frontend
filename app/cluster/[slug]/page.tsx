// P-234 — auth-protected cluster detail. Reachable from /progress
// GouletStack / TodayFocus, /ecole, and direct URL. Renders the BE
// ClusterDetailResponse + UserClusterStateResponse via ClusterDetailPage.
//
// Server Component + await params (Next 16 async params shape) — matches
// the pattern in /learn/[module_id]/page.tsx and /ecole/lesson/[id]/page.tsx.

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import ClusterDetailPage from '@/components/cluster/ClusterDetailPage'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ClusterRoute({ params }: Props) {
  const { slug } = await params
  return (
    <ProtectedRoute>
      <ClusterDetailPage slug={slug} />
    </ProtectedRoute>
  )
}
