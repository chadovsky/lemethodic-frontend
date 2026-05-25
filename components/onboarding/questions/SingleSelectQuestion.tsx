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
  // F-221 — optional helper text override. Used by OnboardingFlow to
  // inject per-exam helper text on q2_target_level once q0_target_exam
  // is known (e.g., "B2 maps to CLB 7-8 for Canadian PR" for TCF Canada).
  helperOverride?: string
  // V-012b — pastel rotation bg from OnboardingFlow.
  bg?: string
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
  helperOverride,
  bg,
}: SingleSelectQuestionProps) {
  const [selected, setSelected] = useState<string | null>(initialValue)
  const options = question.options ?? []

  return (
    <OnboardingScreen
      bg={bg}
      progressTotal={progressTotal}
      progressFilledUpTo={progressFilledUpTo}
      progressCurrent={progressCurrent}
      headline={question.heading[language]}
      descriptor={helperOverride ?? question.helper[language]}
      ctaEnabled={selected !== null}
      ctaHint={language === 'fr' ? 'Choisissez une option pour continuer.' : 'Select an option to continue.'}
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
