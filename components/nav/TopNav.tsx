'use client'

// F-441 -- TopNav rebuilt to locked IA. English benefit labels, Exams
// dropdown with TCF/DELF/French for Business, bientôt chips for Real French +
// AI Tutor. Right side: unauthenticated only (Pricing / Log in / Start Free).
// F-446 -- Shell split: TopNav = logged-out shell. Returns null when
// authenticated. Authenticated app shell is the left sidebar (AppShell).

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/auth'
import CartButton from '@/components/store/CartButton'

const ED_FG = 'var(--lm-text-primary)'
const ED_FG_SOFT = 'var(--lm-text-secondary)'
const ED_RULE = 'var(--lm-border-subtle)'
const SANS = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'

// F-479 — nav consolidation. TopNav (the floating pill) is now the SINGLE
// logged-out marketing nav across every public surface. StickyHeader is retired,
// so its routes (/tarifs, /librairie, /examens, /pieges, /inscription, /a-propos,
// /faq, /blog, legal pages, /library) now adopt this pill. The only routes that
// stay headerless are the focused auth surface (/connexion, F-475) and the
// conversion funnel (/onboarding, /paywall) — no nav-away chrome there.
const EXCLUDED_PREFIXES = [
  '/connexion',
  '/onboarding',
  '/paywall',
] as const

function shouldHideOn(pathname: string): boolean {
  for (const prefix of EXCLUDED_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) return true
  }
  return false
}

// Exams dropdown children. TCF is live; DELF + French for Business are bientôt.
const EXAM_CHILDREN = [
  { label: 'TCF', href: '/l-examen', bientot: false },
  { label: 'DELF', href: null, bientot: true },
  { label: 'French for Business', href: null, bientot: true },
] as const

// F-441 nav IA -- English benefit labels.
const NAV_ITEMS = [
  {
    key: 'vocabulary',
    label: 'Vocabulary',
    href: '/la-methode',
    match: ['/la-methode', '/cluster', '/learn'],
    dropdown: false,
    bientot: false,
  },
  {
    key: 'exams',
    label: 'Exams',
    href: '/l-examen',
    match: ['/l-examen'],
    dropdown: true,
    bientot: false,
  },
  {
    key: 'store',
    label: 'Store',
    href: '/librairie',
    match: ['/librairie'],
    dropdown: false,
    bientot: false,
  },
  {
    key: 'real-french',
    label: 'Real French',
    href: null as string | null,
    match: [] as string[],
    dropdown: false,
    bientot: true,
  },
  {
    key: 'ai-tutor',
    label: 'AI Tutor',
    href: null as string | null,
    match: [] as string[],
    dropdown: false,
    bientot: true,
  },
  {
    key: 'coaching',
    label: 'Coaching',
    href: '/coaching',
    match: ['/coaching'],
    dropdown: false,
    bientot: false,
  },
] as const

function isLinkActive(href: string | null, match: readonly string[], pathname: string): boolean {
  if (!href) return false
  if (pathname === href) return true
  return match.some((m) => pathname === m || pathname.startsWith(m + '/'))
}

// Inline bientôt chip for nav items.
function BientotChip() {
  return (
    <span
      aria-label="coming soon"
      style={{
        display: 'inline-block',
        marginLeft: 6,
        padding: '1px 6px',
        borderRadius: 99,
        backgroundColor: 'var(--lm-warm-peach)',
        color: 'var(--lm-warm-espresso)',
        fontFamily: SANS,
        fontWeight: 600,
        fontSize: 10,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        lineHeight: '16px',
        verticalAlign: 'middle',
        userSelect: 'none',
      }}
    >
      bientôt
    </span>
  )
}

// F-475 — brand logo. Replaces the boxed typewriter <Wordmark> in the
// logged-out nav with the real wordmark asset (next/image), linking home (/).
// height:48 makes it the brand anchor (clearly larger than the 14px nav links)
// while still clearing the 64px nav row; the sign-in card + sidebar logos are
// sized for their own surfaces. Decode is gated in e2e (complete && naturalWidth > 0).
function NavLogo({ testId }: { testId: string }) {
  return (
    <Link
      href="/"
      aria-label="Le Méthodic, home"
      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', minHeight: 44 }}
    >
      <Image
        data-testid={testId}
        src="/brand/lemethodic-logo.png"
        alt="Le Méthodic"
        width={2668}
        height={1329}
        priority
        style={{ height: 48, width: 'auto' }}
      />
    </Link>
  )
}

