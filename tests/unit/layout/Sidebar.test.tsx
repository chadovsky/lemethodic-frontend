import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockUsePathname = vi.fn<() => string>()

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

// F-446: ThemeToggle is now part of the sidebar.
vi.mock('@/components/ui/ThemeToggle', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle" aria-label="Switch to dark mode" />,
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
    mockUsePathname.mockReturnValue('/tableau-de-bord')
  })

  it('renders the wordmark "Le Méthodic"', () => {
    render(<Sidebar drawerOpen={false} />)
    expect(screen.getByTestId('sidebar-wordmark')).toHaveTextContent('Le Méthodic')
  })

  it('exposes a primary nav landmark', () => {
    render(<Sidebar drawerOpen={false} />)
    expect(screen.getByRole('navigation', { name: /app sections/i })).toBeInTheDocument()
  })

  it('renders 8 nav links (5 core + 3 revenue) in the locked order with correct hrefs (F-447)', () => {
    render(<Sidebar drawerOpen={false} />)
    const links = screen
      .getAllByRole('link')
      .filter((l) => l.getAttribute('data-testid')?.startsWith('sidebar-link-'))

    // Core nav: La Séance, Tableau de bord, La Méthode, L'Examen, Compte
    // Revenue section: Store, Pricing, Coaching
    expect(links).toHaveLength(8)
    expect(links[0]).toHaveTextContent('La Séance')
    expect(links[0]).toHaveAttribute('href', '/seance')
    expect(links[1]).toHaveTextContent('Tableau de bord')
    expect(links[1]).toHaveAttribute('href', '/tableau-de-bord')
    expect(links[2]).toHaveTextContent('La Méthode')
    expect(links[2]).toHaveAttribute('href', '/la-methode')
    expect(links[3]).toHaveTextContent("L'Examen")
    expect(links[3]).toHaveAttribute('href', '/l-examen')
    expect(links[4]).toHaveTextContent('Compte')
    expect(links[4]).toHaveAttribute('href', '/profil')
    // Revenue section
    expect(links[5]).toHaveTextContent('Store')
    expect(links[5]).toHaveAttribute('href', '/librairie')
    expect(links[6]).toHaveTextContent('Pricing')
    expect(links[6]).toHaveAttribute('href', '/tarifs')
    expect(links[7]).toHaveTextContent('Coaching')
    expect(links[7]).toHaveAttribute('href', '/coaching')
    // La Bibliothèque removed from nav (F-447)
    expect(links.some((l) => l.getAttribute('href') === '/la-bibliotheque')).toBe(false)
  })

  it('marks the link matching the exact current pathname as active', () => {
    mockUsePathname.mockReturnValue('/tableau-de-bord')
    render(<Sidebar drawerOpen={false} />)
    const dashboard = screen.getByTestId('sidebar-link-tableau-de-bord')
    expect(dashboard).toHaveAttribute('data-active', 'true')
    expect(dashboard).toHaveAttribute('aria-current', 'page')

    const account = screen.getByTestId('sidebar-link-profil')
    expect(account).toHaveAttribute('data-active', 'false')
    expect(account).not.toHaveAttribute('aria-current')
  })

  it('marks /seance link active when pathname is /seance', () => {
    mockUsePathname.mockReturnValue('/seance')
    render(<Sidebar drawerOpen={false} />)
    expect(screen.getByTestId('sidebar-link-seance')).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId('sidebar-link-tableau-de-bord')).toHaveAttribute('data-active', 'false')
  })

  it('marks /la-methode link active when pathname is a nested la-methode route', () => {
    mockUsePathname.mockReturnValue('/la-methode/lesson/3')
    render(<Sidebar drawerOpen={false} />)
    expect(screen.getByTestId('sidebar-link-la-methode')).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId('sidebar-link-tableau-de-bord')).toHaveAttribute('data-active', 'false')
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
    mockUsePathname.mockReturnValue('/seance')
    render(<Sidebar drawerOpen={false} />)
    const activeLink = screen.getByTestId('sidebar-link-seance')
    expect(activeLink.parentElement).toHaveClass('sidebar-active-row')
  })

  it('inactive link row does not have sidebar-active-row class', () => {
    mockUsePathname.mockReturnValue('/seance')
    render(<Sidebar drawerOpen={false} />)
    const inactiveLink = screen.getByTestId('sidebar-link-profil')
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

  // F-446 -- ThemeToggle relocated from TopNav authenticated branch to sidebar.
  it('renders ThemeToggle inside the sidebar', () => {
    render(<Sidebar drawerOpen={false} />)
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
  })

  it('ThemeToggle is inside the sidebar-theme-toggle container', () => {
    render(<Sidebar drawerOpen={false} />)
    const container = screen.getByTestId('sidebar-theme-toggle')
    expect(container).toBeInTheDocument()
    expect(container.querySelector('[data-testid="theme-toggle"]')).not.toBeNull()
  })
})
