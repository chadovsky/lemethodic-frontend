'use client'

// F-448 -- Store mold cart.
//
// Client-side only, persisted to localStorage so the cart survives a reload
// and stays in sync across both nav shells. No BE: there are no order records
// and checkout is bientôt-stubbed. Mirrors the lib/auth.ts pattern (manual
// localStorage sync + a hydrate() called from a mount effect) so we never
// touch storage during SSR.
//
// Line items snapshot the price/title at add-time so the cart drawer is
// self-contained and does not need to re-resolve against the catalog. When
// the LS swap lands, the add() callsite passes the reconciled product; the
// cart shape here does not change.

import { create } from 'zustand'

const CART_KEY = 'lemethodic_cart'

export interface CartLine {
  id: string
  slug: string
  title: string
  priceCents: number
  currency: string
  qty: number
}

export interface CartItemInput {
  id: string
  slug: string
  title: string
  priceCents: number
  currency: string
}

interface CartState {
  items: CartLine[]
  isOpen: boolean
  hydrated: boolean
  hydrate: () => void
  add: (item: CartItemInput) => void
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
  open: () => void
  close: () => void
  toggle: () => void
}

function readItems(): CartLine[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (l): l is CartLine =>
        l && typeof l.id === 'string' && typeof l.qty === 'number' && l.qty > 0,
    )
  } catch {
    return []
  }
}

function writeItems(items: CartLine[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(items))
  } catch {
    // quota / privacy-mode — ignore
  }
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  hydrated: false,

  // Called from a mount effect (CartButton / CartDrawer). Idempotent.
  hydrate: () => {
    set({ items: readItems(), hydrated: true })
  },

  add: (item) => {
    const items = get().items.slice()
    const existing = items.find((l) => l.id === item.id)
    if (existing) {
      existing.qty += 1
    } else {
      items.push({ ...item, qty: 1 })
    }
    writeItems(items)
    set({ items, isOpen: true })
  },

  remove: (id) => {
    const items = get().items.filter((l) => l.id !== id)
    writeItems(items)
    set({ items })
  },

  setQty: (id, qty) => {
    if (qty <= 0) {
      get().remove(id)
      return
    }
    const items = get().items.map((l) => (l.id === id ? { ...l, qty } : l))
    writeItems(items)
    set({ items })
  },

  clear: () => {
    writeItems([])
    set({ items: [] })
  },

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}))

// Derived selectors — components subscribe to items and compute these so the
// values stay reactive without storing redundant state.
export function cartCount(items: CartLine[]): number {
  return items.reduce((n, l) => n + l.qty, 0)
}

export function cartTotalCents(items: CartLine[]): number {
  return items.reduce((n, l) => n + l.priceCents * l.qty, 0)
}
