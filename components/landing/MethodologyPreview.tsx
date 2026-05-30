import Link from 'next/link'
import { SANS_FONT } from '@/lib/typography'
import RevealOnScroll from '@/components/landing/RevealOnScroll'
import CouchesLayer from './CouchesLayer'

const COUCHES = [
  {
    name: "Le Propos",
    description:
      "The structural backbone of every oral response: a clear position, developed argument, and grounded conclusion.",
    backgroundColor: 'var(--paper)',
    accentColor: 'var(--lm-pastel-peach)',
    nameColor: 'var(--dominant)',
  },
  {
    name: "Le Plan",
    description:
      "Ready-made idea frameworks that let you generate relevant content instantly, without relying on memorized topics.",
    backgroundColor: 'var(--paper-edge)',
    accentColor: 'var(--lm-pastel-sage)',
    nameColor: 'var(--dominant)',
  },
  {
    name: "La Construction",
    description:
      "Sentence-level grammar templates that package your ideas into natural, examiner-recognized French structures.",
    backgroundColor: 'var(--paper)',
    accentColor: 'var(--lm-pastel-butter)',
    nameColor: 'var(--dominant)',
  },
  {
    name: "Les Pièges Anglais",
    description:
      "A targeted inventory of anglophone interference patterns: the syntax, register, and reflex traps that cost English speakers points.",
    backgroundColor: 'var(--paper-edge)',
    accentColor: 'var(--lm-pastel-lavender)',
    nameColor: 'var(--accent)',
  },
  {
    name: "La Musique",
    description:
      "Prosody, pacing, and hesitation management: the delivery layer that carries your method into the examiner scoring grid.",
    backgroundColor: 'var(--paper)',
    accentColor: 'var(--lm-pastel-sky)',
    nameColor: 'var(--dominant)',
  },
]

export default function MethodologyPreview() {
  return (
    <section
      aria-labelledby="methodology-heading"
      style={{
        backgroundColor: 'var(--bg-canvas)',
        borderTop: '1px solid var(--rule-default)',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding:
            'clamp(64px, 10vw, 120px) clamp(24px, 5vw, 80px) clamp(32px, 4vw, 48px)',
        }}
      >
        <RevealOnScroll>
          <h2
            id="methodology-heading"
            className="text-balance"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
              lineHeight: 1.2,
              letterSpacing: '-0.015em',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            The 5-Couche Method
          </h2>
        </RevealOnScroll>
      </div>

      <div data-testid="couches-stack">
        {COUCHES.map((couche, i) => (
          <RevealOnScroll key={couche.name} delay={i * 0.05}>
            <CouchesLayer
              number={i + 1}
              name={couche.name}
              description={couche.description}
              backgroundColor={couche.backgroundColor}
              accentColor={couche.accentColor}
              nameColor={couche.nameColor}
            />
          </RevealOnScroll>
        ))}
      </div>

      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding:
            'clamp(32px, 4vw, 48px) clamp(24px, 5vw, 80px) clamp(64px, 10vw, 120px)',
        }}
      >
        <Link
          href="/method"
          className="ed-btn-press"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 56,
            padding: '0 36px',
            borderRadius: 4,
            backgroundColor: 'var(--cta-primary)',
            color: '#ffffff',
            fontFamily: SANS_FONT,
            fontWeight: 600,
            fontSize: '1rem',
            letterSpacing: '0',
            textDecoration: 'none',
          }}
        >
          See how it works
        </Link>
      </div>
    </section>
  )
}
