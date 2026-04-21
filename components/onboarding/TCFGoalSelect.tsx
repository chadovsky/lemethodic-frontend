'use client'

import { useState } from 'react'
import {
  OnboardingScreen,
  OnboardingCard,
  CheckIcon,
  INK,
  INK_SOFT,
  DISPLAY_FONT,
} from './OnboardingScreen'

export type TCFGoal = 'immigration' | 'studies' | 'general'

interface TCFGoalSelectProps {
  onContinue: (goal: TCFGoal) => void
  onBack: () => void
}

const GOALS: {
  id: TCFGoal
  flag: string
  flagAlt: string
  title: string
  descriptor: string
}[] = [
  {
    id: 'immigration',
    flag: '🇨🇦',
    flagAlt: 'Canadian flag',
    title: 'Canadian immigration',
    descriptor: 'TCF / TEF Canada, CLB scoring',
  },
  {
    id: 'studies',
    flag: '🎓',
    flagAlt: 'Graduation cap',
    title: 'Studies in France',
    descriptor: 'DELF, DALF, academic admissions',
  },
  {
    id: 'general',
    flag: '🌍',
    flagAlt: 'Globe',
    title: 'General French level',
    descriptor: 'I want to improve my speaking',
  },
]

export default function TCFGoalSelect({ onContinue, onBack }: TCFGoalSelectProps) {
  const [selected, setSelected] = useState<TCFGoal | null>(null)

  return (
    <OnboardingScreen
      bg="#D4E4D0"
      progressFilledUpTo={2}
      progressCurrent={2}
      illustration="/illustration-goal.jpg"
      illustrationAlt="Passport with boarding pass illustration"
      headline="Why are you learning French?"
      descriptor="This helps us tune your practice to your exam."
      ctaEnabled={!!selected}
      onContinue={() => selected && onContinue(selected)}
      onBack={onBack}
    >
      {GOALS.map((goal) => {
        const isSelected = selected === goal.id
        return (
          <OnboardingCard
            key={goal.id}
            isSelected={isSelected}
            onClick={() => setSelected(goal.id)}
          >
            {/* Left: flag + text */}
            <div className="flex items-start gap-4 flex-1">
              <span
                role="img"
                aria-label={goal.flagAlt}
                style={{ fontSize: 28, lineHeight: 1, userSelect: 'none', marginTop: 2 }}
              >
                {goal.flag}
              </span>
              <div className="flex flex-col gap-0.5">
                <span
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 700,
                    fontSize: 16,
                    color: INK,
                    lineHeight: '22px',
                  }}
                >
                  {goal.title}
                </span>
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: 13,
                    color: INK_SOFT,
                    lineHeight: '20px',
                  }}
                >
                  {goal.descriptor}
                </span>
              </div>
            </div>

            {/* Right: checkmark / chevron */}
            <CheckIcon visible={isSelected} />
          </OnboardingCard>
        )
      })}
    </OnboardingScreen>
  )
}
