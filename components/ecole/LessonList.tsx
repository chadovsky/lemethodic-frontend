import type { ReactNode } from 'react'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'
import type { Lesson } from '@/lib/types'
import LessonCard from './LessonCard'

export default function LessonList({
  lessons,
  methodology,
}: {
  lessons: Lesson[]
  // F-483 - optional slot rendered between the page h1 header and the lesson
  // sections (so the methodology visualizer is the h2 right under the h1).
  methodology?: ReactNode
}) {
  const fondations = lessons.filter((l) => l.phase === 1)
  const approfondissement = lessons.filter((l) => l.phase === 2)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48, paddingTop: 8 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1
          style={{
            fontFamily: SERIF_FONT,
            fontWeight: 500,
            fontSize: 'clamp(32px, 4vw, 52px)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          La Méthode
        </h1>
        <p
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 500,
            fontSize: '1rem',
            color: 'var(--text-muted)',
            margin: 0,
          }}
        >
          La méthode en 27 leçons.
        </p>
        <p
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 400,
            fontSize: '0.9375rem',
            lineHeight: 1.55,
            color: 'var(--text-muted)',
            margin: '4px 0 0',
            maxWidth: 640,
          }}
        >
          Une progression linéaire — 16 leçons de Fondations pour ancrer les
          réflexes, puis 11 leçons d&rsquo;Approfondissement pour affûter
          l&rsquo;expression à l&rsquo;oral.
        </p>
      </header>

      {methodology}

      <Section
        id="fondations"
        title="Fondations"
        eyebrow="Leçons 1–16"
        lessons={fondations}
      />
      <Section
        id="approfondissement"
        title="Approfondissement"
        eyebrow="Leçons 17–27"
        lessons={approfondissement}
      />
    </div>
  )
}

function Section({
  id,
  title,
  eyebrow,
  lessons,
}: {
  id: string
  title: string
  eyebrow: string
  lessons: Lesson[]
}) {
  return (
    <section
      data-testid={`section-${id}`}
      aria-labelledby={`section-${id}-heading`}
      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          {eyebrow}
        </span>
        <h2
          id={`section-${id}-heading`}
          style={{
            fontFamily: SERIF_FONT,
            fontWeight: 500,
            fontSize: 'clamp(24px, 2.8vw, 34px)',
            lineHeight: 1.2,
            letterSpacing: '-0.015em',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>

      <ul
        className="ecole-grid"
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }}
      >
        {lessons.map((lesson) => (
          <li key={lesson.lessonNumber}>
            <LessonCard lesson={lesson} />
          </li>
        ))}
      </ul>
    </section>
  )
}
