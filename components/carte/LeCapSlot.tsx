'use client'

// F-484 - Le Cap shell. A slot at the top of La Carte for one recommended
// session plan (one review, one new, one stretch). It reads only the LIVE
// surface via recommendNext(persona); everything is bientot in this scaffold so
// the stub returns null and Le Cap renders its empty / coming-soon state. The
// full method menu is always the override (the grid below). No logic here beyond
// reading the stub: the live orchestrator lands with content.

import { Compass } from 'lucide-react'
import { recommendNext, type Persona } from '@/lib/personas'

const HEADING_FONT = 'var(--f-en), var(--f-ui), -apple-system, system-ui, sans-serif'
const UI_FONT = 'var(--f-ui), -apple-system, system-ui, sans-serif'
const MONO_FONT = 'var(--f-mono), ui-monospace, monospace'

export default function LeCapSlot({ persona }: { persona: Persona }) {
  const plan = recommendNext(persona)

  return (
    <section
      data-testid="carte-lecap"
      data-state={plan ? 'live' : 'bientot'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 18px',
        marginBottom: 20,
        borderRadius: 'var(--r-lg)',
        border: '1px solid var(--rule)',
        background: 'var(--paper)',
        boxShadow: '0 4px 16px color-mix(in srgb, var(--ink) 7%, transparent)',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          flexShrink: 0,
          width: 40,
          height: 40,
          borderRadius: 10,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'color-mix(in srgb, var(--ink) 8%, var(--paper-edge))',
          color: 'var(--ink-soft)',
        }}
      >
        <Compass size={20} strokeWidth={2} />
      </span>
      <div style={{ minWidth: 0 }}>
        <span
          style={{
            display: 'block',
            fontFamily: MONO_FONT,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--ink-faint)',
            marginBottom: 3,
          }}
        >
          Le Cap
        </span>
        <span style={{ display: 'block', fontFamily: HEADING_FONT, fontSize: 15, fontWeight: 700, color: 'var(--heading)' }}>
          Votre séance du jour
        </span>
        <span style={{ display: 'block', fontFamily: UI_FONT, fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>
          {plan
            ? 'Un avis, un nouveau, un défi.'
            : 'Bientôt : une révision, un nouveau, un défi, choisis pour vous.'}
        </span>
      </div>
    </section>
  )
}
