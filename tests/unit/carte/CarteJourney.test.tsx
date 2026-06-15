import { render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

import CarteJourney from '@/components/carte/CarteJourney'

beforeEach(() => {
  localStorage.clear()
})

describe('CarteJourney (default B1)', () => {
  it('renders the journey at B1 when no target profile is stored', async () => {
    render(<CarteJourney />)
    await waitFor(() => {
      expect(screen.getByTestId('carte-level')).toHaveTextContent('Niveau B1')
    })
    expect(screen.getByTestId('carte-journey')).toBeInTheDocument()
  })

  it('renders the grammar node live with the 13 B1 clusters', async () => {
    render(<CarteJourney />)
    const grammar = await screen.findByTestId('carte-grammar')
    expect(grammar).toHaveAttribute('data-live', 'true')
    expect(screen.getAllByTestId('carte-grammar-chip')).toHaveLength(13)
  })

  it('renders 7 ile nodes, education first and current', async () => {
    render(<CarteJourney />)
    const iles = await screen.findAllByTestId('carte-ile')
    expect(iles).toHaveLength(7)
    expect(iles[0]).toHaveAttribute('data-theme', 'education')
    expect(iles[0]).toHaveAttribute('data-status', 'current')
    for (const ile of iles.slice(1)) {
      expect(ile).toHaveAttribute('data-status', 'locked')
    }
  })

  it('exposes exactly one primary CTA, on the current ile, to the canonical ile route', async () => {
    render(<CarteJourney />)
    const ctas = await screen.findAllByTestId('carte-current-cta')
    expect(ctas).toHaveLength(1)
    expect(ctas[0]).toHaveAttribute('href', '/ile/education')
    expect(ctas[0]).toHaveTextContent(/commencer/i)
  })

  it('renders 7 mini-mock markers and 1 final-mock, all not-yet-live', async () => {
    render(<CarteJourney />)
    const mini = await screen.findAllByTestId('carte-mini-mock')
    expect(mini).toHaveLength(7)
    for (const m of mini) expect(m).toHaveAttribute('data-status', 'bientot')
    const final = screen.getByTestId('carte-final-mock')
    expect(final).toHaveAttribute('data-status', 'bientot')
  })

  it('renders the themed island art per ile with the right src and state', async () => {
    render(<CarteJourney />)
    const islands = await screen.findAllByTestId('island-node')
    expect(islands).toHaveLength(7)

    // education first, current: its art is the education island.
    expect(islands[0]).toHaveAttribute('data-status', 'current')
    expect(islands[0]).toHaveAttribute('data-state', 'current')
    expect(within(islands[0]).getByRole('img')).toHaveAttribute(
      'src',
      '/iles/island-education.png',
    )

    // the rest are locked behind it, rendering their own themed art.
    expect(islands[1]).toHaveAttribute('data-status', 'locked')
    expect(islands[1]).toHaveAttribute('data-state', 'locked')
    expect(within(islands[1]).getByRole('img')).toHaveAttribute(
      'src',
      '/iles/island-famille.png',
    )
  })
})

describe('CarteJourney (target profile resolves the level)', () => {
  it('renders B2 with no authored content: grammar not live, no current CTA', async () => {
    localStorage.setItem(
      'lm.targetProfile.v1',
      JSON.stringify({ exam: 'TCF', threshold: 'B2 (CLB 7-8)' }),
    )
    render(<CarteJourney />)
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
