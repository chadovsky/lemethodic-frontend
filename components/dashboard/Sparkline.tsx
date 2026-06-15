'use client'

// F-464 — tiny inline-SVG sparkline for the tinted metric cards. Decorative
// (aria-hidden); the card's emphasis number carries the accessible value. The
// stroke is a per-tint -spark token passed by the caller (no hardcoded hex).
// Renders nothing when there is not enough series data to draw a line.

interface SparklineProps {
  // Series oldest -> newest. Needs >= 2 points to draw.
  values: number[]
  // A CSS color token, e.g. 'var(--tint-cream-spark)'.
  stroke: string
  width?: number
  height?: number
}

export default function Sparkline({ values, stroke, width = 96, height = 28 }: SparklineProps) {
  if (values.length < 2) return null

  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const stepX = width / (values.length - 1)

  // Map each value to a point; invert Y (SVG origin top-left). Pad 2px so the
  // stroke is never clipped at the extremes.
  const pad = 2
  const usableH = height - pad * 2
  const points = values.map((v, i) => {
    const x = i * stepX
    const y = pad + (1 - (v - min) / span) * usableH
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  return (
    <svg
      data-testid="sparkline"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden="true"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <polyline
        points={points.join(' ')}
        stroke={stroke}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
