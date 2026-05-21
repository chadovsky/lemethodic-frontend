'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'
import { CHUNKS } from '@/lib/data/chunks'
import Flashcard from './Flashcard'
import PracticeActions from './PracticeActions'
import EndOfDeck from './EndOfDeck'

const TOTAL = CHUNKS.length

export default function PracticeDeck() {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const isFinished = index >= TOTAL
  const isFirst = index === 0

  const advance = () => {
    setFlipped(false)
    setIndex((i) => Math.min(i + 1, TOTAL))
  }

  const goBack = () => {
    if (isFirst) return
    setFlipped(false)
    setIndex((i) => Math.max(i - 1, 0))
  }

  const restart = () => {
    setFlipped(false)
    setIndex(0)
  }

  const toggleFlip = () => setFlipped((f) => !f)

  return (
    <div
      data-testid="practice-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        paddingTop: 8,
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Link
          data-testid="practice-back-to-list"
          href="/vocabulaire"
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 500,
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            alignSelf: 'flex-start',
          }}
        >
          ← Retour à la liste
        </Link>
        <h1
          style={{
            fontFamily: SERIF_FONT,
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 'clamp(32px, 4vw, 52px)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          Pratique
        </h1>
        <p
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 500,
            fontSize: '1rem',
            color: 'var(--text-muted)',
            margin: 0,
          }}
        >
          Révisez vos chunks, un par un.
        </p>
      </header>

      {isFinished ? (
        <EndOfDeck total={TOTAL} onRestart={restart} />
      ) : (
        <>
          <p
            data-testid="practice-progress"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 500,
              fontSize: '0.8125rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              margin: 0,
              textAlign: 'center',
            }}
          >
            Carte {index + 1} sur {TOTAL}
          </p>

          <Flashcard chunk={CHUNKS[index]} flipped={flipped} onFlip={toggleFlip} />

          <PracticeActions
            onReview={advance}
            onNext={advance}
            onKnown={advance}
            onPrev={goBack}
            isFirst={isFirst}
          />
        </>
      )}
    </div>
  )
}
