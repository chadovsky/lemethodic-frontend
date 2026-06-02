import type { Metadata } from 'next'
import Bientot from '@/components/bientot/Bientot'

export const metadata: Metadata = {
  title: 'Les Pièges Anglais | Le Méthodic',
  description:
    'La cinquième couche de la méthode : les interférences de l\'anglais qui trahissent les apprenants anglophones en français.',
  alternates: { canonical: '/pieges' },
}

const DISPLAY = 'var(--f-display), Georgia, serif'
const UI = 'var(--f-ui), system-ui, sans-serif'
const MONO = 'var(--f-mono), monospace'

type PiegeCard = {
  terme: string
  erreur: string
  correct: string
  note: string
}

const FAUX_AMIS: PiegeCard[] = [
  {
    terme: 'sensible',
    erreur: '"Elle est très sensible" pour dire "She is very sensible"',
    correct: '"sensible" signifie "sensitive" en anglais ; "sensible" EN → "raisonnable / sensé(e)"',
    note: 'Le faux ami le plus fréquent en production orale TCF.',
  },
  {
    terme: 'actuellement',
    erreur: '"Actuellement, je veux dire..." pour traduire "Actually, I mean..."',
    correct: '"actuellement" signifie "currently / at present" ; "actually" EN → "en fait / à vrai dire"',
    note: 'L\'erreur trahit l\'anglophone au moment même où il cherche à reformuler.',
  },
  {
    terme: 'assister',
    erreur: '"J\'ai assisté mon professeur" pour dire "I assisted my teacher"',
    correct: '"assister à" = to attend ; to assist EN → "aider / soutenir"',
    note: 'Le verbe fonctionne seul ou avec "à", mais jamais avec un COD humain dans ce sens.',
  },
]

const CALQUES: PiegeCard[] = [
  {
    terme: 'faire sens',
    erreur: '"Ça fait sens" — calque direct de "it makes sense"',
    correct: '"avoir du sens" : "ça n\'a pas de sens / ça a du sens"',
    note: 'Calque systématique chez les anglophones ; correcteurs TCF le repèrent immédiatement.',
  },
  {
    terme: 'prendre avantage de',
    erreur: '"Il a pris avantage de la situation" — calque de "to take advantage of"',
    correct: '"profiter de / tirer parti de" : "il a profité de la situation"',
    note: 'La structure calquée est rejetée par les locuteurs natifs comme non idiomatique.',
  },
]

const PREPOSITIONS: PiegeCard[] = [
  {
    terme: 'penser à / penser de',
    erreur: 'confondre les deux constructions selon le sens anglais de "to think about"',
    correct: '"je pense à toi" (to think about sb) ; "que penses-tu de cette idée ?" (to have an opinion on sth)',
    note: 'Le choix de préposition change le sens : intention vs opinion.',
  },
  {
    terme: 'différent de',
    erreur: '"C\'est différent que / différent à ce que je pensais"',
    correct: '"différent de" est l\'unique construction standard : "c\'est différent de ce que je pensais"',
    note: '"Différent que" est courant en français québécois parlé mais non standard en production écrite.',
  },
  {
    terme: 'dépendre de',
    erreur: '"Ça dépend sur le contexte" — calque de "it depends on"',
    correct: '"dépendre de" : "ça dépend du contexte"',
    note: 'La préposition "sur" après "dépendre" est une faute systématique chez les anglophones.',
  },
]

function PiegeExampleCard({ terme, erreur, correct, note }: PiegeCard) {
  return (
    <div
      style={{
        backgroundColor: 'var(--paper)',
        border: '1px solid var(--rule)',
        borderRadius: 8,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <p
        style={{
          fontFamily: MONO,
          fontWeight: 600,
          fontSize: '0.8125rem',
          letterSpacing: '0.04em',
          color: 'var(--ink)',
          margin: 0,
        }}
      >
        {terme}
      </p>
      <p
        style={{
          fontFamily: UI,
          fontWeight: 400,
          fontSize: '0.875rem',
          lineHeight: 1.55,
          color: 'var(--ink-soft)',
          margin: 0,
        }}
      >
        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{'✗'}</span>{' '}
        {erreur}
      </p>
      <p
        style={{
          fontFamily: UI,
          fontWeight: 400,
          fontSize: '0.875rem',
          lineHeight: 1.55,
          color: 'var(--ink-soft)',
          margin: 0,
        }}
      >
        <span style={{ color: 'var(--cta-primary)', fontWeight: 600 }}>{'✓'}</span>{' '}
        {correct}
      </p>
      <p
        style={{
          fontFamily: UI,
          fontWeight: 400,
          fontSize: '0.8125rem',
          lineHeight: 1.55,
          color: 'var(--ink-faint)',
          margin: 0,
          paddingTop: 4,
          borderTop: '1px solid var(--rule)',
        }}
      >
        {note}
      </p>
    </div>
  )
}

const SECTIONS = [
  {
    key: 'faux-amis',
    heading: 'Faux amis',
    bientotLabel: 'Les fiches faux amis complètes arrivent bientôt, avec exemples audio et exercices intégrés.',
    cards: FAUX_AMIS,
  },
  {
    key: 'calques',
    heading: 'Calques',
    bientotLabel: 'Les fiches calques anglais-français arrivent bientôt, organisées par fréquence d\'apparition au TCF.',
    cards: CALQUES,
  },
  {
    key: 'prepositions',
    heading: 'Prépositions',
    bientotLabel: 'Les fiches prépositions arrivent bientôt, avec tableaux de régimes verbaux et exemples calibrés.',
    cards: PREPOSITIONS,
  },
]

const sectionHeading: React.CSSProperties = {
  fontFamily: DISPLAY,
  fontWeight: 700,
  fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
  letterSpacing: '-0.01em',
  lineHeight: 1.2,
  color: 'var(--ink)',
  margin: 0,
  marginBottom: 20,
}

export default function PiegesPage() {
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
          Les Pièges Anglais
        </h1>

        <p
          style={{
            fontFamily: UI,
            fontWeight: 400,
            fontSize: 'clamp(1rem, 2vw, 1.0625rem)',
            lineHeight: 1.75,
            color: 'var(--ink-soft)',
            margin: 0,
            marginBottom: 'clamp(48px, 7vw, 64px)',
            maxWidth: 640,
          }}
        >
          La cinquième couche de la méthode cible les interférences systématiques de
          l&apos;anglais : les faux amis, les calques de traduction, et les erreurs de
          prépositions que les anglophones reproduisent indépendamment de leur niveau.
          C&apos;est souvent ce qui sépare un B1 d&apos;un B2 aux yeux de l&apos;examinateur.
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(48px, 7vw, 64px)',
          }}
        >
          {SECTIONS.map((section) => (
            <section key={section.key} aria-labelledby={`section-${section.key}`}>
              <h2 id={`section-${section.key}`} style={sectionHeading}>
                {section.heading}
              </h2>
              <Bientot level="section" label={section.bientotLabel}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 16,
                  }}
                >
                  {section.cards.map((card) => (
                    <PiegeExampleCard key={card.terme} {...card} />
                  ))}
                </div>
              </Bientot>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
