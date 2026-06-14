import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, onClick, ...rest }: any) => (
    <a href={href} onClick={onClick} {...rest}>
      {children}
    </a>
  ),
}))

// Stub ThemeToggle so the bar test doesn't depend on next-themes internals.
vi.mock('@/components/ui/ThemeToggle', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle" aria-label="Switch to dark mode" />,
}))

import AppTopBar from '@/components/layout/AppTopBar'

describe('AppTopBar', () => {
  it('renders the hamburger wired to onHamburgerClick', () => {
    const onHamburgerClick = vi.fn()
    render(<AppTopBar onHamburgerClick={onHamburgerClick} drawerOpen={false} />)
    const hamburger = screen.getByTestId('app-shell-hamburger')
    expect(hamburger).toHaveAttribute('aria-controls', 'app-shell-sidebar')
    expect(hamburger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(hamburger)
    expect(onHamburgerClick).toHaveBeenCalledTimes(1)
  })

  it('reflects drawerOpen on the hamburger aria-expanded', () => {
    render(<AppTopBar onHamburgerClick={vi.fn()} drawerOpen={true} />)
    expect(screen.getByTestId('app-shell-hamburger')).toHaveAttribute('aria-expanded', 'true')
  })

  it('renders an inert (disabled) search field', () => {
    render(<AppTopBar onHamburgerClick={vi.fn()} drawerOpen={false} />)
    const search = screen.getByTestId('app-topbar-search')
    const input = search.querySelector('input')
    expect(input).not.toBeNull()
    expect(input).toBeDisabled()
  })

  it('renders an inert notifications bell (no handler, not focusable)', () => {
    render(<AppTopBar onHamburgerClick={vi.fn()} drawerOpen={false} />)
    const bell = screen.getByTestId('app-topbar-bell')
    expect(bell).toHaveAttribute('aria-disabled', 'true')
    expect(bell).toHaveAttribute('tabindex', '-1')
  })

  it('hosts the theme toggle and the user menu', () => {
    render(
      <AppTopBar
        onHamburgerClick={vi.fn()}
        drawerOpen={false}
        fullName="Chadi Bakhay"
        email="chadi@example.com"
      />,
    )
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
    expect(screen.getByTestId('user-menu-trigger')).toBeInTheDocument()
  })
})
