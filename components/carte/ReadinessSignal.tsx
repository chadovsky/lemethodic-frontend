'use client'

// F-484 - Readiness signal. A visible "X % prêt" computed from mastery against
// the persona's level-band targets. ALWAYS visible, NEVER a gate (no-gates
// doctrine): the only surface ever gated on readiness is the terminus mock, and
// even there readiness stays visible. Wired to the readiness(persona) stub,
// which returns 0 until mastery wiring lands.

import { readiness, type Persona } from '@/lib/personas'

const HEADING_FONT = 'var(--f-en), var(--f-ui), -apple-system, system-ui, sans-serif'
const UI_FONT = 'var(--f-ui), -apple-system, system-ui, sans-serif'
const MONO_FONT = 'var(--f-mono), ui-monospace, monospace'

export default function ReadinessSignal({ persona }: { persona: Persona }) {
  const pct = readiness(persona)

  return (
    <div
      data-testid="carte-readiness"
      data-value={pct}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 16,
        borderRadius: 'var(--r-lg)',
        border: '1px solid var(--rule)',
        background: 'var(--paper)',
      }}
    >
      <span
        style={{
          fontFamily: MONO_FONT,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--ink-faint)',
        }}
      >
        Préparation
      </span>
      <span data-testid="carte-readiness-value" style={{ fontFamily: HEADING_FONT, fontSize: '1.6rem', fontWeight: 700, color: 'var(--heading)', lineHeight: 1 }}>
        {pct} %
      </span>
      <span
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Préparation à l'examen"
        style={{
          height: 8,
          borderRadius: 'var(--r-pill)',
          background: 'color-mix(in srgb, var(--ink) 8%, transparent)',
          overflow: 'hidden',
        }}
      >
        <span style={{ display: 'block', width: `${pct}%`, height: '100%', borderRadius: 'var(--r-pill)', background: 'var(--heading)' }} />
      </span>
      <span style={{ fontFamily: UI_FONT, fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.4 }}>
        Votre progression vers le seuil. Aucun verrou : tout reste accessible.
      </span>
    </div>
  )
}
