'use client'

import { useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { SERIF_FONT } from '@/lib/typography'
import { useAuthStore, signOut } from '@/lib/auth'
import Sidebar from './Sidebar'
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
      {/* Mobile top bar — hidden at ≥1024px via .app-shell-topbar */}
      <header
        className="app-shell-topbar"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          height: 56,
          backgroundColor: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--rule-default)',
          alignItems: 'center',
          padding: '0 16px',
        }}
      >
        <button
          type="button"
          data-testid="app-shell-hamburger"
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
          aria-controls="app-shell-sidebar"
          onClick={() => setDrawerOpen(true)}
          style={{
            width: 40,
            height: 40,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            borderRadius: 4,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              d="M3 6h14M3 10h14M3 14h14"
              fill="none"
            />
          </svg>
        </button>
        <span
          style={{
            marginLeft: 8,
            fontFamily: SERIF_FONT,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: '1.125rem',
            letterSpacing: '-0.01em',
            color: 'var(--text-primary)',
          }}
        >
          Le Méthodic
        </span>
      </header>

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
        onSignOut={() => signOut(router)}
        initials={initials}
      />

      <EmailVerificationBanner />

      <main
        key={pathname}
        data-pathname={pathname}
        className="app-shell-main ed-page-enter"
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
    </div>
  )
}
