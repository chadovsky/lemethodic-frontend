'use client'

import { Suspense, useEffect, useState, type KeyboardEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api, ApiError } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import { useOnboardingStore } from '@/lib/onboarding'
import type { OnboardingData } from '@/lib/types'
import {
  INK,
  INK_SOFT,
  INK_MUTED,
  CTA_DISABLED,
  DISPLAY_FONT,
} from '@/components/onboarding/OnboardingScreen'

const BG = '#FFD8C2' // peach — matches /login + paywall

function validate(fullName: string, email: string, password: string): string | null {
  if (fullName.trim().length < 2) return 'Enter your name (at least 2 characters)'
  const trimmedEmail = email.trim()
  const at = trimmedEmail.indexOf('@')
  const hasLocal = at > 0
  const hasDomain = at >= 0 && trimmedEmail.slice(at + 1).length > 0
  if (!hasLocal || !hasDomain) return 'Enter a valid email'
  if (password.length < 8) return 'Password must be at least 8 characters'
  return null
}

// Pydantic 422 bodies come back as { detail: [ { type, loc, msg, ctx }, ... ] }
// rather than a flat string — check the loc array for the field name to tell
// which input failed validation.
function is422FieldError(err: ApiError, field: string): boolean {
  if (err.status !== 422) return false
  const body = err.body
  if (!body || typeof body !== 'object' || !('detail' in body)) return false
  const detail = (body as { detail: unknown }).detail
  if (!Array.isArray(detail)) return false
  return detail.some((entry) => {
    if (!entry || typeof entry !== 'object') return false
    const loc = (entry as { loc?: unknown }).loc
    return Array.isArray(loc) && loc.some((p) => p === field)
  })
}

function mapRegisterError(err: ApiError): string {
  // Backend returns HTTP 400 "Email already registered" for duplicates today;
  // accept 409 for future-proofing if the backend tightens semantics.
  const bodyDetail =
    err.body && typeof err.body === 'object' && 'detail' in err.body
      ? String((err.body as { detail: unknown }).detail ?? '').toLowerCase()
      : ''
  const looksLikeDuplicate =
    err.status === 409 ||
    (err.status === 400 && bodyDetail.includes('email'))
  if (looksLikeDuplicate) {
    return 'An account with that email already exists. Try signing in.'
  }
  // Pydantic EmailStr rejects reserved TLDs (.local / .test / .example /
  // .invalid / .localhost) with a 422 on the email field. Surface the likely
  // cause rather than the generic fallback.
  if (is422FieldError(err, 'email')) {
    return 'Please use a valid email address (not .local, .test, or .example)'
  }
  return 'Could not create account. Try again.'
}

