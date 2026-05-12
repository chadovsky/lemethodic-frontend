import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Catalog from './Catalog'

// F-325 — Le Vocabulaire catalog. Auth-gated.
//
// Deviation from the /ecole mobile/desktop component split: vocab catalog
// mobile and desktop share the same component tree with responsive Tailwind
// classes (grid-cols-1 on mobile → 2/3 cols on md/lg). /ecole splits because
// EcoleDesktop has a substantively different layout (grid + side panels);
// the catalog's mobile/desktop divergence is purely column count, which a
// single responsive component handles cleanly. F-225 mobile-first prioritization
// is preserved (mobile breakpoint is the default; desktop adds columns).

export default function VocabulairePage() {
  return (
    <ProtectedRoute>
      <Catalog />
    </ProtectedRoute>
  )
}
