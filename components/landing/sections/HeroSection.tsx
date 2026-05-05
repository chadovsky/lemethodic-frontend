'use client'

// F-200 — hero. Type-led, no CTA. F-212 adds: rotating kicker above H1
// (TCF / TEF / DELF / DALF cycle, pauses on hover) + first-paint entry
// sequence (kicker fades in first, then h1, then subhead) via the
// `ed-hero-rise` CSS animation in globals.css with staggered delays.

import type { Lang } from '../copy'
import { HERO } from '../copy'
import { ED, LETTER_SPACING, LINE_HEIGHT, SANS_FONT } from '@/lib/typography'
import RotatingKicker from '../RotatingKicker'

export default function HeroSection({ lang }: { lang: Lang }) {
  return (
    <section
      className="w-full"
      style={{
        backgroundColor: ED.bg,
        padding: 'clamp(80px, 14vw, 160px) clamp(24px, 4vw, 64px) clamp(64px, 10vw, 140px)',
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 1280 }}>
        <div style={{ maxWidth: 920 }}>
          <div className="ed-hero-rise ed-hero-rise-delay-1">
            <RotatingKicker lang={lang} />
          </div>

          <h1
            className="text-balance ed-hero-rise ed-hero-rise-delay-2"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 700,
              // V-001 — tightened from clamp(2.5rem, 7vw, 6rem) (40-96px)
              // to clamp(2.5rem, 6vw, 5rem) (40-80px). The locked H1 string
              // is 26 words; the previous 96px cap overflowed viewport on
              // large desktops. 80px cap fits comfortably at 1440px.
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              lineHeight: LINE_HEIGHT.display,
              letterSpacing: LETTER_SPACING.display,
              color: ED.fg,
              margin: 0,
              marginBottom: 'clamp(20px, 2.5vw, 32px)',
            }}
          >
            {HERO.h1[lang]}
          </h1>

          <p
            className="text-pretty ed-hero-rise ed-hero-rise-delay-3"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 400,
              fontSize: 'clamp(1.125rem, 1.6vw, 1.375rem)',
              lineHeight: LINE_HEIGHT.body,
              letterSpacing: LETTER_SPACING.body,
              color: ED.muted,
              maxWidth: 720,
              margin: 0,
            }}
          >
            {HERO.subhead[lang]}
          </p>
        </div>
      </div>
    </section>
  )
}
