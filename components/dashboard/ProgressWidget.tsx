import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

const LAYERS = [
  { slug: 'le-fond', name: 'Le Fond', percent: 80 },
  { slug: 'les-moules-des-idees', name: 'Les Moules des Idées', percent: 60 },
  { slug: 'les-moules', name: 'Les Moules', percent: 50 },
  { slug: 'les-reflexes-anglais', name: 'Les Réflexes Anglais', percent: 35 },
  { slug: 'la-voix', name: 'La Voix', percent: 20 },
] as const

export default function ProgressWidget() {
  return (
    <section
      data-testid="dashboard-widget-progression"
      className="ed-card-lift"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 4,
        padding: 'clamp(20px, 2vw, 28px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
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
        Progression
      </h2>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {LAYERS.map((layer) => (
          <li
            key={layer.slug}
            data-testid={`progress-layer-${layer.slug}`}
            style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
          >
            <div data-testid="progress-layer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span
                style={{
                  fontFamily: SANS_FONT,
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)',
                }}
              >
                {layer.name}
              </span>
              <span
                style={{
                  fontFamily: SANS_FONT,
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {layer.percent}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-label={`${layer.name} progression`}
              aria-valuenow={layer.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{
                position: 'relative',
                height: 6,
                width: '100%',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${layer.percent}%`,
                  backgroundColor: 'var(--accent-primary)',
                  borderRadius: 3,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
