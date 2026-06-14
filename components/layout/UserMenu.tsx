'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Settings, CreditCard, LogOut, ChevronDown } from 'lucide-react'
import { SANS_FONT } from '@/lib/typography'

interface UserMenuProps {
  fullName?: string | null
  email?: string | null
  onSignOut?: () => void
}

function firstNameOf(fullName?: string | null, email?: string | null): string {
  if (fullName?.trim()) return fullName.trim().split(/\s+/)[0]
  if (email?.trim()) return email.split('@')[0]
  return 'Compte'
}

function initialOf(name: string): string {
  return name.slice(0, 1).toUpperCase()
}

export default function UserMenu({ fullName, email, onSignOut }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const firstName = firstNameOf(fullName, email)
  const initial = initialOf(firstName)
  // F-455 — coral initials circle. The v3 one-accent doctrine retires the
  // per-name palette; the avatar always carries the brand coral.
  const color = 'var(--accent)'

  const close = useCallback(() => setOpen(false), [])

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close()
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, close])

  const avatar = (
    <span
      data-testid="user-menu-avatar"
      aria-hidden="true"
      style={{
        width: 30,
        height: 30,
        borderRadius: '50%',
        backgroundColor: color,
        color: '#fff',
        fontFamily: SANS_FONT,
        fontWeight: 600,
        fontSize: '0.8125rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {initial}
    </span>
  )

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        type="button"
        data-testid="user-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu du compte"
        onClick={() => setOpen((v) => !v)}
        className="ed-btn-press"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'transparent',
          border: '1px solid var(--rule-default)',
          borderRadius: 999,
          cursor: 'pointer',
          padding: '4px 8px 4px 4px',
          minHeight: 40,
          color: 'var(--text-primary)',
          fontFamily: SANS_FONT,
        }}
      >
        {avatar}
        <span
          data-testid="user-menu-firstname"
          className="hidden sm:inline"
          style={{ fontWeight: 500, fontSize: '0.875rem' }}
        >
          {firstName}
        </span>
        <ChevronDown size={14} strokeWidth={2} style={{ color: 'var(--text-muted)' }} />
      </button>

      {open && (
        <div
          data-testid="user-menu-dropdown"
          role="menu"
          aria-label="Compte"
          className="shell-menu-pop"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: 240,
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--rule-default)',
            borderRadius: 12,
            padding: 6,
            zIndex: 70,
            fontFamily: SANS_FONT,
            boxShadow: 'var(--shell-shadow)',
          }}
        >
          {/* Header: first name + email */}
          <div style={{ padding: '8px 10px 10px' }}>
            <div
              data-testid="user-menu-header-name"
              style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}
            >
              {firstName}
            </div>
            {email && (
              <div
                data-testid="user-menu-header-email"
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {email}
              </div>
            )}
          </div>

          <div style={{ height: 1, backgroundColor: 'var(--rule-default)', margin: '2px 0 6px' }} />

          <Link
            href="/parametres"
            role="menuitem"
            data-testid="user-menu-settings"
            onClick={close}
            className="ed-btn-press"
            style={menuItemStyle}
          >
            <Settings size={16} strokeWidth={1.5} />
            Paramètres
          </Link>

          <Link
            href="/abonnement"
            role="menuitem"
            data-testid="user-menu-subscription"
            onClick={close}
            className="ed-btn-press"
            style={menuItemStyle}
          >
            <CreditCard size={16} strokeWidth={1.5} />
            Abonnement
          </Link>

          <div style={{ height: 1, backgroundColor: 'var(--rule-default)', margin: '6px 0' }} />

          <button
            type="button"
            role="menuitem"
            data-testid="user-menu-signout"
            onClick={() => {
              close()
              onSignOut?.()
            }}
            className="ed-btn-press"
            style={{
              ...menuItemStyle,
              width: '100%',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <LogOut size={16} strokeWidth={1.5} />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  )
}

const menuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '9px 10px',
  borderRadius: 8,
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'var(--text-primary)',
  textDecoration: 'none',
}
