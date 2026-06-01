import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

const INK      = '#14213D'
const INK_SOFT = 'rgba(20, 33, 61, 0.62)'
const PAPER    = '#FFFFFF'
const RULE     = 'rgba(20, 33, 61, 0.10)'

interface Props {
  params: Promise<{ exercise: string }>
}

export default async function ComprehensionEcriteExercisePage({ params }: Props) {
  const { exercise } = await params
  return (
    <div
      style={{
        fontFamily: SANS_FONT,
        maxWidth: 760,
        margin: '0 auto',
        padding: '48px 0 80px',
      }}
    >
      <p
        style={{
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: INK_SOFT,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          margin: '0 0 16px',
        }}
      >
        Compréhension écrite
      </p>
      <h1
        style={{
          fontFamily: SERIF_FONT,
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: 400,
          color: INK,
          margin: '0 0 40px',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}
      >
        {exercise}
      </h1>
      <div
        style={{
          backgroundColor: PAPER,
          border: `1px solid ${RULE}`,
          borderRadius: 8,
          padding: '32px 28px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '1rem',
            fontWeight: 500,
            color: INK,
            margin: '0 0 8px',
          }}
        >
          Bientôt disponible
        </p>
        <p
          style={{
            fontSize: '0.875rem',
            color: INK_SOFT,
            margin: 0,
          }}
        >
          Cet exercice est en cours de développement.
        </p>
      </div>
    </div>
  )
}
