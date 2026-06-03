// Dev-only route: /dev/molds
// Renders each mold in isolation with hardcoded sample props for visual QA.
// Not linked from any nav surface. Remove or gate behind env check before public launch.
//
// NOTE: The dispatch references /_dev/molds, but Next.js App Router treats underscore-
// prefixed folders as private (excluded from routing). Route is /dev/molds to match
// the existing app/dev/bientot convention.

import Dialogue from '@/components/iles/molds/Dialogue'
import ActeDeParole from '@/components/iles/molds/ActeDeParole'
import Chunk from '@/components/iles/molds/Chunk'
import Regle from '@/components/iles/molds/Regle'
import Son from '@/components/iles/molds/Son'
import Activite from '@/components/iles/molds/Activite'
import Tache from '@/components/iles/molds/Tache'

export const metadata = {
  title: 'Molds Dev | Le Méthodic',
  robots: { index: false, follow: false },
}

// ─── Le Dialogue sample data ───────────────────────────────────────────────

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

// ─── L'Acte de Parole sample data ──────────────────────────────────────────

const SAMPLE_FORMULES = [
  { text: "Pourriez-vous répéter, s'il vous plaît?" },
  { text: "Je n'ai pas bien compris. Vous pouvez répéter?" },
  { text: "Excusez-moi, pourriez-vous parler plus lentement?" },
  { text: "Pardon, je n'ai pas saisi. Vous dites...?" },
]

// ─── Le Chunk sample data ──────────────────────────────────────────────────

const SAMPLE_EXAMPLES = [
  "Il a l'air d'être fatigué aujourd'hui.",
  "Elle a l'air de connaître tout le monde ici.",
  "Ils ont l'air de s'amuser beaucoup.",
]

// ─── La Règle sample data ──────────────────────────────────────────────────

const SAMPLE_EXEMPLES = [
  { sentence: "Mon frère est grand et sportif.", highlight: "grand et sportif" },
  { sentence: "Ma sœur est grande et sportive.", highlight: "grande et sportive" },
  { sentence: "Mes parents sont gentils et généreux.", highlight: "gentils et généreux" },
  { sentence: "Mes cousines sont gentilles et généreuses.", highlight: "gentilles et généreuses" },
]

// ─── Section wrapper ────────────────────────────────────────────────────────

function MoldSection({
  index,
  total,
  label,
  children,
  propsLine,
}: {
  index: number
  total: number
  label: string
  children: React.ReactNode
  propsLine: string
}) {
  return (
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
        Mold {index} of {total}: {label}
      </p>

      {children}

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
          {propsLine}
        </p>
      </div>
    </div>
  )
}

