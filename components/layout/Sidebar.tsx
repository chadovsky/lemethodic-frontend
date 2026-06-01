'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { SANS_FONT } from '@/lib/typography'
import SidebarLink from './SidebarLink'
import Wordmark from '@/components/Wordmark'
import {
  Home,
  GraduationCap,
  BookOpen,
  FileText,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react'

// Same cookie name as S2 (components/ui/sidebar.tsx) for future S2 deprecation parity.
// S2 stores open state: cookie value "true" = expanded, "false" = collapsed.
const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'
const EXPANDED_WIDTH = 240
const COLLAPSED_WIDTH = 64

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Tableau de bord', icon: <Home size={20} strokeWidth={1.5} /> },
  { href: '/cours/methode-tcf-canada', label: 'La Méthode', icon: <GraduationCap size={20} strokeWidth={1.5} /> },
  { href: '/la-bibliotheque', label: 'La Bibliothèque', icon: <BookOpen size={20} strokeWidth={1.5} /> },
  { href: '/l-examen', label: "L'Examen", icon: <FileText size={20} strokeWidth={1.5} /> },
  { href: '/account', label: 'Compte', icon: <User size={20} strokeWidth={1.5} /> },
]

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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  // Restore collapse state from cookie on mount
  useEffect(() => {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
    if (match) {
      const value = match.split('=')[1]
      setIsCollapsed(value === 'false')
    }
  }, [])

  // Detect desktop viewport (≥1024px). Guarded for jsdom (no matchMedia).
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const handleToggle = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${!next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
      return next
    })
  }, [])

  // Cmd+B (Mac) / Ctrl+B (Windows/Linux)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleToggle()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleToggle])

  // Collapse is desktop-only; mobile drawer behavior is unchanged
  const collapsed = isDesktop && isCollapsed
  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH

  return (
    <aside
      id="app-shell-sidebar"
      data-testid="app-shell-sidebar"
      data-drawer-open={drawerOpen}
      data-collapsed={collapsed}
      aria-label="Primary"
      className="app-shell-sidebar lg:!top-16"
      style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 50,
        width: sidebarWidth,
        backgroundColor: 'var(--bg-elevated)',
        borderRight: '1px solid var(--rule-default)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 200ms ease',
        overflow: 'hidden',
      }}
    >
      {/* Header: avatar + wordmark */}
      <div
        style={{
          padding: '20px 20px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 12,
          flexShrink: 0,
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
        {!collapsed && (
          <>
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
          </>
        )}
      </div>

      <nav aria-label="App sections" style={{ flex: 1 }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0' }}>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <SidebarLink
                href={item.href}
                label={item.label}
                icon={item.icon}
                isCollapsed={collapsed}
                onClick={onLinkClick}
              />
            </li>
          ))}
        </ul>
      </nav>

      {onSignOut && (
        <div
          style={{
            padding: collapsed ? '12px 0' : '12px 16px',
            borderTop: '1px solid var(--rule-default)',
            display: 'flex',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          {collapsed ? (
            <button
              type="button"
              data-testid="sidebar-signout"
              onClick={onSignOut}
              aria-label="Se déconnecter"
              style={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                borderRadius: 4,
                padding: 0,
              }}
            >
              <LogOut size={18} strokeWidth={1.5} />
            </button>
          ) : (
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
          )}
        </div>
      )}

      {/* Desktop-only collapse toggle */}
      <div
        className="hidden lg:flex"
        style={{
          padding: '8px 16px',
          justifyContent: collapsed ? 'center' : 'flex-end',
          borderTop: '1px solid var(--rule-default)',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          data-testid="sidebar-collapse-toggle"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          onClick={handleToggle}
          style={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--dominant)',
            borderRadius: 4,
            padding: 0,
            flexShrink: 0,
          }}
        >
          {collapsed
            ? <ChevronRight size={16} strokeWidth={1.5} />
            : <ChevronLeft size={16} strokeWidth={1.5} />
          }
        </button>
      </div>
    </aside>
  )
}
