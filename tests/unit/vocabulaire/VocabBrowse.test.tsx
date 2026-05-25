import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
vi.mock('next/link', () => ({ default: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a> }))

vi.mock('@/lib/hooks/useChunks', () => ({ useChunks: vi.fn() }))

import { useChunks } from '@/lib/hooks/useChunks'
import VocabBrowse from '@/components/vocabulaire/VocabBrowse'
import type { VocabularyChunk, Register } from '@/lib/types'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const
const ALL_SOURCES = ['Conversation', 'Travail', 'Voyage', 'Quotidien', 'Média']
const NON_MEDIA_SOURCES = ['Conversation', 'Travail', 'Voyage', 'Quotidien']

function makeMockChunks(): VocabularyChunk[] {
  return Array.from({ length: 60 }, (_, i) => {
    const cefrLevel = CEFR_LEVELS[Math.floor(i / 12)]
    // A1 chunks never have Média source so A1+Média filter yields empty state
    const source =
      cefrLevel === 'A1' ? NON_MEDIA_SOURCES[i % 4] : ALL_SOURCES[i % 5]
    return {
      id: i + 1,
      chunkFr: i < 3 ? `laisser tomber ${i + 1}` : `expression ${i + 1}`,
      translationEn: `gloss ${i + 1}`,
      cefrLevel,
      examTag: null,
      register: 'standard' as Register,
      source,
    }
  })
}

const MOCK_CHUNKS = makeMockChunks()

describe('VocabBrowse', () => {
  beforeEach(() => {
    ;(useChunks as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      chunks: MOCK_CHUNKS,
      isLoading: false,
      error: null,
      total: 60,
    })
  })

  it('renders the page header "La Bibliothèque" with tagline', () => {
    render(<VocabBrowse />)
    expect(screen.getByRole('heading', { level: 1, name: /la bibliothèque/i })).toBeInTheDocument()
    expect(screen.getByText(/les chunks qui font la différence\./i)).toBeInTheDocument()
  })

  it('renders the filter bar', () => {
    render(<VocabBrowse />)
    expect(screen.getByTestId('vocab-filter-bar')).toBeInTheDocument()
  })

  it('renders all 60 chunks by default', () => {
    render(<VocabBrowse />)
    expect(screen.getAllByTestId('chunk-row')).toHaveLength(60)
  })

  it('deselecting A1 hides all A1 rows', () => {
    render(<VocabBrowse />)
    fireEvent.click(screen.getByTestId('cefr-chip-A1'))
    const remaining = screen.getAllByTestId('chunk-row')
    expect(remaining.every((row) => row.getAttribute('data-chunk-level') !== 'A1')).toBe(true)
    expect(remaining.length).toBe(48)
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
    fireEvent.click(screen.getByTestId('cefr-chip-A2'))
    fireEvent.click(screen.getByTestId('cefr-chip-B1'))
    fireEvent.click(screen.getByTestId('cefr-chip-B2'))
    fireEvent.click(screen.getByTestId('cefr-chip-C1'))
    fireEvent.change(screen.getByTestId('source-select'), { target: { value: 'Média' } })
    expect(screen.queryAllByTestId('chunk-row')).toHaveLength(0)
    expect(screen.getByTestId('vocab-empty-state')).toBeInTheDocument()
    expect(screen.getByTestId('vocab-empty-reset')).toBeInTheDocument()
  })

  it('clicking "Réinitialiser les filtres" restores all 60 rows', () => {
    render(<VocabBrowse />)
    fireEvent.click(screen.getByTestId('cefr-chip-A2'))
    fireEvent.click(screen.getByTestId('cefr-chip-B1'))
    fireEvent.click(screen.getByTestId('cefr-chip-B2'))
    fireEvent.click(screen.getByTestId('cefr-chip-C1'))
    fireEvent.change(screen.getByTestId('source-select'), { target: { value: 'Média' } })
    expect(screen.getByTestId('vocab-empty-state')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('vocab-empty-reset'))
    expect(screen.getAllByTestId('chunk-row')).toHaveLength(60)
    expect(screen.queryByTestId('vocab-empty-state')).not.toBeInTheDocument()
  })

  it('renders a count badge showing "60 chunks"', () => {
    render(<VocabBrowse />)
    expect(screen.getByTestId('vocab-count-badge')).toHaveTextContent('60 chunks')
  })

  it('clicking the save icon on a chunk row toggles the saved state', () => {
    render(<VocabBrowse />)
    const saveButton = screen.getAllByTestId('chunk-row-save')[0]
    expect(saveButton).toHaveAttribute('data-saved', 'false')
    fireEvent.click(saveButton)
    expect(saveButton).toHaveAttribute('data-saved', 'true')
    fireEvent.click(saveButton)
    expect(saveButton).toHaveAttribute('data-saved', 'false')
  })

  it('shows loading skeletons while data loads', () => {
    ;(useChunks as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      chunks: [],
      isLoading: true,
      error: null,
      total: 0,
    })
    render(<VocabBrowse />)
    expect(screen.getAllByTestId('chunk-row-skeleton').length).toBeGreaterThan(0)
    expect(screen.queryAllByTestId('chunk-row')).toHaveLength(0)
  })
})
