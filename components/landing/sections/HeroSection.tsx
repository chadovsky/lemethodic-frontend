'use client'

// M-101a — Section 1, hero. Text-only on peach. The H1 is the conversion
// driver; visual weight comes from typography + whitespace, not imagery.

import Link from 'next/link'
import type { Lang } from '../copy'
import { HERO } from '../copy'
import { DISPLAY_FONT, INK, INK_SOFT } from '../../onboarding/OnboardingScreen'

const BG = '#FFD8C2' // --fp-peach

export default function HeroSection({ lang }: { lang: Lang }) {
  return (
    <section
      className="w-full"
      style={{
        backgroundColor: BG,
        padding: '40px 24px 64px',
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 760 }}>
        <h1
          className="text-balance"
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 800,
            fontSize: 'clamp(32px, 5.5vw, 56px)',
            lineHeight: 1.08,
            letterSpacing: '-0.015em',
            color: INK,
            marginBottom: 20,
          }}
        >
          {HERO.h1[lang]}
        </h1>
        <p
          className="text-pretty"
          style={{
            fontWeight: 500,
            fontSize: 'clamp(16px, 2vw, 19px)',
            lineHeight: 1.55,
            color: INK_SOFT,
            maxWidth: 640,
            marginBottom: 32,
          }}
        >
          {HERO.subhead[lang]}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
          <Link
            href="/onboarding"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 56,
              padding: '0 28px',
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
            {HERO.ctaPrimary[lang]}
          </Link>
          <span
            style={{
              fontWeight: 500,
              fontSize: 13,
              lineHeight: '20px',
              color: INK_SOFT,
              maxWidth: 480,
            }}
          >
            {HERO.ctaSecondary[lang]}
          </span>
        </div>
      </div>
    </section>
  )
}
