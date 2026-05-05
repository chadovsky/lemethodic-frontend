'use client'

// F-200 — Methodology. Surfaces "Les Moules" + "La Méthode en Couches"
// as named system concepts (brief in-line reframe — full sub-section
// breakout filed as F-227, copy-authoring task). Editorial: serif accent
// on the heading, body in sans, narrow column for reading rhythm.
//
// Markdown-style **bold** in copy.ts is parsed and rendered as <strong>.
// Light-touch parser since copy is FE-authored and only uses **bold**
// (no other markdown). If methodology copy ever gets richer, swap to
// react-markdown.

import type { Lang } from '../copy'
import { METHODOLOGY } from '../copy'
import { ED, LETTER_SPACING, LINE_HEIGHT, SANS_FONT, SERIF_FONT } from '@/lib/typography'
import RevealOnScroll from '../RevealOnScroll'

// Tiny **bold** parser — splits on **...** segments and emits <strong>.
// Doesn't handle nesting or other markdown; that's intentional (kept
// scoped to this surface).
function renderBoldSegments(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong
          key={i}
          style={{
            fontFamily: SERIF_FONT,
            fontWeight: 600,
            color: ED.accent,
            fontStyle: 'italic',
          }}
        >
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

export default function MethodologySection({ lang }: { lang: Lang }) {
  const paragraphs = METHODOLOGY.paragraphs[lang]
  return (
    <section
      className="w-full"
      style={{
        backgroundColor: ED.paper,
        borderTop: `1px solid ${ED.rule}`,
        borderBottom: `1px solid ${ED.rule}`,
        padding: 'clamp(80px, 12vw, 140px) clamp(24px, 4vw, 64px)',
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 720 }}>
        <RevealOnScroll>
          {/* Eyebrow signaling this is the methodology evidence section */}
          <p
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: '0.875rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: ED.accent,
              margin: 0,
              marginBottom: 24,
            }}
          >
            {lang === 'fr' ? 'La méthode' : 'The method'}
          </p>
        </RevealOnScroll>
        <RevealOnScroll delay={0.08}>
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
              marginBottom: 'clamp(32px, 4vw, 48px)',
            }}
          >
            {METHODOLOGY.heading[lang]}
          </h2>
        </RevealOnScroll>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(20px, 2.5vw, 28px)' }}>
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
                {renderBoldSegments(p)}
              </p>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
