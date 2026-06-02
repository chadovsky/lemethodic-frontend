'use client'

// V-013c — desktop top nav. Apple-style sticky bar with backdrop-blur on
// scroll, peach-deep underline for active link, profile dropdown.
// Mounted globally in app/layout.tsx; returns null on marketing /
// conversion paths and below md (768px) so BottomNav owns mobile.

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

// V-016g — /library + /fr/library stubs are also marketing surfaces.
// /exam-prep -> /tcf-canada (F-332); /fr/exam-prep -> /fr (F-340).
const EXCLUDED_EXACT: ReadonlySet<string> = new Set([
  '/',
  '/fr',
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

const COPY = {
  en: {
    nav: { seance: 'Séance', ecole: 'Méthode', speaking: 'Oral', writing: 'Écrit', progress: 'Progrès', maitre: 'Maître' },
    menu: {
      profile: 'Profile',
      settings: 'Settings',
      account: 'Account',
      about: 'About',
      logout: 'Sign out',
    },
    skipToContent: 'Skip to content',
  },
  fr: {
    nav: { seance: 'Séance', ecole: 'Méthode', speaking: 'Oral', writing: 'Écrit', progress: 'Progrès', maitre: 'Maître' },
    menu: {
      profile: 'Profil',
      settings: 'Paramètres',
      account: 'Abonnement',
      about: 'À propos',
      logout: 'Se déconnecter',
    },
    skipToContent: 'Aller au contenu',
  },
} as const

const NAV_LINKS = [
  { key: 'seance' as const, href: '/seance', match: ['/seance'] },
  { key: 'ecole' as const, href: '/la-methode', match: ['/la-methode', '/cluster', '/learn'] },
  { key: 'speaking' as const, href: '/examen/expression-orale', match: ['/examen/expression-orale'] },
  { key: 'writing' as const, href: '/examen/expression-ecrite', match: ['/examen/expression-ecrite'] },
  { key: 'progress' as const, href: '/progression', match: ['/progression', '/examen'] },
  { key: 'maitre' as const, href: '/maitre', match: ['/maitre'] },
] as const

function isLinkActive(href: string, match: readonly string[], pathname: string): boolean {
  if (pathname === href) return true
  return match.some((m) => pathname === m || pathname.startsWith(m + '/'))
}

export default function TopNav() {
  const pathname = usePathname() ?? '/'
  const router = useRouter()
  const language = useInterfaceLanguage()
  const copy = COPY[language]
  const user = useAuthStore((s) => s.user)
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const token = useAuthStore((s) => s.token)
  const hydrated = useAuthStore((s) => s.hydrated)

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Track scroll past 8px for the backdrop-blur + border activation.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Click-outside dismissal for the profile dropdown.
  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  if (shouldHideOn(pathname)) return null
  // Wait for hydration before rendering — avoids flash of nav on
  // unauthenticated marketing redirects.
  if (!hydrated || !token) return null

  const avatarInitial = (user?.fullName?.trim().charAt(0) || user?.email?.charAt(0) || 'L').toUpperCase()

  function handleLanguageToggle(next: InterfaceLanguage) {
    if (!user || !token || next === language) return
    setAuth(token, { ...user, interfaceLanguage: next })
  }

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

  return (
    <nav
      aria-label="Primary"
      // Mobile gets BottomNav instead — hide TopNav below md.
      className="hidden md:flex"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 64,
        // V-013c — backdrop-blur(12px) when scrolled past 8px. Solid bg
        // baseline so the nav still has a fill when scroll is at top.
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
        {/* LEFT — wordmark */}
        <Wordmark size="nav" href="/la-methode" />

        {/* CENTER — nav links */}
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: 'clamp(20px, 3vw, 36px)',
          }}
        >
          {NAV_LINKS.map(({ key, href, match }) => {
            const active = isLinkActive(href, match, pathname)
            return (
              <li key={key}>
                <Link
                  href={href}
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
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = ED_FG
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = active ? ED_FG : ED_FG_SOFT
                  }}
                >
                  {copy.nav[key]}
                  {/* Active underline — 2px peach-deep, 4px below the link */}
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

        {/* RIGHT — language toggle + theme toggle + profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <ThemeToggle />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {(['en', 'fr'] as const).map((l, i) => {
              const active = l === language
              return (
                <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button
                    type="button"
                    onClick={() => handleLanguageToggle(l)}
                    aria-pressed={active}
                    style={{
                      padding: '4px 6px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      outline: 'none',
                      color: active ? ED_FG : ED_FG_SOFT,
                      fontFamily: SANS,
                      fontWeight: active ? 600 : 500,
                      fontSize: 12,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      transition: 'color var(--lm-duration-hover) var(--lm-ease-spring)',
                    }}
                  >
                    {l}
                  </button>
                  {i === 0 && (
                    <span aria-hidden="true" style={{ color: ED_RULE, fontSize: 11 }}>
                      /
                    </span>
                  )}
                </span>
              )
            })}
          </div>

          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              type="button"
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
                {/* V-014c — dropdown expanded to all 4 /more sections via
                    anchor links so Settings / Account / About are
                    reachable from desktop without intermediate /more
                    navigation. /more sections carry matching id
                    attributes for native anchor scroll. */}
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
                    {copy.menu[section]}
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
                  {copy.menu.logout}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
