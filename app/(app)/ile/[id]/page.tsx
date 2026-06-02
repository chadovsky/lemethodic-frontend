import Bientot from '@/components/bientot/Bientot'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

export const metadata = {
  title: 'Île | Le Méthodic',
}

type Params = Promise<{ id: string }>

const COUCHES = [
  'Le Propos',
  'Le Plan',
  'La Construction',
  'Les Pièges Anglais',
  'La Musique',
]

export default async function IlePage({ params }: { params: Params }) {
  const { id } = await params

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
        Île {id}
      </h1>
      <Bientot level="surface" label="Les îles thématiques arrivent bientôt.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <p
            style={{
              fontFamily: SERIF_FONT,
              fontSize: '1rem',
              lineHeight: 1.65,
              color: 'var(--lm-text-secondary)',
              margin: 0,
            }}
          >
            Une île regroupe toutes les activités liées à un thème. Progressez
            couche par couche pour maîtriser le vocabulaire, la structure et la
            fluidité propres à ce contexte.
          </p>

          <div>
            <p
              style={{
                fontFamily: SANS_FONT,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--lm-text-secondary)',
                margin: '0 0 10px',
              }}
            >
              Les 5 couches
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {COUCHES.map((couche, i) => (
                <div
                  key={couche}
                  style={{
                    background: 'var(--lm-bg-surface)',
                    border: '1px solid var(--lm-border-subtle)',
                    borderRadius: 4,
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
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
                    {couche}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Bientot>
    </main>
  )
}
