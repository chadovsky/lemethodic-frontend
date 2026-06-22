import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import CoucheStack from '@/components/la-methode/CoucheStack'

// Top-to-bottom order: couche eyebrow + its How-to phrase.
const EYEBROWS = [
  'Le Propos',
  'Le Plan',
  'La Construction',
  'Les Pièges Anglais',
  'La Musique',
]

const HEADLINES = [
  'How to say what you actually mean',
  'How to organize your ideas in French',
  'How to build sentences that hold up',
  'How to dodge the English traps',
  'How to sound native, not assembled',
]

describe('CoucheStack (SVG)', () => {
  it('renders the section as a labelled region', () => {
    render(<CoucheStack />)
    expect(
      screen.getByRole('region', { name: /the method, in five layers/i }),
    ).toBeInTheDocument()
  })

  it('renders an SVG image with a title + desc covering all five couches', () => {
    const { container } = render(<CoucheStack />)
    const svg = screen.getByTestId('couche-stack-svg')
    expect(svg.tagName.toLowerCase()).toBe('svg')
    expect(svg).toHaveAttribute('role', 'img')
    expect(container.querySelector('title')?.textContent).toMatch(/five layers/i)
    const desc = container.querySelector('desc')?.textContent ?? ''
    EYEBROWS.forEach((e) => expect(desc).toContain(e))
    HEADLINES.forEach((h) => expect(desc).toContain(h))
  })

  it('renders the five eyebrows + headlines in order', () => {
    render(<CoucheStack />)
    expect(
      screen.getAllByTestId('couche-stack-eyebrow').map((el) => el.textContent),
    ).toEqual(EYEBROWS)
    expect(
      screen.getAllByTestId('couche-stack-headline').map((el) => el.textContent),
    ).toEqual(HEADLINES)
  })

  it('keeps the proper French accents on the couche eyebrows (UTF-8)', () => {
    render(<CoucheStack />)
    expect(screen.getByText('Les Pièges Anglais')).toBeInTheDocument()
    expect(screen.getByText('La Musique')).toBeInTheDocument()
  })

  it('renders five front + five side polygons plus the couche-0 top cap', () => {
    const { container } = render(<CoucheStack />)
    // 5 side wall + 1 top cap + 5 front faces = 11 polygons.
    expect(container.querySelectorAll('polygon')).toHaveLength(11)
  })

  it('drives every face from the sky tokens — no raw hex in the SVG', () => {
    const { container } = render(<CoucheStack />)
    const svg = screen.getByTestId('couche-stack-svg')
    // Fills reference var(--couche-*); ink references var(--couche-ink).
    expect(svg.outerHTML).toContain('var(--couche-ramp-1)')
    expect(svg.outerHTML).toContain('var(--couche-side-5)')
    expect(svg.outerHTML).toContain('var(--couche-top-1)')
    expect(svg.outerHTML).not.toMatch(/#[0-9a-fA-F]{3,6}\b/)
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,6}\b/)
  })

  it('uses no em-dashes in the rendered output', () => {
    render(<CoucheStack />)
    const region = screen.getByRole('region', { name: /the method, in five layers/i })
    expect(region.textContent).not.toContain('—')
  })
})
