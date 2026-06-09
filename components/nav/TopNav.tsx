'use client'

// F-441 -- TopNav rebuilt to locked IA. English benefit labels, Exams
// dropdown with TCF/DELF/French for Business, bientôt chips for Real French +
// AI Tutor. Right side is auth-conditional: unauthenticated sees
// Pricing/Log in/Start Free; authenticated sees ThemeToggle + avatar dropdown.

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import { useOnboardingStore } from '@/lib/onboarding'
import { useSubmitResponseStore } from '@/lib/submitResponse'
import { useInterfaceLanguage, type InterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import Wordmark from '@/components/Wordmark'

const ED_BG = 'var(--lm-bg-base)'
const ED_FG = 'var(--lm-text-primary)'
const ED_FG_SOFT = 'var(--lm-text-secondary)'
const ED_RULE = 'var(--lm-border-subtle)'
const SANS = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'
const SERIF = 'var(--font-source-serif), Georgia, serif'

// Routes that should NOT render the in-product top nav. Marketing,
// conversion funnel, legal, and auth surfaces have their own chrome.
const EXCLUDED_PREFIXES = [
  '/inscription',
  '/connexion',
  '/onboarding',
  '/paywall',
  '/mentions-legales',
  '/confidentialite',
  '/cgv',
  '/refund',
  '/examens',
  '/a-propos',
  '/faq',
  '/tarifs',
  '/blog',
  '/pieges',
  '/librairie',
] as const

const EXCLUDED_EXACT: ReadonlySet<string> = new Set([
  '/library',
  '/fr/library',
])

function shouldHideOn(pathname: string): boolean {
  if (EXCLUDED_EXACT.has(pathname)) return true
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
    key: 'library',
    label: 'Library',
    href: '/la-bibliotheque',
    match: ['/la-bibliotheque'],
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

const MENU_COPY = {
  en: {
    profile: 'Profile',
    settings: 'Settings',
    account: 'Account',
    about: 'About',
    logout: 'Sign out',
  },
  fr: {
    profile: 'Profil',
    settings: 'Paramètres',
    account: 'Abonnement',
    about: 'À propos',
    logout: 'Se déconnecter',
  },
} as const

export default function TopNav() {
  const pathname = usePathname() ?? '/'
  const router = useRouter()
  const language = useInterfaceLanguage()
  const menuCopy = MENU_COPY[language]
  const user = useAuthStore((s) => s.user)
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const token = useAuthStore((s) => s.token)
  const hydrated = useAuthStore((s) => s.hydrated)

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [examsOpen, setExamsOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
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

  // Click-outside: profile dropdown.
  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

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
  // Wait for auth store hydration to avoid a flash of wrong right-side state.
  if (!hydrated) return null

  const avatarInitial = (user?.fullName?.trim().charAt(0) || user?.email?.charAt(0) || 'L').toUpperCase()

  async function handleLogout() {
    setMenuOpen(false)
    try {
      await api.auth.logout()
    } catch {}
    clearAuth()
    useOnboardingStore.getState().reset()
    useSubmitResponseStore.getState().clear()
    router.push('/')
  }

  // Landing page (/ and /fr): show a mobile header since there is no AppShell topbar
  // or BottomNav on public marketing routes.
  const isLanding = pathname === '/' || pathname === '/fr'

  return (
    <>
    <nav
      aria-label="Primary"
      className="hidden md:flex"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 64,
        backgroundColor: scrolled ? 'var(--lm-bg-blur)' : ED_BG,
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? `1px solid ${ED_RULE}` : '1px solid transparent',
        transition: 'background-color var(--lm-duration-hover) var(--lm-ease-spring), border-color var(--lm-duration-hover) var(--lm-ease-spring), backdrop-filter var(--lm-duration-hover) var(--lm-ease-spring)',
        alignItems: 'center',
        fontFamily: SANS,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 clamp(24px, 3vw, 40px)',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center',
          gap: 32,
          height: '100%',
        }}
      >
        {/* LEFT -- wordmark */}
        <Wordmark size="nav" href="/la-methode" />

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

        {/* RIGHT -- auth-conditional */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {token ? (
            // Authenticated: ThemeToggle + avatar dropdown.
            <>
              <ThemeToggle />
              <div style={{ position: 'relative' }} ref={menuRef}>
                <button
                  type="button"
                  data-testid="topnav-avatar"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="ed-btn-press"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: 'var(--lm-warm-peach)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: SERIF,
                      fontWeight: 400,
                      fontSize: 14,
                      color: 'var(--lm-warm-espresso)',
                      lineHeight: 1,
                    }}
                  >
                    {avatarInitial}
                  </span>
                </button>
                {menuOpen && (
                  <div
                    role="menu"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      minWidth: 200,
                      backgroundColor: 'var(--lm-bg-surface)',
                      border: `1px solid ${ED_RULE}`,
                      borderRadius: 4,
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04)',
                      padding: 4,
                      zIndex: 51,
                    }}
                  >
                    {(['profile', 'settings', 'account', 'about'] as const).map((section) => (
                      <Link
                        key={section}
                        href={
                          section === 'profile' ? '/profil' :
                          section === 'settings' ? '/parametres' :
                          section === 'account' ? '/abonnement' :
                          '/a-propos'
                        }
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
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
                        {menuCopy[section]}
                      </Link>
                    ))}
                    <hr style={{ margin: '4px 0', border: 'none', borderTop: `1px solid ${ED_RULE}` }} />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 14px',
                        fontFamily: SANS,
                        fontWeight: 500,
                        fontSize: 13,
                        color: 'var(--lm-error)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: 2,
                      }}
                    >
                      {menuCopy.logout}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Unauthenticated: Pricing | Log in | Start Free.
            <>
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
            </>
          )}
        </div>
      </div>
    </nav>

    {/* Mobile header — landing page only. Product routes have AppShell topbar + BottomNav. */}
    {isLanding && (
      <>
        <header
          data-testid="topnav-mobile"
          className="flex md:hidden"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            height: 64,
            backgroundColor: scrolled ? 'var(--lm-bg-blur)' : ED_BG,
            backdropFilter: scrolled ? 'blur(12px)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
            borderBottom: scrolled ? `1px solid ${ED_RULE}` : '1px solid transparent',
            transition: 'background-color var(--lm-duration-hover) var(--lm-ease-spring), border-color var(--lm-duration-hover) var(--lm-ease-spring)',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <div
            style={{
              width: '100%',
              padding: '0 clamp(20px, 5vw, 40px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '100%',
            }}
          >
            <Wordmark size="nav" href="/la-methode" />
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
            {token ? (
              <>
                {(['profile', 'settings', 'account', 'about'] as const).map((section) => (
                  <a
                    key={section}
                    href={
                      section === 'profile' ? '/profil' :
                      section === 'settings' ? '/parametres' :
                      section === 'account' ? '/abonnement' :
                      '/a-propos'
                    }
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'block',
                      padding: '12px clamp(20px, 5vw, 40px)',
                      fontSize: 16,
                      fontWeight: 500,
                      color: ED_FG,
                      textDecoration: 'none',
                    }}
                  >
                    {menuCopy[section]}
                  </a>
                ))}
                <button
                  type="button"
                  onClick={() => { setMobileOpen(false); handleLogout() }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px clamp(20px, 5vw, 40px)',
                    fontSize: 16,
                    fontWeight: 500,
                    color: 'var(--lm-error)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: SANS,
                  }}
                >
                  {menuCopy.logout}
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </nav>
        )}
      </>
    )}
    </>
  )
}
