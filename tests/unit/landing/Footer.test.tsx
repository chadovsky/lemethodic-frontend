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

import Footer from '@/components/landing/Footer'

describe('Footer', () => {
  it('renders 3 link columns', () => {
    render(<Footer />)
    expect(screen.getAllByTestId('footer-column')).toHaveLength(3)
  })

  it('has copyright line', () => {
    render(<Footer />)
    expect(screen.getByTestId('footer-copyright')).toHaveTextContent('© 2026 Le Méthodic')
  })

  it('Mentions légales link points to /mentions-legales', () => {
    render(<Footer />)
    const mentions = screen.getByRole('link', { name: /mentions légales/i })
    expect(mentions).toHaveAttribute('href', '/mentions-legales')
  })

  it('Politique de confidentialité link points to /confidentialite', () => {
    render(<Footer />)
    const privacy = screen.getByRole('link', { name: /politique de confidentialité/i })
    expect(privacy).toHaveAttribute('href', '/confidentialite')
  })

  it('CGV link points to /cgv', () => {
    render(<Footer />)
    const cgv = screen.getByRole('link', { name: /cgv/i })
    expect(cgv).toHaveAttribute('href', '/cgv')
  })

  it('has a contentinfo landmark', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  // MOCK-004 — wordmark testid + social links
  it('wordmark element has footer-wordmark testid', () => {
    render(<Footer />)
    expect(screen.getByTestId('footer-wordmark')).toBeInTheDocument()
  })

  it('GitHub social link has correct testid and href', () => {
    render(<Footer />)
    const gh = screen.getByTestId('footer-social-github')
    expect(gh).toBeInTheDocument()
    expect(gh).toHaveAttribute('href', '#')
  })

  it('Twitter/X social link has correct testid and href', () => {
    render(<Footer />)
    const tw = screen.getByTestId('footer-social-twitter')
    expect(tw).toBeInTheDocument()
    expect(tw).toHaveAttribute('href', '#')
  })
})
