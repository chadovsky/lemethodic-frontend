import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import AppShell from '@/components/layout/AppShell'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  )
}
