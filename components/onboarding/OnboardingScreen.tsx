'use client'

// F-201 — onboarding design-system kernel migrated to the editorial
// system established in F-200. Retains the ProgressDots / OnboardingCard /
// CheckIcon / CTAButton / BackButton primitives but restyled with `--ed-*`
// tokens, Geist sans, 4px button radii, 1px ed-rule borders, 0 shadow on
// cards. Per-question pastel cycle + per-question illustrations dropped
// (P-220.z scope evaporated; EcoleReveal hero asset moved to P-228).
//
// Layout: 720px max-width column on desktop matches F-200's text-section
// cadence. Mobile keeps full-width with 24px side padding.
//
// The `INK` / `INK_SOFT` / `INK_MUTED` / `PAPER` / `CTA_DISABLED` /
// `DISPLAY_FONT` constants are preserved as exports for unmigrated
// surfaces (Paywall, /profile, /diagnostic, etc.) that still import from
// here. Per-surface migration to lib/typography.ts as F-2xx ships.

import Image from 'next/image'
import { ReactNode } from 'react'
import { SANS_FONT } from '@/lib/typography'

// ── Legacy exports (preserved for unmigrated surfaces) ─────────────────────
export { DISPLAY_FONT } from '@/lib/typography'
export const INK = 'var(--text-primary)'
export const INK_SOFT = 'var(--text-secondary)'
export const INK_MUTED = 'var(--text-muted)'
export const PAPER = '#FFFFFFCC'
export const CTA_DISABLED = '#1A1A1A4D'

// ── Editorial chrome tokens ─────────────────────────────────────────────────
const ED_BG = 'var(--lm-bg-base)'
const ED_FG = 'var(--lm-text-primary)'
const ED_MUTED = 'var(--lm-text-tertiary)'
const ED_RULE = 'var(--lm-border-subtle)'
const ED_PAPER = 'var(--lm-bg-surface)'
const ED_ACCENT = 'var(--cta-primary)'
const SANS = SANS_FONT

// ── Progress dots ─────────────────────────────────────────────────────────────

interface ProgressDotsProps {
  total: number
  filledUpTo: number // 1-indexed; dots 1..filledUpTo are filled
  current: number   // 1-indexed; the active dot gets the pill shape
}

