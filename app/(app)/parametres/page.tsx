import Bientot from '@/components/bientot/Bientot'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

export const metadata = {
  title: 'Paramètres | Le Méthodic',
}

const SECTIONS = [
  {
    title: 'Affichage',
    rows: ['Thème', 'Taille de police'],
  },
  {
    title: 'Audio',
    rows: ['Microphone', "Voix de l'examinateur"],
  },
  {
    title: 'Notifications',
    rows: ['Rappels quotidiens', 'Résumé hebdomadaire'],
  },
  {
    title: 'Compte',
    rows: ['Profil (/profil)'],
  },
]

export default function ParametresPage() {
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
        Paramètres
      </h1>
      <Bientot level="surface" label="La gestion fine des paramètres arrive bientôt.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <p
                style={{
                  fontFamily: SANS_FONT,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--lm-text-secondary)',
                  margin: '0 0 8px',
                }}
              >
                {section.title}
              </p>
              <div
                style={{
                  background: 'var(--lm-bg-surface)',
                  border: '1px solid var(--lm-border-subtle)',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                {section.rows.map((row, i) => (
                  <div
                    key={row}
                    style={{
                      padding: '14px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: i > 0 ? '1px solid var(--lm-border-subtle)' : 'none',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: SANS_FONT,
                        fontSize: 14,
                        color: 'var(--lm-text-primary)',
                      }}
                    >
                      {row}
                    </span>
                    <div
                      style={{
                        width: 48,
                        height: 8,
                        background: 'var(--lm-border-subtle)',
                        borderRadius: 2,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Bientot>
    </main>
  )
}
