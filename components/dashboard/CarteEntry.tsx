'use client'

import Link from 'next/link'
import { Map, ArrowRight } from 'lucide-react'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

// F-457 — dashboard entry into La Carte (the journey map). Unlike the gated
// séance CTA above it, this is a live link: /carte renders now. v3 tokens,
// rounded-only.
export default function CarteEntry() {
  return (
    <Link
      href="/carte"
      data-testid="dashboard-carte-entry"
      className="ed-card-lift"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: 'clamp(16px, 2vw, 20px) clamp(18px, 2vw, 24px)',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 'var(--r-lg)',
        textDecoration: 'none',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 44,
          height: 44,
          flexShrink: 0,
          borderRadius: 'var(--r-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
          color: 'var(--accent)',
        }}
      >
        <Map size={22} strokeWidth={1.75} />
      </span>

      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: 'block',
            fontFamily: SERIF_FONT,
            fontWeight: 500,
            fontSize: 'clamp(16px, 1.8vw, 19px)',
            lineHeight: 1.2,
            color: 'var(--text-primary)',
          }}
        >
          Voir ma carte
        </span>
        <span
          style={{
            display: 'block',
            fontFamily: SANS_FONT,
            fontSize: '0.875rem',
            lineHeight: 1.4,
            color: 'var(--text-secondary)',
            marginTop: 3,
          }}
        >
          Votre parcours, île par île.
        </span>
      </span>

      <ArrowRight
        size={20}
        strokeWidth={2}
        aria-hidden="true"
        style={{ flexShrink: 0, color: 'var(--text-muted)' }}
      />
    </Link>
  )
}
