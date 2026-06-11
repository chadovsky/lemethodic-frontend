'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore, cartCount, cartTotalCents } from '@/lib/store/cart'
import { formatPrice } from '@/lib/store/books'
import { DISPLAY_FONT, SANS_FONT } from '@/lib/typography'
import Bientot from '@/components/bientot/Bientot'

// Global cart drawer. Mounted once in the root layout so any CartButton
// (TopNav, sidebar, store header) can open it. Slides from the right; renders
// nothing until opened. Line items support qty +/- and remove; total is
// computed live. Checkout is bientôt-stubbed (no LemonSqueezy, no payment).

export default function CartDrawer() {
  const items = useCartStore((s) => s.items)
  const isOpen = useCartStore((s) => s.isOpen)
  const close = useCartStore((s) => s.close)
  const setQty = useCartStore((s) => s.setQty)
  const remove = useCartStore((s) => s.remove)
  const hydrate = useCartStore((s) => s.hydrate)

  useEffect(() => { hydrate() }, [hydrate])

  // Lock body scroll while open.
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  if (!isOpen) return null

  const count = cartCount(items)
  const totalCents = cartTotalCents(items)
  const empty = items.length === 0

  return (
    <>
      {/* Backdrop */}
      <div
        data-testid="cart-backdrop"
        onClick={close}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 20, 25, 0.45)',
          zIndex: 60,
        }}
      />

      {/* Panel — carries the dialog role + testid (the wrapper would collapse
          to 0x0 since both children are position:fixed). */}
      <aside
        data-testid="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Panier"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 61,
          width: 'min(420px, 100vw)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-elevated)',
          borderLeft: '1px solid var(--rule-default)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--rule-default)',
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: DISPLAY_FONT,
              fontWeight: 400,
              fontSize: '1.5rem',
              letterSpacing: '-0.01em',
              color: 'var(--text-primary)',
            }}
          >
            Panier
          </h2>
          <button
            type="button"
            data-testid="cart-close"
            onClick={close}
            aria-label="Fermer le panier"
            style={{
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
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px' }}>
          {empty ? (
            <p
              data-testid="cart-empty"
              style={{
                fontFamily: SANS_FONT,
                fontSize: '0.9375rem',
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                margin: '32px 0',
              }}
            >
              Votre panier est vide. Parcourez{' '}
              <Link
                href="/librairie"
                onClick={close}
                style={{ color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: 3 }}
              >
                la librairie
              </Link>{' '}
              pour ajouter des ouvrages.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {items.map((line) => (
                <li
                  key={line.id}
                  data-testid={`cart-line-${line.slug}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    padding: '18px 0',
                    borderBottom: '1px solid var(--rule-default)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span
                      style={{
                        fontFamily: SANS_FONT,
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        color: 'var(--text-primary)',
                        lineHeight: 1.3,
                      }}
                    >
                      {line.title}
                    </span>
                    <span
                      style={{
                        fontFamily: SANS_FONT,
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        color: 'var(--accent)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatPrice(line.priceCents * line.qty, line.currency)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Qty stepper */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        border: '1px solid var(--rule-default)',
                        borderRadius: 'var(--r-sm)',
                      }}
                    >
                      <button
                        type="button"
                        data-testid={`cart-qty-dec-${line.slug}`}
                        onClick={() => setQty(line.id, line.qty - 1)}
                        aria-label={`Diminuer la quantité de ${line.title}`}
                        style={stepperBtn}
                      >
                        <Minus size={14} strokeWidth={1.75} />
                      </button>
                      <span
                        data-testid={`cart-qty-${line.slug}`}
                        style={{
                          minWidth: 28,
                          textAlign: 'center',
                          fontFamily: SANS_FONT,
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {line.qty}
                      </span>
                      <button
                        type="button"
                        data-testid={`cart-qty-inc-${line.slug}`}
                        onClick={() => setQty(line.id, line.qty + 1)}
                        aria-label={`Augmenter la quantité de ${line.title}`}
                        style={stepperBtn}
                      >
                        <Plus size={14} strokeWidth={1.75} />
                      </button>
                    </div>

                    <button
                      type="button"
                      data-testid={`cart-remove-${line.slug}`}
                      onClick={() => remove(line.id)}
                      aria-label={`Retirer ${line.title} du panier`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        fontFamily: SANS_FONT,
                        fontSize: '0.8125rem',
                        padding: '4px 2px',
                      }}
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                      Retirer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer: total + checkout stub */}
        {!empty && (
          <div
            style={{
              borderTop: '1px solid var(--rule-default)',
              padding: '20px 24px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span
                style={{
                  fontFamily: SANS_FONT,
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}
              >
                Total ({count})
              </span>
              <span
                data-testid="cart-total"
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 400,
                  fontSize: '1.75rem',
                  color: 'var(--text-primary)',
                }}
              >
                {formatPrice(totalCents)}
              </span>
            </div>

            {/* Checkout is bientôt-stubbed: no LemonSqueezy, no payment, no order. */}
            <Bientot level="section" label="Le paiement sécurisé arrive bientôt.">
              <div
                data-testid="cart-checkout-stub"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 52,
                  backgroundColor: 'var(--accent)',
                  color: 'var(--paper)',
                  borderRadius: 'var(--r-sm)',
                  fontFamily: SANS_FONT,
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  letterSpacing: '0.01em',
                }}
              >
                Passer la commande
              </div>
            </Bientot>
          </div>
        )}
      </aside>
    </>
  )
}

const stepperBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-primary)',
  padding: 0,
}
