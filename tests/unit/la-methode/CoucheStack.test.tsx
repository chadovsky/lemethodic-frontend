import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import CoucheStack from '@/components/la-methode/CoucheStack'

// Top-to-bottom order: one How-to headline per block. No eyebrows, no detail.
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

  it('renders exactly five blocks, each with one headline in order', () => {
    render(<CoucheStack />)
    expect(screen.getAllByTestId('couche-stack-layer')).toHaveLength(5)
    const headlines = screen
      .getAllByTestId('couche-stack-headline')
      .map((el) => el.textContent)
    expect(headlines).toEqual(HEADLINES)
  })

  it('headlines are level-3 headings (screen-reader outline under the h2)', () => {
    render(<CoucheStack />)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(5)
  })

  it('has NO couche-name eyebrows and NO detail line on the tiles', () => {
    render(<CoucheStack />)
    expect(screen.queryAllByTestId('couche-stack-eyebrow')).toHaveLength(0)
    expect(screen.queryAllByTestId('couche-stack-detail')).toHaveLength(0)
  })

  it('paints each block from its coral-ramp token (no hardcoded hex)', () => {
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

  it('uses no em-dashes or DM Mono in the rendered output', () => {
    render(<CoucheStack />)
    const region = screen.getByRole('region', { name: /the method, in five layers/i })
    expect(region.textContent).not.toContain('—')
  })
})
