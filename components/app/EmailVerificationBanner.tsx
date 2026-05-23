'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/auth'
import { SANS_FONT } from '@/lib/typography'

export default function EmailVerificationBanner() {
  const user = useAuthStore((s) => s.user)
  const [dismissed, setDismissed] = useState(false)

  // Only show when emailVerified is explicitly false (not undefined).
  // undefined = stripped login/register shape that doesn't include the field.
  if (!user || user.emailVerified !== false || dismissed) return null

  return (
    <div
      data-testid="email-verification-banner"
      role="alert"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--rule-default)',
        padding: '10px clamp(16px, 3vw, 32px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        fontFamily: SANS_FONT,
        fontSize: '0.875rem',
        color: 'var(--text-primary)',
      }}
    >
      <span>
        Please verify your email address to unlock all features.{' '}
        <a
          href="/verify-email"
          style={{ color: 'var(--cta-primary)', textDecoration: 'underline' }}
        >
          Resend verification email
        </a>
      </span>
      <button
        type="button"
        aria-label="Dismiss email verification banner"
        onClick={() => setDismissed(true)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 4,
          color: 'var(--text-muted)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          borderRadius: 4,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
          <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M3 3l10 10M13 3L3 13" />
        </svg>
      </button>
    </div>
  )
}
