import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

const INK       = '#14213D'
const VERMILLON = '#C8102E'
const INK_SOFT  = 'rgba(20, 33, 61, 0.62)'
const PAPER     = '#FFFFFF'
const RULE      = 'rgba(20, 33, 61, 0.10)'

export const metadata = {
  title: "Mock examen complet | L'Examen | Le Méthodic",
}

export default function MockExamenPage() {
  return (
    <div
      style={{
        fontFamily: SANS_FONT,
        maxWidth: 760,
        margin: '0 auto',
        padding: '48px 0 80px',
      }}
    >
      <h1
        style={{
          fontFamily: SERIF_FONT,
          fontStyle: 'italic',
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 400,
          color: INK,
          margin: '0 0 10px',
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
        }}
      >
        Mock examen complet
      </h1>
      <p
        style={{
          fontSize: '1.0625rem',
          color: INK_SOFT,
          margin: '0 0 40px',
          lineHeight: 1.5,
        }}
      >
        Simulation des quatre sections du TCF Canada en conditions réelles.
      </p>

      <div
        style={{
          backgroundColor: PAPER,
          border: `1px solid ${RULE}`,
          borderRadius: 8,
          padding: '32px 28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <span
            style={{
              backgroundColor: VERMILLON,
              color: PAPER,
              fontFamily: SANS_FONT,
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              padding: '4px 10px',
              borderRadius: 4,
            }}
          >
            Bientôt disponible
          </span>
        </div>
        <p
          style={{
            fontSize: '0.9375rem',
            fontWeight: 500,
            color: INK,
            margin: '0 0 16px',
          }}
        >
          Le mock examen complet sera disponible prochainement.
        </p>
        <p
          style={{
            fontSize: '0.875rem',
            color: INK_SOFT,
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Le mock inclura les quatre sections du TCF Canada en conditions
          chronométrées: compréhension orale (35 minutes), compréhension
          écrite (60 minutes), expression écrite (60 minutes), expression
          orale (12 minutes). Résultats et analyse détaillée à l&apos;issue
          de chaque session.
        </p>
      </div>
    </div>
  )
}
