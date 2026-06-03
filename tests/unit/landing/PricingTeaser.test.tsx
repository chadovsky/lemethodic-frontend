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

import PricingTeaser from '@/components/landing/PricingTeaser'

const EXPECTED_SLUGS = ['a-la-carte', 'daily-bundle', 'exam-bundle', 'pro', 'sprint']

describe('PricingTeaser', () => {
  it('renders 5 tier cards', () => {
    render(<PricingTeaser />)
    expect(screen.getAllByTestId('pricing-tier')).toHaveLength(5)
  })

  it('Daily Bundle is marked as Most popular', () => {
    render(<PricingTeaser />)
    expect(screen.getByTestId('pricing-badge-popular')).toBeInTheDocument()
    expect(screen.getByTestId('pricing-badge-popular')).toHaveTextContent('Most popular')
  })

  it('each CTA links to /signup with the correct tier slug', () => {
    render(<PricingTeaser />)
    const ctas = screen.getAllByTestId('tier-cta')
    expect(ctas).toHaveLength(5)
    EXPECTED_SLUGS.forEach((slug, i) => {
      expect(ctas[i]).toHaveAttribute('href', `/inscription?tier=${slug}`)
    })
  })

  it('has a landmark region', () => {
    render(<PricingTeaser />)
    expect(screen.getByRole('region', { name: /pricing/i })).toBeInTheDocument()
  })

  it('renders the section heading', () => {
    render(<PricingTeaser />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  // MOCK-004 — ed-card-lift + ed-btn-press + badge testid
  it('each tier card has ed-card-lift class', () => {
    render(<PricingTeaser />)
    screen.getAllByTestId('pricing-tier').forEach((card) => {
      expect(card).toHaveClass('ed-card-lift')
    })
  })

  it('each tier CTA has ed-btn-press class', () => {
    render(<PricingTeaser />)
    screen.getAllByTestId('tier-cta').forEach((cta) => {
      expect(cta).toHaveClass('ed-btn-press')
    })
  })

  it('pricing-badge-popular has correct testid and text', () => {
    render(<PricingTeaser />)
    const badge = screen.getByTestId('pricing-badge-popular')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Most popular')
  })
})
