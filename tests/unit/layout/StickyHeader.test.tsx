import { render, screen, act } from '@testing-library/react'
import { describe, expect, it, vi, afterEach } from 'vitest'

const mockUsePathname = vi.fn<() => string>()

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
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
  afterEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
  })

  it('renders on marketing paths', () => {
    mockUsePathname.mockReturnValue('/tarifs')
    render(<StickyHeader />)
    expect(screen.getByTestId('sticky-header')).toBeInTheDocument()
  })

  it('does not render on authenticated paths', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    render(<StickyHeader />)
    expect(screen.queryByTestId('sticky-header')).toBeNull()
  })

  // F-475 — /connexion is a focused auth surface: no marketing header chrome.
  it('does not render on the sign-in page (/connexion)', () => {
    mockUsePathname.mockReturnValue('/connexion')
    render(<StickyHeader />)
    expect(screen.queryByTestId('sticky-header')).toBeNull()
  })

  it('renders logo link and Sign in link', () => {
    mockUsePathname.mockReturnValue('/tarifs')
    render(<StickyHeader />)
    expect(screen.getByTestId('wordmark')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
  })

  // MOCK-001 — scroll-state class
  it('does not have scrolled class at scrollY=0', () => {
    mockUsePathname.mockReturnValue('/tarifs')
    render(<StickyHeader />)
    expect(screen.getByTestId('sticky-header')).not.toHaveClass('sticky-header--scrolled')
  })

  it('gains sticky-header--scrolled class when scrollY > 60', async () => {
    mockUsePathname.mockReturnValue('/tarifs')
    render(<StickyHeader />)
    await act(async () => {
      Object.defineProperty(window, 'scrollY', { value: 80, configurable: true })
      window.dispatchEvent(new Event('scroll'))
    })
    expect(screen.getByTestId('sticky-header')).toHaveClass('sticky-header--scrolled')
  })

  it('loses scrolled class when scrollY returns to 0', async () => {
    mockUsePathname.mockReturnValue('/tarifs')
    render(<StickyHeader />)
    await act(async () => {
      Object.defineProperty(window, 'scrollY', { value: 80, configurable: true })
      window.dispatchEvent(new Event('scroll'))
    })
    await act(async () => {
      Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
      window.dispatchEvent(new Event('scroll'))
    })
    expect(screen.getByTestId('sticky-header')).not.toHaveClass('sticky-header--scrolled')
  })

  it('does not gain scrolled class at exactly scrollY=60', async () => {
    mockUsePathname.mockReturnValue('/tarifs')
    render(<StickyHeader />)
    await act(async () => {
      Object.defineProperty(window, 'scrollY', { value: 60, configurable: true })
      window.dispatchEvent(new Event('scroll'))
    })
    expect(screen.getByTestId('sticky-header')).not.toHaveClass('sticky-header--scrolled')
  })
})
