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

// Auto-verify shim: renders a button that triggers onVerify on click.
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

// Prevent real auth store side-effects in unit tests.
vi.mock('@/lib/auth', () => ({
  useAuthStore: {
    getState: () => ({ setAuth: vi.fn() }),
  },
}))

import SignupForm from '@/components/auth/SignupForm'
import { ApiError } from '@/lib/api'

function fillValid() {
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'user@example.com' },
  })
  fireEvent.change(screen.getByLabelText('Password', { exact: true }), {
    target: { value: 'password123' },
  })
  fireEvent.change(screen.getByLabelText('Confirm password'), {
    target: { value: 'password123' },
  })
}

describe('SignupForm — register wiring', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockRegister.mockClear()
  })

  it('submit remains disabled after valid fields until captcha verified', () => {
    render(<SignupForm />)
    fillValid()
    expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled()
  })

  it('submit enables after valid fields + captcha verify', () => {
    render(<SignupForm />)
    fillValid()
    fireEvent.click(screen.getByTestId('hcaptcha-mock'))
    expect(screen.getByRole('button', { name: /create account/i })).not.toBeDisabled()
  })

  it('calls api.auth.register with email, password, fullName=undefined, captchaToken', async () => {
    mockRegister.mockResolvedValueOnce({
      token: 'tok',
      user: { id: 1, email: 'user@example.com', fullName: '' },
    })
    render(<SignupForm />)
    fillValid()
    fireEvent.click(screen.getByTestId('hcaptcha-mock'))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    })
    expect(mockRegister).toHaveBeenCalledWith(
      'user@example.com',
      'password123',
      undefined,
      'test-token',
    )
  })

  it('navigates to /onboarding on success', async () => {
    mockRegister.mockResolvedValueOnce({
      token: 'tok',
      user: { id: 1, email: 'user@example.com', fullName: '' },
    })
    render(<SignupForm />)
    fillValid()
    fireEvent.click(screen.getByTestId('hcaptcha-mock'))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    })
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/onboarding'))
  })

  it('shows "Email already registered." on 409', async () => {
    mockRegister.mockRejectedValueOnce(new ApiError(409, 'conflict', null))
    render(<SignupForm />)
    fillValid()
    fireEvent.click(screen.getByTestId('hcaptcha-mock'))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    })
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Email already registered.'),
    )
  })

  it('shows a generic error on network failure', async () => {
    mockRegister.mockRejectedValueOnce(new Error('net'))
    render(<SignupForm />)
    fillValid()
    fireEvent.click(screen.getByTestId('hcaptcha-mock'))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    })
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
  })
})
