import { render, screen, within } from '@testing-library/react'
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

  it('renders five blocks, each with its eyebrow + headline in order', () => {
    render(<CoucheStack />)
    expect(screen.getAllByTestId('couche-stack-layer')).toHaveLength(5)
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

  it('pairs each eyebrow with its headline inside the same block', () => {
    render(<CoucheStack />)
    const layers = screen.getAllByTestId('couche-stack-layer')
    layers.forEach((layer, i) => {
      expect(within(layer).getByTestId('couche-stack-eyebrow')).toHaveTextContent(
        EYEBROWS[i],
      )
      expect(within(layer).getByTestId('couche-stack-headline')).toHaveTextContent(
        HEADLINES[i],
      )
    })
  })

  it('drives each block from the sky front + side ramp tokens (no raw hex)', () => {
    render(<CoucheStack />)
    const layers = screen.getAllByTestId('couche-stack-layer')
    layers.forEach((layer, i) => {
      const style = layer.getAttribute('style') ?? ''
      expect(style).toContain(`--face-top: var(--couche-ramp-${i + 1})`)
      expect(style).toContain(`--face-side: var(--couche-side-${i + 1})`)
      // No coral / sky hex leaked into the markup.
      expect(style).not.toMatch(/#[0-9a-fA-F]{3,6}/)
    })
  })

  it('uses no em-dashes in the rendered output', () => {
    render(<CoucheStack />)
    const region = screen.getByRole('region', { name: /the method, in five layers/i })
    expect(region.textContent).not.toContain('—')
  })
})
