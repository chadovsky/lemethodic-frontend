'use client'

import Link from 'next/link'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'
import SidebarLink from './SidebarLink'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/ecole', label: "L'École" },
  { href: '/vocabulaire', label: 'Le Vocabulaire' },
  { href: '/diagnostic', label: 'Le Diagnostic' },
  { href: '/account', label: 'Compte' },
] as const

interface SidebarProps {
  drawerOpen: boolean
  onLinkClick?: () => void
  initials?: string
}

export default function Sidebar({ drawerOpen, onLinkClick, initials = 'CH' }: SidebarProps) {
  return (
    <aside
      id="app-shell-sidebar"
      data-testid="app-shell-sidebar"
      data-drawer-open={drawerOpen}
      aria-label="Primary"
      className="app-shell-sidebar"
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
            backgroundColor: 'var(--ed-accent)',
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
          style={{
            fontFamily: SERIF_FONT,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: '1.125rem',
            letterSpacing: '-0.01em',
            color: 'var(--text-primary)',
            textDecoration: 'none',
          }}
        >
          Le Méthodic
        </Link>
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
    </aside>
  )
}
