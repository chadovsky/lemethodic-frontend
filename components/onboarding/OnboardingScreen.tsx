'use client'

import Image from 'next/image'
import { ReactNode } from 'react'

// Shared colors for pointer interaction reuse
export const INK = '#1A1A1A'
export const INK_SOFT = '#1A1A1AB3'
export const INK_MUTED = '#1A1A1A66'
export const PAPER = '#FFFFFFCC'
export const CTA_DISABLED = '#1A1A1A4D'
export const DISPLAY_FONT = "'Cabinet Grotesk', 'Geist', sans-serif"

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
            className="rounded-full transition-all duration-300"
            style={{
              width: isCurrent ? 20 : 8,
              height: 8,
              backgroundColor: isFilled ? INK : 'transparent',
              border: isFilled ? 'none' : `1.5px solid ${INK_MUTED}`,
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
  minHeight = 88,
}: OnboardingCardProps) {
  function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    e.currentTarget.style.transform = 'scale(0.96)'
  }
  function handlePointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    e.currentTarget.style.transform = isSelected ? 'scale(1.01)' : 'scale(1)'
  }
  function handlePointerLeave(e: React.PointerEvent<HTMLButtonElement>) {
    e.currentTarget.style.transform = isSelected ? 'scale(1.01)' : 'scale(1)'
  }

  return (
    <button
      aria-pressed={isSelected}
      onClick={onClick}
      className="flex items-start justify-between w-full text-left transition-all duration-150"
      style={{
        minHeight,
        backgroundColor: PAPER,
        borderRadius: 24,
        padding: '20px 24px',
        border: isSelected ? `2px solid ${INK}` : '2px solid transparent',
        boxShadow: isSelected
          ? '0 4px 16px rgba(0,0,0,0.08)'
          : '0 2px 8px rgba(0,0,0,0.06)',
        transform: isSelected ? 'scale(1.01)' : 'scale(1)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        outline: 'none',
        cursor: 'pointer',
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </button>
  )
}

// ── Checkmark icon ─────────────────────────────────────────────────────────────

export function CheckIcon({ visible }: { visible: boolean }) {
  if (!visible) {
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
          d="M6 3L11 8L6 13"
          stroke={INK_MUTED}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
      className="shrink-0 mt-0.5"
    >
      <circle cx="11" cy="11" r="11" fill={INK} />
      <path
        d="M6.5 11.2L9.5 14.5L15.5 8"
        stroke="white"
        strokeWidth="2"
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
  function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    if (enabled) e.currentTarget.style.transform = 'scale(0.96)'
  }
  function handlePointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    e.currentTarget.style.transform = 'scale(1)'
  }
  function handlePointerLeave(e: React.PointerEvent<HTMLButtonElement>) {
    e.currentTarget.style.transform = 'scale(1)'
  }

  return (
    <div className="pb-5">
      <button
        onClick={onClick}
        disabled={!enabled}
        aria-disabled={!enabled}
        className="w-full transition-all duration-200"
        style={{
          height: 56,
          backgroundColor: enabled ? INK : CTA_DISABLED,
          color: '#FFFFFF',
          borderRadius: 16,
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 16,
          lineHeight: '24px',
          border: 'none',
          cursor: enabled ? 'pointer' : 'not-allowed',
          outline: 'none',
          letterSpacing: '-0.01em',
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
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
      onClick={onClick}
      aria-label="Go back"
      className="flex items-center justify-center transition-opacity duration-150 hover:opacity-60"
      style={{
        width: 36,
        height: 36,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: 0,
        outline: 'none',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M12.5 4L7 10L12.5 16"
          stroke={INK}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

// ── Screen wrapper ─────────────────────────────────────────────────────────────

interface OnboardingScreenProps {
  bg: string
  progressFilledUpTo: number
  progressCurrent: number
  illustration: string
  illustrationAlt: string
  headline: string
  descriptor: string
  ctaLabel?: string
  ctaEnabled: boolean
  onContinue: () => void
  onBack?: () => void
  children: ReactNode
}

export function OnboardingScreen({
  bg,
  progressFilledUpTo,
  progressCurrent,
  illustration,
  illustrationAlt,
  headline,
  descriptor,
  ctaLabel = 'Continue',
  ctaEnabled,
  onContinue,
  onBack,
  children,
}: OnboardingScreenProps) {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center"
      style={{ backgroundColor: bg }}
    >
      <div className="w-full max-w-[440px] flex flex-col flex-1 min-h-screen px-5">
        {/* Top row: back button + progress dots */}
        <div className="relative flex items-center pt-4" style={{ minHeight: 32 }}>
          {onBack && (
            <div className="absolute left-0">
              <BackButton onClick={onBack} />
            </div>
          )}
          <div className="flex-1">
            <ProgressDots total={6} filledUpTo={progressFilledUpTo} current={progressCurrent} />
          </div>
        </div>

        {/* Illustration — floats directly on pastel bg, no container */}
        <div className="flex justify-center mt-10">
          <Image
            src={illustration}
            alt={illustrationAlt}
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
          {headline}
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
          {descriptor}
        </p>

        {/* Cards slot */}
        <div className="flex flex-col gap-[14px] mt-10">
          {children}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <CTAButton label={ctaLabel} enabled={ctaEnabled} onClick={onContinue} />
      </div>
    </div>
  )
}
