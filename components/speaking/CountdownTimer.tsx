'use client'

// F-076 — wall-clock countdown timer.
//
// Two modes via the `controlled` prop:
//
// 1. OWNED (default, controlled=false). The component owns the timing:
//    captures a start timestamp on mount via Date.now(), polls every
//    250ms, calls onTick(remaining) with the wall-clock-correct value,
//    and fires onComplete when elapsed >= totalSeconds. Immune to
//    background-tab `setInterval` throttling — when a tick fires,
//    Date.now() returns the true current time, so the displayed
//    remaining is correct even after Chrome has throttled callbacks
//    to 1+ minute. A `visibilitychange` listener also forces an
//    immediate tick on focus return so the user never sees a stale
//    value the moment they refocus.
//
//    This replaces the previous counter pattern
//    (`setInterval(() => onTick(remaining - 1), 1000)`) which drifted
//    badly under throttling — the bug F-076 targets. T3 prep mode is
//    the only owned-mode caller today.
//
// 2. CONTROLLED (controlled=true). The parent owns the timing — the
//    component is purely visual. Skips the internal tick entirely.
//    The displayed `remaining` is whatever the parent passes. Used
//    by T3 recording mode where remaining is computed from
//    `recorder.durationMs` (already wall-clock via Date.now() in
//    useAudioRecorder). Eliminates the racing-internal-interval that
//    the old design had — onTick={() => {}} was a smell that's now
//    explicit.
//
// Visual treatment, ARIA, prop names: unchanged from pre-F-076 to
// preserve the existing callers' expectations.

import { useEffect, useRef } from 'react'

const INK       = '#1A1A1A'
const DISPLAY_FONT = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'

interface CountdownTimerProps {
  /** Total seconds at start */
  totalSeconds: number
  /** Remaining seconds.
   *  - In owned mode (controlled=false), the initial value of `remaining`
   *    is treated as the starting point and the component then drives
   *    onTick with wall-clock-computed values. Subsequent prop updates
   *    via the parent's onTick handler reflect what the timer just
   *    pushed; the component does not read `remaining` to drive its
   *    own timing.
   *  - In controlled mode, the parent passes whatever value should
   *    display. The component renders that verbatim. */
  remaining: number
  /** Called each tick — parent should accept the new remaining value.
   *  In controlled mode this is not invoked. */
  onTick: (newRemaining: number) => void
  /** Called when the wall-clock elapsed time meets/exceeds
   *  totalSeconds (owned mode), or when remaining reaches 0
   *  (controlled mode — fired by the parent's own logic via the
   *  remaining prop transition). */
  onComplete: () => void
  /** Diameter of the ring in px */
  size?: number
  /** Whether to show count-up instead (for recording state) */
  countUp?: boolean
  /** Max seconds for count-up display */
  maxSeconds?: number
  /** Ring accent color */
  accentColor?: string
  /** F-076 — when true, parent owns the timing and the component
   *  becomes a pure display. Default false (owned mode). */
  controlled?: boolean
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
  controlled = false,
}: CountdownTimerProps) {
  // F-076 — refs for timing + the latest callbacks. Refs avoid the
  // effect restart that would happen if onTick / onComplete were in
  // deps; the effect should run ONCE per mount in owned mode.
  const startTimeRef  = useRef<number | null>(null)
  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const completedRef  = useRef(false)
  const onTickRef     = useRef(onTick)
  const onCompleteRef = useRef(onComplete)

  // Keep the callback refs in sync with the latest props on every render.
  useEffect(() => { onTickRef.current = onTick }, [onTick])
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  useEffect(() => {
    if (controlled) {
      // Parent owns timing — nothing for us to do.
      return
    }

    completedRef.current = false
    const startTime = Date.now()
    startTimeRef.current = startTime

    const tick = () => {
      if (completedRef.current) return
      const elapsedSec = Math.floor((Date.now() - startTime) / 1000)
      const newRemaining = Math.max(0, totalSeconds - elapsedSec)
      onTickRef.current(newRemaining)
      if (newRemaining <= 0) {
        completedRef.current = true
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        onCompleteRef.current()
      }
    }

    // Render the starting state immediately, then poll. 250ms gives
    // ~4Hz UI updates when foregrounded; under throttling, Date.now()
    // makes any tick that does fire correct.
    tick()
    intervalRef.current = setInterval(tick, 250)

    // Force an immediate tick on tab refocus so the displayed value
    // doesn't lag behind real time the moment the user comes back.
    // The 250ms poll would catch up within a quarter-second anyway,
    // but this closes the visual gap fully.
    const handleVisibilityChange = () => {
      if (!document.hidden) tick()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
    // Effect intentionally restarts on totalSeconds change (parent
    // dynamically increasing the budget would re-anchor); restarts
    // on controlled toggle (mode switch). onTick / onComplete are
    // captured via refs above to avoid the per-render re-anchor that
    // the pre-F-076 design suffered from.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlled, totalSeconds])

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
