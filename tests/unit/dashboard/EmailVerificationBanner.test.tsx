import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { User } from '@/lib/types'

let currentUser: User | null = null

vi.mock('@/lib/auth', () => ({
  useAuthStore: (selector: (s: { user: User | null }) => unknown) =>
    selector({ user: currentUser }),
}))

import EmailVerificationBanner from '@/components/app/EmailVerificationBanner'

const verifiedUser: User = {
  id: 1,
  email: 'marie@example.com',
  fullName: 'Marie Tremblay',
  isAdmin: false,
  emailVerified: true,
}

const unverifiedUser: User = { ...verifiedUser, emailVerified: false }

describe('EmailVerificationBanner', () => {
  beforeEach(() => {
    currentUser = null
  })

  it('does not render when user is null', () => {
    render(<EmailVerificationBanner />)
    expect(screen.queryByTestId('email-verification-banner')).not.toBeInTheDocument()
  })

  it('does not render when user.emailVerified is true', () => {
    currentUser = verifiedUser
    render(<EmailVerificationBanner />)
    expect(screen.queryByTestId('email-verification-banner')).not.toBeInTheDocument()
  })

  it('does not render when user.emailVerified is undefined', () => {
    currentUser = { ...verifiedUser, emailVerified: undefined }
    render(<EmailVerificationBanner />)
    expect(screen.queryByTestId('email-verification-banner')).not.toBeInTheDocument()
  })

  it('renders when user.emailVerified is false', () => {
    currentUser = unverifiedUser
    render(<EmailVerificationBanner />)
    expect(screen.getByTestId('email-verification-banner')).toBeInTheDocument()
  })

  it('contains a message about verifying email', () => {
    currentUser = unverifiedUser
    render(<EmailVerificationBanner />)
    expect(screen.getByTestId('email-verification-banner')).toHaveTextContent(/verify/i)
  })

  it('has role="alert" for screen-reader accessibility', () => {
    currentUser = unverifiedUser
    render(<EmailVerificationBanner />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('dismiss button hides the banner', () => {
    currentUser = unverifiedUser
    render(<EmailVerificationBanner />)
    expect(screen.getByTestId('email-verification-banner')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }))
    expect(screen.queryByTestId('email-verification-banner')).not.toBeInTheDocument()
  })
})
