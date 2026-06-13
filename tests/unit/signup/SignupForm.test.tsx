import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockPush = vi.fn()
const mockRegister = vi.fn()

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

vi.mock('@hcaptcha/react-hcaptcha', () => ({
  default: vi.fn(({ onVerify }: { onVerify: (token: string) => void }) => (
    <button type="button" data-testid="hcaptcha-mock" onClick={() => onVerify('test-token')}>
      Verify Captcha
    </button>
  )),
}))

vi.mock('@/lib/api', () => {
  class ApiError extends Error {
    status: number
    constructor(status: number, message: string, _body?: unknown) {
      super(message)
      this.name = 'ApiError'
      this.status = status
    }
  }
  return {
    api: {
      auth: {
        register: (...args: unknown[]) => mockRegister(...args),
      },
    },
    ApiError,
  }
})

vi.mock('@/lib/auth', () => ({
  useAuthStore: {
    getState: () => ({ setAuth: vi.fn() }),
  },
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
    mockRegister.mockClear()
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

  it('Submit button is disabled after valid fields — captcha still required', () => {
    render(<SignupForm />)
    fillValid()
    expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled()
  })

  it('Submit button enables after valid fields AND captcha verified', () => {
    render(<SignupForm />)
    fillValid()
    fireEvent.click(screen.getByTestId('hcaptcha-mock'))
    expect(screen.getByRole('button', { name: /create account/i })).not.toBeDisabled()
  })

  it('renders "Sign in" link pointing to /connexion', () => {
    render(<SignupForm />)
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/connexion')
  })

  it('shows "Signing up for: Daily Bundle" when tier="daily-bundle"', () => {
    render(<SignupForm tier="daily-bundle" />)
    expect(screen.getByText(/signing up for: daily bundle/i)).toBeInTheDocument()
  })

  it('shows "Signing up for: Pro" when tier="pro"', () => {
    render(<SignupForm tier="pro" />)
    expect(screen.getByText(/signing up for: pro/i)).toBeInTheDocument()
  })

  it('navigates to /bienvenue after valid submit', async () => {
    mockRegister.mockResolvedValueOnce({
      token: 'tok',
      user: { id: 1, email: 'test@example.com', fullName: '' },
    })
    render(<SignupForm />)
    fillValid()
    fireEvent.click(screen.getByTestId('hcaptcha-mock'))

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    })

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/bienvenue'))
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
      (s) => s.dataset.filled === 'true',
    )
    expect(filled).toHaveLength(1)
  })

  it('PasswordStrength shows 2 filled segments at password length 6', () => {
    render(<SignupForm />)
    fireEvent.change(screen.getByLabelText('Password', { exact: true }), {
      target: { value: 'abcdef' },
    })
    const filled = screen.getAllByTestId('strength-segment').filter(
      (s) => s.dataset.filled === 'true',
    )
    expect(filled).toHaveLength(2)
  })

  it('PasswordStrength shows 3 filled segments at password length 9', () => {
    render(<SignupForm />)
    fireEvent.change(screen.getByLabelText('Password', { exact: true }), {
      target: { value: 'abcdefghi' },
    })
    const filled = screen.getAllByTestId('strength-segment').filter(
      (s) => s.dataset.filled === 'true',
    )
    expect(filled).toHaveLength(3)
  })

  it('spinner element appears in button during submit loading', async () => {
    // Never resolves so we can observe the in-flight loading state.
    mockRegister.mockReturnValueOnce(new Promise(() => {}))
    render(<SignupForm />)
    fillValid()
    fireEvent.click(screen.getByTestId('hcaptcha-mock'))

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    })

    expect(screen.getByTestId('signup-spinner')).toBeInTheDocument()
  })
})
