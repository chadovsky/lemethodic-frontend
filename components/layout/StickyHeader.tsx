'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

// Mirror the TopNav exclusion list — StickyHeader shows exactly where
// the in-product TopNav hides. These sets should stay in sync as new
// marketing / legal surfaces are added.
const MARKETING_EXACT: ReadonlySet<string> = new Set([
  '/',
  '/fr',
  '/exam-prep',
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

export default function StickyHeader() {
  const pathname = usePathname() ?? '/'
  if (!isMarketingPath(pathname)) return null

  return (
    <header
      data-testid="sticky-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 64,
        backgroundColor: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--rule-default)',
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
        <Link
          href="/"
          data-testid="header-logo"
          style={{
            fontFamily: SERIF_FONT,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: '1.25rem',
            letterSpacing: '-0.01em',
            color: 'var(--text-primary)',
            textDecoration: 'none',
          }}
        >
          Le Méthodic
        </Link>

        <Link
          href="/login"
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
      </div>
    </header>
  )
}
