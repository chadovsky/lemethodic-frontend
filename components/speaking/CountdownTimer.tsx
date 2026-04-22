'use client'

import { useEffect, useRef } from 'react'

const INK       = '#1A1A1A'
const INK_MUTED = '#1A1A1A66'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

interface CountdownTimerProps {
  /** Total seconds at start */
  totalSeconds: number
  /** Remaining seconds (controlled from parent) */
  remaining: number
  /** Called each tick — parent should decrement remaining */
  onTick: (newRemaining: number) => void
  /** Called when timer reaches 0 */
  onComplete: () => void
  /** Diameter of the ring in px */
  size?: number
  /** Whether to show count-up instead (for recording state) */
  countUp?: boolean
  /** Max seconds for count-up display */
  maxSeconds?: number
  /** Ring accent color */
  accentColor?: string
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function CountdownTimer({
  totalSeconds,
  remaining,
  onTick,
  onComplete,
  size = 140,
  countUp = false,
  maxSeconds,
  accentColor = INK,
}: CountdownTimerProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      onTick(remaining - 1)
      if (remaining - 1 <= 0) {
        clearInterval(intervalRef.current!)
        onComplete()
      }
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current!)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining])

  const elapsed    = totalSeconds - remaining
  const progress   = countUp
    ? (maxSeconds ? elapsed / maxSeconds : 0)
    : 1 - remaining / totalSeconds

  const radius     = (size - 16) / 2
  const circ       = 2 * Math.PI * radius
  const dashOffset = circ * (1 - progress)

  const displaySecs = countUp ? elapsed : remaining
  const mins  = Math.floor(displaySecs / 60)
  const secs  = displaySecs % 60

  const displayLabel = countUp && maxSeconds
    ? `${pad(mins)}:${pad(secs)} / ${pad(Math.floor(maxSeconds / 60))}:${pad(maxSeconds % 60)}`
    : `${pad(mins)}:${pad(secs)}`

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-live="polite"
      aria-label={`Timer: ${displayLabel}`}
    >
      <svg width={size} height={size} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={`${INK}14`} strokeWidth={6} />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={accentColor}
          strokeWidth={6}
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.9s linear' }}
        />
      </svg>

      <span
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 800,
          fontSize: countUp ? 20 : 32,
          color: INK,
          letterSpacing: '-0.03em',
          lineHeight: 1,
          textAlign: 'center',
        }}
      >
        {displayLabel}
      </span>
    </div>
  )
}