function SignupInner() {
  const router = useRouter()
  const params = useSearchParams()
  // Default trial=true when missing or any non-"false" value — hitting /signup
  // directly should still land on the trial-oriented copy.
  const trial = params.get('trial') !== 'false'

  const token = useAuthStore((s) => s.token)
  const hydrated = useAuthStore((s) => s.hydrated)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Rehydrate on mount + bounce an already-authenticated user away from
  // the signup form — no point creating a second account.
  useEffect(() => {
    useAuthStore.getState().hydrate()
  }, [])
  useEffect(() => {
    if (hydrated && token) {
      router.replace('/raccourci')
    }
  }, [hydrated, token, router])

  async function handleSubmit() {
    if (isLoading) return

    const validationError = validate(fullName, email, password)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsLoading(true)
    try {
      const { token, user } = await api.auth.register(
        email.trim(),
        password,
        fullName.trim(),
      )
      useAuthStore.getState().setAuth(token, user)

      // Best-effort onboarding flush. If the backend accepts the payload it
      // returns the enriched user shape (all six onboarding fields populated)
      // — re-seat that into the auth store so HomeScreen can immediately read
      // exam_date, target_level, etc. without a second /me round-trip.
      // TODO(F-060): queue failed onboarding payloads for retry from /profile.
      const onboardingData = useOnboardingStore.getState().data
      if (Object.keys(onboardingData).length > 0) {
        try {
          const enrichedUser = await api.users.completeOnboarding(
            onboardingData as OnboardingData,
          )
          useAuthStore.getState().setAuth(token, enrichedUser)
          useOnboardingStore.getState().reset()
        } catch (flushErr) {
          // eslint-disable-next-line no-console
          console.error('Onboarding flush failed — routing to /raccourci anyway', flushErr)
        }
      }

      router.push('/raccourci')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(mapRegisterError(err))
      } else {
        setError("Can't reach the server. Check your connection.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  function makeChange<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v)
      if (error) setError(null)
    }
  }

  const subhead = trial
    ? '7 days free, then $0.97/day. Cancel anytime.'
    : 'Create your account to continue. You can start a trial anytime from Profile.'

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-5"
      style={{ backgroundColor: BG }}
    >
      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: '32px 28px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}
      >
        {/* Brand mark */}
        <p
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: 13,
            color: INK_MUTED,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          FluentPath
        </p>

        {/* Heading */}
        <h1
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 800,
            fontSize: 28,
            lineHeight: '36px',
            color: INK,
            letterSpacing: '-0.01em',
          }}
        >
          Start your free trial
        </h1>

        {/* Subhead */}
        <p
          style={{
            fontWeight: 500,
            fontSize: 15,
            lineHeight: '22px',
            color: INK_SOFT,
            marginTop: 6,
          }}
        >
          {subhead}
        </p>

        {/* Full name */}
        <div className="flex flex-col gap-2" style={{ marginTop: 24 }}>
          <label
            htmlFor="fullName"
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 600,
              fontSize: 12,
              color: INK_MUTED,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Your name
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => makeChange(setFullName)(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            style={{
              height: 52,
              borderRadius: 14,
              border: `1.5px solid ${INK_MUTED}`,
              backgroundColor: '#FFFFFF',
              padding: '0 16px',
              fontFamily: DISPLAY_FONT,
              fontWeight: 500,
              fontSize: 15,
              color: INK,
              width: '100%',
            }}
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2" style={{ marginTop: 16 }}>
          <label
            htmlFor="email"
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 600,
              fontSize: 12,
              color: INK_MUTED,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            value={email}
            onChange={(e) => makeChange(setEmail)(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            style={{
              height: 52,
              borderRadius: 14,
              border: `1.5px solid ${INK_MUTED}`,
              backgroundColor: '#FFFFFF',
              padding: '0 16px',
              fontFamily: DISPLAY_FONT,
              fontWeight: 500,
              fontSize: 15,
              color: INK,
              width: '100%',
            }}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2" style={{ marginTop: 16 }}>
          <label
            htmlFor="password"
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 600,
              fontSize: 12,
              color: INK_MUTED,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Password — at least 8 characters
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => makeChange(setPassword)(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            style={{
              height: 52,
              borderRadius: 14,
              border: `1.5px solid ${INK_MUTED}`,
              backgroundColor: '#FFFFFF',
              padding: '0 16px',
              fontFamily: DISPLAY_FONT,
              fontWeight: 500,
              fontSize: 15,
              color: INK,
              width: '100%',
            }}
          />
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          aria-busy={isLoading}
          style={{
            marginTop: 24,
            width: '100%',
            height: 52,
            backgroundColor: isLoading ? CTA_DISABLED : INK,
            color: '#FFFFFF',
            borderRadius: 14,
            border: 'none',
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: 15,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            letterSpacing: '-0.01em',
            outline: 'none',
          }}
          onPointerDown={(e) => {
            if (!isLoading) e.currentTarget.style.transform = 'scale(0.97)'
          }}
          onPointerUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
          onPointerLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          {isLoading ? 'Creating account…' : 'Create account & start trial'}
        </button>

        {/* Inline error */}
        {error && (
          <p
            role="alert"
            style={{
              marginTop: 12,
              fontFamily: DISPLAY_FONT,
              fontWeight: 500,
              fontSize: 13,
              lineHeight: '18px',
              color: '#B42318',
              textAlign: 'center',
            }}
          >
            {error}
          </p>
        )}
      </div>

      {/* Below the card */}
      <p
        style={{
          marginTop: 24,
          fontSize: 14,
          lineHeight: '20px',
          color: INK_SOFT,
          textAlign: 'center',
        }}
      >
        Already have an account?{' '}
        <Link
          href="/login"
          style={{
            color: INK,
            fontWeight: 600,
            textDecoration: 'underline',
          }}
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default function SignupPage() {
  // useSearchParams in Next.js 15+ demands a Suspense boundary for static
  // rendering. Fallback is a bare pastel canvas so there's no flash.
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full" style={{ backgroundColor: BG }} />
      }
    >
      <SignupInner />
    </Suspense>
  )
}
