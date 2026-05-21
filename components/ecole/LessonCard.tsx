import Link from 'next/link'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'
import { STATE_LABEL_FR, type Lesson, type LessonState } from '@/lib/data/lessons'

function stateBadgeColors(state: LessonState): { bg: string; fg: string } {
  switch (state) {
    case 'completed':
      return { bg: 'var(--accent-primary-soft)', fg: 'var(--text-primary)' }
    case 'available':
      return { bg: 'var(--bg-subtle)', fg: 'var(--text-primary)' }
    case 'locked':
      return { bg: 'transparent', fg: 'var(--text-muted)' }
  }
}

export default function LessonCard({ lesson }: { lesson: Lesson }) {
  const badgeColors = stateBadgeColors(lesson.state)
  const isLocked = lesson.state === 'locked'

  return (
    <Link
      href={`/ecole/${lesson.id}`}
      data-testid="lesson-card"
      data-lesson-id={lesson.id}
      data-lesson-state={lesson.state}
      className="ed-card-lift"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        height: '100%',
        padding: 'clamp(20px, 2vw, 24px)',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 4,
        textDecoration: 'none',
        opacity: isLocked ? 0.72 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <span
          data-testid="lesson-card-number"
          style={{
            fontFamily: SERIF_FONT,
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: '1.5rem',
            lineHeight: 1,
            letterSpacing: '-0.01em',
            color: 'var(--text-muted)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {lesson.id}
        </span>
        <span
          data-testid="lesson-card-state"
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 600,
            fontSize: '0.6875rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: badgeColors.fg,
            backgroundColor: badgeColors.bg,
            border:
              lesson.state === 'locked'
                ? '1px solid var(--rule-default)'
                : '1px solid transparent',
            padding: '4px 10px',
            borderRadius: 999,
            whiteSpace: 'nowrap',
          }}
        >
          {STATE_LABEL_FR[lesson.state]}
        </span>
      </div>

      <h3
        style={{
          fontFamily: SERIF_FONT,
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: 'clamp(18px, 1.6vw, 22px)',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        {lesson.title}
      </h3>

      <p
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 400,
          fontSize: '0.875rem',
          lineHeight: 1.5,
          color: 'var(--text-muted)',
          margin: 0,
        }}
      >
        {lesson.description}
      </p>
    </Link>
  )
}
