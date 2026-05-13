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
import { useAuthStore } from '@/lib/auth'
import { useVerifyAuth } from '@/hooks/useVerifyAuth'
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
import ExamPickerQuestion from './questions/ExamPickerQuestion'
import EcoleReveal from './EcoleReveal'
import {
  TARGET_LEVEL_HELPER_BY_EXAM,
  type ExamValue,
} from '../landing/copy'
import { DISPLAY_FONT, INK, INK_MUTED } from './OnboardingScreen'

// F-201 — loader bg migrated to editorial system. The previous peach
// (#FFD8C2) was the M-101a default; ed-bg unifies with the new system.
const LOADER_BG = 'var(--ed-bg)'

// V-012b — Editorial Luxury pastel rotation for the onboarding flow.
// Promova-style per-step warmth: each visible step gets its own warm
// pastel bg. Indexed by safeIndex; cycles via modulo for flows longer
// than 6 steps. The OnboardingScreen wrapper accepts a `bg` prop and
// inherits V-012a's --ease-spring transitions for soft step shifts.
const STEP_PASTELS = [
  'var(--ed-warm-peach)',      // step 0 — warm welcome
  'var(--ed-warm-sand)',       // step 1 — transition
  'var(--ed-warm-sage)',       // step 2 — calm, focus
  'var(--ed-warm-cream)',      // step 3 — breathing room
  'var(--ed-warm-peach-deep)', // step 4 — warm pre-reveal
  'var(--ed-warm-sage-deep)',  // step 5 — commitment moment
] as const

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

// F-201 — toggle restyled to match landing's editorial chrome.
// Active lang in ed-fg, inactive in ed-muted with hover to ed-fg.
// No pill backdrop (editorial restraint).
function LanguageToggle({
  language,
  onChange,
}: {
  language: UiLanguage
  onChange: (lang: UiLanguage) => void
}) {
  const langs: UiLanguage[] = ['en', 'fr']
  const ED_FG = 'var(--ed-fg)'
  const ED_MUTED = 'var(--ed-muted)'
  const ED_RULE = 'var(--ed-rule)'
  const SANS = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'
  return (
    <div className="flex items-center" style={{ gap: 4 }}>
      {langs.map((l, i) => {
        const active = l === language
        return (
          <span key={l} className="flex items-center" style={{ gap: 4 }}>
            <button
              onClick={() => onChange(l)}
              aria-pressed={active}
              style={{
                padding: '6px 8px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                outline: 'none',
                color: active ? ED_FG : ED_MUTED,
                fontFamily: SANS,
                fontWeight: active ? 600 : 500,
                fontSize: 13,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                transition: 'color var(--ed-duration-hover) var(--ease-spring)',
              }}
            >
              {l}
            </button>
            {i === 0 && (
              <span
                aria-hidden="true"
                style={{ color: ED_RULE, fontSize: 12, fontWeight: 400 }}
              >
                /
              </span>
            )}
          </span>
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

  // F-BUGS-001-FE-B B.2 — authed users with completed onboarding (i.e. BE
  // already holds their answers, signaled by user.targetLevel being set) skip
  // straight to /ecole rather than re-walking the questionnaire. Authed users
  // without completed onboarding still see the flow — they may have signed up
  // and bailed mid-stream, or BE state is stale.
  const token = useAuthStore((s) => s.token)
  const hydrated = useAuthStore((s) => s.hydrated)
  const verified = useAuthStore((s) => s.verified)
  const user = useAuthStore((s) => s.user)
  useEffect(() => {
    useAuthStore.getState().hydrate()
  }, [])
  useVerifyAuth()
  useEffect(() => {
    if (hydrated && token && verified && user?.targetLevel) {
      router.replace('/ecole')
    }
  }, [hydrated, token, verified, user, router])
  const awaitingAuthRedirect =
    !hydrated || (token != null && !verified) || Boolean(user?.targetLevel && token)

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

  // F-BUGS-001-FE-B B.2 — suppress the questionnaire while we're either
  // waiting for auth state or about to redirect a completed-onboarding user.
  // Render before the questions-fetch fallback so we don't flash question 1.
  if (awaitingAuthRedirect) {
    return <div style={{ minHeight: '100dvh', backgroundColor: LOADER_BG }} />
  }

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
        bg={STEP_PASTELS[safeIndex % STEP_PASTELS.length]}
      />
    )
  }

  const q = step.question
  const answer = data[q.id]
  // V-012b — Promova-style per-step pastel rotation. Each visible step
  // gets a warm pastel bg from the Editorial Luxury palette. Indexed by
  // safeIndex modulo PASTEL_ROTATION.length so the cycle handles flows
  // longer than 6 steps (skip-condition narrowing keeps most users at
  // ≤6 visible questions).
  const stepBg = STEP_PASTELS[safeIndex % STEP_PASTELS.length]
  const commonProps = {
    progressTotal: totalSteps,
    progressCurrent: safeIndex + 1,
    progressFilledUpTo: safeIndex + 1,
    language: interfaceLanguage,
    onBack,
    headerRight: headerToggle,
    bg: stepBg,
  }

  if (q.type === 'single_select') {
    // F-221 — q0_target_exam dispatches to the dedicated 5-card picker
    // (with format-DNA chips + inline another-exam waitlist branch).
    // Until BE adds q0_target_exam to /onboarding/questions response,
    // this branch is dormant; once BE ships, picker activates.
    if (q.id === 'q0_target_exam') {
      return (
        <ExamPickerQuestion
          {...commonProps}
          question={q}
          initialValue={typeof answer === 'string' ? answer : null}
          onContinue={(value) => {
            setAnswer(q.id, value)
            goForward()
          }}
        />
      )
    }
    // F-221 — per-exam helper text on q2_target_level. Reads prior
    // q0_target_exam answer; falls back to BE's default helper when
    // exam unknown or maps to null.
    let helperOverride: string | undefined
    if (q.id === 'q2_target_level') {
      const exam = data.q0_target_exam
      if (typeof exam === 'string') {
        const helper = TARGET_LEVEL_HELPER_BY_EXAM[exam as ExamValue]
        if (helper) helperOverride = helper[interfaceLanguage]
      }
    }
    return (
      <SingleSelectQuestion
        {...commonProps}
        question={q}
        initialValue={typeof answer === 'string' ? answer : null}
        helperOverride={helperOverride}
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
