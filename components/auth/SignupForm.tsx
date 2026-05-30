'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { SANS_FONT } from '@/lib/typography'
import Wordmark from '@/components/Wordmark'
import FormField from './FormField'
import PasswordStrength from './PasswordStrength'
import { api, ApiError } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import { resolveHcaptchaSitekey } from '@/lib/hcaptcha'
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  formatTierLabel,
} from '@/lib/validation/signup'

interface SignupFormProps {
  tier?: string
}

export default function SignupForm({ tier }: SignupFormProps) {
  const router = useRouter()
  const captchaRef = useRef<HCaptcha>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [confirmTouched, setConfirmTouched] = useState(false)

  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  // E2E bypass: window.__HCAPTCHA_AUTO_VERIFY__ skips the captcha widget in
  // Playwright tests. Never set in production — real users always see the widget.
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as Window & { __HCAPTCHA_AUTO_VERIFY__?: boolean }).__HCAPTCHA_AUTO_VERIFY__) {
      setCaptchaToken('e2e-bypass-token')
    }
  }, [])

  const emailError = validateEmail(email)
  const passwordError = validatePassword(password)
  const confirmError = validateConfirmPassword(password, confirmPassword)
  const hasFormErrors = !!(emailError || passwordError || confirmError)
  const disabled = hasFormErrors || !captchaToken || loading

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (disabled) return
    setLoading(true)
    setServerError(null)
    try {
      const { token, user } = await api.auth.register(
        email,
        password,
        undefined,
        captchaToken,
      )
      useAuthStore.getState().setAuth(token, user)
      router.push('/onboarding')
    } catch (err) {
      captchaRef.current?.resetCaptcha()
      setCaptchaToken(null)
      if (err instanceof ApiError) {
        setServerError(
          err.status === 409
            ? 'Email already registered.'
            : 'Something went wrong. Try again.',
        )
      } else {
        setServerError("Can't reach the server. Check your connection.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: 'var(--bg-canvas)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(40px, 8vw, 80px) clamp(24px, 5vw, 40px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          backgroundColor: 'var(--lm-bg-surface)',
          border: '1px solid var(--lm-border-subtle)',
          borderRadius: 8,
          padding: 'clamp(32px, 4vw, 48px) clamp(24px, 3vw, 40px)',
        }}
      >
        {/* Wordmark */}
        <div style={{ marginBottom: 24 }}>
          <Wordmark size="nav" />
        </div>

        {/* Tier label */}
        {tier && (
          <p
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent-primary)',
              margin: 0,
              marginBottom: 12,
            }}
          >
            Signing up for: {formatTierLabel(tier)}
          </p>
        )}

        <h1
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 600,
            fontSize: 'clamp(1.375rem, 2.5vw, 1.75rem)',
            lineHeight: 1.15,
            letterSpacing: '-0.015em',
            color: 'var(--text-primary)',
            margin: 0,
            marginBottom: 28,
          }}
        >
          Create your account
        </h1>

        <form
          onSubmit={handleSubmit}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <FormField
            label="Email"
            id="email"
            type="email"
            value={email}
            autoComplete="email"
            onChange={setEmail}
            onBlur={() => setEmailTouched(true)}
            error={emailTouched ? emailError : null}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <FormField
              label="Password"
              id="password"
              type="password"
              value={password}
              autoComplete="new-password"
              onChange={setPassword}
              onBlur={() => setPasswordTouched(true)}
              error={passwordTouched ? passwordError : null}
            />
            <PasswordStrength password={password} />
          </div>

          <FormField
            label="Confirm password"
            id="confirm-password"
            type="password"
            value={confirmPassword}
            autoComplete="new-password"
            onChange={setConfirmPassword}
            onBlur={() => setConfirmTouched(true)}
            error={confirmTouched ? confirmError : null}
          />

          {/* Only render the real widget when the e2e bypass is not active */}
          {!captchaToken && (
            <HCaptcha
              ref={captchaRef}
              sitekey={resolveHcaptchaSitekey()}
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
            />
          )}

          {serverError && (
            <p
              role="alert"
              style={{
                color: 'var(--lm-error)',
                fontSize: '0.875rem',
                margin: 0,
                fontFamily: SANS_FONT,
              }}
            >
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={disabled}
            aria-busy={loading}
            style={{
              marginTop: 8,
              width: '100%',
              height: 52,
              backgroundColor: disabled ? 'var(--rule-default)' : 'var(--cta-primary)',
              color: disabled ? 'var(--text-muted)' : 'hsl(0 0% 100%)',
              borderRadius: 4,
              border: 'none',
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: '0.9375rem',
              cursor: disabled ? 'not-allowed' : 'pointer',
              letterSpacing: '0.01em',
            }}
          >
            {loading ? (
              <span
                data-testid="signup-spinner"
                className="signup-spinner"
                aria-label="Creating account"
              />
            ) : (
              'Create account'
            )}
          </button>
        </form>
      </div>

      <p
        style={{
          marginTop: 24,
          fontFamily: SANS_FONT,
          fontWeight: 400,
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}
      >
        Already have an account?{' '}
        <Link
          href="/login"
          style={{
            color: 'var(--cta-primary)',
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
