'use client'

// F-200 — Final CTA. Echoes hero typography but adds a primary CTA (the
// hero deliberately had none — trust the user to scroll). The trust-line
// rescued from the deleted hero CTA appears here as a caption under the
// CTA, where it actually earns its placement next to the primary action.
//
// Section bg flips to paper for visual emphasis — this is the conversion
// moment, distinct from the warm-bg sections above.

import Link from 'next/link'
import type { Lang } from '../copy'
import { FINAL_CTA } from '../copy'
import { ED, LETTER_SPACING, LINE_HEIGHT, SANS_FONT } from '@/lib/typography'
import RevealOnScroll from '../RevealOnScroll'

export default function FinalCTASection({ lang }: { lang: Lang }) {
  return (
    <section
      className="w-full"
      style={{
        // F-227.rhythm — flipped from ed-paper to ed-bg. Paired with FAQ
        // bg→paper flip to land the post-F-227 rhythm Pricing(bg) →
        // FAQ(paper) → FinalCTA(bg) → Footer. Restores F-214 alternation.
        backgroundColor: ED.bg,
        padding: 'clamp(96px, 14vw, 160px) clamp(24px, 4vw, 64px)',
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 720, textAlign: 'center' }}>
        <RevealOnScroll>
          <h2
            className="text-balance"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
              lineHeight: LINE_HEIGHT.display,
              letterSpacing: LETTER_SPACING.display,
              color: ED.fg,
              margin: '0 auto',
              marginBottom: 'clamp(20px, 2.5vw, 28px)',
              // V-011 — explicit center as a defensive belt-and-suspenders
              // (parent already has textAlign:center but the H2 perception
              // on production read off-center). margin:0 auto + maxWidth
              // + textAlign:center together remove any inheritance gap.
              textAlign: 'center',
              maxWidth: 640,
            }}
          >
            {FINAL_CTA.heading[lang]}
          </h2>
        </RevealOnScroll>
        <RevealOnScroll delay={0.1}>
          <p
            className="text-pretty"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 400,
              fontSize: 'clamp(1rem, 1.5vw, 1.1875rem)',
              lineHeight: LINE_HEIGHT.body,
              letterSpacing: LETTER_SPACING.body,
              color: ED.muted,
              margin: '0 auto',
              marginBottom: 'clamp(32px, 4vw, 48px)',
              maxWidth: 600,
              textAlign: 'center',
            }}
          >
            {FINAL_CTA.body[lang]}
          </p>
        </RevealOnScroll>
        <RevealOnScroll delay={0.2}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            <Link
              href="/onboarding"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 56,
                padding: '0 32px',
                borderRadius: 4,
                backgroundColor: ED.accent,
                color: '#FFFFFF',
                fontFamily: SANS_FONT,
                fontWeight: 600,
                fontSize: '1rem',
                letterSpacing: LETTER_SPACING.body,
                textDecoration: 'none',
              }}
            >
              {FINAL_CTA.ctaPrimary[lang]}
            </Link>
            {/* Trust-line under the primary action. V-007 — removed the
                stray "Free." suffix that was being concatenated from
                HERO.ctaSecondary.split('.')[0]; FINAL_CTA.ctaSecondary
                already starts with "Free." so the suffix duplicated it. */}
            <span
              style={{
                fontFamily: SANS_FONT,
                fontWeight: 400,
                fontSize: '0.875rem',
                lineHeight: 1.5,
                color: ED.muted,
              }}
            >
              {FINAL_CTA.ctaSecondary[lang]}
            </span>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
