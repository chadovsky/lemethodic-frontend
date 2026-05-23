import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockUsePathname = vi.fn<() => string>()

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, onClick, ...rest }: any) => (
    <a href={href} onClick={onClick} {...rest}>
      {children}
    </a>
  ),
}))

import Sidebar from '@/components/layout/Sidebar'

describe('Sidebar', () => {
  beforeEach(() => {
    mockUsePathname.mockReset()
    mockUsePathname.mockReturnValue('/dashboard')
  })

  it('renders the wordmark "Le Méthodic"', () => {
    render(<Sidebar drawerOpen={false} />)
    expect(screen.getByTestId('sidebar-wordmark')).toHaveTextContent('Le Méthodic')
  })

  it('exposes a primary nav landmark', () => {
    render(<Sidebar drawerOpen={false} />)
    expect(screen.getByRole('navigation', { name: /app sections/i })).toBeInTheDocument()
  })

  it('renders 5 nav links in the locked order with correct hrefs', () => {
    render(<Sidebar drawerOpen={false} />)
    const links = screen
      .getAllByRole('link')
      .filter((l) => l.getAttribute('data-testid')?.startsWith('sidebar-link-'))

    expect(links).toHaveLength(5)
    expect(links[0]).toHaveTextContent('Tableau de bord')
    expect(links[0]).toHaveAttribute('href', '/dashboard')
    expect(links[1]).toHaveTextContent("L'École")
    expect(links[1]).toHaveAttribute('href', '/ecole')
    expect(links[2]).toHaveTextContent('Le Vocabulaire')
    expect(links[2]).toHaveAttribute('href', '/vocabulaire')
    expect(links[3]).toHaveTextContent('Le Diagnostic')
    expect(links[3]).toHaveAttribute('href', '/diagnostic')
    expect(links[4]).toHaveTextContent('Compte')
    expect(links[4]).toHaveAttribute('href', '/account')
  })

  it('marks the link matching the exact current pathname as active', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    render(<Sidebar drawerOpen={false} />)
    const dashboard = screen.getByTestId('sidebar-link-dashboard')
    expect(dashboard).toHaveAttribute('data-active', 'true')
    expect(dashboard).toHaveAttribute('aria-current', 'page')

    const account = screen.getByTestId('sidebar-link-account')
    expect(account).toHaveAttribute('data-active', 'false')
    expect(account).not.toHaveAttribute('aria-current')
  })

  it('marks /ecole link active when pathname is a nested ecole route', () => {
    mockUsePathname.mockReturnValue('/ecole/lesson/3')
    render(<Sidebar drawerOpen={false} />)
    expect(screen.getByTestId('sidebar-link-ecole')).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId('sidebar-link-dashboard')).toHaveAttribute('data-active', 'false')
  })

  it('reflects drawerOpen prop on data-drawer-open attribute', () => {
    const { rerender } = render(<Sidebar drawerOpen={false} />)
    expect(screen.getByTestId('app-shell-sidebar')).toHaveAttribute('data-drawer-open', 'false')
    rerender(<Sidebar drawerOpen={true} />)
    expect(screen.getByTestId('app-shell-sidebar')).toHaveAttribute('data-drawer-open', 'true')
  })

  // MOCK-006 — avatar + active row treatment
  it('renders avatar element with sidebar-avatar testid', () => {
    render(<Sidebar drawerOpen={false} />)
    expect(screen.getByTestId('sidebar-avatar')).toBeInTheDocument()
  })

  it('avatar displays default initials "CH"', () => {
    render(<Sidebar drawerOpen={false} />)
    expect(screen.getByTestId('sidebar-avatar')).toHaveTextContent('CH')
  })

  it('avatar accepts custom initials prop', () => {
    render(<Sidebar drawerOpen={false} initials="AB" />)
    expect(screen.getByTestId('sidebar-avatar')).toHaveTextContent('AB')
  })

  it('active link row has sidebar-active-row class', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    render(<Sidebar drawerOpen={false} />)
    const activeLink = screen.getByTestId('sidebar-link-dashboard')
    expect(activeLink.parentElement).toHaveClass('sidebar-active-row')
  })

  it('inactive link row does not have sidebar-active-row class', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    render(<Sidebar drawerOpen={false} />)
    const inactiveLink = screen.getByTestId('sidebar-link-account')
    expect(inactiveLink.parentElement).not.toHaveClass('sidebar-active-row')
  })

  // BE-001 — signout affordance
  it('renders a sign-out button when onSignOut prop is provided', () => {
    render(<Sidebar drawerOpen={false} onSignOut={vi.fn()} />)
    expect(screen.getByTestId('sidebar-signout')).toBeInTheDocument()
  })

  it('clicking sign-out calls the onSignOut callback', () => {
    const onSignOut = vi.fn()
    render(<Sidebar drawerOpen={false} onSignOut={onSignOut} />)
    fireEvent.click(screen.getByTestId('sidebar-signout'))
    expect(onSignOut).toHaveBeenCalledTimes(1)
  })
})
