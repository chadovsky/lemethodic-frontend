// F-370 — /mentions-legales. Renders docs/terms-and-conditions.md.

import type { Metadata } from 'next'
import LegalPage from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Mentions légales | Le Méthodic',
  description: 'Conditions générales régissant votre accès et utilisation de Le Méthodic.',
  alternates: { canonical: '/mentions-legales' },
}

export default function MentionsLegalesPage() {
  return <LegalPage docFile="terms-and-conditions.md" />
}
