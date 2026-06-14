import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

// Stub useAuthStore: hydrated user with an exam date 30 days from now
const FUTURE_DATE = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
vi.mock('@/lib/auth', () => ({
  useAuthStore: (selector: (s: { user: { examDate: string }; hydrated: boolean }) => unknown) =>
    selector({ user: { examDate: FUTURE_DATE }, hydrated: true }),
}))

// Stub api: recordings returns empty list; lessons returns one unlocked lesson;
// users.getProgress returns a progress object with streak_days=0, daily_target_minutes=30
vi.mock('@/lib/api', () => ({
  api: {
    recordings: {
      list: vi.fn().mockResolvedValue([]),
    },
    lessons: {
      list: vi.fn().mockResolvedValue([
        {
          id: 1,
          lessonNumber: 3,
          code: 'L003',
          title: 'Le rythme de la phrase',
          shortDescription: '',
          status: 'unlocked',
          quizAttempts: 0,
          quizBestScore: null,
          completedAt: null,
          phase: 1,
          sublineEn: null,
        },
      ]),
    },
    users: {
      getProgress: vi.fn().mockResolvedValue({
        currentLevel: 'b1',
        maitreIntensity: 1,
        streakDays: 0,
        longestStreakDays: 0,
        streakLastActiveDate: null,
        productionMinutesTotal: 0,
        dailyTargetMinutes: 30,
        tacheAttempts: 0,
        lastCoucheSignals: {},
      }),
      patchProgress: vi.fn(),
      // F-444 — activity calendar mock
      getActivityCalendar: vi.fn().mockResolvedValue({
        currentStreak: 3,
        longestStreak: 7,
        todayCount: 15,
        todayTarget: 30,
        days: [],
      }),
    },
  },
}))

import Dashboard from '@/components/dashboard/Dashboard'

beforeEach(() => {
  vi.clearAllMocks()
})

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

  // F-453 — heatmap CalendarWidget removed; 4 widget headings remain.
  it('renders all 4 widget headings', () => {
    render(<Dashboard />)
    expect(
      screen.getByRole('heading', { level: 2, name: /compte à rebours/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /série active/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /objectif du jour/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /prochaine leçon/i }),
    ).toBeInTheDocument()
  })

  // F-453 — the heatmap activity widget is gone from the dashboard.
  it('no longer renders the activity heatmap heading', () => {
    render(<Dashboard />)
    expect(
      screen.queryByRole('heading', { level: 2, name: /activité/i }),
    ).not.toBeInTheDocument()
  })

  // F-453 — gated primary CTA at the top, surfaced via the bientôt pattern.
  it('renders the gated "Commencer la séance" CTA with a bientôt pill', () => {
    render(<Dashboard />)
    const cta = screen.getByTestId('dashboard-commencer-seance')
    expect(cta).toBeInTheDocument()
    expect(cta).toHaveTextContent(/commencer la séance/i)
    expect(cta.querySelector('[data-testid="bientot-pill"]')).not.toBeNull()
  })

  // F-457 — live dashboard entry into La Carte (the journey map).
  it('renders a live "Voir ma carte" entry linking to /carte', () => {
    render(<Dashboard />)
    const entry = screen.getByTestId('dashboard-carte-entry')
    expect(entry).toBeInTheDocument()
    expect(entry).toHaveAttribute('href', '/carte')
    expect(entry).toHaveTextContent(/voir ma carte/i)
  })

  it('countdown widget shows days remaining when examDate is set', () => {
    render(<Dashboard />)
    const days = screen.getByTestId('countdown-days')
    expect(Number(days.textContent)).toBeGreaterThan(0)
  })

  it('daily target widget shows daily_target_minutes from progress (30)', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByTestId('daily-target-value')).toHaveTextContent('30')
    })
  })

  it('streak widget resolves to 0 for progress with streakDays=0', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByTestId('streak-count')).toHaveTextContent('0')
    })
  })

  it('next lesson widget renders the unlocked lesson title after load', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByTestId('next-lesson-title')).toHaveTextContent(
        /leçon 3.*rythme/i,
      )
    })
  })

  it('next lesson CTA links to the correct lesson route', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      const cta = screen.getByRole('link', { name: /reprendre/i })
      expect(cta).toHaveAttribute('href', '/la-methode/lecon-3')
    })
  })
})
