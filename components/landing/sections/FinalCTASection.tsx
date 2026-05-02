'use client'

// M-101a — Section 8, final CTA. Echoes the hero's peach background to bracket
// the page. Direct route to /onboarding (commitment-shaped CTA).

import Link from 'next/link'
import type { Lang } from '../copy'
import { FINAL_CTA } from '../copy'
import { DISPLAY_FONT, INK, INK_SOFT } from '../../onboarding/OnboardingScreen'

const BG = '#FFD8C2' // --fp-peach

export default function FinalCTASection({ lang }: { lang: Lang }) {
  return (
    <section
      className="w-full"
      style={{ backgroundColor: BG, padding: '80px 24px 88px' }}
    >
      <div className="mx-auto" style={{ maxWidth: 680, textAlign: 'center' }}>
        <h2
          className="text-balance"
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 800,
            fontSize: 'clamp(28px, 4vw, 40px)',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            color: INK,
            marginBottom: 18,
          }}
        >
          {FINAL_CTA.heading[lang]}
        </h2>
        <p
          className="text-pretty mx-auto"
          style={{
            fontWeight: 500,
            fontSize: 'clamp(15px, 1.7vw, 17px)',
            lineHeight: 1.65,
            color: INK_SOFT,
            marginBottom: 28,
            maxWidth: 600,
          }}
        >
          {FINAL_CTA.body[lang]}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <Link
            href="/onboarding"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 56,
              padding: '0 32px',
              borderRadius: 16,
              backgroundColor: INK,
              color: '#FFFFFF',
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: '-0.01em',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            }}
          >
            {FINAL_CTA.ctaPrimary[lang]}
          </Link>
          <span
            style={{
              fontWeight: 500,
              fontSize: 13,
              lineHeight: '20px',
              color: INK_SOFT,
            }}
          >
            {FINAL_CTA.ctaSecondary[lang]}
          </span>
        </div>
      </div>
    </section>
  )
}
