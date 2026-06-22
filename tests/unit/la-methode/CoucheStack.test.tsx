import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import CoucheStack from '@/components/la-methode/CoucheStack'

// Top-to-bottom order: French couche names (eyebrows) and their How-to headlines.
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

  it('renders all five eyebrows (French couche names) in order', () => {
    render(<CoucheStack />)
    const eyebrows = screen
      .getAllByTestId('couche-stack-eyebrow')
      .map((el) => el.textContent)
    expect(eyebrows).toEqual(EYEBROWS)
  })

  it('renders all five How-to headlines in order', () => {
    render(<CoucheStack />)
    const headlines = screen
      .getAllByTestId('couche-stack-headline')
      .map((el) => el.textContent)
    expect(headlines).toEqual(HEADLINES)
  })

  it('renders proper French accents on the couche names', () => {
    render(<CoucheStack />)
    expect(screen.getByText('Les Pièges Anglais')).toBeInTheDocument()
    expect(screen.getByText('La Musique')).toBeInTheDocument()
  })

  it('each layer is keyboard focusable and ARIA labelled', () => {
    render(<CoucheStack />)
    const layers = screen.getAllByTestId('couche-stack-layer')
    expect(layers).toHaveLength(5)
    layers.forEach((layer, i) => {
      expect(layer).toHaveAttribute('tabindex', '0')
      expect(layer).toHaveAttribute('role', 'group')
      expect(layer).toHaveAttribute(
        'aria-label',
        `${EYEBROWS[i]}: ${HEADLINES[i]}`,
      )
    })
  })

  it('each layer has a non-empty detail line in the DOM (screen-reader reachable)', () => {
    render(<CoucheStack />)
    const layers = screen.getAllByTestId('couche-stack-layer')
    layers.forEach((layer) => {
      const detail = within(layer).getByTestId('couche-stack-detail')
      expect(detail.textContent?.trim().length).toBeGreaterThan(0)
    })
  })

  it('paints each band from its coral-ramp token (no hardcoded hex)', () => {
    render(<CoucheStack />)
    const layers = screen.getAllByTestId('couche-stack-layer')
    layers.forEach((layer, i) => {
      expect(layer.getAttribute('style')).toContain(
        `--face-top: var(--couche-ramp-${i + 1})`,
      )
    })
  })

  it('assigns AA-safe text color per layer (dark on upper, light on deepest)', () => {
    render(<CoucheStack />)
    const expected = ['black', 'black', 'black', 'white', 'white']
    const layers = screen.getAllByTestId('couche-stack-layer')
    layers.forEach((layer, i) => {
      expect(layer.getAttribute('style')).toContain(`--face-text: ${expected[i]}`)
    })
  })

  it('uses no em-dashes in copy', () => {
    render(<CoucheStack />)
    const region = screen.getByRole('region', { name: /the method, in five layers/i })
    expect(region.textContent).not.toContain('—')
  })
})
