import Link from 'next/link'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'
import type { Lesson, LessonStatus } from '@/lib/types'

type VisualState = 'completed' | 'available' | 'locked'

function toVisualState(status: LessonStatus): VisualState {
  if (status === 'completed') return 'completed'
  if (status === 'locked') return 'locked'
  return 'available'
}

const STATE_LABEL_FR: Record<VisualState, string> = {
  completed: 'Terminée',
  available: 'Disponible',
  locked: 'Verrouillée',
}

function stateBadgeStyle(vs: VisualState): React.CSSProperties {
  switch (vs) {
    case 'completed':
      return {
        backgroundColor: 'var(--lm-pastel-sage)',
        color: 'var(--lm-bg-base)',
        border: '1px solid transparent',
      }
    case 'available':
      return {
        backgroundColor: 'var(--cta-utility)',
        color: '#fff',
        border: '1px solid transparent',
      }
    case 'locked':
      return {
        backgroundColor: 'transparent',
        color: 'var(--lm-text-tertiary)',
        border: '1px solid var(--lm-border-subtle)',
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
      style={{ flexShrink: 0, color: 'var(--lm-text-tertiary)' }}
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
  const vs = toVisualState(lesson.status)
  const isLocked = vs === 'locked'
  const badgeStyle = stateBadgeStyle(vs)

  return (
    <Link
      href={`/la-methode/${lesson.lessonNumber}`}
      data-testid="lesson-card"
      data-lesson-id={lesson.lessonNumber}
      data-lesson-state={vs}
      className={isLocked ? undefined : 'ed-card-lift'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        height: '100%',
        padding: 'clamp(20px, 2vw, 24px)',
        backgroundColor: 'var(--lm-bg-surface)',
        border: '1px solid var(--lm-border-subtle)',
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
            color: 'var(--lm-text-tertiary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {lesson.lessonNumber}
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
          {STATE_LABEL_FR[vs]}
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
          color: 'var(--lm-text-primary)',
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
          color: 'var(--lm-text-tertiary)',
          margin: 0,
        }}
      >
        {lesson.shortDescription}
      </p>
    </Link>
  )
}
