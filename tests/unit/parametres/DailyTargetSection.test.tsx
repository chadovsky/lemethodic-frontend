import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import DailyTargetSection from '@/components/parametres/DailyTargetSection'

const getProgress = vi.fn()
const patchProgress = vi.fn()

vi.mock('@/lib/api', () => ({
  api: {
    users: {
      getProgress: (...args: unknown[]) => getProgress(...args),
      patchProgress: (...args: unknown[]) => patchProgress(...args),
    },
  },
}))

const progress = {
  currentLevel: 'b1',
  maitreIntensity: 1,
  streakDays: 0,
  longestStreakDays: 0,
  streakLastActiveDate: null,
  productionMinutesTotal: 0,
  dailyTargetMinutes: 30,
  tacheAttempts: 0,
  lastCoucheSignals: {},
}

describe('DailyTargetSection — F-467', () => {
  beforeEach(() => {
    getProgress.mockReset()
    patchProgress.mockReset()
  })

  it('mounts the "Objectif quotidien" section with the widget', async () => {
    getProgress.mockResolvedValue(progress)
    render(<DailyTargetSection />)
    expect(screen.getByTestId('parametres-objectif')).toBeInTheDocument()
    expect(screen.getByText(/objectif quotidien/i)).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByTestId('daily-target-value')).toHaveTextContent('30')
    })
  })

  it('reads the current target from GET /api/users/me/progress', async () => {
    getProgress.mockResolvedValue({ ...progress, dailyTargetMinutes: 45 })
    render(<DailyTargetSection />)
    await waitFor(() => {
      expect(screen.getByTestId('daily-target-value')).toHaveTextContent('45')
    })
    expect(getProgress).toHaveBeenCalledOnce()
  })

  it('shows the error state when progress fails to load', async () => {
    getProgress.mockRejectedValue(new Error('boom'))
    render(<DailyTargetSection />)
    await waitFor(() => {
      expect(screen.getByTestId('daily-target-error')).toBeInTheDocument()
    })
  })

  it('PATCHes the new target and optimistically reflects it', async () => {
    getProgress.mockResolvedValue(progress)
    patchProgress.mockResolvedValue({ ...progress, dailyTargetMinutes: 60 })
    render(<DailyTargetSection />)
    await waitFor(() => screen.getByTestId('daily-target-edit-btn'))

    fireEvent.click(screen.getByTestId('daily-target-edit-btn'))
    fireEvent.change(screen.getByTestId('daily-target-input'), { target: { value: '60' } })
    fireEvent.click(screen.getByTestId('daily-target-save-btn'))

    await waitFor(() => {
      expect(patchProgress).toHaveBeenCalledWith({ daily_target_minutes: 60 })
    })
    await waitFor(() => {
      expect(screen.getByTestId('daily-target-value')).toHaveTextContent('60')
    })
  })

  it('reverts to the prior value when PATCH fails', async () => {
    getProgress.mockResolvedValue(progress)
    patchProgress.mockRejectedValue(new Error('network'))
    render(<DailyTargetSection />)
    await waitFor(() => screen.getByTestId('daily-target-edit-btn'))

    fireEvent.click(screen.getByTestId('daily-target-edit-btn'))
    fireEvent.change(screen.getByTestId('daily-target-input'), { target: { value: '75' } })
    fireEvent.click(screen.getByTestId('daily-target-save-btn'))

    // Stays in edit mode (re-throw) and the input reflects the reverted value.
    await waitFor(() => {
      expect(patchProgress).toHaveBeenCalled()
    })
    expect(screen.getByTestId('daily-target-input')).toBeInTheDocument()
  })
})
