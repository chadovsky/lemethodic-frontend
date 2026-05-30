import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

import StickyHeader from '@/components/layout/StickyHeader'

describe('StickyHeader', () => {
  it('renders the logo', () => {
    render(<StickyHeader />)
    expect(screen.getByTestId('wordmark')).toBeInTheDocument()
  })

  it('Sign in link points to /login', () => {
    render(<StickyHeader />)
    const link = screen.getByRole('link', { name: /sign in/i })
    expect(link).toHaveAttribute('href', '/login')
  })

  it('has a banner landmark', () => {
    render(<StickyHeader />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })
})
