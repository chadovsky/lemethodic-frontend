'use client'

import { useState, type CSSProperties, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthStore, signOut } from '@/lib/auth'
import Sidebar from './Sidebar'
import AppTopBar from './AppTopBar'
import EmailVerificationBanner from '@/components/app/EmailVerificationBanner'
import { useSidebarRail } from '@/lib/shell/useSidebarRail'

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeDrawer = () => setDrawerOpen(false)
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)

  // F-465 — icon-rail interaction state. `offset` drives the content-column
  // push via the --lm-shell-offset custom property (consumed by .app-shell-main
  // and .app-topbar inside the desktop rail media query). On the drawer model
  // the property is set but ignored (base layout keeps margin-left:0).
  const rail = useSidebarRail()
  // `compact` = icon-only. Desktop: collapsed unless expanded. Drawer: collapsed
  // unless the drawer is open (an open drawer always shows full titles).
  const compact = rail.railEnabled ? !rail.expanded : !drawerOpen

  // F-466 — the data-dense dashboard gets a wider content column (1536) than the
  // shared 1200 reading width every other authed route keeps. F-469 — /carte
  // joins it so the sea-world composition can fill up to 1536. Per-route override
  // only; no breakout hack, no change to the rest of the app shell.
  const WIDE_ROUTES = new Set(['/tableau-de-bord', '/carte'])
  const contentMaxWidth = WIDE_ROUTES.has(pathname) ? 1536 : 1200

  return (
    <div
      data-testid="app-shell"
      style={
        {
          minHeight: '100dvh',
          backgroundColor: 'var(--bg-canvas)',
          '--lm-shell-offset': `${rail.offset}px`,
        } as CSSProperties
      }
    >
      {/* F-453 — logged-in app shell top bar (search, notifications, theme,
          user menu). Replaces the prior mobile-only header; carries the
          hamburger on mobile and the content-column controls on desktop. */}
      <AppTopBar
        onHamburgerClick={() => setDrawerOpen(true)}
        drawerOpen={drawerOpen}
        fullName={user?.fullName}
        email={user?.email}
        onSignOut={() => signOut()}
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
        compact={compact}
        rail={rail}
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
        <div
          data-testid="app-shell-content"
          style={{ maxWidth: contentMaxWidth, margin: '0 auto', width: '100%' }}
        >
          {children}
        </div>
      </main>
    </div>
  )
}
