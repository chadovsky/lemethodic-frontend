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

import CartePath from '@/components/carte/CartePath'

beforeEach(() => {
  localStorage.clear()
})

describe('CartePath (learning path, default B1)', () => {
  it('renders the journey shell, the trail, and the level pill', async () => {
    render(<CartePath />)
    await waitFor(() => {
      expect(screen.getByTestId('carte-level')).toHaveTextContent('Niveau B1')
    })
    expect(screen.getByTestId('carte-journey')).toBeInTheDocument()
    expect(screen.getByTestId('carte-map')).toBeInTheDocument()
    // The winding trail is an SVG with a slate full path + a coral prefix (B1 has
    // a current node, so the coral prefix exists -> 2 paths).
    const trail = screen.getByTestId('carte-trail')
    expect(trail.tagName.toLowerCase()).toBe('svg')
    expect(trail.querySelectorAll('path').length).toBe(2)
  })

  it('renders 8 bubbles: the grammar foundation + the 7 themes, each labelled', async () => {
    render(<CartePath />)
    const bubbles = await screen.findAllByTestId('carte-bubble')
    expect(bubbles).toHaveLength(8)

    const grammar = screen.getByTestId('carte-grammar')
    expect(grammar).toHaveAttribute('data-live', 'true')
    expect(grammar).toHaveAttribute('data-theme', 'grammaire')
    expect(grammar).toHaveAttribute('data-status', 'completed')
    expect(within(grammar).getByText('La grammaire')).toBeInTheDocument()

    const iles = screen.getAllByTestId('carte-ile')
    expect(iles).toHaveLength(7)
    expect(iles[0]).toHaveAttribute('data-theme', 'education')
    expect(within(iles[0]).getByText("L'éducation")).toBeInTheDocument()
  })

  it('marks education current + the rest locked, with the right badges', async () => {
    render(<CartePath />)
    const iles = await screen.findAllByTestId('carte-ile')
    expect(iles[0]).toHaveAttribute('data-status', 'current')
    for (const ile of iles.slice(1)) {
      expect(ile).toHaveAttribute('data-status', 'locked')
      // Locked iles carry a lock badge, not a navigable anchor.
      expect(within(ile).getByTestId('carte-lock-badge')).toBeInTheDocument()
      expect(ile.querySelector('a')).toBeNull()
      expect(within(ile).getByRole('link')).toHaveAttribute('aria-disabled', 'true')
    }
    // The completed grammar foundation shows a check badge.
    expect(within(screen.getByTestId('carte-grammar')).getByTestId('carte-check-badge')).toBeInTheDocument()
  })

  it('exposes exactly one current-node CTA, on the card, to the ile route', async () => {
    render(<CartePath />)
    const ctas = await screen.findAllByTestId('carte-current-cta')
    expect(ctas).toHaveLength(1)
    expect(ctas[0].tagName).toBe('A')
    expect(ctas[0]).toHaveAttribute('href', '/ile/education')

    const card = screen.getByTestId('carte-current-card')
    expect(card).toHaveTextContent('Île 1')
    expect(card).toHaveTextContent("L'éducation")
    expect(within(card).getByTestId('carte-progress-pct')).toHaveTextContent('0%')
  })
})

describe('CartePath (target profile resolves the level)', () => {
  it('renders B2 with no authored content: grammar not live, no current card', async () => {
    localStorage.setItem(
      'lm.targetProfile.v1',
      JSON.stringify({ exam: 'TCF', threshold: 'B2 (CLB 7-8)' }),
    )
    render(<CartePath />)
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

describe('CartePath (seance progress advances the current node + progress)', () => {
  it('advances the card to the next ile and reflects real progress', async () => {
    localStorage.setItem('lm.journeyProgress.v1', JSON.stringify({ B1: ['education'] }))
    render(<CartePath />)
    const iles = await screen.findAllByTestId('carte-ile')
    const education = iles.find((el) => el.getAttribute('data-theme') === 'education')!
    const famille = iles.find((el) => el.getAttribute('data-theme') === 'famille')!

    // Completed ile is navigable back to its ile route + shows a check badge.
    expect(education).toHaveAttribute('data-status', 'completed')
    expect(education.querySelector('a')).toHaveAttribute('href', '/ile/education')
    expect(within(education).getByTestId('carte-check-badge')).toBeInTheDocument()

    expect(famille).toHaveAttribute('data-status', 'current')
    const card = screen.getByTestId('carte-current-card')
    expect(card).toHaveTextContent('Île 2')
    expect(card).toHaveTextContent('La famille')
    // 1 of 7 themes complete -> 14%.
    expect(within(card).getByTestId('carte-progress-pct')).toHaveTextContent('14%')
    expect(within(card).getByTestId('carte-current-cta')).toHaveAttribute('href', '/ile/famille')
  })
})
