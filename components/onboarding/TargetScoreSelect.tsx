'use client'

import { useState } from 'react'
import {
  OnboardingScreen,
  OnboardingCard,
  CheckIcon,
  INK,
  INK_SOFT,
  INK_MUTED,
  DISPLAY_FONT,
} from './OnboardingScreen'
import type { TCFGoal } from './TCFGoalSelect'

export type TargetScore = string

interface TargetScoreSelectProps {
  goal: TCFGoal
  onContinue: (score: TargetScore) => void
  onBack: () => void
}

const IMMIGRATION_OPTIONS: { id: string; title: string; descriptor: string; popular?: boolean }[] = [
  { id: 'CLB 5', title: 'CLB 5', descriptor: 'Basic working proficiency' },
  { id: 'CLB 7', title: 'CLB 7', descriptor: 'Common PR minimum', popular: true },
  { id: 'CLB 8-9', title: 'CLB 8-9', descriptor: 'Higher CRS points for Express Entry' },
  { id: 'CLB 10+', title: 'CLB 10+', descriptor: 'Maximum French-ability points' },
]

const STUDIES_OPTIONS: { id: string; title: string; descriptor: string }[] = [
  { id: 'B1', title: 'B1', descriptor: 'Minimum for most universities' },
  { id: 'B2', title: 'B2', descriptor: 'Standard for undergraduate admission' },
  { id: 'C1', title: 'C1', descriptor: 'Graduate programs, competitive admissions' },
  { id: 'C2', title: 'C2', descriptor: 'Near-native fluency' },
]

const GENERAL_OPTIONS: { id: string; title: string; descriptor: string }[] = [
  { id: 'Confident conversational', title: 'Confident conversational', descriptor: 'I want to hold any conversation' },
  { id: 'Fluent with mistakes', title: 'Fluent with mistakes', descriptor: 'I want to speak without freezing up' },
  { id: 'Professional level', title: 'Professional level', descriptor: 'I want to use French at work' },
  { id: 'Near-native', title: 'Near-native', descriptor: 'I want to sound like a local' },
]

function getOptions(goal: TCFGoal) {
  if (goal === 'immigration') return IMMIGRATION_OPTIONS
  if (goal === 'studies') return STUDIES_OPTIONS
  return GENERAL_OPTIONS
}

function getDescriptor(goal: TCFGoal) {
  if (goal === 'immigration')
    return 'For Canadian immigration, CLB 7 is the common minimum. Higher scores give you more points.'
  if (goal === 'studies')
    return 'Different programs have different French requirements. Pick your target level.'
  return 'Pick where you want to be.'
}

export default function TargetScoreSelect({ goal, onContinue, onBack }: TargetScoreSelectProps) {
  const [selected, setSelected] = useState<TargetScore | null>(null)
  const options = getOptions(goal)

  return (
    <OnboardingScreen
      bg="#E0D4F0"
      progressFilledUpTo={4}
      progressCurrent={4}
      illustration="/illustration-score.png"
      illustrationAlt="Target with arrow in bullseye illustration"
      headline="What score do you need?"
      descriptor={getDescriptor(goal)}
      ctaEnabled={!!selected}
      onContinue={() => selected && onContinue(selected)}
      onBack={onBack}
    >
      {options.map((option) => {
        const isSelected = selected === option.id
        const hasPopular = 'popular' in option && option.popular
        return (
          <OnboardingCard
            key={option.id}
            isSelected={isSelected}
            onClick={() => setSelected(option.id)}
          >
            <div className="flex items-start gap-3 flex-1">
              <div className="flex flex-col gap-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      fontFamily: DISPLAY_FONT,
                      fontWeight: 700,
                      fontSize: 16,
                      color: INK,
                      lineHeight: '22px',
                    }}
                  >
                    {option.title}
                  </span>
                  {hasPopular && (
                    <span
                      style={{
                        fontFamily: DISPLAY_FONT,
                        fontWeight: 700,
                        fontSize: 11,
                        color: '#FFFFFF',
                        backgroundColor: INK,
                        borderRadius: 20,
                        padding: '2px 8px',
                        lineHeight: '16px',
                        letterSpacing: '0.02em',
                      }}
                    >
                      Most popular
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: 13,
                    color: INK_SOFT,
                    lineHeight: '20px',
                  }}
                >
                  {option.descriptor}
                </span>
              </div>
            </div>
            <CheckIcon visible={isSelected} />
          </OnboardingCard>
        )
      })}
    </OnboardingScreen>
  )
}
