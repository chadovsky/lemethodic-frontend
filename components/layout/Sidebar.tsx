'use client'

import Link from 'next/link'
import Image from 'next/image'
import { SANS_FONT } from '@/lib/typography'
import SidebarLink from './SidebarLink'
import CartButton from '@/components/store/CartButton'
import type { SidebarRail } from '@/lib/shell/useSidebarRail'
import { RAIL_WIDTH, EXPANDED_WIDTH } from '@/lib/shell/useSidebarRail'
import {
  Home,
  GraduationCap,
  FileText,
  User,
  PlayCircle,
  ShoppingBag,
  Tag,
  Users,
  Pin,
} from 'lucide-react'

// F-455 — float the frosted panel inside its rail/expanded footprint so the
// canvas shows around it. The panel's right edge stays at the footprint width,
// so the top-bar (left) and main (margin-left) offsets are untouched.
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
  // F-465 — icon-only rail vs full titles. Owned by AppShell so the content
  // offset and the panel stay in lockstep. Defaults to expanded for isolated
  // renders (unit tests render <Sidebar drawerOpen={false} />).
  compact?: boolean
  rail?: SidebarRail
}

export default function Sidebar({
  drawerOpen,
  onLinkClick,
  onClose,
  compact = false,
  rail,
}: SidebarProps) {
  const panelWidth = (compact ? RAIL_WIDTH : EXPANDED_WIDTH) - PANEL_INSET
  // Pin lives in the expanded desktop rail only; the drawer model hides it.
  const showPin = !!rail && rail.railEnabled && rail.expanded

  return (
    <aside
      id="app-shell-sidebar"
      data-testid="app-shell-sidebar"
      data-drawer-open={drawerOpen}
      data-collapsed={compact}
      data-mode={rail?.mode ?? 'icons'}
      data-expanded={rail ? rail.expanded : false}
      aria-label="Primary"
      className="app-shell-sidebar"
      onMouseEnter={rail?.onRailEnter}
      onMouseLeave={rail?.onRailLeave}
      onFocus={rail?.onRailFocus}
      onBlur={rail?.onRailBlur}
      style={{
        position: 'fixed',
        top: PANEL_INSET,
        bottom: PANEL_INSET,
        left: PANEL_INSET,
        zIndex: 50,
        width: panelWidth,
        backgroundColor: 'var(--shell-frost)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        border: '1px solid var(--rule-default)',
        borderRadius: 'var(--shell-radius)',
        boxShadow: 'var(--shell-shadow)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header: brand. F-473 — the CH avatar + boxed typewriter wordmark are
          retired. Expanded shows the full wordmark, collapsed the square mark;
          both link to /tableau-de-bord. */}
      <div
        style={{
          padding: '20px 20px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: compact ? 'center' : 'flex-start',
          gap: 12,
          flexShrink: 0,
        }}
      >
        {compact ? (
          <Link
            href="/tableau-de-bord"
            data-testid="sidebar-mark"
            onClick={onLinkClick}
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <Image
              data-testid="sidebar-mark-img"
              src="/brand/lemethodic-mark.png"
              alt="Le Méthodic"
              width={610}
              height={610}
              priority
              style={{ width: 32, height: 32 }}
            />
          </Link>
        ) : (
          <>
            <Link
              href="/tableau-de-bord"
              data-testid="sidebar-wordmark"
              onClick={onLinkClick}
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', minHeight: 44 }}
            >
              <Image
                data-testid="sidebar-logo-img"
                src="/brand/lemethodic-logo.png"
                alt="Le Méthodic"
                width={2668}
                height={1329}
                priority
                style={{ height: 28, width: 'auto' }}
              />
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
                isCollapsed={compact}
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
          {!compact && (
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
                  isCollapsed={compact}
                  onClick={onLinkClick}
                />
              </li>
            ))}
            {/* F-448 — cart affordance in the logged-in shell. Opens the
                global drawer; badge shows count only when non-empty. */}
            <li>
              <CartButton variant="row" testId="sidebar-cart-button" isCollapsed={compact} />
            </li>
          </ul>
        </div>
      </nav>

      {/* F-453: ThemeToggle relocated to the app shell top bar (AppTopBar). */}
      {/* F-455: sidebar logout row removed — logout now lives solely in the
          user dropdown (AppTopBar → UserMenu). */}

      {/* F-465 — pin control. Visible only in the expanded desktop rail; the
          drawer model (mobile / coarse pointer) hides it. Pinning persists
          "titles" so the rail stays expanded across reloads. No desktop
          hamburger or collapse toggle: the rail expands on hover/focus. */}
      {showPin && rail && (
        <div
          style={{
            padding: '8px 16px',
            display: 'flex',
            justifyContent: 'flex-end',
            borderTop: '1px solid var(--rule-default)',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            data-testid="sidebar-pin"
            aria-pressed={rail.pinned}
            aria-label={rail.pinned ? 'Détacher le menu' : 'Épingler le menu ouvert'}
            onClick={rail.togglePin}
            style={{
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: rail.pinned ? 'var(--shell-pill)' : 'transparent',
              boxShadow: rail.pinned ? 'var(--shell-pill-shadow)' : 'none',
              border: 'none',
              cursor: 'pointer',
              color: rail.pinned ? 'var(--accent)' : 'var(--text-secondary)',
              borderRadius: 10,
              padding: 0,
              flexShrink: 0,
              transition:
                'background-color var(--lm-duration-hover) var(--lm-ease), color var(--lm-duration-hover) ease, box-shadow var(--lm-duration-hover) ease',
            }}
          >
            <Pin
              size={18}
              strokeWidth={1.5}
              style={{
                transform: rail.pinned ? 'rotate(45deg)' : 'none',
                fill: rail.pinned ? 'currentColor' : 'none',
              }}
            />
          </button>
        </div>
      )}
    </aside>
  )
}
