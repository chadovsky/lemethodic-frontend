'use client'

// M-101a — Section 5, pricing. Three tier cards: Subscription (active),
// Sprint ("Coming soon" + waitlist), Premium ("Coming soon" + waitlist).
// Subscription CTA → /onboarding. Sprint/Premium CTAs → WaitlistForm modal.

import { useState } from 'react'
import Link from 'next/link'
import type { Lang } from '../copy'
import { PRICING } from '../copy'
import {
  DISPLAY_FONT,
  INK,
  INK_SOFT,
  INK_MUTED,
  PAPER,
} from '../../onboarding/OnboardingScreen'
import WaitlistForm from '../WaitlistForm'
import type { WaitlistIntent } from '../waitlist'

const BG = '#FAFAF7' // --fp-canvas

export default function PricingSection({ lang }: { lang: Lang }) {
  const [waitlistIntent, setWaitlistIntent] = useState<WaitlistIntent | null>(null)

  return (
    <section
      id="pricing"
      className="w-full"
      style={{ backgroundColor: BG, padding: '72px 24px 80px' }}
    >
      <div className="mx-auto" style={{ maxWidth: 1080 }}>
        <h2
          className="text-balance mx-auto"
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 800,
            fontSize: 'clamp(28px, 4vw, 40px)',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            color: INK,
            marginBottom: 36,
            maxWidth: 760,
            textAlign: 'center',
          }}
        >
          {PRICING.heading[lang]}
        </h2>

        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            alignItems: 'stretch',
          }}
        >
          {PRICING.cards.map((card) => (
            <article
              key={card.tier}
              style={{
                backgroundColor: PAPER,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRadius: 24,
                padding: '24px 24px 24px',
                boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                position: 'relative',
              }}
            >
              {card.comingSoon && (
                <span
                  role="status"
                  aria-label={PRICING.comingSoonBadge[lang]}
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 700,
                    fontSize: 11,
                    color: '#FFFFFF',
                    backgroundColor: INK,
                    borderRadius: 999,
                    padding: '4px 10px',
                    lineHeight: '14px',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {PRICING.comingSoonBadge[lang]}
                </span>
              )}
              <header>
                <h3
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 700,
                    fontSize: 18,
                    color: INK,
                    marginBottom: 8,
                    paddingRight: card.comingSoon ? 80 : 0,
                  }}
                >
                  {card.title[lang]}
                </h3>
                <p
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 800,
                    fontSize: 28,
                    lineHeight: 1.1,
                    color: INK,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {card.price[lang]}
                </p>
                {card.priceSubtext && (
                  <p
                    style={{
                      fontWeight: 500,
                      fontSize: 12,
                      lineHeight: 1.5,
                      color: INK_MUTED,
                      marginTop: 4,
                    }}
                  >
                    {card.priceSubtext[lang]}
                  </p>
                )}
              </header>

              <p
                className="text-pretty"
                style={{
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: INK_SOFT,
                }}
              >
                {card.audience[lang]}
              </p>

              <ul
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                }}
              >
                {card.bullets[lang].map((bullet, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                      style={{ marginTop: 4, flexShrink: 0 }}
                    >
                      <circle cx="8" cy="8" r="8" fill={INK} />
                      <path
                        d="M4.5 8.2L6.8 10.5L11.2 5.5"
                        stroke="white"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.5, color: INK }}>
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>

              {card.guarantee && (
                <p
                  style={{
                    fontWeight: 500,
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: INK_MUTED,
                    fontStyle: 'italic',
                    marginTop: 4,
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
                      borderRadius: 14,
                      backgroundColor: INK,
                      color: '#FFFFFF',
                      fontFamily: DISPLAY_FONT,
                      fontWeight: 700,
                      fontSize: 14,
                      letterSpacing: '-0.01em',
                      border: 'none',
                      cursor: 'pointer',
                      outline: 'none',
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
                      borderRadius: 14,
                      backgroundColor: INK,
                      color: '#FFFFFF',
                      fontFamily: DISPLAY_FONT,
                      fontWeight: 700,
                      fontSize: 14,
                      letterSpacing: '-0.01em',
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
