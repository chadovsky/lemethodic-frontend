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

import CarteWorld from '@/components/carte/CarteWorld'

beforeEach(() => {
  localStorage.clear()
})

describe('CarteWorld (desktop sea-world, default B1)', () => {
  it('renders the world shell at B1 when no target profile is stored', async () => {
    render(<CarteWorld />)
    await waitFor(() => {
      expect(screen.getByTestId('carte-level')).toHaveTextContent('Niveau B1')
    })
    expect(screen.getByTestId('carte-journey')).toBeInTheDocument()
    expect(screen.getByTestId('carte-map')).toBeInTheDocument()
  })

  it('renders 8 islands: the grammar foundation first, then the 7 themes', async () => {
    render(<CarteWorld />)
    const islands = await screen.findAllByTestId('island-node')
    expect(islands).toHaveLength(8)
    // Grammar is its own island on desktop (unlike the mobile marker).
    const grammar = screen.getByTestId('carte-grammar')
    expect(grammar).toHaveAttribute('data-live', 'true')
    expect(grammar).toHaveAttribute('data-theme', 'grammaire')
    expect(within(grammar).getByRole('img')).toHaveAttribute('src', '/iles/island-grammaire.png')
  })

  it('renders 7 ile islands, education first + current, the rest locked', async () => {
    render(<CarteWorld />)
    const iles = await screen.findAllByTestId('carte-ile')
    expect(iles).toHaveLength(7)
    expect(iles[0]).toHaveAttribute('data-theme', 'education')
    expect(iles[0]).toHaveAttribute('data-status', 'current')
    for (const ile of iles.slice(1)) {
      expect(ile).toHaveAttribute('data-status', 'locked')
    }
  })

  it('exposes exactly one current-node CTA, on the floating card, to the ile route', async () => {
    render(<CarteWorld />)
    const ctas = await screen.findAllByTestId('carte-current-cta')
    expect(ctas).toHaveLength(1)
    expect(ctas[0].tagName).toBe('A')
    expect(ctas[0]).toHaveAttribute('href', '/ile/education')
    // It lives in the floating current card, which names the current ile.
    const card = screen.getByTestId('carte-current-card')
    expect(card).toHaveTextContent("Île 1 : L'éducation")
    expect(within(card).getByTestId('carte-progress-pct')).toHaveTextContent('0%')
  })

  it('renders buoys as checkpoint markers, not islands: 7 mini-mocks + 1 final', async () => {
    render(<CarteWorld />)
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

  it('renders a locked ile as a non-navigable role="link", not an anchor', async () => {
    render(<CarteWorld />)
    const iles = await screen.findAllByTestId('carte-ile')
    const famille = iles.find((el) => el.getAttribute('data-theme') === 'famille')!
    expect(famille).toHaveAttribute('data-status', 'locked')
    expect(famille.querySelector('a')).toBeNull()
    expect(within(famille).getByRole('link')).toHaveAttribute('aria-disabled', 'true')
  })
})

describe('CarteWorld (target profile resolves the level)', () => {
  it('renders B2 with no authored content: grammar not live, no current card', async () => {
    localStorage.setItem(
      'lm.targetProfile.v1',
      JSON.stringify({ exam: 'TCF', threshold: 'B2 (CLB 7-8)' }),
    )
    render(<CarteWorld />)
    await waitFor(() => {
      expect(screen.getByTestId('carte-level')).toHaveTextContent('Niveau B2')
    })
    expect(screen.getByTestId('carte-grammar')).toHaveAttribute('data-live', 'false')
    expect(screen.queryByTestId('carte-current-cta')).toBeNull()
    expect(screen.queryByTestId('carte-current-card')).toBeNull()
    const iles = screen.getAllByTestId('carte-ile')
    expect(iles).toHaveLength(7)
    for (const ile of iles) expect(ile).toHaveAttribute('data-status', 'bientot')
  })
})

describe('CarteWorld (seance progress advances the current node + progress)', () => {
  it('advances the current card to the next ile and reflects real progress', async () => {
    localStorage.setItem('lm.journeyProgress.v1', JSON.stringify({ B1: ['education'] }))
    render(<CarteWorld />)
    const iles = await screen.findAllByTestId('carte-ile')
    const education = iles.find((el) => el.getAttribute('data-theme') === 'education')!
    const famille = iles.find((el) => el.getAttribute('data-theme') === 'famille')!

    expect(education).toHaveAttribute('data-status', 'completed')
    expect(education.querySelector('a')).toHaveAttribute('href', '/ile/education')

    expect(famille).toHaveAttribute('data-status', 'current')
    const card = screen.getByTestId('carte-current-card')
    expect(card).toHaveTextContent('Île 2 : La famille')
    // 1 of 7 themes complete -> 14%.
    expect(within(card).getByTestId('carte-progress-pct')).toHaveTextContent('14%')
    expect(within(card).getByTestId('carte-current-cta')).toHaveAttribute('href', '/ile/famille')
  })
})
