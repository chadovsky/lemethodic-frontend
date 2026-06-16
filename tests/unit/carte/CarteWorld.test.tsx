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

import CarteWorld from '@/components/carte/CarteWorld'

beforeEach(() => {
  localStorage.clear()
})

describe('CarteWorld (baked scene + overlays, default B1)', () => {
  it('renders the world shell + the baked scene image at B1', async () => {
    render(<CarteWorld />)
    await waitFor(() => {
      expect(screen.getByTestId('carte-level')).toHaveTextContent('Niveau B1')
    })
    expect(screen.getByTestId('carte-journey')).toBeInTheDocument()
    expect(screen.getByTestId('carte-map')).toBeInTheDocument()
    // The scene is a baked image, not painted: one img pointing at the asset.
    const scene = screen.getByTestId('carte-scene')
    expect(scene.tagName).toBe('IMG')
    expect(scene).toHaveAttribute('src', '/iles/carte-scene-light.png')
    // No CSS-world artifacts remain on desktop: no painted islands, no buoys.
    expect(screen.queryByTestId('island-node')).toBeNull()
    expect(screen.queryByTestId('carte-mini-mock')).toBeNull()
    expect(screen.queryByTestId('carte-final-mock')).toBeNull()

    // The coral path is an SVG overlay (the baked image has none): a muted full
    // ribbon + a solid prefix through the current node.
    const path = screen.getByTestId('carte-path')
    expect(path.tagName.toLowerCase()).toBe('svg')
    expect(path.querySelectorAll('path').length).toBe(2)
  })

  it('renders 8 hotspots: the grammar foundation + the 7 themes, each labelled', async () => {
    render(<CarteWorld />)
    // 1 grammar hotspot + 7 ile hotspots = 8 overlays over the baked image.
    const grammar = await screen.findByTestId('carte-grammar')
    expect(grammar).toHaveAttribute('data-live', 'true')
    expect(grammar).toHaveAttribute('data-theme', 'grammaire')
    expect(within(grammar).getByText('La grammaire')).toBeInTheDocument()

    const iles = screen.getAllByTestId('carte-ile')
    expect(iles).toHaveLength(7)
    // Each ile hotspot carries its theme + a visible label (labels are overlays,
    // not baked into the image).
    expect(iles[0]).toHaveAttribute('data-theme', 'education')
    expect(within(iles[0]).getByText("L'éducation")).toBeInTheDocument()
  })

  it('renders 7 ile hotspots, education first + current, the rest locked', async () => {
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
    const card = screen.getByTestId('carte-current-card')
    expect(card).toHaveTextContent("Île 1 : L'éducation")
    expect(within(card).getByTestId('carte-progress-pct')).toHaveTextContent('0%')
  })

  it('marks the current island with the "Vous êtes ici" pin', async () => {
    render(<CarteWorld />)
    const iles = await screen.findAllByTestId('carte-ile')
    const education = iles.find((el) => el.getAttribute('data-theme') === 'education')!
    expect(within(education).getByTestId('carte-here-marker')).toBeInTheDocument()
  })

  it('renders a locked ile as a non-navigable, aria-disabled role="link"', async () => {
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

    // Completed ile is navigable back to its ile route.
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
