'use client'

import type { CSSProperties, ReactNode } from 'react'
import { SANS_FONT } from '@/lib/typography'
import Sparkline from './Sparkline'

// F-464 — the tinted metric card. Consumes the F-463 tint card-fill tokens
// (var(--tint-*)) for the fill and var(--tint-*-spark) for the sparkline; no
// hardcoded hex. Heading uses --heading, the emphasis number uses coral
// (--accent, the single brand accent), sublabels are muted. In dark mode the
// tints fall back to the dark card surface (per F-463), so the card still reads.

export type Tint = 'sage' | 'slate' | 'cream' | 'peach'

interface MetricCardProps {
  testId: string
  title: string
  tint: Tint
  // Emphasis value (the big coral number/label). Ignored when bientot/loading/error.
  value?: ReactNode
  // Muted sublabel under the value (e.g. "jours consécutifs", "/ 7 îles").
  unit?: string
  // Optional slim progress bar (coral fill when value >= target).
  progress?: { value: number; target: number }
  // Optional sparkline series (oldest -> newest), drawn in the tint's spark shade.
  sparkline?: number[]
  // States: a metric with no source renders bientot; loading shows a skeleton.
  bientot?: boolean
  bientotLabel?: string
  loading?: boolean
  error?: boolean
  // Grid placement handed down by the parent layout.
  style?: CSSProperties
}

export default function MetricCard({
  testId,
  title,
  tint,
  value,
  unit,
  progress,
  sparkline,
  bientot,
  bientotLabel,
  loading,
  error,
  style,
}: MetricCardProps) {
  const fill = `var(--tint-${tint})`
  const spark = `var(--tint-${tint}-spark)`

  const pct =
    progress && progress.target > 0
      ? Math.min(100, Math.round((progress.value / progress.target) * 100))
      : 0

  return (
    <section
      data-testid={testId}
      data-tint={tint}
      className="ed-card-lift"
      style={{
        background: fill,
        border: '1px solid var(--rule-default)',
        borderRadius: 'var(--r-lg)',
        padding: 'clamp(16px, 1.8vw, 22px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minWidth: 0,
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <h3
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 600,
            fontSize: '0.8125rem',
            letterSpacing: '0.02em',
            color: 'var(--heading)',
            margin: 0,
          }}
        >
          {title}
        </h3>
        {bientot && (
          <span
            data-testid="bientot-pill"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: '0.625rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-foreground)',
              padding: '2px 8px',
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
        <div className="ed-skeleton" style={{ height: 40, borderRadius: 4 }} />
      ) : error ? (
        <p
          data-testid={`${testId}-error`}
          style={{ fontFamily: SANS_FONT, fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}
        >
          Données indisponibles
        </p>
      ) : bientot ? (
        <p
          data-testid={`${testId}-bientot`}
          style={{ fontFamily: SANS_FONT, fontSize: '0.8125rem', lineHeight: 1.4, color: 'var(--text-secondary)', margin: 0 }}
        >
          {bientotLabel ?? 'Bientôt disponible'}
        </p>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span
              data-testid={`${testId}-value`}
              style={{
                fontFamily: SANS_FONT,
                fontWeight: 700,
                fontSize: 'clamp(28px, 3.2vw, 40px)',
                lineHeight: 1,
                letterSpacing: '-0.02em',
                color: 'var(--accent)',
              }}
            >
              {value}
            </span>
            {unit && (
              <span style={{ fontFamily: SANS_FONT, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {unit}
              </span>
            )}
          </div>

          {progress && (
            <div
              data-testid={`${testId}-progress`}
              style={{ height: 6, borderRadius: 3, backgroundColor: 'color-mix(in srgb, var(--heading) 12%, transparent)', overflow: 'hidden' }}
            >
              <div
                className="progress-bar-fill"
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  borderRadius: 3,
                  backgroundColor: pct >= 100 ? 'var(--accent)' : spark,
                }}
              />
            </div>
          )}

          {sparkline && sparkline.length >= 2 && (
            <div style={{ marginTop: 2 }}>
              <Sparkline values={sparkline} stroke={spark} />
            </div>
          )}
        </>
      )}
    </section>
  )
}
