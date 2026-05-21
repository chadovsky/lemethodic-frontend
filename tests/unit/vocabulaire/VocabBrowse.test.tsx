import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import VocabBrowse from '@/components/vocabulaire/VocabBrowse'

describe('VocabBrowse', () => {
  it('renders the page header "Le Vocabulaire" with tagline', () => {
    render(<VocabBrowse />)
    expect(screen.getByRole('heading', { level: 1, name: /le vocabulaire/i })).toBeInTheDocument()
    expect(screen.getByText(/les chunks qui font la différence\./i)).toBeInTheDocument()
  })

  it('renders the filter bar', () => {
    render(<VocabBrowse />)
    expect(screen.getByTestId('vocab-filter-bar')).toBeInTheDocument()
  })

  it('renders all 30 chunks from the fixture by default', () => {
    render(<VocabBrowse />)
    expect(screen.getAllByTestId('chunk-row')).toHaveLength(30)
  })

  it('deselecting A1 hides all A1 rows', () => {
    render(<VocabBrowse />)
    fireEvent.click(screen.getByTestId('cefr-chip-A1'))
    const remaining = screen.getAllByTestId('chunk-row')
    expect(remaining.every((row) => row.getAttribute('data-chunk-level') !== 'A1')).toBe(true)
    expect(remaining.length).toBe(24)
  })

  it('selecting source = "Média" shows only Média rows', () => {
    render(<VocabBrowse />)
    fireEvent.change(screen.getByTestId('source-select'), { target: { value: 'Média' } })
    const remaining = screen.getAllByTestId('chunk-row')
    expect(remaining.length).toBeGreaterThan(0)
    expect(remaining.every((row) => row.getAttribute('data-chunk-source') === 'Média')).toBe(true)
  })

  it('search "tomber" filters to chunks containing tomber', () => {
    render(<VocabBrowse />)
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'tomber' } })
    const remaining = screen.getAllByTestId('chunk-row')
    expect(remaining.length).toBeGreaterThan(0)
    remaining.forEach((row) => {
      const fr = row.querySelector('[data-testid="chunk-row-fr"]')!.textContent!
      expect(fr.toLowerCase()).toContain('tomber')
    })
  })

  it('combining A1 only + source = Média yields empty state with reset button', () => {
    render(<VocabBrowse />)
    // Deselect everything except A1
    fireEvent.click(screen.getByTestId('cefr-chip-A2'))
    fireEvent.click(screen.getByTestId('cefr-chip-B1'))
    fireEvent.click(screen.getByTestId('cefr-chip-B2'))
    fireEvent.click(screen.getByTestId('cefr-chip-C1'))
    fireEvent.change(screen.getByTestId('source-select'), { target: { value: 'Média' } })

    expect(screen.queryAllByTestId('chunk-row')).toHaveLength(0)
    expect(screen.getByTestId('vocab-empty-state')).toBeInTheDocument()
    expect(screen.getByTestId('vocab-empty-reset')).toBeInTheDocument()
  })

  it('clicking "Réinitialiser les filtres" restores all 30 rows', () => {
    render(<VocabBrowse />)
    fireEvent.click(screen.getByTestId('cefr-chip-A2'))
    fireEvent.click(screen.getByTestId('cefr-chip-B1'))
    fireEvent.click(screen.getByTestId('cefr-chip-B2'))
    fireEvent.click(screen.getByTestId('cefr-chip-C1'))
    fireEvent.change(screen.getByTestId('source-select'), { target: { value: 'Média' } })
    expect(screen.getByTestId('vocab-empty-state')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('vocab-empty-reset'))
    expect(screen.getAllByTestId('chunk-row')).toHaveLength(30)
    expect(screen.queryByTestId('vocab-empty-state')).not.toBeInTheDocument()
  })
})
