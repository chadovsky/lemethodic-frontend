import Link from 'next/link'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'
import { getLessonById } from '@/lib/data/lessons'

export default function LessonNav({ currentId }: { currentId: number }) {
  const prev = getLessonById(currentId - 1)
  const next = getLessonById(currentId + 1)

  return (
    <nav
      aria-label="Navigation entre leçons"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        gap: 16,
        paddingTop: 24,
        borderTop: '1px solid var(--rule-default)',
        flexWrap: 'wrap',
      }}
    >
      {prev ? (
        <NavLink
          testId="lesson-nav-prev"
          href={`/ecole/${prev.id}`}
          direction="prev"
          lessonNumber={prev.id}
          lessonTitle={prev.title}
        />
      ) : (
        <span />
      )}
      {next ? (
        <NavLink
          testId="lesson-nav-next"
          href={`/ecole/${next.id}`}
          direction="next"
          lessonNumber={next.id}
          lessonTitle={next.title}
        />
      ) : (
        <span />
      )}
    </nav>
  )
}

function NavLink({
  testId,
  href,
  direction,
  lessonNumber,
  lessonTitle,
}: {
  testId: string
  href: string
  direction: 'prev' | 'next'
  lessonNumber: number
  lessonTitle: string
}) {
  const label = direction === 'prev' ? '← Leçon précédente' : 'Leçon suivante →'
  const align = direction === 'prev' ? 'flex-start' : 'flex-end'
  return (
    <Link
      href={href}
      data-testid={testId}
      className="ed-card-lift"
      style={{
        flex: '1 1 240px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: align,
        gap: 6,
        padding: '14px 18px',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 4,
        textDecoration: 'none',
        textAlign: direction === 'prev' ? 'left' : 'right',
      }}
    >
      <span
        style={{
          fontFamily: SANS_FONT,
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: SERIF_FONT,
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: '1rem',
          lineHeight: 1.3,
          color: 'var(--text-primary)',
        }}
      >
        {lessonNumber}. {lessonTitle}
      </span>
    </Link>
  )
}
