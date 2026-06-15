'use client'

// F-462 — La Carte: the serpentine journey map.
//
// Rebuilds the carte presentation from the old vertical list (CarteJourney) into
// a Duolingo-style serpentine trail: the islands ARE the path, zig-zagging down
// a single scrolling column connected by a smooth bezier curve, with a "vous
// êtes ici" pin on the current node. Mobile-first, deterministic placement (no
// hand-laid coordinates), scales to any node count.
//
// Data wiring is unchanged from F-457/460/461: level from the target profile,
// completed iles from the seance-progress seam, journey = getJourney(level,
// completed). Each node keeps its existing destination/state; IslandNode (with
// its 3 states + grounding shadow + load behaviour) is reused verbatim, just
// rendered larger. Mocks stay markers on the path, not islands. No data-model,
// routing, or IslandNode change.
//
// v3 tokens only (no hardcoded hex), rounded-only, soft shadows. The path and
// decorative marks are aria-hidden; nodes are links/markers in journey order.
// Scroll-into-view + the only transitions ride prefers-reduced-motion.

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { BookOpen, ClipboardCheck, Flag, MapPin } from 'lucide-react'
import {
  getJourney,
  THEMES,
  type Journey,
  type Level,
  type Ile,
  type ThemeId,
  type Mock,
} from '@/lib/journey/journey'
import { readTargetLevel } from '@/lib/journey/target-level'
import { readCompletedIles } from '@/lib/journey/progress'
import IslandNode from '@/components/carte/IslandNode'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

const THEME_LABELS: Record<ThemeId, string> = Object.fromEntries(
  THEMES.map((theme) => [theme.id, theme.label]),
) as Record<ThemeId, string>

// IslandNode renders a fixed 72px footprint (KEEP: not touched). We scale it up
// for the serpentine via a CSS transform off this base.
const ISLAND_BASE = 72

// ── Geometry (deterministic, width-driven) ──────────────────────────────────

interface Pt {
  x: number
  y: number
}

interface Metrics {
  desktop: boolean
  island: number // rendered island box (scaled IslandNode)
  rowH: number // vertical gap between consecutive spine points
  amp: number // horizontal zig-zag amplitude around centre
  center: number
  top: number
  bottom: number
}

// Sizes scale with the measured container width. The amplitude is clamped so an
// island at its render size can never overflow the column (the 375px guard).
function metricsFor(width: number): Metrics {
  const desktop = width >= 640
  const island = desktop ? 132 : 86
  const rowH = desktop ? 176 : 136
  const center = width / 2
  const maxAmp = center - island / 2 - 14
  const amp = Math.max(40, Math.min(desktop ? 168 : width * 0.27, maxAmp))
  const top = island / 2 + 56
  const bottom = island / 2 + 52
  return { desktop, island, rowH, amp, center, top, bottom }
}

// Alternating offset around centre: even index left, odd index right. Purely a
// function of the index + metrics, so it works for any node count.
function buildPoints(n: number, m: Metrics): Pt[] {
  return Array.from({ length: n }, (_, i) => ({
    x: m.center + (i % 2 === 0 ? -1 : 1) * m.amp,
    y: m.top + i * m.rowH,
  }))
}

interface Seg {
  c1: Pt
  c2: Pt
  p: Pt
}

// Catmull-Rom -> cubic bezier control points, one segment per gap. Smooth curve
// through every node centre with matched tangents (so the accent prefix and the
// muted full path share the same shape).
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

// Path string for gaps [from, to). Empty when the range is empty.
function pathD(pts: Pt[], segs: Seg[], from: number, to: number): string {
  if (to <= from || pts.length === 0) return ''
  let d = `M ${round(pts[from].x)} ${round(pts[from].y)}`
  for (let i = from; i < to; i++) {
    const s = segs[i]
    d += ` C ${round(s.c1.x)} ${round(s.c1.y)} ${round(s.c2.x)} ${round(s.c2.y)} ${round(s.p.x)} ${round(s.p.y)}`
  }
  return d
}

// Point on the cubic for gap g at parameter t (mock markers sit at the segment
// midpoint, on the path between two islands).
function pointOnGap(pts: Pt[], segs: Seg[], g: number, t: number): Pt {
  const p0 = pts[g]
  const { c1, c2, p: p3 } = segs[g]
  const mt = 1 - t
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * p3.y,
  }
}

function round(n: number): number {
  return Math.round(n * 10) / 10
}

// ── Node labels ─────────────────────────────────────────────────────────────

