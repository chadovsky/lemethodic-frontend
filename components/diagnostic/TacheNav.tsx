import Link from 'next/link'
import { SANS_FONT } from '@/lib/typography'
import type { TacheId } from '@/lib/data/taches'

const NAV_LINK_STYLE = {
  fontFamily: SANS_FONT,
  fontWeight: 600,
  fontSize: '0.9375rem',
  color: 'var(--text-primary)',
  textDecoration: 'none',
  padding: '10px 20px',
  border: '1px solid var(--rule-default)',
  borderRadius: 4,
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 44,
}

export default function TacheNav({ tacheId }: { tacheId: TacheId }) {
  const hasPrev = tacheId > 1
  const hasNext = tacheId < 3

  return (
    <nav
      data-testid="tache-nav"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        paddingTop: 8,
        borderTop: '1px solid var(--rule-default)',
      }}
    >
      {hasPrev ? (
        <Link
          data-testid="tache-nav-prev"
          href={`/maitre/diagnostic/tache/${tacheId - 1}`}
          className="ed-btn-press"
          style={NAV_LINK_STYLE}
        >
          ← Tâche précédente
        </Link>
      ) : (
        <span />
      )}

      {hasNext ? (
        <Link
          data-testid="tache-nav-next"
          href={`/maitre/diagnostic/tache/${(tacheId + 1) as TacheId}`}
          className="ed-btn-press"
          style={NAV_LINK_STYLE}
        >
          Tâche suivante →
        </Link>
      ) : (
        <Link
          data-testid="tache-nav-results"
          href="/maitre/diagnostic/results"
          className="ed-btn-press"
          style={{
            ...NAV_LINK_STYLE,
            backgroundColor: 'var(--cta-utility)',
            borderColor: 'var(--cta-utility)',
            color: 'var(--bg-elevated)',
          }}
        >
          Voir les résultats
        </Link>
      )}
    </nav>
  )
}
