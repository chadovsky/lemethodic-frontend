import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

const INK      = 'var(--dominant)'
const INK_SOFT = 'rgba(20, 33, 61, 0.62)'
const PAPER    = '#FFFFFF'
const RULE     = 'rgba(20, 33, 61, 0.10)'

const PLACEHOLDER_EXERCISES = [
  { label: 'Documents sonores courts', desc: '30 secondes, QCM' },
  { label: 'Documents sonores longs', desc: '3 à 5 minutes, QCM' },
  { label: 'Monologues et dialogues', desc: 'Compréhension contextuelle' },
  { label: 'Annonces et messages', desc: "Repérage d'informations" },
]

export const metadata = {
  title: "Compréhension orale | L'Examen | Le Méthodic",
}

export default function ComprehensionOralePage() {
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
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 400,
          color: INK,
          margin: '0 0 10px',
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
        }}
      >
        Compréhension orale
      </h1>
      <p
        style={{
          fontSize: '1.0625rem',
          color: INK_SOFT,
          margin: '0 0 40px',
          lineHeight: 1.5,
        }}
      >
        TCF Canada section 1: écoute et compréhension.
      </p>

      {/* Development notice */}
      <div
        style={{
          backgroundColor: PAPER,
          border: `1px solid ${RULE}`,
          borderRadius: 8,
          padding: '24px 28px',
          marginBottom: 32,
        }}
      >
        <p
          style={{
            fontSize: '0.9375rem',
            color: INK,
            margin: 0,
            fontWeight: 500,
          }}
        >
          Cette section est en cours de développement.
        </p>
        <p
          style={{
            fontSize: '0.875rem',
            color: INK_SOFT,
            margin: '6px 0 0',
          }}
        >
          Les exercices de compréhension orale seront disponibles prochainement.
        </p>
      </div>

      {/* Placeholder exercise cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 12,
        }}
      >
        {PLACEHOLDER_EXERCISES.map((ex) => (
          <div
            key={ex.label}
            style={{
              backgroundColor: PAPER,
              border: `1px solid ${RULE}`,
              borderRadius: 6,
              padding: '20px 20px',
              opacity: 0.48,
            }}
          >
            <p
              style={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: INK,
                margin: '0 0 4px',
              }}
            >
              {ex.label}
            </p>
            <p
              style={{
                fontSize: '0.8125rem',
                color: INK_SOFT,
                margin: 0,
              }}
            >
              {ex.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
