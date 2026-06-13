import Bientot from '@/components/bientot/Bientot'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

export const metadata = {
  title: 'Coaching | Le Méthodic',
}

const GHOST_COUNT = 3

export default function CoachingPage() {
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
        Coaching
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
        Des sessions individuelles avec un coach pour cibler vos points faibles
        avant l&apos;examen.
      </p>
      <Bientot level="surface" label="La réservation de sessions de coaching arrive bientôt.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Array.from({ length: GHOST_COUNT }, (_, i) => (
            <div
              key={i}
              style={{
                background: 'var(--lm-bg-surface)',
                border: '1px solid var(--lm-border-subtle)',
                borderRadius: 4,
                padding: '20px',
                display: 'flex',
                gap: 16,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  background: 'var(--lm-border-subtle)',
                  borderRadius: '50%',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    height: 13,
                    background: 'var(--lm-border-subtle)',
                    borderRadius: 2,
                    width: '50%',
                    marginBottom: 10,
                  }}
                />
                <div
                  style={{
                    height: 10,
                    background: 'var(--lm-border-subtle)',
                    borderRadius: 2,
                    width: '75%',
                  }}
                />
              </div>
              <div
                style={{
                  width: 96,
                  height: 36,
                  background: 'var(--lm-border-subtle)',
                  borderRadius: 4,
                  flexShrink: 0,
                }}
              />
            </div>
          ))}
        </div>
      </Bientot>
    </main>
  )
}
