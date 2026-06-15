import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DailyTargetWidget from '@/components/dashboard/DailyTargetWidget'
import type { UserProgress } from '@/lib/types'

const mockProgress: UserProgress = {
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

describe('DailyTargetWidget', () => {
  it('shows heading and skeleton while loading (progress null)', () => {
    render(<DailyTargetWidget progress={null} progressError={false} onPatchTarget={vi.fn()} />)
    expect(
      screen.getByRole('heading', { level: 2, name: /objectif du jour/i }),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('daily-target-value')).not.toBeInTheDocument()
  })

  it('shows error state when progressError is true', () => {
    render(<DailyTargetWidget progress={null} progressError={true} onPatchTarget={vi.fn()} />)
    expect(screen.getByTestId('daily-target-error')).toBeInTheDocument()
    expect(screen.queryByTestId('daily-target-value')).not.toBeInTheDocument()
  })

  it('renders daily_target_minutes from progress', () => {
    render(
      <DailyTargetWidget progress={mockProgress} progressError={false} onPatchTarget={vi.fn()} />,
    )
    expect(screen.getByTestId('daily-target-value')).toHaveTextContent('30')
  })

  it('shows "Modifier" edit button when loaded', () => {
    render(
      <DailyTargetWidget progress={mockProgress} progressError={false} onPatchTarget={vi.fn()} />,
    )
    expect(screen.getByTestId('daily-target-edit-btn')).toBeInTheDocument()
  })

  it('switches to edit mode when edit button is clicked', () => {
    render(
      <DailyTargetWidget progress={mockProgress} progressError={false} onPatchTarget={vi.fn()} />,
    )
    fireEvent.click(screen.getByTestId('daily-target-edit-btn'))
    expect(screen.getByTestId('daily-target-input')).toBeInTheDocument()
    expect(screen.queryByTestId('daily-target-value')).not.toBeInTheDocument()
    expect(screen.queryByTestId('daily-target-edit-btn')).not.toBeInTheDocument()
  })

  it('prefills input with current target value', () => {
    render(
      <DailyTargetWidget progress={mockProgress} progressError={false} onPatchTarget={vi.fn()} />,
    )
    fireEvent.click(screen.getByTestId('daily-target-edit-btn'))
    expect(screen.getByTestId('daily-target-input')).toHaveValue(30)
  })

  it('calls onPatchTarget with the new value on save', async () => {
    const onPatch = vi.fn().mockResolvedValue(undefined)
    render(
      <DailyTargetWidget progress={mockProgress} progressError={false} onPatchTarget={onPatch} />,
    )
    fireEvent.click(screen.getByTestId('daily-target-edit-btn'))
    fireEvent.change(screen.getByTestId('daily-target-input'), { target: { value: '45' } })
    fireEvent.click(screen.getByTestId('daily-target-save-btn'))
    await waitFor(() => {
      expect(onPatch).toHaveBeenCalledWith(45)
    })
  })

  it('returns to view mode after save resolves', async () => {
    const onPatch = vi.fn().mockResolvedValue(undefined)
    render(
      <DailyTargetWidget progress={mockProgress} progressError={false} onPatchTarget={onPatch} />,
    )
    fireEvent.click(screen.getByTestId('daily-target-edit-btn'))
    fireEvent.click(screen.getByTestId('daily-target-save-btn'))
    await waitFor(() => {
      expect(screen.queryByTestId('daily-target-input')).not.toBeInTheDocument()
    })
  })

  it('cancel edit returns to view mode without calling onPatchTarget', () => {
    const onPatch = vi.fn()
    render(
      <DailyTargetWidget progress={mockProgress} progressError={false} onPatchTarget={onPatch} />,
    )
    fireEvent.click(screen.getByTestId('daily-target-edit-btn'))
    fireEvent.click(screen.getByTestId('daily-target-cancel-btn'))
    expect(screen.getByTestId('daily-target-value')).toBeInTheDocument()
    expect(screen.queryByTestId('daily-target-input')).not.toBeInTheDocument()
    expect(onPatch).not.toHaveBeenCalled()
  })

  it('does not save if value is below minimum (< 5)', async () => {
    const onPatch = vi.fn()
    render(
      <DailyTargetWidget progress={mockProgress} progressError={false} onPatchTarget={onPatch} />,
    )
    fireEvent.click(screen.getByTestId('daily-target-edit-btn'))
    fireEvent.change(screen.getByTestId('daily-target-input'), { target: { value: '2' } })
    fireEvent.click(screen.getByTestId('daily-target-save-btn'))
    expect(onPatch).not.toHaveBeenCalled()
  })

  it('does not save if value is above maximum (> 120)', async () => {
    const onPatch = vi.fn()
    render(
      <DailyTargetWidget progress={mockProgress} progressError={false} onPatchTarget={onPatch} />,
    )
    fireEvent.click(screen.getByTestId('daily-target-edit-btn'))
    fireEvent.change(screen.getByTestId('daily-target-input'), { target: { value: '150' } })
    fireEvent.click(screen.getByTestId('daily-target-save-btn'))
    expect(onPatch).not.toHaveBeenCalled()
  })
})
