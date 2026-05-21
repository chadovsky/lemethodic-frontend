'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'
import FormField from './FormField'
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

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [confirmTouched, setConfirmTouched] = useState(false)

  const [loading, setLoading] = useState(false)

  const emailError = validateEmail(email)
  const passwordError = validatePassword(password)
  const confirmError = validateConfirmPassword(password, confirmPassword)
  const hasErrors = !!(emailError || passwordError || confirmError)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (hasErrors || loading) return
    setLoading(true)
    await new Promise<void>((resolve) => setTimeout(resolve, 300))
    router.push('/onboarding')
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
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--rule-default)',
          borderRadius: 4,
          padding: 'clamp(32px, 4vw, 48px) clamp(24px, 3vw, 40px)',
        }}
      >
        {/* Wordmark */}
        <p
          style={{
            fontFamily: SERIF_FONT,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: '1.125rem',
            letterSpacing: '-0.01em',
            color: 'var(--text-primary)',
            margin: 0,
            marginBottom: 24,
          }}
        >
          Le Méthodic
        </p>

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

          <button
            type="submit"
            disabled={hasErrors || loading}
            aria-busy={loading}
            style={{
              marginTop: 8,
              width: '100%',
              height: 52,
              backgroundColor:
                hasErrors || loading ? 'var(--rule-default)' : 'var(--cta-primary)',
              color: hasErrors || loading ? 'var(--text-muted)' : '#ffffff',
              borderRadius: 4,
              border: 'none',
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: '0.9375rem',
              cursor: hasErrors || loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.01em',
            }}
          >
            {loading ? 'Creating account…' : 'Create account'}
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
            color: 'var(--text-primary)',
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
