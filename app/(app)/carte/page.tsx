// F-457 — La Carte: the journey map. Renders the F-456 journey model as a
// vertical trail (grammar -> 7 iles + mini-mocks -> final mock). The render +
// the target-level read live in the CarteJourney client component.
import type { Metadata } from 'next'
import CarteJourney from '@/components/carte/CarteJourney'

export const metadata: Metadata = {
  title: 'La Carte | Le Méthodic',
}

export default function CartePage() {
  return <CarteJourney />
}
