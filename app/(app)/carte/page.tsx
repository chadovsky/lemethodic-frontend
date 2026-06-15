// F-457 / F-462 — La Carte: the journey map. Renders the F-456 journey model as
// a serpentine trail (grammar -> 7 iles + mini-mocks -> final mock) that zig-zags
// down a single scrolling column. The render + the target-level/progress reads
// live in the CarteMap client component (F-462 replaced the F-457 vertical list).
import type { Metadata } from 'next'
import CarteMap from '@/components/carte/CarteMap'

export const metadata: Metadata = {
  title: 'La Carte | Le Méthodic',
}

export default function CartePage() {
  return <CarteMap />
}
