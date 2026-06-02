import type { Metadata } from 'next'
import Link from 'next/link'
import Bientot from '@/components/bientot/Bientot'

export const metadata: Metadata = {
  title: 'Examens | Le Méthodic',
  description:
    'Parcours de préparation aux examens de français : TCF Canada, TEF, DALF, DELF et Français Général.',
  alternates: { canonical: '/examens' },
}

const DISPLAY = 'var(--f-display), Georgia, serif'
const UI = 'var(--f-ui), system-ui, sans-serif'
const MONO = 'var(--f-mono), monospace'

const eyebrow: React.CSSProperties = {
  fontFamily: MONO,
  fontWeight: 500,
  fontSize: '0.6875rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--ink-faint)',
  margin: 0,
  marginBottom: 8,
}

const cardBase: React.CSSProperties = {
  backgroundColor: 'var(--paper)',
  border: '1px solid var(--rule)',
  borderRadius: 8,
  padding: '28px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  height: '100%',
  boxSizing: 'border-box',
}

const cardTitle: React.CSSProperties = {
  fontFamily: DISPLAY,
  fontWeight: 700,
  fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
  letterSpacing: '-0.02em',
  lineHeight: 1.1,
  color: 'var(--ink)',
  margin: 0,
}

const cardDesc: React.CSSProperties = {
  fontFamily: UI,
  fontWeight: 400,
  fontSize: '0.9375rem',
  lineHeight: 1.6,
  color: 'var(--ink-soft)',
  margin: 0,
  marginTop: 4,
  flexGrow: 1,
}

const cardArrow: React.CSSProperties = {
  fontFamily: UI,
  fontWeight: 600,
  fontSize: '0.875rem',
  color: 'var(--accent)',
  marginTop: 16,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
}

const EXAMS = [
  {
    key: 'tcf',
    name: 'TCF Canada',
    audience: 'Pour le Canada',
    description:
      'Le Test de Connaissance du Français mesure quatre compétences : compréhension orale, compréhension écrite, expression orale et expression écrite. Seuil courant pour la résidence permanente au Québec : B2.',
    live: true,
    href: '/examens/tcf',
    bientotLabel: '',
  },
  {
    key: 'tef',
    name: 'TEF',
    audience: 'Pour la France et la Suisse',
    description:
      'Le Test d\'Évaluation de Français est reconnu pour les demandes d\'immigration en France et en Suisse. Le parcours TEF arrive bientôt.',
    live: false,
    href: '/examens/tef',
    bientotLabel: 'Le parcours TEF (France et Suisse) arrive bientôt.',
  },
  {
    key: 'dalf',
    name: 'DALF',
    audience: 'Pour les niveaux avancés',
    description:
      'Le Diplôme Approfondi de Langue Française certifie un niveau avancé (C1 et C2), reconnu pour l\'accès à l\'enseignement supérieur.',
    live: false,
    href: '/examens/dalf',
    bientotLabel: 'Le parcours DALF C1 et C2 arrive bientôt.',
  },
  {
    key: 'delf',
    name: 'DELF',
    audience: 'Pour tous niveaux',
    description:
      'Le Diplôme d\'Études en Langue Française valide les compétences du niveau A1 au B2, reconnu dans le monde entier.',
    live: false,
    href: '/examens/delf',
    bientotLabel: 'Le parcours DELF arrive bientôt.',
  },
  {
    key: 'general',
    name: 'Français Général',
    audience: 'Sans examen ciblé',
    description:
      'Un parcours de renforcement linguistique pour progresser en français sans objectif d\'examen immédiat.',
    live: false,
    href: '/examens/general',
    bientotLabel: 'Le parcours Français Général arrive bientôt.',
  },
]

function ExamCard({
  name,
  audience,
  description,
  live,
}: {
  name: string
  audience: string
  description: string
  live: boolean
}) {
  return (
    <div style={cardBase}>
      <p style={eyebrow}>{audience}</p>
      <h2 style={cardTitle}>{name}</h2>
      <p style={cardDesc}>{description}</p>
      {live && (
        <span style={cardArrow}>
          Commencer
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
            style={{ flexShrink: 0 }}
          >
            <path
              d="M2 7h10M8 3l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </div>
  )
}

export default function ExamensPage() {
  return (
    <main className="ed-page-enter" style={{ backgroundColor: 'var(--paper)', minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: 1024,
          margin: '0 auto',
          padding: 'clamp(64px, 8vw, 96px) clamp(24px, 5vw, 48px)',
        }}
      >
        <h1
          style={{
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            color: 'var(--ink)',
            margin: 0,
            marginBottom: 20,
          }}
        >
          Examens
        </h1>

        <p
          style={{
            fontFamily: UI,
            fontWeight: 400,
            fontSize: 'clamp(1rem, 2vw, 1.0625rem)',
            lineHeight: 1.75,
            color: 'var(--ink-soft)',
            margin: 0,
            marginBottom: 'clamp(40px, 6vw, 56px)',
            maxWidth: 600,
          }}
        >
          Ce hub centralise les parcours d&apos;examen disponibles et à venir. Le TCF Canada est
          ouvert. Les autres examens arrivent progressivement.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {EXAMS.map((exam) => {
            if (exam.live) {
              return (
                <Link
                  key={exam.key}
                  href={exam.href}
                  className="ed-card-lift"
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <ExamCard
                    name={exam.name}
                    audience={exam.audience}
                    description={exam.description}
                    live
                  />
                </Link>
              )
            }

            return (
              <div key={exam.key}>
                <Bientot level="section" label={exam.bientotLabel}>
                  <ExamCard
                    name={exam.name}
                    audience={exam.audience}
                    description={exam.description}
                    live={false}
                  />
                </Bientot>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
