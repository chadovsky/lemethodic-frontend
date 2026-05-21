'use client'

import { SANS_FONT, SERIF_FONT } from '@/lib/typography'
import type { Chunk } from '@/lib/data/chunks'

interface FlashcardProps {
  chunk: Chunk
  flipped: boolean
  onFlip: () => void
}

export default function Flashcard({ chunk, flipped, onFlip }: FlashcardProps) {
  return (
    <button
      type="button"
      data-testid="flashcard"
      data-flipped={flipped}
      aria-pressed={flipped}
      aria-label={flipped ? 'Voir le côté français' : 'Voir la traduction'}
      onClick={onFlip}
      className="ed-btn-press flashcard"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 520,
        minHeight: 240,
        margin: '0 auto',
        padding: 'clamp(24px, 4vw, 40px)',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 8,
        cursor: 'pointer',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'inherit',
        color: 'inherit',
      }}
    >
      {/* Front face */}
      <div
        data-testid="flashcard-front"
        aria-hidden={flipped}
        style={{
          display: flipped ? 'none' : 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          width: '100%',
        }}
      >
        <span
          data-testid="flashcard-fr-front"
          style={{
            fontFamily: SERIF_FONT,
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 'clamp(28px, 4vw, 44px)',
            lineHeight: 1.15,
            letterSpacing: '-0.015em',
            color: 'var(--text-primary)',
          }}
        >
          {chunk.fr}
        </span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
          <span
            data-testid="flashcard-level"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: '0.6875rem',
              letterSpacing: '0.06em',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--accent-primary-soft)',
              padding: '4px 8px',
              borderRadius: 4,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {chunk.level}
          </span>
          <span
            data-testid="flashcard-source"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 500,
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-subtle)',
              padding: '4px 10px',
              borderRadius: 999,
              border: '1px solid var(--rule-default)',
            }}
          >
            {chunk.source}
          </span>
        </div>
      </div>

      {/* Back face */}
      <div
        data-testid="flashcard-back"
        aria-hidden={!flipped}
        style={{
          display: flipped ? 'flex' : 'none',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          width: '100%',
        }}
      >
        <span
          data-testid="flashcard-fr-back"
          style={{
            fontFamily: SERIF_FONT,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: '0.95rem',
            lineHeight: 1.3,
            color: 'var(--text-muted)',
          }}
        >
          {chunk.fr}
        </span>
        <span
          data-testid="flashcard-en"
          style={{
            fontFamily: SERIF_FONT,
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 'clamp(26px, 3.6vw, 40px)',
            lineHeight: 1.15,
            letterSpacing: '-0.015em',
            color: 'var(--text-primary)',
          }}
        >
          {chunk.en}
        </span>
      </div>
    </button>
  )
}
