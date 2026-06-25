'use client'

// F-484 - the carte's global rail. Houses the persona's GLOBAL-scoped methods
// (SRS, Mock, Reading): cross-cutting surfaces that sit beside the grid rather
// than at a theme x level cell. Every entry is bientot in this scaffold. The
// readiness signal rides at the top of the rail. v3 tokens only.

import { Layers, FileCheck2, BookOpenText, type LucideIcon } from 'lucide-react'
import { methodStatus, type MethodId, type Persona } from '@/lib/personas'
import ReadinessSignal from './ReadinessSignal'
import BientotSlot from './BientotSlot'

const HEADING_FONT = 'var(--f-en), var(--f-ui), -apple-system, system-ui, sans-serif'
const UI_FONT = 'var(--f-ui), -apple-system, system-ui, sans-serif'

interface RailEntry {
  id: MethodId
  label: string
  blurb: string
  icon: LucideIcon
}

const RAIL_ENTRIES: RailEntry[] = [
  { id: 'srs', label: 'Révisions', blurb: 'Ce qui doit être revu, au bon moment.', icon: Layers },
  { id: 'mock', label: 'Examen blanc', blurb: 'La simulation complète, le jour venu.', icon: FileCheck2 },
  { id: 'reading', label: 'Lecture', blurb: 'Compréhension écrite guidée.', icon: BookOpenText },
]

export default function GlobalRail({ persona }: { persona: Persona }) {
  return (
    <aside
      data-testid="carte-rail"
      aria-label="Outils transversaux"
      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <ReadinessSignal persona={persona} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: 16,
          borderRadius: 'var(--r-lg)',
          border: '1px solid var(--rule)',
          background: 'var(--paper)',
        }}
      >
        <span style={{ fontFamily: HEADING_FONT, fontSize: 14, fontWeight: 700, color: 'var(--heading)' }}>
          Transversal
        </span>
        {RAIL_ENTRIES.map((entry) => {
          const live = methodStatus(persona, entry.id) === 'live'
          const Icon = entry.icon
          return (
            <div
              key={entry.id}
              data-testid={`carte-rail-${entry.id}`}
              data-status={live ? 'live' : 'bientot'}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 11,
                padding: 11,
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--rule)',
                background: 'color-mix(in srgb, var(--ink) 3%, var(--paper))',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--paper-edge)',
                  color: 'var(--ink-soft)',
                }}
              >
                <Icon size={17} strokeWidth={2} />
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontFamily: UI_FONT, fontSize: 13.5, fontWeight: 700, color: 'var(--heading)' }}>
                    {entry.label}
                  </span>
                  {live ? null : <BientotSlot compact testid={`carte-rail-${entry.id}-slot`} />}
                </span>
                <span style={{ fontFamily: UI_FONT, fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.4 }}>
                  {entry.blurb}
                </span>
              </span>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
