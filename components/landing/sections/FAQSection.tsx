'use client'

// F-200 — FAQ. Native <details>/<summary> with editorial chrome:
// 1px ed-rule top border per item, ed-fg heading, ed-muted answer,
// no card surface (text-on-bg). Plus icon rotates 45° → 0° via CSS.

import type { Lang } from '../copy'
import { FAQ } from '../copy'
import { ED, LETTER_SPACING, LINE_HEIGHT, SANS_FONT } from '@/lib/typography'
import RevealOnScroll from '../RevealOnScroll'

export default function FAQSection({ lang }: { lang: Lang }) {
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
              marginBottom: 'clamp(40px, 5vw, 64px)',
            }}
          >
            {FAQ.heading[lang]}
          </h2>
        </RevealOnScroll>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {FAQ.items.map((item, i) => (
            <RevealOnScroll key={i} delay={i * 0.06}>
              <details
                style={{
                  borderTop: `1px solid ${ED.rule}`,
                  borderBottom: i === FAQ.items.length - 1 ? `1px solid ${ED.rule}` : 'none',
                  padding: 'clamp(20px, 2.5vw, 32px) 0',
                }}
              >
                <summary
                  style={{
                    fontFamily: SANS_FONT,
                    fontWeight: 500,
                    fontSize: 'clamp(1.0625rem, 1.5vw, 1.25rem)',
                    lineHeight: LINE_HEIGHT.heading,
                    color: ED.fg,
                    cursor: 'pointer',
                    listStyle: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 24,
                    outline: 'none',
                  }}
                >
                  <span>{item.question[lang]}</span>
                  <span
                    aria-hidden="true"
                    style={{
                      flexShrink: 0,
                      width: 24,
                      height: 24,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: ED.muted,
                      fontWeight: 400,
                      fontSize: '1.5rem',
                      lineHeight: 1,
                    }}
                  >
                    +
                  </span>
                </summary>
                <p
                  className="text-pretty"
                  style={{
                    marginTop: 16,
                    marginBottom: 0,
                    fontFamily: SANS_FONT,
                    fontWeight: 400,
                    fontSize: '1rem',
                    lineHeight: LINE_HEIGHT.body,
                    letterSpacing: LETTER_SPACING.body,
                    color: ED.muted,
                    maxWidth: 720,
                  }}
                >
                  {item.answer[lang]}
                </p>
              </details>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
