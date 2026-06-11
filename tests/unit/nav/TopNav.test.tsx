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

vi.mock('@/components/Wordmark', () => ({
  default: ({ href }: { href?: string }) => (
    <a href={href ?? '/'} data-testid="wordmark">Le Méthodic</a>
  ),
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

  it('shows Vocabulary, Exams, Library in the desktop nav', () => {
    render(<TopNav />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(nav).toHaveTextContent('Vocabulary')
    expect(nav).toHaveTextContent('Exams')
    expect(nav).toHaveTextContent('Library')
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

  it('does NOT return null on / (landing page)', () => {
    mockPathname.mockReturnValue('/')
    const { container } = render(<TopNav />)
    expect(container.firstChild).not.toBeNull()
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

describe('TopNav — landing page mobile section', () => {
  beforeEach(() => {
    mockToken = null
    mockHydrated.value = true
  })

  it('renders the mobile header on / (landing)', () => {
    mockPathname.mockReturnValue('/')
    render(<TopNav />)
    expect(screen.getByTestId('topnav-mobile')).toBeInTheDocument()
  })

  it('does NOT render the mobile header on /la-methode (AppShell handles mobile)', () => {
    mockPathname.mockReturnValue('/la-methode')
    render(<TopNav />)
    expect(screen.queryByTestId('topnav-mobile')).toBeNull()
  })

  it('mobile header is present with hamburger on landing', () => {
    mockPathname.mockReturnValue('/')
    render(<TopNav />)
    const mobileHeader = screen.getByTestId('topnav-mobile')
    expect(mobileHeader).toBeInTheDocument()
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
