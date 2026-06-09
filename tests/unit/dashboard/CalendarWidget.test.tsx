import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

// F-444 — unit tests for CalendarWidget: heatmap, today-vs-target bar, streak display

// vi.mock is hoisted; the factory must not reference module-level variables.
vi.mock('@/lib/api', () => ({
  api: {
    users: {
      getActivityCalendar: vi.fn(),
    },
  },
}))

import { api } from '@/lib/api'
import CalendarWidget from '@/components/dashboard/CalendarWidget'

// Use local YYYY-MM-DD to match CalendarWidget's localDateStr() helper.
function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Deterministic 90-day payload: 90 entries ending today
function makeDays(count: number) {
  const today = new Date()
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (count - 1 - i))
    return {
      date: toLocalDateStr(d),
      count: i === count - 1 ? 5 : i % 3,
      targetMet: i === count - 1,
    }
  })
}

const MOCK_CALENDAR = {
  currentStreak: 4,
  longestStreak: 12,
  todayCount: 20,
  todayTarget: 30,
  days: makeDays(90),
}

beforeEach(() => {
  vi.clearAllMocks()
  // Default: resolve with the standard mock calendar
  ;(api.users.getActivityCalendar as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_CALENDAR)
})

describe('CalendarWidget', () => {
  it('renders skeleton while loading', () => {
    ;(api.users.getActivityCalendar as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise(() => {}),
    )
    render(<CalendarWidget />)
    expect(document.querySelector('.ed-skeleton')).toBeInTheDocument()
  })

  it('shows "Activité" heading', async () => {
    render(<CalendarWidget />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /activité/i })).toBeInTheDocument()
    })
  })

  it('renders current streak value from API', async () => {
    render(<CalendarWidget />)
    await waitFor(() => {
      expect(screen.getByTestId('calendar-current-streak')).toHaveTextContent('4')
    })
  })

  it('renders longest streak value from API', async () => {
    render(<CalendarWidget />)
    await waitFor(() => {
      expect(screen.getByTestId('calendar-longest-streak')).toHaveTextContent('12')
    })
  })

  it('renders today count / target in the progress bar label', async () => {
    render(<CalendarWidget />)
    await waitFor(() => {
      expect(screen.getByTestId('calendar-today-count')).toHaveTextContent('20 / 30 min')
    })
  })

  it('renders the heatmap grid', async () => {
    render(<CalendarWidget />)
    await waitFor(() => {
      expect(screen.getByTestId('calendar-grid')).toBeInTheDocument()
    })
  })

  it('marks today cell with data-testid', async () => {
    render(<CalendarWidget />)
    await waitFor(() => {
      expect(screen.getByTestId('calendar-cell-today')).toBeInTheDocument()
    })
  })

  it('shows error state when API call fails', async () => {
    ;(api.users.getActivityCalendar as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('network'),
    )
    render(<CalendarWidget />)
    await waitFor(() => {
      expect(screen.getByTestId('calendar-error')).toBeInTheDocument()
    })
  })

  it('renders cleanly with all-zero days (new user)', async () => {
    const zeroDays = makeDays(90).map((d) => ({ ...d, count: 0, targetMet: false }))
    ;(api.users.getActivityCalendar as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      currentStreak: 0,
      longestStreak: 0,
      todayCount: 0,
      todayTarget: 30,
      days: zeroDays,
    })
    render(<CalendarWidget />)
    await waitFor(() => {
      expect(screen.getByTestId('calendar-grid')).toBeInTheDocument()
      expect(screen.getByTestId('calendar-current-streak')).toHaveTextContent('0')
    })
  })
})
