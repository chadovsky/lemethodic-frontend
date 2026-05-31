'use client'

import Link from 'next/link'
import { SANS_FONT } from '@/lib/typography'
import SidebarLink from './SidebarLink'
import Wordmark from '@/components/Wordmark'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/cours/methode-tcf-canada', label: 'La Méthode' },
  { href: '/la-bibliotheque', label: 'La Bibliothèque' },
  { href: '/l-examen', label: "L'Examen" },
  { href: '/account', label: 'Compte' },
] as const

interface SidebarProps {
  drawerOpen: boolean
  onLinkClick?: () => void
  onClose?: () => void
  onSignOut?: () => void
  initials?: string
}

export default function Sidebar({
  drawerOpen,
  onLinkClick,
  onClose,
  onSignOut,
  initials = 'CH',
}: SidebarProps) {
  return (
    <aside
      id="app-shell-sidebar"
      data-testid="app-shell-sidebar"
      data-drawer-open={drawerOpen}
      aria-label="Primary"
      // lg:!top-16 offsets below the 64px TopNav on desktop so both nav
      // systems coexist without overlapping. Mobile keeps top:0 (full-height
      // drawer). !important needed to override the inline top:0.
      className="app-shell-sidebar lg:!top-16"
      style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 50,
        width: 240,
        backgroundColor: 'var(--bg-elevated)',
        borderRight: '1px solid var(--rule-default)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '20px 20px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          data-testid="sidebar-avatar"
          aria-label={`User initials: ${initials}`}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: 'var(--cta-utility)',
            color: '#fff',
            fontFamily: SANS_FONT,
            fontWeight: 600,
            fontSize: '0.8125rem',
            letterSpacing: '0.03em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <Link
          href="/dashboard"
          data-testid="sidebar-wordmark"
          onClick={onLinkClick}
          style={{ textDecoration: 'none', display: 'inline-block' }}
        >
          <Wordmark size="nav" />
        </Link>
        {onClose && (
          <button
            type="button"
            aria-label="Close navigation"
            // Visible on mobile only — desktop sidebar is always-open column.
            className="lg:hidden inline-flex items-center justify-center"
            onClick={onClose}
            style={{
              marginLeft: 'auto',
              width: 32,
              height: 32,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              borderRadius: 4,
              padding: 0,
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                d="M2 2l12 12M14 2L2 14"
                fill="none"
              />
            </svg>
          </button>
        )}
      </div>

      <nav aria-label="App sections" style={{ flex: 1 }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0' }}>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <SidebarLink
                href={item.href}
                label={item.label}
                onClick={onLinkClick}
              />
            </li>
          ))}
        </ul>
      </nav>

      {onSignOut && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--rule-default)' }}>
          <button
            type="button"
            data-testid="sidebar-signout"
            onClick={onSignOut}
            style={{
              width: '100%',
              height: 40,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: SANS_FONT,
              fontWeight: 500,
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              textAlign: 'left',
              padding: '0 8px',
              borderRadius: 4,
            }}
          >
            Se déconnecter
          </button>
        </div>
      )}
    </aside>
  )
}
