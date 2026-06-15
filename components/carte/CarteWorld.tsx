'use client'

// F-469 — La Carte: the immersive sea-world scatter (desktop, >=1024px).
//
// The desktop face of /carte. Where the mobile serpentine (CarteMap) stacks the
// journey down a single column, the world scatters the 8 islands across a calm
// CSS sea at authored fixed positions (lib/carte/layout-map) and threads them
// with one coral Catmull-Rom trail. Same single data source as the serpentine
// (target level + seance-progress completions -> getJourney); same DOM contract
// (carte-level, carte-grammar, carte-ile data-theme/data-status, the island-node
// art seam, /ile links, the single carte-current-cta). F-461 island art + states
// are reused verbatim; the grammar foundation is now its own island (node 0).
//
// The world fills the widened /carte content column (AppShell -> 1536) and the
// sea bleeds full-width behind it by cancelling the shell's horizontal padding.
// Everything decorative (sea, clouds, reflections, trail, buoys) is aria-hidden;
// the islands are the links/markers in journey order. Motion rides
// prefers-reduced-motion (the clouds via CSS, the only JS being layout measure).

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ClipboardCheck, Flag, MapPin } from 'lucide-react'
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
import IslandNode from '@/components/carte/IslandNode'
import {
  layoutPoints,
  buildSegments,
  pathD,
  pointOnGap,
  pastLast,
  type Pt,
} from '@/lib/carte/layout-map'

const THEME_LABELS: Record<ThemeId, string> = Object.fromEntries(
  THEMES.map((theme) => [theme.id, theme.label]),
) as Record<ThemeId, string>

// IslandNode renders a fixed 72px footprint; the world scales it up off that.
const ISLAND_BASE = 72
const ISLAND_RENDER = 124

// Inter (v3 system face) heading stack — explicitly NOT the serif display face.
const HEADING_FONT = 'var(--f-en), var(--f-ui), -apple-system, system-ui, sans-serif'
const UI_FONT = 'var(--f-ui), -apple-system, system-ui, sans-serif'

// One island on the scatter: the grammar foundation (node 0) or one of the 7
// themes. Carries everything the pin needs without re-deriving from the journey.
interface WorldNode {
  key: IslandKey
  theme?: ThemeId // present for the 7 ile nodes; absent for grammaire
  status: Status
  level: Level
  label: string
  sub: string
  href?: string // present only when navigable
}

