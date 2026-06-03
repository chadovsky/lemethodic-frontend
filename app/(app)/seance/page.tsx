import type { Metadata } from 'next'
import SeancePlayer from '@/components/seance/SeancePlayer'

export const metadata: Metadata = {
  title: 'La Séance | Le Méthodic',
}

export default function SeancePage() {
  return <SeancePlayer />
}
