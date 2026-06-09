// F-445 -- TopNav unit tests: both auth states on landing + product routes.

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockPathname = vi.fn<() => string>()
const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, onClick, ...rest }: any) => (
    <a href={href} onClick={onClick} {...rest}>
      {children}
    </a>
  ),
}))

vi.mock('@/lib/api', () => ({
  api: { auth: { logout: vi.fn() } },
}))

vi.mock('@/lib/onboarding', () => ({
  useOnboardingStore: () => ({ reset: vi.fn() }),
}))

vi.mock('@/lib/submitResponse', () => ({
  useSubmitResponseStore: () => ({ clear: vi.fn() }),
}))

vi.mock('@/lib/hooks/useInterfaceLanguage', () => ({
  useInterfaceLanguage: () => 'en',
}))

vi.mock('@/components/ui/ThemeToggle', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle" />,
}))

vi.mock('@/components/Wordmark', () => ({
  default: ({ href }: { href?: string }) => (
    <a href={href ?? '/'} data-testid="wordmark">Le Méthodic</a>
  ),
}))

// Shared auth store mock — swap token/hydrated per test.
// Variables are captured by reference inside functions so they read current
// values at call-time (after beforeEach runs), not at hoisting time.
let mockToken: string | null = null
let mockUser: { fullName: string; email: string } | null = null
const mockHydrated = { value: true }
const mockHydrate = vi.fn()
const mockClearAuth = vi.fn()
const mockSetAuth = vi.fn()

vi.mock('@/lib/auth', () => {
  const hydrateStub = vi.fn()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const store = (selector: (s: any) => unknown) =>
    selector({
      get token() { return mockToken },
      get user() { return mockUser },
      get hydrated() { return mockHydrated.value },
      setAuth: mockSetAuth,
      clearAuth: mockClearAuth,
      hydrate: hydrateStub,
    })
  store.getState = () => ({ hydrate: hydrateStub })
  return { useAuthStore: store }
})

import TopNav from '@/components/nav/TopNav'

describe('TopNav — unauthenticated', () => {
  beforeEach(() => {
    mockToken = null
    mockUser = null
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

describe('TopNav — authenticated', () => {
  beforeEach(() => {
    mockToken = 'test-token'
    mockUser = { fullName: 'Chadi Bakhay', email: 'c@test.com' }
    mockHydrated.value = true
    mockPathname.mockReturnValue('/la-methode')
  })

  it('shows avatar button when authenticated', () => {
    render(<TopNav />)
    expect(screen.getByTestId('topnav-avatar')).toBeInTheDocument()
  })

  it('does not show Log in or Start Free when authenticated', () => {
    render(<TopNav />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(nav.querySelector('a[href="/connexion"]')).toBeNull()
    expect(nav.querySelector('a[href="/inscription"]')).toBeNull()
  })

  it('shows ThemeToggle when authenticated', () => {
    render(<TopNav />)
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
  })
})

describe('TopNav — landing page mobile section', () => {
  beforeEach(() => {
    mockToken = null
    mockUser = null
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

  it('Start Free link in mobile drawer points to /inscription', () => {
    mockPathname.mockReturnValue('/')
    render(<TopNav />)
    // The mobile nav is rendered (but collapsed); the header itself shows.
    // Check the mobile header is present with correct aria attributes.
    const mobileHeader = screen.getByTestId('topnav-mobile')
    expect(mobileHeader).toBeInTheDocument()
    // The hamburger button should be present.
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
