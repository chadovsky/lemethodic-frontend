import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FilterBar from '@/components/vocabulaire/FilterBar'
import { DEFAULT_FILTER_STATE } from '@/lib/vocab/filter'

describe('FilterBar — CEFR chips', () => {
  it('renders all 5 CEFR chips: A1, A2, B1, B2, C1', () => {
    render(<FilterBar state={DEFAULT_FILTER_STATE} onChange={() => {}} />)
    expect(screen.getByTestId('cefr-chip-A1')).toBeInTheDocument()
    expect(screen.getByTestId('cefr-chip-A2')).toBeInTheDocument()
    expect(screen.getByTestId('cefr-chip-B1')).toBeInTheDocument()
    expect(screen.getByTestId('cefr-chip-B2')).toBeInTheDocument()
    expect(screen.getByTestId('cefr-chip-C1')).toBeInTheDocument()
  })

  it('default state — all 5 chips show data-selected="true"', () => {
    render(<FilterBar state={DEFAULT_FILTER_STATE} onChange={() => {}} />)
    for (const level of ['A1', 'A2', 'B1', 'B2', 'C1']) {
      expect(screen.getByTestId(`cefr-chip-${level}`)).toHaveAttribute('data-selected', 'true')
    }
  })

  it('clicking the A1 chip when selected calls onChange with A1 removed from cefrLevels', () => {
    const onChange = vi.fn()
    render(<FilterBar state={DEFAULT_FILTER_STATE} onChange={onChange} />)
    fireEvent.click(screen.getByTestId('cefr-chip-A1'))
    expect(onChange).toHaveBeenCalledTimes(1)
    const next = onChange.mock.calls[0][0]
    expect(next.cefrLevels).not.toContain('A1')
    expect(next.cefrLevels).toEqual(expect.arrayContaining(['A2', 'B1', 'B2', 'C1']))
  })

  it('clicking the A1 chip when deselected calls onChange with A1 added back', () => {
    const onChange = vi.fn()
    render(
      <FilterBar
        state={{ ...DEFAULT_FILTER_STATE, cefrLevels: ['A2', 'B1', 'B2', 'C1'] }}
        onChange={onChange}
      />,
    )
    fireEvent.click(screen.getByTestId('cefr-chip-A1'))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0].cefrLevels).toContain('A1')
  })
})

describe('FilterBar — source dropdown', () => {
  it('renders the source dropdown with "Toutes les sources" option', () => {
    render(<FilterBar state={DEFAULT_FILTER_STATE} onChange={() => {}} />)
    const select = screen.getByTestId('source-select') as HTMLSelectElement
    expect(select).toBeInTheDocument()
    expect(select.value).toBe('all')
  })

  it('changing the source dropdown calls onChange with new source', () => {
    const onChange = vi.fn()
    render(<FilterBar state={DEFAULT_FILTER_STATE} onChange={onChange} />)
    fireEvent.change(screen.getByTestId('source-select'), { target: { value: 'Média' } })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0].source).toBe('Média')
  })

  it('dropdown contains all 5 sources + "all"', () => {
    render(<FilterBar state={DEFAULT_FILTER_STATE} onChange={() => {}} />)
    const select = screen.getByTestId('source-select') as HTMLSelectElement
    const values = Array.from(select.options).map((o) => o.value)
    expect(values).toEqual(['all', 'Média', 'Conversation', 'Travail', 'Voyage', 'Quotidien'])
  })
})

describe('FilterBar — search input', () => {
  it('renders the search input with empty default', () => {
    render(<FilterBar state={DEFAULT_FILTER_STATE} onChange={() => {}} />)
    const input = screen.getByTestId('search-input') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input.value).toBe('')
  })

  it('typing in the search input calls onChange with new search value', () => {
    const onChange = vi.fn()
    render(<FilterBar state={DEFAULT_FILTER_STATE} onChange={onChange} />)
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'tomber' } })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0].search).toBe('tomber')
  })
})
