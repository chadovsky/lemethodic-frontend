// B-102 — /terms. Renders docs/terms-and-conditions.md.

import type { Metadata } from 'next'
import LegalPage from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Terms and Conditions | LeMethodic',
  description: 'Terms governing your access to and use of LeMethodic.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return <LegalPage docFile="terms-and-conditions.md" />
}
