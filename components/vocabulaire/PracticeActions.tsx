'use client'

import { SANS_FONT } from '@/lib/typography'

interface PracticeActionsProps {
  onReview: () => void
  onNext: () => void
  onKnown: () => void
  onPrev: () => void
  isFirst: boolean
}

const reviewButtonStyle: React.CSSProperties = {
  flex: '1 1 0',
  minHeight: 48,
  padding: '12px 16px',
  fontFamily: SANS_FONT,
  fontWeight: 600,
  fontSize: '0.9375rem',
  color: 'var(--text-primary)',
  backgroundColor: 'var(--fp-blush)',
  border: '1px solid var(--rule-default)',
  borderRadius: 4,
  cursor: 'pointer',
}

const knownButtonStyle: React.CSSProperties = {
  flex: '1 1 0',
  minHeight: 48,
  padding: '12px 16px',
  fontFamily: SANS_FONT,
  fontWeight: 600,
  fontSize: '0.9375rem',
  color: 'var(--text-primary)',
  backgroundColor: 'var(--fp-sage)',
  border: '1px solid var(--rule-default)',
  borderRadius: 4,
  cursor: 'pointer',
}

const nextButtonStyle: React.CSSProperties = {
  flex: '1 1 0',
  minHeight: 48,
  padding: '12px 16px',
  fontFamily: SANS_FONT,
  fontWeight: 600,
  fontSize: '0.9375rem',
  color: '#fff',
  backgroundColor: 'var(--ed-accent)',
  border: '1px solid var(--ed-accent)',
  borderRadius: 4,
  cursor: 'pointer',
}

export default function PracticeActions({
  onReview,
  onNext,
  onKnown,
  onPrev,
  isFirst,
}: PracticeActionsProps) {
  return (
    <div
      data-testid="practice-actions"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: '100%',
        maxWidth: 520,
        margin: '0 auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <button
          type="button"
          data-testid="practice-prev"
          onClick={onPrev}
          disabled={isFirst}
          className="ed-btn-press"
          style={{
            minHeight: 44,
            padding: '6px 10px',
            fontFamily: SANS_FONT,
            fontWeight: 500,
            fontSize: '0.8125rem',
            color: isFirst ? 'var(--text-muted)' : 'var(--text-primary)',
            backgroundColor: 'transparent',
            border: 'none',
            opacity: isFirst ? 0.5 : 1,
            cursor: isFirst ? 'not-allowed' : 'pointer',
          }}
        >
          ← Précédent
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 10,
          width: '100%',
        }}
      >
        <button
          type="button"
          data-testid="practice-action-review"
          onClick={onReview}
          className="ed-btn-press"
          style={reviewButtonStyle}
        >
          À revoir
        </button>
        <button
          type="button"
          data-testid="practice-action-next"
          onClick={onNext}
          className="ed-btn-press"
          style={nextButtonStyle}
        >
          Suivant
        </button>
        <button
          type="button"
          data-testid="practice-action-known"
          onClick={onKnown}
          className="ed-btn-press"
          style={knownButtonStyle}
        >
          Connu
        </button>
      </div>
    </div>
  )
}
