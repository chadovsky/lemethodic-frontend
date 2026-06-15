import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, expect, it, beforeEach, vi } from 'vitest'

import SeancePlayer from '@/components/seance/SeancePlayer'
import { readCompletedIles } from '@/lib/journey/progress'

// Drive the ?ile= launch param via the jsdom history API.
function setIleParam(value: string | null) {
  const url = value === null ? '/seance' : `/seance?ile=${value}`
  window.history.pushState({}, '', url)
}

beforeEach(() => {
  localStorage.clear()
  setIleParam(null)
  // jsdom does not implement scrollTo; the walk calls it on every step.
  window.scrollTo = vi.fn()
})

describe('SeancePlayer — linear Practice walk (F-460)', () => {
  it('walks the current ile when launched with ?ile=education', async () => {
    setIleParam('education')
    render(<SeancePlayer />)

    const header = await screen.findByTestId('seance-header')
    expect(header).toHaveAttribute('data-theme', 'education')
    expect(header).toHaveAttribute('data-level', 'B1')
    expect(screen.getByTestId('seance-progress')).toHaveTextContent('1 sur 5')
    // First activity shell is the first ActivityType (traduction).
    expect(screen.getByTestId('seance-activity')).toHaveAttribute('data-activity-type', 'traduction')
  })

  it('falls back to the journey current ile when no param is given', async () => {
    setIleParam(null)
    render(<SeancePlayer />)
    const header = await screen.findByTestId('seance-header')
    expect(header).toHaveAttribute('data-theme', 'education')
  })

  it('disables Previous on the first step and advances with Next', async () => {
    setIleParam('education')
    render(<SeancePlayer />)
    await screen.findByTestId('seance-header')

    expect(screen.getByTestId('seance-prev')).toBeDisabled()
    fireEvent.click(screen.getByTestId('seance-next'))
    expect(screen.getByTestId('seance-progress')).toHaveTextContent('2 sur 5')
    expect(screen.getByTestId('seance-prev')).not.toBeDisabled()

    // Previous steps back.
    fireEvent.click(screen.getByTestId('seance-prev'))
    expect(screen.getByTestId('seance-progress')).toHaveTextContent('1 sur 5')
  })

  it('reaches the completion screen after 5 steps and marks the ile completed', async () => {
    setIleParam('education')
    render(<SeancePlayer />)
    await screen.findByTestId('seance-header')

    // Steps 1->5: click Continuer 4 times, then Terminer on the last.
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByTestId('seance-next'))
    }

    expect(await screen.findByTestId('seance-complete')).toBeInTheDocument()
    expect(readCompletedIles('B1')).toEqual(['education'])
  })

  it('Refaire restarts the walk from step 1', async () => {
    setIleParam('education')
    render(<SeancePlayer />)
    await screen.findByTestId('seance-header')
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByTestId('seance-next'))

    fireEvent.click(await screen.findByTestId('seance-redo'))
    expect(await screen.findByTestId('seance-progress')).toHaveTextContent('1 sur 5')
  })

  it('shows the empty state for a non-walkable (locked) ile', async () => {
    setIleParam('famille') // locked behind education at B1, nothing completed.
    render(<SeancePlayer />)
    expect(await screen.findByTestId('seance-empty')).toBeInTheDocument()
    expect(screen.queryByTestId('seance-player')).toBeNull()
  })

  it('walks a previously-completed ile (Refaire path) launched by param', async () => {
    localStorage.setItem('lm.journeyProgress.v1', JSON.stringify({ B1: ['education'] }))
    setIleParam('education') // education is now completed -> still walkable.
    render(<SeancePlayer />)
    const header = await screen.findByTestId('seance-header')
    await waitFor(() => expect(header).toHaveAttribute('data-theme', 'education'))
  })
})
