import Bientot from '@/components/bientot/Bientot'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

export const metadata = {
  title: 'Téléchargements | La Librairie | Le Méthodic',
}

const GHOST_COUNT = 6

export default function LibrairieTelechargemntsPage() {
  return (
    <main
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: 'clamp(48px, 8vw, 80px) clamp(24px, 5vw, 80px)',
      }}
    >
      <h1
        style={{
          fontFamily: SERIF_FONT,
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 400,
          color: 'var(--lm-text-primary)',
          margin: '0 0 40px',
          letterSpacing: '-0.02em',
        }}
      >
        Téléchargements
      </h1>
      <Bientot level="surface" label="Les téléchargements arrivent bientôt.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: GHOST_COUNT }, (_, i) => (
            <div
              key={i}
              style={{
                background: 'var(--lm-bg-surface)',
                border: '1px solid var(--lm-border-subtle)',
                borderRadius: 4,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 44,
                  background: 'var(--lm-border-subtle)',
                  borderRadius: 3,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    height: 13,
                    background: 'var(--lm-border-subtle)',
                    borderRadius: 2,
                    width: '55%',
                    marginBottom: 8,
                  }}
                />
                <div
                  style={{
                    height: 10,
                    background: 'var(--lm-border-subtle)',
                    borderRadius: 2,
                    width: '25%',
                  }}
                />
              </div>
              <div
                style={{
                  width: 80,
                  height: 10,
                  background: 'var(--lm-border-subtle)',
                  borderRadius: 2,
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
