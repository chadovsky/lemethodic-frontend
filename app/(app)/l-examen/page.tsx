'use client'

import Link from 'next/link'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

const INK       = '#14213D'
const VERMILLON = '#C8102E'
const PAPER     = '#FFFFFF'
const PAPER_TINT = '#FAFAFA'
const INK_SOFT  = 'rgba(20, 33, 61, 0.62)'
const RULE      = 'rgba(20, 33, 61, 0.10)'

interface SectionCard {
  label: string
  subtitle: string
  href: string
  bientot?: boolean
}

const SECTIONS: SectionCard[] = [
  {
    label: 'Compréhension orale',
    subtitle: 'Écoute et compréhension, TCF section 1',
    href: '/l-examen/comprehension-orale',
    bientot: true,
  },
  {
    label: 'Compréhension écrite',
    subtitle: 'Lecture et compréhension, TCF section 2',
    href: '/l-examen/comprehension-ecrite',
    bientot: true,
  },
  {
    label: 'Expression orale',
    subtitle: 'Tâches 1, 2 et 3, TCF section 3',
    href: '/l-examen/expression-orale',
  },
  {
    label: 'Expression écrite',
    subtitle: 'Rédaction guidée, TCF section 4',
    href: '/l-examen/expression-ecrite',
  },
]

const SECONDARY: { label: string; href: string; bientot?: boolean }[] = [
  { label: 'Diagnostic', href: '/l-examen/diagnostic' },
  { label: 'Mock examen complet', href: '/l-examen/mock', bientot: true },
]

export default function LExamenHubPage() {
  return (
    <div
      style={{
        fontFamily: SANS_FONT,
        maxWidth: 800,
        margin: '0 auto',
        padding: '48px 0 80px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <h1
          style={{
            fontFamily: SERIF_FONT,
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 400,
            color: INK,
            margin: '0 0 12px',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          L&apos;Examen
        </h1>
        <p
          style={{
            fontSize: '1.0625rem',
            color: INK_SOFT,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Pratiquez les quatre sections du TCF Canada en format examen.
        </p>
      </div>

      {/* 2x2 section grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                backgroundColor: INK,
                borderRadius: 8,
                padding: '28px 24px',
                position: 'relative',
                transition: 'opacity 120ms ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '0.88' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '1' }}
            >
              {s.bientot && (
                <span
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    backgroundColor: VERMILLON,
                    color: PAPER,
                    fontFamily: SANS_FONT,
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    borderRadius: 4,
                  }}
                >
                  Bientôt
                </span>
              )}
              <p
                style={{
                  fontFamily: SERIF_FONT,
                  fontSize: '1.25rem',
                  fontWeight: 400,
                  color: PAPER,
                  margin: '0 0 8px',
                  lineHeight: 1.2,
                  paddingRight: s.bientot ? 80 : 0,
                }}
              >
                {s.label}
              </p>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'rgba(255,255,255,0.62)',
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {s.subtitle}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Divider */}
      <div style={{ borderTop: `1px solid ${RULE}`, marginBottom: 24 }} />

      {/* Secondary actions row */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {SECONDARY.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: PAPER_TINT,
                border: `1px solid ${RULE}`,
                borderRadius: 6,
                padding: '10px 16px',
                transition: 'background-color 120ms ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#F0F0F2' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = PAPER_TINT }}
            >
              <span
                style={{
                  fontFamily: SANS_FONT,
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: INK,
                }}
              >
                {item.label}
              </span>
              {item.bientot && (
                <span
                  style={{
                    backgroundColor: VERMILLON,
                    color: PAPER,
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: 3,
                  }}
                >
                  Bientôt
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