function PlaceholderMold({ index, total, label }: { index: number; total: number; label: string }) {
  return (
    <div
      style={{
        borderBottom: index < total ? '1px solid var(--rule)' : 'none',
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
        Mold {index} of {total}: {label}
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
          {label} à venir (Round 3+)
        </p>
      </div>
    </div>
  )
}

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

      {/* Mold 1: Le Dialogue */}
      <MoldSection
        index={1}
        total={7}
        label="Le Dialogue"
        propsLine="Props: audio (string path) / transcript (Turn[]) / comprehensionChecks (ComprehensionCheck[])"
      >
        <Dialogue
          audio="/iles/_sample/audio/b1/dialogue.mp3"
          transcript={SAMPLE_TRANSCRIPT}
          comprehensionChecks={SAMPLE_CHECKS}
        />
      </MoldSection>

      {/* Mold 2: L'Acte de Parole */}
      <MoldSection
        index={2}
        total={7}
        label="L'Acte de Parole"
        propsLine="Props: fonction (string) / formules (Formula[]: text, audio?) / register ('familier' | 'courant' | 'soutenu')"
      >
        <ActeDeParole
          fonction="Demander poliment de répéter"
          formules={SAMPLE_FORMULES}
          register="courant"
        />
      </MoldSection>

      {/* Mold 3: Le Chunk */}
      <MoldSection
        index={3}
        total={7}
        label="Le Chunk"
        propsLine="Props: chunk (string FR) / gloss (string EN) / examples (string[]) / audio? (string) / register? (string)"
      >
        <Chunk
          chunk="avoir l'air de + infinitif"
          gloss="to seem to / to look like one is"
          examples={SAMPLE_EXAMPLES}
          register="expression idiomatique"
        />
      </MoldSection>

      {/* Mold 4: La Règle */}
      <MoldSection
        index={4}
        total={7}
        label="La Règle"
        propsLine="Props: regle (string) / structure (string) / exemples (RegleExample[]: sentence, highlight) / piege? (string)"
      >
        <Regle
          regle="En français, l'adjectif qualificatif s'accorde en genre et en nombre avec le nom qu'il qualifie."
          structure="nom (masc. sg.) + adj. (masc. sg.)   /   nom (fém. sg.) + adj. (fém. sg.)"
          exemples={SAMPLE_EXEMPLES}
          piege="Certains adjectifs comme 'beau' et 'nouveau' changent de forme devant un nom masculin commençant par une voyelle: un bel homme, un nouvel ami."
        />
      </MoldSection>

      {/* Mold 5: Le Son */}
      <MoldSection
        index={5}
        total={7}
        label="Le Son"
        propsLine="Props: phoneme (IPA string) / description? (string) / words (Word[]: fr, audioSrc?) / minimalPairs (MinimalPair[]: a, b, audioA?, audioB?) / articulationNote? (string)"
      >
        <Son
          phoneme="/ʁ/"
          description="Le R grasseye francais. Il se produit dans la gorge, pas a l'avant de la bouche comme en anglais."
          words={[
            { fr: "frere" },
            { fr: "pere" },
            { fr: "mere" },
            { fr: "famille" },
          ]}
          minimalPairs={[
            { a: "rue", b: "lue" },
            { a: "roue", b: "loue" },
            { a: "rie", b: "lie" },
          ]}
          articulationNote="Imaginez que vous faites un leger gargarisme. Le son vient du fond de la gorge — laissez l'air vibrer contre la luette. Ne bougez pas les levres."
        />
      </MoldSection>

      {/* Mold 6: L'Activite — all 4 subtypes */}
      <MoldSection
        index={6}
        total={7}
        label="L'Activite (4 subtypes)"
        propsLine="Props: subtype ('comprehension' | 'reflexe' | 'reemploi' | 'conversation') + subtype-specific fields"
      >
        {/* 6a: comprehension */}
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-faint)', margin: '0 0 12px' }}>
          6a — comprehension
        </p>
        <Activite
          subtype="comprehension"
          question="Que fait le pere de Theo dans la vie?"
          options={[
            "Il est medecin",
            "Il est professeur",
            "Il est architecte",
            "Il travaille dans la finance",
          ]}
          correctIndex={2}
          feedbackCorrect="Exact. Le pere de Theo est architecte."
          feedbackWrong="Attention — c'est la mere de Theo qui travaille dans la finance."
        />

        {/* 6b: reflexe */}
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-faint)', margin: '0 0 12px' }}>
          6b — reflexe
        </p>
        <Activite
          subtype="reflexe"
          items={[
            { prompt: "Mon frere est very tall pour son age.", expected: "Mon frere est tres grand pour son age." },
            { prompt: "Mes parents sont very supportifs.", expected: "Mes parents me soutiennent beaucoup." },
            { prompt: "On se voit every weekend en famille.", expected: "On se voit tous les week-ends en famille." },
          ]}
        />

        {/* 6c: reemploi */}
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-faint)', margin: '0 0 12px' }}>
          6c — reemploi
        </p>
        <Activite
          subtype="reemploi"
          items={[
            { prompt: "Decrivez la profession d'un de vos parents en une phrase complete.", modelAnswer: "Mon pere est ingenieur et travaille dans une grande entreprise depuis vingt ans." },
            { prompt: "Exprimez l'affection pour un membre de votre famille.", modelAnswer: "Ma soeur cadette est une source d'inspiration — son courage m'a toujours impressionne." },
          ]}
        />

        {/* 6d: conversation */}
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-faint)', margin: '0 0 12px' }}>
          6d — conversation
        </p>
        <Activite
          subtype="conversation"
          scenario="Vous rencontrez votre nouveau collegue lors d'une pause cafe. Il s'interesse a votre famille."
          openingPrompt="Alors, vous venez d'une grande famille?"
        />
      </MoldSection>

      {/* Mold 7: La Tache */}
      <MoldSection
        index={7}
        total={7}
        label="La Tache"
        propsLine="Props: prompt (string) / scenario (string) / targetLength (string) / type? ('oral' | 'writing', default 'oral')"
      >
        <Tache
          prompt="Presentez votre famille a un responsable d'association qui vous accueille dans une rencontre communautaire. Decrivez qui sont vos proches, quels sont leurs metiers, et ce que la famille represente pour vous."
          scenario="Vous participez a une rencontre communautaire a Montreal. Un benevole vous accueille et vous invite a vous presenter avec votre entourage."
          targetLength="3-4 minutes"
          type="oral"
        />
      </MoldSection>
    </main>
  )
}
