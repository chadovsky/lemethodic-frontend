import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
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
})
