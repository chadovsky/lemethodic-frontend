'use client'

// F-200 — Pricing. Three tier cards on warm bg, 1px rule borders, paper
// surface. Subscription's "Start the diagnostic" gets navy CTA (the
// product's premium signal). Sprint + Premium remain Coming-soon →
// WaitlistForm modal (no behavior change from M-101a).
//
// 4px button radius per F-200 design call (premium signal vs soft 14px
// pastel-card radius).

import { useState } from 'react'
import Link from 'next/link'
import type { Lang } from '../copy'
import { PRICING } from '../copy'
import { ED, LETTER_SPACING, LINE_HEIGHT, SANS_FONT } from '@/lib/typography'
import WaitlistForm from '../WaitlistForm'
import type { WaitlistIntent } from '../waitlist'
import RevealOnScroll from '../RevealOnScroll'

export default function PricingSection({ lang }: { lang: Lang }) {
  const [waitlistIntent, setWaitlistIntent] = useState<WaitlistIntent | null>(null)

  return (
    <section
      id="pricing"
      className="w-full"
      style={{
        backgroundColor: ED.bg,
        padding: 'clamp(80px, 12vw, 140px) clamp(24px, 4vw, 64px)',
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 1280 }}>
        <RevealOnScroll>
          <h2
            className="text-balance mx-auto"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              lineHeight: LINE_HEIGHT.heading,
              letterSpacing: LETTER_SPACING.heading,
              color: ED.fg,
              margin: 0,
              marginBottom: 'clamp(40px, 5vw, 72px)',
              maxWidth: 760,
              textAlign: 'center',
            }}
          >
            {PRICING.heading[lang]}
          </h2>
        </RevealOnScroll>

        <div
          style={{
            display: 'grid',
            gap: 'clamp(16px, 2vw, 24px)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            alignItems: 'stretch',
          }}
        >
          {PRICING.cards.map((card, i) => (
            <RevealOnScroll key={card.tier} delay={i * 0.1}>
              <article
                style={{
                  backgroundColor: ED.paper,
                  border: `1px solid ${ED.rule}`,
                  borderRadius: 4,
                  padding: 'clamp(24px, 3vw, 36px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  position: 'relative',
                  height: '100%',
                }}
              >
                {card.comingSoon && (
                  <span
                    role="status"
                    aria-label={PRICING.comingSoonBadge[lang]}
                    style={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      fontFamily: SANS_FONT,
                      fontWeight: 600,
                      fontSize: '0.6875rem',
                      color: ED.muted,
                      backgroundColor: 'transparent',
                      border: `1px solid ${ED.rule}`,
                      borderRadius: 2,
                      padding: '4px 8px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {PRICING.comingSoonBadge[lang]}
                  </span>
                )}
                <header>
                  <h3
                    style={{
                      fontFamily: SANS_FONT,
                      fontWeight: 600,
                      fontSize: '1.125rem',
                      color: ED.fg,
                      margin: 0,
                      marginBottom: 12,
                      paddingRight: card.comingSoon ? 96 : 0,
                    }}
                  >
                    {card.title[lang]}
                  </h3>
                  <p
                    style={{
                      fontFamily: SANS_FONT,
                      fontWeight: 600,
                      fontSize: '2rem',
                      lineHeight: 1.05,
                      color: ED.fg,
                      letterSpacing: LETTER_SPACING.display,
                      margin: 0,
                    }}
                  >
                    {card.price[lang]}
                  </p>
                  {card.priceSubtext && (
                    <p
                      style={{
                        fontFamily: SANS_FONT,
                        fontWeight: 400,
                        fontSize: '0.8125rem',
                        lineHeight: 1.5,
                        color: ED.muted,
                        marginTop: 8,
                        marginBottom: 0,
                      }}
                    >
                      {card.priceSubtext[lang]}
                    </p>
                  )}
                </header>

                <p
                  className="text-pretty"
                  style={{
                    fontFamily: SANS_FONT,
                    fontWeight: 400,
                    fontSize: '0.9375rem',
                    lineHeight: LINE_HEIGHT.body,
                    color: ED.muted,
                    margin: 0,
                  }}
                >
                  {card.audience[lang]}
                </p>

                <ul
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    borderTop: `1px solid ${ED.rule}`,
                    paddingTop: 16,
                  }}
                >
                  {card.bullets[lang].map((bullet, j) => (
                    <li key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span
                        aria-hidden="true"
                        style={{
                          flexShrink: 0,
                          marginTop: 9,
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          backgroundColor: ED.accent,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: SANS_FONT,
                          fontWeight: 400,
                          fontSize: '0.875rem',
                          lineHeight: 1.5,
                          color: ED.fg,
                        }}
                      >
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>

                {card.guarantee && (
                  <p
                    style={{
                      fontFamily: SANS_FONT,
                      fontWeight: 400,
                      fontSize: '0.75rem',
                      lineHeight: 1.5,
                      color: ED.muted,
                      fontStyle: 'italic',
                      margin: 0,
                    }}
                  >
                    {card.guarantee[lang]}
                  </p>
                )}

                <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                  {card.comingSoon ? (
                    <button
                      type="button"
                      onClick={() =>
                        setWaitlistIntent(
                          card.tier === 'sprint' ? 'sprint' : 'premium',
                        )
                      }
                      style={{
                        width: '100%',
                        height: 48,
                        borderRadius: 4,
                        backgroundColor: 'transparent',
                        color: ED.fg,
                        border: `1px solid ${ED.fg}`,
                        fontFamily: SANS_FONT,
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        letterSpacing: LETTER_SPACING.body,
                        cursor: 'pointer',
                        outline: 'none',
                        transition: `background-color var(--ed-duration-hover) var(--ed-ease), color var(--ed-duration-hover) var(--ed-ease)`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = ED.fg
                        e.currentTarget.style.color = ED.paper
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = ED.fg
                      }}
                    >
                      {card.ctaLabel[lang]}
                    </button>
                  ) : (
                    <Link
                      href="/onboarding"
                      style={{
                        display: 'inline-flex',
                        width: '100%',
                        height: 48,
                        borderRadius: 4,
                        backgroundColor: ED.accent,
                        color: '#FFFFFF',
                        fontFamily: SANS_FONT,
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        letterSpacing: LETTER_SPACING.body,
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                      }}
                    >
                      {card.ctaLabel[lang]}
                    </Link>
                  )}
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </div>

      {waitlistIntent && (
        <WaitlistForm
          intent={waitlistIntent}
          lang={lang}
          onClose={() => setWaitlistIntent(null)}
        />
      )}
    </section>
  )
}
