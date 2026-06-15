import { render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

// Dates are computed in vi.hoisted so the hoisted vi.mock factories can read them.
const { FUTURE_DATE, TODAY, YESTERDAY } = vi.hoisted(() => ({
  FUTURE_DATE: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  TODAY: new Date().toISOString().slice(0, 10),
  YESTERDAY: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
}))

// Hydrated user: full name (greeting) + an exam date 30 days out (Examen card).
vi.mock('@/lib/auth', () => ({
  useAuthStore: (
    selector: (s: { user: { fullName: string; examDate: string }; hydrated: boolean }) => unknown,
  ) => selector({ user: { fullName: 'Marie Dupont', examDate: FUTURE_DATE }, hydrated: true }),
}))

vi.mock('@/lib/api', () => ({
  api: {
    users: {
      getProgress: vi.fn().mockResolvedValue({
        currentLevel: 'b1',
        maitreIntensity: 1,
        streakDays: 0,
        longestStreakDays: 0,
        streakLastActiveDate: null,
        productionMinutesTotal: 240,
        dailyTargetMinutes: 30,
        tacheAttempts: 0,
        lastCoucheSignals: {},
      }),
      patchProgress: vi.fn(),
      getActivityCalendar: vi.fn().mockResolvedValue({
        currentStreak: 3,
        longestStreak: 7,
        todayCount: 15,
        todayTarget: 30,
        days: [
          { date: YESTERDAY, count: 20, targetMet: false },
          { date: TODAY, count: 15, targetMet: false },
        ],
      }),
    },
  },
}))

import Dashboard from '@/components/dashboard/Dashboard'

beforeEach(() => {
  vi.clearAllMocks()
  window.localStorage.clear()
  // B1 journey, nothing completed -> current île = education (first theme).
  window.localStorage.setItem('lm.targetProfile.v1', JSON.stringify({ level: 'B1' }))
})

describe('Dashboard (F-464 three-zone)', () => {
  it('renders the "Bonjour, Marie" greeting', () => {
    render(<Dashboard />)
    expect(screen.getByRole('heading', { level: 1, name: /bonjour, marie/i })).toBeInTheDocument()
  })

  it('renders the three zones (main + complementary rail; nav is the shell)', () => {
    render(<Dashboard />)
    expect(screen.getByTestId('dashboard-zone-main')).toBeInTheDocument()
    const rail = screen.getByTestId('dashboard-zone-rail')
    expect(rail).toBeInTheDocument()
    expect(rail.tagName).toBe('ASIDE')
    expect(rail).toHaveAttribute('aria-label')
  })

  it('La Carte hero links to /carte and renders the current island art', async () => {
    render(<Dashboard />)
    const hero = screen.getByTestId('dashboard-carte-hero')
    await waitFor(() => {
      expect(within(hero).getByTestId('dashboard-carte-hero-art')).toHaveAttribute(
        'src',
        '/iles/island-education.png',
      )
    })
    const cta = screen.getByTestId('dashboard-carte-hero-cta')
    expect(cta).toHaveAttribute('href', '/carte')
  })

  it('renders all six metric cards', () => {
    render(<Dashboard />)
    for (const id of [
      'dashboard-metric-serie',
      'dashboard-metric-objectif',
      'dashboard-metric-production',
      'dashboard-metric-iles',
      'dashboard-metric-niveau',
      'dashboard-metric-examen',
    ]) {
      expect(screen.getByTestId(id)).toBeInTheDocument()
    }
  })

  it('wired cards show real data: streak 0, îles 0/7, niveau B1', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-metric-serie-value')).toHaveTextContent('0')
      expect(screen.getByTestId('dashboard-metric-iles-value')).toHaveTextContent('0')
      expect(screen.getByTestId('dashboard-metric-niveau-value')).toHaveTextContent('B1')
    })
  })

  it('Objectif card shows today vs target from the calendar (15 / 30 min)', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-metric-objectif-value')).toHaveTextContent('15')
    })
    expect(screen.getByTestId('dashboard-metric-objectif')).toHaveTextContent('/ 30 min')
    expect(screen.getByTestId('dashboard-metric-objectif-progress')).toBeInTheDocument()
  })

  it('Examen card shows a J- countdown when an exam date is set', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      const val = screen.getByTestId('dashboard-metric-examen-value')
      expect(Number(val.textContent)).toBeGreaterThan(0)
    })
  })

  it('metric cards use the F-463 tint tokens, not literal hex', () => {
    render(<Dashboard />)
    const serie = screen.getByTestId('dashboard-metric-serie')
    expect(serie).toHaveAttribute('data-tint', 'sage')
    expect(serie.style.background).toContain('var(--tint-sage)')
  })

  it('unwired Pièges stat renders a bientôt state (no fabricated number)', () => {
    render(<Dashboard />)
    const pieges = screen.getByTestId('dashboard-stat-pieges')
    expect(within(pieges).getByTestId('bientot-pill')).toBeInTheDocument()
    expect(screen.queryByTestId('dashboard-stat-pieges-value')).not.toBeInTheDocument()
  })

  it('right rail renders the activity calendar', () => {
    render(<Dashboard />)
    const rail = screen.getByTestId('dashboard-zone-rail')
    expect(within(rail).getByTestId('dashboard-widget-calendar')).toBeInTheDocument()
  })

  it('weekly chart renders when the calendar has >= 2 days', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-weekly-chart')).toBeInTheDocument()
    })
  })
})
