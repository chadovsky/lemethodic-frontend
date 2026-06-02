import Bientot from '@/components/bientot/Bientot'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

export const metadata = {
  title: 'Le Maître | Le Méthodic',
}

const GHOST_CONVERSATIONS = [
  { width: '55%' },
  { width: '70%' },
  { width: '45%' },
  { width: '62%' },
]

export default function MaitrePage() {
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
        Le Maître
      </h1>
      <Bientot level="surface" label="Le hub Le Maître arrive bientôt.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <p
              style={{
                fontFamily: SANS_FONT,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--lm-text-secondary)',
                margin: '0 0 12px',
              }}
            >
              Conversations récentes
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {GHOST_CONVERSATIONS.map((c, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--lm-bg-surface)',
                    border: '1px solid var(--lm-border-subtle)',
                    borderRadius: 4,
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      background: 'var(--lm-border-subtle)',
                      borderRadius: '50%',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        height: 12,
                        background: 'var(--lm-border-subtle)',
                        borderRadius: 2,
                        width: c.width,
                        marginBottom: 6,
                      }}
                    />
                    <div
                      style={{
                        height: 8,
                        background: 'var(--lm-border-subtle)',
                        borderRadius: 2,
                        width: '30%',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
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
              padding: '12px 24px',
              cursor: 'not-allowed',
            }}
          >
            Nouvelle conversation
          </button>
        </div>
      </Bientot>
    </main>
  )
}
