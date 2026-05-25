'use client'

// F-VISUAL-001 X.3.1 — paywall audit. All chrome (text, bg, rule,
// CTA) was already consuming var(--ed-*) tokens, which X.1 aliased
// to the new canonical palette (--bg-canvas, --text-primary,
// --cta-primary, --rule-default). Remaining hex literals here are
// (a) '#FFFFFF' for button text (universal contrast color, kept),
// (b) '#1A1A1A04/08/0D/33' alpha overlays (decorative, kept). No
// further source edits needed for the paywall surface.
//
// F-VISUAL-001 X.4.1 — motion injection. Outer wrapper gets ed-page-
// enter for the soft fade-up on route entry. Radar chart block wraps
// in a Framer Motion <motion.div> that animates opacity + y on
// viewport entry (one-shot via viewport={{ once: true }}). useReducedMotion
// honored — Framer Motion respects the user's prefers-reduced-motion
// preference automatically.

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth'
import { useVerifyAuth } from '@/hooks/useVerifyAuth'
import { duration, ease } from '@/lib/motion'
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

// V-009 — radar swapped from 4-axis legacy backend labels (Content /
// Structure / Grammar / English Habits) to 5-axis user-facing brand
// labels matching the locked methodology (Range / Coherence / Accuracy /
// Fluency / Voice). Order is methodology-canonical (Le Fond first,
// La Voix last) per lib/coucheBrandLabels.ts COUCHE_ORDER. This is
// decorative mock data — Paywall doesn't wire to the real BE diagnostic.
const RADAR_DATA = [
  { axis: 'Range',     user: 3, target: 4 },
  { axis: 'Coherence', user: 2, target: 4 },
  { axis: 'Accuracy',  user: 2, target: 4 },
  { axis: 'Fluency',   user: 2, target: 4 },
  { axis: 'Voice',     user: 2, target: 4 },
]

const VALUE_ROWS: string[] = [
  "La Méthode. 27 lessons unlocking B2 grammar",
  "Unlimited Tâche 1, 2, 3 practice with AI examiner",
  "Mock Exam mode (recommended after La Méthode)",
]

const TRIAL_TIMELINE = [
  { day: 'Today', label: 'Unlock everything' },
  { day: 'Day 5', label: 'We remind you before charging' },
  { day: 'Day 7', label: 'Your trial ends, billing starts' },
]

