import Link from 'next/link'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

const ROWS = [
  {
    id: 1,
    title: "Tâche 1 : Échange d'informations",
    feedback:
      'Vous avez posé des questions claires et pertinentes sur le sujet proposé.',
  },
  {
    id: 2,
    title: "Tâche 2 : Échange d'opinions",
    feedback:
      'Votre justification était fluide, avec quelques hésitations attendues à ce niveau.',
  },
  {
    id: 3,
    title: 'Tâche 3 : Comparaison et argumentation',
    feedback:
      'Vous avez su comparer les deux options et défendre votre choix avec cohérence.',
  },
] as const

export default function TacheSummary() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {ROWS.map((row) => (
        <div
          key={row.id}
          data-testid="tache-summary-row"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            padding: 'clamp(12px, 1.5vw, 16px) clamp(14px, 2vw, 20px)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--rule-default)',
            borderRadius: 4,
          }}
        >
          <span
            style={{
              fontFamily: SERIF_FONT,
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 'clamp(15px, 1.6vw, 18px)',
              color: 'var(--text-primary)',
            }}
          >
            {row.title}
          </span>
          <p
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 400,
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {row.feedback}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              style={{
                fontFamily: SANS_FONT,
                fontWeight: 500,
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                background: 'none',
                border: '1px solid var(--rule-default)',
                borderRadius: 4,
                padding: '5px 12px',
                cursor: 'default',
              }}
            >
              Réécouter
            </button>
            <Link
              data-testid={`tache-summary-relire-${row.id}`}
              href={`/diagnostic/tache/${row.id}`}
              style={{
                fontFamily: SANS_FONT,
                fontWeight: 500,
                fontSize: '0.8125rem',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                border: '1px solid var(--rule-default)',
                borderRadius: 4,
                padding: '5px 12px',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Relire l&rsquo;énoncé
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
