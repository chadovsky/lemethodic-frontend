// F-214 — testimonial card design pattern. Not wired to data yet —
// no testimonial section exists on landing today (M-101 explicitly
// excluded testimonials from launch per "What's NOT here" doc note #7).
// Filed for use when post-soft-beta beta cohort quotes land.
//
// Pattern per F-214 spec: serif headline (Source Serif italic, ed-accent),
// ed-accent left rule, generous padding, ed-paper bg with 1px ed-rule.
// Editorial restraint — no avatar circles, no star ratings, no quote
// marks. Just the words.

import { ED, LETTER_SPACING, LINE_HEIGHT, SANS_FONT, SERIF_FONT } from '@/lib/typography'

export interface TestimonialCardProps {
  quote: string
  attribution: string         // e.g., "Aïcha B., TCF Canada B2 reached"
  examContext?: string        // optional secondary line (e.g., "Express Entry, scored CLB 9")
}

export default function TestimonialCard({
  quote,
  attribution,
  examContext,
}: TestimonialCardProps) {
  return (
    <article
      className="ed-card-lift"
      style={{
        backgroundColor: ED.paper,
        border: `1px solid ${ED.rule}`,
        borderLeft: `3px solid ${ED.accent}`,
        borderRadius: 4,
        padding: 'clamp(28px, 4vw, 48px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <p
        className="text-pretty"
        style={{
          fontFamily: SERIF_FONT,
          fontWeight: 400,
          fontStyle: 'italic',
          fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
          lineHeight: LINE_HEIGHT.heading,
          letterSpacing: LETTER_SPACING.heading,
          color: ED.fg,
          margin: 0,
        }}
      >
        {quote}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <p
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 600,
            fontSize: 14,
            color: ED.fg,
            margin: 0,
          }}
        >
          {attribution}
        </p>
        {examContext && (
          <p
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 400,
              fontSize: 13,
              color: ED.muted,
              margin: 0,
            }}
          >
            {examContext}
          </p>
        )}
      </div>
    </article>
  )
}
