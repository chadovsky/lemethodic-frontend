'use client'

// M-101a — Section 3, differentiation. Sage bg, three cards. Stacked on
// mobile, three-column on desktop ≥ 880px.

import type { Lang } from '../copy'
import { DIFFERENTIATION } from '../copy'
import { DISPLAY_FONT, INK, INK_SOFT, PAPER } from '../../onboarding/OnboardingScreen'

const BG = '#D4E4D0' // --fp-sage

export default function DifferentiationSection({ lang }: { lang: Lang }) {
  return (
    <section
      className="w-full"
      style={{ backgroundColor: BG, padding: '72px 24px 80px' }}
    >
      <div className="mx-auto" style={{ maxWidth: 1080 }}>
        <h2
          className="text-balance mx-auto"
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 800,
            fontSize: 'clamp(26px, 4vw, 36px)',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            color: INK,
            marginBottom: 36,
            maxWidth: 760,
          }}
        >
          {DIFFERENTIATION.heading[lang]}
        </h2>
        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          }}
        >
          {DIFFERENTIATION.cards.map((card, i) => (
            <div
              key={i}
              style={{
                backgroundColor: PAPER,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRadius: 24,
                padding: '24px 24px 26px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              }}
            >
              <h3
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 18,
                  lineHeight: 1.3,
                  color: INK,
                  marginBottom: 12,
                }}
              >
                {card.title[lang]}
              </h3>
              <p
                className="text-pretty"
                style={{
                  fontWeight: 500,
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: INK_SOFT,
                }}
              >
                {card.body[lang]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
