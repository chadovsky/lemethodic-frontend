import Link from 'next/link'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'
import type { LeconEntry } from '@/content/methode/lecons'

function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
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

const cardBase: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  height: '100%',
  padding: 'clamp(20px, 2vw, 24px)',
  backgroundColor: 'var(--lm-bg-surface)',
  border: '1px solid var(--lm-border-subtle)',
  borderRadius: 4,
  textDecoration: 'none',
}

export default function IleLeconCard({ lecon }: { lecon: LeconEntry }) {
  const isAvailable = lecon.status === 'available'

  const numberEl = (
    <span
      style={{
        fontFamily: SERIF_FONT,
        fontWeight: 500,
        fontSize: '1.5rem',
        lineHeight: 1,
        letterSpacing: '-0.01em',
        color: 'var(--lm-text-tertiary)',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {lecon.number}
    </span>
  )

  const badge = isAvailable ? (
    <span
      style={{
        fontFamily: SANS_FONT,
        fontWeight: 600,
        fontSize: '0.6875rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase' as const,
        padding: '4px 10px',
        borderRadius: 999,
        whiteSpace: 'nowrap' as const,
        backgroundColor: 'var(--cta-utility)',
        color: '#fff',
      }}
    >
      Disponible
    </span>
  ) : (
    <span
      style={{
        fontFamily: SANS_FONT,
        fontWeight: 600,
        fontSize: '0.6875rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase' as const,
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 10px',
        borderRadius: 999,
        whiteSpace: 'nowrap' as const,
        backgroundColor: 'transparent',
        color: 'var(--lm-text-tertiary)',
        border: '1px solid var(--lm-border-subtle)',
      }}
    >
      <LockIcon />
      Bientôt
    </span>
  )

  const titleEl = (
    <p
      style={{
        fontFamily: SERIF_FONT,
        fontWeight: 500,
        fontSize: 'clamp(17px, 1.5vw, 21px)',
        lineHeight: 1.2,
        letterSpacing: '-0.01em',
        color: isAvailable ? 'var(--lm-text-primary)' : 'var(--lm-text-tertiary)',
        margin: 0,
      }}
    >
      {lecon.title}
    </p>
  )

  const inner = (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        {numberEl}
        {badge}
      </div>
      {titleEl}
    </>
  )

  if (isAvailable) {
    return (
      <Link
        href={`/ile/${lecon.themeSlug}`}
        data-testid="ile-lecon-card"
        data-lecon-number={lecon.number}
        data-lecon-status="available"
        className="ed-card-lift"
        style={cardBase}
      >
        {inner}
      </Link>
    )
  }

  return (
    <div
      data-testid="ile-lecon-card"
      data-lecon-number={lecon.number}
      data-lecon-status="bientot"
      style={{ ...cardBase, opacity: 0.55, cursor: 'default' }}
    >
      {inner}
    </div>
  )
}
