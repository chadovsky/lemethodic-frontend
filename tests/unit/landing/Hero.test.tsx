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

  // MOCK-001 — RotatingKicker integration
  it('renders the kicker container', () => {
    render(<Hero />)
    expect(screen.getByTestId('hero-kicker')).toBeInTheDocument()
  })

  it('kicker contains at least one of the 4 exam names', () => {
    render(<Hero />)
    const kicker = screen.getByTestId('hero-kicker')
    const text = kicker.textContent ?? ''
    const EXAM_NAMES = ['TCF', 'TEF', 'DELF', 'DALF']
    expect(EXAM_NAMES.some((name) => text.includes(name))).toBe(true)
  })

  // MOCK-001 — animation class assertions
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
