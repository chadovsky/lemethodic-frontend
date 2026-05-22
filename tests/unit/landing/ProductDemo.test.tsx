import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ProductDemo from '@/components/landing/ProductDemo'

describe('ProductDemo', () => {
  it('renders the demo section', () => {
    render(<ProductDemo />)
    expect(screen.getByTestId('demo-section')).toBeInTheDocument()
  })

  it('primary image surface is present', () => {
    render(<ProductDemo />)
    expect(screen.getByTestId('demo-image-primary')).toBeInTheDocument()
  })

  it('secondary image surface is present', () => {
    render(<ProductDemo />)
    expect(screen.getByTestId('demo-image-secondary')).toBeInTheDocument()
  })

  it('section has an h2 heading', () => {
    render(<ProductDemo />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('primary image wrapper has ed-card-lift class', () => {
    render(<ProductDemo />)
    expect(screen.getByTestId('demo-image-primary')).toHaveClass('ed-card-lift')
  })

  it('section has a landmark region', () => {
    render(<ProductDemo />)
    expect(screen.getByRole('region', { name: /demo|product/i })).toBeInTheDocument()
  })

  // MOCK-002 — RevealOnScroll wrapping: heading must not be a direct child of section
  it('heading is wrapped in RevealOnScroll, not a direct child of demo-section', () => {
    render(<ProductDemo />)
    const section = screen.getByTestId('demo-section')
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading.parentElement).not.toBe(section)
  })
})
