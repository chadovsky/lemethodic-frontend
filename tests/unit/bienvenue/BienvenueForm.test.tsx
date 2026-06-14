// F-459 - Le Diagnostic: deliberate level assignment step in /bienvenue.
// Walks the 4-step capture and asserts the starting-level step writes an
// explicit `level` onto the target profile and lands the learner on /carte.

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

import { BienvenueForm } from '@/app/bienvenue/page'
import { TARGET_PROFILE_KEY } from '@/lib/journey/target-level'

// Walk the first three steps (exam -> threshold -> persona) up to the level step.
function advanceToLevelStep() {
  fireEvent.click(screen.getByRole('button', { name: 'TCF' }))
  fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))

  fireEvent.click(screen.getByRole('button', { name: 'B2 (CLB 7-8)' }))
  fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))

  fireEvent.click(screen.getByRole('button', { name: /Plateau à surmonter/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))
}

beforeEach(() => {
  localStorage.clear()
  mockPush.mockClear()
})

describe('BienvenueForm - F-459 level assignment', () => {
  it('reaches a starting-level step with the five CEFR bands, seeded to B1', () => {
    render(<BienvenueForm />)
    advanceToLevelStep()

    expect(screen.getByTestId('bienvenue-level-step')).toBeInTheDocument()
    for (const band of ['A1', 'A2', 'B1', 'B2', 'C1']) {
      expect(screen.getByTestId(`bienvenue-level-${band}`)).toBeInTheDocument()
    }
    // Seeded default: the B1 card is pre-selected (aria-pressed).
    const b1Card = screen.getByTestId('bienvenue-level-B1').closest('button')
    expect(b1Card).toHaveAttribute('aria-pressed', 'true')
  })

  it('writes the confirmed default level (B1) and lands on /carte', () => {
    render(<BienvenueForm />)
    advanceToLevelStep()

    fireEvent.click(screen.getByRole('button', { name: 'Commencer mon parcours' }))

    const stored = JSON.parse(localStorage.getItem(TARGET_PROFILE_KEY) as string)
    expect(stored.level).toBe('B1')
    expect(stored.exam).toBe('TCF')
    expect(stored.threshold).toBe('B2 (CLB 7-8)')
    expect(mockPush).toHaveBeenCalledWith('/carte')
  })

  it('writes an adjusted level when the learner changes it', () => {
    render(<BienvenueForm />)
    advanceToLevelStep()

    fireEvent.click(screen.getByTestId('bienvenue-level-A2'))
    fireEvent.click(screen.getByRole('button', { name: 'Commencer mon parcours' }))

    const stored = JSON.parse(localStorage.getItem(TARGET_PROFILE_KEY) as string)
    expect(stored.level).toBe('A2')
    expect(mockPush).toHaveBeenCalledWith('/carte')
  })
})
