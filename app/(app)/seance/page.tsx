import Bientot from '@/components/bientot/Bientot'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

export const metadata = {
  title: 'La Séance | Le Méthodic',
}

export default function SeancePage() {
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
        La Séance
      </h1>
      <Bientot level="surface" label="La séance quotidienne arrive bientôt.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              background: 'var(--lm-bg-surface)',
              border: '1px solid var(--lm-border-subtle)',
              borderRadius: 4,
              padding: '20px 24px',
            }}
          >
            <p
              style={{
                fontFamily: SANS_FONT,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--lm-text-secondary)',
                margin: '0 0 8px',
              }}
            >
              Aujourd'hui
            </p>
            <p
              style={{
                fontFamily: SERIF_FONT,
                fontSize: '1.125rem',
                color: 'var(--lm-text-primary)',
                margin: '0 0 12px',
              }}
            >
              Activité recommandée
            </p>
            <div
              style={{
                height: 8,
                background: 'var(--lm-border-subtle)',
                borderRadius: 4,
                width: '60%',
              }}
            />
          </div>

          <div
            style={{
              background: 'var(--lm-bg-surface)',
              border: '1px solid var(--lm-border-subtle)',
              borderRadius: 4,
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                background: 'var(--lm-border-subtle)',
                borderRadius: '50%',
                flexShrink: 0,
              }}
            />
            <div>
              <p
                style={{
                  fontFamily: SANS_FONT,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--lm-text-primary)',
                  margin: 0,
                }}
              >
                X jours
              </p>
              <p
                style={{
                  fontFamily: SANS_FONT,
                  fontSize: 12,
                  color: 'var(--lm-text-secondary)',
                  margin: 0,
                }}
              >
                Série en cours
              </p>
            </div>
          </div>

          <div
            style={{
              background: 'var(--lm-bg-surface)',
              border: '1px solid var(--lm-border-subtle)',
              borderRadius: 4,
              padding: '20px 24px',
            }}
          >
            <p
              style={{
                fontFamily: SANS_FONT,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--lm-text-secondary)',
                margin: '0 0 8px',
              }}
            >
              Île recommandée
            </p>
            <div
              style={{
                height: 16,
                background: 'var(--lm-border-subtle)',
                borderRadius: 2,
                width: '40%',
                marginBottom: 12,
              }}
            />
            <div
              style={{
                height: 6,
                background: 'var(--lm-border-subtle)',
                borderRadius: 3,
              }}
            />
          </div>
        </div>
      </Bientot>
    </main>
  )
}
