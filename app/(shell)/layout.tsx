import type { Metadata, ReactNode } from 'react'
import AuthAwareShell from '@/components/layout/AuthAwareShell'

export const metadata: Metadata = {
  robots: { index: true, follow: true },
}

// F-446: AuthAwareShell replaces unconditional AppShell. Renders AppShell
// (sidebar) when authenticated; renders without sidebar when logged out.
export default function ShellLayout({ children }: { children: ReactNode }) {
  return <AuthAwareShell>{children}</AuthAwareShell>
}
