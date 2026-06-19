// F-445 -- TopNav unit tests: unauthenticated renders, mobile header, hydration gate.
// F-446 -- Updated authenticated describe: TopNav returns null (shell split).

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockPathname = vi.fn<() => string>()

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, onClick, ...rest }: any) => (
    <a href={href} onClick={onClick} {...rest}>
      {children}
    </a>
  ),
}))

// F-475 — TopNav now renders the brand logo (next/image) in place of the
// boxed <Wordmark>. Mock next/image to a plain <img> like the layout tests.
vi.mock('next/image', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ src, alt, priority, ...rest }: any) => {
    void priority
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img src={typeof src === 'string' ? src : ''} alt={alt} {...rest} />
  },
}))

// Auth store mock — swap token/hydrated per test.
let mockToken: string | null = null
const mockHydrated = { value: true }
const mockHydrate = vi.fn()

vi.mock('@/lib/auth', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const store = (selector: (s: any) => unknown) =>
    selector({
      get token() { return mockToken },
      get hydrated() { return mockHydrated.value },
    })
  store.getState = () => ({ hydrate: mockHydrate })
  return { useAuthStore: store }
})

import TopNav from '@/components/nav/TopNav'

describe('TopNav — unauthenticated', () => {
  beforeEach(() => {
    mockToken = null
    mockHydrated.value = true
    mockPathname.mockReturnValue('/la-methode')
  })

  it('renders the desktop nav on product routes', () => {
    render(<TopNav />)
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('shows Vocabulary, Exams, Store in the desktop nav (F-447: Library replaced by Store)', () => {
    render(<TopNav />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(nav).toHaveTextContent('Vocabulary')
    expect(nav).toHaveTextContent('Exams')
    expect(nav).toHaveTextContent('Store')
    expect(nav).not.toHaveTextContent('Library')
  })

  it('shows bientôt chips for Real French and AI Tutor', () => {
    render(<TopNav />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(nav).toHaveTextContent('Real French')
    expect(nav).toHaveTextContent('AI Tutor')
  })

  it('shows Pricing, Log in, Start Free on right side', () => {
    render(<TopNav />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(nav.querySelector('a[href="/tarifs"]')).not.toBeNull()
    expect(nav.querySelector('a[href="/connexion"]')).not.toBeNull()
    expect(nav.querySelector('a[href="/inscription"]')).not.toBeNull()
  })

  it('does not show avatar when unauthenticated', () => {
    render(<TopNav />)
    expect(screen.queryByTestId('topnav-avatar')).toBeNull()
  })

  // F-475 — the boxed <Wordmark> is replaced by the brand logo image, linking home.
  it('renders the brand logo in the nav, linking home (/)', () => {
    render(<TopNav />)
    const logo = screen.getByTestId('topnav-logo-img')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', '/brand/lemethodic-logo.png')
    expect(logo.closest('a')).toHaveAttribute('href', '/')
  })

  it('returns null on excluded prefix (/connexion)', () => {
    mockPathname.mockReturnValue('/connexion')
    const { container } = render(<TopNav />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null on excluded prefix (/paywall)', () => {
    mockPathname.mockReturnValue('/paywall')
    const { container } = render(<TopNav />)
    expect(container.firstChild).toBeNull()
  })

  // F-480 — /inscription is now a headerless focused auth surface (like
  // /connexion). The pill nav no longer doubles up with the signup card logo.
  it('returns null on excluded prefix (/inscription)', () => {
    mockPathname.mockReturnValue('/inscription')
    const { container } = render(<TopNav />)
    expect(container.firstChild).toBeNull()
  })

  it('does NOT return null on / (landing page)', () => {
    mockPathname.mockReturnValue('/')
    const { container } = render(<TopNav />)
    expect(container.firstChild).not.toBeNull()
  })

  // F-479 — TopNav is now the single marketing nav: it renders on every route
  // StickyHeader used to serve (the pill replaces the boxed header there).
  // F-480 — /inscription dropped from this list: it is now a headerless auth
  // surface (asserted above), not a pill-nav marketing route.
  it('renders on the previously-StickyHeader routes (F-479 consolidation)', () => {
    for (const route of ['/tarifs', '/librairie', '/examens', '/pieges', '/a-propos', '/faq', '/mentions-legales']) {
      mockPathname.mockReturnValue(route)
      const { container, unmount } = render(<TopNav />)
      expect(container.firstChild, `TopNav should render on ${route}`).not.toBeNull()
      unmount()
    }
  })

  it('returns null on /onboarding (conversion funnel stays headerless)', () => {
    mockPathname.mockReturnValue('/onboarding')
    const { container } = render(<TopNav />)
    expect(container.firstChild).toBeNull()
  })
})

// F-446 shell split: TopNav returns null when token is present.
// The authenticated app shell is the left sidebar (AppShell).
describe('TopNav — authenticated (shell split)', () => {
  beforeEach(() => {
    mockToken = 'test-token'
    mockHydrated.value = true
    mockPathname.mockReturnValue('/la-methode')
  })

  it('returns null when authenticated on a product route', () => {
    const { container } = render(<TopNav />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when authenticated on the landing page (/)', () => {
    mockPathname.mockReturnValue('/')
    const { container } = render(<TopNav />)
    expect(container.firstChild).toBeNull()
  })

  it('does not render the Primary nav when authenticated', () => {
    render(<TopNav />)
    expect(screen.queryByRole('navigation', { name: 'Primary' })).toBeNull()
  })
})

// F-479 — the mobile pill header renders on EVERY route TopNav serves (it is
// logged-out only, so there is never an AppShell topbar to defer to).
describe('TopNav — mobile pill header (all served routes)', () => {
  beforeEach(() => {
    mockToken = null
    mockHydrated.value = true
  })

  it('renders the mobile header on / (landing)', () => {
    mockPathname.mockReturnValue('/')
    render(<TopNav />)
    expect(screen.getByTestId('topnav-mobile')).toBeInTheDocument()
  })

  it('renders the mobile header on a marketing route (/tarifs)', () => {
    mockPathname.mockReturnValue('/tarifs')
    render(<TopNav />)
    expect(screen.getByTestId('topnav-mobile')).toBeInTheDocument()
  })

  it('renders the mobile header on a product route (/la-methode) when logged out', () => {
    mockPathname.mockReturnValue('/la-methode')
    render(<TopNav />)
    expect(screen.getByTestId('topnav-mobile')).toBeInTheDocument()
  })

  it('does NOT render the mobile header on an excluded route (/connexion)', () => {
    mockPathname.mockReturnValue('/connexion')
    render(<TopNav />)
    expect(screen.queryByTestId('topnav-mobile')).toBeNull()
  })

  it('mobile header is present with hamburger', () => {
    mockPathname.mockReturnValue('/tarifs')
    render(<TopNav />)
    expect(screen.getByTestId('topnav-mobile')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument()
  })
})

describe('TopNav — hydration gate', () => {
  it('returns null before hydration completes', () => {
    mockToken = null
    mockHydrated.value = false
    mockPathname.mockReturnValue('/la-methode')
    const { container } = render(<TopNav />)
    expect(container.firstChild).toBeNull()
  })
})
