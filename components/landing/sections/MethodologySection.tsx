'use client'

// M-101a — Section 6, methodology. Lavender bg; long-form credibility text.

import type { Lang } from '../copy'
import { METHODOLOGY } from '../copy'
import { DISPLAY_FONT, INK, INK_SOFT } from '../../onboarding/OnboardingScreen'

const BG = '#E0D4F0' // --fp-lavender

export default function MethodologySection({ lang }: { lang: Lang }) {
  const paragraphs = METHODOLOGY.paragraphs[lang]
  return (
    <section
      className="w-full"
      style={{ backgroundColor: BG, padding: '72px 24px 80px' }}
    >
      <div className="mx-auto" style={{ maxWidth: 720 }}>
        <h2
          className="text-balance"
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 800,
            fontSize: 'clamp(26px, 4vw, 36px)',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            color: INK,
            marginBottom: 28,
          }}
        >
          {METHODOLOGY.heading[lang]}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-pretty"
              style={{
                fontWeight: 500,
                fontSize: 'clamp(15px, 1.6vw, 17px)',
                lineHeight: 1.7,
                color: INK_SOFT,
              }}
            >
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
