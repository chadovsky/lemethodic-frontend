'use client'

import { Search, Bell } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'
import UserMenu from './UserMenu'

interface AppTopBarProps {
  onHamburgerClick: () => void
  drawerOpen: boolean
  fullName?: string | null
  email?: string | null
  onSignOut?: () => void
}

// F-453 — logged-in app shell top bar. Lives in the content column (right of the
// fixed sidebar on desktop, full-width on mobile). Plumbing baseline only:
// frosted/blur, elevation, and motion polish are deferred to F-454.
export default function AppTopBar({
  onHamburgerClick,
  drawerOpen,
  fullName,
  email,
  onSignOut,
}: AppTopBarProps) {
  return (
    <header className="app-topbar" data-testid="app-topbar">
      {/* Mobile-only: hamburger + wordmark (desktop shows the sidebar instead) */}
      <button
        type="button"
        data-testid="app-shell-hamburger"
        aria-label="Open navigation menu"
        aria-expanded={drawerOpen}
        aria-controls="app-shell-sidebar"
        onClick={onHamburgerClick}
        className="lg:hidden"
        style={{
          width: 44,
          height: 44,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-primary)',
          borderRadius: 8,
          flexShrink: 0,
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
        className="lg:hidden"
        style={{
          fontFamily: SERIF_FONT,
          fontWeight: 400,
          fontSize: '1.125rem',
          letterSpacing: '-0.01em',
          color: 'var(--text-primary)',
        }}
      >
        Le Méthodic
      </span>

      {/* Desktop-only: inert search field. No fake interactivity. */}
      <div className="app-topbar-search hidden lg:flex" data-testid="app-topbar-search">
        <Search size={16} strokeWidth={1.75} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          type="text"
          disabled
          tabIndex={-1}
          aria-hidden="true"
          placeholder="Rechercher…"
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: SANS_FONT,
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            width: '100%',
            cursor: 'default',
          }}
        />
      </div>

      {/* Right cluster */}
      <div
        style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
        }}
      >
        {/* Notifications — placed but inert: no badge, no dropdown. */}
        <button
          type="button"
          data-testid="app-topbar-bell"
          className="hidden lg:inline-flex"
          aria-label="Notifications"
          aria-disabled="true"
          tabIndex={-1}
          style={{
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            borderRadius: 10,
            color: 'var(--text-muted)',
            cursor: 'default',
            padding: 0,
          }}
        >
          <Bell size={18} strokeWidth={1.5} />
        </button>

        <ThemeToggle />

        <UserMenu fullName={fullName} email={email} onSignOut={onSignOut} />
      </div>
    </header>
  )
}
