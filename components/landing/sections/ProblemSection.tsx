'use client'

// F-200 — Problem. Text-led, no card chrome. Generous line-height, narrow
// column for editorial reading rhythm. Last paragraph emphasized via
// fg-not-muted color to land the conclusion ("That's what Le Méthodic does.").

import type { Lang } from '../copy'
import { PROBLEM } from '../copy'
import { ED, LETTER_SPACING, LINE_HEIGHT, SANS_FONT } from '@/lib/typography'
import RevealOnScroll from '../RevealOnScroll'

export default function ProblemSection({ lang }: { lang: Lang }) {
  const paragraphs = PROBLEM.paragraphs[lang]
  return (
    <section
      className="w-full"
      style={{
        backgroundColor: ED.bg,
        padding: 'clamp(80px, 12vw, 140px) clamp(24px, 4vw, 64px)',
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 720 }}>
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
              marginBottom: 'clamp(24px, 3vw, 40px)',
            }}
          >
            {PROBLEM.heading[lang]}
          </h2>
        </RevealOnScroll>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 2vw, 24px)' }}>
          {paragraphs.map((p, i) => (
            <RevealOnScroll key={i} delay={i * 0.08}>
              <p
                className="text-pretty"
                style={{
                  fontFamily: SANS_FONT,
                  fontWeight: 400,
                  fontSize: 'clamp(1rem, 1.4vw, 1.125rem)',
                  lineHeight: LINE_HEIGHT.body,
                  letterSpacing: LETTER_SPACING.body,
                  color: i === paragraphs.length - 1 ? ED.fg : ED.muted,
                  margin: 0,
                }}
              >
                {p}
              </p>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
