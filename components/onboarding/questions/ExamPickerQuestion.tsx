'use client'

// F-221 — exam-target picker (q0_target_exam). Five large card buttons
// each carrying a name + format-DNA chip. Picking "Another exam" reveals
// an inline mini-form (which exam?) that captures the free-text exam name.
//
// F-327 rework: removed localStorage waitlist submission (submitWaitlist)
// and email field — user is authenticated at this point. The inline form
// now ONLY captures examName; Continue writes it to the onboarding store
// (specificIntendedExam) and propagates normally via onContinue. The
// WaitlistOrProxyConfirmation screen (inserted by OnboardingFlow after q11)
// handles the accept_fallback decision before submit.

import { useState } from 'react'
import { OnboardingScreen, OnboardingCard, CheckIcon } from '../OnboardingScreen'
import {
  EXAM_OPTIONS,
  EXAM_OTHER_FORM,
  type ExamValue,
  type Lang,
} from '../../landing/copy'
import { useOnboardingStore } from '@/lib/onboarding'
import type { OnboardingQuestion } from '@/lib/onboarding-questions'
import type { UiLanguage } from '@/lib/types'

const SANS = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'
const ED_FG = 'var(--ed-fg)'
const ED_MUTED = 'var(--ed-muted)'
const ED_RULE = 'var(--ed-rule)'
const ED_PAPER = 'var(--ed-paper)'

interface ExamPickerQuestionProps {
  question: OnboardingQuestion
  language: UiLanguage
  initialValue: string | null
  progressTotal: number
  progressCurrent: number
  progressFilledUpTo: number
  onContinue: (value: string) => void
  onBack?: () => void
  headerRight?: React.ReactNode
  bg?: string
}

type AnotherExamState =
  | { kind: 'idle' }
  | { kind: 'form'; examName: string; error: string | null }

export default function ExamPickerQuestion({
  question,
  language,
  initialValue,
  progressTotal,
  progressCurrent,
  progressFilledUpTo,
  onContinue,
  onBack,
  headerRight,
  bg,
}: ExamPickerQuestionProps) {
  const setSpecificIntendedExam = useOnboardingStore((s) => s.setSpecificIntendedExam)

  const [selected, setSelected] = useState<ExamValue | null>(
    (initialValue as ExamValue | null) ?? null,
  )
  const [another, setAnother] = useState<AnotherExamState>({ kind: 'idle' })

  const formCopy = EXAM_OTHER_FORM[language as Lang]

  function handleSelect(value: ExamValue) {
    setSelected(value)
    if (value === 'another_exam') {
      setAnother({ kind: 'form', examName: '', error: null })
    } else {
      setAnother({ kind: 'idle' })
    }
  }

  // Continue is enabled when something is selected AND, for another_exam,
  // the free-text exam name is non-empty.
  const continueEnabled =
    selected !== null &&
    (selected !== 'another_exam' ||
      (another.kind === 'form' && another.examName.trim().length > 0))

  function handleContinue() {
    if (selected === null) return
    if (selected === 'another_exam') {
      if (another.kind !== 'form') return
      const examName = another.examName.trim()
      if (!examName) {
        setAnother({ ...another, error: formCopy.invalidExam })
        return
      }
      // Persist exam name to store; OnboardingFlow will include it in the
      // submit payload as q0_specific_intended_exam.
      setSpecificIntendedExam(examName)
      onContinue(selected)
      return
    }
    onContinue(selected)
  }

  return (
    <OnboardingScreen
      bg={bg}
      progressTotal={progressTotal}
      progressFilledUpTo={progressFilledUpTo}
      progressCurrent={progressCurrent}
      headline={question.heading[language]}
      descriptor={question.helper[language]}
      ctaEnabled={continueEnabled}
      onContinue={handleContinue}
      onBack={onBack}
      headerRight={headerRight}
    >
      {EXAM_OPTIONS.map((option) => {
        const isSelected = selected === option.value
        return (
          <OnboardingCard
            key={option.value}
            isSelected={isSelected}
            onClick={() => handleSelect(option.value)}
            minHeight={88}
          >
            <div className="flex flex-col" style={{ flex: 1, gap: 6, paddingRight: 12 }}>
              <span
                style={{
                  fontFamily: SANS,
                  fontWeight: 600,
                  fontSize: 17,
                  lineHeight: 1.3,
                  color: 'inherit',
                }}
              >
                {option.label}
              </span>
              <span
                style={{
                  fontFamily: SANS,
                  fontWeight: 500,
                  fontSize: 12,
                  lineHeight: 1.4,
                  color: isSelected ? ED_PAPER : ED_MUTED,
                  opacity: isSelected ? 0.85 : 1,
                }}
              >
                {option.formatDna[language]}
              </span>
            </div>
            <CheckIcon visible={isSelected} />
          </OnboardingCard>
        )
      })}

      {/* Inline exam-name capture — appears when 'another_exam' is selected.
          Email field and localStorage submit removed (F-327): the Continue
          button (OnboardingScreen CTA) handles propagation via the store. */}
      {another.kind === 'form' && (
        <div
          style={{
            backgroundColor: ED_PAPER,
            border: `1px solid ${ED_RULE}`,
            borderRadius: 4,
            padding: 'clamp(20px, 2.5vw, 28px)',
            marginTop: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 17,
                lineHeight: 1.3,
                color: ED_FG,
                margin: 0,
                marginBottom: 6,
              }}
            >
              {formCopy.heading}
            </h3>
            <p
              style={{
                fontFamily: SANS,
                fontWeight: 400,
                fontSize: 14,
                lineHeight: 1.5,
                color: ED_MUTED,
                margin: 0,
              }}
            >
              {formCopy.description}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="exam-other-name"
              style={{
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 12,
                color: ED_MUTED,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {formCopy.examLabel}
            </label>
            <input
              id="exam-other-name"
              type="text"
              value={another.examName}
              onChange={(e) =>
                setAnother({ ...another, examName: e.target.value, error: null })
              }
              placeholder={formCopy.examPlaceholder}
              autoFocus
              style={{
                height: 48,
                width: '100%',
                borderRadius: 4,
                border: `1px solid ${another.examName ? ED_FG : ED_RULE}`,
                backgroundColor: ED_PAPER,
                padding: '0 16px',
                fontFamily: SANS,
                fontWeight: 400,
                fontSize: 15,
                color: ED_FG,
                outline: 'none',
              }}
            />
          </div>

          {another.error && (
            <p
              role="alert"
              style={{
                fontFamily: SANS,
                fontWeight: 500,
                fontSize: 13,
                color: 'var(--fp-error)',
                margin: 0,
              }}
            >
              {another.error}
            </p>
          )}
        </div>
      )}
    </OnboardingScreen>
  )
}
