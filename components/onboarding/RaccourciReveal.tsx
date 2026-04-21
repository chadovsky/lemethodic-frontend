'use client'

import Image from 'next/image'
import { ProgressDots, CTAButton, INK, INK_SOFT, INK_MUTED, PAPER, DISPLAY_FONT } from './OnboardingScreen'
import type { CurrentLevel } from './CurrentLevelSelect'
import type { TargetScore } from './TargetScoreSelect'
import type { ExamDate } from './ExamDateSelect'

interface RaccourciRevealProps {
  currentLevel: CurrentLevel
  targetScore: TargetScore
  examDate: ExamDate
  onContinue: () => void
}

const LEVEL_LABELS: Record<CurrentLevel, string> = {
  A1_A2: 'Basic everyday situations',
  A2_B1: 'Familiar topics',
  B1_B2: 'Most topics, with mistakes',
  B2_plus: 'Polishing fluency',
}

function formatExamDate(d: ExamDate): string {
  if (d.type === 'quick') return d.label
  // Format "YYYY-MM" → "Month YYYY"
  const [year, month] = d.value.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

const VALUE_LINES = [
  '16 focused lessons — not an infinite syllabus',
  'Ordered by what English speakers get wrong — not generic French grammar',
  'Anchored to your TCF — every lesson explains why it matters for the exam',
]

export default function RaccourciReveal({
  currentLevel,
  targetScore,
  examDate,
  onContinue,
}: RaccourciRevealProps) {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center"
      style={{ backgroundColor: '#F5D6D6' }}
    >
      <div className="w-full max-w-[440px] flex flex-col flex-1 min-h-screen px-5">
        {/* Progress dots — all 6 filled, no back */}
        <div className="pt-4">
          <ProgressDots total={6} filledUpTo={6} current={6} />
        </div>

        {/* Illustration */}
        <div className="flex justify-center mt-10">
          <Image
            src="/illustration-raccourci.png"
            alt="Golden key illustration"
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
            fontSize: 36,
            lineHeight: '44px',
            color: INK,
          }}
        >
          Meet Le Raccourci.
        </h1>

        {/* Subhead */}
        <p
          className="text-center mt-3 mx-auto text-pretty"
          style={{
            fontWeight: 600,
            fontSize: 18,
            lineHeight: '28px',
            color: INK_SOFT,
            maxWidth: 360,
          }}
        >
          The shortcut. 16 lessons. The exact grammar English speakers keep failing on. Finish it, and B2 is unblocked.
        </p>

        {/* Value lines */}
        <div
          className="flex flex-col gap-3 mt-8 mx-auto"
          style={{ maxWidth: 320, width: '100%' }}
        >
          {VALUE_LINES.map((line, i) => (
            <div key={i} className="flex items-start gap-3">
              {/* Check icon */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
                style={{ marginTop: 3, flexShrink: 0 }}
              >
                <circle cx="9" cy="9" r="9" fill={INK} />
                <path
                  d="M5 9.2L7.8 12L13 6.5"
                  stroke="white"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                style={{
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '22px',
                  color: INK,
                }}
              >
                {line}
              </span>
            </div>
          ))}
        </div>

        {/* Personalized summary card */}
        <div
          className="mt-8 mx-auto"
          style={{
            maxWidth: 360,
            width: '100%',
            backgroundColor: PAPER,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: 20,
            padding: '20px 24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          <p
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 14,
              color: INK_MUTED,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            Your plan
          </p>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Target', value: targetScore },
              {
                label: 'Exam',
                value: formatExamDate(examDate),
              },
              { label: 'Starting point', value: LEVEL_LABELS[currentLevel] },
              { label: 'Daily practice', value: '~15 minutes' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-baseline gap-1">
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: INK_SOFT,
                    lineHeight: '20px',
                    minWidth: 100,
                  }}
                >
                  {label}:
                </span>
                <span
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 700,
                    fontSize: 14,
                    color: INK,
                    lineHeight: '20px',
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <CTAButton label="Start my Raccourci" enabled onClick={onContinue} />
      </div>
    </div>
  )
}
