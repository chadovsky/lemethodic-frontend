'use client'

// M-101a — waitlist form for Sprint and Premium tiers. Renders as a modal
// dialog over the pricing section; collects email + optional exam date; on
// submit, persists to localStorage via waitlist.ts and shows a confirmation
// state. Closing the modal returns to the pricing section.
//
// M-101c later upgrades the storage path: the same form will POST to a BE
// endpoint and read existing localStorage entries on first authenticated
// load to backfill BE.

import { useEffect, useRef, useState } from 'react'
import { CTAButton, INK, INK_MUTED, INK_SOFT, PAPER, DISPLAY_FONT } from '../onboarding/OnboardingScreen'
import type { Lang } from './copy'
import { WAITLIST } from './copy'
import { submitWaitlist, type WaitlistIntent } from './waitlist'

interface WaitlistFormProps {
  intent: WaitlistIntent
  lang: Lang
  onClose: () => void
}

export default function WaitlistForm({ intent, lang, onClose }: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [examDate, setExamDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ alreadyOnList: boolean } | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const initialFocusRef = useRef<HTMLInputElement>(null)

  // Trap initial focus on the email input + Escape closes.
  useEffect(() => {
    initialFocusRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    setError(null)
    const result = submitWaitlist({
      email,
      intent,
      examDate: examDate || null,
    })
    if (!result.ok) {
      setError(WAITLIST.invalidEmail[lang])
      return
    }
    setSuccess({ alreadyOnList: result.alreadyOnList })
  }

  const heading = WAITLIST.heading(intent)[lang]
  const description = WAITLIST.description(intent)[lang]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-heading"
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-[440px] flex flex-col"
        style={{
          backgroundColor: '#FAFAF7',
          borderRadius: 24,
          padding: '28px 24px 24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          maxHeight: 'calc(100dvh - 40px)',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <SuccessView intent={intent} lang={lang} alreadyOnList={success.alreadyOnList} onClose={onClose} />
        ) : (
          <form onSubmit={handleSubmit}>
            <h2
              id="waitlist-heading"
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 800,
                fontSize: 24,
                lineHeight: '32px',
                color: INK,
                marginBottom: 8,
              }}
            >
              {heading}
            </h2>
            <p
              style={{
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '22px',
                color: INK_SOFT,
                marginBottom: 20,
              }}
            >
              {description}
            </p>

            <label
              htmlFor="waitlist-email"
              style={{
                display: 'block',
                fontFamily: DISPLAY_FONT,
                fontWeight: 600,
                fontSize: 12,
                color: INK_MUTED,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              {WAITLIST.emailLabel[lang]}
            </label>
            <input
              id="waitlist-email"
              ref={initialFocusRef}
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError(null)
              }}
              placeholder={WAITLIST.emailPlaceholder[lang]}
              required
              style={{
                height: 48,
                width: '100%',
                borderRadius: 12,
                border: `2px solid ${error ? '#D08272' : email ? INK : INK_MUTED}`,
                backgroundColor: PAPER,
                padding: '0 16px',
                fontFamily: DISPLAY_FONT,
                fontWeight: 500,
                fontSize: 15,
                color: INK,
                outline: 'none',
                marginBottom: 14,
              }}
            />

            <label
              htmlFor="waitlist-exam-date"
              style={{
                display: 'block',
                fontFamily: DISPLAY_FONT,
                fontWeight: 600,
                fontSize: 12,
                color: INK_MUTED,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              {WAITLIST.examDateLabel[lang]}
            </label>
            <input
              id="waitlist-exam-date"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              style={{
                height: 48,
                width: '100%',
                borderRadius: 12,
                border: `2px solid ${examDate ? INK : INK_MUTED}`,
                backgroundColor: PAPER,
                padding: '0 16px',
                fontFamily: DISPLAY_FONT,
                fontWeight: 500,
                fontSize: 15,
                color: examDate ? INK : INK_MUTED,
                outline: 'none',
                marginBottom: 6,
              }}
            />

            {error && (
              <p
                role="alert"
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  lineHeight: '20px',
                  color: '#D08272',
                  marginTop: 6,
                  marginBottom: 0,
                }}
              >
                {error}
              </p>
            )}

            <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <CTAButton
                label={WAITLIST.submit[lang]}
                enabled={true}
                onClick={() => handleSubmit()}
              />
              <button
                type="button"
                onClick={onClose}
                style={{
                  height: 44,
                  borderRadius: 12,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: INK_SOFT,
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {WAITLIST.cancel[lang]}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function SuccessView({
  intent,
  lang,
  alreadyOnList,
  onClose,
}: {
  intent: WaitlistIntent
  lang: Lang
  alreadyOnList: boolean
  onClose: () => void
}) {
  return (
    <div>
      <h2
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 800,
          fontSize: 24,
          lineHeight: '32px',
          color: INK,
          marginBottom: 8,
        }}
      >
        {WAITLIST.successHeading[lang]}
      </h2>
      <p
        style={{
          fontWeight: 500,
          fontSize: 15,
          lineHeight: '24px',
          color: INK_SOFT,
          marginBottom: 24,
        }}
      >
        {alreadyOnList
          ? WAITLIST.alreadyOnList[lang]
          : WAITLIST.successBody(intent)[lang]}
      </p>
      <CTAButton
        label={WAITLIST.close[lang]}
        enabled={true}
        onClick={onClose}
      />
    </div>
  )
}
