'use client'

// F-484 - twin-view toggle. Theme and skill are co-primary PROJECTIONS of the
// same station set: theme view groups by the persona's authored themes, skill
// view groups by CO/CE/EO/EE. The toggle defaults to theme view so the carte's
// DOM contract resolves on load. Controlled (value + onChange).

import type { CSSProperties } from 'react'

export type CarteView = 'theme' | 'skill'

const UI_FONT = 'var(--f-ui), -apple-system, system-ui, sans-serif'

const OPTIONS: { id: CarteView; label: string }[] = [
  { id: 'theme', label: 'Par thème' },
  { id: 'skill', label: 'Par compétence' },
]

export default function CarteViewToggle({
  value,
  onChange,
}: {
  value: CarteView
  onChange: (next: CarteView) => void
}) {
  return (
    <div
      data-testid="carte-view-toggle"
      role="tablist"
      aria-label="Vue de la carte"
      style={{
        display: 'inline-flex',
        gap: 2,
        padding: 3,
        borderRadius: 'var(--r-pill)',
        border: '1px solid var(--rule)',
        background: 'color-mix(in srgb, var(--ink) 4%, var(--paper))',
      }}
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.id
        const style: CSSProperties = {
          padding: '6px 14px',
          borderRadius: 'var(--r-pill)',
          border: 'none',
          background: active ? 'var(--paper)' : 'transparent',
          color: active ? 'var(--heading)' : 'var(--ink-soft)',
          fontFamily: UI_FONT,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: active ? '0 1px 4px color-mix(in srgb, var(--ink) 12%, transparent)' : 'none',
        }
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            data-testid={`carte-view-${opt.id}`}
            data-active={active}
            onClick={() => onChange(opt.id)}
            className="ed-btn-press"
            style={style}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
