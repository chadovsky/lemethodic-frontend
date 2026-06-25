'use client'

// F-484 - the single reusable bientot slot. Every unauthored station, method,
// and persona surface renders one: visible, inert, with a notify-me affordance.
// Inert means it never navigates and runs no network; the notify-me toggle is a
// local-only acknowledgement until the real wiring lands. v3 tokens only, no
// coral, no dead literals.

import { useState, type CSSProperties } from 'react'
import { Sparkles, Check } from 'lucide-react'

const UI_FONT = 'var(--f-ui), -apple-system, system-ui, sans-serif'
const MONO_FONT = 'var(--f-mono), ui-monospace, monospace'

interface BientotSlotProps {
  // Optional label above the chip (e.g. a method name or "Theme 2").
  label?: string
  // Optional accent (a theme colour) for the slot's tint + chip text.
  color?: string
  // Compact form for a tight grid cell (chip only, no notify-me button).
  compact?: boolean
  // Pass-through testid; defaults to the generic slot id.
  testid?: string
  style?: CSSProperties
}

export default function BientotSlot({
  label,
  color,
  compact = false,
  testid = 'bientot-slot',
  style,
}: BientotSlotProps) {
  const [noted, setNoted] = useState(false)
  const accent = color ?? 'var(--ink-soft)'

  if (compact) {
    return (
      <span
        data-testid={testid}
        data-state="bientot"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '3px 9px',
          borderRadius: 'var(--r-pill)',
          background: 'color-mix(in srgb, var(--ink) 6%, transparent)',
          color: 'var(--ink-faint)',
          fontFamily: MONO_FONT,
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: '0.04em',
          whiteSpace: 'nowrap',
          ...style,
        }}
      >
        <Sparkles size={11} strokeWidth={2} aria-hidden="true" />
        Bientôt
      </span>
    )
  }

  return (
    <div
      data-testid={testid}
      data-state="bientot"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 16,
        borderRadius: 'var(--r-lg)',
        border: '1px dashed var(--rule)',
        background: `color-mix(in srgb, ${accent} 5%, var(--paper))`,
        ...style,
      }}
    >
      {label ? (
        <span
          style={{
            fontFamily: MONO_FONT,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: accent,
          }}
        >
          {label}
        </span>
      ) : null}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: UI_FONT,
          fontSize: 13.5,
          fontWeight: 600,
          color: 'var(--ink-soft)',
        }}
      >
        <Sparkles size={15} strokeWidth={2} aria-hidden="true" />
        Bientôt disponible
      </span>
      <button
        type="button"
        data-testid={`${testid}-notify`}
        aria-pressed={noted}
        onClick={() => setNoted(true)}
        className="ed-btn-press"
        style={{
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          marginTop: 2,
          padding: '5px 11px',
          borderRadius: 'var(--r-md)',
          border: '1px solid var(--rule)',
          background: 'transparent',
          color: noted ? 'var(--ink-soft)' : 'var(--heading)',
          fontFamily: UI_FONT,
          fontSize: 12.5,
          fontWeight: 600,
          cursor: noted ? 'default' : 'pointer',
        }}
      >
        {noted ? (
          <>
            <Check size={13} strokeWidth={2.5} aria-hidden="true" />
            Noté
          </>
        ) : (
          'Me prévenir'
        )}
      </button>
    </div>
  )
}
