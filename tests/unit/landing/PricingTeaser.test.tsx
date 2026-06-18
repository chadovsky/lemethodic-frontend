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

// F-478 — the 5-tier USD teaser is retired. This is a minimal no-price hook:
// a value line + a single "View pricing" CTA linking to /tarifs. No prices.
describe('PricingTeaser', () => {
  it('has a pricing landmark region', () => {
    render(<PricingTeaser />)
    expect(screen.getByRole('region', { name: /pricing/i })).toBeInTheDocument()
  })

  it('renders a single level-2 value-line heading', () => {
    render(<PricingTeaser />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('renders exactly one CTA, "View pricing", linking to /tarifs', () => {
    render(<PricingTeaser />)
    const cta = screen.getByTestId('pricing-cta')
    expect(cta).toHaveTextContent('View pricing')
    expect(cta).toHaveAttribute('href', '/tarifs')
  })

  it('CTA has ed-btn-press class', () => {
    render(<PricingTeaser />)
    expect(screen.getByTestId('pricing-cta')).toHaveClass('ed-btn-press')
  })

  it('shows no prices and no retired tier names', () => {
    const { container } = render(<PricingTeaser />)
    const text = container.textContent ?? ''
    expect(text).not.toMatch(/\$\d/)
    expect(text).not.toMatch(/\d\s?€|€\s?\d/)
    expect(text).not.toMatch(/À la carte|Daily Bundle|Exam Bundle|\bPro\b|\bSprint\b/i)
  })

  it('drops the retired multi-tier testids', () => {
    render(<PricingTeaser />)
    expect(screen.queryByTestId('pricing-tier')).not.toBeInTheDocument()
    expect(screen.queryByTestId('pricing-badge-popular')).not.toBeInTheDocument()
    expect(screen.queryByTestId('tier-cta')).not.toBeInTheDocument()
  })
})
