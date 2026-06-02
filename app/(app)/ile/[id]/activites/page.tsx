import Bientot from '@/components/bientot/Bientot'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

export const metadata = {
  title: 'Activités | Le Méthodic',
}

type Params = Promise<{ id: string }>

const ACTIVITY_TYPES = [
  {
    label: 'Compréhension',
    description: 'Exercices de lecture et écoute active',
  },
  {
    label: 'Réflexe',
    description: 'Rappel espacé des mots et structures clés',
  },
  {
    label: 'Conversation',
    description: 'Échanges guidés avec Le Maître',
  },
  {
    label: 'Réemploi',
    description: "Mise en pratique dans des contextes variés",
  },
  {
    label: 'Tâche',
    description: 'Production orale ou écrite intégrée',
  },
]

export default async function IleActivitesPage({ params }: { params: Params }) {
  const { id } = await params

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
        Île {id}
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
        Activités
      </h1>
      <Bientot level="surface" label="Les activités d'île arrivent bientôt.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ACTIVITY_TYPES.map((activity) => (
            <div
              key={activity.label}
              style={{
                background: 'var(--lm-bg-surface)',
                border: '1px solid var(--lm-border-subtle)',
                borderRadius: 4,
                padding: '18px 20px',
              }}
            >
              <p
                style={{
                  fontFamily: SANS_FONT,
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--lm-text-primary)',
                  margin: '0 0 4px',
                }}
              >
                {activity.label}
              </p>
              <p
                style={{
                  fontFamily: SANS_FONT,
                  fontSize: 13,
                  color: 'var(--lm-text-secondary)',
                  margin: 0,
                }}
              >
                {activity.description}
              </p>
            </div>
          ))}
        </div>
      </Bientot>
    </main>
  )
}
