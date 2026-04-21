'use client'

import { useState } from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { DISPLAY_FONT, INK, INK_SOFT, INK_MUTED, PAPER } from './onboarding/OnboardingScreen'

// ── Constants ─────────────────────────────────────────────────────────────────

const RADAR_DATA = [
  { axis: 'Content', user: 3, target: 4 },
  { axis: 'Structure', user: 2, target: 4 },
  { axis: 'Grammar', user: 2, target: 4 },
  { axis: 'English Habits', user: 2, target: 4 },
]

const VALUE_ROWS: string[] = [
  'Le Raccourci — 16 lessons unlocking B2 grammar',
  'Unlimited Tâche 1, 2, 3 practice with AI examiner',
  'Mock Exam mode (recommended after Le Raccourci)',
]

const TRIAL_TIMELINE = [
  { day: 'Today', label: 'Unlock everything' },
  { day: 'Day 5', label: 'We remind you before charging' },
  { day: 'Day 7', label: 'Your trial ends, billing starts' },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: DISPLAY_FONT,
        fontWeight: 700,
        fontSize: 13,
        color: INK_MUTED,
        letterSpacing: '0.05em',
        textTransform: 'uppercase' as const,
        marginBottom: 12,
      }}
    >
      {children}
    </p>
  )
}

