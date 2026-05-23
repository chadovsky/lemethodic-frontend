import Link from 'next/link'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'
import { NEXT_LESSON } from '@/lib/data/dashboard'

export default function NextLessonWidget() {
  return (
    <section
      data-testid="dashboard-widget-prochaine-lecon"
      className="ed-card-lift"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 4,
        padding: 'clamp(20px, 2vw, 28px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <h2
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
        Prochaine leçon
      </h2>

      <p
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 500,
          fontSize: '1rem',
          lineHeight: 1.4,
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        Leçon {NEXT_LESSON.id} : {NEXT_LESSON.title}
      </p>

      <Link
        href={`/ecole/${NEXT_LESSON.id}`}
        className="ed-btn-press"
        style={{
          alignSelf: 'flex-start',
          marginTop: 'auto',
          padding: '10px 18px',
          backgroundColor: 'var(--cta-primary)',
          color: '#ffffff',
          fontFamily: SANS_FONT,
          fontWeight: 600,
          fontSize: '0.875rem',
          letterSpacing: '0.01em',
          textDecoration: 'none',
          borderRadius: 4,
          minHeight: 44,
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        Reprendre
      </Link>
    </section>
  )
}
