'use client'

// F-221 — exam-target picker (q0_target_exam). Five large card buttons
// each carrying a name + format-DNA chip. Picking "Another exam" reveals
// an inline mini-form (which exam? + email) that submits to localStorage
// waitlist (lib/landing/waitlist.ts via submitWaitlist with intent
// 'exam_other'); on success, the picker shows a confirmation and the
// questionnaire's Continue is disabled (the user is parked on the
// confirmation, doesn't proceed). All other options dispatch normally
// via onContinue + setAnswer (handled by the parent OnboardingFlow).

import { useState } from 'react'
import { OnboardingScreen, OnboardingCard, CheckIcon } from '../OnboardingScreen'
import {
  EXAM_OPTIONS,
  EXAM_OTHER_FORM,
  type ExamValue,
  type Lang,
} from '../../landing/copy'
import {
  submitWaitlist,
  isValidEmail,
} from '../../landing/waitlist'
import type { OnboardingQuestion } from '@/lib/onboarding-questions'
import type { UiLanguage } from '@/lib/types'

const SANS = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'
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
}

type AnotherExamState =
  | { kind: 'idle' }
  | { kind: 'form'; examName: string; email: string; error: string | null }
  | { kind: 'success' }

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
}: ExamPickerQuestionProps) {
  const [selected, setSelected] = useState<ExamValue | null>(
    (initialValue as ExamValue | null) ?? null,
  )
  const [another, setAnother] = useState<AnotherExamState>({ kind: 'idle' })

  const formCopy = EXAM_OTHER_FORM[language as Lang]

  function handleSelect(value: ExamValue) {
    setSelected(value)
    if (value === 'another_exam') {
      setAnother({ kind: 'form', examName: '', email: '', error: null })
    } else {
      setAnother({ kind: 'idle' })
    }
  }

  function handleContinue() {
    if (selected === null) return
    if (selected === 'another_exam') return  // gated by inline form below
    onContinue(selected)
  }

  function handleAnotherExamSubmit() {
    if (another.kind !== 'form') return
    const examNameTrimmed = another.examName.trim()
    if (!examNameTrimmed) {
      setAnother({ ...another, error: formCopy.invalidExam })
      return
    }
    if (!isValidEmail(another.email)) {
      setAnother({ ...another, error: formCopy.invalidEmail })
      return
    }
    const result = submitWaitlist({
      email: another.email,
      intent: 'exam_other',
      examName: examNameTrimmed,
    })
    if (!result.ok) {
      setAnother({
        ...another,
        error:
          result.reason === 'invalid_email'
            ? formCopy.invalidEmail
            : formCopy.invalidExam, // storage error fallback
      })
      return
    }
    setAnother({ kind: 'success' })
  }

  function handleBackToPicker() {
    setSelected(null)
    setAnother({ kind: 'idle' })
  }

  // Continue is disabled when:
  //   - nothing selected
  //   - "another_exam" selected (gated by the inline mini-form / success)
  const continueEnabled =
    selected !== null && selected !== 'another_exam'

  return (
    <OnboardingScreen
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

      {/* Inline another-exam form / success — appears when 'another_exam'
          is the current selection. Replaces standard Continue with form
          submission + parked confirmation. */}
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

          <div className="flex flex-col gap-2">
            <label
              htmlFor="exam-other-email"
              style={{
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 12,
                color: ED_MUTED,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {formCopy.emailLabel}
            </label>
            <input
              id="exam-other-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={another.email}
              onChange={(e) =>
                setAnother({ ...another, email: e.target.value, error: null })
              }
              placeholder={formCopy.emailPlaceholder}
              style={{
                height: 48,
                width: '100%',
                borderRadius: 4,
                border: `1px solid ${another.email ? ED_FG : ED_RULE}`,
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

          <button
            type="button"
            onClick={handleAnotherExamSubmit}
            style={{
              height: 48,
              width: '100%',
              borderRadius: 4,
              backgroundColor: 'var(--ed-accent)',
              color: '#FFFFFF',
              border: 'none',
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {formCopy.submit}
          </button>
        </div>
      )}

      {another.kind === 'success' && (
        <div
          style={{
            backgroundColor: ED_PAPER,
            border: `1px solid ${ED_RULE}`,
            borderRadius: 4,
            padding: 'clamp(20px, 2.5vw, 28px)',
            marginTop: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <h3
            style={{
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 17,
              color: ED_FG,
              margin: 0,
            }}
          >
            {formCopy.successHeading}
          </h3>
          <p
            style={{
              fontFamily: SANS,
              fontWeight: 400,
              fontSize: 14,
              lineHeight: 1.55,
              color: ED_MUTED,
              margin: 0,
            }}
          >
            {formCopy.successBody}
          </p>
          <button
            type="button"
            onClick={handleBackToPicker}
            style={{
              alignSelf: 'flex-start',
              padding: '6px 12px',
              borderRadius: 4,
              backgroundColor: 'transparent',
              color: ED_FG,
              border: `1px solid ${ED_RULE}`,
              fontFamily: SANS,
              fontWeight: 500,
              fontSize: 13,
              cursor: 'pointer',
              outline: 'none',
              marginTop: 4,
            }}
          >
            {formCopy.backToPicker}
          </button>
        </div>
      )}
    </OnboardingScreen>
  )
}
