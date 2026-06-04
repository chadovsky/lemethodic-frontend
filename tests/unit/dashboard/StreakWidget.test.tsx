import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StreakWidget from '@/components/dashboard/StreakWidget'
import type { UserProgress } from '@/lib/types'

const mockProgress: UserProgress = {
  currentLevel: 'b1',
  maitreIntensity: 1,
  streakDays: 7,
  longestStreakDays: 14,
  streakLastActiveDate: '2026-06-04',
  productionMinutesTotal: 120,
  dailyTargetMinutes: 30,
  tacheAttempts: 5,
  lastCoucheSignals: {},
}

describe('StreakWidget', () => {
  it('shows heading and skeleton while loading (progress null)', () => {
    render(<StreakWidget progress={null} progressError={false} />)
    expect(screen.getByRole('heading', { level: 2, name: /série active/i })).toBeInTheDocument()
    expect(screen.queryByTestId('streak-count')).not.toBeInTheDocument()
  })

  it('shows error state when progressError is true', () => {
    render(<StreakWidget progress={null} progressError={true} />)
    expect(screen.getByTestId('streak-error')).toBeInTheDocument()
    expect(screen.queryByTestId('streak-count')).not.toBeInTheDocument()
  })

  it('renders streak count from progress', () => {
    render(<StreakWidget progress={mockProgress} progressError={false} />)
    expect(screen.getByTestId('streak-count')).toHaveTextContent('7')
  })

  it('uses singular label for streak of 1', () => {
    render(<StreakWidget progress={{ ...mockProgress, streakDays: 1 }} progressError={false} />)
    expect(screen.getByText('jour consécutif')).toBeInTheDocument()
  })

  it('uses plural label for streak > 1', () => {
    render(<StreakWidget progress={mockProgress} progressError={false} />)
    expect(screen.getByText('jours consécutifs')).toBeInTheDocument()
  })

  it('shows 0 streak when streakDays is 0', () => {
    render(<StreakWidget progress={{ ...mockProgress, streakDays: 0 }} progressError={false} />)
    expect(screen.getByTestId('streak-count')).toHaveTextContent('0')
  })

  it('error state overrides progress value', () => {
    render(<StreakWidget progress={mockProgress} progressError={true} />)
    expect(screen.getByTestId('streak-error')).toBeInTheDocument()
    expect(screen.queryByTestId('streak-count')).not.toBeInTheDocument()
  })
})
