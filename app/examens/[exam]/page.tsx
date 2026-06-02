import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Bientot from '@/components/bientot/Bientot'

const DISPLAY = 'var(--f-display), Georgia, serif'
const UI = 'var(--f-ui), system-ui, sans-serif'
const MONO = 'var(--f-mono), monospace'

const EXAM_CONFIG: Record<
  string,
  { name: string; audience: string; subtitle: string; bientotLabel: string }
> = {
  tef: {
    name: 'TEF',
    audience: 'Pour la France et la Suisse',
    subtitle: 'Pour l’immigration en France et en Suisse',
    bientotLabel: 'Le parcours TEF (France et Suisse) arrive bientôt.',
  },
  dalf: {
    name: 'DALF',
    audience: 'Pour les niveaux avancés',
    subtitle: 'Diplôme approfondi, niveaux C1 et C2',
    bientotLabel: 'Le parcours DALF C1 et C2 arrive bientôt.',
  },
  delf: {
    name: 'DELF',
    audience: 'Pour tous niveaux',
    subtitle: 'De A1 à B2, reconnu dans le monde entier',
    bientotLabel: 'Le parcours DELF arrive bientôt.',
  },
  general: {
    name: 'Français Général',
    audience: 'Sans examen ciblé',
    subtitle: 'Progresser en français sans objectif d’examen immédiat',
    bientotLabel: 'Le parcours Français Général arrive bientôt.',
  },
}

export function generateStaticParams() {
  return Object.keys(EXAM_CONFIG).map((exam) => ({ exam }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ exam: string }>
}): Promise<Metadata> {
  const { exam } = await params
  const config = EXAM_CONFIG[exam]
  if (!config) return {}
  return {
    title: `${config.name} | Le Méthodic`,
    description: config.bientotLabel,
    alternates: { canonical: `/examens/${exam}` },
  }
}

const eyebrow: React.CSSProperties = {
  fontFamily: MONO,
  fontWeight: 500,
  fontSize: '0.6875rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--ink-faint)',
  margin: 0,
  marginBottom: 16,
}

const sectionHeading: React.CSSProperties = {
  fontFamily: DISPLAY,
  fontWeight: 700,
  fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
  letterSpacing: '-0.02em',
  lineHeight: 1.2,
  color: 'var(--ink)',
  margin: 0,
  marginBottom: 16,
}

const body: React.CSSProperties = {
  fontFamily: UI,
  fontWeight: 400,
  fontSize: 'clamp(1rem, 2vw, 1.0625rem)',
  lineHeight: 1.75,
  color: 'var(--ink)',
  margin: 0,
}

const rule: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid var(--rule)',
  margin: '0 0 clamp(40px, 5vw, 56px)',
}

export default async function ExamBientotPage({
  params,
}: {
  params: Promise<{ exam: string }>
}) {
  const { exam } = await params
  const config = EXAM_CONFIG[exam]
  if (!config) notFound()

  return (
    <Bientot level="surface" label={config.bientotLabel}>
      <main style={{ backgroundColor: 'var(--paper)', minHeight: '100vh' }}>
        {/* Hero */}
        <div
          style={{
            borderBottom: '1px solid var(--rule)',
            padding: 'clamp(64px, 8vw, 96px) clamp(24px, 5vw, 48px) clamp(48px, 6vw, 72px)',
          }}
        >
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <p style={{ ...eyebrow, marginBottom: 20 }}>Examens / {config.name}</p>
            <h1
              style={{
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                letterSpacing: '-0.03em',
                lineHeight: 1,
                color: 'var(--ink)',
                margin: 0,
                marginBottom: 16,
              }}
            >
              {config.name}
            </h1>
            <p
              style={{
                fontFamily: UI,
                fontWeight: 400,
                fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)',
                lineHeight: 1.5,
                color: 'var(--ink-soft)',
                margin: 0,
              }}
            >
              {config.subtitle}
            </p>
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: 'clamp(48px, 6vw, 72px) clamp(24px, 5vw, 48px)',
          }}
        >
          {/* Section 1 */}
          <section aria-labelledby={`section-${exam}-examen`} style={{ marginBottom: 'clamp(40px, 5vw, 56px)' }}>
            <h2 id={`section-${exam}-examen`} style={eyebrow}>
              L&apos;examen
            </h2>
            <h3 style={sectionHeading}>Structure et reconnaissance</h3>
            <p style={body}>
              Le {config.name} est un examen de langue reconnu qui évalue les compétences en
              français. Ce parcours présentera la structure de l&apos;examen, les niveaux ciblés
              et les critères de réussite.
            </p>
          </section>

          <hr style={rule} />

          {/* Section 2 */}
          <section aria-labelledby={`section-${exam}-methode`} style={{ marginBottom: 'clamp(40px, 5vw, 56px)' }}>
            <h2 id={`section-${exam}-methode`} style={eyebrow}>
              La méthode
            </h2>
            <h3 style={sectionHeading}>La méthode en cinq couches</h3>
            <p style={body}>
              La méthode Le Méthodic s&apos;applique à cet examen à travers les cinq couches : Le
              Propos, Le Plan, La Construction, Les Pièges Anglais et La Musique. Ce parcours
              détaillera comment chaque couche s&apos;articule avec les épreuves.
            </p>
          </section>

          <hr style={rule} />

          {/* Section 3 */}
          <section aria-labelledby={`section-${exam}-parcours`}>
            <h2 id={`section-${exam}-parcours`} style={eyebrow}>
              Le parcours
            </h2>
            <h3 style={sectionHeading}>De votre niveau actuel à l&apos;examen</h3>
            <p style={body}>
              Le parcours {config.name} guidera chaque candidat depuis un diagnostic de niveau
              initial jusqu&apos;à la maîtrise des compétences requises pour l&apos;examen.
              Exercices progressifs, simulations et retours personnalisés seront au programme.
            </p>
          </section>
        </div>
      </main>
    </Bientot>
  )
}
