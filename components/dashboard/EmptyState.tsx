'use client'

// P-100 — empty-state shown on the Progress dashboard when the user has
// zero recordings. Routes them to the Speaking Lab Tâche 1 picker to
// take their first diagnostic, which unlocks the dashboard sections.

import Link from 'next/link'
import { useInterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'

const INK         = '#1A1A1A'
const INK_SOFT    = '#1A1A1AB3'
const INK_MUTED   = '#1A1A1A66'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

export default function EmptyState() {
  const lang = useInterfaceLanguage()
  const eyebrow = lang === 'fr' ? 'Tableau de bord' : 'Dashboard'
  const heading =
    lang === 'fr'
      ? 'Faites votre diagnostic pour débloquer votre tableau de bord'
      : 'Take your diagnostic to unlock your dashboard'
  const body =
    lang === 'fr'
      ? 'Une fois votre première session enregistrée, vous verrez vos couches, vos schémas récurrents et votre progression.'
      : 'Once your first session is recorded, you’ll see your couches, recurring patterns, and progress over time.'
  const ctaLabel = lang === 'fr' ? 'Commencer la Tâche 1' : 'Start Tâche 1'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '40px 8px',
        gap: 14,
      }}
    >
      <p
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color: INK_MUTED,
          margin: 0,
        }}
      >
        {eyebrow}
      </p>
      <h2
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 800,
          fontSize: 24,
          lineHeight: 1.2,
          color: INK,
          margin: 0,
          maxWidth: 320,
        }}
      >
        {heading}
      </h2>
      <p
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 500,
          fontSize: 14,
          lineHeight: 1.5,
          color: INK_SOFT,
          margin: 0,
          maxWidth: 320,
        }}
      >
        {body}
      </p>
      <Link
        href="/speaking/tache-1"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          minHeight: 48,
          padding: '0 22px',
          backgroundColor: INK,
          color: '#FFFFFF',
          borderRadius: 14,
          textDecoration: 'none',
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 15,
          marginTop: 8,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {ctaLabel}
      </Link>
    </div>
  )
}
