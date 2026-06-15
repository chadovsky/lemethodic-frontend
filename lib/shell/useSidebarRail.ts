'use client'

import { useCallback, useEffect, useRef, useState, type FocusEvent } from 'react'

// F-465 — persistent icon-rail sidebar interaction model.
//
// Resting state is an icon-only rail (RAIL_WIDTH). Hover or keyboard focus
// expands it to titles (EXPANDED_WIDTH) and pushes the content column right.
// A pin persists "titles" so the rail stays expanded across reloads.
//
// The rail/push model is desktop-only and gated on a real pointer: a coarse
// pointer (touch) or a sub-1024px viewport keeps the legacy drawer model
// (AppShell hamburger + overlay). The min-width:1024 half of the gate is what
// keeps the existing width-based shell tests (375px → drawer) valid.

export type SidebarMode = 'icons' | 'titles'

export const SIDEBAR_MODE_KEY = 'lm.sidebarMode.v1'
export const RAIL_WIDTH = 64
export const EXPANDED_WIDTH = 240

// Open-on-hover intent delay + a longer close delay to kill flicker when the
// pointer clips a corner of the rail.
const EXPAND_DELAY = 150
const COLLAPSE_DELAY = 200

const RAIL_MEDIA = '(min-width: 1024px) and (hover: hover) and (pointer: fine)'

function readMode(): SidebarMode {
  try {
    const v = window.localStorage.getItem(SIDEBAR_MODE_KEY)
    return v === 'titles' ? 'titles' : 'icons'
  } catch {
    return 'icons'
  }
}

export interface SidebarRail {
  /** Persisted pin mode. */
  mode: SidebarMode
  /** mode === 'titles'. */
  pinned: boolean
  /** Desktop rail capability is live (fine pointer + ≥1024px). */
  railEnabled: boolean
  /** Rail is showing titles (pinned, hovered, or focused). Desktop only. */
  expanded: boolean
  /** Current content-column offset in px (rail vs expanded footprint). */
  offset: number
  togglePin: () => void
  onRailEnter: () => void
  onRailLeave: () => void
  onRailFocus: () => void
  onRailBlur: (e: FocusEvent<HTMLElement>) => void
}

export function useSidebarRail(): SidebarRail {
  const [mode, setMode] = useState<SidebarMode>('icons')
  const [railEnabled, setRailEnabled] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Capability detection. matchMedia is guarded for jsdom.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia(RAIL_MEDIA)
    setRailEnabled(mq.matches)
    const handler = (e: MediaQueryListEvent) => setRailEnabled(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Persisted pin mode — read after mount (not during render) so SSR markup
  // and the first client render agree, then reconcile on the client.
  useEffect(() => {
    setMode(readMode())
  }, [])

  useEffect(() => {
    return () => {
      if (enterTimer.current) clearTimeout(enterTimer.current)
      if (leaveTimer.current) clearTimeout(leaveTimer.current)
    }
  }, [])

  const onRailEnter = useCallback(() => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current)
      leaveTimer.current = null
    }
    if (enterTimer.current) clearTimeout(enterTimer.current)
    enterTimer.current = setTimeout(() => setHovered(true), EXPAND_DELAY)
  }, [])

  const onRailLeave = useCallback(() => {
    if (enterTimer.current) {
      clearTimeout(enterTimer.current)
      enterTimer.current = null
    }
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    leaveTimer.current = setTimeout(() => setHovered(false), COLLAPSE_DELAY)
  }, [])

  // Keyboard parity: focus opens immediately (no intent delay), and only
  // collapses once focus leaves the rail subtree entirely.
  const onRailFocus = useCallback(() => setFocused(true), [])
  const onRailBlur = useCallback((e: FocusEvent<HTMLElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
    setFocused(false)
  }, [])

  const togglePin = useCallback(() => {
    setMode((prev) => {
      const next: SidebarMode = prev === 'titles' ? 'icons' : 'titles'
      try {
        window.localStorage.setItem(SIDEBAR_MODE_KEY, next)
      } catch {
        // ignore quota / privacy-mode failures
      }
      return next
    })
  }, [])

  const pinned = mode === 'titles'
  const expanded = railEnabled && (pinned || hovered || focused)
  const offset = expanded ? EXPANDED_WIDTH : RAIL_WIDTH

  return {
    mode,
    pinned,
    railEnabled,
    expanded,
    offset,
    togglePin,
    onRailEnter,
    onRailLeave,
    onRailFocus,
    onRailBlur,
  }
}
