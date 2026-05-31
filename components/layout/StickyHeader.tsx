'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { SANS_FONT } from '@/lib/typography'
import Wordmark from '@/components/Wordmark'

// Mirror the TopNav exclusion list — StickyHeader shows exactly where
// the in-product TopNav hides. These sets should stay in sync as new
// marketing / legal surfaces are added.
const MARKETING_EXACT: ReadonlySet<string> = new Set([
  '/',
  '/fr',
  '/fr/exam-prep',
  '/library',
  '/fr/library',
])

const MARKETING_PREFIXES = [
  '/signup',
  '/login',
  '/legal',
  '/method',
  '/about',
  '/blog',
  '/paywall',
  '/onboarding',
  '/refund',
  '/privacy',
  '/terms',
] as const

function isMarketingPath(pathname: string): boolean {
  if (MARKETING_EXACT.has(pathname)) return true
  for (const prefix of MARKETING_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) return true
  }
  return false
}

// Primary marketing nav items shown in the mobile hamburger menu.
const MOBILE_NAV = [
  { href: '/method', label: 'La Méthode' },
  { href: '/login', label: 'Sign in' },
  { href: '/signup', label: 'Get started' },
] as const

export default function StickyHeader() {
  const pathname = usePathname() ?? '/'
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => { setScrolled(window.scrollY > 60) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change.
  useEffect(() => { setMenuOpen(false) }, [pathname])

  if (!isMarketingPath(pathname)) return null

  return (
    <>
      <header
        data-testid="sticky-header"
        className={scrolled ? 'sticky-header--scrolled' : ''}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: 64,
          backgroundColor: scrolled ? 'var(--lm-bg-surface)' : 'transparent',
          borderBottom: scrolled ? '1px solid var(--rule-default)' : 'none',
          transition: 'background-color 200ms ease, border-color 200ms ease',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 clamp(24px, 5vw, 80px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Wordmark size="showcase" animateReveal href="/" />

          {/* Desktop: Sign in link */}
          <Link
            href="/login"
            className="hidden md:inline-flex"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              letterSpacing: '0.01em',
            }}
          >
            Sign in
          </Link>

          {/* Mobile: hamburger / close toggle */}
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="sticky-header-mobile-nav"
            className="md:hidden inline-flex items-center justify-center"
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              width: 40,
              height: 40,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              borderRadius: 4,
              padding: 0,
            }}
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  d="M2 2l14 14M16 2L2 16"
                  fill="none"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  d="M3 6h14M3 10h14M3 14h14"
                  fill="none"
                />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile nav drawer — slide-down below the 64px sticky header.
          Hidden at md+ (hamburger is already md:hidden so this never
          opens on desktop, but class guards against programmatic leaks). */}
      {menuOpen && (
        <nav
          id="sticky-header-mobile-nav"
          aria-label="Marketing navigation"
          className="md:hidden"
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            zIndex: 99,
            backgroundColor: 'var(--lm-bg-surface)',
            borderBottom: '1px solid var(--rule-default)',
            padding: '8px 0 16px',
          }}
        >
          {MOBILE_NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block',
                padding: '12px clamp(24px, 5vw, 80px)',
                fontFamily: SANS_FONT,
                fontWeight: 500,
                fontSize: '1rem',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                letterSpacing: '0.01em',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </>
  )
}
