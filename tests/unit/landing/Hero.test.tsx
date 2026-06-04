import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

import Hero from '@/components/landing/Hero'

describe('Hero', () => {
  it('renders the Direction C headline', () => {
    render(<Hero />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      "There's a method to French. Now there's Le Méthodic."
    )
  })

  it('renders a subheadline', () => {
    render(<Hero />)
    expect(screen.getByTestId('hero-subheadline')).toBeInTheDocument()
  })

  it('primary CTA links to /la-methode', () => {
    render(<Hero />)
    const cta = screen.getByRole('link', { name: /see how it works/i })
    expect(cta).toHaveAttribute('href', '/la-methode')
  })

  it('secondary CTA links to /placement', () => {
    render(<Hero />)
    const cta = screen.getByRole('link', { name: /start with a free placement/i })
    expect(cta).toHaveAttribute('href', '/placement')
  })

  it('has a landmark region', () => {
    render(<Hero />)
    expect(screen.getByRole('region', { name: /hero/i })).toBeInTheDocument()
  })

  it('headline carries ed-hero-rise', () => {
    render(<Hero />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('ed-hero-rise')
  })

  it('subheadline carries ed-hero-rise-delay-2', () => {
    render(<Hero />)
    expect(screen.getByTestId('hero-subheadline')).toHaveClass('ed-hero-rise-delay-2')
  })

  it('CTA wrapper carries ed-hero-rise-delay-3', () => {
    render(<Hero />)
    expect(screen.getByTestId('hero-cta-wrapper')).toHaveClass('ed-hero-rise-delay-3')
  })
})
