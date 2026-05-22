import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import Timer from '@/components/diagnostic/Timer'

describe('Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes display to 03:00 when given 180 seconds', () => {
    render(<Timer initialSeconds={180} />)
    expect(screen.getByTestId('timer-display')).toHaveTextContent('03:00')
  })

  it('initializes display to 03:30 when given 210 seconds', () => {
    render(<Timer initialSeconds={210} />)
    expect(screen.getByTestId('timer-display')).toHaveTextContent('03:30')
  })

  it('initializes display to 05:00 when given 300 seconds', () => {
    render(<Timer initialSeconds={300} />)
    expect(screen.getByTestId('timer-display')).toHaveTextContent('05:00')
  })

  it('counts down once per second when Démarrer is clicked', () => {
    render(<Timer initialSeconds={180} />)
    fireEvent.click(screen.getByTestId('timer-toggle'))
    act(() => { vi.advanceTimersByTime(3000) })
    expect(screen.getByTestId('timer-display')).toHaveTextContent('02:57')
  })

  it('pauses countdown when Pause is clicked', () => {
    render(<Timer initialSeconds={180} />)
    fireEvent.click(screen.getByTestId('timer-toggle')) // start
    act(() => { vi.advanceTimersByTime(2000) })         // → 02:58
    fireEvent.click(screen.getByTestId('timer-toggle')) // pause
    act(() => { vi.advanceTimersByTime(5000) })         // should not advance further
    expect(screen.getByTestId('timer-display')).toHaveTextContent('02:58')
  })

  it('restores initial value on Réinitialiser click', () => {
    render(<Timer initialSeconds={180} />)
    fireEvent.click(screen.getByTestId('timer-toggle'))
    act(() => { vi.advanceTimersByTime(5000) })
    fireEvent.click(screen.getByTestId('timer-reset'))
    expect(screen.getByTestId('timer-display')).toHaveTextContent('03:00')
  })

  it('shows "Temps écoulé" badge when countdown reaches 00:00', () => {
    render(<Timer initialSeconds={3} />)
    fireEvent.click(screen.getByTestId('timer-toggle'))
    act(() => { vi.advanceTimersByTime(3000) })
    expect(screen.getByTestId('timer-display')).toHaveTextContent('00:00')
    expect(screen.getByTestId('timer-elapsed')).toBeInTheDocument()
  })

  it('does not decrement past 00:00', () => {
    render(<Timer initialSeconds={2} />)
    fireEvent.click(screen.getByTestId('timer-toggle'))
    act(() => { vi.advanceTimersByTime(10_000) })
    expect(screen.getByTestId('timer-display')).toHaveTextContent('00:00')
  })

  it('toggle button label is "Démarrer" initially and "Pause" when running', () => {
    render(<Timer initialSeconds={60} />)
    expect(screen.getByTestId('timer-toggle')).toHaveTextContent(/démarrer/i)
    fireEvent.click(screen.getByTestId('timer-toggle'))
    expect(screen.getByTestId('timer-toggle')).toHaveTextContent(/pause/i)
  })
})
