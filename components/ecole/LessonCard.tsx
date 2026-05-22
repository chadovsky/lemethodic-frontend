import Link from 'next/link'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'
import { STATE_LABEL_FR, type Lesson, type LessonState } from '@/lib/data/lessons'

function stateBadgeStyle(state: LessonState): React.CSSProperties {
  switch (state) {
    case 'completed':
      return {
        backgroundColor: 'var(--fp-sage)',
        color: 'var(--ed-bg)',
        border: '1px solid transparent',
      }
    case 'available':
      return {
        backgroundColor: 'var(--ed-accent)',
        color: '#fff',
        border: '1px solid transparent',
      }
    case 'locked':
      return {
        backgroundColor: 'transparent',
        color: 'var(--ed-muted)',
        border: '1px solid var(--ed-rule)',
      }
  }
}

function LockIcon() {
  return (
    <svg
      data-testid="lesson-lock-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0, color: 'var(--ed-muted)' }}
    >
      <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M5 7V5a3 3 0 0 1 6 0v2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function LessonCard({ lesson }: { lesson: Lesson }) {
  const isLocked = lesson.state === 'locked'
  const badgeStyle = stateBadgeStyle(lesson.state)

  return (
    <Link
      href={`/ecole/${lesson.id}`}
      data-testid="lesson-card"
      data-lesson-id={lesson.id}
      data-lesson-state={lesson.state}
      className={isLocked ? undefined : 'ed-card-lift'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        height: '100%',
        padding: 'clamp(20px, 2vw, 24px)',
        backgroundColor: 'var(--ed-paper)',
        border: '1px solid var(--ed-rule)',
        borderRadius: 4,
        textDecoration: 'none',
        opacity: isLocked ? 0.65 : 1,
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
            color: 'var(--ed-muted)',
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
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 10px',
            borderRadius: 999,
            whiteSpace: 'nowrap',
            ...badgeStyle,
          }}
        >
          {isLocked && <LockIcon />}
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
          color: 'var(--ed-fg)',
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
          color: 'var(--ed-muted)',
          margin: 0,
        }}
      >
        {lesson.description}
      </p>
    </Link>
  )
}
