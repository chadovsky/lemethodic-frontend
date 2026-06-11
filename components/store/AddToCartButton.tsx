'use client'

import type { StoreBook } from '@/lib/store/books'
import { useCartStore } from '@/lib/store/cart'
import { SANS_FONT } from '@/lib/typography'

// Primary vermillion CTA on the detail page. Adds the book to the cart and
// opens the drawer (add() flips isOpen). Free items still go through the
// cart so the checkout flow is uniform.

export default function AddToCartButton({ book }: { book: StoreBook }) {
  const add = useCartStore((s) => s.add)

  return (
    <button
      type="button"
      data-testid="add-to-cart"
      className="ed-btn-press"
      onClick={() =>
        add({
          id: book.id,
          slug: book.slug,
          title: book.title,
          priceCents: book.priceCents,
          currency: book.currency,
        })
      }
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 50,
        padding: '0 28px',
        backgroundColor: 'var(--accent)',
        color: 'var(--paper)',
        border: 'none',
        borderRadius: 'var(--r-sm)',
        fontFamily: SANS_FONT,
        fontWeight: 600,
        fontSize: '0.9375rem',
        letterSpacing: '0.01em',
        cursor: 'pointer',
        transition: 'opacity var(--lm-duration-hover) var(--lm-ease)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
    >
      Ajouter au panier
    </button>
  )
}
