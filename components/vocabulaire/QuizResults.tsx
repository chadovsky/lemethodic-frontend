'use client'

import Link from 'next/link'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

interface QuizResultsProps {
  score: number
  total: number
  onRestart: () => void
}

function flavorCopy(score: number): string {
  if (score >= 8) return 'Excellent. Votre réservoir lexical est solide.'
  if (score >= 5) return 'Bien. Continuez à pratiquer.'
  return 'À revoir. Répétez la pratique régulièrement.'
}

export default function QuizResults({ score, total, onRestart }: QuizResultsProps) {
  return (
    <section
      data-testid="quiz-results"
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
      <span
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 600,
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        Votre score
      </span>
      <h2
        data-testid="quiz-results-score"
        style={{
          fontFamily: SERIF_FONT,
          fontWeight: 500,
          fontSize: 'clamp(48px, 7vw, 72px)',
          lineHeight: 1,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          margin: 0,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {score} / {total}
      </h2>
      <p
        data-testid="quiz-results-flavor"
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 400,
          fontSize: '0.9375rem',
          color: 'var(--text-muted)',
          margin: 0,
          maxWidth: 360,
        }}
      >
        {flavorCopy(score)}
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
          data-testid="quiz-results-restart"
          onClick={onRestart}
          className="ed-btn-press"
          style={{
            minHeight: 48,
            padding: '12px 22px',
            fontFamily: SANS_FONT,
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: 'var(--bg-elevated)',
            backgroundColor: 'var(--cta-utility)',
            border: '1px solid var(--cta-utility)',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Recommencer
        </button>
        <Link
          data-testid="quiz-results-back-to-list"
          href="/la-bibliotheque"
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
