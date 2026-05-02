'use client'

// P-220 — multi-select question (q8 only at present). Tap to toggle each
// option. Continue is enabled at all times because the q8 question is
// optional and an empty selection is valid.

import { useState } from 'react'
import {
  OnboardingScreen,
  OnboardingCard,
  CheckIcon,
  INK,
  DISPLAY_FONT,
} from '../OnboardingScreen'
import type { OnboardingQuestion } from '@/lib/onboarding-questions'
import type { UiLanguage } from '@/lib/types'
import { getQuestionMeta } from '../questionMeta'

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
}: MultiSelectQuestionProps) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialValue ?? []),
  )
  const meta = getQuestionMeta(question.id)
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
      bg={meta.bg}
      progressTotal={progressTotal}
      progressFilledUpTo={progressFilledUpTo}
      progressCurrent={progressCurrent}
      illustration={meta.illustration}
      illustrationAlt={meta.illustrationAlt}
      headline={question.heading[language]}
      descriptor={question.helper[language]}
      // Optional questions are always continuable (empty selection is valid).
      // Required multi-selects (none today) would gate on selected.size > 0.
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
            minHeight={64}
          >
            <span
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 600,
                fontSize: 15,
                color: INK,
                lineHeight: '22px',
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
