'use client'

// ─── design tokens ───────────────────────────────────────────────────────────
const INK        = '#1A1A1A'
const INK_MUTED  = '#1A1A1A66'
const SAGE       = '#D4E4D0'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

// ─── types ───────────────────────────────────────────────────────────────────
interface Axis {
  label: string
  score: number
}

interface Props {
  axes: Axis[]        // must be exactly 4, in order: top, right, bottom, left
  size?: number
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function cefr(score: number): string {
  if (score <= 20) return 'A1'
  if (score <= 35) return 'A2'
  if (score <= 55) return 'B1'
  if (score <= 75) return 'B2'
  if (score <= 90) return 'C1'
  return 'C2'
}

/**
 * Convert a 0–100 score on one of the 4 cardinal axes to an (x, y) SVG
 * coordinate. Axes are:  0=top, 1=right, 2=bottom, 3=left.
 */
function axisPoint(
  axisIndex: number,
  score: number,
  cx: number,
  cy: number,
  radius: number
): [number, number] {
  const fraction = score / 100
  const r = radius * fraction
  // Angles: top=270°, right=0°, bottom=90°, left=180° (in degrees, CCW from right)
  const angles = [270, 0, 90, 180]
  const rad = (angles[axisIndex] * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}

function ringPoints(value: number, cx: number, cy: number, radius: number): string {
  const fraction = value / 100
  const r = radius * fraction
  // square diamond for 4-axis chart
  return [
    `${cx},${cy - r}`,
    `${cx + r},${cy}`,
    `${cx},${cy + r}`,
    `${cx - r},${cy}`,
  ].join(' ')
}

function userPolygon(axes: Axis[], cx: number, cy: number, radius: number): string {
  return axes
    .map((a, i) => {
      const [x, y] = axisPoint(i, a.score, cx, cy, radius)
      return `${x},${y}`
    })
    .join(' ')
}

function targetPolygon(value: number, cx: number, cy: number, radius: number): string {
  return ringPoints(value, cx, cy, radius)
}

// ─── label positions ─────────────────────────────────────────────────────────
// Push labels slightly past the axis endpoint
function labelPos(
  axisIndex: number,
  cx: number,
  cy: number,
  radius: number,
  offset: number
): { x: number; y: number; textAnchor: string } {
  const angles = [270, 0, 90, 180]
  const rad = (angles[axisIndex] * Math.PI) / 180
  const r = radius + offset
  const x = cx + r * Math.cos(rad)
  const y = cy + r * Math.sin(rad)
  // pick text-anchor based on which side
  const textAnchor =
    axisIndex === 1 ? 'start'
    : axisIndex === 3 ? 'end'
    : 'middle'
  return { x, y, textAnchor }
}

// ─── component ───────────────────────────────────────────────────────────────
export default function RadarChart({ axes, size = 300 }: Props) {
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.35 // leaves room for labels

  const gridRings = [25, 50, 75, 100]

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="Couche radar chart"
      style={{ overflow: 'visible' }}
    >
      {/* ── Grid rings ── */}
      {gridRings.map((v) => (
        <polygon
          key={v}
          points={ringPoints(v, cx, cy, radius)}
          fill="none"
          stroke={INK_MUTED}
          strokeWidth={v === 100 ? 1.5 : 0.75}
          opacity={0.25}
        />
      ))}

      {/* ── Axis spokes ── */}
      {axes.map((_, i) => {
        const [x, y] = axisPoint(i, 100, cx, cy, radius)
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke={INK_MUTED}
            strokeWidth={0.75}
            opacity={0.3}
          />
        )
      })}

      {/* ── Target band: fill between 70 and 85 ── */}
      <polygon
        points={targetPolygon(85, cx, cy, radius)}
        fill={SAGE}
        fillOpacity={0.35}
        stroke="none"
      />
      <polygon
        points={targetPolygon(70, cx, cy, radius)}
        fill="#FAFAF7"
        fillOpacity={0.9}
        stroke="none"
      />

      {/* ── User polygon ── */}
      <polygon
        points={userPolygon(axes, cx, cy, radius)}
        fill={INK}
        fillOpacity={0.15}
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* ── Axis endpoint dots ── */}
      {axes.map((a, i) => {
        const [x, y] = axisPoint(i, a.score, cx, cy, radius)
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={4}
            fill={INK}
          />
        )
      })}

      {/* ── Labels ── */}
      {axes.map((a, i) => {
        const { x, y, textAnchor } = labelPos(i, cx, cy, radius, 22)
        // For top/bottom, stack lines; for left/right, keep on one line
        const isTopBottom = i === 0 || i === 2
        const lineH = 14

        return (
          <g key={i}>
            {/* Axis label */}
            <text
              x={x}
              y={isTopBottom && i === 0 ? y - lineH * 1.4 : isTopBottom ? y + 4 : y - 10}
              textAnchor={textAnchor}
              fontFamily={DISPLAY_FONT}
              fontWeight={700}
              fontSize={11}
              fill={INK}
            >
              {a.label}
            </text>
            {/* Score */}
            <text
              x={x}
              y={isTopBottom && i === 0 ? y - 2 : isTopBottom ? y + 4 + lineH : y + 6}
              textAnchor={textAnchor}
              fontFamily={DISPLAY_FONT}
              fontWeight={500}
              fontSize={11}
              fill={INK}
            >
              {a.score}
            </text>
            {/* CEFR band */}
            <text
              x={x}
              y={isTopBottom && i === 0 ? y + lineH - 2 : isTopBottom ? y + 4 + lineH * 2 : y + 20}
              textAnchor={textAnchor}
              fontFamily={DISPLAY_FONT}
              fontWeight={400}
              fontSize={10}
              fill={INK_MUTED}
            >
              {cefr(a.score)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
