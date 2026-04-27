'use client'

import { useState } from 'react'
import Image from 'next/image'
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
  icon: string
  iconAlt: string
  title: string
  descriptor: string
}[] = [
  {
    id: 'immigration',
    icon: '/icons/flag-canada.png',
    iconAlt: 'Canadian flag',
    title: 'Canadian immigration',
    // F-091.0 — V1 onboarding lock to TCF-only. TEF dropped from the
    // descriptor (was "TCF / TEF Canada, CLB scoring") since the
    // backend exam_profiles registry only ships TCF Canada today.
    // F-091b will reintroduce TEF post-launch.
    descriptor: 'TCF Canada, CLB scoring',
  },
  {
    id: 'studies',
    icon: '/icons/graduation-cap.png',
    iconAlt: 'Graduation cap',
    title: 'Studies in France',
    // F-091.0 — was "DELF, DALF, academic admissions". DELF/DALF
    // pulled per the V1 TCF-only lock; the studies path remains open
    // because TCF is a legitimate target for academic admissions
    // (TCF DAP for university entry).
    descriptor: 'TCF for academic admissions',
  },
  {
    id: 'general',
    icon: '/icons/globe.png',
    iconAlt: 'Globe',
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
      illustration="/illustrations/passport.png"
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
            {/* Left: icon + text */}
            <div className="flex items-start gap-4 flex-1">
              <Image
                src={goal.icon}
                alt={goal.iconAlt}
                width={44}
                height={44}
                className="object-contain shrink-0"
                style={{ marginTop: 2, filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.14))' }}
              />
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