type CellVal = true | false | string
const COMPARE_ROWS: { feature: string; free: CellVal; paid: CellVal }[] = [
  { feature: "La Méthode lessons",   free: '1 of 27',  paid: true },
  { feature: 'Tâche 1/2/3 practice',    free: '3/day',    paid: true },
  { feature: 'AI examiner feedback',     free: false,      paid: true },
  { feature: 'Mock Exam mode',           free: false,      paid: true },
  { feature: 'Progress tracking',        free: false,      paid: true },
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
  const router = useRouter()
  const [billing, setBilling] = useState<'annual' | 'monthly'>('annual')
  const [trialOn, setTrialOn] = useState(true)
  const [compareOpen, setCompareOpen] = useState(false)
  const toggleCompare = useCallback(() => setCompareOpen((v) => !v), [])

  // F-BUGS-001-FE-B B.4 — authed users have no business on /paywall: the
  // existing CTAs route to /signup, which then bounces them back to /ecole,
  // producing a confusing dead-end loop. The User type currently has no
  // subscription field, so we cannot show an authed-but-no-sub "upgrade"
  // variant on the FE alone (see follow-up BE ticket for adding
  // subscriptionStatus to /api/auth/me). Pessimistic redirect-to-/ecole is
  // the minimum-viable fix that ships without waiting on BE.
  const token = useAuthStore((s) => s.token)
  const hydrated = useAuthStore((s) => s.hydrated)
  const verified = useAuthStore((s) => s.verified)
  useEffect(() => {
    useAuthStore.getState().hydrate()
  }, [])
  useVerifyAuth()
  useEffect(() => {
    if (hydrated && token && verified) {
      router.replace('/la-methode')
    }
  }, [hydrated, token, verified, router])
  // Any token at all (verified or not) means the redirect effect above will
  // fire — suppress the paywall in the meantime so authed users never see it.
  const awaitingAuthRedirect = !hydrated || token != null
  if (awaitingAuthRedirect) {
    return (
      <div
        style={{ minHeight: '100dvh', backgroundColor: 'var(--lm-warm-cream)' }}
      />
    )
  }

  const handleStartTrial = () => {
    router.push('/signup?trial=true')
  }

  // TODO(F-060): revisit whether "skipped trial" still needs to create an
  // account (likely yes for analytics + diagnostic attribution). Routing
  // through /signup with trial=false preserves the user's preference so
  // Stripe wiring can pick it up later.
  const handleMaybeLater = () => {
    router.push('/signup?trial=false')
  }

  const isAnnual = billing === 'annual'
  const pricePerDay = isAnnual ? '$0.99/day' : '$0.97/day'
  const billedAs = isAnnual ? 'Billed as $199/year' : 'Billed as $29/month'
  const ctaLabel = trialOn ? 'Start free trial' : 'Start subscription'

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center ed-page-enter"
      // F-203 — bg migrated from --fp-canvas (#FAFAF7) to --ed-bg (#FAF7F2).
      // Visually near-identical (both warm off-white), but unifies under the
      // editorial system. Full editorial typography pass tracked as
      // F-203.paywall (Recharts radar + comparison table styling needs care).
      // F-VISUAL-001 X.4.1 — ed-page-enter class added for soft route-entry fade.
      style={{ backgroundColor: 'var(--lm-warm-cream)' }}
    >
      <div
        className="w-full flex flex-col px-5"
        // F-203 — column widened from 440px to 640px desktop / full-width
        // mobile. Fixes the "white rails on desktop" launch-blocker. The
        // radar chart + comparison table inside still cap at narrower
        // widths via their own styling.
        style={{
          maxWidth: 640,
          paddingLeft: 'clamp(20px, 4vw, 40px)',
          paddingRight: 'clamp(20px, 4vw, 40px)',
          paddingTop: 'clamp(48px, 8vw, 96px)',
          paddingBottom: 'calc(80px + var(--lm-safe-bottom))',
        }}
      >

        {/* ── Diagnostic preview section ─────── */}
        <h2
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 800,
            fontSize: 26,
            lineHeight: '34px',
            color: INK,
          }}
        >
          Where you stand today
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

        {/* Radar chart — F-VISUAL-001 X.4.1 wraps in <motion.div> for
            scroll-reveal on viewport entry. One-shot (viewport once: true).
            Framer Motion respects prefers-reduced-motion automatically. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: duration.slow, ease: ease.out }}
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
              {/* V-012b — Target dashed outline shifted from neutral ink
                  to warm sage-deep so the radar reads warm at both layers
                  (user warm-peach, target warm-sage). Pairs with the
                  ed-warm-cream section bg. */}
              <Radar
                name="Target"
                dataKey="target"
                stroke="var(--lm-warm-sage-deep)"
                strokeDasharray="4 3"
                fill="transparent"
                strokeWidth={1.5}
              />
              {/* V-012b — User stroke kept on the saturated peach-deep for
                  shape definition; fill uses the lighter ed-warm-peach
                  for the soft "you" data wash. */}
              <Radar
                name="You"
                dataKey="user"
                stroke="var(--lm-warm-peach-deep)"
                fill="var(--lm-warm-peach)"
                fillOpacity={0.5}
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
        </motion.div>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-3 justify-center">
          <div className="flex items-center gap-2">
            <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: 'var(--lm-warm-peach-deep)', opacity: 0.8 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: INK_SOFT }}>You</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="16" height="8" viewBox="0 0 16 8" aria-hidden="true">
              <line x1="0" y1="4" x2="16" y2="4" stroke="var(--lm-warm-sage-deep)" strokeWidth="1.5" strokeDasharray="4 3" />
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
            Close the gap with LeMethodic.
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
            Daily practice, targeted to your weak spots. La Méthode + unlimited Tâche 1/2/3 sessions.
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
                  height: 44,
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
                      backgroundColor: 'var(--lm-success)',
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

          {/* CTA — V-012b: bg switched from legacy INK constant to
              var(--cta-primary) navy, gains .ed-cta-warm-hover class for
              the spring-eased warm-peach-deep hover state. The inline
              transform handlers preserve the press scale snap. */}
          <button
            type="button"
            onClick={handleStartTrial}
            className="ed-cta-warm-hover"
            style={{
              marginTop: 20,
              width: '100%',
              height: 58,
              backgroundColor: 'var(--cta-primary)',
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
              type="button"
              onClick={handleMaybeLater}
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
              { value: '500+', label: 'students helped' },
              { value: '+42 pts', label: 'avg score gain' },
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

        {/* Guarantee badge */}
        <div
          className="flex items-center justify-center gap-2 mt-6"
          style={{
            backgroundColor: PAPER,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: 100,
            padding: '10px 20px',
            boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
            alignSelf: 'center',
          }}
        >
          {/* Shield icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M8 1.5L2.5 4V8.5C2.5 11.5 5 13.8 8 14.5C11 13.8 13.5 11.5 13.5 8.5V4L8 1.5Z"
              stroke={INK}
              strokeWidth="1.25"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M5.5 8.2L7.2 9.9L10.5 6.5"
              stroke={INK}
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 600,
              fontSize: 13,
              color: INK,
              whiteSpace: 'nowrap',
            }}
          >
            7-day free trial · Cancel anytime
          </span>
        </div>

        {/* Compare plans (collapsed by default) */}
        <div style={{ marginTop: 24 }}>
          <button
            onClick={toggleCompare}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: DISPLAY_FONT,
              fontWeight: 600,
              fontSize: 14,
              color: INK_SOFT,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              outline: 'none',
            }}
            aria-expanded={compareOpen}
          >
            Compare plans
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
              style={{
                transform: compareOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            >
              <path
                d="M3 5L7 9L11 5"
                stroke={INK_SOFT}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {compareOpen && (
            <div
              style={{
                marginTop: 12,
                borderRadius: 20,
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              {/* Header row */}
              <div
                className="grid"
                style={{
                  gridTemplateColumns: '1fr 88px 88px',
                  backgroundColor: '#1A1A1A08',
                  padding: '10px 16px',
                  gap: 8,
                }}
              >
                <span style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: 12, color: INK_MUTED, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Feature</span>
                <span style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: 12, color: INK_MUTED, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Free</span>
                <span style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: 12, color: INK, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>LeMethodic</span>
              </div>

              {/* Data rows */}
              {COMPARE_ROWS.map(({ feature, free, paid }, i) => (
                <div
                  key={feature}
                  className="grid items-center"
                  style={{
                    gridTemplateColumns: '1fr 88px 88px',
                    padding: '12px 16px',
                    gap: 8,
                    backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#1A1A1A04',
                    borderTop: '1px solid #1A1A1A0A',
                  }}
                >
                  <span style={{ fontWeight: 500, fontSize: 13, color: INK, lineHeight: '18px' }}>
                    {feature}
                  </span>
                  <CellDisplay val={free} />
                  <CellDisplay val={paid} highlight />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom spacer */}
        <div style={{ height: 32 }} />

      </div>
    </div>
  )
}

function CellDisplay({ val, highlight = false }: { val: boolean | string; highlight?: boolean }) {
  if (val === true) {
    return (
      <div className="flex justify-center">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-label="Included">
          <circle cx="9" cy="9" r="9" fill={highlight ? INK : 'var(--lm-success-25)'} />
          <path
            d="M5 9.2L7.8 12L13 6.5"
            stroke={highlight ? '#FFFFFF' : 'var(--lm-success)'}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    )
  }
  if (val === false) {
    return (
      <div className="flex justify-center">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-label="Not included">
          <circle cx="9" cy="9" r="9" fill="#1A1A1A12" />
          <path
            d="M6 6L12 12M12 6L6 12"
            stroke={INK_MUTED}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    )
  }
  return (
    <div className="flex justify-center">
      <span style={{ fontFamily: DISPLAY_FONT, fontWeight: 600, fontSize: 12, color: INK_SOFT, textAlign: 'center' }}>
        {val}
      </span>
    </div>
  )
}
