'use client'

// P-220 — data-driven onboarding controller. Fetches the question set from
// the backend, walks the user through 11 questions (with skip-condition
// handling and a synthetic q9 freetext follow-up when the user picks
// 'other'), then renders EcoleReveal as the closing screen.
//
// Answers persist into useOnboardingStore (localStorage) so a refresh mid-
// flow resumes at the right question. The actual POST to /onboarding/submit
// happens in app/signup/page.tsx after the user authenticates.

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/lib/onboarding'
import { api } from '@/lib/api'
import {
  type OnboardingQuestion,
  type OnboardingQuestionsResponse,
  shouldSkipQuestion,
  readOtherFreetextField,
} from '@/lib/onboarding-questions'
import type { UiLanguage } from '@/lib/types'
import { ONBOARDING_KEY } from '@/lib/storage-keys'

import SingleSelectQuestion from './questions/SingleSelectQuestion'
import MultiSelectQuestion from './questions/MultiSelectQuestion'
import DateInputQuestion from './questions/DateInputQuestion'
import OtherFreetextScreen from './questions/OtherFreetextScreen'
import EcoleReveal from './EcoleReveal'
import { DISPLAY_FONT, INK, INK_MUTED } from './OnboardingScreen'

const LOADER_BG = '#FFD8C2'

// Synthetic step IDs that aren't BE questions but are rendered as standalone
// screens between real questions. Today only the q9 freetext follow-up.
const Q9_OTHER_STEP_ID = 'q9_native_language_other'

// One position in the rendered flow. Either a real BE question or the
// synthetic q9-other follow-up screen. Reveal is handled separately as the
// terminal step.
type FlowStep =
  | { kind: 'question'; question: OnboardingQuestion }
  | { kind: 'q9_other' }

function detectBrowserLanguage(): UiLanguage {
  if (typeof navigator === 'undefined') return 'en'
  const lang = navigator.language?.toLowerCase() ?? 'en'
  return lang.startsWith('fr') ? 'fr' : 'en'
}

