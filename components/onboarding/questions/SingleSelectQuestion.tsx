'use client'

// F-201 — single-select. Inherits OnboardingScreen kernel (now editorial
// system + 720px desktop column). Illustration prop dropped per F-201
// scope decision.

import { useState } from 'react'
import { OnboardingScreen, OnboardingCard, CheckIcon } from '../OnboardingScreen'
import type { OnboardingQuestion } from '@/lib/onboarding-questions'
import type { UiLanguage } from '@/lib/types'

const SANS = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'

interface SingleSelectQuestionProps {
  question: OnboardingQuestion
  language: UiLanguage
  initialValue: string | null
  progressTotal: number
  progressCurrent: number
  progressFilledUpTo: number
  onContinue: (value: string) => void
  onBack?: () => void
  headerRight?: React.ReactNode
}

export default function SingleSelectQuestion({
  question,
  language,
  initialValue,
  progressTotal,
  progressCurrent,
  progressFilledUpTo,
  onContinue,
  onBack,
  headerRight,
}: SingleSelectQuestionProps) {
  const [selected, setSelected] = useState<string | null>(initialValue)
  const options = question.options ?? []

  return (
    <OnboardingScreen
      progressTotal={progressTotal}
      progressFilledUpTo={progressFilledUpTo}
      progressCurrent={progressCurrent}
      headline={question.heading[language]}
      descriptor={question.helper[language]}
      ctaEnabled={selected !== null}
      onContinue={() => selected !== null && onContinue(selected)}
      onBack={onBack}
      headerRight={headerRight}
    >
      {options.map((option) => {
        const isSelected = selected === option.value
        return (
          <OnboardingCard
            key={option.value}
            isSelected={isSelected}
            onClick={() => setSelected(option.value)}
            minHeight={64}
          >
            <span
              style={{
                fontFamily: SANS,
                fontWeight: 500,
                fontSize: 15,
                lineHeight: 1.5,
                flex: 1,
                paddingRight: 12,
              }}
            >
              {option.label[language]}
            </span>
            <CheckIcon visible={isSelected} />
          </OnboardingCard>
        )
      })}
    </OnboardingScreen>
  )
}
