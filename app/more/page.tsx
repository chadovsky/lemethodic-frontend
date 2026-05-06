import BottomNav from '@/components/home/BottomNav'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import MorePageClient from '@/components/more/MorePageClient'

// V-013b — /more replaces the F-058 placeholder. Profile / Settings /
// Account / About sections per V-013 spec.

export default function MorePage() {
  return (
    <ProtectedRoute>
      <MorePageClient />
      <BottomNav />
    </ProtectedRoute>
  )
}
