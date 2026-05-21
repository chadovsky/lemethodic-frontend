'use client'

import Link from 'next/link'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

interface EndOfDeckProps {
  total: number
  onRestart: () => void
}

export default function EndOfDeck({ total, onRestart }: EndOfDeckProps) {
  return (
    <section
      data-testid="end-of-deck"
      style={{
        width: '100%',
        maxWidth: 520,
        margin: '0 auto',
        padding: 'clamp(28px, 5vw, 48px)',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          fontFamily: SERIF_FONT,
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: 'clamp(24px, 3.2vw, 34px)',
          lineHeight: 1.15,
          letterSpacing: '-0.01em',
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        Vous avez terminé les {total} chunks.
      </h2>
      <p
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 400,
          fontSize: '0.9375rem',
          color: 'var(--text-muted)',
          margin: 0,
          maxWidth: 360,
        }}
      >
        Reprenez du début pour réviser, ou retournez à la liste pour passer en mode test.
      </p>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <button
          type="button"
          data-testid="end-of-deck-restart"
          onClick={onRestart}
          className="ed-btn-press"
          style={{
            minHeight: 48,
            padding: '12px 22px',
            fontFamily: SANS_FONT,
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: 'var(--bg-elevated)',
            backgroundColor: 'var(--cta-primary)',
            border: '1px solid var(--cta-primary)',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Recommencer
        </button>
        <Link
          data-testid="end-of-deck-back-to-list"
          href="/vocabulaire"
          className="ed-btn-press"
          style={{
            minHeight: 48,
            padding: '12px 22px',
            fontFamily: SANS_FONT,
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: 'var(--text-primary)',
            backgroundColor: 'transparent',
            border: '1px solid var(--rule-default)',
            borderRadius: 4,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Retour à la liste
        </Link>
      </div>
    </section>
  )
}
