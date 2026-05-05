'use client'

// F-200 — Differentiation. Three paper cards on warm bg, 1px rule
// borders, zero shadow (editorial flatness over pastel softness).
// Disciplined 3-col grid desktop ≥920px, single column below.

import type { Lang } from '../copy'
import { DIFFERENTIATION } from '../copy'
import { ED, LETTER_SPACING, LINE_HEIGHT, SANS_FONT } from '@/lib/typography'
import RevealOnScroll from '../RevealOnScroll'

export default function DifferentiationSection({ lang }: { lang: Lang }) {
  return (
    <section
      className="w-full"
      style={{
        backgroundColor: ED.bg,
        padding: 'clamp(80px, 12vw, 140px) clamp(24px, 4vw, 64px)',
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 1280 }}>
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
              maxWidth: 920,
              margin: 0,
              marginBottom: 'clamp(40px, 5vw, 72px)',
            }}
          >
            {DIFFERENTIATION.heading[lang]}
          </h2>
        </RevealOnScroll>
        <div
          style={{
            display: 'grid',
            gap: 'clamp(16px, 2vw, 24px)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          }}
        >
          {DIFFERENTIATION.cards.map((card, i) => (
            <RevealOnScroll key={i} delay={i * 0.1}>
              <div
                style={{
                  backgroundColor: ED.paper,
                  border: `1px solid ${ED.rule}`,
                  borderRadius: 4,
                  padding: 'clamp(24px, 3vw, 40px)',
                  height: '100%',
                }}
              >
                <h3
                  style={{
                    fontFamily: SANS_FONT,
                    fontWeight: 600,
                    fontSize: '1.25rem',
                    lineHeight: 1.3,
                    letterSpacing: LETTER_SPACING.heading,
                    color: ED.fg,
                    margin: 0,
                    marginBottom: 16,
                  }}
                >
                  {card.title[lang]}
                </h3>
                <p
                  className="text-pretty"
                  style={{
                    fontFamily: SANS_FONT,
                    fontWeight: 400,
                    fontSize: '1rem',
                    lineHeight: LINE_HEIGHT.body,
                    letterSpacing: LETTER_SPACING.body,
                    color: ED.muted,
                    margin: 0,
                  }}
                >
                  {card.body[lang]}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
