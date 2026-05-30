import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

interface CouchesLayerProps {
  number: number
  heading: string
  name: string
  description: string
  backgroundColor: string
  accentColor: string
  nameColor?: string
  headingColor?: string
}

export default function CouchesLayer({
  number,
  heading,
  name,
  description,
  backgroundColor,
  accentColor,
  nameColor = 'var(--dominant)',
  headingColor = 'var(--ink)',
}: CouchesLayerProps) {
  return (
    <div
      data-testid="couche-layer"
      data-layer={name}
      className="ed-card-lift"
      style={{
        backgroundColor,
        borderBottom: '1px solid var(--rule-default)',
        borderLeft: `3px solid ${accentColor}`,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: 'clamp(28px, 3.5vw, 44px) clamp(24px, 5vw, 80px)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'clamp(20px, 3vw, 48px)',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 700,
            fontSize: '0.6875rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: 'var(--text-muted)',
            minWidth: '2rem',
            paddingTop: '0.3rem',
            flexShrink: 0,
          }}
        >
          {String(number).padStart(2, '0')}
        </span>
        <div>
          <h3
            data-testid="couche-heading"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: 'clamp(1.125rem, 1.6vw, 1.375rem)',
              lineHeight: 1.2,
              letterSpacing: '-0.015em',
              color: headingColor,
              margin: 0,
              marginBottom: 4,
            }}
          >
            {heading}
          </h3>
          <p
            data-testid="couche-name"
            style={{
              fontFamily: SERIF_FONT,
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: '0.9375rem',
              lineHeight: 1.2,
              letterSpacing: '0',
              color: nameColor,
              margin: 0,
              marginBottom: 12,
            }}
          >
            {name}
          </p>
          <p
            data-testid="couche-description"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 400,
              fontSize: '0.9375rem',
              lineHeight: 1.65,
              color: 'var(--text-muted)',
              margin: 0,
              maxWidth: 680,
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}
