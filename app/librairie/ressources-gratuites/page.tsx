import Bientot from '@/components/bientot/Bientot'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

export const metadata = {
  title: 'Ressources gratuites | La Librairie | Le Méthodic',
}

const GHOST_COUNT = 6

export default function LibrairieRessourcesGratuitesPage() {
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
        Ressources gratuites
      </h1>
      <Bientot level="surface" label="Les ressources gratuites arrivent bientôt.">
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
                padding: '20px 24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    background: 'var(--lm-border-subtle)',
                    borderRadius: '50%',
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    height: 13,
                    background: 'var(--lm-border-subtle)',
                    borderRadius: 2,
                    width: '60%',
                  }}
                />
              </div>
              <div
                style={{
                  height: 10,
                  background: 'var(--lm-border-subtle)',
                  borderRadius: 2,
                  width: '90%',
                  marginBottom: 6,
                }}
              />
              <div
                style={{
                  height: 10,
                  background: 'var(--lm-border-subtle)',
                  borderRadius: 2,
                  width: '70%',
                }}
              />
            </div>
          ))}
        </div>
      </Bientot>
    </main>
  )
}
