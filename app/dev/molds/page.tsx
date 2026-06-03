// Dev-only route: /dev/molds
// Renders each mold in isolation with hardcoded sample props for visual QA.
// Not linked from any nav surface. Remove or gate behind env check before public launch.
//
// NOTE: The dispatch references /_dev/molds, but Next.js App Router treats underscore-
// prefixed folders as private (excluded from routing). Route is /dev/molds to match
// the existing app/dev/bientot convention.

import Dialogue from '@/components/iles/molds/Dialogue'

export const metadata = {
  title: 'Molds Dev | Le Méthodic',
  robots: { index: false, follow: false },
}

const SAMPLE_TRANSCRIPT = [
  { speaker: 'Leila', text: "Bonjour Theo. Tu veux voir des photos de ma famille?" },
  { speaker: 'Theo', text: "Avec plaisir! Tu as des freres et soeurs?" },
  { speaker: 'Leila', text: "Oui, j'ai deux grands freres et une petite soeur." },
  { speaker: 'Theo', text: "Je suis enfant unique. Mais j'ai beaucoup de cousins." },
  { speaker: 'Leila', text: "Mon pere est medecin et ma mere enseigne les mathematiques." },
]

const SAMPLE_CHECKS = [
  {
    type: 'mcq' as const,
    question: "Combien de freres et soeurs Leila a-t-elle?",
    options: ["Un frere et une soeur", "Deux freres et une soeur", "Trois soeurs", "Elle est enfant unique"],
    correctIndex: 1,
  },
  {
    type: 'vrai-faux' as const,
    question: "Le pere de Leila est professeur de mathematiques.",
    options: ["Vrai", "Faux"],
    correctIndex: 1,
  },
]

export default function MoldsDevPage() {
  return (
    <main
      lang="fr"
      style={{
        maxWidth: 820,
        margin: '0 auto',
        padding: 'clamp(32px, 5vw, 64px) clamp(20px, 4vw, 40px)',
      }}
    >
      {/* Page header */}
      <div style={{ marginBottom: 48 }}>
        <p
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            margin: '0 0 8px',
          }}
        >
          Dev preview
        </p>
        <h1
          style={{
            fontFamily: 'var(--f-display)',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 400,
            color: 'var(--ink)',
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          Molds isolation viewer
        </h1>
        <p
          style={{
            fontFamily: 'var(--f-ui)',
            fontSize: 14,
            color: 'var(--ink-soft)',
            margin: '8px 0 0',
          }}
        >
          Each mold rendered with sample props. No auth required.
        </p>
      </div>

      {/* Section: Le Dialogue */}
      <div style={{ marginBottom: 56 }}>
        <p
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--ink-faint)',
            margin: '0 0 16px',
            borderBottom: '1px solid var(--rule)',
            paddingBottom: 12,
          }}
        >
          Mold 1 of 7: Le Dialogue
        </p>

        <Dialogue
          audio="/iles/_sample/audio/b1/dialogue.mp3"
          transcript={SAMPLE_TRANSCRIPT}
          comprehensionChecks={SAMPLE_CHECKS}
        />

        <div
          style={{
            background: 'var(--paper-tint)',
            border: '1px solid var(--rule)',
            borderRadius: 'var(--r-md)',
            padding: '16px 20px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 11,
              color: 'var(--ink-faint)',
              margin: 0,
            }}
          >
            Props: audio (string path) / transcript (Turn[]) / comprehensionChecks (ComprehensionCheck[])
          </p>
        </div>
      </div>

      {/* Placeholder rows for remaining 6 molds */}
      {[
        "L'Acte de Parole",
        'Le Chunk',
        'La Regle',
        'Le Son',
        "L'Activite",
        'La Tache',
      ].map((mold, i) => (
        <div
          key={mold}
          style={{
            borderBottom: i < 5 ? '1px solid var(--rule)' : 'none',
            paddingBottom: 32,
            marginBottom: 32,
          }}
        >
          <p
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--ink-faint)',
              margin: '0 0 12px',
            }}
          >
            Mold {i + 2} of 7: {mold}
          </p>
          <div
            style={{
              background: 'var(--paper-tint)',
              border: '1px dashed var(--rule-strong)',
              borderRadius: 'var(--r-lg)',
              padding: '32px 24px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--f-ui)',
                fontSize: 13,
                color: 'var(--ink-faint)',
                margin: 0,
              }}
            >
              {mold} a venir (Round 2+)
            </p>
          </div>
        </div>
      ))}
    </main>
  )
}