export default function TopNav() {
  const pathname = usePathname() ?? '/'
  const token = useAuthStore((s) => s.token)
  const hydrated = useAuthStore((s) => s.hydrated)

  const [scrolled, setScrolled] = useState(false)
  const [examsOpen, setExamsOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const examsRef = useRef<HTMLLIElement | null>(null)

  // Kick off auth store rehydration on mount. Idempotent -- safe when
  // ProtectedRoute has already called it on (app) group routes.
  useEffect(() => {
    useAuthStore.getState().hydrate()
  }, [])

  // Backdrop-blur activation past 8px.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Click-outside: exams dropdown.
  useEffect(() => {
    if (!examsOpen) return
    const onClick = (e: MouseEvent) => {
      if (!examsRef.current) return
      if (!examsRef.current.contains(e.target as Node)) setExamsOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [examsOpen])

  // Close mobile menu on route change.
  useEffect(() => { setMobileOpen(false) }, [pathname])

  if (shouldHideOn(pathname)) return null
  // Wait for auth store hydration to avoid a flash of wrong state.
  if (!hydrated) return null
  // F-446: TopNav is the logged-out shell only. Authenticated users get the
  // left sidebar (AppShell) as their nav; TopNav must not render alongside it.
  if (token) return null

  // F-479 — the mobile pill header shows on EVERY route TopNav serves. TopNav is
  // logged-out-only (returns null on token), so there is never an AppShell topbar
  // here; the marketing routes need their own mobile chrome, not just the landing.

  return (
    <>
    <nav
      aria-label="Primary"
      data-testid="topnav-desktop"
      className={`hidden md:flex${scrolled ? ' sticky-header--scrolled' : ''}`}
      style={{
        position: 'sticky',
        top: 12,
        zIndex: 50,
        margin: '12px auto 0',
        maxWidth: 1180,
        width: 'calc(100% - 32px)',
        height: 60,
        borderRadius: 9999,
        backgroundColor: 'var(--shell-frost)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        border: `1px solid ${ED_RULE}`,
        boxShadow: 'var(--shell-pill-shadow)',
        transition: 'box-shadow var(--lm-duration-hover) var(--lm-ease-spring), border-color var(--lm-duration-hover) var(--lm-ease-spring)',
        alignItems: 'center',
        fontFamily: SANS,
      }}
    >
      <div
        style={{
          width: '100%',
          padding: '0 clamp(16px, 2vw, 28px)',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center',
          gap: 24,
          height: '100%',
        }}
      >
        {/* LEFT -- brand logo (F-475) */}
        <NavLogo testId="topnav-logo-img" />

        {/* CENTER -- nav links */}
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: 'clamp(16px, 2.5vw, 30px)',
            alignItems: 'center',
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = isLinkActive(item.href, item.match, pathname)

            // Bientôt items -- non-interactive, chip only.
            if (item.bientot) {
              return (
                <li key={item.key}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '6px 4px',
                      fontFamily: SANS,
                      fontWeight: 500,
                      fontSize: 14,
                      letterSpacing: '0.01em',
                      color: ED_FG_SOFT,
                      cursor: 'default',
                      opacity: 0.7,
                    }}
                  >
                    {item.label}
                    <BientotChip />
                  </span>
                </li>
              )
            }

            // Exams dropdown.
            if (item.dropdown) {
              return (
                <li key={item.key} ref={examsRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={examsOpen}
                    onClick={() => setExamsOpen((v) => !v)}
                    style={{
                      position: 'relative',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '6px 4px',
                      fontFamily: SANS,
                      fontWeight: active ? 600 : 500,
                      fontSize: 14,
                      letterSpacing: '0.01em',
                      color: active ? ED_FG : ED_FG_SOFT,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'color var(--lm-duration-hover) var(--lm-ease-spring)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = ED_FG }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = active ? ED_FG : ED_FG_SOFT }}
                  >
                    {item.label}
                    {/* Chevron */}
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      aria-hidden="true"
                      style={{
                        transform: examsOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform var(--lm-duration-hover) var(--lm-ease-spring)',
                      }}
                    >
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {active && (
                      <span
                        aria-hidden="true"
                        style={{
                          position: 'absolute',
                          left: 4,
                          right: 4,
                          bottom: -6,
                          height: 2,
                          backgroundColor: 'var(--lm-warm-peach-deep)',
                          borderRadius: 2,
                        }}
                      />
                    )}
                  </button>

                  {examsOpen && (
                    <div
                      role="menu"
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 10px)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        minWidth: 200,
                        backgroundColor: 'var(--lm-bg-surface)',
                        border: `1px solid ${ED_RULE}`,
                        borderRadius: 4,
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04)',
                        padding: 4,
                        zIndex: 51,
                      }}
                    >
                      {EXAM_CHILDREN.map((child) => {
                        if (child.bientot) {
                          return (
                            <div
                              key={child.label}
                              role="menuitem"
                              aria-disabled="true"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                fontFamily: SANS,
                                fontWeight: 500,
                                fontSize: 13,
                                color: ED_FG_SOFT,
                                opacity: 0.6,
                                cursor: 'default',
                              }}
                            >
                              {child.label}
                              <BientotChip />
                            </div>
                          )
                        }
                        return (
                          <Link
                            key={child.label}
                            href={child.href}
                            role="menuitem"
                            onClick={() => setExamsOpen(false)}
                            style={{
                              display: 'block',
                              padding: '10px 14px',
                              fontFamily: SANS,
                              fontWeight: 500,
                              fontSize: 13,
                              color: ED_FG,
                              textDecoration: 'none',
                              borderRadius: 2,
                            }}
                          >
                            {child.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </li>
              )
            }

            // Standard nav link.
            return (
              <li key={item.key}>
                <Link
                  href={item.href!}
                  aria-current={active ? 'page' : undefined}
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    padding: '6px 4px',
                    fontFamily: SANS,
                    fontWeight: active ? 600 : 500,
                    fontSize: 14,
                    letterSpacing: '0.01em',
                    color: active ? ED_FG : ED_FG_SOFT,
                    textDecoration: 'none',
                    transition: 'color var(--lm-duration-hover) var(--lm-ease-spring)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = ED_FG }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = active ? ED_FG : ED_FG_SOFT }}
                >
                  {item.label}
                  {active && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        left: 4,
                        right: 4,
                        bottom: -6,
                        height: 2,
                        backgroundColor: 'var(--lm-warm-peach-deep)',
                        borderRadius: 2,
                      }}
                    />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* RIGHT -- unauthenticated: Cart | Pricing | Log in | Start Free */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CartButton variant="icon" testId="topnav-cart-button" />
          <Link
            href="/tarifs"
            style={{
              fontFamily: SANS,
              fontWeight: 500,
              fontSize: 14,
              color: ED_FG_SOFT,
              textDecoration: 'none',
              padding: '6px 4px',
              transition: 'color var(--lm-duration-hover) var(--lm-ease-spring)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = ED_FG }}
            onMouseLeave={(e) => { e.currentTarget.style.color = ED_FG_SOFT }}
          >
            Pricing
          </Link>
          <Link
            href="/connexion"
            style={{
              fontFamily: SANS,
              fontWeight: 500,
              fontSize: 14,
              color: ED_FG_SOFT,
              textDecoration: 'none',
              padding: '6px 4px',
              transition: 'color var(--lm-duration-hover) var(--lm-ease-spring)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = ED_FG }}
            onMouseLeave={(e) => { e.currentTarget.style.color = ED_FG_SOFT }}
          >
            Log in
          </Link>
          <Link
            href="/inscription"
            className="ed-btn-press"
            style={{
              display: 'inline-block',
              padding: '7px 16px',
              backgroundColor: ED_FG,
              color: 'var(--lm-bg-base)',
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: '0.01em',
              textDecoration: 'none',
              borderRadius: 4,
              transition: 'opacity var(--lm-duration-hover) var(--lm-ease-spring)',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
          >
            Start Free
          </Link>
        </div>
      </div>
    </nav>

    {/* F-479 — mobile pill header on every served route (logged-out only). */}
    {(
      <>
        <header
          data-testid="topnav-mobile"
          className="flex md:hidden"
          style={{
            position: 'sticky',
            top: 10,
            zIndex: 50,
            margin: '10px clamp(12px, 4vw, 20px) 0',
            height: 56,
            borderRadius: 9999,
            backgroundColor: 'var(--shell-frost)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
            border: `1px solid ${ED_RULE}`,
            boxShadow: 'var(--shell-pill-shadow)',
            transition: 'box-shadow var(--lm-duration-hover) var(--lm-ease-spring), border-color var(--lm-duration-hover) var(--lm-ease-spring)',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '100%',
              padding: '0 clamp(12px, 4vw, 18px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '100%',
            }}
          >
            <NavLogo testId="topnav-logo-img-mobile" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CartButton variant="icon" testId="topnav-cart-button-mobile" />
            <button
              type="button"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="topnav-mobile-nav"
              onClick={() => setMobileOpen((v) => !v)}
              style={{
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: ED_FG,
                borderRadius: 4,
                padding: 0,
              }}
            >
              {mobileOpen ? (
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M2 2l14 14M16 2L2 16" fill="none" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M3 6h14M3 10h14M3 14h14" fill="none" />
                </svg>
              )}
            </button>
            </div>
          </div>
        </header>

        {mobileOpen && (
          <nav
            id="topnav-mobile-nav"
            aria-label="Primary mobile"
            className="md:hidden"
            style={{
              position: 'fixed',
              top: 64,
              left: 0,
              right: 0,
              zIndex: 49,
              backgroundColor: 'var(--lm-bg-surface)',
              borderBottom: `1px solid ${ED_RULE}`,
              padding: '8px 0 20px',
              fontFamily: SANS,
            }}
          >
            {NAV_ITEMS.map((item) => {
              if (item.bientot) {
                return (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px clamp(20px, 5vw, 40px)',
                      fontSize: 16,
                      fontWeight: 500,
                      color: ED_FG_SOFT,
                      opacity: 0.65,
                    }}
                  >
                    {item.label}
                    <BientotChip />
                  </div>
                )
              }
              // Exams: flat link to /l-examen on mobile (no nested dropdown).
              return (
                <a
                  key={item.key}
                  href={item.href ?? '/l-examen'}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'block',
                    padding: '12px clamp(20px, 5vw, 40px)',
                    fontSize: 16,
                    fontWeight: 500,
                    color: ED_FG,
                    textDecoration: 'none',
                    letterSpacing: '0.01em',
                  }}
                >
                  {item.label}
                </a>
              )
            })}
            <hr style={{ margin: '12px clamp(20px, 5vw, 40px)', border: 'none', borderTop: `1px solid ${ED_RULE}` }} />
            <a
              href="/tarifs"
              onClick={() => setMobileOpen(false)}
              style={{ display: 'block', padding: '12px clamp(20px, 5vw, 40px)', fontSize: 16, fontWeight: 500, color: ED_FG, textDecoration: 'none' }}
            >
              Pricing
            </a>
            <a
              href="/connexion"
              onClick={() => setMobileOpen(false)}
              style={{ display: 'block', padding: '12px clamp(20px, 5vw, 40px)', fontSize: 16, fontWeight: 500, color: ED_FG, textDecoration: 'none' }}
            >
              Log in
            </a>
            <div style={{ padding: '8px clamp(20px, 5vw, 40px) 4px' }}>
              <a
                href="/inscription"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'block',
                  padding: '12px 20px',
                  backgroundColor: ED_FG,
                  color: 'var(--lm-bg-base)',
                  fontFamily: SANS,
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: 'none',
                  borderRadius: 4,
                  textAlign: 'center',
                }}
              >
                Start Free
              </a>
            </div>
          </nav>
        )}
      </>
    )}
    </>
  )
}
