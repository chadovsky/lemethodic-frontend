'use client'

// F-310.fe.reset — /password-reset.
//
// Single route, branches on the presence of `?token=`:
//   /password-reset             → request form (email + hCaptcha)
//                                 → POST /api/auth/password-reset/request
//   /password-reset?token=XXX   → confirm form (new password)
//                                 → POST /api/auth/password-reset/confirm
//
// Per the F-310 BE design, the request endpoint always returns 200
// regardless of whether the email exists (anti-enumeration). The FE
// shows a generic "If that email is on file, you'll receive a link"
// message on success.

import { Suspense, useState, type KeyboardEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { api, ApiError } from '@/lib/api'
import { resolveHcaptchaSitekey } from '@/lib/hcaptcha'

const HCaptcha = dynamic(() => import('@hcaptcha/react-hcaptcha'), {
  ssr: false,
})

const BG = 'var(--lm-bg-base)'
const SANS = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'
const SERIF = 'var(--font-source-serif), Georgia, serif'

function PasswordResetInner() {
  const params = useSearchParams()
  const token = params.get('token')

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-5 ed-page-enter"
      style={{ backgroundColor: BG }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          backgroundColor: 'var(--lm-bg-surface)',
          border: '1px solid var(--lm-border-subtle)',
          borderRadius: 4,
          padding: 'clamp(32px, 4vw, 48px) clamp(28px, 3vw, 40px)',
        }}
      >
        <p
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 12,
            color: 'var(--lm-text-tertiary)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          LeMethodic
        </p>

        {token ? <ConfirmForm token={token} /> : <RequestForm />}
      </div>

      <p
        style={{
          marginTop: 28,
          fontFamily: SANS,
          fontWeight: 400,
          fontSize: 14,
          lineHeight: 1.5,
          color: 'var(--lm-text-tertiary)',
          textAlign: 'center',
        }}
      >
        Remember it now?{' '}
        <Link
          href="/login"
          style={{
            color: 'var(--lm-text-primary)',
            fontWeight: 600,
            textDecoration: 'underline',
            textUnderlineOffset: 2,
          }}
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}

// ── Request form (no token) ───────────────────────────────────────────────

function RequestForm() {
  const [email, setEmail] = useState('')
  const [hcaptchaToken, setHcaptchaToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const sitekey = resolveHcaptchaSitekey()

  function validate(): string | null {
    const trimmed = email.trim()
    const at = trimmed.indexOf('@')
    const hasLocal = at > 0
    const hasDomain = at >= 0 && trimmed.slice(at + 1).length > 0
    if (!hasLocal || !hasDomain) return 'Enter a valid email'
    return null
  }

  async function handleSubmit() {
    if (isLoading || sent) return
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      await api.auth.passwordResetRequest(email.trim(), hcaptchaToken)
      setSent(true)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 429
            ? 'Too many attempts. Try again in a minute.'
            : "Couldn't send. Try again in a moment."
          : "Can't reach the server. Check your connection.",
      )
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

  if (sent) {
    return (
      <>
        <Heading>Check your inbox.</Heading>
        <Subtext>
          If that email is on file, you&rsquo;ll receive a link to reset your password
          shortly. The link expires in 30 minutes.
        </Subtext>
      </>
    )
  }

  return (
    <>
      <Heading>Reset your password.</Heading>
      <Subtext>Enter your email and we&rsquo;ll send you a reset link.</Subtext>

      <div className="flex flex-col gap-2" style={{ marginTop: 24 }}>
        <label
          htmlFor="email"
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 12,
            color: 'var(--lm-text-tertiary)',
            letterSpacing: '0.08em',
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
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) setError(null)
          }}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          style={fieldStyle}
        />
      </div>

      <div style={{ marginTop: 20, minHeight: 78 }}>
        <HCaptcha
          sitekey={sitekey}
          onVerify={(t) => setHcaptchaToken(t)}
          onExpire={() => setHcaptchaToken(null)}
          onError={() => setHcaptchaToken(null)}
          theme="light"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading}
        aria-busy={isLoading}
        style={{
          marginTop: 20,
          width: '100%',
          height: 56,
          backgroundColor: isLoading ? 'var(--lm-border-subtle)' : 'var(--cta-utility)',
          color: isLoading ? 'var(--lm-text-tertiary)' : 'hsl(0 0% 100%)',
          borderRadius: 4,
          border: 'none',
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 15,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          outline: 'none',
          transition: 'background-color var(--lm-duration-hover) var(--lm-ease-spring)',
        }}
      >
        {isLoading ? 'Sending…' : 'Send reset link'}
      </button>

      {error && <InlineError message={error} />}
    </>
  )
}

