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
        padding: 0,
        backgroundColor: 'var(--ed-paper)',
        border: '1px solid var(--ed-rule)',
        borderRadius: 12,
        cursor: 'pointer',
        fontFamily: 'inherit',
        color: 'inherit',
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateY(${flipped ? 180 : 0}deg)`,
        transition: `transform 0.45s var(--ed-ease)`,
      }}
    >
      {/* Front face */}
      <div
        data-testid="flashcard-front"
        aria-hidden={flipped}
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          padding: 'clamp(24px, 3vw, 32px)',
        }}
      >
        <span
          data-testid="flashcard-fr-front"
          style={{
            fontFamily: SERIF_FONT,
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: '28px',
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

      {/* Back face — rotated 180deg so it faces away by default; card rotation reveals it */}
      <div
        data-testid="flashcard-back"
        aria-hidden={!flipped}
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          padding: 'clamp(24px, 3vw, 32px)',
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
            fontSize: '28px',
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
