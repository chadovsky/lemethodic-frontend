import Link from 'next/link'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

const ROWS = [
  {
    layer: 'Les Moules',
    suggestion:
      'Renforcer les structures syntaxiques pour fluidifier vos réponses spontanées.',
    cta: { label: 'Renforcer Les Moules', href: '/ecole' },
  },
  {
    layer: 'Le Fond',
    suggestion:
      'Étoffer votre réservoir lexical sur les thèmes de la vie courante.',
    cta: { label: 'Étoffer Le Fond', href: '/vocabulaire' },
  },
  {
    layer: 'La Voix',
    suggestion:
      "Travailler l'intonation et le débit sur les tâches orales courtes.",
    cta: { label: 'Travailler La Voix', href: '/diagnostic/tache/1' },
  },
] as const

export default function RecommendationsStub() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {ROWS.map((row) => (
        <div
          key={row.layer}
          data-testid="recommendation-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            padding: 'clamp(12px, 1.5vw, 16px) clamp(14px, 2vw, 20px)',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--rule-default)',
            borderRadius: 4,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 200 }}>
            <span
              data-testid="recommendation-layer"
              style={{
                fontFamily: SERIF_FONT,
                fontStyle: 'italic',
                fontWeight: 500,
                fontSize: 'clamp(14px, 1.5vw, 16px)',
                color: 'var(--text-primary)',
              }}
            >
              {row.layer}
            </span>
            <p
              data-testid="recommendation-suggestion"
              style={{
                fontFamily: SANS_FONT,
                fontWeight: 400,
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {row.suggestion}
            </p>
          </div>
          <Link
            data-testid="recommendation-cta"
            href={row.cta.href}
            className="ed-btn-press"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              border: '1px solid var(--rule-default)',
              borderRadius: 4,
              padding: '8px 16px',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {row.cta.label}
          </Link>
        </div>
      ))}
    </div>
  )
}