export function ProgressDots({ total, filledUpTo, current }: ProgressDotsProps) {
  return (
    <div
      className="flex items-center justify-center gap-2 pt-4"
      aria-label={`Step ${current} of ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const step = i + 1
        const isFilled = step <= filledUpTo
        const isCurrent = step === current
        return (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: isCurrent ? 20 : 6,
              height: 6,
              backgroundColor: isFilled ? ED_FG : 'transparent',
              border: isFilled ? 'none' : `1px solid ${ED_RULE}`,
              transitionDuration: '300ms',
              transitionTimingFunction: 'var(--lm-ease-spring)',
            }}
            aria-hidden="true"
          />
        )
      })}
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────

interface OnboardingCardProps {
  isSelected: boolean
  onClick: () => void
  children: ReactNode
  minHeight?: number
}

export function OnboardingCard({
  isSelected,
  onClick,
  children,
  minHeight = 72,
}: OnboardingCardProps) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      // F-212: ed-card-lift adds subtle hover translateY + shadow.
      // ed-btn-press adds 0.98 scale on :active. Combined gives the card
      // both hover affordance and press feedback.
      className="flex items-start justify-between w-full text-left ed-card-lift ed-btn-press"
      style={{
        minHeight,
        backgroundColor: isSelected ? ED_FG : ED_PAPER,
        color: isSelected ? ED_PAPER : ED_FG,
        borderRadius: 4,
        padding: '18px 22px',
        border: `1px solid ${isSelected ? ED_FG : ED_RULE}`,
        outline: 'none',
        cursor: 'pointer',
        transition: `background-color var(--lm-duration-state) var(--lm-ease-spring), border-color var(--lm-duration-state) var(--lm-ease-spring), color var(--lm-duration-state) var(--lm-ease-spring), transform var(--lm-duration-hover) var(--lm-ease-spring), box-shadow var(--lm-duration-hover) var(--lm-ease-spring)`,
        fontFamily: SANS,
      }}
    >
      {children}
    </button>
  )
}

// ── Checkmark icon ─────────────────────────────────────────────────────────────

export function CheckIcon({ visible }: { visible: boolean }) {
  // F-201: thin chevron when unselected, thin checkmark when selected. No
  // pill backdrop. Inherits color from parent (ED_FG when card unselected,
  // ED_PAPER when card is selected/inverted).
  if (!visible) {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        className="shrink-0 mt-0.5"
        style={{ color: ED_MUTED }}
      >
        <path
          d="M5 3L9.5 7L5 11"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0 mt-0.5"
    >
      <path
        d="M3 8.5L6.5 12L13 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ── CTA Button ─────────────────────────────────────────────────────────────────

interface CTAButtonProps {
  label: string
  enabled: boolean
  onClick: () => void
}

export function CTAButton({ label, enabled, onClick }: CTAButtonProps) {
  return (
    <div style={{ paddingBottom: 'calc(20px + var(--lm-safe-bottom))' }}>
      <button
        type="button"
        onClick={onClick}
        disabled={!enabled}
        aria-disabled={!enabled}
        className="w-full ed-btn-press"
        style={{
          height: 56,
          backgroundColor: enabled ? ED_ACCENT : ED_RULE,
          color: enabled ? '#FFFFFF' : ED_MUTED,
          borderRadius: 4,
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 16,
          letterSpacing: '0',
          border: 'none',
          cursor: enabled ? 'pointer' : 'not-allowed',
          outline: 'none',
          transition: `background-color var(--lm-duration-hover) var(--lm-ease-spring)`,
        }}
      >
        {label}
      </button>
    </div>
  )
}

// ── Back button ────────────────────────────────────────────────────────────────

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Go back"
      className="flex items-center justify-center"
      style={{
        width: 36,
        height: 36,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: 0,
        outline: 'none',
        color: ED_FG,
        transition: `opacity var(--lm-duration-hover) var(--lm-ease-spring)`,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.6' }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M11.25 4L5.5 9L11.25 14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

// ── Screen wrapper ─────────────────────────────────────────────────────────────

interface OnboardingScreenProps {
  // F-201: bg defaults to --ed-bg. Per-question pastel cycle dropped.
  bg?: string
  progressTotal?: number
  progressFilledUpTo: number
  progressCurrent: number
  // F-201: illustrations dropped from question screens. Optional prop
  // remains so EcoleReveal can pass one if it wants the kernel layout
  // (it doesn't today — EcoleReveal renders its own layout).
  illustration?: string
  illustrationAlt?: string
  headline: string
  descriptor?: string
  ctaLabel?: string
  ctaEnabled: boolean
  ctaHint?: string
  onContinue: () => void
  onBack?: () => void
  headerRight?: ReactNode
  children: ReactNode
}

export function OnboardingScreen({
  bg = ED_BG,
  progressTotal = 6,
  progressFilledUpTo,
  progressCurrent,
  illustration,
  illustrationAlt,
  headline,
  descriptor,
  ctaLabel = 'Continue',
  ctaEnabled,
  ctaHint,
  onContinue,
  onBack,
  headerRight,
  children,
}: OnboardingScreenProps) {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center"
      style={{ backgroundColor: bg }}
    >
      {/* F-201: 720px desktop column matches F-200 text-section cadence;
          mobile uses full width with 24px side padding. The "white rails on
          desktop" launch-blocker dissolves once --ed-bg covers full bleed. */}
      <div
        className="w-full flex flex-col flex-1 min-h-screen"
        style={{
          maxWidth: 720,
          padding: '0 clamp(24px, 4vw, 48px)',
        }}
      >
        {/* Top row: back button + progress dots + optional right slot (lang toggle) */}
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
            <div className="absolute right-0">
              {headerRight}
            </div>
          )}
        </div>

        {/* Optional illustration (kept for backward-compat with EcoleReveal-style
            callers; question screens no longer pass one). */}
        {illustration && (
          <div className="flex justify-center" style={{ marginTop: 'clamp(32px, 5vw, 64px)' }}>
            <Image
              src={illustration}
              alt={illustrationAlt ?? ''}
              width={240}
              height={240}
              className="object-contain"
              priority
            />
          </div>
        )}

        {/* Headline — type-led; sized via clamp() for desktop scale-up */}
        <h1
          className="text-balance"
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 'clamp(28px, 4vw, 48px)',
            lineHeight: 1.15,
            letterSpacing: '-0.015em',
            color: ED_FG,
            margin: 0,
            marginTop: illustration ? 'clamp(32px, 4vw, 48px)' : 'clamp(48px, 8vw, 96px)',
          }}
        >
          {headline}
        </h1>

        {/* Descriptor */}
        {descriptor && (
          <p
            className="text-pretty"
            style={{
              fontFamily: SANS,
              fontWeight: 400,
              fontSize: 'clamp(15px, 1.5vw, 17px)',
              lineHeight: 1.6,
              color: ED_MUTED,
              margin: '16px 0 0 0',
              maxWidth: 560,
            }}
          >
            {descriptor}
          </p>
        )}

        {/* Cards slot */}
        <div className="flex flex-col" style={{ gap: 10, marginTop: 'clamp(32px, 5vw, 56px)' }}>
          {children}
        </div>

        {/* Spacer */}
        <div className="flex-1" style={{ minHeight: 'clamp(48px, 8vw, 96px)' }} />

        {/* CTA hint — guides user when no selection has been made */}
        {!ctaEnabled && ctaHint && (
          <p
            aria-live="polite"
            style={{
              fontFamily: SANS,
              fontWeight: 400,
              fontSize: 13,
              color: ED_MUTED,
              textAlign: 'center',
              margin: '0 0 10px',
            }}
          >
            {ctaHint}
          </p>
        )}
        {/* CTA */}
        <CTAButton label={ctaLabel} enabled={ctaEnabled} onClick={onContinue} />
      </div>
    </div>
  )
}
