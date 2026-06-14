// F-457 — IslandNode: the single art seam for the carte.
//
// Renders a v3-styled rounded node NOW (no real island art this ticket). When
// the real per-theme island illustrations land, they drop in HERE, keyed by
// `theme`, WITHOUT touching the carte layout in CarteJourney. The status drives
// the node's visual weight so the seam reads correctly at every progression
// state. Rounded-only, v3 tokens only, no new colors.

import type { ThemeId, Status } from '@/lib/journey/journey'

interface IslandNodeProps {
  theme: ThemeId
  status: Status
  // Single FR initial shown on the placeholder; replaced by art later.
  label: string
}

// Per-status surface treatment. current = accent-lifted; completed = success
// tint; locked = muted/recessed; bientot = faint placeholder.
function nodeStyle(status: Status): React.CSSProperties {
  switch (status) {
    case 'current':
      return {
        background: 'color-mix(in srgb, var(--accent) 12%, var(--paper))',
        border: '2px solid var(--accent)',
        color: 'var(--accent)',
      }
    case 'completed':
      return {
        background: 'color-mix(in srgb, var(--success) 14%, var(--paper))',
        border: '2px solid var(--success)',
        color: 'var(--success)',
      }
    case 'locked':
      return {
        background: 'var(--paper-edge)',
        border: '1px solid var(--rule)',
        color: 'var(--ink-faint)',
      }
    case 'bientot':
    default:
      return {
        background: 'var(--paper-edge)',
        border: '1px dashed var(--rule)',
        color: 'var(--ink-faint)',
      }
  }
}

export default function IslandNode({ theme, status, label }: IslandNodeProps) {
  return (
    <div
      data-testid="island-node"
      data-theme={theme}
      data-status={status}
      aria-hidden="true"
      style={{
        width: 72,
        height: 72,
        flexShrink: 0,
        borderRadius: 'var(--r-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--f-display)',
        fontSize: 30,
        lineHeight: 1,
        userSelect: 'none',
        ...nodeStyle(status),
      }}
    >
      {label.charAt(0).toUpperCase()}
    </div>
  )
}