// ── Confirm form (with token) ─────────────────────────────────────────────

function ConfirmForm({ token }: { token: string }) {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  function validate(): string | null {
    if (newPassword.length < 8) return 'Password must be at least 8 characters'
    if (newPassword !== confirmPassword) return "Passwords don't match"
    return null
  }

  async function handleSubmit() {
    if (isLoading || done) return
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      await api.auth.passwordResetConfirm(token, newPassword)
      setDone(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 400 || err.status === 422
            ? 'This reset link is invalid or has expired. Request a new one.'
            : "Couldn't reset. Try again in a moment."
          : "Can't reach the server. Check your connection.",
      )
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

  if (done) {
    return (
      <>
        <Heading>Password updated.</Heading>
        <Subtext>Redirecting you to sign in…</Subtext>
      </>
    )
  }

  return (
    <>
      <Heading>Set a new password.</Heading>
      <Subtext>Choose at least 8 characters.</Subtext>

      <div className="flex flex-col gap-2" style={{ marginTop: 24 }}>
        <label htmlFor="newPassword" style={labelStyle}>
          New password
        </label>
        <input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value)
            if (error) setError(null)
          }}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          style={fieldStyle}
        />
      </div>

      <div className="flex flex-col gap-2" style={{ marginTop: 16 }}>
        <label htmlFor="confirmPassword" style={labelStyle}>
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            if (error) setError(null)
          }}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          style={fieldStyle}
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading}
        aria-busy={isLoading}
        style={{
          marginTop: 28,
          width: '100%',
          height: 56,
          backgroundColor: isLoading ? 'var(--lm-border-subtle)' : 'var(--cta-utility)',
          color: isLoading ? 'var(--lm-text-tertiary)' : 'hsl(0 0% 100%)',
          borderRadius: 4,
          border: 'none',
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 15,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          outline: 'none',
          transition: 'background-color var(--lm-duration-hover) var(--lm-ease-spring)',
        }}
      >
        {isLoading ? 'Updating…' : 'Update password'}
      </button>

      {error && <InlineError message={error} />}
    </>
  )
}

// ── Shared primitives ─────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontFamily: SANS,
  fontWeight: 600,
  fontSize: 12,
  color: 'var(--lm-text-tertiary)',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
}

const fieldStyle: React.CSSProperties = {
  height: 56,
  borderRadius: 4,
  border: '1px solid var(--lm-border-subtle)',
  backgroundColor: 'var(--lm-bg-surface)',
  padding: '0 18px',
  fontFamily: SANS,
  fontWeight: 400,
  fontSize: 15,
  color: 'var(--lm-text-primary)',
  width: '100%',
  outline: 'none',
  transition: 'border-color var(--lm-duration-hover) var(--lm-ease-spring)',
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h1
      style={{
        fontFamily: SERIF,
        fontStyle: 'italic',
        fontWeight: 400,
        fontSize: 'clamp(28px, 3.6vw, 36px)',
        lineHeight: 1.15,
        color: 'var(--lm-text-primary)',
        letterSpacing: '-0.015em',
        margin: 0,
        marginBottom: 12,
      }}
    >
      {children}
    </h1>
  )
}

function Subtext({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: SANS,
        fontWeight: 400,
        fontSize: 15,
        lineHeight: 1.6,
        color: 'var(--lm-text-tertiary)',
        margin: 0,
      }}
    >
      {children}
    </p>
  )
}

function InlineError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      style={{
        marginTop: 14,
        fontFamily: SANS,
        fontWeight: 500,
        fontSize: 13,
        color: 'var(--lm-error)',
        textAlign: 'center',
      }}
    >
      {message}
    </p>
  )
}

export default function PasswordResetPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full" style={{ backgroundColor: BG }} />
      }
    >
      <PasswordResetInner />
    </Suspense>
  )
}
