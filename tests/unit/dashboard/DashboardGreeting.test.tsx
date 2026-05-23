import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { User } from '@/lib/types'

// Module-level stub updated per-test; the mock factory closes over it.
let currentUser: User | null = null

vi.mock('@/lib/auth', () => ({
  useAuthStore: (selector: (s: { user: User | null }) => unknown) =>
    selector({ user: currentUser }),
}))

import DashboardGreeting from '@/components/dashboard/DashboardGreeting'

const baseUser: User = {
  id: 1,
  email: 'marie@example.com',
  fullName: 'Marie Tremblay',
  isAdmin: false,
  emailVerified: true,
}

describe('DashboardGreeting', () => {
  beforeEach(() => {
    currentUser = null
  })

  it('renders "Bonjour" without a comma when user is null', () => {
    render(<DashboardGreeting />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Bonjour')
    expect(heading.textContent).not.toContain(',')
  })

  it('renders "Bonjour, Marie" when user.fullName is "Marie Tremblay"', () => {
    currentUser = baseUser
    render(<DashboardGreeting />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Bonjour, Marie')
  })

  it('falls back to email prefix when fullName is null', () => {
    currentUser = { ...baseUser, fullName: null }
    render(<DashboardGreeting />)
    // email is marie@example.com → prefix is "marie"
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Bonjour, marie')
  })

  it("renders today's date in French long format", () => {
    render(<DashboardGreeting />)
    const expected = new Intl.DateTimeFormat('fr-CA', { dateStyle: 'full' }).format(new Date())
    expect(screen.getByTestId('dashboard-today')).toHaveTextContent(expected)
  })

  it('shows currentLevel badge when set', () => {
    currentUser = { ...baseUser, currentLevel: 'B2' }
    render(<DashboardGreeting />)
    expect(screen.getByTestId('dashboard-level-badge')).toHaveTextContent('B2')
  })

  it('falls back to targetLevel badge when currentLevel is null', () => {
    currentUser = { ...baseUser, currentLevel: null, targetLevel: 'C1' }
    render(<DashboardGreeting />)
    expect(screen.getByTestId('dashboard-level-badge')).toHaveTextContent('C1')
  })

  it('shows no level badge when both currentLevel and targetLevel are null', () => {
    currentUser = { ...baseUser, currentLevel: null, targetLevel: null }
    render(<DashboardGreeting />)
    expect(screen.queryByTestId('dashboard-level-badge')).not.toBeInTheDocument()
  })

  it('shows no level badge when user is null', () => {
    render(<DashboardGreeting />)
    expect(screen.queryByTestId('dashboard-level-badge')).not.toBeInTheDocument()
  })
})
