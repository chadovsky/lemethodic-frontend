import { SANS_FONT } from '@/lib/typography'
import RevealOnScroll from '@/components/landing/RevealOnScroll'
import ExamSpecificIcon from './icons/ExamSpecificIcon'
import EnglishSpeakersIcon from './icons/EnglishSpeakersIcon'
import MethodBasedIcon from './icons/MethodBasedIcon'
import type { ComponentType } from 'react'

interface Column {
  Icon: ComponentType
  heading: string
  body: string
}

const COLUMNS: Column[] = [
  {
    Icon: ExamSpecificIcon,
    heading: 'TCF Canada-specific',
    body: 'Built around the TCF Canada speaking tasks — not generic French exam prep that misses what Quebec immigration actually tests.',
  },
  {
    Icon: EnglishSpeakersIcon,
    heading: 'Built for English speakers',
    body: 'The 5-couche method surfaces Les Réflexes Anglais — the layer that catches the interference patterns native English speakers hit at B1.',
  },
  {
    Icon: MethodBasedIcon,
    heading: 'Method, not memorization',
    body: 'Structured oral production frameworks you can deploy under exam pressure — not vocabulary lists you forget overnight.',
  },
]

export default function PersonaMatch() {
  return (
    <section
      aria-labelledby="persona-heading"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderTop: '1px solid var(--rule-default)',
        padding: 'clamp(64px, 10vw, 120px) clamp(24px, 5vw, 80px)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <h2
          id="persona-heading"
          className="text-balance"
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 600,
            fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
            lineHeight: 1.2,
            letterSpacing: '-0.015em',
            color: 'var(--text-primary)',
            margin: 0,
            marginBottom: 'clamp(40px, 6vw, 64px)',
          }}
        >
          Built for visa-urgent anglophone candidates
        </h2>

        <div
          data-testid="persona-columns"
          className="grid grid-cols-1 lg:grid-cols-3"
          style={{ gap: 'clamp(32px, 4vw, 48px)' }}
        >
          {COLUMNS.map(({ Icon, heading, body }, idx) => (
            <RevealOnScroll key={heading} delay={idx * 0.1}>
              <div data-testid="persona-column">
                <div
                  data-testid={`persona-icon-${idx + 1}`}
                  style={{
                    color: 'var(--accent-primary)',
                    marginBottom: 20,
                  }}
                >
                  <Icon />
                </div>
                <h3
                  style={{
                    fontFamily: SANS_FONT,
                    fontWeight: 600,
                    fontSize: 'clamp(1rem, 1.4vw, 1.125rem)',
                    lineHeight: 1.3,
                    letterSpacing: '-0.01em',
                    color: 'var(--text-primary)',
                    margin: 0,
                    marginBottom: 10,
                  }}
                >
                  {heading}
                </h3>
                <p
                  style={{
                    fontFamily: SANS_FONT,
                    fontWeight: 400,
                    fontSize: '0.9375rem',
                    lineHeight: 1.6,
                    color: 'var(--text-muted)',
                    margin: 0,
                  }}
                >
                  {body}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
