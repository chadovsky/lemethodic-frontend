'use client'

// F-200 — landing footer. Paper bg with ed-rule top border. Three legal
// links + brand + copyright + admin email. Editorial restraint: no nav
// emphasis, plain typography, generous gap. Client component because of
// hover-color transitions (event handlers); also reused by Server-Component
// LegalPage at /privacy /terms /refund.

import Link from 'next/link'
import { BRAND, type Lang } from './copy'
import { ED, LETTER_SPACING, SANS_FONT } from '@/lib/typography'

interface LandingFooterProps {
  lang: Lang
}

const COPY = {
  en: {
    examPrep: 'Exam Prep',
    library: 'Library',
    privacy: 'Privacy',
    terms: 'Terms',
    refund: 'Refund',
    rights: '© 2026 Le Méthodic',
  },
  fr: {
    examPrep: 'Préparation aux examens',
    library: 'Bibliothèque',
    privacy: 'Confidentialité',
    terms: 'Conditions',
    refund: 'Remboursement',
    rights: '© 2026 Le Méthodic',
  },
} as const satisfies Record<Lang, unknown>

export default function LandingFooter({ lang }: LandingFooterProps) {
  const copy = COPY[lang]
  return (
    <footer
      className="w-full"
      style={{
        backgroundColor: ED.paper,
        borderTop: `1px solid ${ED.rule}`,
        padding: 'clamp(48px, 6vw, 80px) clamp(24px, 4vw, 64px) clamp(40px, 5vw, 56px)',
      }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: 1280,
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
        }}
      >
        {/* Top row: brand + nav links */}
        <div
          className="flex flex-wrap items-center justify-between"
          style={{ gap: 24 }}
        >
          <span
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: '1rem',
              color: ED.fg,
              letterSpacing: LETTER_SPACING.heading,
            }}
          >
            {BRAND}
          </span>
          <nav
            aria-label={lang === 'fr' ? 'Navigation pied de page' : 'Footer navigation'}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 28 }}
          >
            {[
              // F-300a — product surface links added ahead of legal.
              // /fr/tcf-canada not yet built (MS-1); /fr until it ships (F-340)
              // EN repointed to /examens/tcf (F-450): /tcf-canada never built
              { href: lang === 'fr' ? '/fr' : '/examens/tcf', label: copy.examPrep },
              { href: '/library', label: copy.library },
              { href: '/confidentialite', label: copy.privacy },
              { href: '/mentions-legales', label: copy.terms },
              { href: '/refund', label: copy.refund },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  fontFamily: SANS_FONT,
                  fontWeight: 400,
                  fontSize: '0.875rem',
                  color: ED.muted,
                  textDecoration: 'none',
                  transition: 'color var(--lm-duration-hover) var(--lm-ease-spring)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = ED.fg }}
                onMouseLeave={(e) => { e.currentTarget.style.color = ED.muted }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom row: copyright + contact */}
        <div
          className="flex flex-wrap items-center justify-between"
          style={{ gap: 16, paddingTop: 24, borderTop: `1px solid ${ED.rule}` }}
        >
          <span
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 400,
              fontSize: '0.8125rem',
              color: ED.muted,
            }}
          >
            {copy.rights}
          </span>
          <a
            href="mailto:admin@lemethodic.com"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 400,
              fontSize: '0.8125rem',
              color: ED.muted,
              textDecoration: 'none',
              transition: 'color var(--lm-duration-hover) var(--lm-ease-spring)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = ED.fg }}
            onMouseLeave={(e) => { e.currentTarget.style.color = ED.muted }}
          >
            admin@lemethodic.com
          </a>
        </div>
      </div>
    </footer>
  )
}
