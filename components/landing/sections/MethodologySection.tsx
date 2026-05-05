'use client'

// F-227 — compressed methodology breakout on landing. Reuses the F-202
// /ecole/intro Section 2 framework in glance-form: 5 couches as one-line
// entries, not the deep stacked-blocks treatment. Pure typography — no
// illustration, no icons, no CTA. The deep version lives behind signup
// at /ecole/intro; this is the public-side compression.
//
// Placement: after DifferentiationSection, before HowItWorksSection. F-227
// reordered LandingPage.tsx to put it at the structural moment when a
// visitor is asking "but how is this different from drill platforms?"

import type { Lang } from '../copy'
import { METHODOLOGY } from '../copy'
import { ED, SANS_FONT, SERIF_FONT } from '@/lib/typography'
import RevealOnScroll from '../RevealOnScroll'

export default function MethodologySection({ lang }: { lang: Lang }) {
  return (
    <section
      className="w-full"
      style={{
        backgroundColor: ED.bg,
        borderTop: `1px solid ${ED.rule}`,
        padding: 'clamp(64px, 10vw, 160px) clamp(24px, 4vw, 64px)',
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 720 }}>
        {/* Heading — Source Serif 4 italic ed-accent navy */}
        <RevealOnScroll>
          <h2
            className="text-balance"
            style={{
              fontFamily: SERIF_FONT,
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(2.5rem, 5.5vw, 4rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.015em',
              color: ED.accent,
              margin: 0,
            }}
          >
            {METHODOLOGY.heading[lang]}
          </h2>
        </RevealOnScroll>

        {/* Intro framing line — Source Serif 4 italic ed-muted */}
        <RevealOnScroll delay={0.08}>
          <p
            className="text-balance"
            style={{
              fontFamily: SERIF_FONT,
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
              lineHeight: 1.5,
              color: ED.muted,
              margin: 0,
              marginTop: 'clamp(20px, 2vw, 28px)',
              maxWidth: 720,
            }}
          >
            {METHODOLOGY.intro[lang]}
          </p>
        </RevealOnScroll>

        {/* Five couches — vertical list, single line each. Em-dash separator
            between name (Geist 600) and description (Geist 400). Kept
            tighter than F-202's 80-120px because this is glance-section. */}
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            marginTop: 'clamp(48px, 6vw, 72px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(20px, 2.5vw, 32px)',
          }}
        >
          {METHODOLOGY.couches.map((c, i) => (
            <li key={c.name[lang]}>
              <RevealOnScroll delay={0.16 + i * 0.08}>
                <p
                  style={{
                    fontFamily: SANS_FONT,
                    fontWeight: 400,
                    fontSize: 'clamp(1.125rem, 1.6vw, 1.5rem)',
                    lineHeight: 1.5,
                    color: ED.fg,
                    margin: 0,
                  }}
                >
                  <strong style={{ fontWeight: 600 }}>{c.name[lang]}</strong>
                  {/* FR uses ` : ` (non-breaking space + colon) per
                      typographic convention; EN uses `: ` */}
                  {lang === 'fr' ? ' : ' : ': '}
                  {c.description[lang]}
                </p>
              </RevealOnScroll>
            </li>
          ))}
        </ul>

        {/* 1px ed-rule full-bleed below couches */}
        <RevealOnScroll delay={0.16 + METHODOLOGY.couches.length * 0.08 + 0.1}>
          <div
            aria-hidden="true"
            style={{
              marginTop: 'clamp(48px, 6vw, 72px)',
              borderTop: `1px solid ${ED.rule}`,
            }}
          />
        </RevealOnScroll>

        {/* Closer kicker — Source Serif 4 italic ed-fg, centered */}
        <RevealOnScroll delay={0.16 + METHODOLOGY.couches.length * 0.08 + 0.2}>
          <p
            className="text-balance"
            style={{
              fontFamily: SERIF_FONT,
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(1.375rem, 2.2vw, 1.625rem)',
              lineHeight: 1.45,
              color: ED.fg,
              margin: 0,
              marginTop: 'clamp(48px, 6vw, 72px)',
              textAlign: 'center',
              maxWidth: 720,
            }}
          >
            {METHODOLOGY.closer[lang]}
          </p>
        </RevealOnScroll>
      </div>
    </section>
  )
}
