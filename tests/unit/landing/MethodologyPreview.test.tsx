import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

import MethodologyPreview from '@/components/landing/MethodologyPreview'

const LAYER_ORDER = [
  'Le Fond',
  'Les Moules des Idées',
  'Les Moules',
  'Les Réflexes Anglais',
  'La Voix',
]

describe('MethodologyPreview', () => {
  it('renders the section heading', () => {
    render(<MethodologyPreview />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('The 5-Couche Method')
  })

  it('renders all five layers in correct order', () => {
    render(<MethodologyPreview />)
    const names = screen.getAllByTestId('couche-name').map((el) => el.textContent)
    expect(names).toEqual(LAYER_ORDER)
  })

  it('each layer has a non-empty description', () => {
    render(<MethodologyPreview />)
    const layers = screen.getAllByTestId('couche-layer')
    expect(layers).toHaveLength(5)
    layers.forEach((layer) => {
      const desc = within(layer).getByTestId('couche-description')
      expect(desc.textContent?.trim().length).toBeGreaterThan(0)
    })
  })

  it('CTA links to /method', () => {
    render(<MethodologyPreview />)
    const cta = screen.getByRole('link', { name: /see how it works/i })
    expect(cta).toHaveAttribute('href', '/method')
  })

  it('has a landmark region', () => {
    render(<MethodologyPreview />)
    expect(
      screen.getByRole('region', { name: /5-couche method/i })
    ).toBeInTheDocument()
  })
})
