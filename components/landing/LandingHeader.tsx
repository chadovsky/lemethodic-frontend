// F-200 — landing top bar. Brand wordmark + language toggle. No nav links
// (single-page layout). Editorial chrome: ed-fg ink, no shadow, 1px ed-rule
// bottom border on scroll (added later via sticky-shadow if needed).

import LanguageToggle from './LanguageToggle'
import type { Lang } from './copy'
import Wordmark from '@/components/Wordmark'

interface LandingHeaderProps {
  lang: Lang
}

export default function LandingHeader({ lang }: LandingHeaderProps) {
  return (
    <header
      className="w-full flex items-center justify-between"
      style={{
        padding: 'clamp(20px, 2.5vw, 28px) clamp(24px, 4vw, 64px)',
        maxWidth: 1280,
        margin: '0 auto',
      }}
    >
      <Wordmark size="showcase" animateReveal />
      <LanguageToggle currentLang={lang} />
    </header>
  )
}
