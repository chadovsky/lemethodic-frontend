'use client'

// M-101a — Section 4, how it works. Butter bg, three numbered steps. The
// numbered circles double as visual anchors; no illustrations needed.

import type { Lang } from '../copy'
import { HOW_IT_WORKS } from '../copy'
import { DISPLAY_FONT, INK, INK_SOFT } from '../../onboarding/OnboardingScreen'

const BG = '#FFF0C2' // --fp-butter

export default function HowItWorksSection({ lang }: { lang: Lang }) {
  return (
    <section
      className="w-full"
      style={{ backgroundColor: BG, padding: '72px 24px 80px' }}
    >
      <div className="mx-auto" style={{ maxWidth: 760 }}>
        <h2
          className="text-balance"
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 800,
            fontSize: 'clamp(26px, 4vw, 36px)',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            color: INK,
            marginBottom: 32,
          }}
        >
          {HOW_IT_WORKS.heading[lang]}
        </h2>
        <ol
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}
        >
          {HOW_IT_WORKS.steps.map((step, i) => (
            <li key={i} style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
              <div
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: INK,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 800,
                  fontSize: 18,
                }}
              >
                {i + 1}
              </div>
              <div style={{ flex: 1, paddingTop: 4 }}>
                <h3
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 700,
                    fontSize: 18,
                    lineHeight: 1.3,
                    color: INK,
                    marginBottom: 8,
                  }}
                >
                  {step.title[lang]}
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
                  {step.body[lang]}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
