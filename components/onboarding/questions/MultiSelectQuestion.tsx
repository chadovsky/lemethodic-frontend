'use client'

// F-201 — multi-select (q8 only). Inherits OnboardingScreen kernel.
// Illustration prop dropped.

import { useState } from 'react'
import { OnboardingScreen, OnboardingCard, CheckIcon } from '../OnboardingScreen'
import type { OnboardingQuestion } from '@/lib/onboarding-questions'
import type { UiLanguage } from '@/lib/types'

const SANS = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'

interface MultiSelectQuestionProps {
  question: OnboardingQuestion
  language: UiLanguage
  initialValue: string[] | null
  progressTotal: number
  progressCurrent: number
  progressFilledUpTo: number
  onContinue: (value: string[]) => void
  onBack?: () => void
  headerRight?: React.ReactNode
  bg?: string
}

export default function MultiSelectQuestion({
  question,
  language,
  initialValue,
  progressTotal,
  progressCurrent,
  progressFilledUpTo,
  onContinue,
  onBack,
  headerRight,
  bg,
}: MultiSelectQuestionProps) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialValue ?? []),
  )
  const options = question.options ?? []

  function toggle(value: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  return (
    <OnboardingScreen
      bg={bg}
      progressTotal={progressTotal}
      progressFilledUpTo={progressFilledUpTo}
      progressCurrent={progressCurrent}
      headline={question.heading[language]}
      descriptor={question.helper[language]}
      ctaEnabled={question.required ? selected.size > 0 : true}
      onContinue={() => onContinue(Array.from(selected))}
      onBack={onBack}
      headerRight={headerRight}
    >
      {options.map((option) => {
        const isSelected = selected.has(option.value)
        return (
          <OnboardingCard
            key={option.value}
            isSelected={isSelected}
            onClick={() => toggle(option.value)}
            minHeight={56}
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
