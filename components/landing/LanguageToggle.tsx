// M-101a — language toggle for the landing page. Renders as two pill buttons;
// the active language is a styled span (aria-current=page), the inactive one
// is a Next <Link> to the alternate route. No JS state, no localStorage —
// language is derived entirely from the URL. /onboarding has its own
// localStorage-driven toggle (P-220 pattern); these are intentionally
// separate flows with separate i18n needs.

import Link from 'next/link'
import type { Lang } from './copy'
import { TOGGLE_LABELS } from './copy'
import { DISPLAY_FONT, INK, INK_MUTED } from '../onboarding/OnboardingScreen'

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
      className="flex items-center gap-1"
      style={{
        height: 32,
        padding: 2,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      aria-label={currentLang === 'fr' ? 'Choix de la langue' : 'Language'}
    >
      <span
        aria-current="page"
        style={{
          height: 28,
          minWidth: 36,
          padding: '0 10px',
          borderRadius: 999,
          backgroundColor: INK,
          color: '#FFFFFF',
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {TOGGLE_LABELS[currentLang]}
      </span>
      <Link
        href={HREF[otherLang]}
        prefetch
        style={{
          height: 28,
          minWidth: 36,
          padding: '0 10px',
          borderRadius: 999,
          color: INK_MUTED,
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
        }}
      >
        {TOGGLE_LABELS[otherLang]}
      </Link>
    </div>
  )
}
