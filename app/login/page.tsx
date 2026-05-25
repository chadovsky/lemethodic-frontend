'use client'

import { useEffect, useState, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, ApiError } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import {
  INK,
  INK_SOFT,
  INK_MUTED,
  CTA_DISABLED,
  DISPLAY_FONT,
} from '@/components/onboarding/OnboardingScreen'

// F-206 — bg migrated to editorial system. Inner card chrome left in
// place for v1 (matches signup pattern; full editorial pass is F-206.deep).
const BG = 'var(--lm-bg-base)'

function validate(email: string, password: string): string | null {
  const trimmed = email.trim()
  const at = trimmed.indexOf('@')
  const hasLocal = at > 0
  const hasDomain = at >= 0 && trimmed.slice(at + 1).length > 0
  if (!hasLocal || !hasDomain) return 'Enter a valid email'
  if (!password) return 'Enter your password'
  return null
}

function mapApiError(err: ApiError): string {
  switch (err.status) {
    case 401:
      return 'Invalid email or password'
    case 404:
      return 'No account found with that email'
    case 429:
      return 'Too many attempts. Try again in a minute.'
    default:
      return 'Something went wrong. Try again.'
  }
}

export default function LoginPage() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const hydrated = useAuthStore((s) => s.hydrated)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Rehydrate on mount + bounce an already-authenticated user straight to
  // the home screen instead of showing them the login form.
  useEffect(() => {
    useAuthStore.getState().hydrate()
  }, [])
  useEffect(() => {
    if (hydrated && token) {
      router.replace('/dashboard')
    }
  }, [hydrated, token, router])

  async function handleSubmit() {
    if (isLoading) return

    const validationError = validate(email, password)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsLoading(true)
    try {
      const { token, user } = await api.auth.login(email.trim(), password)
      useAuthStore.getState().setAuth(token, user)
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(mapApiError(err))
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

  // Clear stale error as soon as the user edits a field.
  function onEmailChange(v: string) {
    setEmail(v)
    if (error) setError(null)
  }
  function onPasswordChange(v: string) {
    setPassword(v)
    if (error) setError(null)
  }

  // F-BUGS-001-FE-B B.5 — cosmetic flash fix. Any token (verified or not)
  // means the redirect effect above will fire — render a neutral loader in
  // the meantime instead of the login form. Authed users with a stale token
  // see the same loader until lib/api's 401 interceptor clears it, at which
  // point token flips to null and the form renders for fresh credentials.
  const awaitingAuthRedirect = !hydrated || token != null
  if (awaitingAuthRedirect) {
    return <div style={{ minHeight: '100dvh', backgroundColor: BG }} />
  }

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
          LeMethodic
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
          Welcome back
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
          Sign in to continue your École.
        </p>

        {/* Email */}
        <div className="flex flex-col gap-2" style={{ marginTop: 24 }}>
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
            onChange={(e) => onEmailChange(e.target.value)}
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
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
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
          {isLoading ? 'Signing in…' : 'Sign in'}
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

        {/* F-310.fe.verify — Forgot password link. Lands on /password-reset
            (request form when no token; confirm form when ?token= present). */}
        <p
          style={{
            marginTop: 16,
            fontSize: 13,
            lineHeight: '18px',
            color: INK_SOFT,
            textAlign: 'center',
          }}
        >
          <Link
            href="/password-reset"
            style={{
              color: INK_SOFT,
              fontWeight: 500,
              textDecoration: 'underline',
              textUnderlineOffset: 2,
            }}
          >
            Forgot password?
          </Link>
        </p>
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
        New to LeMethodic?{' '}
        <Link
          href="/onboarding"
          style={{
            color: INK,
            fontWeight: 600,
            textDecoration: 'underline',
          }}
        >
          Start your journey
        </Link>
      </p>
    </div>
  )
}
