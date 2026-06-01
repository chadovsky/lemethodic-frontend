'use client'

import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

export default function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div
      data-testid="vocab-empty-state"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 16,
        padding: 'clamp(32px, 4vw, 48px) 24px',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 4,
      }}
    >
      <p
        style={{
          fontFamily: SERIF_FONT,
          fontWeight: 500,
          fontSize: 'clamp(18px, 1.6vw, 22px)',
          lineHeight: 1.3,
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        Aucun chunk ne correspond à vos filtres.
      </p>
      <button
        type="button"
        data-testid="vocab-empty-reset"
        onClick={onReset}
        className="ed-btn-press"
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 500,
          fontSize: '0.9375rem',
          color: 'var(--bg-elevated)',
          backgroundColor: 'var(--cta-utility)',
          border: 'none',
          padding: '10px 18px',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        Réinitialiser les filtres
      </button>
    </div>
  )
}
