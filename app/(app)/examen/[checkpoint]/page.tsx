import Bientot from '@/components/bientot/Bientot'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

export const metadata = {
  title: 'Examen | Le Méthodic',
}

type Params = Promise<{ checkpoint: string }>

const SECTIONS = [
  'Compréhension orale',
  'Expression orale',
  'Compréhension écrite',
  'Expression écrite',
]

export default async function ExamenCheckpointPage({ params }: { params: Params }) {
  const { checkpoint } = await params

  return (
    <main
      style={{
        maxWidth: 820,
        margin: '0 auto',
        padding: 'clamp(32px, 5vw, 64px) clamp(20px, 4vw, 40px)',
      }}
    >
      <h1
        style={{
          fontFamily: SERIF_FONT,
          fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
          fontWeight: 400,
          color: 'var(--lm-text-primary)',
          margin: '0 0 32px',
        }}
      >
        Examen {checkpoint}
      </h1>
      <Bientot level="surface" label="Les examens blancs arrivent bientôt.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              background: 'var(--lm-bg-surface)',
              border: '1px solid var(--lm-border-subtle)',
              borderRadius: 4,
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontFamily: SANS_FONT,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--lm-text-secondary)',
              }}
            >
              Durée
            </span>
            <span
              style={{
                fontFamily: SANS_FONT,
                fontSize: 18,
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
                color: 'var(--lm-text-primary)',
              }}
            >
              00:00
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SECTIONS.map((section, i) => (
              <div
                key={section}
                style={{
                  background: 'var(--lm-bg-surface)',
                  border: '1px solid var(--lm-border-subtle)',
                  borderRadius: 4,
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <span
                  style={{
                    fontFamily: SANS_FONT,
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--lm-text-secondary)',
                    minWidth: 16,
                  }}
                >
                  {i + 1}
                </span>
                <span
                  style={{
                    fontFamily: SANS_FONT,
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--lm-text-primary)',
                  }}
                >
                  {section}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            disabled
            style={{
              alignSelf: 'flex-start',
              fontFamily: SANS_FONT,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--lm-bg-base)',
              background: 'var(--lm-text-primary)',
              border: 'none',
              borderRadius: 4,
              padding: '12px 32px',
              cursor: 'not-allowed',
            }}
          >
            Soumettre l'examen
          </button>
        </div>
      </Bientot>
    </main>
  )
}
