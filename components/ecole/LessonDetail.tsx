'use client'

import { SANS_FONT, SERIF_FONT } from '@/lib/typography'
import type { Lesson } from '@/lib/types'
import Breadcrumb from '@/components/common/Breadcrumb'
import AudioPlayerPlaceholder from './AudioPlayerPlaceholder'
import LessonNav from './LessonNav'

function sectionLabel(phase: 1 | 2): string {
  return phase === 1 ? 'Fondations' : 'Approfondissement'
}

export default function LessonDetail({ lesson }: { lesson: Lesson }) {
  const cefr = lesson.phase === 1 ? 'B1' : 'B2'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingTop: 8 }}>
      <Breadcrumb
        testId="lesson-breadcrumb"
        items={[
          { label: "La Méthode", href: '/la-methode' },
          { label: `Leçon ${lesson.lessonNumber} : ${lesson.title}` },
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
            color: 'var(--cta-utility)',
            backgroundColor: 'var(--lm-bg-base)',
            border: '1px solid var(--lm-border-subtle)',
            padding: '4px 10px',
            borderRadius: 999,
          }}
        >
          {sectionLabel(lesson.phase)}
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
          <span
            data-testid="lesson-detail-number"
            style={{
              fontFamily: SERIF_FONT,
              fontWeight: 500,
              fontSize: 'clamp(28px, 3vw, 40px)',
              lineHeight: 1,
              letterSpacing: '-0.01em',
              color: 'var(--lm-text-tertiary)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {lesson.lessonNumber}
          </span>
          <h1
            style={{
              fontFamily: SERIF_FONT,
              fontWeight: 500,
              fontSize: 'clamp(28px, 3.5vw, 44px)',
              lineHeight: 1.15,
              letterSpacing: '-0.015em',
              color: 'var(--lm-text-primary)',
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
            color: 'var(--lm-text-tertiary)',
            margin: 0,
            maxWidth: 680,
          }}
        >
          {lesson.shortDescription}
        </p>
      </header>

      <AudioPlayerPlaceholder cefr={cefr} />

      <ContentSection
        id="introduction"
        title="Introduction"
        paragraphs={[
          "Dans cette leçon, vous découvrirez les mécanismes qui permettent de prendre la parole avec fluidité. L'objectif est de poser un cadre clair et de comprendre l'intention avant de pratiquer.",
          "Prenez le temps de lire attentivement : la compréhension précède l'imitation, et une idée bien ancrée produit des réflexes durables.",
        ]}
      />

      <ContentSection
        id="methode"
        title="Méthode"
        paragraphs={[
          "La méthode met en lumière les points d'attention concrets : quoi observer à l'écoute, quoi reproduire à la pratique, et quels pièges éviter. Aucun jargon technique : on décrit ce que fait la langue.",
          "Lisez d'abord, écoutez ensuite. L'ordre compte : la compréhension intellectuelle prépare l'oreille, et l'oreille guide la production.",
        ]}
      />

      <ContentSection
        id="pratique"
        title="Pratique"
        paragraphs={[
          "Essayez à voix haute, sans relire la leçon. Notez les hésitations : elles indiquent précisément où le réflexe n'est pas encore automatique.",
          "Répétez l'exercice à intervalles espacés : le lendemain, puis trois jours plus tard. La répétition espacée consolide ce que la pratique initiale a installé.",
        ]}
        prompts={[
          "Reformulez l'idée de la leçon en une phrase, sans utiliser les mots du texte.",
          'Donnez un exemple personnel qui illustre le point central, vingt secondes maximum.',
          "Anticipez une question d'examinateur sur ce point et préparez une réponse en trois temps : position, raison, exemple.",
        ]}
      />

      <LessonNav currentId={lesson.lessonNumber} />
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
          fontWeight: 500,
          fontSize: 'clamp(22px, 2.6vw, 30px)',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          color: 'var(--lm-text-primary)',
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
              color: 'var(--lm-text-primary)',
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
                color: 'var(--lm-text-primary)',
                padding: '12px 14px',
                backgroundColor: 'var(--lm-bg-base)',
                border: '1px solid var(--lm-border-subtle)',
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
