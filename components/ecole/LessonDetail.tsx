import { SANS_FONT, SERIF_FONT } from '@/lib/typography'
import type { Lesson, LessonSection } from '@/lib/data/lessons'
import Breadcrumb from '@/components/common/Breadcrumb'
import AudioPlayerPlaceholder from './AudioPlayerPlaceholder'
import LessonNav from './LessonNav'

const SECTION_LABEL_FR: Record<LessonSection, string> = {
  fondations: 'Fondations',
  approfondissement: 'Approfondissement',
}

export default function LessonDetail({ lesson }: { lesson: Lesson }) {
  const sectionLabel = SECTION_LABEL_FR[lesson.section]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingTop: 8 }}>
      <Breadcrumb
        testId="lesson-breadcrumb"
        items={[
          { label: "L'École", href: '/ecole' },
          { label: `Leçon ${lesson.id} : ${lesson.title}` },
        ]}
      />

      <header style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span
          data-testid="lesson-section-badge"
          style={{
            alignSelf: 'flex-start',
            fontFamily: SANS_FONT,
            fontWeight: 600,
            fontSize: '0.6875rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            backgroundColor: 'var(--accent-primary-soft)',
            padding: '4px 10px',
            borderRadius: 999,
          }}
        >
          {sectionLabel}
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
          <span
            data-testid="lesson-detail-number"
            style={{
              fontFamily: SERIF_FONT,
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 'clamp(28px, 3vw, 40px)',
              lineHeight: 1,
              letterSpacing: '-0.01em',
              color: 'var(--text-muted)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {lesson.id}
          </span>
          <h1
            style={{
              fontFamily: SERIF_FONT,
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 'clamp(28px, 3.5vw, 44px)',
              lineHeight: 1.15,
              letterSpacing: '-0.015em',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            {lesson.title}
          </h1>
        </div>
        <p
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 400,
            fontSize: '1rem',
            lineHeight: 1.55,
            color: 'var(--text-muted)',
            margin: 0,
            maxWidth: 680,
          }}
        >
          {lesson.description}
        </p>
      </header>

      <AudioPlayerPlaceholder />

      <ContentSection
        id="introduction"
        title="Introduction"
        paragraphs={[
          "Dans cette leçon, vous découvrirez les réflexes à installer avant de passer à la pratique. L'objectif est de poser un cadre clair plutôt que d'empiler des règles.",
          "Prenez le temps de lire calmement — la méthode privilégie l'ancrage à la quantité. Une idée bien comprise tient mieux qu'une dizaine survolées.",
          "Quand vous serez prêt(e), passez à la Méthode pour entrer dans le détail des mécanismes que cette leçon traite.",
        ]}
      />

      <ContentSection
        id="methode"
        title="Méthode"
        paragraphs={[
          "La méthode s'articule autour des cinq couches qui structurent toute prise de parole spontanée : forme, fond, rythme, lien, registre. Cette leçon en travaille un sous-ensemble.",
          "Vous trouverez ici les points d'attention concrets — quoi écouter, quoi reproduire, quoi éviter. Aucun jargon : on décrit ce que fait la langue, pas ce qu'on en dit.",
          "Lisez d'abord, écoutez ensuite. La compréhension précède l'imitation : c'est dans cet ordre que les réflexes s'installent durablement.",
        ]}
      />

      <ContentSection
        id="pratique"
        title="Pratique"
        paragraphs={[
          'Essayez à voix haute, sans relire la leçon. Notez les hésitations — ce sont elles qui indiquent où la couche n\'est pas encore automatique.',
        ]}
        prompts={[
          'Reformulez l\'idée de la leçon en une phrase, sans utiliser les mots du texte.',
          'Donnez un exemple personnel qui illustre le point central — vingt secondes maximum.',
          'Anticipez une question d\'examinateur sur ce point et préparez une réponse en trois temps : position, raison, exemple.',
        ]}
      />

      <LessonNav currentId={lesson.id} />
    </div>
  )
}

function ContentSection({
  id,
  title,
  paragraphs,
  prompts,
}: {
  id: string
  title: string
  paragraphs: string[]
  prompts?: string[]
}) {
  return (
    <section
      data-testid={`lesson-section-${id}`}
      aria-labelledby={`lesson-section-${id}-heading`}
      style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      <h2
        id={`lesson-section-${id}-heading`}
        style={{
          fontFamily: SERIF_FONT,
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: 'clamp(22px, 2.6vw, 30px)',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 680 }}>
        {paragraphs.map((p, i) => (
          <p
            key={i}
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 400,
              fontSize: '1rem',
              lineHeight: 1.6,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            {p}
          </p>
        ))}
      </div>
      {prompts && prompts.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            maxWidth: 680,
          }}
        >
          {prompts.map((prompt, i) => (
            <li
              key={i}
              style={{
                fontFamily: SANS_FONT,
                fontWeight: 400,
                fontSize: '0.9375rem',
                lineHeight: 1.55,
                color: 'var(--text-primary)',
                padding: '12px 14px',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--rule-default)',
                borderRadius: 4,
              }}
            >
              {prompt}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
