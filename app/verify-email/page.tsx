'use client'

// F-310.fe.verify — /verify-email landing.
//
// Two flows on the same route:
//   /verify-email                — empty state: "Check your inbox" + Resend
//   /verify-email?token=XXX      — auto-confirm the token; show success/error
//
// Resend requires an authenticated session (BE: Authorization header).
// Users land here right after register so the access token is fresh.

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api, ApiError } from '@/lib/api'
import Wordmark from '@/components/Wordmark'

const BG = 'var(--lm-bg-base)'
const SANS = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'
const SERIF = 'var(--font-source-serif), Georgia, serif'

type ConfirmState =
  | { kind: 'idle' }
  | { kind: 'confirming' }
  | { kind: 'confirmed' }
  | { kind: 'failed'; message: string }

// F-310.fe.coldreload — validate the ?next= param. The interceptor in
// lib/api.ts writes it as the user's pre-redirect path + search. Only
// honor same-origin local paths to close open-redirect (//evil.com),
// protocol-absolute (https://…), and self-loop (back to /verify-email)
// variants. Anything else falls back to /login — matches pre-ticket
// behavior, so the change can only ADD a useful redirect, never break
// the existing path.
function safeNextPath(raw: string | null): string {
  if (!raw) return '/connexion'
  let decoded: string
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    return '/connexion'
  }
  if (!decoded.startsWith('/')) return '/connexion'
  if (decoded.startsWith('//')) return '/connexion'
  if (decoded.includes('://')) return '/connexion'
  if (decoded.startsWith('/verify-email')) return '/connexion'
  return decoded
}

function VerifyEmailInner() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token')
  const nextParam = params.get('next')

  const [confirmState, setConfirmState] = useState<ConfirmState>({ kind: 'idle' })
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [resendError, setResendError] = useState<string | null>(null)

  const confirmToken = useCallback(async (tok: string) => {
    setConfirmState({ kind: 'confirming' })
    try {
      await api.auth.verifyEmail(tok)
      setConfirmState({ kind: 'confirmed' })
      // Give the user 2s to read the success state, then route to the
      // captured ?next= (validated as a same-origin path) or fall back
      // to /login. The cold-link click (BE email URL has no ?next=)
      // continues to land on /login as before.
      const target = safeNextPath(nextParam)
      const timer = setTimeout(() => {
        router.push(target)
      }, 2000)
      return () => clearTimeout(timer)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.status === 400 || err.status === 422
            ? 'This verification link is invalid or has expired. Request a new one below.'
            : `Couldn't verify. Try again in a moment.${err.status ? ` (${err.status})` : ''}`
          : "Couldn't reach the server. Check your connection."
      setConfirmState({ kind: 'failed', message })
    }
  }, [router, nextParam])

  useEffect(() => {
    if (token && confirmState.kind === 'idle') {
      confirmToken(token)
    }
  }, [token, confirmState.kind, confirmToken])

  async function handleResend() {
    if (resendState === 'sending') return
    setResendState('sending')
    setResendError(null)
    try {
      await api.auth.resendVerification()
      setResendState('sent')
    } catch (err) {
      setResendState('error')
      setResendError(
        err instanceof ApiError && err.status === 401
          ? 'Sign in first, then resend from the verification screen.'
          : "Couldn't resend. Try again in a moment.",
      )
    }
  }

  const isConfirmFlow = !!token

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
        <div style={{ marginBottom: 24 }}>
          <Wordmark size="nav" />
        </div>

        {isConfirmFlow ? (
          <ConfirmFlow state={confirmState} />
        ) : (
          <EmptyState
            resendState={resendState}
            resendError={resendError}
            onResend={handleResend}
          />
        )}
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
        Already verified?{' '}
        <Link
          href="/connexion"
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

function ConfirmFlow({ state }: { state: ConfirmState }) {
  if (state.kind === 'confirming') {
    return (
      <>
        <Heading>Confirming your email…</Heading>
        <Subtext>Hold tight, this only takes a moment.</Subtext>
      </>
    )
  }
  if (state.kind === 'confirmed') {
    return (
      <>
        <Heading>Email verified.</Heading>
        <Subtext>Redirecting you to sign in…</Subtext>
      </>
    )
  }
  if (state.kind === 'failed') {
    return (
      <>
        <Heading>We couldn&rsquo;t verify that link.</Heading>
        <Subtext>{state.message}</Subtext>
        <p
          style={{
            fontFamily: SANS,
            fontSize: 14,
            color: 'var(--lm-text-secondary)',
            marginTop: 20,
            lineHeight: 1.6,
          }}
        >
          Open the most recent email and tap the link again, or request a fresh one
          after signing in.
        </p>
      </>
    )
  }
  return (
    <>
      <Heading>Verifying…</Heading>
    </>
  )
}

interface EmptyStateProps {
  resendState: 'idle' | 'sending' | 'sent' | 'error'
  resendError: string | null
  onResend: () => void
}

function EmptyState({ resendState, resendError, onResend }: EmptyStateProps) {
  return (
    <>
      <Heading>Check your inbox.</Heading>
      <Subtext>
        We sent you a verification link. Open it from your email to activate the account.
      </Subtext>
      <p
        style={{
          fontFamily: SANS,
          fontSize: 14,
          color: 'var(--lm-text-secondary)',
          marginTop: 20,
          lineHeight: 1.6,
        }}
      >
        Didn&rsquo;t get it? Check spam, or resend below.
      </p>
      <button
        type="button"
        onClick={onResend}
        disabled={resendState === 'sending' || resendState === 'sent'}
        aria-busy={resendState === 'sending'}
        style={{
          marginTop: 20,
          width: '100%',
          height: 56,
          backgroundColor:
            resendState === 'sending' || resendState === 'sent'
              ? 'var(--lm-border-subtle)'
              : 'var(--cta-utility)',
          color:
            resendState === 'sending' || resendState === 'sent'
              ? 'var(--lm-text-tertiary)'
              : '#FFFFFF',
          borderRadius: 4,
          border: 'none',
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 15,
          cursor: resendState === 'sending' || resendState === 'sent' ? 'not-allowed' : 'pointer',
          outline: 'none',
          transition: 'background-color var(--lm-duration-hover) var(--lm-ease-spring)',
        }}
      >
        {resendState === 'sending'
          ? 'Sending…'
          : resendState === 'sent'
            ? 'Sent. Check your inbox'
            : 'Resend verification email'}
      </button>
      {resendState === 'error' && resendError && (
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
          {resendError}
        </p>
      )}
    </>
  )
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h1
      style={{
        fontFamily: SERIF,
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

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full" style={{ backgroundColor: BG }} />
      }
    >
      <VerifyEmailInner />
    </Suspense>
  )
}
