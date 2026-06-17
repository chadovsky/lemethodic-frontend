'use client'

// F-471 — La Carte: the single "learning path" (Duolingo-style bubble trail).
//
// ONE component for every breakpoint (no desktop/mobile split, no baked image):
// a centered column (~620px max) with a winding vertical SVG trail weaving
// through 8 chunky pressable bubbles — the grammar foundation (node 0) then the
// 7 TCF themes. The trail is coral up to the current node and neutral slate
// after; each bubble carries its theme icon and one of three states (done /
// current / locked). The current node pops a compact card (eyebrow "Île N",
// theme title, % bar, Continuer -> /ile/<theme>).
//
// Data wiring is unchanged (the data layer is not touched): level from the
// target profile, completed iles from the seance-progress seam, journey =
// getJourney(level, completed). The DOM contract the e2e relies on is preserved:
// carte-level, carte-grammar, carte-ile (data-theme/data-status), /ile links,
// and exactly one carte-current-cta -> /ile/<current>.
//
// v3 tokens only (coral = --accent #E05C42 light / #DC5D4B dark; --accent-
// foreground for white-on-coral; slate via --rule / --paper-edge / --ink-faint),
// Inter for headings, DM Mono for numbers. Works light AND dark through the
// tokens. Labels are real DOM text (locale + dark-mode safe), never baked. The
// trail + decorative marks are aria-hidden; the bubbles are the links/markers.

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  GraduationCap,
  Users,
  Landmark,
  HeartPulse,
  Cpu,
  Leaf,
  Coins,
  Check,
  Lock,
  type LucideIcon,
} from 'lucide-react'
import {
  getJourney,
  THEMES,
  type Journey,
  type Level,
  type Ile,
  type ThemeId,
  type Status,
} from '@/lib/journey/journey'
import type { IslandKey } from '@/lib/journey/island-art'
import { readTargetLevel } from '@/lib/journey/target-level'
import { readCompletedIles } from '@/lib/journey/progress'

const THEME_LABELS: Record<ThemeId, string> = Object.fromEntries(
  THEMES.map((theme) => [theme.id, theme.label]),
) as Record<ThemeId, string>

// One lucide icon per node. Real icons (not baked art), so they recolour with
// the tokens in light/dark.
const NODE_ICON: Record<IslandKey, LucideIcon> = {
  grammaire: BookOpen,
  education: GraduationCap,
  famille: Users,
  culture: Landmark,
  sante: HeartPulse,
  technologie: Cpu,
  environnement: Leaf,
  economie: Coins,
}

// Inter (v3 system face) heading stack — explicitly NOT the retired serif.
const HEADING_FONT = 'var(--f-en), var(--f-ui), -apple-system, system-ui, sans-serif'
const UI_FONT = 'var(--f-ui), -apple-system, system-ui, sans-serif'

// ── Geometry (deterministic, width-driven; identical logic at every width) ────

const BUBBLE = 76 // bubble diameter
const ROW_H = 132 // vertical gap between consecutive nodes
const TOP_PAD = 64 // space above the first node
const BOTTOM_PAD = 56 // space below the last node
const CARD_GAP = 168 // extra vertical room inserted AFTER the current node for its card
const CARD_W = 320

interface Pt {
  x: number
  y: number
}

interface Metrics {
  center: number
  amp: number
  innerW: number
}

function metricsFor(width: number): Metrics {
  const center = width / 2
  // Clamp the zig-zag so a bubble can never overflow the column (the 320px guard).
  const maxAmp = center - BUBBLE / 2 - 12
  const amp = Math.max(36, Math.min(116, maxAmp))
  return { center, amp, innerW: width }
}

// Node i sits at an alternating offset around centre; the current node and every
// node after it are pushed down by CARD_GAP so the current card has room.
function buildPoints(n: number, m: Metrics, currentIndex: number): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const gap = currentIndex >= 0 && i > currentIndex ? CARD_GAP : 0
    return {
      x: m.center + (i % 2 === 0 ? -1 : 1) * m.amp,
      y: TOP_PAD + i * ROW_H + gap,
    }
  })
}

interface Seg {
  c1: Pt
  c2: Pt
  p: Pt
}

