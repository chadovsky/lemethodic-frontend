'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
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
  // F-455 — unread-notifications capability. Wiring is deferred (no
  // notifications backend yet); the coral dot renders when this is true.
  hasUnread?: boolean
}

// F-455 — page title resolved from the route. Uses the locked French labels
// (same as the sidebar IA); i18n migration is F-357. Longest-prefix match so
// nested routes (e.g. /la-methode/lesson/3) still resolve to their section.
const TITLES: Array<[string, string]> = [
  ['/tableau-de-bord', 'Tableau de bord'],
  ['/seance', 'La Séance'],
  ['/la-methode', 'La Méthode'],
  ['/l-examen', "L'Examen"],
  ['/profil', 'Compte'],
  ['/parametres', 'Paramètres'],
  ['/abonnement', 'Abonnement'],
  ['/librairie', 'Store'],
  ['/tarifs', 'Pricing'],
  ['/coaching', 'Coaching'],
]

function titleFor(pathname: string): string {
  let best = ''
  let label = 'Le Méthodic'
  for (const [href, text] of TITLES) {
    if ((pathname === href || pathname.startsWith(href + '/')) && href.length > best.length) {
      best = href
      label = text
    }
  }
  return label
}

// F-455 — logged-in app shell top bar, painted to the v3 frosted look.
// Frosted/blur + scroll shadow live in .app-topbar (globals.css); the page
// title, EN/FR placeholder, notifications bell, theme toggle and user menu
// are assembled here. The EN/FR toggle and bell are placed-but-inert per the
// bientôt pattern (functional language switching ships with F-357).
export default function AppTopBar({
  onHamburgerClick,
  drawerOpen,
  fullName,
  email,
  onSignOut,
  hasUnread = false,
}: AppTopBarProps) {
  const pathname = usePathname() ?? '/'
  const title = titleFor(pathname)

  // Soft shadow that fades in once the content column scrolls.
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="app-topbar" data-testid="app-topbar" data-scrolled={scrolled}>
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

      {/* Desktop-only: page title, left, ink. */}
      <h1
        className="hidden lg:block"
        data-testid="app-topbar-title"
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 600,
          fontSize: '1.0625rem',
          letterSpacing: '-0.01em',
          color: 'var(--text-primary)',
          margin: 0,
          flexShrink: 0,
        }}
      >
        {title}
      </h1>

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
        {/* EN/FR language toggle — placed/visual only; functional switching
            ships with F-357. Inert per the bientôt pattern. */}
        <div
          data-testid="app-topbar-lang"
          role="group"
          aria-label="Langue de l'interface (bientôt)"
          aria-disabled="true"
          title="Bientôt — F-357"
          className="hidden lg:inline-flex"
          style={{
            alignItems: 'center',
            gap: 2,
            padding: 3,
            borderRadius: 999,
            border: '1px solid var(--rule-default)',
            background: 'color-mix(in srgb, var(--bg-canvas) 70%, transparent)',
            cursor: 'default',
            userSelect: 'none',
          }}
        >
          {(['EN', 'FR'] as const).map((code) => {
            const active = code === 'FR'
            return (
              <span
                key={code}
                data-testid={`app-topbar-lang-${code.toLowerCase()}`}
                data-active={active}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 30,
                  height: 26,
                  padding: '0 8px',
                  borderRadius: 999,
                  fontFamily: SANS_FONT,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  letterSpacing: '0.03em',
                  backgroundColor: active ? 'var(--shell-pill)' : 'transparent',
                  boxShadow: active ? 'var(--shell-pill-shadow)' : 'none',
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {code}
              </span>
            )
          })}
        </div>

        {/* Notifications — placed but inert (no dropdown). Coral unread dot
            renders via the hasUnread capability. */}
        <button
          type="button"
          data-testid="app-topbar-bell"
          className="hidden lg:inline-flex"
          aria-label={hasUnread ? 'Notifications (non lues)' : 'Notifications'}
          aria-disabled="true"
          tabIndex={-1}
          style={{
            position: 'relative',
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
          {hasUnread && (
            <span
              data-testid="app-topbar-bell-dot"
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 9,
                right: 10,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'var(--accent)',
                border: '1.5px solid var(--shell-frost)',
              }}
            />
          )}
        </button>

        <ThemeToggle />

        <UserMenu fullName={fullName} email={email} onSignOut={onSignOut} />
      </div>
    </header>
  )
}
