import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Results from '@/components/diagnostic/Results'

describe('Results', () => {
  it('renders the overall C1 score in the header', () => {
    render(<Results />)
    expect(screen.getByTestId('results-score')).toHaveTextContent('C1')
  })

  it('renders "Niveau estimé TCF Canada" sub-line', () => {
    render(<Results />)
    expect(screen.getByText(/niveau estimé tcf canada/i)).toBeInTheDocument()
  })

  it('renders the "Évalué le" date stamp', () => {
    render(<Results />)
    expect(screen.getByText(/évalué le/i)).toBeInTheDocument()
  })

  it('renders the breadcrumb with "L\'Examen" and "Résultats"', () => {
    render(<Results />)
    const bc = screen.getByTestId('breadcrumb')
    expect(bc).toBeInTheDocument()
    expect(screen.getByText(/résultats/i)).toBeInTheDocument()
  })

  it('renders the 5-couche breakdown section', () => {
    render(<Results />)
    expect(screen.getByTestId('results-section-couches')).toBeInTheDocument()
    expect(screen.getAllByTestId('couche-row')).toHaveLength(5)
  })

  it('renders the per-tâche summary section with 3 rows', () => {
    render(<Results />)
    expect(screen.getByTestId('results-section-taches')).toBeInTheDocument()
    expect(screen.getAllByTestId('tache-summary-row')).toHaveLength(3)
  })

  it('renders the recommendations section with 3 rows', () => {
    render(<Results />)
    expect(screen.getByTestId('results-section-recommendations')).toBeInTheDocument()
    expect(screen.getAllByTestId('recommendation-row')).toHaveLength(3)
  })

  it('renders "Recommencer le diagnostic" linking to /l-examen/diagnostic/tache/1', () => {
    render(<Results />)
    const link = screen.getByTestId('results-action-recommencer')
    expect(link).toHaveTextContent(/recommencer le diagnostic/i)
    expect(link).toHaveAttribute('href', '/l-examen/diagnostic/tache/1')
  })

  it('renders "Retour au tableau de bord" linking to /dashboard', () => {
    render(<Results />)
    const link = screen.getByTestId('results-action-dashboard')
    expect(link).toHaveTextContent(/retour au tableau de bord/i)
    expect(link).toHaveAttribute('href', '/dashboard')
  })

  it('does NOT contain an <audio> element', () => {
    const { container } = render(<Results />)
    expect(container.querySelector('audio')).toBeNull()
  })

  it('renders a CEFR pill with data-testid "results-cefr-pill"', () => {
    render(<Results />)
    expect(screen.getByTestId('results-cefr-pill')).toBeInTheDocument()
  })

  it('CEFR pill shows "C1"', () => {
    render(<Results />)
    expect(screen.getByTestId('results-cefr-pill')).toHaveTextContent('C1')
  })

  it('score block has results-score-enter animation class', () => {
    render(<Results />)
    expect(screen.getByTestId('results-score-block')).toHaveClass('results-score-enter')
  })

  it('"Recommencer le diagnostic" contains an inline SVG icon', () => {
    render(<Results />)
    const recommencer = screen.getByTestId('results-action-recommencer')
    expect(recommencer.querySelector('svg')).not.toBeNull()
  })

  it('each TacheSummary row has multi-sentence feedback (>=80 chars)', () => {
    render(<Results />)
    const feedbacks = screen.getAllByTestId('tache-summary-feedback')
    expect(feedbacks).toHaveLength(3)
    feedbacks.forEach((fb) => {
      expect((fb.textContent ?? '').length).toBeGreaterThanOrEqual(80)
    })
  })
})
