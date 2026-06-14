'use client'

import { PlayCircle } from 'lucide-react'
import Bientot from '@/components/bientot/Bientot'
import { SANS_FONT } from '@/lib/typography'

// F-453 — primary dashboard CTA. Gated via the F-359 bientôt pattern: visible
// and accent-styled, but honestly not-yet-active (Bientot dims it and disables
// pointer events). No fixture deep-link — the séance surface is still 'bientot'.
export default function CommencerSeance() {
  return (
    <div data-testid="dashboard-commencer-seance">
      <Bientot level="surface" label="La séance guidée arrive bientôt.">
        <div
          role="presentation"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 24px',
            backgroundColor: 'var(--accent)',
            color: 'var(--paper)',
            fontFamily: SANS_FONT,
            fontWeight: 600,
            fontSize: '1rem',
            letterSpacing: '0.01em',
            borderRadius: 12,
          }}
        >
          <PlayCircle size={20} strokeWidth={1.75} />
          Commencer la séance
        </div>
      </Bientot>
    </div>
  )
}
