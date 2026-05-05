'use client'

// F-200 — language toggle. Editorial chrome (no pill backdrop, no blur).
// Active lang in fg, inactive in muted with hover to fg. Plain Link
// between routes — no JS state, no localStorage. Client component because
// of hover-color transitions (event handlers).

import Link from 'next/link'
import type { Lang } from './copy'
import { TOGGLE_LABELS } from './copy'
import { ED, LETTER_SPACING, SANS_FONT } from '@/lib/typography'

const HREF: Record<Lang, string> = {
  en: '/',
  fr: '/fr',
}

interface LanguageToggleProps {
  currentLang: Lang
}

export default function LanguageToggle({ currentLang }: LanguageToggleProps) {
  const otherLang: Lang = currentLang === 'en' ? 'fr' : 'en'
  return (
    <div
      className="flex items-center"
      style={{ gap: 4 }}
      aria-label={currentLang === 'fr' ? 'Choix de la langue' : 'Language'}
    >
      <span
        aria-current="page"
        style={{
          padding: '6px 10px',
          fontFamily: SANS_FONT,
          fontWeight: 600,
          fontSize: '0.8125rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: ED.fg,
        }}
      >
        {TOGGLE_LABELS[currentLang]}
      </span>
      <span
        aria-hidden="true"
        style={{
          color: ED.rule,
          fontFamily: SANS_FONT,
          fontSize: '0.75rem',
          fontWeight: 400,
        }}
      >
        /
      </span>
      <Link
        href={HREF[otherLang]}
        prefetch
        style={{
          padding: '6px 10px',
          fontFamily: SANS_FONT,
          fontWeight: 500,
          fontSize: '0.8125rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: ED.muted,
          textDecoration: 'none',
          transition: 'color var(--ed-duration-hover) var(--ed-ease)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = ED.fg }}
        onMouseLeave={(e) => { e.currentTarget.style.color = ED.muted }}
      >
        {TOGGLE_LABELS[otherLang]}
      </Link>
    </div>
  )
}
