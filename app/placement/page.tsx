import Bientot from '@/components/bientot/Bientot'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

export const metadata = {
  title: 'Test de positionnement | Le Méthodic',
}

const GHOST_COUNT = 4

export default function PlacementPage() {
  return (
    <main
      style={{
        maxWidth: 820,
        margin: '0 auto',
        padding: 'clamp(48px, 8vw, 80px) clamp(24px, 5vw, 40px)',
      }}
    >
      <h1
        style={{
          fontFamily: SERIF_FONT,
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 400,
          color: 'var(--lm-text-primary)',
          margin: '0 0 12px',
          letterSpacing: '-0.02em',
        }}
      >
        Test de positionnement
      </h1>
      <p
        style={{
          fontFamily: SANS_FONT,
          fontSize: '1.0625rem',
          lineHeight: 1.6,
          color: 'var(--lm-text-secondary)',
          margin: '0 0 40px',
          maxWidth: 560,
        }}
      >
        Quelques questions pour situer votre niveau et calibrer votre parcours
        avant de commencer.
      </p>
      <Bientot level="surface" label="Le test de positionnement arrive bientôt.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Array.from({ length: GHOST_COUNT }, (_, i) => (
            <div
              key={i}
              style={{
                background: 'var(--lm-bg-surface)',
                border: '1px solid var(--lm-border-subtle)',
                borderRadius: 4,
                padding: '20px',
              }}
            >
              <div
                style={{
                  height: 13,
                  background: 'var(--lm-border-subtle)',
                  borderRadius: 2,
                  width: '60%',
                  marginBottom: 16,
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[0, 1, 2].map((j) => (
                  <div
                    key={j}
                    style={{
                      height: 10,
                      background: 'var(--lm-border-subtle)',
                      borderRadius: 2,
                      width: j === 2 ? '40%' : '100%',
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Bientot>
    </main>
  )
}
