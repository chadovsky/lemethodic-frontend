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
  it('renders the locked headline', () => {
    render(<Hero />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Pass TCF Canada. Get to Quebec.'
    )
  })

  it('renders a subheadline', () => {
    render(<Hero />)
    expect(screen.getByTestId('hero-subheadline')).toBeInTheDocument()
  })

  it('CTA links to /signup', () => {
    render(<Hero />)
    const cta = screen.getByRole('link', { name: /start your prep/i })
    expect(cta).toHaveAttribute('href', '/signup')
  })

  it('has a landmark region', () => {
    render(<Hero />)
    expect(screen.getByRole('region', { name: /hero/i })).toBeInTheDocument()
  })
})