function NodeLabel({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginTop: 8, textAlign: 'center', maxWidth: 132 }}>
      <p
        style={{
          fontFamily: SANS_FONT,
          fontSize: 13,
          fontWeight: 600,
          lineHeight: 1.2,
          color: 'var(--ink)',
          margin: 0,
        }}
      >
        {title}
      </p>
      {sub && (
        <p
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--ink-faint)',
            margin: '3px 0 0',
          }}
        >
          {sub}
        </p>
      )}
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function CarteMap() {
  // Level + completions resolve client-side; B1 / empty keep SSR deterministic.
  const [level, setLevel] = useState<Level>('B1')
  const [completed, setCompleted] = useState<ThemeId[]>([])

  useEffect(() => {
    const resolved = readTargetLevel()
    setLevel(resolved)
    setCompleted(readCompletedIles(resolved))
  }, [])

  const journey: Journey = useMemo(
    () => getJourney(level, completed),
    [level, completed],
  )

  // Spine: grammar (P0) -> the 7 iles (P1..P7) -> final mock (P8). 9 points.
  const n = journey.iles.length + 2

  // Width drives horizontal placement only; height is width-independent, so the
  // column never reflows vertically on hydration. Default 360 for SSR/jsdom.
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(360)

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
  const pts = buildPoints(n, m)
  const segs = buildSegments(pts)
  const height = m.top + (n - 1) * m.rowH + m.bottom

  // Accent prefix: through the current ile (the furthest reached node). When all
  // iles are done the whole path is accent; with no current ile (unauthored
  // level) nothing is accented.
  const currentIle = journey.iles.findIndex((ile) => ile.status === 'current')
  const allDone =
    journey.iles.length > 0 && journey.iles.every((ile) => ile.status === 'completed')
  const accentUpTo = currentIle >= 0 ? 1 + currentIle : allDone ? n - 1 : 0

  // Scroll the current node into view (centred) once, motion-safe.
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
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: 'clamp(8px, 2vw, 24px) 0 64px',
        fontFamily: SANS_FONT,
      }}
    >
      <header style={{ marginBottom: 12 }}>
        <span
          data-testid="carte-level"
          style={{
            display: 'inline-block',
            fontFamily: 'var(--f-mono)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
            borderRadius: 'var(--r-pill)',
            padding: '4px 13px',
            marginBottom: 14,
          }}
        >
          Niveau {journey.level}
        </span>
        <h1
          style={{
            fontFamily: SERIF_FONT,
            fontSize: 'clamp(2rem, 5vw, 2.75rem)',
            fontWeight: 400,
            color: 'var(--ink)',
            margin: '0 0 10px',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          La Carte
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--ink-soft)',
            margin: 0,
            lineHeight: 1.6,
            maxWidth: 460,
          }}
        >
          Votre parcours vers le TCF, île par île. La grammaire d&apos;abord, puis
          les sept thèmes, chacun suivi de son mini-examen.
        </p>
      </header>

      {/* The serpentine. Height is deterministic; the SVG path + nodes are laid
          out from the measured width. */}
      <div
        ref={wrapRef}
        data-testid="carte-map"
        style={{ position: 'relative', width: '100%', height }}
      >
        {/* Curved trail. Decorative: aria-hidden, never focusable. Completed
            portion in --accent, the rest muted. */}
        <svg
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
            strokeWidth={m.desktop ? 6 : 5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {accentUpTo > 0 && (
            <path
              d={pathD(pts, segs, 0, accentUpTo)}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={m.desktop ? 6 : 5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>

        {/* Grammar node (P0): keeps its marker treatment (book icon), first on
            the trail, non-interactive (no destination). */}
        <GrammarMarker
          point={pts[0]}
          island={m.island}
          live={journey.grammarPhase.length > 0}
        />

        {/* Mock checkpoints ON the path: one mini-mock after each ile (at the
            midpoint of the gap to the next node), then the final mock at P8. */}
        {journey.iles.map((ile, k) => {
          const mid = pointOnGap(pts, segs, k + 1, 0.5)
          return (
            <MockMarker
              key={`mini-${ile.theme}`}
              point={mid}
              mock={ile.check.miniMock}
              testId="carte-mini-mock"
              theme={ile.theme}
              icon={<ClipboardCheck size={m.desktop ? 18 : 15} strokeWidth={1.75} />}
              srLabel={`Mini-examen, ${ile.check.miniMock.status === 'bientot' ? 'bientôt' : ile.check.miniMock.status}`}
              desktop={m.desktop}
            />
          )
        })}

        {/* Island nodes (P1..P7). */}
        {journey.iles.map((ile, k) => (
          <IslandTrailNode
            key={ile.theme}
            ref={ile.status === 'current' ? currentRef : undefined}
            ile={ile}
            point={pts[k + 1]}
            island={m.island}
          />
        ))}

        {/* Final mock at P8. */}
        <MockMarker
          point={pts[n - 1]}
          mock={journey.finalMock}
          testId="carte-final-mock"
          icon={<Flag size={m.desktop ? 18 : 15} strokeWidth={1.75} />}
          srLabel={`Examen final, ${journey.finalMock.status === 'bientot' ? 'bientôt' : journey.finalMock.status}`}
          desktop={m.desktop}
        />
      </div>
    </div>
  )
}

// ── Spine nodes ──────────────────────────────────────────────────────────────

function GrammarMarker({
  point,
  island,
  live,
}: {
  point: Pt
  island: number
  live: boolean
}) {
  const size = Math.round(island * 0.62)
  return (
    <div
      data-testid="carte-grammar"
      data-live={String(live)}
      style={{
        position: 'absolute',
        left: point.x,
        top: point.y - island / 2,
        transform: 'translateX(-50%)',
        width: island + 56,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          borderRadius: 'var(--r-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: live
            ? 'color-mix(in srgb, var(--dominant) 12%, var(--paper))'
            : 'var(--paper-edge)',
          border: live ? '1px solid var(--rule-strong)' : '1px dashed var(--rule)',
          color: live ? 'var(--dominant)' : 'var(--ink-faint)',
          boxShadow: '0 2px 10px color-mix(in srgb, var(--ink) 8%, transparent)',
        }}
      >
        <BookOpen size={Math.round(size * 0.42)} strokeWidth={1.75} />
      </div>
      <NodeLabel title="La grammaire" sub="Fondations" />
    </div>
  )
}

// One ile on the serpentine: the scaled IslandNode + a label. The outer frame
// carries the carte-ile contract (data-theme/data-status); the inner element is
// the interaction: current/completed -> a navigable Link to the canonical ile
// route (the current one is also the single carte-current-cta), locked/bientot
// -> a non-interactive role="link" aria-disabled (no href, no keyboard focus).
// The "vous êtes ici" pin anchors to the current node.
const IslandTrailNode = forwardRef<HTMLDivElement, { ile: Ile; point: Pt; island: number }>(
  function IslandTrailNode({ ile, point, island }, ref) {
    const label = THEME_LABELS[ile.theme]
    const isCurrent = ile.status === 'current'
    const navigable = isCurrent || ile.status === 'completed'
    const scale = island / ISLAND_BASE

    const ariaLabel = isCurrent
      ? `${label}, niveau ${ile.level}, étape actuelle`
      : ile.status === 'completed'
        ? `${label}, niveau ${ile.level}, terminée`
        : `${label}, niveau ${ile.level}, ${ile.status === 'bientot' ? 'bientôt' : 'verrouillée'}`

    const body = (
      <>
        {isCurrent && (
          <div
            data-testid="carte-here-marker"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              marginBottom: 6,
              padding: '4px 10px',
              borderRadius: 'var(--r-pill)',
              background: 'var(--accent)',
              color: 'var(--accent-foreground)',
              fontFamily: SANS_FONT,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.02em',
              boxShadow: '0 4px 12px color-mix(in srgb, var(--accent) 40%, transparent)',
            }}
          >
            <MapPin aria-hidden="true" size={12} strokeWidth={2.5} />
            Vous êtes ici
          </div>
        )}

        <div style={{ width: island, height: island, position: 'relative' }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <IslandNode theme={ile.theme} status={ile.status} label={label} />
          </div>
        </div>

        <NodeLabel title={label} sub={`Niveau ${ile.level}`} />
      </>
    )

    const innerStyle = {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center' as const,
      textDecoration: 'none',
    }

    const interaction = navigable ? (
      <Link
        href={`/ile/${ile.theme}`}
        {...(isCurrent ? { 'data-testid': 'carte-current-cta' } : {})}
        aria-label={ariaLabel}
        className="ed-btn-press"
        style={innerStyle}
      >
        {body}
      </Link>
    ) : (
      <div role="link" aria-disabled="true" aria-label={ariaLabel} style={innerStyle}>
        {body}
      </div>
    )

    return (
      <div
        ref={ref}
        data-testid="carte-ile"
        data-theme={ile.theme}
        data-status={ile.status}
        style={{
          position: 'absolute',
          left: point.x,
          top: point.y - island / 2 - (isCurrent ? 30 : 0),
          transform: 'translateX(-50%)',
          width: island + 56,
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

// A mock checkpoint sitting ON the path (mini-mock between iles, or the final
// mock). A small rounded marker, not an island; non-interactive (bientot). The
// accessible name is carried on a role="img" wrapper; decorative icon hidden.
function MockMarker({
  point,
  mock,
  testId,
  theme,
  icon,
  srLabel,
  desktop,
}: {
  point: Pt
  mock: Mock
  testId: string
  theme?: ThemeId
  icon: React.ReactNode
  srLabel: string
  desktop: boolean
}) {
  const size = desktop ? 38 : 32
  const live = mock.status !== 'bientot' && mock.status !== 'locked'
  return (
    <div
      data-testid={testId}
      data-status={mock.status}
      {...(theme ? { 'data-theme': theme } : {})}
      role="img"
      aria-label={srLabel}
      style={{
        position: 'absolute',
        left: point.x,
        top: point.y,
        transform: 'translate(-50%, -50%)',
        width: size,
        height: size,
        borderRadius: 'var(--r-pill)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: live ? 'var(--paper)' : 'var(--paper-edge)',
        border: live ? '1px solid var(--rule-strong)' : '1px dashed var(--rule)',
        color: 'var(--ink-faint)',
        boxShadow: '0 2px 8px color-mix(in srgb, var(--ink) 10%, transparent)',
      }}
    >
      <span aria-hidden="true" style={{ display: 'flex' }}>
        {icon}
      </span>
    </div>
  )
}
