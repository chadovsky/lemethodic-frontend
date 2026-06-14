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

const mockUsePathname = vi.fn<() => string>(() => '/tableau-de-bord')
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
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

  it('renders the page title resolved from the route', () => {
    mockUsePathname.mockReturnValue('/la-methode/lesson/3')
    render(<AppTopBar onHamburgerClick={vi.fn()} drawerOpen={false} />)
    expect(screen.getByTestId('app-topbar-title')).toHaveTextContent('La Méthode')
    mockUsePathname.mockReturnValue('/tableau-de-bord')
  })

  it('renders the placed EN/FR language toggle (inert, FR active)', () => {
    render(<AppTopBar onHamburgerClick={vi.fn()} drawerOpen={false} />)
    const lang = screen.getByTestId('app-topbar-lang')
    expect(lang).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByTestId('app-topbar-lang-fr')).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId('app-topbar-lang-en')).toHaveAttribute('data-active', 'false')
  })

  it('renders the unread coral dot only when hasUnread is set', () => {
    const { rerender } = render(<AppTopBar onHamburgerClick={vi.fn()} drawerOpen={false} />)
    expect(screen.queryByTestId('app-topbar-bell-dot')).not.toBeInTheDocument()
    rerender(<AppTopBar onHamburgerClick={vi.fn()} drawerOpen={false} hasUnread />)
    expect(screen.getByTestId('app-topbar-bell-dot')).toBeInTheDocument()
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
