'use client'

import { useState, useEffect, useCallback } from 'react'
import { SANS_FONT } from '@/lib/typography'

function fmt(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export default function Timer({ initialSeconds }: { initialSeconds: number }) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const elapsed = secondsLeft === 0

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  useEffect(() => {
    if (secondsLeft === 0) setRunning(false)
  }, [secondsLeft])

  const handleReset = useCallback(() => {
    setRunning(false)
    setSecondsLeft(initialSeconds)
  }, [initialSeconds])

  return (
    <div
      data-testid="timer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <span
        data-testid="timer-display"
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 600,
          fontSize: 'clamp(28px, 3vw, 40px)',
          letterSpacing: '-0.02em',
          color: elapsed ? 'var(--text-muted)' : 'var(--text-primary)',
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
        onClick={() => { if (!elapsed) setRunning((r) => !r) }}
        disabled={elapsed}
        className="ed-btn-press"
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 600,
          fontSize: '0.875rem',
          color: 'var(--text-primary)',
          backgroundColor: 'transparent',
          border: '1px solid var(--rule-default)',
          borderRadius: 4,
          padding: '6px 14px',
          cursor: elapsed ? 'default' : 'pointer',
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
