'use client'

import { SANS_FONT } from '@/lib/typography'

// F-464 — compact right-rail stat card (Production, Pièges). Neutral paper
// surface (the F-463 tints are reserved for the metric L in the main zone).
// Heading uses --heading, the emphasis number uses coral. A metric with no
// source renders bientot rather than a fabricated number.

interface StatCardProps {
  testId: string
  title: string
  value?: string | number
  unit?: string
  bientot?: boolean
  bientotLabel?: string
  loading?: boolean
  error?: boolean
}

export default function StatCard({ testId, title, value, unit, bientot, bientotLabel, loading, error }: StatCardProps) {
  return (
    <section
      data-testid={testId}
      className="ed-card-lift"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 'var(--r-lg)',
        padding: 'clamp(14px, 1.6vw, 18px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <h3 style={{ fontFamily: SANS_FONT, fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.02em', color: 'var(--heading)', margin: 0 }}>
          {title}
        </h3>
        {bientot && (
          <span
            data-testid="bientot-pill"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: '0.5625rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-foreground)',
              padding: '2px 7px',
              borderRadius: 'var(--r-pill)',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              flexShrink: 0,
            }}
          >
            Bientôt
          </span>
        )}
      </div>

      {loading ? (
        <div className="ed-skeleton" style={{ height: 28, borderRadius: 4 }} />
      ) : error ? (
        <p data-testid={`${testId}-error`} style={{ fontFamily: SANS_FONT, fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
          Indisponible
        </p>
      ) : bientot ? (
        <p data-testid={`${testId}-bientot`} style={{ fontFamily: SANS_FONT, fontSize: '0.75rem', lineHeight: 1.4, color: 'var(--text-secondary)', margin: 0 }}>
          {bientotLabel ?? 'Bientôt disponible'}
        </p>
      ) : (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span
            data-testid={`${testId}-value`}
            style={{ fontFamily: SANS_FONT, fontWeight: 700, fontSize: 'clamp(22px, 2.6vw, 28px)', lineHeight: 1, letterSpacing: '-0.02em', color: 'var(--accent)' }}
          >
            {value}
          </span>
          {unit && <span style={{ fontFamily: SANS_FONT, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{unit}</span>}
        </div>
      )}
    </section>
  )
}
