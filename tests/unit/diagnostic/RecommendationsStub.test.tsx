import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import RecommendationsStub from '@/components/diagnostic/RecommendationsStub'

describe('RecommendationsStub', () => {
  it('renders exactly 3 recommendation rows', () => {
    render(<RecommendationsStub />)
    expect(screen.getAllByTestId('recommendation-row')).toHaveLength(3)
  })

  it('first recommendation CTA links to /ecole', () => {
    render(<RecommendationsStub />)
    const rows = screen.getAllByTestId('recommendation-row')
    const cta = within(rows[0]).getByTestId('recommendation-cta')
    expect(cta).toHaveAttribute('href', '/ecole')
  })

  it('second recommendation CTA links to /vocabulaire', () => {
    render(<RecommendationsStub />)
    const rows = screen.getAllByTestId('recommendation-row')
    const cta = within(rows[1]).getByTestId('recommendation-cta')
    expect(cta).toHaveAttribute('href', '/vocabulaire')
  })

  it('third recommendation CTA links to /diagnostic/tache/1', () => {
    render(<RecommendationsStub />)
    const rows = screen.getAllByTestId('recommendation-row')
    const cta = within(rows[2]).getByTestId('recommendation-cta')
    expect(cta).toHaveAttribute('href', '/diagnostic/tache/1')
  })

  it('every row renders a layer name and a suggestion sentence', () => {
    render(<RecommendationsStub />)
    const rows = screen.getAllByTestId('recommendation-row')
    rows.forEach((row) => {
      expect(within(row).getByTestId('recommendation-layer')).toBeInTheDocument()
      expect(within(row).getByTestId('recommendation-suggestion')).toBeInTheDocument()
    })
  })
})
