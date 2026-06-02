// F-370 — /cgv. Renders docs/cgv.md.

import type { Metadata } from 'next'
import LegalPage from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente | Le Méthodic',
  description: 'Conditions générales de vente applicables aux abonnements Le Méthodic.',
  alternates: { canonical: '/cgv' },
}

export default function CGVPage() {
  return <LegalPage docFile="cgv.md" />
}
