'use client'

import { useEffect } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCartStore, cartCount } from '@/lib/store/cart'
import { SANS_FONT } from '@/lib/typography'

// Cart affordance for the nav shells + store header. The icon is ALWAYS
// present (persistent shopping grammar); the numeric count badge appears
// only when the cart is non-empty. Clicking toggles the global CartDrawer.
//
// VISIBILITY CHOICE (noted in PR): icon always visible in both shells,
// badge only when count > 0.

interface CartButtonProps {
  variant?: 'icon' | 'row'
  testId?: string
  isCollapsed?: boolean
}

export default function CartButton({
  variant = 'icon',
  testId = 'cart-button',
  isCollapsed = false,
}: CartButtonProps) {
  const items = useCartStore((s) => s.items)
  const toggle = useCartStore((s) => s.toggle)
  const hydrate = useCartStore((s) => s.hydrate)

  // SSR-safe: read localStorage only after mount.
  useEffect(() => { hydrate() }, [hydrate])

  const count = cartCount(items)

  function Badge() {
    if (count <= 0) return null
    return (
      <span
        data-testid={`${testId}-badge`}
        style={{
          position: variant === 'icon' ? 'absolute' : 'static',
          top: variant === 'icon' ? 2 : undefined,
          right: variant === 'icon' ? 2 : undefined,
          minWidth: 18,
          height: 18,
          padding: '0 5px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--accent)',
          color: 'var(--paper)',
          borderRadius: 'var(--r-pill)',
          fontFamily: SANS_FONT,
          fontWeight: 600,
          fontSize: '0.6875rem',
          lineHeight: 1,
          marginLeft: variant === 'row' ? 'auto' : undefined,
        }}
      >
        {count}
      </span>
    )
  }

  if (variant === 'row') {
    return (
      <button
        type="button"
        data-testid={testId}
        onClick={toggle}
        aria-label={`Ouvrir le panier (${count} article${count > 1 ? 's' : ''})`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          width: '100%',
          height: 44,
          paddingLeft: isCollapsed ? 0 : 17,
          paddingRight: isCollapsed ? 0 : 20,
          gap: isCollapsed ? 0 : 10,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: SANS_FONT,
          fontWeight: 500,
          fontSize: '0.9375rem',
          letterSpacing: '0.005em',
          color: 'var(--text-muted)',
          textAlign: 'left',
        }}
      >
        <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <ShoppingCart size={20} strokeWidth={1.5} />
        </span>
        {!isCollapsed && <span>Panier</span>}
        {!isCollapsed && <Badge />}
        {isCollapsed && count > 0 && <Badge />}
      </button>
    )
  }

  return (
    <button
      type="button"
      data-testid={testId}
      onClick={toggle}
      aria-label={`Ouvrir le panier (${count} article${count > 1 ? 's' : ''})`}
      style={{
        position: 'relative',
        width: 40,
        height: 40,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-primary)',
        borderRadius: 'var(--r-sm)',
        padding: 0,
      }}
    >
      <ShoppingCart size={20} strokeWidth={1.5} />
      <Badge />
    </button>
  )
}
