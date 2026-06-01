import Link from 'next/link'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

const ROWS = [
  {
    id: 1,
    title: "Tâche 1 : Échange d'informations",
    feedback:
      "Vous avez posé des questions claires et pertinentes sur le sujet proposé. Votre débit était adapté au contexte, avec un bon contrôle de l'intonation. Les transitions entre vos questions étaient naturelles et bien enchaînées.",
  },
  {
    id: 2,
    title: "Tâche 2 : Échange d'opinions",
    feedback:
      "Votre justification était fluide, avec quelques hésitations attendues à ce niveau. Vous avez su maintenir le fil de votre argumentation sans vous écarter du sujet. L'expression de votre point de vue était directe et compréhensible.",
  },
  {
    id: 3,
    title: 'Tâche 3 : Comparaison et argumentation',
    feedback:
      'Vous avez su comparer les deux options et défendre votre choix avec cohérence. Votre vocabulaire était suffisamment varié pour exprimer des nuances. La structure de votre réponse était logique du début à la fin.',
  },
]

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
              fontWeight: 500,
              fontSize: 'clamp(15px, 1.6vw, 18px)',
              color: 'var(--text-primary)',
            }}
          >
            {row.title}
          </span>
          <p
            data-testid="tache-summary-feedback"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 400,
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {row.feedback}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              aria-disabled="true"
              style={{
                fontFamily: SANS_FONT,
                fontWeight: 500,
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                background: 'none',
                border: '1px solid var(--lm-border-subtle)',
                borderRadius: 999,
                padding: '5px 14px',
                cursor: 'not-allowed',
                opacity: 0.5,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                minHeight: 44,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              Réécouter
            </button>
            <Link
              data-testid={`tache-summary-relire-${row.id}`}
              href={`/l-examen/diagnostic/tache/${row.id}`}
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
                minHeight: 44,
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
