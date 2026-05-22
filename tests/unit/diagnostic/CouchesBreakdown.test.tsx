import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CouchesBreakdown from '@/components/diagnostic/CouchesBreakdown'

const LOCKED_ORDER = [
  'Le Fond',
  'Les Moules des Idées',
  'Les Moules',
  'Les Réflexes Anglais',
  'La Voix',
] as const

const EXPECTED_SCORES = ['C1', 'B2', 'B2', 'B1', 'B2'] as const

describe('CouchesBreakdown', () => {
  it('renders exactly 5 couche rows', () => {
    render(<CouchesBreakdown />)
    expect(screen.getAllByTestId('couche-row')).toHaveLength(5)
  })

  it('renders couche names in the locked order', () => {
    render(<CouchesBreakdown />)
    const rows = screen.getAllByTestId('couche-row')
    LOCKED_ORDER.forEach((name, i) => {
      expect(within(rows[i]).getByText(name)).toBeInTheDocument()
    })
  })

  it('renders CEFR badges with correct scores per layer', () => {
    render(<CouchesBreakdown />)
    const badges = screen.getAllByTestId('couche-badge')
    expect(badges).toHaveLength(5)
    EXPECTED_SCORES.forEach((score, i) => {
      expect(badges[i]).toHaveTextContent(score)
    })
  })

  it('renders a bar element in every row', () => {
    render(<CouchesBreakdown />)
    const bars = screen.getAllByTestId('couche-bar')
    expect(bars).toHaveLength(5)
  })

  it('Le Fond row (C1) bar is wider than Les Réflexes Anglais row (B1) bar', () => {
    render(<CouchesBreakdown />)
    const bars = screen.getAllByTestId('couche-bar')
    const fondWidth = parseFloat(bars[0].style.width)
    const reflexWidth = parseFloat(bars[3].style.width)
    expect(fondWidth).toBeGreaterThan(reflexWidth)
  })

  it('renders a gloss sentence in every row', () => {
    render(<CouchesBreakdown />)
    const rows = screen.getAllByTestId('couche-row')
    rows.forEach((row) => {
      expect(within(row).getByTestId('couche-gloss')).toBeInTheDocument()
    })
  })
})
