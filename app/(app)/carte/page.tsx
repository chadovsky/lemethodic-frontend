// F-472 — La Carte: an informative table (CarteTable). Replaces the F-471 bubble
// trail / path idea entirely: the journey is a 4-column table (>=640) that stacks
// to cards (<640), one component, both layouts. Same target-level/progress seam,
// same DOM contract (carte-level, carte-grammar, carte-ile, /ile links,
// carte-current-cta).
import type { Metadata } from 'next'
import CarteTable from '@/components/carte/CarteTable'

export const metadata: Metadata = {
  title: 'La Carte | Le Méthodic',
}

export default function CartePage() {
  return <CarteTable />
}
