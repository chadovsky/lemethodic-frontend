'use client'

import { useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore, signOut } from '@/lib/auth'
import Sidebar from './Sidebar'
import AppTopBar from './AppTopBar'
import EmailVerificationBanner from '@/components/app/EmailVerificationBanner'

interface AppShellProps {
  children: ReactNode
}

function getInitials(fullName?: string | null): string {
  if (!fullName?.trim()) return 'CH'
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function AppShell({ children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeDrawer = () => setDrawerOpen(false)
  const pathname = usePathname()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const initials = getInitials(user?.fullName)

  return (
    <div
      data-testid="app-shell"
      style={{
        minHeight: '100dvh',
        backgroundColor: 'var(--bg-canvas)',
      }}
    >
      {/* F-453 — logged-in app shell top bar (search, notifications, theme,
          user menu). Replaces the prior mobile-only header; carries the
          hamburger on mobile and the content-column controls on desktop. */}
      <AppTopBar
        onHamburgerClick={() => setDrawerOpen(true)}
        drawerOpen={drawerOpen}
        fullName={user?.fullName}
        email={user?.email}
        onSignOut={() => signOut(router)}
      />

      {/* Mobile backdrop — hidden at ≥1024px via .app-shell-backdrop */}
      {drawerOpen && (
        <div
          data-testid="app-shell-backdrop"
          className="app-shell-backdrop"
          onClick={closeDrawer}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(20, 18, 14, 0.45)',
            zIndex: 40,
          }}
        />
      )}

      <Sidebar
        drawerOpen={drawerOpen}
        onLinkClick={closeDrawer}
        onClose={closeDrawer}
        initials={initials}
      />

      <EmailVerificationBanner />

      <main
        key={pathname}
        data-pathname={pathname}
        className="app-shell-main ed-page-enter"
        style={{
          paddingBottom: 64,
          paddingLeft: 'clamp(16px, 3vw, 32px)',
          paddingRight: 'clamp(16px, 3vw, 32px)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