function LanguageToggle({
  language,
  onChange,
}: {
  language: UiLanguage
  onChange: (lang: UiLanguage) => void
}) {
  const langs: UiLanguage[] = ['en', 'fr']
  return (
    <div
      className="flex items-center gap-1"
      style={{
        height: 32,
        padding: 2,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {langs.map((l) => {
        const active = l === language
        return (
          <button
            key={l}
            onClick={() => onChange(l)}
            aria-pressed={active}
            className="transition-all duration-150"
            style={{
              height: 28,
              minWidth: 36,
              padding: '0 10px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
              backgroundColor: active ? INK : 'transparent',
              color: active ? '#FFFFFF' : INK_MUTED,
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {l}
          </button>
        )
      })}
    </div>
  )
}

export default function OnboardingFlow() {
  const router = useRouter()

  // Store reads — subscribed individually so unrelated changes don't re-render
  // the whole controller.
  const data = useOnboardingStore((s) => s.data)
  const currentStepIndex = useOnboardingStore((s) => s.currentStepIndex)
  const interfaceLanguage = useOnboardingStore((s) => s.interfaceLanguage)
  const setAnswer = useOnboardingStore((s) => s.setAnswer)
  const setStep = useOnboardingStore((s) => s.setStep)
  const setLanguage = useOnboardingStore((s) => s.setLanguage)

  const [questions, setQuestions] = useState<OnboardingQuestion[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Detect browser language on first ever mount (when no persisted state
  // exists yet). Subsequent visits respect the user's last toggle choice.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const persisted = window.localStorage.getItem(ONBOARDING_KEY)
    if (!persisted) {
      setLanguage(detectBrowserLanguage())
    }
  }, [setLanguage])

  // Fetch questions on mount.
  useEffect(() => {
    let cancelled = false
    api.onboarding
      .getQuestions()
      .then((res: OnboardingQuestionsResponse) => {
        if (cancelled) return
        const sorted = [...res.questions].sort((a, b) => a.order - b.order)
        setQuestions(sorted)
      })
      .catch((err) => {
        if (cancelled) return
        // eslint-disable-next-line no-console
        console.error('Failed to fetch onboarding questions', err)
        setError('Could not load onboarding questions. Check your connection.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Build the visible flow steps from the BE questions + answers + the
  // synthetic q9 freetext follow-up.
  const flowSteps = useMemo<FlowStep[]>(() => {
    if (!questions) return []
    const steps: FlowStep[] = []
    for (const q of questions) {
      if (shouldSkipQuestion(q, data)) continue
      steps.push({ kind: 'question', question: q })
      // Insert q9 freetext follow-up immediately after q9 when 'other' picked.
      if (readOtherFreetextField(q) && data[q.id] === 'other') {
        steps.push({ kind: 'q9_other' })
      }
    }
    return steps
  }, [questions, data])

  // Loading
  if (error) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center px-6"
        style={{ backgroundColor: LOADER_BG, fontFamily: DISPLAY_FONT, color: INK }}
      >
        <p style={{ fontWeight: 600, textAlign: 'center' }}>{error}</p>
      </div>
    )
  }
  if (!questions) {
    return <div style={{ minHeight: '100dvh', backgroundColor: LOADER_BG }} />
  }

  const totalSteps = flowSteps.length + 1 // +1 for EcoleReveal as a dot
  const safeIndex = Math.min(currentStepIndex, flowSteps.length)
  const onReveal = safeIndex >= flowSteps.length

  function goBack() {
    setStep(Math.max(0, safeIndex - 1))
  }

  function goForward() {
    setStep(safeIndex + 1)
  }

  // Closing reveal — pulled from store via the helpers EcoleReveal expects.
  if (onReveal) {
    return (
      <EcoleReveal
        data={data}
        language={interfaceLanguage}
        onContinue={() => router.push('/paywall')}
      />
    )
  }

  const step = flowSteps[safeIndex]
  const headerToggle = (
    <LanguageToggle language={interfaceLanguage} onChange={setLanguage} />
  )
  const onBack = safeIndex > 0 ? goBack : undefined

  if (step.kind === 'q9_other') {
    return (
      <OtherFreetextScreen
        language={interfaceLanguage}
        initialValue={
          typeof data[Q9_OTHER_STEP_ID] === 'string'
            ? (data[Q9_OTHER_STEP_ID] as string)
            : null
        }
        progressTotal={totalSteps}
        progressCurrent={safeIndex + 1}
        progressFilledUpTo={safeIndex + 1}
        onContinue={(value) => {
          setAnswer(Q9_OTHER_STEP_ID, value)
          goForward()
        }}
        onBack={onBack}
        headerRight={headerToggle}
      />
    )
  }

  const q = step.question
  const answer = data[q.id]
  const commonProps = {
    progressTotal: totalSteps,
    progressCurrent: safeIndex + 1,
    progressFilledUpTo: safeIndex + 1,
    language: interfaceLanguage,
    onBack,
    headerRight: headerToggle,
  }

  if (q.type === 'single_select') {
    return (
      <SingleSelectQuestion
        {...commonProps}
        question={q}
        initialValue={typeof answer === 'string' ? answer : null}
        onContinue={(value) => {
          setAnswer(q.id, value)
          // If this question has an 'other' freetext follow-up but the user
          // picked something other than 'other', clear any stale freetext so
          // the payload doesn't carry a contradictory value.
          if (
            readOtherFreetextField(q) &&
            value !== 'other' &&
            data[Q9_OTHER_STEP_ID] !== undefined
          ) {
            setAnswer(Q9_OTHER_STEP_ID, null)
          }
          goForward()
        }}
      />
    )
  }

  if (q.type === 'multi_select') {
    return (
      <MultiSelectQuestion
        {...commonProps}
        question={q}
        initialValue={Array.isArray(answer) ? answer : null}
        onContinue={(value) => {
          setAnswer(q.id, value)
          goForward()
        }}
      />
    )
  }

  if (q.type === 'date_input') {
    return (
      <DateInputQuestion
        {...commonProps}
        question={q}
        initialValue={typeof answer === 'string' ? answer : null}
        initialNoExam={answer === null && q.id in data}
        onContinue={(value) => {
          setAnswer(q.id, value)
          goForward()
        }}
      />
    )
  }

  // text_input or unknown type — renderable fallback so a BE schema addition
  // doesn't blank-screen the flow.
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-6"
      style={{ backgroundColor: LOADER_BG, fontFamily: DISPLAY_FONT, color: INK }}
    >
      <p style={{ fontWeight: 600, textAlign: 'center' }}>
        Unsupported question type: {q.type}
      </p>
    </div>
  )
}
