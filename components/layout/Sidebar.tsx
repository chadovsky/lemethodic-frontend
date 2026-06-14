'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { SANS_FONT } from '@/lib/typography'
import SidebarLink from './SidebarLink'
import Wordmark from '@/components/Wordmark'
import CartButton from '@/components/store/CartButton'
import {
  Home,
  GraduationCap,
  FileText,
  User,
  PlayCircle,
  ShoppingBag,
  Tag,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

// Same cookie name as S2 (components/ui/sidebar.tsx) for future S2 deprecation parity.
// S2 stores open state: cookie value "true" = expanded, "false" = collapsed.
const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'
const EXPANDED_WIDTH = 240
const COLLAPSED_WIDTH = 64
// F-455 — float the frosted panel inside its 240/64 footprint so the canvas
// shows around it. The right edge stays at EXPANDED/COLLAPSED width, so the
// top-bar (left: 240) and main (margin-left: 240) offsets are untouched.
const PANEL_INSET = 12

const NAV_ITEMS = [
  { href: '/seance', label: 'La Séance', icon: <PlayCircle size={20} strokeWidth={1.5} /> },
  { href: '/tableau-de-bord', label: 'Tableau de bord', icon: <Home size={20} strokeWidth={1.5} /> },
  { href: '/la-methode', label: 'La Méthode', icon: <GraduationCap size={20} strokeWidth={1.5} /> },
  { href: '/l-examen', label: "L'Examen", icon: <FileText size={20} strokeWidth={1.5} /> },
  { href: '/profil', label: 'Compte', icon: <User size={20} strokeWidth={1.5} /> },
]

const REVENUE_ITEMS = [
  { href: '/librairie', label: 'Store', icon: <ShoppingBag size={20} strokeWidth={1.5} /> },
  { href: '/tarifs', label: 'Pricing', icon: <Tag size={20} strokeWidth={1.5} /> },
  { href: '/coaching', label: 'Coaching', icon: <Users size={20} strokeWidth={1.5} /> },
]

interface SidebarProps {
  drawerOpen: boolean
  onLinkClick?: () => void
  onClose?: () => void
  initials?: string
}

export default function Sidebar({
  drawerOpen,
  onLinkClick,
  onClose,
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
      className="app-shell-sidebar"
      style={{
        position: 'fixed',
        top: PANEL_INSET,
        bottom: PANEL_INSET,
        left: PANEL_INSET,
        zIndex: 50,
        width: sidebarWidth - PANEL_INSET,
        backgroundColor: 'var(--shell-frost)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        border: '1px solid var(--rule-default)',
        borderRadius: 'var(--shell-radius)',
        boxShadow: 'var(--shell-shadow)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 200ms ease, transform 300ms var(--lm-ease)',
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
              href="/tableau-de-bord"
              data-testid="sidebar-wordmark"
              onClick={onLinkClick}
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', minHeight: 44 }}
            >
              <Wordmark size="nav" />
            </Link>
            {onClose && (
              <button
                type="button"
                data-testid="sidebar-close"
                aria-label="Close navigation"
                className="lg:hidden inline-flex items-center justify-center"
                onClick={onClose}
                style={{
                  marginLeft: 'auto',
                  width: 44,
                  height: 44,
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

        {/* Revenue paths: Store / Pricing / Coaching */}
        <div
          data-testid="sidebar-revenue-section"
          style={{
            borderTop: '1px solid var(--rule-default)',
            marginTop: 4,
            paddingTop: 4,
          }}
        >
          {!collapsed && (
            <p
              style={{
                fontFamily: SANS_FONT,
                fontWeight: 600,
                fontSize: '0.6875rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                padding: '8px 20px 4px',
                margin: 0,
              }}
            >
              More
            </p>
          )}
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {REVENUE_ITEMS.map((item) => (
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
            {/* F-448 — cart affordance in the logged-in shell. Opens the
                global drawer; badge shows count only when non-empty. */}
            <li>
              <CartButton variant="row" testId="sidebar-cart-button" isCollapsed={collapsed} />
            </li>
          </ul>
        </div>
      </nav>

      {/* F-453: ThemeToggle relocated to the app shell top bar (AppTopBar). */}
      {/* F-455: sidebar logout row removed — logout now lives solely in the
          user dropdown (AppTopBar → UserMenu), deduping the second affordance
          the F-453 note flagged. */}

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
            width: 44,
            height: 44,
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
