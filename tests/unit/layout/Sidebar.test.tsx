import { render, screen } from '@testing-library/react'
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

vi.mock('next/image', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ src, alt, priority, ...rest }: any) => {
    void priority
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img src={typeof src === 'string' ? src : ''} alt={alt} {...rest} />
  },
}))

import Sidebar from '@/components/layout/Sidebar'

describe('Sidebar', () => {
  beforeEach(() => {
    mockUsePathname.mockReset()
    mockUsePathname.mockReturnValue('/tableau-de-bord')
  })

  // F-473 — header brand is now the logo image (expanded), linking to the dash.
  it('renders the brand wordmark image linking to the dashboard', () => {
    render(<Sidebar drawerOpen={false} />)
    const link = screen.getByTestId('sidebar-wordmark')
    expect(link).toHaveAttribute('href', '/tableau-de-bord')
    expect(screen.getByTestId('sidebar-logo-img')).toBeInTheDocument()
    expect(screen.getByAltText('Le Méthodic')).toBeInTheDocument()
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

  // F-473 — the CH avatar + boxed typewriter wordmark are retired in favour of
  // the brand logo (expanded) / square mark (collapsed).
  it('no longer renders the CH avatar', () => {
    render(<Sidebar drawerOpen={false} />)
    expect(screen.queryByTestId('sidebar-avatar')).not.toBeInTheDocument()
  })

  it('renders the square mark (not the wordmark) when compact', () => {
    render(<Sidebar drawerOpen={false} compact />)
    const mark = screen.getByTestId('sidebar-mark')
    expect(mark).toHaveAttribute('href', '/tableau-de-bord')
    expect(screen.getByTestId('sidebar-mark-img')).toBeInTheDocument()
    expect(screen.queryByTestId('sidebar-wordmark')).not.toBeInTheDocument()
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

  // F-455 — sidebar logout row removed; logout lives solely in the user
  // dropdown (AppTopBar → UserMenu). Deduped the second affordance.
  it('no longer renders a sidebar sign-out row', () => {
    render(<Sidebar drawerOpen={false} />)
    expect(screen.queryByTestId('sidebar-signout')).not.toBeInTheDocument()
  })

  // F-455 — legacy left-tab indicator replaced by the active pill.
  it('no longer renders the legacy active left-tab indicator', () => {
    mockUsePathname.mockReturnValue('/seance')
    render(<Sidebar drawerOpen={false} />)
    expect(screen.queryByTestId('sidebar-active-tab')).not.toBeInTheDocument()
  })

  // F-453 -- ThemeToggle relocated out of the sidebar to the app top bar.
  it('no longer renders the ThemeToggle inside the sidebar', () => {
    render(<Sidebar drawerOpen={false} />)
    expect(screen.queryByTestId('sidebar-theme-toggle')).not.toBeInTheDocument()
  })
})
