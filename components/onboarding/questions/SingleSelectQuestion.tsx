'use client'

// P-220 — single-select question. Renders one card per option; tapping a
// card selects it; Continue commits the selection. The q9 'other' case is
// handled by the parent flow (it inserts a follow-up freetext screen when
// the chosen value === 'other'); this component just emits the value.

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

interface SingleSelectQuestionProps {
  question: OnboardingQuestion
  language: UiLanguage
  initialValue: string | null
  progressTotal: number
  progressCurrent: number     // 1-indexed
  progressFilledUpTo: number  // 1-indexed
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
  const meta = getQuestionMeta(question.id)
  const options = question.options ?? []

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
            minHeight={80}
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
