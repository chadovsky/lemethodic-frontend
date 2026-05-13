'use client'

// P-230 — Goulet Stack top 3 (Block 2). v1 reuses getRecurringModules as
// the data source — same backing store as /ecole F-080d "Recommended for
// you" surface. Different framing here ("bottlenecks blocking your B2
// path") vs. /ecole's ("recurring patterns"). Consolidation deferred to
// P-230.consolidate post-launch.
//
// Reuses RecurringModuleCard for visual consistency with /ecole. Tap on a
// card routes to /learn/[module_id] — straight push, no LearnModuleSheet
// picker (the sheet is a /ecole-specific affordance for linked-to-lesson
// modules).

import { useRouter } from 'next/navigation'
import RecurringModuleCard from '@/components/modules/RecurringModuleCard'
import type { RecurringModule } from '@/lib/types'

const INK_MUTED = 'var(--text-muted)'
const DISPLAY_FONT = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'

interface GouletStackSectionProps {
  modules: RecurringModule[]
}

export default function GouletStackSection({ modules }: GouletStackSectionProps) {
  const router = useRouter()
  // BE returns these sorted by severity DESC, recurrence DESC. Take top 3.
  const top3 = modules.slice(0, 3)
  if (top3.length === 0) return null

  return (
    <section aria-label="Goulet Stack, top patterns blocking you">
      <p
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color: INK_MUTED,
          margin: '0 0 12px',
        }}
      >
        Top patterns blocking you
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {top3.map((m) => (
          <RecurringModuleCard
            key={m.module_id}
            module={m}
            onTap={() => router.push(`/learn/${m.module_id}`)}
          />
        ))}
      </div>
    </section>
  )
}
