'use client'

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { SANS_FONT } from '@/lib/typography'

function fmt(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export default function Timer({ initialSeconds }: { initialSeconds: number }) {
  // startTimeRef: wall time (fake-clock-compatible) when current run started.
  // Set synchronously in the click handler BEFORE React commits the state
  // update, so page.clock.fastForward() in tests finds it immediately.
  const startTimeRef = useRef<number | null>(null)
  // pausedAtRef: seconds remaining when paused / not yet started.
  const pausedAtRef = useRef<number>(initialSeconds)

  const [running, setRunning] = useState(false)
  // tick increments on each interval fire to trigger a re-render and recompute
  // secondsLeft from Date.now() (which the fake clock controls in tests).
  const [tick, setTick] = useState(0)

  const secondsLeft: number = startTimeRef.current === null
    ? pausedAtRef.current
    : Math.max(0, pausedAtRef.current - Math.floor((Date.now() - startTimeRef.current) / 1000))

  const elapsed = secondsLeft === 0
  const urgency = secondsLeft > 0 && secondsLeft < 60 && running

  // Single interval, always registered on mount (empty deps) so the fake clock
  // always finds an existing timer when fastForward() fires.
  useLayoutEffect(() => {
    const id = setInterval(() => setTick((c) => c + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Auto-stop when seconds reach zero.
  useEffect(() => {
    if (secondsLeft === 0 && running) {
      pausedAtRef.current = 0
      startTimeRef.current = null
      setRunning(false)
    }
  }, [secondsLeft, running])

  const handleReset = useCallback(() => {
    startTimeRef.current = null
    pausedAtRef.current = initialSeconds
    setRunning(false)
    setTick(0)
  }, [initialSeconds])

  return (
    <div
      data-testid="timer"
      style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}
    >
      <span
        data-testid="timer-display"
        className={elapsed ? 'timer-elapsed-display' : urgency ? 'timer-urgency' : ''}
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 600,
          fontSize: '32px',
          letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {fmt(secondsLeft)}
      </span>

      {elapsed && (
        <span
          data-testid="timer-elapsed"
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 500,
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            padding: '2px 8px',
            border: '1px solid var(--rule-default)',
            borderRadius: 4,
          }}
        >
          Temps écoulé
        </span>
      )}

      <button
        data-testid="timer-toggle"
        onClick={() => {
          if (elapsed) return
          if (!running) {
            // Set startTimeRef synchronously — visible to interval callbacks
            // before React commits running=true (critical for fake-clock tests).
            startTimeRef.current = Date.now()
            setRunning(true)
          } else {
            pausedAtRef.current = secondsLeft
            startTimeRef.current = null
            setRunning(false)
          }
        }}
        disabled={elapsed}
        className="ed-btn-press"
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 600,
          fontSize: '0.875rem',
          color: running ? 'var(--cta-utility)' : '#fff',
          backgroundColor: running ? 'transparent' : 'var(--cta-utility)',
          border: '1px solid var(--cta-utility)',
          borderRadius: 4,
          minHeight: 44,
          padding: '6px 14px',
          cursor: elapsed ? 'default' : 'pointer',
          opacity: elapsed ? 0.5 : 1,
        }}
      >
        {running ? 'Pause' : 'Démarrer'}
      </button>

      <button
        data-testid="timer-reset"
        onClick={handleReset}
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 400,
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          background: 'none',
          border: 'none',
          minHeight: 44,
          padding: '6px 0',
          cursor: 'pointer',
          textDecoration: 'underline',
          textUnderlineOffset: 3,
        }}
      >
        Réinitialiser
      </button>
    </div>
  )
}
