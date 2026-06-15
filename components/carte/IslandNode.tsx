// F-461 — IslandNode: real per-theme island art.
//
// The single art seam for the carte. Each ile renders its themed island PNG
// (lib/journey/island-art.ts -> /iles/island-<theme>.png) at three visual
// states, with a separate elliptical grounding shadow beneath the base. The
// node keeps its 72x72 footprint, so the carte trail layout is unchanged (the
// shadow, glow, badge and lift are all absolute/transform, never affecting flow).
//
// States (step 3):
//   current   = full colour, lifted, coral glow (accent), largest grounding shadow
//   completed = full colour, normal elevation, coral check badge, normal shadow
//   locked    = grayscale + dimmed, flattened, tightest shadow
// bientot (unauthored levels) folds into the locked treatment.
//
// v3 tokens only (no hardcoded hex). Every lift/transition is guarded by
// prefers-reduced-motion via the motion-safe: variant.

import Image from 'next/image'
import { Check } from 'lucide-react'
import type { ThemeId, Status } from '@/lib/journey/journey'
import { ISLAND_ART } from '@/lib/journey/island-art'

interface IslandNodeProps {
  theme: ThemeId
  status: Status
  // French theme label, used as the image alt text.
  label: string
}

const NODE = 72

// The three rendered states. locked + bientot share the locked treatment:
// unauthored content reads the same as a locked island.
type VisualState = 'current' | 'completed' | 'locked'

function visualState(status: Status): VisualState {
  if (status === 'current') return 'current'
  if (status === 'completed') return 'completed'
  return 'locked'
}

// Grounding-shadow geometry per state: ellipse width (px) + light-mode ink
// alpha (%). current largest, locked smallest (step 4).
const SHADOW: Record<VisualState, { width: number; alpha: number }> = {
  current: { width: 58, alpha: 30 },
  completed: { width: 48, alpha: 22 },
  locked: { width: 34, alpha: 12 },
}

export default function IslandNode({ theme, status, label }: IslandNodeProps) {
  const state = visualState(status)
  const src = ISLAND_ART[theme]
  const shadow = SHADOW[state]

  // Image treatment: current = coral glow tracing the island (accent token);
  // locked = desaturated; completed = full colour, untouched.
  const imageFilter =
    state === 'current'
      ? 'drop-shadow(0 2px 6px color-mix(in srgb, var(--accent) 55%, transparent))'
      : state === 'locked'
        ? 'grayscale(1)'
        : undefined

  return (
    <div
      data-testid="island-node"
      data-theme={theme}
      data-status={status}
      data-state={state}
      style={{
        position: 'relative',
        width: NODE,
        height: NODE,
        flexShrink: 0,
      }}
    >
      {/* Grounding shadow: a soft contact ellipse beneath the island base, NOT
          a silhouette drop-shadow (which would trace the tall landmark). Theme
          aware: a dark ink ellipse in light mode, suppressed in dark mode via
          dark:. Scale + intensity track the state; transition guarded for
          reduced motion. */}
      <span
        aria-hidden="true"
        data-testid="island-shadow"
        className="motion-safe:transition-all dark:opacity-0"
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 2,
          transform: 'translateX(-50%)',
          width: shadow.width,
          height: 9,
          borderRadius: '50%',
          background: `radial-gradient(ellipse at center, color-mix(in srgb, var(--ink) ${shadow.alpha}%, transparent), transparent 72%)`,
          filter: 'blur(3px)',
          pointerEvents: 'none',
        }}
      />

      {/* Island art, contained in the node box so there is zero layout shift. */}
      <Image
        src={src}
        alt={label}
        width={NODE}
        height={NODE}
        unoptimized
        draggable={false}
        className={[
          'motion-safe:transition-all',
          state === 'current' ? 'motion-safe:-translate-y-1' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          position: 'relative',
          width: NODE,
          height: NODE,
          objectFit: 'contain',
          opacity: state === 'locked' ? 0.55 : 1,
          filter: imageFilter,
          userSelect: 'none',
        }}
      />

      {/* Completed badge: a coral disc with a light check, top-right. The check
          uses --accent-foreground (white in both modes), the cutout border uses
          the surface token. */}
      {state === 'completed' && (
        <span
          aria-hidden="true"
          data-testid="island-badge"
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: 'var(--accent)',
            border: '2px solid var(--paper)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-foreground)',
          }}
        >
          <Check size={12} strokeWidth={3} />
        </span>
      )}
    </div>
  )
}
