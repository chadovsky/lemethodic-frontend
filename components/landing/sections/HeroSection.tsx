'use client'

// F-200 — hero. Type-led, no CTA (per spec — trust the user to scroll).
// The trust-line ("Free. No card required. About 12 minutes.") that
// previously sat under the hero CTA was rescued to FinalCTASection
// where it earns its placement next to the actual primary CTA.
//
// Oversized H1 with editorial display type, tight letter-spacing,
// generous vertical padding (~160px desktop, ~80px mobile).

import type { Lang } from '../copy'
import { HERO } from '../copy'
import { ED, LETTER_SPACING, LINE_HEIGHT, SANS_FONT } from '@/lib/typography'
import RevealOnScroll from '../RevealOnScroll'

export default function HeroSection({ lang }: { lang: Lang }) {
  return (
    <section
      className="w-full"
      style={{
        backgroundColor: ED.bg,
        // Editorial padding: 160px top / 140px bottom desktop;
        // 80px / 64px mobile. clamp() interpolates smoothly.
        padding: 'clamp(80px, 14vw, 160px) clamp(24px, 4vw, 64px) clamp(64px, 10vw, 140px)',
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 1280 }}>
        {/* Inner text column — narrower than container so oversized type
            doesn't span 1280px on desktop (would feel banner-y, not editorial) */}
        <div style={{ maxWidth: 920 }}>
          <RevealOnScroll>
            <h1
              className="text-balance"
              style={{
                fontFamily: SANS_FONT,
                fontWeight: 700,
                // Type scale: 48px floor (mobile), 96px ceiling (desktop)
                fontSize: 'clamp(2.5rem, 7vw, 6rem)',
                lineHeight: LINE_HEIGHT.display,
                letterSpacing: LETTER_SPACING.display,
                color: ED.fg,
                margin: 0,
                marginBottom: 'clamp(20px, 2.5vw, 32px)',
              }}
            >
              {HERO.h1[lang]}
            </h1>
          </RevealOnScroll>
          <RevealOnScroll delay={0.15}>
            <p
              className="text-pretty"
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
          </RevealOnScroll>
        </div>
      </div>
    </section>
  )
}
