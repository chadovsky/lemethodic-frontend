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

export type CurrentLevel = 'A1_A2' | 'A2_B1' | 'B1_B2' | 'B2_plus'

interface CurrentLevelSelectProps {
  onContinue: (level: CurrentLevel) => void
  onBack: () => void
}

const LEVELS: {
  id: CurrentLevel
  sentence: string
}[] = [
  {
    id: 'A1_A2',
    sentence:
      'I can say hello, introduce myself, and handle basic everyday situations — ordering food, asking directions.',
  },
  {
    id: 'A2_B1',
    sentence:
      'I can talk about familiar topics — my work, my family, my hobbies — but I struggle with abstract ideas.',
  },
  {
    id: 'B1_B2',
    sentence:
      'I can discuss most topics, give opinions, and hold a conversation, but I make grammatical mistakes.',
  },
  {
    id: 'B2_plus',
    sentence:
      'I can argue, nuance my opinions, and handle formal French, but I want to polish my fluency for the exam.',
  },
]

export default function CurrentLevelSelect({ onContinue, onBack }: CurrentLevelSelectProps) {
  const [selected, setSelected] = useState<CurrentLevel | null>(null)

  return (
    <OnboardingScreen
      bg="#FFF0C2"
      progressFilledUpTo={3}
      progressCurrent={3}
      illustration="/illustrations/stairs.png"
      illustrationAlt="Stepping-stones path illustration"
      headline="Where are you right now?"
      descriptor="Pick the sentence that sounds most like you. You can change this later."
      ctaEnabled={!!selected}
      onContinue={() => selected && onContinue(selected)}
      onBack={onBack}
    >
      {LEVELS.map((level) => {
        const isSelected = selected === level.id
        return (
          <OnboardingCard
            key={level.id}
            isSelected={isSelected}
            onClick={() => setSelected(level.id)}
            minHeight={100}
          >
            {/* Sentence */}
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
              {level.sentence}
            </span>
            <CheckIcon visible={isSelected} />
          </OnboardingCard>
        )
      })}
    </OnboardingScreen>
  )
}
