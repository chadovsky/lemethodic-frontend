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
import { api, isEmailNotVerifiedError, mapStoreToSubmitPayload } from '@/lib/api'
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
import WaitlistOrProxyConfirmation from './WaitlistOrProxyConfirmation'
import {
  TARGET_LEVEL_HELPER_BY_EXAM,
  type ExamValue,
} from '../landing/copy'
import { DISPLAY_FONT, INK, INK_MUTED } from './OnboardingScreen'

// F-201 — loader bg migrated to editorial system. The previous peach
// (#FFD8C2) was the M-101a default; ed-bg unifies with the new system.
const LOADER_BG = 'var(--lm-bg-base)'

// V-012b — Editorial Luxury pastel rotation for the onboarding flow.
// Promova-style per-step warmth: each visible step gets its own warm
// pastel bg. Indexed by safeIndex; cycles via modulo for flows longer
// than 6 steps. The OnboardingScreen wrapper accepts a `bg` prop and
// inherits V-012a's --ease-spring transitions for soft step shifts.
const STEP_PASTELS = [
  'var(--lm-warm-peach)',      // step 0 — warm welcome
  'var(--lm-warm-sand)',       // step 1 — transition
  'var(--lm-warm-sage)',       // step 2 — calm, focus
  'var(--lm-warm-cream)',      // step 3 — breathing room
  'var(--lm-warm-peach-deep)', // step 4 — warm pre-reveal
  'var(--lm-warm-sage-deep)',  // step 5 — commitment moment
] as const

// Synthetic step IDs that aren't BE questions but are rendered as standalone
// screens between real questions. Today only the q9 freetext follow-up.
const Q9_OTHER_STEP_ID = 'q9_native_language_other'

// One position in the rendered flow. Either a real BE question, the
// synthetic q9-other follow-up, or the F-327 waitlist-confirmation screen
// (inserted after q11 for another_exam users).
type FlowStep =
  | { kind: 'question'; question: OnboardingQuestion }
  | { kind: 'q9_other' }
  | { kind: 'waitlist_confirmation' }

