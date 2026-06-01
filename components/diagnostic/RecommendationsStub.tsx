import Link from 'next/link'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

const ROWS = [
  {
    layer: 'La Construction',
    initials: 'LC',
    chipColor: 'var(--lm-pastel-sky)',
    suggestion:
      'Renforcer les structures syntaxiques pour fluidifier vos réponses spontanées.',
    cta: { label: 'Renforcer La Construction', href: '/cours/methode-tcf-canada' },
  },
  {
    layer: 'Le Propos',
    initials: 'LP',
    chipColor: 'var(--lm-pastel-sage)',
    suggestion:
      'Étoffer votre réservoir lexical sur les thèmes de la vie courante.',
    cta: { label: 'Étoffer Le Propos', href: '/la-bibliotheque' },
  },
  {
    layer: 'La Musique',
    initials: 'LM',
    chipColor: 'var(--lm-pastel-butter)',
    suggestion:
      "Travailler l'intonation et le débit sur les tâches orales courtes.",
    cta: { label: 'Travailler La Musique', href: '/l-examen/diagnostic/tache/1' },
  },
]

export default function RecommendationsStub() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {ROWS.map((row) => (
        <div
          key={row.layer}
          data-testid="recommendation-row"
          className="ed-card-lift"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            padding: 'clamp(12px, 1.5vw, 16px) clamp(14px, 2vw, 20px)',
            backgroundColor: 'var(--lm-bg-surface)',
            border: '1px solid var(--lm-border-subtle)',
            borderRadius: 8,
          }}
        >
          {/* Left: chip + text */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 200 }}>
            {/* Layer-chip badge */}
            <div
              data-testid="recommendation-chip"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: row.chipColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: SANS_FONT,
                fontWeight: 600,
                fontSize: '0.75rem',
                color: 'var(--text-primary)',
                flexShrink: 0,
              }}
            >
              {row.initials}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span
                data-testid="recommendation-layer"
                style={{
                  fontFamily: SERIF_FONT,
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
          </div>

          {/* CTA pill */}
          <Link
            data-testid="recommendation-cta"
            href={row.cta.href}
            className="ed-btn-press"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: '0.875rem',
              color: '#fff',
              textDecoration: 'none',
              backgroundColor: 'var(--cta-utility)',
              border: '1px solid var(--cta-utility)',
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
