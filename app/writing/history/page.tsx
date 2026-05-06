import BottomNav from '@/components/home/BottomNav'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import WritingHistoryClient from '@/components/writing/WritingHistoryClient'

export default function WritingHistoryPage() {
  return (
    <ProtectedRoute>
      <WritingHistoryClient />
      <BottomNav />
    </ProtectedRoute>
  )
}
