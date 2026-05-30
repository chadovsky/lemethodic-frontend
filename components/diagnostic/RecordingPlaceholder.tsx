'use client'

import { useState } from 'react'
import { SANS_FONT } from '@/lib/typography'
import WaveformPlaceholder from './WaveformPlaceholder'

type RecordingState = 'idle' | 'recording' | 'stopped'

const STATUS: Record<RecordingState, string> = {
  idle: 'Cliquez pour commencer.',
  recording: 'Enregistrement en cours…',
  stopped: 'Enregistrement terminé.',
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

export default function RecordingPlaceholder() {
  const [state, setState] = useState<RecordingState>('idle')
  const reducedMotion = prefersReducedMotion()

  const handleMicClick = () => {
    if (state === 'idle') setState('recording')
    else if (state === 'recording') setState('stopped')
  }

  return (
    <div
      data-testid="recording-placeholder"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        padding: 'clamp(24px, 3vw, 40px) 0',
      }}
    >
      <WaveformPlaceholder isActive={state === 'recording'} />

      {/* Mic button + ripple rings container */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {state === 'recording' && !reducedMotion && (
          <>
            <div
              data-testid="recording-ripple"
              className="recording-ripple recording-ripple-1"
              style={{
                position: 'absolute',
                width: 96,
                height: 96,
                borderRadius: '50%',
                border: '2px solid var(--cta-utility)',
                pointerEvents: 'none',
              }}
            />
            <div
              data-testid="recording-ripple"
              className="recording-ripple recording-ripple-2"
              style={{
                position: 'absolute',
                width: 96,
                height: 96,
                borderRadius: '50%',
                border: '2px solid var(--cta-utility)',
                pointerEvents: 'none',
              }}
            />
          </>
        )}
        <button
          data-testid="recording-mic-btn"
          onClick={handleMicClick}
          disabled={state === 'stopped'}
          aria-label={state === 'recording' ? "Arrêter l'enregistrement" : "Commencer l'enregistrement"}
          className="ed-btn-press"
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            border: `2px solid ${state === 'recording' ? 'var(--cta-utility)' : 'var(--rule-default)'}`,
            backgroundColor: state === 'recording' ? 'var(--cta-utility)' : 'var(--bg-elevated)',
            cursor: state === 'stopped' ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 200ms ease, border-color 200ms ease',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke={state === 'recording' ? 'var(--bg-elevated)' : 'var(--text-primary)'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>
      </div>

      <p
        data-testid="recording-status"
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 400,
          fontSize: '0.9375rem',
          color: 'var(--lm-text-tertiary)',
          margin: 0,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {STATUS[state]}
        {state === 'recording' && (
          <span
            className={reducedMotion ? '' : 'recording-blink-dot'}
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'var(--lm-pastel-blush)',
              flexShrink: 0,
            }}
          />
        )}
      </p>

      {state === 'stopped' && (
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            data-testid="recording-reecouter"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 500,
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              background: 'none',
              border: '1px solid var(--lm-border-subtle)',
              borderRadius: 999,
              padding: '8px 18px',
              cursor: 'pointer',
            }}
          >
            Réécouter
          </button>
          <button
            data-testid="recording-recommencer"
            onClick={() => setState('idle')}
            className="ed-btn-press"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 500,
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              background: 'none',
              border: '1px solid var(--lm-border-subtle)',
              borderRadius: 999,
              padding: '8px 18px',
              cursor: 'pointer',
            }}
          >
            Recommencer
          </button>
        </div>
      )}
    </div>
  )
}
