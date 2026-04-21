'use client'

import { useState } from 'react'
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
} from './OnboardingScreen'
import Image from 'next/image'

export type ExamDate = { type: 'quick'; label: string } | { type: 'date'; value: string }

interface ExamDateSelectProps {
  onContinue: (date: ExamDate) => void
  onBack: () => void
}

const QUICK_OPTIONS: { id: string; label: string }[] = [
  { id: 'lt1', label: 'Less than 1 month' },
  { id: '1to3', label: '1-3 months' },
  { id: '3to6', label: '3-6 months' },
  { id: 'gt6', label: 'More than 6 months / No exam scheduled' },
]

export default function ExamDateSelect({ onContinue, onBack }: ExamDateSelectProps) {
  const [selectedQuick, setSelectedQuick] = useState<string | null>(null)
  const [dateValue, setDateValue] = useState<string>('')
  const [dateInputFocused, setDateInputFocused] = useState(false)

  const isEnabled = !!selectedQuick || !!dateValue

  function handleQuickSelect(id: string) {
    setSelectedQuick(id)
    setDateValue('') // mutually exclusive
  }

  function handleDateChange(val: string) {
    setDateValue(val)
    setSelectedQuick(null) // mutually exclusive
  }

  function handleContinue() {
    if (selectedQuick) {
      const label = QUICK_OPTIONS.find((o) => o.id === selectedQuick)?.label ?? selectedQuick
      onContinue({ type: 'quick', label })
    } else if (dateValue) {
      onContinue({ type: 'date', value: dateValue })
    }
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center"
      style={{ backgroundColor: '#CFE4F5' }}
    >
      <div className="w-full max-w-[440px] flex flex-col flex-1 min-h-screen px-5">
        {/* Top row */}
        <div className="relative flex items-center pt-4" style={{ minHeight: 32 }}>
          <div className="absolute left-0">
            <BackButton onClick={onBack} />
          </div>
          <div className="flex-1">
            <ProgressDots total={6} filledUpTo={5} current={5} />
          </div>
        </div>

        {/* Illustration */}
        <div className="flex justify-center mt-10">
          <Image
            src="/illustration-date.jpg"
            alt="Calendar with highlighted date illustration"
            width={160}
            height={160}
            className="object-contain"
            style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.12))' }}
            priority
          />
        </div>

        {/* Headline */}
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
          When is your exam?
        </h1>

        {/* Descriptor */}
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
          We will pace Le Raccourci to get you there.
        </p>

        {/* Quick options */}
        <div className="flex flex-col gap-[14px] mt-10">
          {QUICK_OPTIONS.map((option) => {
            const isSelected = selectedQuick === option.id
            return (
              <OnboardingCard
                key={option.id}
                isSelected={isSelected}
                onClick={() => handleQuickSelect(option.id)}
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
                  {option.label}
                </span>
                <CheckIcon visible={isSelected} />
              </OnboardingCard>
            )
          })}
        </div>

        {/* Date picker */}
        <div className="flex flex-col gap-2 mt-6">
          <label
            htmlFor="exam-month"
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 600,
              fontSize: 13,
              color: INK_MUTED,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Or pick a date:
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            {/* Friendly placeholder overlay — hidden once a value is set or the input is focused */}
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
                Select month and year
              </span>
            )}
            <input
              id="exam-month"
              type="month"
              value={dateValue}
              onChange={(e) => handleDateChange(e.target.value)}
              onFocus={() => setDateInputFocused(true)}
              onBlur={() => setDateInputFocused(false)}
              style={{
                height: 52,
                borderRadius: 16,
                border: dateValue ? `2px solid ${INK}` : dateInputFocused ? `2px solid ${INK_MUTED}` : `1.5px solid ${INK_MUTED}`,
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

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <CTAButton label="Continue" enabled={isEnabled} onClick={handleContinue} />
      </div>
    </div>
  )
}
