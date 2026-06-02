import Bientot from '@/components/bientot/Bientot'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

export const metadata = {
  title: 'Audio | La Librairie | Le Méthodic',
}

const GHOST_COUNT = 6

export default function LibrairieAudioPage() {
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
        Audio
      </h1>
      <Bientot level="surface" label="Les contenus audio arrivent bientôt.">
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: 16 }}
        >
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
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  background: 'var(--lm-border-subtle)',
                  borderRadius: 4,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    height: 13,
                    background: 'var(--lm-border-subtle)',
                    borderRadius: 2,
                    width: '70%',
                    marginBottom: 8,
                  }}
                />
                <div
                  style={{
                    height: 10,
                    background: 'var(--lm-border-subtle)',
                    borderRadius: 2,
                    width: '45%',
                    marginBottom: 12,
                  }}
                />
                <div
                  style={{
                    height: 6,
                    background: 'var(--lm-border-subtle)',
                    borderRadius: 3,
                    width: '100%',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Bientot>
    </main>
  )
}
