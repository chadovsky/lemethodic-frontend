'use client'

// F-200 — How it works. Three numbered steps as typographic lock-ups
// (oversized 01/02/03 numerals + label + body) instead of decorated
// circles. Editorial restraint: the numbers ARE the visual anchor.
// Vertical stack, narrow column.

import type { Lang } from '../copy'
import { HOW_IT_WORKS } from '../copy'
import { ED, LETTER_SPACING, LINE_HEIGHT, SANS_FONT, SERIF_FONT } from '@/lib/typography'
import RevealOnScroll from '../RevealOnScroll'

const STEP_NUMS = ['01', '02', '03']

export default function HowItWorksSection({ lang }: { lang: Lang }) {
  return (
    <section
      className="w-full"
      style={{
        backgroundColor: ED.bg,
        padding: 'clamp(80px, 12vw, 140px) clamp(24px, 4vw, 64px)',
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 920 }}>
        <RevealOnScroll>
          <h2
            className="text-balance"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: 'clamp(1.75rem, 3.5vw, 3rem)',
              lineHeight: LINE_HEIGHT.heading,
              letterSpacing: LETTER_SPACING.heading,
              color: ED.fg,
              margin: 0,
              marginBottom: 'clamp(48px, 6vw, 80px)',
            }}
          >
            {HOW_IT_WORKS.heading[lang]}
          </h2>
        </RevealOnScroll>
        <ol
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(40px, 5vw, 72px)',
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}
        >
          {HOW_IT_WORKS.steps.map((step, i) => (
            <RevealOnScroll key={i} delay={i * 0.12}>
              <li
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(80px, 120px) 1fr',
                  gap: 'clamp(20px, 3vw, 40px)',
                  alignItems: 'baseline',
                  borderTop: `1px solid ${ED.rule}`,
                  paddingTop: 'clamp(24px, 3vw, 40px)',
                }}
              >
                {/* Numeral — Source Serif for editorial accent */}
                <span
                  aria-hidden="true"
                  style={{
                    fontFamily: SERIF_FONT,
                    fontWeight: 400,
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    lineHeight: 1,
                    letterSpacing: LETTER_SPACING.display,
                    color: ED.accent,
                  }}
                >
                  {STEP_NUMS[i]}
                </span>
                <div>
                  <h3
                    style={{
                      fontFamily: SANS_FONT,
                      fontWeight: 600,
                      fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
                      lineHeight: LINE_HEIGHT.heading,
                      letterSpacing: LETTER_SPACING.heading,
                      color: ED.fg,
                      margin: 0,
                      marginBottom: 12,
                    }}
                  >
                    {step.title[lang]}
                  </h3>
                  <p
                    className="text-pretty"
                    style={{
                      fontFamily: SANS_FONT,
                      fontWeight: 400,
                      fontSize: '1.0625rem',
                      lineHeight: LINE_HEIGHT.body,
                      letterSpacing: LETTER_SPACING.body,
                      color: ED.muted,
                      margin: 0,
                    }}
                  >
                    {step.body[lang]}
                  </p>
                </div>
              </li>
            </RevealOnScroll>
          ))}
        </ol>
      </div>
    </section>
  )
}
