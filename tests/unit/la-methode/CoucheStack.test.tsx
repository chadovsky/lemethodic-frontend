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

describe('CoucheStack', () => {
  it('renders the section as a labelled region', () => {
    render(<CoucheStack />)
    expect(
      screen.getByRole('region', { name: /the method, in five layers/i }),
    ).toBeInTheDocument()
  })

  it('renders the five couches as a list, eyebrow + phrase in order', () => {
    const { container } = render(<CoucheStack />)
    expect(container.querySelectorAll('.couche-stack > li')).toHaveLength(5)
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

  it('drives each layer from the sky tokens (front/side/top) + z-index, no raw hex', () => {
    const { container } = render(<CoucheStack />)
    const lis = container.querySelectorAll<HTMLLIElement>('.couche-stack > li')
    lis.forEach((li, i) => {
      const style = li.getAttribute('style') ?? ''
      expect(style).toContain(`--i: ${i + 1}`)
      expect(style).toContain(`--front: var(--couche-ramp-${i + 1})`)
      expect(style).toContain(`--side: var(--couche-side-${i + 1})`)
      expect(style).toContain(`--top: var(--couche-top-${i + 1})`)
      expect(style).not.toMatch(/#[0-9a-fA-F]{3,6}\b/)
    })
  })

  it('uses no em-dashes in the rendered output', () => {
    render(<CoucheStack />)
    const region = screen.getByRole('region', { name: /the method, in five layers/i })
    expect(region.textContent).not.toContain('—')
  })
})
