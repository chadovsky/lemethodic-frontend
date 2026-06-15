// F-457 / F-462 / F-469 — La Carte: the journey map. Renders the F-456 journey
// model two ways off a single 1024px breakpoint (CarteResponsive): the F-469
// immersive sea-world scatter on desktop, the F-462 mobile-first serpentine
// below it. Both read the same target-level/progress seam; both expose the same
// DOM contract.
import type { Metadata } from 'next'
import CarteResponsive from '@/components/carte/CarteResponsive'

export const metadata: Metadata = {
  title: 'La Carte | Le Méthodic',
}

export default function CartePage() {
  return <CarteResponsive />
}
