'use client'

import { SANS_FONT } from '@/lib/typography'

export default function AudioPlayerPlaceholder() {
  return (
    <div
      data-testid="audio-player-placeholder"
      role="group"
      aria-label="Lecteur audio (bientôt disponible)"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: 'clamp(14px, 1.5vw, 18px) clamp(16px, 2vw, 22px)',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 8,
        width: '100%',
      }}
    >
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
          backgroundColor: 'var(--cta-primary)',
          border: 'none',
          color: 'var(--bg-elevated)',
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
            backgroundColor: 'var(--bg-subtle)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: '0%',
              backgroundColor: 'var(--accent-primary)',
              borderRadius: 999,
            }}
          />
        </div>
        <span
          style={{
            fontFamily: SANS_FONT,
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          0:00 / 12:34
        </span>
      </div>

      <span
        data-testid="audio-volume-icon"
        aria-hidden="true"
        style={{
          flexShrink: 0,
          width: 24,
          height: 24,
          color: 'var(--text-muted)',
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