// F-327 — post-submit outcome for another_exam waitlist users.
// proxy_enrolled routes to /ecole; the other two show inline confirmation.
type WaitlistOutcome =
  | { kind: 'waitlist_declined' }
  | { kind: 'waitlist_no_fallback' }

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
  const ED_FG = 'var(--lm-text-primary)'
  const ED_MUTED = 'var(--lm-text-tertiary)'
  const ED_RULE = 'var(--lm-border-subtle)'
  const SANS = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'
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
                transition: 'color var(--lm-duration-hover) var(--lm-ease-spring)',
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
  const specificIntendedExam = useOnboardingStore((s) => s.specificIntendedExam)
  const setAnswer = useOnboardingStore((s) => s.setAnswer)
  const setStep = useOnboardingStore((s) => s.setStep)
  const setLanguage = useOnboardingStore((s) => s.setLanguage)
  const setAcceptFallback = useOnboardingStore((s) => s.setAcceptFallback)

  // F-327 — local state for the another_exam post-submit outcome.
  const [waitlistOutcome, setWaitlistOutcome] = useState<WaitlistOutcome | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      router.replace('/la-methode')
    }
  }, [hydrated, token, verified, user, router])
  const awaitingAuthRedirect =
    !hydrated || (token != null && !verified) || Boolean(user?.targetLevel && token)

  const [questions, setQuestions] = useState<OnboardingQuestion[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fetchKey, setFetchKey] = useState(0)

  // Detect browser language on first ever mount (when no persisted state
  // exists yet). Subsequent visits respect the user's last toggle choice.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const persisted = window.localStorage.getItem(ONBOARDING_KEY)
    if (!persisted) {
      setLanguage(detectBrowserLanguage())
    }
  }, [setLanguage])

  // Fetch questions on mount, and on retry (fetchKey bump).
  useEffect(() => {
    let cancelled = false
    setError(null)
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
  }, [fetchKey])

  // Build the visible flow steps from the BE questions + answers + the
  // synthetic q9 freetext follow-up + F-327 waitlist confirmation.
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
    // F-327 — for another_exam users, append a confirmation screen after q11.
    // This replaces EcoleReveal as the terminal step; users submit from here.
    if (data['q0_target_exam'] === 'another_exam') {
      steps.push({ kind: 'waitlist_confirmation' })
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
        className="min-h-screen w-full flex flex-col items-center justify-center gap-5 px-6"
        style={{ backgroundColor: LOADER_BG, fontFamily: DISPLAY_FONT, color: INK }}
      >
        <p style={{ fontWeight: 600, textAlign: 'center', maxWidth: 400 }}>{error}</p>
        <button
          onClick={retryFetch}
          style={{
            height: 48,
            padding: '0 28px',
            backgroundColor: 'var(--cta-primary)',
            color: '#FFFFFF',
            borderRadius: 4,
            fontFamily: DISPLAY_FONT,
            fontWeight: 600,
            fontSize: 15,
            border: 'none',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          Try again
        </button>
      </div>
    )
  }
  if (!questions) {
    return <div style={{ minHeight: '100dvh', backgroundColor: LOADER_BG }} />
  }

  const isAnotherExam = data['q0_target_exam'] === 'another_exam'
  // another_exam users submit from WaitlistOrProxyConfirmation (no EcoleReveal dot).
  const totalSteps = isAnotherExam ? flowSteps.length : flowSteps.length + 1
  const safeIndex = Math.min(currentStepIndex, flowSteps.length)
  const onReveal = safeIndex >= flowSteps.length

  function retryFetch() {
    setFetchKey((k) => k + 1)
  }

  function goBack() {
    setStep(Math.max(0, safeIndex - 1))
  }

  function goForward() {
    setStep(safeIndex + 1)
  }

  // F-BUGS-001-FE-B B.3 — reveal CTA routes by auth state instead of
  // hardcoding /paywall. Unauth → /paywall (conversion funnel). Auth → POST
  // /onboarding/submit with the answers we just collected (mirrors the
  // signup-page flush logic), reset the local store, route to /ecole/intro
  // (F-202 first-visit destination). Email-not-verified surfaces lift the
  // /verify-email redirect just like the signup flow.
  async function handleRevealContinue() {
    const auth = useAuthStore.getState()
    if (!auth.token) {
      router.push('/paywall')
      return
    }
    try {
      await api.onboarding.submit({
        ...mapStoreToSubmitPayload(data, interfaceLanguage),
        q0_specific_intended_exam: specificIntendedExam,
        q0_accept_fallback: false,
      })
      const enrichedUser = await api.users.getMe()
      auth.setAuth(auth.token, enrichedUser)
      useOnboardingStore.getState().reset()
      router.push('/la-methode/intro')
    } catch (flushErr) {
      if (isEmailNotVerifiedError(flushErr)) {
        router.push('/verify-email')
        return
      }
      // eslint-disable-next-line no-console
      console.error('Onboarding flush from reveal failed — routing to /la-methode anyway', flushErr)
      router.push('/la-methode')
    }
  }

  // F-327 — fires from WaitlistOrProxyConfirmation CTAs.
  // accept=true → "Start with La Méthode" primary CTA
  // accept=false → "Just add me to the waitlist" secondary CTA
  // Case A (path_slug=b1_to_b2 + waitlist) → /ecole (proxy-enrolled)
  // Case B (waitlist + !accept)             → inline confirmation
  // Case C (waitlist + accept + no path)    → inline confirmation
  async function handleWaitlistSubmit(accept: boolean) {
    const auth = useAuthStore.getState()
    if (!auth.token) {
      router.push('/paywall')
      return
    }
    setIsSubmitting(true)
    setAcceptFallback(accept)
    try {
      const response = await api.onboarding.submit({
        ...mapStoreToSubmitPayload(data, interfaceLanguage),
        q0_specific_intended_exam: specificIntendedExam,
        q0_accept_fallback: accept,
      })
      const enrichedUser = await api.users.getMe()
      auth.setAuth(auth.token, enrichedUser)
      useOnboardingStore.getState().reset()
      if (response.path_slug === 'b1_to_b2' && response.waitlist) {
        router.push('/la-methode')
        return
      }
      setWaitlistOutcome(
        accept ? { kind: 'waitlist_no_fallback' } : { kind: 'waitlist_declined' }
      )
    } catch (submitErr) {
      if (isEmailNotVerifiedError(submitErr)) {
        router.push('/verify-email')
        return
      }
      // eslint-disable-next-line no-console
      console.error('Waitlist submit failed', submitErr)
    } finally {
      setIsSubmitting(false)
    }
  }

  // F-327 — Cases B & C: another_exam user submitted but wasn't proxy-enrolled.
  // Local state survives the store reset so this renders after reset() runs.
  if (waitlistOutcome !== null) {
    const SANS = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'
    const SERIF = 'var(--font-source-serif), Georgia, "Times New Roman", serif'
    const isDeclined = waitlistOutcome.kind === 'waitlist_declined'
    const copy = interfaceLanguage === 'fr'
      ? {
          heading: "Vous êtes sur la liste d'attente.",
          body: isDeclined
            ? "Nous vous contacterons dès que votre examen sera disponible."
            : "Nous vous contacterons dès que votre examen sera disponible. La Méthode nécessite un niveau B1+ pour commencer.",
          done: "Terminer",
        }
      : {
          heading: "You're on the waitlist.",
          body: isDeclined
            ? "We'll reach out when your exam is ready."
            : "We'll reach out when your exam is ready. La Méthode requires B1+ level to begin.",
          done: "Done",
        }
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center ed-page-enter"
        style={{ backgroundColor: 'var(--lm-warm-peach-deep)' }}
      >
        <div
          className="w-full flex flex-col flex-1 min-h-screen"
          style={{ maxWidth: 720, padding: '0 clamp(24px, 4vw, 48px)' }}
        >
          <div style={{ height: 'clamp(56px, 9vw, 96px)' }} />
          <h1
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontStyle: 'italic',
              fontSize: 'clamp(2rem, 4.5vw, 3rem)',
              lineHeight: 1.15,
              letterSpacing: '-0.015em',
              color: 'var(--lm-text-primary)',
              margin: 0,
              marginBottom: 'clamp(16px, 2vw, 24px)',
            }}
          >
            {copy.heading}
          </h1>
          <p
            style={{
              fontFamily: SANS,
              fontWeight: 400,
              fontSize: 'clamp(15px, 1.6vw, 17px)',
              lineHeight: 1.6,
              color: 'var(--lm-text-tertiary)',
              margin: 0,
            }}
          >
            {copy.body}
          </p>
          <div className="flex-1" />
          <div style={{ paddingBottom: 'calc(32px + var(--lm-safe-bottom, 0px))' }}>
            <button
              type="button"
              onClick={() => router.push('/')}
              style={{
                height: 56,
                width: '100%',
                backgroundColor: 'var(--cta-primary)',
                color: '#FFFFFF',
                borderRadius: 4,
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 16,
                border: 'none',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {copy.done}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Closing reveal — pulled from store via the helpers EcoleReveal expects.
  if (onReveal) {
    return (
      <EcoleReveal
        data={data}
        language={interfaceLanguage}
        onContinue={handleRevealContinue}
      />
    )
  }

  const step = flowSteps[safeIndex]
  const headerToggle = safeIndex === 0
    ? <LanguageToggle language={interfaceLanguage} onChange={setLanguage} />
    : undefined
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

  // F-327 — terminal step for another_exam users; replaces EcoleReveal.
  if (step.kind === 'waitlist_confirmation') {
    return (
      <WaitlistOrProxyConfirmation
        specificIntendedExam={specificIntendedExam}
        language={interfaceLanguage}
        isSubmitting={isSubmitting}
        bg={STEP_PASTELS[safeIndex % STEP_PASTELS.length]}
        onAccept={() => handleWaitlistSubmit(true)}
        onDecline={() => handleWaitlistSubmit(false)}
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
