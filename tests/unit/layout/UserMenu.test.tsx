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

import UserMenu from '@/components/layout/UserMenu'

describe('UserMenu', () => {
  it('trigger shows the first initial and first name', () => {
    render(<UserMenu fullName="Chadi Bakhay" email="chadi@example.com" />)
    expect(screen.getByTestId('user-menu-avatar')).toHaveTextContent('C')
    expect(screen.getByTestId('user-menu-firstname')).toHaveTextContent('Chadi')
  })

  it('falls back to the email local-part when no full name', () => {
    render(<UserMenu email="someone@example.com" />)
    expect(screen.getByTestId('user-menu-firstname')).toHaveTextContent('someone')
  })

  it('avatar colour is deterministic for the same first name', () => {
    const { unmount } = render(<UserMenu fullName="Chadi Bakhay" />)
    const colorA = screen.getByTestId('user-menu-avatar').style.backgroundColor
    unmount()
    render(<UserMenu fullName="Chadi Dupont" />)
    const colorB = screen.getByTestId('user-menu-avatar').style.backgroundColor
    expect(colorA).toBe(colorB)
  })

  it('menu is closed initially and opens on trigger click', () => {
    render(<UserMenu fullName="Chadi" email="chadi@example.com" />)
    expect(screen.queryByTestId('user-menu-dropdown')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('user-menu-trigger'))
    expect(screen.getByTestId('user-menu-dropdown')).toBeInTheDocument()
    expect(screen.getByTestId('user-menu-trigger')).toHaveAttribute('aria-expanded', 'true')
  })

  it('header shows the first name and email', () => {
    render(<UserMenu fullName="Chadi Bakhay" email="chadi@example.com" />)
    fireEvent.click(screen.getByTestId('user-menu-trigger'))
    expect(screen.getByTestId('user-menu-header-name')).toHaveTextContent('Chadi')
    expect(screen.getByTestId('user-menu-header-email')).toHaveTextContent('chadi@example.com')
  })

  it('Settings links to /parametres and Subscription to /abonnement', () => {
    render(<UserMenu fullName="Chadi" email="chadi@example.com" />)
    fireEvent.click(screen.getByTestId('user-menu-trigger'))
    expect(screen.getByTestId('user-menu-settings')).toHaveAttribute('href', '/parametres')
    expect(screen.getByTestId('user-menu-subscription')).toHaveAttribute('href', '/abonnement')
  })

  it('Log out calls onSignOut and closes the menu', () => {
    const onSignOut = vi.fn()
    render(<UserMenu fullName="Chadi" onSignOut={onSignOut} />)
    fireEvent.click(screen.getByTestId('user-menu-trigger'))
    fireEvent.click(screen.getByTestId('user-menu-signout'))
    expect(onSignOut).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('user-menu-dropdown')).not.toBeInTheDocument()
  })

  it('Escape closes the menu', () => {
    render(<UserMenu fullName="Chadi" />)
    fireEvent.click(screen.getByTestId('user-menu-trigger'))
    expect(screen.getByTestId('user-menu-dropdown')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByTestId('user-menu-dropdown')).not.toBeInTheDocument()
  })
})
