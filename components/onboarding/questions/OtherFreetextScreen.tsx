'use client'

// P-220 — synthetic follow-up screen for q9 when value === 'other'.
// Collects q9_native_language_other (free text). Not part of the BE
// questions list; the parent flow inserts it.

import { useState } from 'react'
import Image from 'next/image'
import {
  ProgressDots,
  CTAButton,
  BackButton,
  INK,
  INK_SOFT,
  INK_MUTED,
  PAPER,
  DISPLAY_FONT,
} from '../OnboardingScreen'
import type { UiLanguage } from '@/lib/types'
import { getQuestionMeta } from '../questionMeta'

interface OtherFreetextScreenProps {
  language: UiLanguage
  initialValue: string | null
  progressTotal: number
  progressCurrent: number
  progressFilledUpTo: number
  onContinue: (value: string) => void
  onBack?: () => void
  headerRight?: React.ReactNode
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
}: OtherFreetextScreenProps) {
  const [value, setValue] = useState(initialValue ?? '')
  const meta = getQuestionMeta('q9_native_language_other')
  const copy = COPY[language]
  const trimmed = value.trim()
  const isEnabled = trimmed.length > 0

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center"
      style={{ backgroundColor: meta.bg }}
    >
      <div className="w-full max-w-[440px] flex flex-col flex-1 min-h-screen px-5">
        <div className="relative flex items-center pt-4" style={{ minHeight: 32 }}>
          {onBack && (
            <div className="absolute left-0">
              <BackButton onClick={onBack} />
            </div>
          )}
          <div className="flex-1">
            <ProgressDots total={progressTotal} filledUpTo={progressFilledUpTo} current={progressCurrent} />
          </div>
          {headerRight && <div className="absolute right-0">{headerRight}</div>}
        </div>

        <div className="flex justify-center mt-10">
          <Image
            src={meta.illustration}
            alt={meta.illustrationAlt}
            width={240}
            height={240}
            className="object-contain"
            style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.15))' }}
            priority
          />
        </div>

        <h1
          className="text-center mt-8 leading-tight text-balance"
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 800,
            fontSize: 32,
            lineHeight: '40px',
            color: INK,
          }}
        >
          {copy.headline}
        </h1>

        <p
          className="text-center mt-3 mx-auto text-pretty"
          style={{
            fontWeight: 500,
            fontSize: 15,
            lineHeight: '24px',
            color: INK_SOFT,
            maxWidth: 320,
          }}
        >
          {copy.descriptor}
        </p>

        <div className="mt-10">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={copy.placeholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isEnabled) {
                e.preventDefault()
                onContinue(trimmed)
              }
            }}
            style={{
              height: 56,
              width: '100%',
              borderRadius: 16,
              border: `2px solid ${value ? INK : INK_MUTED}`,
              backgroundColor: PAPER,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              padding: '0 20px',
              fontFamily: DISPLAY_FONT,
              fontWeight: 600,
              fontSize: 16,
              color: INK,
              outline: 'none',
            }}
          />
        </div>

        <div className="flex-1" />

        <CTAButton
          label={copy.cta}
          enabled={isEnabled}
          onClick={() => isEnabled && onContinue(trimmed)}
        />
      </div>
    </div>
  )
}
