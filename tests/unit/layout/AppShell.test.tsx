import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockPathname = vi.fn<() => string>()

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}))

vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, onClick, ...rest }: any) => (
    <a href={href} onClick={onClick} {...rest}>
      {children}
    </a>
  ),
}))

import AppShell from '@/components/layout/AppShell'

describe('AppShell', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/dashboard')
  })

  it('renders children inside the content frame', () => {
    render(
      <AppShell>
        <div data-testid="shell-child">Hello shell</div>
      </AppShell>,
    )
    expect(screen.getByTestId('shell-child')).toHaveTextContent('Hello shell')
  })

  it('renders the sidebar', () => {
    render(
      <AppShell>
        <div />
      </AppShell>,
    )
    expect(screen.getByTestId('app-shell-sidebar')).toBeInTheDocument()
  })

  it('renders a hamburger button with aria-expanded false initially', () => {
    render(
      <AppShell>
        <div />
      </AppShell>,
    )
    const hamburger = screen.getByTestId('app-shell-hamburger')
    expect(hamburger).toHaveAttribute('aria-expanded', 'false')
    expect(hamburger).toHaveAttribute('aria-controls', 'app-shell-sidebar')
  })

  it('does not render the backdrop initially', () => {
    render(
      <AppShell>
        <div />
      </AppShell>,
    )
    expect(screen.queryByTestId('app-shell-backdrop')).not.toBeInTheDocument()
  })

  it('hamburger click opens drawer; backdrop click closes it', () => {
    render(
      <AppShell>
        <div />
      </AppShell>,
    )
    const hamburger = screen.getByTestId('app-shell-hamburger')
    const sidebar = screen.getByTestId('app-shell-sidebar')

    fireEvent.click(hamburger)
    expect(hamburger).toHaveAttribute('aria-expanded', 'true')
    expect(sidebar).toHaveAttribute('data-drawer-open', 'true')

    const backdrop = screen.getByTestId('app-shell-backdrop')
    fireEvent.click(backdrop)
    expect(hamburger).toHaveAttribute('aria-expanded', 'false')
    expect(sidebar).toHaveAttribute('data-drawer-open', 'false')
  })

  it('clicking a sidebar nav link closes the drawer', () => {
    render(
      <AppShell>
        <div />
      </AppShell>,
    )
    const hamburger = screen.getByTestId('app-shell-hamburger')
    fireEvent.click(hamburger)
    expect(hamburger).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(screen.getByTestId('sidebar-link-account'))
    expect(hamburger).toHaveAttribute('aria-expanded', 'false')
  })

  it('clicking the sidebar wordmark closes the drawer', () => {
    render(
      <AppShell>
        <div />
      </AppShell>,
    )
    const hamburger = screen.getByTestId('app-shell-hamburger')
    fireEvent.click(hamburger)
    expect(hamburger).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(screen.getByTestId('sidebar-wordmark'))
    expect(hamburger).toHaveAttribute('aria-expanded', 'false')
  })

  // MOCK-006 — ed-page-enter + key={pathname} testability
  it('main element has ed-page-enter class', () => {
    render(
      <AppShell>
        <div />
      </AppShell>,
    )
    expect(screen.getByRole('main')).toHaveClass('ed-page-enter')
  })

  it('main data-pathname reflects the current pathname', () => {
    const { rerender } = render(
      <AppShell>
        <div />
      </AppShell>,
    )
    expect(screen.getByRole('main')).toHaveAttribute('data-pathname', '/dashboard')
    mockPathname.mockReturnValue('/ecole')
    rerender(
      <AppShell>
        <div />
      </AppShell>,
    )
    expect(screen.getByRole('main')).toHaveAttribute('data-pathname', '/ecole')
  })
})
