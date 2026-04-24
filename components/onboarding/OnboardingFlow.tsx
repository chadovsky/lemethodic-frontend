'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LanguageSelect from './LanguageSelect'
import TCFGoalSelect, { type TCFGoal } from './TCFGoalSelect'
import CurrentLevelSelect, { type CurrentLevel } from './CurrentLevelSelect'
import TargetScoreSelect, { type TargetScore } from './TargetScoreSelect'
import ExamDateSelect, { type ExamDate } from './ExamDateSelect'
import RaccourciReveal from './RaccourciReveal'
import { useOnboardingStore } from '@/lib/onboarding'

interface OnboardingState {
  uiLanguage: 'en' | 'es' | null
  goal: TCFGoal | null
  currentLevel: CurrentLevel | null
  targetScore: TargetScore | null
  examDate: ExamDate | null
}

export default function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [state, setState] = useState<OnboardingState>({
    uiLanguage: null,
    goal: null,
    currentLevel: null,
    targetScore: null,
    examDate: null,
  })

  function goBack() {
    setStep((s) => Math.max(1, s - 1))
  }

  // Each step's onContinue mirrors the selection into the onboarding store
  // in addition to local React state. Local state drives the step-6 summary
  // render; the store drives the signup flush (mapOnboardingToBackend reads
  // from the store, not from this component).

  // Step 1 — Language
  if (step === 1) {
    return (
      <LanguageSelect
        onContinue={(lang) => {
          useOnboardingStore.getState().setField('uiLanguage', lang)
          setState((s) => ({ ...s, uiLanguage: lang }))
          setStep(2)
        }}
      />
    )
  }

  // Step 2 — Goal
  if (step === 2) {
    return (
      <TCFGoalSelect
        onContinue={(goal) => {
          useOnboardingStore.getState().setField('goal', goal)
          setState((s) => ({ ...s, goal }))
          setStep(3)
        }}
        onBack={goBack}
      />
    )
  }

  // Step 3 — Current level
  if (step === 3) {
    return (
      <CurrentLevelSelect
        onContinue={(level) => {
          useOnboardingStore.getState().setField('currentLevel', level)
          setState((s) => ({ ...s, currentLevel: level }))
          setStep(4)
        }}
        onBack={goBack}
      />
    )
  }

  // Step 4 — Target score (depends on goal)
  if (step === 4) {
    return (
      <TargetScoreSelect
        goal={state.goal ?? 'general'}
        onContinue={(score) => {
          useOnboardingStore.getState().setField('targetScore', score)
          setState((s) => ({ ...s, targetScore: score }))
          setStep(5)
        }}
        onBack={goBack}
      />
    )
  }

  // Step 5 — Exam date
  if (step === 5) {
    return (
      <ExamDateSelect
        onContinue={(date) => {
          useOnboardingStore.getState().setField('examDate', date)
          setState((s) => ({ ...s, examDate: date }))
          setStep(6)
        }}
        onBack={goBack}
      />
    )
  }

  // Step 6 — Raccourci reveal
  if (step === 6) {
    return (
      <RaccourciReveal
        currentLevel={state.currentLevel ?? 'A2_B1'}
        targetScore={state.targetScore ?? ''}
        examDate={state.examDate ?? { type: 'quick', label: 'No exam scheduled' }}
        onContinue={() => router.push('/paywall')}
      />
    )
  }

  return null
}