export default function CarteWorld() {
  // Same client-resolved seam as the serpentine: B1 / empty keep SSR stable.
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

  const grammarLive = journey.grammarPhase.length > 0

  // 8 island nodes in journey order: grammaire (foundation) then the 7 themes.
  const nodes: WorldNode[] = useMemo(() => {
    const grammar: WorldNode = {
      key: 'grammaire',
      status: grammarLive ? 'completed' : 'bientot',
      level: journey.level,
      label: 'La grammaire',
      sub: 'Fondations',
    }
    const iles: WorldNode[] = journey.iles.map((ile: Ile) => {
      const navigable = ile.status === 'current' || ile.status === 'completed'
      return {
        key: ile.theme,
        theme: ile.theme,
        status: ile.status,
        level: ile.level,
        label: THEME_LABELS[ile.theme],
        sub: `Niveau ${ile.level}`,
        href: navigable ? `/ile/${ile.theme}` : undefined,
      }
    })
    return [grammar, ...iles]
  }, [journey, grammarLive])

  const n = nodes.length // 8

  // Current ile -> node index (grammaire shifts the ile indices by 1).
  const currentIleIndex = journey.iles.findIndex((ile) => ile.status === 'current')
  const currentNodeIndex = currentIleIndex >= 0 ? currentIleIndex + 1 : -1
  const currentIle = currentIleIndex >= 0 ? journey.iles[currentIleIndex] : null
  const allDone =
    journey.iles.length > 0 && journey.iles.every((ile) => ile.status === 'completed')
  // Accent the trail from grammaire through the current node (or the whole trail
  // when every ile is done; nothing when no ile is current).
  const accentTo = currentNodeIndex >= 0 ? currentNodeIndex : allDone ? n - 1 : 0

  // Real journey progress: completed iles out of the 7 themes. No fabrication.
  const progressPct = Math.round((completed.length / THEMES.length) * 100)

  // Stage size drives pixel placement. ResizeObserver-guarded (jsdom has none);
  // SSR/test default keeps the geometry deterministic before measure.
  const stageRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 1000, h: 640 })

  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const measure = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      if (w > 0 && h > 0) setSize({ w, h })
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const pts = useMemo(() => layoutPoints(size.w, size.h), [size])
  const segs = useMemo(() => buildSegments(pts), [pts])

  // Buoys: one mini-mock per gap between consecutive islands (7 segments ->
  // 7 buoys, tagged by the ile each segment arrives at), plus the final mock
  // floating just past the last island on the trail's continuation.
  const buoys = useMemo(
    () =>
      journey.iles.map((ile, i) => ({
        ile,
        point: pointOnGap(pts, segs, i, 0.5),
      })),
    [journey.iles, pts, segs],
  )
  const finalPoint = useMemo(
    () => pastLast(pts, Math.max(70, size.w * 0.06), size.w, size.h),
    [pts, size],
  )

  return (
    <div
      data-testid="carte-journey"
      style={{
        position: 'relative',
        // Full-bleed: cancel the AppShell main horizontal padding so the sea
        // reaches the content-area edges (within the widened 1536 column).
        marginLeft: 'calc(-1 * clamp(16px, 3vw, 32px))',
        marginRight: 'calc(-1 * clamp(16px, 3vw, 32px))',
        paddingTop: 8,
        paddingBottom: 24,
        fontFamily: UI_FONT,
      }}
    >
      <div
        ref={stageRef}
        data-testid="carte-map"
        style={{
          position: 'relative',
          width: '100%',
          height: 'clamp(600px, 62vw, 860px)',
          borderRadius: 'var(--r-xl)',
          overflow: 'hidden',
        }}
      >
        {/* The sea + drifting clouds. Pure CSS, fully decorative. */}
        <div className="carte-sea" aria-hidden="true">
          <span className="carte-cloud carte-cloud-1" style={{ top: '11%', left: '14%', width: 180, height: 56 }} />
          <span className="carte-cloud carte-cloud-2" style={{ top: '20%', left: '58%', width: 240, height: 70 }} />
          <span className="carte-cloud carte-cloud-3" style={{ top: '8%', left: '78%', width: 150, height: 48 }} />
        </div>

        {/* Header — over the sky band. Inter heading (NOT serif), coral NIVEAU
            pill, the serpentine's descriptor copy. */}
        <header style={{ position: 'absolute', top: 'clamp(20px, 3vw, 36px)', left: 'clamp(20px, 3vw, 40px)', right: 24, zIndex: 3, maxWidth: 520 }}>
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
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700,
              color: 'var(--heading)',
              margin: '0 0 8px',
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
            }}
          >
            La Carte
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--ink)', margin: 0, lineHeight: 1.55, maxWidth: 440 }}>
            Votre parcours vers le TCF, île par île. La grammaire d&apos;abord, puis
            les sept thèmes, chacun suivi de son mini-examen.
          </p>
        </header>

        {/* Trail. Decorative: aria-hidden, never focusable. Muted full path,
            coral accent from grammaire through the current node. */}
        <svg
          aria-hidden="true"
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${size.w} ${size.h}`}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}
        >
          <defs>
            <filter id="carte-trail-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(20,30,45,0.22)" />
            </filter>
          </defs>
          <path
            d={pathD(pts, segs, 0, n - 1)}
            fill="none"
            stroke="var(--rule)"
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85}
          />
          {accentTo > 0 && (
            <path
              d={pathD(pts, segs, 0, accentTo)}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#carte-trail-shadow)"
            />
          )}
        </svg>

        {/* Mini-mock buoys between islands + the final mock past the last. */}
        {buoys.map(({ ile, point }) => (
          <Buoy
            key={`mini-${ile.theme}`}
            point={point}
            status={ile.check.miniMock.status}
            testId="carte-mini-mock"
            theme={ile.theme}
            icon={<ClipboardCheck size={16} strokeWidth={1.75} />}
            srLabel={`Mini-examen, ${ile.check.miniMock.status === 'bientot' ? 'bientôt' : ile.check.miniMock.status}`}
          />
        ))}
        <Buoy
          point={finalPoint}
          status={journey.finalMock.status}
          testId="carte-final-mock"
          icon={<Flag size={16} strokeWidth={1.75} />}
          srLabel={`Examen final, ${journey.finalMock.status === 'bientot' ? 'bientôt' : journey.finalMock.status}`}
        />

        {/* The 8 islands. */}
        {nodes.map((node, i) => (
          <IslandPin key={node.key} node={node} point={pts[i]} isCurrent={i === currentNodeIndex} />
        ))}

        {/* Current-node floating card — over the sea, real ile + real progress. */}
        {currentIle && (
          <CurrentCard
            ileNumber={currentIleIndex + 1}
            label={THEME_LABELS[currentIle.theme]}
            href={`/ile/${currentIle.theme}`}
            progressPct={progressPct}
          />
        )}
      </div>
    </div>
  )
}

// One island: the scaled F-461 IslandNode + a white label pill. Current /
// completed islands are navigable Links to the canonical ile route; the grammar
// foundation and locked/bientot iles are non-interactive role="link"s (no href).
// The single carte-current-cta lives on the floating card, NOT here, so there is
// exactly one across the surface.
function IslandPin({ node, point, isCurrent }: { node: WorldNode; point: Pt; isCurrent: boolean }) {
    const scale = ISLAND_RENDER / ISLAND_BASE
    const navigable = !!node.href
    const grammar = node.key === 'grammaire'

    const ariaLabel = isCurrent
      ? `${node.label}, niveau ${node.level}, étape actuelle`
      : node.status === 'completed'
        ? `${node.label}, terminée`
        : `${node.label}, ${node.status === 'bientot' ? 'bientôt' : 'verrouillée'}`

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
              fontFamily: UI_FONT,
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

        <div style={{ width: ISLAND_RENDER, height: ISLAND_RENDER, position: 'relative' }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <IslandNode theme={node.key} status={node.status} label={node.label} />
          </div>
        </div>

        <div
          style={{
            marginTop: 6,
            padding: '4px 12px',
            borderRadius: 'var(--r-pill)',
            background: 'var(--paper)',
            boxShadow: '0 2px 10px color-mix(in srgb, var(--ink) 18%, transparent)',
            textAlign: 'center',
            maxWidth: 160,
          }}
        >
          <p style={{ fontFamily: UI_FONT, fontSize: 13, fontWeight: 600, lineHeight: 1.2, color: 'var(--heading)', margin: 0 }}>
            {node.label}
          </p>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-soft)', margin: '2px 0 0' }}>
            {node.sub}
          </p>
        </div>
      </>
    )

    const innerStyle = {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center' as const,
      textDecoration: 'none',
    }

    const interaction = navigable ? (
      <Link href={node.href!} aria-label={ariaLabel} className="ed-btn-press" style={innerStyle}>
        {body}
      </Link>
    ) : (
      <div role="link" aria-disabled="true" aria-label={ariaLabel} style={innerStyle}>
        {body}
      </div>
    )

    return (
      <div
        data-testid={grammar ? 'carte-grammar' : 'carte-ile'}
        {...(grammar ? { 'data-live': String(node.status !== 'bientot') } : {})}
        {...(node.theme ? { 'data-theme': node.theme } : { 'data-theme': 'grammaire' })}
        data-status={node.status}
        style={{
          position: 'absolute',
          left: point.x,
          top: point.y,
          transform: 'translate(-50%, -50%)',
          zIndex: isCurrent ? 4 : 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Faint reflection on the sea beneath the island base. */}
        <span
          aria-hidden="true"
          className="carte-reflection"
          style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: ISLAND_RENDER * 0.6, height: 12 }}
        />
        {interaction}
      </div>
    )
}

// A checkpoint buoy ON the trail: a small rounded clipboard/flag marker, not an
// island. Non-interactive (bientot, no scores). Accessible name on a role="img"
// wrapper; the icon is decorative.
function Buoy({
  point,
  status,
  testId,
  theme,
  icon,
  srLabel,
}: {
  point: Pt
  status: Status
  testId: string
  theme?: ThemeId
  icon: React.ReactNode
  srLabel: string
}) {
  const live = status !== 'bientot' && status !== 'locked'
  return (
    <div
      data-testid={testId}
      data-status={status}
      {...(theme ? { 'data-theme': theme } : {})}
      role="img"
      aria-label={srLabel}
      style={{
        position: 'absolute',
        left: point.x,
        top: point.y,
        transform: 'translate(-50%, -50%)',
        zIndex: 2,
        width: 40,
        height: 40,
        borderRadius: 'var(--r-pill)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: live ? 'var(--paper)' : 'var(--paper-edge)',
        border: live ? '1px solid var(--rule-strong)' : '1px dashed var(--rule)',
        color: 'var(--ink-faint)',
        boxShadow: '0 3px 10px color-mix(in srgb, var(--ink) 16%, transparent)',
      }}
    >
      <span aria-hidden="true" style={{ display: 'flex' }}>
        {icon}
      </span>
    </div>
  )
}

// The floating current-node card: "Île N: <theme>", a coral progress bar with
// the real completed-iles percentage, and the coral Continuer CTA deep-linking
// to the current ile. This carries the single carte-current-cta.
function CurrentCard({
  ileNumber,
  label,
  href,
  progressPct,
}: {
  ileNumber: number
  label: string
  href: string
  progressPct: number
}) {
  return (
    <div
      data-testid="carte-current-card"
      style={{
        position: 'absolute',
        bottom: 'clamp(20px, 3vw, 36px)',
        left: 'clamp(20px, 3vw, 40px)',
        zIndex: 5,
        width: 'min(340px, calc(100% - 48px))',
        background: 'var(--paper)',
        borderRadius: 'var(--r-lg)',
        border: '1px solid var(--rule)',
        boxShadow: '0 12px 32px color-mix(in srgb, var(--ink) 22%, transparent)',
        padding: '18px 20px',
        fontFamily: UI_FONT,
      }}
    >
      <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', margin: '0 0 4px' }}>
        Étape actuelle
      </p>
      <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--heading)', margin: '0 0 14px', lineHeight: 1.2 }}>
        Île {ileNumber} : {label}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Progression</span>
        <span data-testid="carte-progress-pct" style={{ fontFamily: 'var(--f-mono)', fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>
          {progressPct}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ height: 8, borderRadius: 'var(--r-pill)', background: 'var(--paper-edge)', overflow: 'hidden', marginBottom: 16 }}
      >
        <div style={{ width: `${progressPct}%`, height: '100%', borderRadius: 'var(--r-pill)', background: 'var(--accent)' }} />
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
