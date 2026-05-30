'use client'

import { SANS_FONT } from '@/lib/typography'

const WAVEFORM_HEIGHTS = [8, 14, 10, 20, 16, 24, 12, 28, 18, 22, 14, 20, 10, 16, 8]

export default function AudioPlayerPlaceholder({ cefr }: { cefr?: string }) {
  return (
    <div
      data-testid="audio-player-placeholder"
      role="group"
      aria-label="Lecteur audio (bientôt disponible)"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: 'clamp(14px, 1.5vw, 18px) clamp(16px, 2vw, 22px)',
        backgroundColor: 'var(--lm-bg-surface)',
        border: '1px solid var(--lm-border-subtle)',
        borderRadius: 8,
        width: '100%',
      }}
    >
      {/* Static waveform thumbnail */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexShrink: 0,
        }}
      >
        {WAVEFORM_HEIGHTS.map((h, i) => (
          <div
            key={i}
            data-testid="lesson-waveform-bar"
            style={{
              width: 3,
              height: h,
              backgroundColor: 'var(--lm-text-tertiary)',
              borderRadius: 1.5,
              opacity: 0.45,
            }}
          />
        ))}
      </div>

      <button
        type="button"
        data-testid="audio-play-button"
        aria-label="Lire la leçon"
        className="ed-btn-press"
        onClick={() => {
          /* Visual placeholder — AI-XXX will wire real playback */
        }}
        style={{
          flexShrink: 0,
          width: 44,
          height: 44,
          borderRadius: '50%',
          backgroundColor: 'var(--cta-utility)',
          border: 'none',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <svg
          width="14"
          height="16"
          viewBox="0 0 14 16"
          fill="currentColor"
          aria-hidden="true"
          style={{ marginLeft: 2 }}
        >
          <path d="M0 0 L14 8 L0 16 Z" />
        </svg>
      </button>

      <div
        data-testid="audio-scrubber"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          minWidth: 0,
        }}
      >
        <div
          style={{
            position: 'relative',
            height: 4,
            borderRadius: 999,
            backgroundColor: 'var(--lm-bg-base)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: '0%',
              backgroundColor: 'var(--cta-utility)',
              borderRadius: 999,
            }}
          />
        </div>
        <span
          style={{
            fontFamily: SANS_FONT,
            fontSize: '0.9375rem',
            fontWeight: 500,
            color: 'var(--lm-text-primary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          12:34
        </span>
      </div>

      {cefr && (
        <span
          data-testid="audio-cefr-badge"
          style={{
            flexShrink: 0,
            fontFamily: SANS_FONT,
            fontWeight: 700,
            fontSize: '0.6875rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--cta-utility)',
            backgroundColor: 'var(--lm-bg-base)',
            border: '1px solid var(--lm-border-subtle)',
            padding: '3px 8px',
            borderRadius: 999,
          }}
        >
          {cefr}
        </span>
      )}

      <span
        data-testid="audio-volume-icon"
        aria-hidden="true"
        style={{
          flexShrink: 0,
          width: 24,
          height: 24,
          color: 'var(--lm-text-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      </span>
    </div>
  )
}
