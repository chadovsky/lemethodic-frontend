import Link from 'next/link'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

const TOTAL_LESSONS = 27

export default function LessonNav({ currentId }: { currentId: number }) {
  const prevNumber = currentId > 1 ? currentId - 1 : null
  const nextNumber = currentId < TOTAL_LESSONS ? currentId + 1 : null

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
      {prevNumber !== null ? (
        <NavLink
          testId="lesson-nav-prev"
          href={`/cours/methode-tcf-canada/lecon-${prevNumber}`}
          direction="prev"
          lessonNumber={prevNumber}
        />
      ) : (
        <span />
      )}
      {nextNumber !== null ? (
        <NavLink
          testId="lesson-nav-next"
          href={`/cours/methode-tcf-canada/lecon-${nextNumber}`}
          direction="next"
          lessonNumber={nextNumber}
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
}: {
  testId: string
  href: string
  direction: 'prev' | 'next'
  lessonNumber: number
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
        {lessonNumber}
      </span>
    </Link>
  )
}
