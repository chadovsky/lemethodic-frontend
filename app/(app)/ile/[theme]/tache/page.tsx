// SITEMAP marks this surface as live, but the canonical /ile/[theme]/tache path
// needs Phase 2 wiring to route to the appropriate tache type based on ile
// metadata. Current tache content lives at /examen/expression-orale and
// /examen/expression-ecrite.

import Bientot from '@/components/bientot/Bientot'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

export const metadata = {
  title: 'La Tâche | Le Méthodic',
}

type Params = Promise<{ theme: string }>

export default async function IleTachePage({ params }: { params: Params }) {
  const { theme } = await params

  return (
    <main
      style={{
        maxWidth: 820,
        margin: '0 auto',
        padding: 'clamp(32px, 5vw, 64px) clamp(20px, 4vw, 40px)',
      }}
    >
      <p
        style={{
          fontFamily: SANS_FONT,
          fontSize: 12,
          color: 'var(--lm-text-secondary)',
          margin: '0 0 8px',
        }}
      >
        Île {theme}
      </p>
      <h1
        style={{
          fontFamily: SERIF_FONT,
          fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
          fontWeight: 400,
          color: 'var(--lm-text-primary)',
          margin: '0 0 32px',
        }}
      >
        La Tâche
      </h1>
      <Bientot
        level="surface"
        label="La tâche d'île arrive bientôt. Les tâches d'expression orale et écrite restent accessibles via /examen."
      >
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
                margin: '0 0 10px',
              }}
            >
              Consigne
            </p>
            <div
              style={{
                height: 12,
                background: 'var(--lm-border-subtle)',
                borderRadius: 2,
                width: '85%',
                marginBottom: 8,
              }}
            />
            <div
              style={{
                height: 12,
                background: 'var(--lm-border-subtle)',
                borderRadius: 2,
                width: '70%',
                marginBottom: 8,
              }}
            />
            <div
              style={{
                height: 12,
                background: 'var(--lm-border-subtle)',
                borderRadius: 2,
                width: '50%',
              }}
            />
          </div>

          <div
            style={{
              background: 'var(--lm-bg-surface)',
              border: '1px solid var(--lm-border-subtle)',
              borderRadius: 4,
              padding: '20px 24px',
              minHeight: 160,
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
                margin: '0 0 10px',
              }}
            >
              Votre réponse
            </p>
            <div
              style={{
                height: 8,
                background: 'var(--lm-border-subtle)',
                borderRadius: 2,
                width: '30%',
              }}
            />
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
              padding: '12px 32px',
              cursor: 'not-allowed',
            }}
          >
            Soumettre
          </button>
        </div>
      </Bientot>
    </main>
  )
}
