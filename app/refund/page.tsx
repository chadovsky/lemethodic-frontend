// B-102 — /refund. Renders docs/refund-policy.md.

import type { Metadata } from 'next'
import LegalPage from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Refund Policy | Le Méthodic',
  description: 'When and how you can request a refund for Le Méthodic purchases.',
  alternates: { canonical: '/refund' },
}

export default function RefundPage() {
  return <LegalPage docFile="refund-policy.md" />
}
