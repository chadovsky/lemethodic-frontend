import Bientot from '@/components/bientot/Bientot'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

export const metadata = {
  title: 'Livres | La Librairie | Le Méthodic',
}

const GHOST_COUNT = 6

export default function LivraisonLivresPage() {
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
        Livres
      </h1>
      <Bientot level="surface" label="Le catalogue de livres arrive bientôt.">
        <div
          className="grid grid-cols-2 md:grid-cols-3"
          style={{ gap: 24 }}
        >
          {Array.from({ length: GHOST_COUNT }, (_, i) => (
            <div
              key={i}
              style={{
                background: 'var(--lm-bg-surface)',
                border: '1px solid var(--lm-border-subtle)',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: 200,
                  background: 'var(--lm-border-subtle)',
                }}
              />
              <div style={{ padding: '16px' }}>
                <div
                  style={{
                    height: 13,
                    background: 'var(--lm-border-subtle)',
                    borderRadius: 2,
                    width: '75%',
                    marginBottom: 8,
                  }}
                />
                <div
                  style={{
                    height: 11,
                    background: 'var(--lm-border-subtle)',
                    borderRadius: 2,
                    width: '35%',
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