function ValueRow({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
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
          fontSize: 15,
          lineHeight: '23px',
          color: INK,
        }}
      >
        {text}
      </span>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function Paywall() {
  const [billing, setBilling] = useState<'annual' | 'monthly'>('annual')
  const [trialOn, setTrialOn] = useState(true)

  const isAnnual = billing === 'annual'
  const pricePerDay = isAnnual ? '$0.99/day' : '$0.97/day'
  const billedAs = isAnnual ? 'Billed as $199/year' : 'Billed as $29/month'
  const ctaLabel = trialOn ? 'Start free trial' : 'Start subscription'

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center"
      style={{ backgroundColor: '#FAFAF7' }}
    >
      <div
        className="w-full max-w-[440px] flex flex-col px-5 pb-20"
        style={{ paddingTop: 48 }}
      >

        {/* ── Test-drive section ─────────────────────────────── */}
        <h2
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 800,
            fontSize: 26,
            lineHeight: '34px',
            color: INK,
          }}
        >
          Your test-drive
        </h2>
        <p
          style={{
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '22px',
            color: INK_SOFT,
            marginTop: 6,
          }}
        >
          Here&apos;s where you stand against your target score.
        </p>

        {/* Radar chart */}
        <div
          style={{
            width: '100%',
            height: 240,
            marginTop: 16,
            backgroundColor: PAPER,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: 24,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={RADAR_DATA} margin={{ top: 24, right: 32, bottom: 24, left: 32 }}>
              <PolarGrid stroke="#1A1A1A1A" />
              <PolarAngleAxis
                dataKey="axis"
                tick={{
                  fontSize: 12,
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 600,
                  fill: INK_SOFT,
                }}
              />
              {/* Target — dashed outline */}
              <Radar
                name="Target"
                dataKey="target"
                stroke="#1A1A1A40"
                strokeDasharray="4 3"
                fill="transparent"
                strokeWidth={1.5}
              />
              {/* User — filled accent */}
              <Radar
                name="You"
                dataKey="user"
                stroke="#E0A890"
                fill="#E0A890"
                fillOpacity={0.35}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 600,
                  fontSize: 13,
                  borderRadius: 12,
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-3 justify-center">
          <div className="flex items-center gap-2">
            <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#E0A890', opacity: 0.8 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: INK_SOFT }}>You</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="16" height="8" viewBox="0 0 16 8" aria-hidden="true">
              <line x1="0" y1="4" x2="16" y2="4" stroke="#1A1A1A40" strokeWidth="1.5" strokeDasharray="4 3" />
            </svg>
            <span style={{ fontSize: 12, fontWeight: 600, color: INK_SOFT }}>Target</span>
          </div>
        </div>

        {/* ── Pitch section ─────────────────────────────────────────── */}
        <div style={{ marginTop: 48 }}>
          <h2
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 800,
              fontSize: 30,
              lineHeight: '38px',
              color: INK,
            }}
          >
            Close the gap with FluentPath.
          </h2>
          <p
            style={{
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '22px',
              color: INK_SOFT,
              marginTop: 8,
            }}
          >
            Daily practice, targeted to your weak spots. Le Raccourci + unlimited Tâche 1/2/3 sessions.
          </p>
        </div>

        <div className="flex flex-col gap-4 mt-6">
          {VALUE_ROWS.map((text, i) => (
            <ValueRow key={i} text={text} />
          ))}
        </div>

        {/* ── Price section ──────────────────────────────────────────── */}
        <div
          style={{
            marginTop: 40,
            backgroundColor: PAPER,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: 24,
            padding: '28px 24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          }}
        >
          {/* Billing toggle */}
          <div
            className="flex items-center"
            style={{
              backgroundColor: '#1A1A1A0D',
              borderRadius: 14,
              padding: 4,
              gap: 4,
            }}
            role="group"
            aria-label="Billing period"
          >
            {(['annual', 'monthly'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                style={{
                  flex: 1,
                  height: 38,
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 14,
                  transition: 'all 0.2s',
                  backgroundColor: billing === b ? '#FFFFFF' : 'transparent',
                  color: billing === b ? INK : INK_MUTED,
                  boxShadow: billing === b ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
                  outline: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
                aria-pressed={billing === b}
              >
                {b === 'annual' ? 'Annual' : 'Monthly'}
                {b === 'annual' && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: '#FFFFFF',
                      backgroundColor: '#2D8B55',
                      borderRadius: 20,
                      padding: '1px 6px',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Save 43%
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Price display */}
          <div className="mt-6 flex flex-col items-center">
            <p
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 800,
                fontSize: 52,
                lineHeight: '60px',
                color: INK,
                letterSpacing: '-0.03em',
              }}
            >
              {pricePerDay}
            </p>
            <p
              style={{
                fontWeight: 500,
                fontSize: 14,
                color: INK_MUTED,
                marginTop: 4,
              }}
            >
              {billedAs}
            </p>
          </div>

          {/* Free trial toggle */}
          <div
            className="flex items-center justify-between mt-6"
            style={{
              backgroundColor: '#1A1A1A08',
              borderRadius: 16,
              padding: '14px 18px',
            }}
          >
            <span
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 600,
                fontSize: 14,
                color: INK,
                lineHeight: '20px',
              }}
            >
              Free for 7 days, then {pricePerDay}
            </span>
            {/* Custom toggle */}
            <button
              role="switch"
              aria-checked={trialOn}
              onClick={() => setTrialOn((v) => !v)}
              style={{
                width: 48,
                height: 28,
                borderRadius: 14,
                border: 'none',
                backgroundColor: trialOn ? INK : '#1A1A1A33',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background-color 0.2s',
                flexShrink: 0,
                outline: 'none',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 3,
                  left: trialOn ? 23 : 3,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  transition: 'left 0.2s',
                }}
              />
              <span className="sr-only">{trialOn ? 'Disable free trial' : 'Enable free trial'}</span>
            </button>
          </div>

          {/* Trial timeline */}
          {trialOn && (
            <div className="flex gap-3 mt-4">
              {TRIAL_TIMELINE.map(({ day, label }, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-1 flex-1"
                  style={{
                    backgroundColor: '#1A1A1A08',
                    borderRadius: 14,
                    padding: '12px 10px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: DISPLAY_FONT,
                      fontWeight: 800,
                      fontSize: 12,
                      color: INK,
                      lineHeight: '16px',
                    }}
                  >
                    {day}
                  </span>
                  <span
                    style={{
                      fontWeight: 500,
                      fontSize: 11,
                      color: INK_SOFT,
                      lineHeight: '16px',
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <button
            style={{
              marginTop: 20,
              width: '100%',
              height: 58,
              backgroundColor: INK,
              color: '#FFFFFF',
              borderRadius: 16,
              border: 'none',
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              outline: 'none',
              letterSpacing: '-0.01em',
            }}
            onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)' }}
            onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
            onPointerLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            {ctaLabel}
          </button>

          {/* Maybe later */}
          <div className="flex justify-center mt-4">
            <button
              style={{
                background: 'transparent',
                border: 'none',
                fontFamily: DISPLAY_FONT,
                fontWeight: 600,
                fontSize: 14,
                color: INK_MUTED,
                cursor: 'pointer',
                padding: '4px 8px',
                outline: 'none',
              }}
            >
              Maybe later
            </button>
          </div>
        </div>

        {/* ── Below the fold ──────────────────────────────────────────── */}

        {/* Social proof */}
        <div
          style={{
            marginTop: 36,
            borderTop: `1px solid #1A1A1A12`,
            paddingTop: 28,
          }}
        >
          <p
            style={{
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '22px',
              color: INK_SOFT,
            }}
          >
            Built by Chadi, 7,000+ hours teaching French to English speakers on Preply.
          </p>
          <div
            className="flex items-center gap-6 mt-4"
            style={{
              backgroundColor: PAPER,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderRadius: 16,
              padding: '16px 20px',
              boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
            }}
          >
            {[
              { value: '7,000+', label: 'teaching hours' },
              { value: 'TBD', label: 'students passed' },
              { value: 'TBD', label: 'avg score gain' },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col gap-0.5 flex-1">
                <span
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 800,
                    fontSize: 20,
                    color: INK,
                  }}
                >
                  {value}
                </span>
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: 11,
                    color: INK_MUTED,
                    lineHeight: '16px',
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Guarantee */}
        <div
          className="flex items-center gap-3 mt-6 justify-center"
          style={{ color: INK_MUTED }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M8 1L10.5 5.5H15L11.5 8.5L13 13L8 10L3 13L4.5 8.5L1 5.5H5.5L8 1Z"
              stroke={INK_MUTED}
              strokeWidth="1.25"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ fontWeight: 500, fontSize: 13 }}>
            7-day free trial. Cancel anytime.
          </span>
        </div>

      </div>
    </div>
  )
}
