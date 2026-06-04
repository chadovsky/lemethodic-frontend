import type { Metadata, ReactNode } from 'react'
import AppShell from '@/components/layout/AppShell'

export const metadata: Metadata = {
  robots: { index: true, follow: true },
}

export default function ShellLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}
