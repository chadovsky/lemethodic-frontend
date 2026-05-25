'use client'

// F-201 — date input (q3 only). Refactored to use the OnboardingScreen
// kernel; inputs go in the cards slot. Illustration dropped, ed-* tokens
// throughout, 4px border radii, 1px ed-rule borders. The no-exam toggle
// remains an OnboardingCard so it visually mirrors single/multi-select
// option cards.

import { useMemo, useState } from 'react'
import { OnboardingScreen, OnboardingCard, CheckIcon } from '../OnboardingScreen'
import type { OnboardingQuestion } from '@/lib/onboarding-questions'
import { readDateInputMeta } from '@/lib/onboarding-questions'
import type { UiLanguage } from '@/lib/types'

const SANS = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'
const ED_FG = 'var(--ed-fg)'
const ED_MUTED = 'var(--ed-muted)'
const ED_RULE = 'var(--ed-rule)'
const ED_PAPER = 'var(--ed-paper)'

interface DateInputQuestionProps {
  question: OnboardingQuestion
  language: UiLanguage
  initialValue: string | null
  initialNoExam: boolean
  progressTotal: number
  progressCurrent: number
  progressFilledUpTo: number
  onContinue: (value: string | null) => void
  onBack?: () => void
  headerRight?: React.ReactNode
  bg?: string
}

function offsetDateISO(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function DateInputQuestion({
  question,
  language,
  initialValue,
  initialNoExam,
  progressTotal,
  progressCurrent,
  progressFilledUpTo,
  onContinue,
  onBack,
  headerRight,
  bg,
}: DateInputQuestionProps) {
  const dateMeta = readDateInputMeta(question)
  const minDate = useMemo(() => offsetDateISO(dateMeta.minOffsetDays), [dateMeta.minOffsetDays])
  const maxDate = useMemo(() => offsetDateISO(dateMeta.maxOffsetDays), [dateMeta.maxOffsetDays])

  const [dateValue, setDateValue] = useState<string>(initialValue ?? '')
  const [noExam, setNoExam] = useState<boolean>(initialNoExam)
  const [dateInputFocused, setDateInputFocused] = useState(false)

  const isEnabled = noExam || dateValue !== ''

  // Inline reassurance for short-timeline users. Recomputes on every date
  // change; maxes at 0 (minDate constraint already blocks past dates).
  const weeksUntilExam = useMemo(() => {
    if (!dateValue) return null
    const examDate = new Date(dateValue)
    if (isNaN(examDate.getTime())) return null
    const msPerWeek = 1000 * 60 * 60 * 24 * 7
    return Math.max(0, Math.ceil((examDate.getTime() - Date.now()) / msPerWeek))
  }, [dateValue])
  const showUrgencyHint = weeksUntilExam !== null && weeksUntilExam <= 8

  function handleDateChange(val: string) {
    setDateValue(val)
    if (val !== '') setNoExam(false)
  }
  function handleNoExamToggle() {
    setNoExam((prev) => {
      const next = !prev
      if (next) setDateValue('')
      return next
    })
  }
  function handleContinue() {
    if (noExam) onContinue(null)
    else if (dateValue) onContinue(dateValue)
  }

  return (
    <OnboardingScreen
      bg={bg}
      progressTotal={progressTotal}
      progressFilledUpTo={progressFilledUpTo}
      progressCurrent={progressCurrent}
      headline={question.heading[language]}
      descriptor={question.helper[language]}
      ctaEnabled={isEnabled}
      onContinue={handleContinue}
      onBack={onBack}
      headerRight={headerRight}
      ctaLabel={language === 'fr' ? 'Continuer' : 'Continue'}
    >
      {/* Date picker */}
      <div className="flex flex-col gap-2" style={{ marginBottom: 4 }}>
        <label
          htmlFor="exam-date"
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 12,
            color: ED_MUTED,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {language === 'fr' ? 'Choisissez une date' : 'Pick a date'}
        </label>
        <div style={{ position: 'relative', width: '100%' }}>
          {!dateValue && !dateInputFocused && (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '50%',
                left: 22,
                transform: 'translateY(-50%)',
                fontFamily: SANS,
                fontWeight: 400,
                fontSize: 15,
                color: ED_MUTED,
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              {language === 'fr' ? 'Sélectionnez une date' : 'Select a date'}
            </span>
          )}
          <input
            id="exam-date"
            type="date"
            value={dateValue}
            min={minDate}
            max={maxDate}
            onChange={(e) => handleDateChange(e.target.value)}
            onFocus={() => setDateInputFocused(true)}
            onBlur={() => setDateInputFocused(false)}
            style={{
              height: 56,
              borderRadius: 4,
              border: `1px solid ${dateValue || dateInputFocused ? ED_FG : ED_RULE}`,
              backgroundColor: ED_PAPER,
              padding: '0 22px',
              fontFamily: SANS,
              fontWeight: 500,
              fontSize: 15,
              color: dateValue ? ED_FG : 'transparent',
              outline: 'none',
              width: '100%',
              cursor: 'pointer',
              transition: 'border-color var(--ed-duration-hover) var(--ease-spring)',
            }}
          />
        </div>
      </div>

      {/* Urgency reassurance — appears when exam is ≤8 weeks away */}
      {showUrgencyHint && (
        <p
          aria-live="polite"
          style={{
            fontFamily: SANS,
            fontWeight: 400,
            fontSize: 13,
            color: ED_MUTED,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {weeksUntilExam === 0
            ? (language === 'fr'
                ? "Votre examen est cette semaine — nous allons construire votre plan le plus ciblé."
                : "Your exam is this week — we'll build your most focused plan.")
            : (language === 'fr'
                ? `${weeksUntilExam} semaine${weeksUntilExam !== 1 ? 's' : ''} jusqu'à votre examen — nous allons construire votre plan autour de ce calendrier.`
                : `${weeksUntilExam} week${weeksUntilExam !== 1 ? 's' : ''} to your exam — we'll build your plan around this window.`)}
        </p>
      )}

      {/* No-exam toggle as a card */}
      <OnboardingCard
        isSelected={noExam}
        onClick={handleNoExamToggle}
        minHeight={56}
      >
        <span
          style={{
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: 15,
            lineHeight: 1.5,
            flex: 1,
            paddingRight: 12,
          }}
        >
          {dateMeta.noExamToggleLabel[language]}
        </span>
        <CheckIcon visible={noExam} />
      </OnboardingCard>
    </OnboardingScreen>
  )
}
