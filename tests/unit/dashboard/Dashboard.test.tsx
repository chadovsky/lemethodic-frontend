import { render, screen, within, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

// DashboardGreeting uses useAuthStore; provide a null-user stub so
// tests remain deterministic and show "Bonjour" (no name).
vi.mock('@/lib/auth', () => ({
  useAuthStore: (selector: (s: { user: null }) => unknown) => selector({ user: null }),
}))

import Dashboard from '@/components/dashboard/Dashboard'

describe('Dashboard', () => {
  it('renders the welcome heading "Bonjour"', () => {
    render(<Dashboard />)
    expect(
      screen.getByRole('heading', { level: 1, name: /bonjour/i }),
    ).toBeInTheDocument()
  })

  it("renders today's date in French long format", () => {
    render(<Dashboard />)
    const today = new Date()
    const expected = new Intl.DateTimeFormat('fr-CA', { dateStyle: 'full' }).format(today)
    expect(screen.getByTestId('dashboard-today')).toHaveTextContent(expected)
  })

  it('renders all 4 widget cards', () => {
    render(<Dashboard />)
    expect(
      screen.getByRole('heading', { level: 2, name: /progression/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /activité récente/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /prochaine leçon/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /score diagnostic/i }),
    ).toBeInTheDocument()
  })

  it('"Prochaine leçon" CTA links to /ecole/5', () => {
    render(<Dashboard />)
    const cta = screen.getByRole('link', { name: /reprendre/i })
    expect(cta).toHaveAttribute('href', '/ecole/5')
  })

  it('"Score Diagnostic" CTA links to /diagnostic', () => {
    render(<Dashboard />)
    const cta = screen.getByRole('link', { name: /voir le détail/i })
    expect(cta).toHaveAttribute('href', '/diagnostic')
  })

  it('Score Diagnostic widget shows the placeholder score C1', () => {
    render(<Dashboard />)
    expect(screen.getByTestId('diagnostic-score-value')).toHaveTextContent('C1')
  })

  // MOCK-007 — fixture-driven lesson title (lesson 5 from lib/data/lessons.ts)
  it('Prochaine leçon widget shows the fixture lesson title', () => {
    render(<Dashboard />)
    expect(
      screen.getByText(/leçon 5\s*:\s*le rythme de la phrase française/i),
    ).toBeInTheDocument()
  })

  // MOCK-007 — 5 activity rows
  it('renders 5 activity rows from fixture', () => {
    render(<Dashboard />)
    const list = screen.getByRole('list', { name: /activité récente/i })
    expect(within(list).getAllByRole('listitem')).toHaveLength(5)
  })

  // MOCK-007 — progress bar data-testids with settled widths
  it('ProgressWidget bars have correct data-testid and settled width for Le Fond', async () => {
    render(<Dashboard />)
    const bar = screen.getByTestId('progress-bar-le-fond')
    await waitFor(() => {
      expect(bar).toHaveStyle({ width: '80%' })
    })
  })
})
