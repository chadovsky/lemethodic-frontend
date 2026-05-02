// M-101a — landing page top bar. Brand wordmark on the left, language toggle
// on the right. No nav links (single-page layout per M-101 doc note #10).

import LanguageToggle from './LanguageToggle'
import { BRAND, type Lang } from './copy'
import { DISPLAY_FONT, INK } from '../onboarding/OnboardingScreen'

interface LandingHeaderProps {
  lang: Lang
}

export default function LandingHeader({ lang }: LandingHeaderProps) {
  return (
    <header
      className="w-full flex items-center justify-between"
      style={{
        padding: '20px 24px calc(8px) 24px',
        maxWidth: 1080,
        margin: '0 auto',
      }}
    >
      <span
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 800,
          fontSize: 22,
          color: INK,
          letterSpacing: '-0.01em',
        }}
      >
        {BRAND}
      </span>
      <LanguageToggle currentLang={lang} />
    </header>
  )
}
