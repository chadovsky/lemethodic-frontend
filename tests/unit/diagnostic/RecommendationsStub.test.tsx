import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import RecommendationsStub from '@/components/diagnostic/RecommendationsStub'

describe('RecommendationsStub', () => {
  it('renders exactly 3 recommendation rows', () => {
    render(<RecommendationsStub />)
    expect(screen.getAllByTestId('recommendation-row')).toHaveLength(3)
  })

  it('first recommendation CTA links to /la-methode', () => {
    render(<RecommendationsStub />)
    const rows = screen.getAllByTestId('recommendation-row')
    const cta = within(rows[0]).getByTestId('recommendation-cta')
    expect(cta).toHaveAttribute('href', '/la-methode')
  })

  it('second recommendation CTA links to /la-bibliotheque', () => {
    render(<RecommendationsStub />)
    const rows = screen.getAllByTestId('recommendation-row')
    const cta = within(rows[1]).getByTestId('recommendation-cta')
    expect(cta).toHaveAttribute('href', '/la-bibliotheque')
  })

  it('third recommendation CTA links to /l-examen/diagnostic/tache/1', () => {
    render(<RecommendationsStub />)
    const rows = screen.getAllByTestId('recommendation-row')
    const cta = within(rows[2]).getByTestId('recommendation-cta')
    expect(cta).toHaveAttribute('href', '/l-examen/diagnostic/tache/1')
  })

  it('every row renders a layer name and a suggestion sentence', () => {
    render(<RecommendationsStub />)
    const rows = screen.getAllByTestId('recommendation-row')
    rows.forEach((row) => {
      expect(within(row).getByTestId('recommendation-layer')).toBeInTheDocument()
      expect(within(row).getByTestId('recommendation-suggestion')).toBeInTheDocument()
    })
  })

  it('each row has a layer-chip badge with data-testid "recommendation-chip"', () => {
    render(<RecommendationsStub />)
    expect(screen.getAllByTestId('recommendation-chip')).toHaveLength(3)
  })

  it('chip initials are LC, LP, LM in row order', () => {
    render(<RecommendationsStub />)
    const chips = screen.getAllByTestId('recommendation-chip')
    expect(chips[0]).toHaveTextContent('LC')
    expect(chips[1]).toHaveTextContent('LP')
    expect(chips[2]).toHaveTextContent('LM')
  })

  it('every CTA link has ed-btn-press class', () => {
    render(<RecommendationsStub />)
    const ctas = screen.getAllByTestId('recommendation-cta')
    ctas.forEach((cta) => {
      expect(cta).toHaveClass('ed-btn-press')
    })
  })

  it('every recommendation row has ed-card-lift class', () => {
    render(<RecommendationsStub />)
    const rows = screen.getAllByTestId('recommendation-row')
    rows.forEach((row) => {
      expect(row).toHaveClass('ed-card-lift')
    })
  })
})
