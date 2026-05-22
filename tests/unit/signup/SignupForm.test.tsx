import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

import SignupForm from '@/components/auth/SignupForm'

function fillValid() {
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'test@example.com' },
  })
  fireEvent.change(screen.getByLabelText('Password', { exact: true }), {
    target: { value: 'password123' },
  })
  fireEvent.change(screen.getByLabelText('Confirm password'), {
    target: { value: 'password123' },
  })
}

describe('SignupForm', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders email, password, and confirm-password fields', () => {
    render(<SignupForm />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password', { exact: true })).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument()
  })

  it('Submit button is disabled on empty form', () => {
    render(<SignupForm />)
    expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled()
  })

  it('shows "Email is required." when email field blurred empty', () => {
    render(<SignupForm />)
    fireEvent.blur(screen.getByLabelText('Email'))
    expect(screen.getByText('Email is required.')).toBeInTheDocument()
  })

  it('shows "Password must be at least 8 characters." for short password', () => {
    render(<SignupForm />)
    fireEvent.change(screen.getByLabelText('Password', { exact: true }), {
      target: { value: 'short' },
    })
    fireEvent.blur(screen.getByLabelText('Password', { exact: true }))
    expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument()
  })

  it("shows \"Passwords don't match.\" when confirm differs", () => {
    render(<SignupForm />)
    fireEvent.change(screen.getByLabelText('Password', { exact: true }), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByLabelText('Confirm password'), {
      target: { value: 'different' },
    })
    fireEvent.blur(screen.getByLabelText('Confirm password'))
    expect(screen.getByText("Passwords don't match.")).toBeInTheDocument()
  })

  it('Submit button is enabled when all fields are valid', () => {
    render(<SignupForm />)
    fillValid()
    expect(screen.getByRole('button', { name: /create account/i })).not.toBeDisabled()
  })

  it('renders "Sign in" link pointing to /login', () => {
    render(<SignupForm />)
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login')
  })

  it('shows "Signing up for: Daily Bundle" when tier="daily-bundle"', () => {
    render(<SignupForm tier="daily-bundle" />)
    expect(screen.getByText(/signing up for: daily bundle/i)).toBeInTheDocument()
  })

  it('shows "Signing up for: Pro" when tier="pro"', () => {
    render(<SignupForm tier="pro" />)
    expect(screen.getByText(/signing up for: pro/i)).toBeInTheDocument()
  })

  it('navigates to /onboarding after valid submit', async () => {
    vi.useFakeTimers()
    render(<SignupForm />)
    fillValid()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))
      await vi.runAllTimersAsync()
    })

    expect(mockPush).toHaveBeenCalledWith('/onboarding')
    vi.useRealTimers()
  })

  // MOCK-005 — ed-field, PasswordStrength, spinner
  it('all inputs have ed-field class', () => {
    render(<SignupForm />)
    expect(screen.getByLabelText('Email')).toHaveClass('ed-field')
    expect(screen.getByLabelText('Password', { exact: true })).toHaveClass('ed-field')
    expect(screen.getByLabelText('Confirm password')).toHaveClass('ed-field')
  })

  it('PasswordStrength shows 1 filled segment at password length 3', () => {
    render(<SignupForm />)
    fireEvent.change(screen.getByLabelText('Password', { exact: true }), {
      target: { value: 'abc' },
    })
    const filled = screen.getAllByTestId('strength-segment').filter(
      (s) => s.dataset.filled === 'true'
    )
    expect(filled).toHaveLength(1)
  })

  it('PasswordStrength shows 2 filled segments at password length 6', () => {
    render(<SignupForm />)
    fireEvent.change(screen.getByLabelText('Password', { exact: true }), {
      target: { value: 'abcdef' },
    })
    const filled = screen.getAllByTestId('strength-segment').filter(
      (s) => s.dataset.filled === 'true'
    )
    expect(filled).toHaveLength(2)
  })

  it('PasswordStrength shows 3 filled segments at password length 9', () => {
    render(<SignupForm />)
    fireEvent.change(screen.getByLabelText('Password', { exact: true }), {
      target: { value: 'abcdefghi' },
    })
    const filled = screen.getAllByTestId('strength-segment').filter(
      (s) => s.dataset.filled === 'true'
    )
    expect(filled).toHaveLength(3)
  })

  it('spinner element appears in button during submit loading', async () => {
    vi.useFakeTimers()
    render(<SignupForm />)
    fillValid()

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    })

    expect(screen.getByTestId('signup-spinner')).toBeInTheDocument()

    await act(async () => {
      await vi.runAllTimersAsync()
    })
    vi.useRealTimers()
  })
})
