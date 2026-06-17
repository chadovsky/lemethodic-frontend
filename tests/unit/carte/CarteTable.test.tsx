import { render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, beforeEach, vi } from 'vitest'

vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

import CarteTable from '@/components/carte/CarteTable'

// jsdom reports clientWidth 0, so the component keeps its default 720 width and
// renders the TABLE layout (the >=640 presentation). Both layouts expose the same
// contract, so testing the table covers it.

beforeEach(() => {
  localStorage.clear()
})

describe('CarteTable (default B1)', () => {
  it('renders the journey shell + the level pill', async () => {
    render(<CarteTable />)
    await waitFor(() => {
      expect(screen.getByTestId('carte-level')).toHaveTextContent('Niveau B1')
    })
    expect(screen.getByTestId('carte-journey')).toBeInTheDocument()
    expect(screen.getByTestId('carte-map')).toBeInTheDocument()
    // No path/bubble artifacts remain.
    expect(screen.queryByTestId('carte-bubble')).toBeNull()
    expect(screen.queryByTestId('carte-trail')).toBeNull()
  })

  it('renders 8 rows: the grammar foundation + the 7 themes, each with focus', async () => {
    render(<CarteTable />)
    const grammar = await screen.findByTestId('carte-grammar')
    expect(grammar).toHaveAttribute('data-live', 'true')
    expect(grammar).toHaveAttribute('data-theme', 'grammaire')
    expect(within(grammar).getByText('La grammaire')).toBeInTheDocument()

    const iles = screen.getAllByTestId('carte-ile')
    expect(iles).toHaveLength(7)
    expect(iles[0]).toHaveAttribute('data-theme', 'education')
    expect(within(iles[0]).getByText("L'éducation")).toBeInTheDocument()
    // Focus blurb copy is rendered (from the editable data map).
    expect(within(iles[0]).getByText(/parcours et d'apprentissage/i)).toBeInTheDocument()
  })

  it('marks education current + the rest locked, with the right state cells', async () => {
    render(<CarteTable />)
    const iles = await screen.findAllByTestId('carte-ile')
    expect(iles[0]).toHaveAttribute('data-status', 'current')
    // Current row holds the single CTA, not a "Verrouillé" pill.
    expect(within(iles[0]).getByTestId('carte-current-cta')).toBeInTheDocument()
    for (const ile of iles.slice(1)) {
      expect(ile).toHaveAttribute('data-status', 'locked')
      expect(within(ile).getByText('Verrouillé')).toBeInTheDocument()
      expect(ile.querySelector('a')).toBeNull()
    }
  })

  it('exposes exactly one current CTA routing to the current ile', async () => {
    render(<CarteTable />)
    const ctas = await screen.findAllByTestId('carte-current-cta')
    expect(ctas).toHaveLength(1)
    expect(ctas[0].tagName).toBe('A')
    expect(ctas[0]).toHaveAttribute('href', '/ile/education')
  })

  it('shows the grammar foundation as Terminé at B1', async () => {
    render(<CarteTable />)
    const grammar = await screen.findByTestId('carte-grammar')
    expect(grammar).toHaveAttribute('data-status', 'completed')
    expect(within(grammar).getByText('Terminé')).toBeInTheDocument()
  })
})

describe('CarteTable (target profile resolves the level)', () => {
  it('renders B2 with no authored content: grammar not live, no CTA, all bientot', async () => {
    localStorage.setItem('lm.targetProfile.v1', JSON.stringify({ exam: 'TCF', threshold: 'B2 (CLB 7-8)' }))
    render(<CarteTable />)
    await waitFor(() => {
      expect(screen.getByTestId('carte-level')).toHaveTextContent('Niveau B2')
    })
    expect(screen.getByTestId('carte-grammar')).toHaveAttribute('data-live', 'false')
    expect(screen.queryByTestId('carte-current-cta')).toBeNull()
    const iles = screen.getAllByTestId('carte-ile')
    expect(iles).toHaveLength(7)
    for (const ile of iles) expect(ile).toHaveAttribute('data-status', 'bientot')
  })
})

describe('CarteTable (seance progress advances the current row)', () => {
  it('marks a completed ile Terminé + navigable, advances the CTA to the next ile', async () => {
    localStorage.setItem('lm.journeyProgress.v1', JSON.stringify({ B1: ['education'] }))
    render(<CarteTable />)
    const iles = await screen.findAllByTestId('carte-ile')
    const education = iles.find((el) => el.getAttribute('data-theme') === 'education')!
    const famille = iles.find((el) => el.getAttribute('data-theme') === 'famille')!

    expect(education).toHaveAttribute('data-status', 'completed')
    expect(within(education).getByText('Terminé')).toBeInTheDocument()
    // Completed row name links back to its ile route.
    expect(education.querySelector('a')).toHaveAttribute('href', '/ile/education')

    expect(famille).toHaveAttribute('data-status', 'current')
    expect(within(famille).getByTestId('carte-current-cta')).toHaveAttribute('href', '/ile/famille')
  })
})
