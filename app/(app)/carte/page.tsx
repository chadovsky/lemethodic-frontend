// F-471 — La Carte: the single "learning path" (Duolingo-style bubble trail).
// Replaces the F-457 list / F-462 serpentine / F-469 sea-world / F-470 baked
// scene and the desktop/mobile split: ONE component (CartePath) renders the F-456
// journey model identically at every width. Same target-level/progress seam, same
// DOM contract (carte-level, carte-grammar, carte-ile, /ile links, carte-current-cta).
import type { Metadata } from 'next'
import CartePath from '@/components/carte/CartePath'

export const metadata: Metadata = {
  title: 'La Carte | Le Méthodic',
}

export default function CartePage() {
  return <CartePath />
}
