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

import CarteMap from '@/components/carte/CarteMap'

beforeEach(() => {
  localStorage.clear()
})

describe('CarteMap (default B1)', () => {
  it('renders the serpentine map at B1 when no target profile is stored', async () => {
    render(<CarteMap />)
    await waitFor(() => {
      expect(screen.getByTestId('carte-level')).toHaveTextContent('Niveau B1')
    })
    expect(screen.getByTestId('carte-journey')).toBeInTheDocument()
    expect(screen.getByTestId('carte-map')).toBeInTheDocument()
  })

  it('renders the grammar node first, live, as a marker (not an island)', async () => {
    render(<CarteMap />)
    const grammar = await screen.findByTestId('carte-grammar')
    expect(grammar).toHaveAttribute('data-live', 'true')
    // Grammar keeps its marker treatment: no island art inside it.
    expect(within(grammar).queryByTestId('island-node')).toBeNull()
  })

  it('renders 7 ile nodes, education first and current, the rest locked', async () => {
    render(<CarteMap />)
    const iles = await screen.findAllByTestId('carte-ile')
    expect(iles).toHaveLength(7)
    expect(iles[0]).toHaveAttribute('data-theme', 'education')
    expect(iles[0]).toHaveAttribute('data-status', 'current')
    for (const ile of iles.slice(1)) {
      expect(ile).toHaveAttribute('data-status', 'locked')
    }
  })

  it('renders each ile as its themed island art with the correct state', async () => {
    render(<CarteMap />)
    const islands = await screen.findAllByTestId('island-node')
    expect(islands).toHaveLength(7)

    expect(islands[0]).toHaveAttribute('data-status', 'current')
    expect(islands[0]).toHaveAttribute('data-state', 'current')
    expect(within(islands[0]).getByRole('img')).toHaveAttribute(
      'src',
      '/iles/island-education.png',
    )

    expect(islands[1]).toHaveAttribute('data-status', 'locked')
    expect(islands[1]).toHaveAttribute('data-state', 'locked')
    expect(within(islands[1]).getByRole('img')).toHaveAttribute(
      'src',
      '/iles/island-famille.png',
    )
  })

  it('exposes exactly one current-node link, to the canonical ile route', async () => {
    render(<CarteMap />)
    const ctas = await screen.findAllByTestId('carte-current-cta')
    expect(ctas).toHaveLength(1)
    expect(ctas[0].tagName).toBe('A')
    expect(ctas[0]).toHaveAttribute('href', '/ile/education')
  })

  it('places the "vous êtes ici" marker on the current node', async () => {
    render(<CarteMap />)
    const here = await screen.findByTestId('carte-here-marker')
    expect(here).toHaveTextContent(/vous êtes ici/i)
    // It lives inside the current ile node.
    const current = screen
      .getAllByTestId('carte-ile')
      .find((el) => el.getAttribute('data-status') === 'current')!
    expect(within(current).getByTestId('carte-here-marker')).toBe(here)
  })

  it('renders a locked ile as a non-navigable role="link", not an anchor', async () => {
    render(<CarteMap />)
    const iles = await screen.findAllByTestId('carte-ile')
    const famille = iles.find((el) => el.getAttribute('data-theme') === 'famille')!
    expect(famille).toHaveAttribute('data-status', 'locked')
    // No anchor inside a locked node: it cannot navigate.
    expect(famille.querySelector('a')).toBeNull()
    expect(within(famille).getByRole('link')).toHaveAttribute('aria-disabled', 'true')
  })

  it('renders mocks as checkpoint markers, not islands: 7 mini-mocks + 1 final', async () => {
    render(<CarteMap />)
    const mini = await screen.findAllByTestId('carte-mini-mock')
    expect(mini).toHaveLength(7)
    for (const m of mini) {
      expect(m).toHaveAttribute('data-status', 'bientot')
      expect(within(m).queryByTestId('island-node')).toBeNull()
    }
    const final = screen.getByTestId('carte-final-mock')
    expect(final).toHaveAttribute('data-status', 'bientot')
    expect(within(final).queryByTestId('island-node')).toBeNull()
  })
})

describe('CarteMap (target profile resolves the level)', () => {
  it('renders B2 with no authored content: grammar not live, no current node', async () => {
    localStorage.setItem(
      'lm.targetProfile.v1',
      JSON.stringify({ exam: 'TCF', threshold: 'B2 (CLB 7-8)' }),
    )
    render(<CarteMap />)
    await waitFor(() => {
      expect(screen.getByTestId('carte-level')).toHaveTextContent('Niveau B2')
    })
    expect(screen.getByTestId('carte-grammar')).toHaveAttribute('data-live', 'false')
    expect(screen.queryByTestId('carte-current-cta')).toBeNull()
    expect(screen.queryByTestId('carte-here-marker')).toBeNull()
    const iles = screen.getAllByTestId('carte-ile')
    expect(iles).toHaveLength(7)
    for (const ile of iles) expect(ile).toHaveAttribute('data-status', 'bientot')
  })
})

describe('CarteMap (seance progress advances the current node)', () => {
  it('marks a completed ile navigable and advances current to the next ile', async () => {
    localStorage.setItem('lm.journeyProgress.v1', JSON.stringify({ B1: ['education'] }))
    render(<CarteMap />)
    const iles = await screen.findAllByTestId('carte-ile')
    const education = iles.find((el) => el.getAttribute('data-theme') === 'education')!
    const famille = iles.find((el) => el.getAttribute('data-theme') === 'famille')!

    expect(education).toHaveAttribute('data-status', 'completed')
    // completed ile is navigable (a real link), but not the single current-cta.
    expect(education.querySelector('a')).toHaveAttribute('href', '/ile/education')
    expect(within(education).queryByTestId('carte-here-marker')).toBeNull()

    expect(famille).toHaveAttribute('data-status', 'current')
    expect(within(famille).getByTestId('carte-here-marker')).toBeInTheDocument()
    expect(within(famille).getByTestId('carte-current-cta')).toHaveAttribute(
      'href',
      '/ile/famille',
    )
  })
})
