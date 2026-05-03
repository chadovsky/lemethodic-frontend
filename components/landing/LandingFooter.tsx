// B-102 — landing footer. Three legal links + brand mark + copyright +
// admin email. Sits below FinalCTASection on the landing routes (/, /fr).
// Legal pages also reuse this footer for navigation consistency.
//
// Legal-page links target /privacy, /terms, /refund — these are EN-only at
// v1. FR translations file as M-101.x post-launch; until then the same EN
// docs are served regardless of landing language.

import Link from 'next/link'
import { BRAND, type Lang } from './copy'
import { DISPLAY_FONT, INK, INK_SOFT, INK_MUTED } from '../onboarding/OnboardingScreen'

const BG = '#FAFAF7' // --fp-canvas

interface LandingFooterProps {
  lang: Lang
}

const COPY = {
  en: {
    privacy: 'Privacy',
    terms: 'Terms',
    refund: 'Refund',
    rights: '© 2026 LeMethodic',
    contactLabel: 'Contact',
  },
  fr: {
    privacy: 'Confidentialité',
    terms: 'Conditions',
    refund: 'Remboursement',
    rights: '© 2026 LeMethodic',
    contactLabel: 'Contact',
  },
} as const satisfies Record<Lang, unknown>

export default function LandingFooter({ lang }: LandingFooterProps) {
  const copy = COPY[lang]
  return (
    <footer
      className="w-full"
      style={{
        backgroundColor: BG,
        padding: '40px 24px 32px',
        borderTop: `1px solid ${INK_MUTED}`,
      }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: 1080,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {/* Top row: brand + nav links */}
        <div
          className="flex flex-wrap items-center justify-between"
          style={{ gap: 16 }}
        >
          <span
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 800,
              fontSize: 18,
              color: INK,
              letterSpacing: '-0.01em',
            }}
          >
            {BRAND}
          </span>
          <nav
            aria-label={lang === 'fr' ? 'Pages légales' : 'Legal'}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}
          >
            <Link
              href="/privacy"
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 600,
                fontSize: 14,
                color: INK_SOFT,
                textDecoration: 'none',
              }}
            >
              {copy.privacy}
            </Link>
            <Link
              href="/terms"
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 600,
                fontSize: 14,
                color: INK_SOFT,
                textDecoration: 'none',
              }}
            >
              {copy.terms}
            </Link>
            <Link
              href="/refund"
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 600,
                fontSize: 14,
                color: INK_SOFT,
                textDecoration: 'none',
              }}
            >
              {copy.refund}
            </Link>
          </nav>
        </div>

        {/* Bottom row: copyright + contact */}
        <div
          className="flex flex-wrap items-center justify-between"
          style={{ gap: 12 }}
        >
          <span
            style={{
              fontWeight: 500,
              fontSize: 13,
              color: INK_MUTED,
            }}
          >
            {copy.rights}
          </span>
          <a
            href="mailto:admin@lemethodic.com"
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 600,
              fontSize: 13,
              color: INK_SOFT,
              textDecoration: 'none',
            }}
          >
            admin@lemethodic.com
          </a>
        </div>
      </div>
    </footer>
  )
}
