'use client'

import { SANS_FONT } from '@/lib/typography'

interface PracticeActionsProps {
  onReview: () => void
  onNext: () => void
  onKnown: () => void
  onPrev: () => void
  isFirst: boolean
}

const secondaryButtonStyle: React.CSSProperties = {
  flex: '1 1 0',
  minHeight: 48,
  padding: '12px 16px',
  fontFamily: SANS_FONT,
  fontWeight: 600,
  fontSize: '0.9375rem',
  color: 'var(--text-primary)',
  backgroundColor: 'var(--bg-elevated)',
  border: '1px solid var(--rule-default)',
  borderRadius: 4,
  cursor: 'pointer',
}

const primaryButtonStyle: React.CSSProperties = {
  flex: '1 1 0',
  minHeight: 48,
  padding: '12px 16px',
  fontFamily: SANS_FONT,
  fontWeight: 600,
  fontSize: '0.9375rem',
  color: 'var(--bg-elevated)',
  backgroundColor: 'var(--cta-primary)',
  border: '1px solid var(--cta-primary)',
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
            minHeight: 36,
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
          style={secondaryButtonStyle}
        >
          À revoir
        </button>
        <button
          type="button"
          data-testid="practice-action-next"
          onClick={onNext}
          className="ed-btn-press"
          style={primaryButtonStyle}
        >
          Suivant
        </button>
        <button
          type="button"
          data-testid="practice-action-known"
          onClick={onKnown}
          className="ed-btn-press"
          style={secondaryButtonStyle}
        >
          Connu
        </button>
      </div>
    </div>
  )
}
