'use client'

// M-101a — Section 2, the problem. Off-white canvas; long-form text with
// generous line-height for the diagnosis-style paragraphs.

import type { Lang } from '../copy'
import { PROBLEM } from '../copy'
import { DISPLAY_FONT, INK, INK_SOFT } from '../../onboarding/OnboardingScreen'

const BG = '#FAFAF7' // --fp-canvas

export default function ProblemSection({ lang }: { lang: Lang }) {
  const paragraphs = PROBLEM.paragraphs[lang]
  return (
    <section
      className="w-full"
      style={{ backgroundColor: BG, padding: '64px 24px 72px' }}
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
          {PROBLEM.heading[lang]}
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
                color: i === paragraphs.length - 1 ? INK : INK_SOFT,
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
