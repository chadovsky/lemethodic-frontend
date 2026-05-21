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

  it('ToS link points to /legal/tos', () => {
    render(<Footer />)
    const tos = screen.getByRole('link', { name: /terms of service/i })
    expect(tos).toHaveAttribute('href', '/legal/tos')
  })

  it('Privacy link points to /legal/privacy', () => {
    render(<Footer />)
    const privacy = screen.getByRole('link', { name: /privacy policy/i })
    expect(privacy).toHaveAttribute('href', '/legal/privacy')
  })

  it('has a contentinfo landmark', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
