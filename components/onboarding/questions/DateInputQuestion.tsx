'use client'

// P-220 — date_input question (q3 only). Two-mode: pick a date OR toggle the
// "no exam scheduled" card. Mutually exclusive.
//
// Emits:
//   "YYYY-MM-DD" string  — when a date is picked
//   null                 — when the no-exam toggle is active
//
// HTML5 min/max enforce min_offset_days .. max_offset_days from today.

import { useMemo, useState } from 'react'
import {
  OnboardingCard,
  CheckIcon,
  CTAButton,
  BackButton,
  ProgressDots,
  INK,
  INK_SOFT,
  INK_MUTED,
  PAPER,
  DISPLAY_FONT,
} from '../OnboardingScreen'
import Image from 'next/image'
import type { OnboardingQuestion } from '@/lib/onboarding-questions'
import { readDateInputMeta } from '@/lib/onboarding-questions'
import type { UiLanguage } from '@/lib/types'
import { getQuestionMeta } from '../questionMeta'

interface DateInputQuestionProps {
  question: OnboardingQuestion
  language: UiLanguage
  initialValue: string | null
  // Whether the previous answer was the no-exam toggle (true) vs. unanswered
  // (undefined). Distinguishes "user already chose no exam" from cold state.
  initialNoExam: boolean
  progressTotal: number
  progressCurrent: number
  progressFilledUpTo: number
  onContinue: (value: string | null) => void
  onBack?: () => void
  headerRight?: React.ReactNode
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
}: DateInputQuestionProps) {
  const meta = getQuestionMeta(question.id)
  const dateMeta = readDateInputMeta(question)
  const minDate = useMemo(() => offsetDateISO(dateMeta.minOffsetDays), [dateMeta.minOffsetDays])
  const maxDate = useMemo(() => offsetDateISO(dateMeta.maxOffsetDays), [dateMeta.maxOffsetDays])

  const [dateValue, setDateValue] = useState<string>(initialValue ?? '')
  const [noExam, setNoExam] = useState<boolean>(initialNoExam)
  const [dateInputFocused, setDateInputFocused] = useState(false)

  const isEnabled = noExam || dateValue !== ''

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
    <div
      className="min-h-screen w-full flex flex-col items-center"
      style={{ backgroundColor: meta.bg }}
    >
      <div className="w-full max-w-[440px] flex flex-col flex-1 min-h-screen px-5">
        {/* Top row */}
        <div className="relative flex items-center pt-4" style={{ minHeight: 32 }}>
          {onBack && (
            <div className="absolute left-0">
              <BackButton onClick={onBack} />
            </div>
          )}
          <div className="flex-1">
            <ProgressDots total={progressTotal} filledUpTo={progressFilledUpTo} current={progressCurrent} />
          </div>
          {headerRight && (
            <div className="absolute right-0">{headerRight}</div>
          )}
        </div>

        <div className="flex justify-center mt-10">
          <Image
            src={meta.illustration}
            alt={meta.illustrationAlt}
            width={240}
            height={240}
            className="object-contain"
            style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.15))' }}
            priority
          />
        </div>

        <h1
          className="text-center mt-8 leading-tight text-balance"
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 800,
            fontSize: 32,
            lineHeight: '40px',
            color: INK,
          }}
        >
          {question.heading[language]}
        </h1>

        <p
          className="text-center mt-3 mx-auto text-pretty"
          style={{
            fontWeight: 500,
            fontSize: 15,
            lineHeight: '24px',
            color: INK_SOFT,
            maxWidth: 320,
          }}
        >
          {question.helper[language]}
        </p>

        {/* Date picker */}
        <div className="flex flex-col gap-2 mt-10">
          <label
            htmlFor="exam-date"
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 600,
              fontSize: 13,
              color: INK_MUTED,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {language === 'fr' ? 'Choisissez une date :' : 'Pick a date:'}
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            {!dateValue && !dateInputFocused && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 20,
                  transform: 'translateY(-50%)',
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 600,
                  fontSize: 15,
                  color: INK_MUTED,
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
                height: 52,
                borderRadius: 16,
                border: dateValue
                  ? `2px solid ${INK}`
                  : dateInputFocused
                  ? `2px solid ${INK_MUTED}`
                  : `1.5px solid ${INK_MUTED}`,
                backgroundColor: PAPER,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                padding: '0 20px',
                fontFamily: DISPLAY_FONT,
                fontWeight: 600,
                fontSize: 15,
                color: dateValue ? INK : 'transparent',
                outline: 'none',
                width: '100%',
                cursor: 'pointer',
                position: 'relative',
              }}
            />
          </div>
        </div>

        {/* No-exam toggle */}
        <div className="flex flex-col gap-[14px] mt-4">
          <OnboardingCard
            isSelected={noExam}
            onClick={handleNoExamToggle}
            minHeight={64}
          >
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
              {dateMeta.noExamToggleLabel[language]}
            </span>
            <CheckIcon visible={noExam} />
          </OnboardingCard>
        </div>

        <div className="flex-1" />

        <CTAButton
          label={language === 'fr' ? 'Continuer' : 'Continue'}
          enabled={isEnabled}
          onClick={handleContinue}
        />
      </div>
    </div>
  )
}
