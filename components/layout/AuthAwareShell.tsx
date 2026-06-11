'use client'

// F-446: Shell split for the (shell) route group.
// (shell) routes are publicly accessible but show the product shell.
// When authenticated: render AppShell (sidebar + app chrome).
// When unauthenticated (or pre-hydration): render without sidebar — TopNav
// provides the logged-out chrome. This eliminates the logged-out double-chrome
// that existed when (shell)/layout.tsx unconditionally rendered AppShell.

import { useEffect, type ReactNode } from 'react'
import { useAuthStore } from '@/lib/auth'
import AppShell from './AppShell'

export default function AuthAwareShell({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const hydrated = useAuthStore((s) => s.hydrated)

  useEffect(() => {
    useAuthStore.getState().hydrate()
  }, [])

  // Authenticated: hand off to AppShell (sidebar + mobile topbar + chrome).
  if (hydrated && token) return <AppShell>{children}</AppShell>

  // Unauthenticated or pre-hydration: render without sidebar.
  // Mirrors app-shell-main padding so content layout is consistent.
  return (
    <main
      className="ed-page-enter"
      style={{
        paddingTop: 24,
        paddingBottom: 64,
        paddingLeft: 'clamp(16px, 3vw, 32px)',
        paddingRight: 'clamp(16px, 3vw, 32px)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {children}
      </div>
    </main>
  )
}
