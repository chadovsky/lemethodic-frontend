import Bientot from '@/components/bientot/Bientot'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

export const metadata = {
  title: 'Abonnement | Le Méthodic',
}

export default function AbonnementPage() {
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
        Abonnement
      </h1>
      <Bientot level="surface" label="La gestion d'abonnement arrive bientôt.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              background: 'var(--lm-bg-surface)',
              border: '1px solid var(--lm-border-subtle)',
              borderRadius: 4,
              padding: '24px',
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
              Abonnement actuel
            </p>
            <p
              style={{
                fontFamily: SERIF_FONT,
                fontSize: '1.125rem',
                color: 'var(--lm-text-primary)',
                margin: 0,
              }}
            >
              Aucun abonnement actif
            </p>
          </div>

          <div>
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
              Historique de facturation
            </p>
            <div
              style={{
                background: 'var(--lm-bg-surface)',
                border: '1px solid var(--lm-border-subtle)',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '12px 20px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 80px',
                  gap: 16,
                  borderBottom: '1px solid var(--lm-border-subtle)',
                }}
              >
                {['Date', 'Description', 'Montant'].map((h) => (
                  <span
                    key={h}
                    style={{
                      fontFamily: SANS_FONT,
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--lm-text-secondary)',
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: SANS_FONT,
                    fontSize: 13,
                    color: 'var(--lm-text-secondary)',
                  }}
                >
                  Aucune transaction
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled
            style={{
              alignSelf: 'flex-start',
              fontFamily: SANS_FONT,
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--lm-text-secondary)',
              background: 'transparent',
              border: '1px solid var(--lm-border-subtle)',
              borderRadius: 4,
              padding: '11px 24px',
              cursor: 'not-allowed',
            }}
          >
            Gérer mon abonnement
          </button>
        </div>
      </Bientot>
    </main>
  )
}
