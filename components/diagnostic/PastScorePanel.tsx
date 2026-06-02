'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

export default function PastScorePanel() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <aside
      data-testid="diagnostic-past-score"
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: 'clamp(14px, 1.5vw, 18px) clamp(16px, 2vw, 22px)',
        backgroundColor: 'var(--bg-subtle)',
        border: '1px solid var(--rule-default)',
        borderRadius: 4,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          Dernier diagnostic
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span
            style={{
              fontFamily: SERIF_FONT,
              fontWeight: 500,
              fontSize: 'clamp(26px, 2.8vw, 34px)',
              lineHeight: 1,
              letterSpacing: '-0.01em',
              color: 'var(--text-primary)',
            }}
          >
            C1
          </span>
          <span
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 400,
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
            }}
          >
            il y a 7 jours
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link
          data-testid="diagnostic-past-score-link"
          href="/maitre/diagnostic/results"
          className="ed-btn-press"
          style={{
            padding: '10px 16px',
            fontFamily: SANS_FONT,
            fontWeight: 600,
            fontSize: '0.875rem',
            color: 'var(--text-primary)',
            backgroundColor: 'transparent',
            border: '1px solid var(--rule-default)',
            borderRadius: 4,
            textDecoration: 'none',
            minHeight: 44,
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Voir les résultats
        </Link>
        <button
          type="button"
          data-testid="past-score-dismiss"
          aria-label="Fermer le panneau de score"
          onClick={() => setDismissed(true)}
          style={{
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            borderRadius: 4,
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 0,
            fontSize: '1.1rem',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    </aside>
  )
}