// Catmull-Rom -> cubic-bezier control points, one segment per gap. Matched
// tangents so the coral prefix and the slate full path share the exact shape.
function buildSegments(pts: Pt[]): Seg[] {
  const segs: Seg[] = []
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    segs.push({
      c1: { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
      c2: { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
      p: p2,
    })
  }
  return segs
}

function round(n: number): number {
  return Math.round(n * 10) / 10
}

// SVG path string for gaps [from, to). Empty when the range is empty.
function pathD(pts: Pt[], segs: Seg[], from: number, to: number): string {
  if (to <= from || pts.length === 0) return ''
  let d = `M ${round(pts[from].x)} ${round(pts[from].y)}`
  for (let i = from; i < to; i++) {
    const s = segs[i]
    d += ` C ${round(s.c1.x)} ${round(s.c1.y)} ${round(s.c2.x)} ${round(s.c2.y)} ${round(s.p.x)} ${round(s.p.y)}`
  }
  return d
}

// One node on the trail: the grammar foundation (key 'grammaire') or one of the
// 7 themes. Carries everything a bubble needs without re-deriving the journey.
interface Node {
  key: IslandKey
  theme?: ThemeId // present for the 7 ile nodes; absent for grammaire
  status: Status
  label: string
  href?: string // present only when navigable
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CartePath() {
  // Level + completions resolve client-side; B1 / empty keep SSR deterministic.
  const [level, setLevel] = useState<Level>('B1')
  const [completed, setCompleted] = useState<ThemeId[]>([])

  useEffect(() => {
    const resolved = readTargetLevel()
    setLevel(resolved)
    setCompleted(readCompletedIles(resolved))
  }, [])

  const journey: Journey = useMemo(() => getJourney(level, completed), [level, completed])
  const grammarLive = journey.grammarPhase.length > 0

  // 8 nodes in journey order: grammaire (foundation) then the 7 themes.
  const nodes: Node[] = useMemo(() => {
    const grammar: Node = {
      key: 'grammaire',
      status: grammarLive ? 'completed' : 'locked',
      label: 'La grammaire',
    }
    const iles: Node[] = journey.iles.map((ile: Ile) => {
      const navigable = ile.status === 'current' || ile.status === 'completed'
      return {
        key: ile.theme,
        theme: ile.theme,
        status: ile.status,
        label: THEME_LABELS[ile.theme],
        href: navigable ? `/ile/${ile.theme}` : undefined,
      }
    })
    return [grammar, ...iles]
  }, [journey, grammarLive])

  const n = nodes.length // 8

  // Current ile -> node index (grammaire is node 0, so ile index + 1).
  const currentIleIndex = journey.iles.findIndex((ile) => ile.status === 'current')
  const currentNodeIndex = currentIleIndex >= 0 ? currentIleIndex + 1 : -1
  const currentIle = currentIleIndex >= 0 ? journey.iles[currentIleIndex] : null
  const allDone = journey.iles.length > 0 && journey.iles.every((ile) => ile.status === 'completed')

  // Real progress: completed iles out of the 7 themes. No fabrication.
  const progressPct = Math.round((completed.length / THEMES.length) * 100)

  // Width drives horizontal placement only; height is width-independent so the
  // column never reflows vertically on hydration. SSR/jsdom default 600.
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(600)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => {
      const w = el.clientWidth
      if (w > 0) setWidth(w)
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const m = metricsFor(width)
  const pts = buildPoints(n, m, currentNodeIndex)
  const segs = buildSegments(pts)
  const cardGap = currentNodeIndex >= 0 ? CARD_GAP : 0
  const height = TOP_PAD + (n - 1) * ROW_H + cardGap + BOTTOM_PAD

  // Coral trail through the current node; slate after. Whole trail coral once
  // every ile is done; none when no ile is current (unauthored level).
  const accentTo = currentNodeIndex >= 0 ? currentNodeIndex : allDone ? n - 1 : 0

  // Scroll the current node into view once (centred), motion-safe.
  const currentRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = currentRef.current
    if (!el || typeof el.scrollIntoView !== 'function') return
    const reduce =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false
    el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
  }, [level, completed, width])

  return (
    <div
      data-testid="carte-journey"
      style={{ maxWidth: 620, margin: '0 auto', padding: 'clamp(8px, 2vw, 24px) 0 64px', fontFamily: UI_FONT }}
    >
      <header style={{ marginBottom: 8 }}>
        <span
          data-testid="carte-level"
          style={{
            display: 'inline-block',
            fontFamily: 'var(--f-mono)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--accent-foreground)',
            background: 'var(--accent)',
            borderRadius: 'var(--r-pill)',
            padding: '4px 13px',
            marginBottom: 14,
            boxShadow: '0 2px 8px color-mix(in srgb, var(--accent) 35%, transparent)',
          }}
        >
          Niveau {journey.level}
        </span>
        <h1
          style={{
            fontFamily: HEADING_FONT,
            fontSize: 'clamp(2rem, 5vw, 2.75rem)',
            fontWeight: 700,
            color: 'var(--heading)',
            margin: '0 0 10px',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          La Carte
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.6, maxWidth: 460 }}>
          Votre parcours vers le TCF, île par île. La grammaire d&apos;abord, puis
          les sept thèmes, chacun suivi de son mini-examen.
        </p>
      </header>

      {/* The trail. Height is deterministic; the SVG path + bubbles are laid out
          from the measured width. */}
      <div ref={wrapRef} data-testid="carte-map" style={{ position: 'relative', width: '100%', height }}>
        {/* Winding trail. Decorative: aria-hidden, never focusable. Coral up to
            the current node, neutral slate after, round caps. */}
        <svg
          data-testid="carte-trail"
          aria-hidden="true"
          width={width}
          height={height}
          viewBox={`0 0 ${round(width)} ${round(height)}`}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
          <path
            d={pathD(pts, segs, 0, n - 1)}
            fill="none"
            stroke="var(--rule)"
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {accentTo > 0 && (
            <path
              d={pathD(pts, segs, 0, accentTo)}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>

        {/* The 8 bubbles. */}
        {nodes.map((node, i) => (
          <NodeBubble
            key={node.key}
            ref={i === currentNodeIndex ? currentRef : undefined}
            node={node}
            point={pts[i]}
            isCurrent={i === currentNodeIndex}
          />
        ))}

        {/* The current-node card: real ile + real progress + the single CTA. */}
        {currentIle && currentNodeIndex >= 0 && (
          <CurrentCard
            ileNumber={currentIleIndex + 1}
            label={THEME_LABELS[currentIle.theme]}
            href={`/ile/${currentIle.theme}`}
            progressPct={progressPct}
            point={pts[currentNodeIndex]}
            innerW={m.innerW}
          />
        )}
      </div>
    </div>
  )
}

// One chunky, pressable bubble + its label. The outer absolute frame carries the
// carte-grammar / carte-ile contract (data-theme/data-status); the inner element
// is the interaction (navigable Link, or non-interactive role="link" for the
// grammar foundation and locked/bientot iles). The single carte-current-cta lives
// on the floating card, NOT here, so there is exactly one across the surface.
const NodeBubble = forwardRef<HTMLDivElement, { node: Node; point: Pt; isCurrent: boolean }>(
  function NodeBubble({ node, point, isCurrent }, ref) {
    const grammar = node.key === 'grammaire'
    const completed = node.status === 'completed'
    const locked = node.status === 'locked' || node.status === 'bientot'
    const navigable = !!node.href
    const Icon = NODE_ICON[node.key]

    const ariaLabel = isCurrent
      ? `${node.label}, étape actuelle`
      : completed
        ? `${node.label}, terminée`
        : `${node.label}, ${node.status === 'bientot' ? 'bientôt' : 'verrouillée'}`

    // State-driven bubble surface. The chunky "lip" is a hard offset shadow under
    // the bubble; the soft shadow sits beneath it. v3 tokens only.
    const surface = completed
      ? { bg: 'var(--accent)', icon: 'var(--accent-foreground)', lip: 'color-mix(in srgb, var(--accent) 72%, #000)', border: 'none' }
      : isCurrent
        ? { bg: 'var(--paper)', icon: 'var(--accent)', lip: 'color-mix(in srgb, var(--ink) 16%, var(--paper))', border: '3px solid var(--accent)' }
        : { bg: 'var(--paper-edge)', icon: 'var(--ink-faint)', lip: 'color-mix(in srgb, var(--ink) 12%, var(--paper-edge))', border: '1px solid var(--rule)' }

    const bubble = (
      <div
        data-testid="carte-bubble"
        className={isCurrent ? 'carte-node-bounce' : undefined}
        style={{
          position: 'relative',
          width: BUBBLE,
          height: BUBBLE,
          borderRadius: '50%',
          boxSizing: 'border-box',
          background: surface.bg,
          border: surface.border,
          color: surface.icon,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 5px 0 ${surface.lip}, 0 10px 18px color-mix(in srgb, var(--ink) 16%, transparent)`,
          transform: isCurrent ? 'scale(1.06)' : 'none',
        }}
      >
        <Icon aria-hidden="true" size={Math.round(BUBBLE * 0.42)} strokeWidth={2} />

        {/* Completed badge: coral disc + white check, top-right. */}
        {completed && (
          <span
            aria-hidden="true"
            data-testid="carte-check-badge"
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'var(--accent)',
              border: '2px solid var(--paper)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-foreground)',
            }}
          >
            <Check size={14} strokeWidth={3} />
          </span>
        )}

        {/* Locked badge: slate disc + lock, top-right. */}
        {locked && (
          <span
            aria-hidden="true"
            data-testid="carte-lock-badge"
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'var(--paper)',
              border: '1px solid var(--rule)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ink-faint)',
            }}
          >
            <Lock size={12} strokeWidth={2.5} />
          </span>
        )}
      </div>
    )

    const label = (
      <p
        style={{
          marginTop: 10,
          textAlign: 'center',
          maxWidth: 132,
          fontFamily: UI_FONT,
          fontSize: 13,
          fontWeight: 600,
          lineHeight: 1.2,
          color: locked ? 'var(--ink-soft)' : 'var(--ink)',
        }}
      >
        {node.label}
      </p>
    )

    const innerStyle = {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center' as const,
      textDecoration: 'none',
    }

    const interaction = navigable ? (
      <Link href={node.href!} aria-label={ariaLabel} className="ed-btn-press" style={innerStyle}>
        {bubble}
        {label}
      </Link>
    ) : (
      <div role="link" aria-disabled="true" aria-label={ariaLabel} style={innerStyle}>
        {bubble}
        {label}
      </div>
    )

    return (
      <div
        ref={ref}
        data-testid={grammar ? 'carte-grammar' : 'carte-ile'}
        {...(grammar ? { 'data-live': String(node.status !== 'locked' && node.status !== 'bientot') } : {})}
        data-theme={node.theme ?? 'grammaire'}
        data-status={node.status}
        style={{
          position: 'absolute',
          left: point.x,
          top: point.y - BUBBLE / 2,
          transform: 'translateX(-50%)',
          width: BUBBLE + 56,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {interaction}
      </div>
    )
  },
)

// The current-node card: eyebrow "Île N", theme title, a coral % bar with the
// real completed-iles percentage, and the coral Continuer CTA deep-linking to the
// current ile. This carries the single carte-current-cta. Anchored to the current
// bubble's x (clamped inside the column), floated just below it.
function CurrentCard({
  ileNumber,
  label,
  href,
  progressPct,
  point,
  innerW,
}: {
  ileNumber: number
  label: string
  href: string
  progressPct: number
  point: Pt
  innerW: number
}) {
  const cardW = Math.min(CARD_W, innerW - 24)
  const half = cardW / 2
  const left = Math.max(half + 8, Math.min(point.x, innerW - half - 8))
  return (
    <div
      data-testid="carte-current-card"
      style={{
        position: 'absolute',
        left,
        top: point.y + BUBBLE / 2 + 18,
        transform: 'translateX(-50%)',
        zIndex: 5,
        width: cardW,
        background: 'var(--paper)',
        borderRadius: 'var(--r-lg)',
        border: '1px solid var(--rule)',
        boxShadow: '0 14px 36px color-mix(in srgb, var(--ink) 26%, transparent)',
        padding: '16px 18px',
        fontFamily: UI_FONT,
      }}
    >
      <p
        style={{
          fontFamily: 'var(--f-mono)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          margin: '0 0 4px',
        }}
      >
        Île {ileNumber}
      </p>
      <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--heading)', margin: '0 0 12px', lineHeight: 1.2 }}>
        {label}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ flex: 1, height: 9, borderRadius: 'var(--r-pill)', background: 'var(--paper-edge)', overflow: 'hidden' }}
        >
          <div style={{ width: `${progressPct}%`, height: '100%', borderRadius: 'var(--r-pill)', background: 'var(--accent)' }} />
        </div>
        <span data-testid="carte-progress-pct" style={{ fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)' }}>
          {progressPct}%
        </span>
      </div>

      <Link
        href={href}
        data-testid="carte-current-cta"
        className="ed-btn-press"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          minHeight: 44,
          borderRadius: 'var(--r-md)',
          background: 'var(--accent)',
          color: 'var(--accent-foreground)',
          fontSize: 15,
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Continuer
      </Link>
    </div>
  )
}
