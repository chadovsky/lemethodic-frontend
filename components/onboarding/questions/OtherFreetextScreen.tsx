'use client'

// F-201 — q9 'other' freetext follow-up. Refactored to use OnboardingScreen
// kernel; text input in the cards slot. Illustration dropped.

import { useState } from 'react'
import { OnboardingScreen } from '../OnboardingScreen'
import type { UiLanguage } from '@/lib/types'

const SANS = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'
const ED_FG = 'var(--ed-fg)'
const ED_MUTED = 'var(--ed-muted)'
const ED_RULE = 'var(--ed-rule)'
const ED_PAPER = 'var(--ed-paper)'

interface OtherFreetextScreenProps {
  language: UiLanguage
  initialValue: string | null
  progressTotal: number
  progressCurrent: number
  progressFilledUpTo: number
  onContinue: (value: string) => void
  onBack?: () => void
  headerRight?: React.ReactNode
  bg?: string
}

const COPY = {
  en: {
    headline: 'Which language?',
    descriptor: 'Type the name of your first language.',
    placeholder: 'e.g. Tagalog, Vietnamese, Polish',
    cta: 'Continue',
  },
  fr: {
    headline: 'Quelle langue ?',
    descriptor: 'Tapez le nom de votre langue maternelle.',
    placeholder: 'p. ex. Tagalog, Vietnamien, Polonais',
    cta: 'Continuer',
  },
} as const

export default function OtherFreetextScreen({
  language,
  initialValue,
  progressTotal,
  progressCurrent,
  progressFilledUpTo,
  onContinue,
  onBack,
  headerRight,
  bg,
}: OtherFreetextScreenProps) {
  const [value, setValue] = useState(initialValue ?? '')
  const copy = COPY[language]
  const trimmed = value.trim()
  const isEnabled = trimmed.length > 0

  return (
    <OnboardingScreen
      bg={bg}
      progressTotal={progressTotal}
      progressFilledUpTo={progressFilledUpTo}
      progressCurrent={progressCurrent}
      headline={copy.headline}
      descriptor={copy.descriptor}
      ctaEnabled={isEnabled}
      onContinue={() => isEnabled && onContinue(trimmed)}
      onBack={onBack}
      headerRight={headerRight}
      ctaLabel={copy.cta}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={copy.placeholder}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter' && isEnabled) {
            e.preventDefault()
            onContinue(trimmed)
          }
        }}
        style={{
          height: 56,
          width: '100%',
          borderRadius: 4,
          border: `1px solid ${value ? ED_FG : ED_RULE}`,
          backgroundColor: ED_PAPER,
          padding: '0 22px',
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: 16,
          color: ED_FG,
          outline: 'none',
          transition: 'border-color var(--ed-duration-hover) var(--ease-spring)',
        }}
      />
    </OnboardingScreen>
  )
}
