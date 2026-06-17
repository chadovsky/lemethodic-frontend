import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// F-474 — the auth-gate loader frame must use the destination canvas token
// (var(--bg-canvas), #EAEFF3) so it doesn't flash peach before the app surface
// paints. It must also stay content-free (no header/shell/branding) until the
// user is hydrated + verified.

const replace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}))

// useVerifyAuth is a no-op for this render; we only exercise the loader state.
vi.mock('@/hooks/useVerifyAuth', () => ({
  useVerifyAuth: () => {},
}))

const hydrate = vi.fn()
vi.mock('@/lib/auth', () => ({
  useAuthStore: Object.assign(
    // Unhydrated, no token, not verified → the loader frame renders.
    (selector: (s: { token: null; hydrated: boolean; verified: boolean }) => unknown) =>
      selector({ token: null, hydrated: false, verified: false }),
    { getState: () => ({ hydrate }) },
  ),
}))

import ProtectedRoute from '@/components/auth/ProtectedRoute'

describe('ProtectedRoute loader frame (F-474)', () => {
  it('renders a content-free loader using the destination canvas token', () => {
    const { container, queryByTestId } = render(
      <ProtectedRoute>
        <div data-testid="protected-child">secret</div>
      </ProtectedRoute>,
    )

    // Children must not render until hydrated + verified.
    expect(queryByTestId('protected-child')).not.toBeInTheDocument()

    const frame = container.firstChild as HTMLElement
    expect(frame).toBeInTheDocument()
    // Content-free: no descendants (no header, shell, or branded loader).
    expect(frame.children).toHaveLength(0)
    // Canvas token, not peach.
    expect(frame.getAttribute('style') ?? '').toContain('var(--bg-canvas)')
    expect(frame.getAttribute('style') ?? '').not.toContain('peach')
  })
})
