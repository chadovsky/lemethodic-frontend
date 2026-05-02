'use client'

// M-101a — Section 7, FAQ. Sky bg; native <details>/<summary> for keyboard
// accessibility without dragging in a heavy accordion library. shadcn's
// Accordion is available but adds Radix runtime weight that's not justified
// for 5 plain Q&A items.

import type { Lang } from '../copy'
import { FAQ } from '../copy'
import { DISPLAY_FONT, INK, INK_SOFT, INK_MUTED } from '../../onboarding/OnboardingScreen'

const BG = '#CFE4F5' // --fp-sky

export default function FAQSection({ lang }: { lang: Lang }) {
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
          {FAQ.heading[lang]}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQ.items.map((item, i) => (
            <details
              key={i}
              style={{
                backgroundColor: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRadius: 16,
                padding: '16px 20px',
                cursor: 'pointer',
              }}
            >
              <summary
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 15,
                  lineHeight: 1.4,
                  color: INK,
                  cursor: 'pointer',
                  listStyle: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  outline: 'none',
                }}
              >
                <span>{item.question[lang]}</span>
                <span
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    fontWeight: 800,
                    fontSize: 18,
                    color: INK_MUTED,
                  }}
                >
                  +
                </span>
              </summary>
              <p
                className="text-pretty"
                style={{
                  marginTop: 12,
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: INK_SOFT,
                }}
              >
                {item.answer[lang]}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
