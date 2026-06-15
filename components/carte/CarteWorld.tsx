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
import { ISLAND_ART, type IslandKey } from '@/lib/journey/island-art'
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
// Bumped ~1.4x for F-469 so the islands fill the sea like the Nano Banana mock.
const ISLAND_BASE = 72
const ISLAND_RENDER = 172

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
          // Full-bleed: no rounded panel corners, the sea reads as open water to
          // the content-area edges (overflow clips clouds/reflections cleanly).
          borderRadius: 0,
          overflow: 'hidden',
        }}
      >
        {/* The sea + drifting clouds. Pure CSS, fully decorative. */}
        <div className="carte-sea" aria-hidden="true">
          <span className="carte-cloud carte-cloud-1" style={{ top: '8%', left: '10%', width: 240, height: 72 }} />
          <span className="carte-cloud carte-cloud-2" style={{ top: '17%', left: '52%', width: 300, height: 88 }} />
          <span className="carte-cloud carte-cloud-3" style={{ top: '6%', left: '78%', width: 200, height: 62 }} />
          <span className="carte-cloud carte-cloud-4" style={{ top: '28%', left: '28%', width: 220, height: 66 }} />
          <span className="carte-cloud carte-cloud-5" style={{ top: '12%', left: '38%', width: 180, height: 56 }} />
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
            <filter id="carte-trail-shadow" x="-25%" y="-25%" width="150%" height="160%">
              <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="rgba(20,30,45,0.28)" />
            </filter>
          </defs>
          {/* Muted base ribbon: the whole voyage, beyond-current reads as a calm
              raised grey trail (drawn under the coral so completed = coral). */}
          <path
            d={pathD(pts, segs, 0, n - 1)}
            fill="none"
            stroke="var(--rule)"
            strokeWidth={16}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.7}
            filter="url(#carte-trail-shadow)"
          />
          {accentTo > 0 && (
            <>
              {/* Glossy coral 3D ribbon: a thick rounded coral trail with a soft
                  drop-shadow (raised) and a lighter top highlight (sheen). */}
              <path
                d={pathD(pts, segs, 0, accentTo)}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={16}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#carte-trail-shadow)"
              />
              <path
                d={pathD(pts, segs, 0, accentTo)}
                fill="none"
                stroke="color-mix(in srgb, var(--accent) 45%, #FFFFFF)"
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.65}
                transform="translate(0,-3)"
              />
            </>
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

        {/* Water reflections: a vertically-flipped, blurred, fading copy of each
            island PNG cast on the sea beneath it, plus a soft contact glow at the
            waterline. This is what makes the islands sit IN water (not on a panel)
            and replaces the hard cast-shadow. Decorative, below the islands. */}
        {nodes.map((node, i) => (
          <IslandReflection key={`refl-${node.key}`} src={ISLAND_ART[node.key]} point={pts[i]} />
        ))}

        {/* The 8 islands. */}
        {nodes.map((node, i) => (
          <IslandPin key={node.key} node={node} point={pts[i]} isCurrent={i === currentNodeIndex} />
        ))}

        {/* Current-node floating card — floats ON the current island (mock
            placement), real ile + real progress. */}
        {currentIle && currentNodeIndex >= 0 && (
          <CurrentCard
            ileNumber={currentIleIndex + 1}
            label={THEME_LABELS[currentIle.theme]}
            href={`/ile/${currentIle.theme}`}
            progressPct={progressPct}
            point={pts[currentNodeIndex]}
            stageW={size.w}
            stageH={size.h}
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

        <div className="carte-world-art" style={{ width: ISLAND_RENDER, height: ISLAND_RENDER, position: 'relative' }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <IslandNode theme={node.key} status={node.status} label={node.label} />
          </div>
        </div>

        <div
          style={{
            marginTop: 6,
            padding: '4px 12px',
            borderRadius: 'var(--r-pill)',
            // Frosted white in BOTH modes (mock parity); fixed dark ink text so
            // it stays legible on the white pill even in dark mode.
            background: 'rgba(255, 255, 255, 0.82)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            boxShadow: '0 2px 10px rgba(20, 30, 45, 0.22)',
            textAlign: 'center',
            maxWidth: 168,
          }}
        >
          <p style={{ fontFamily: UI_FONT, fontSize: 13, fontWeight: 600, lineHeight: 1.2, color: '#1F2933', margin: 0 }}>
            {node.label}
          </p>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B7280', margin: '2px 0 0' }}>
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
        {interaction}
      </div>
    )
}

// A single island's water reflection: a vertically-flipped, blurred, downward-
// fading copy of the island PNG cast on the sea at the island's waterline, with
// a soft contact glow where the base meets the water. Positioned at the stage
// level (independent of the pin's flex layout) so it sits directly under the
// island art. Decorative, mode-aware opacity via the CSS classes.
function IslandReflection({ src, point }: { src: string; point: Pt }) {
  const w = ISLAND_RENDER
  const h = ISLAND_RENDER * 0.5
  const fade = 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 45%, transparent 82%)'
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: point.x,
        top: point.y + ISLAND_RENDER * 0.26,
        transform: 'translateX(-50%)',
        width: w,
        height: h,
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      {/* Soft contact glow at the waterline. */}
      <span
        className="carte-waterline-glow"
        style={{
          position: 'absolute',
          top: -8,
          left: '50%',
          transform: 'translateX(-50%)',
          width: w * 0.66,
          height: 18,
          borderRadius: '50%',
          filter: 'blur(5px)',
        }}
      />
      {/* Flipped, faded reflection. The mask lives on this (untransformed) span
          so the downward fade is in screen space; the inner img carries the
          scaleY(-1) so the island base mirrors at the waterline. */}
      <span
        className="carte-island-reflection"
        style={{
          position: 'absolute',
          inset: 0,
          maskImage: fade,
          WebkitMaskImage: fade,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'fill',
            transform: 'scaleY(-1)',
            filter: 'blur(2px)',
            userSelect: 'none',
          }}
        />
      </span>
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
  point,
  stageW,
  stageH,
}: {
  ileNumber: number
  label: string
  href: string
  progressPct: number
  point: Pt
  stageW: number
  stageH: number
}) {
  // Float the card on/just-below the current island, clamped inside the sea so
  // it never overflows the stage edges (the wide-viewport guard).
  const CARD_W = 320
  const MARGIN = 16
  const half = CARD_W / 2
  const left = Math.max(half + MARGIN, Math.min(point.x, stageW - half - MARGIN))
  const top = Math.min(point.y + ISLAND_RENDER * 0.5 + 18, stageH - 210)
  return (
    <div
      data-testid="carte-current-card"
      style={{
        position: 'absolute',
        left,
        top,
        transform: 'translateX(-50%)',
        zIndex: 5,
        width: CARD_W,
        maxWidth: `calc(100% - ${MARGIN * 2}px)`,
        background: 'var(--paper)',
        borderRadius: 'var(--r-lg)',
        border: '1px solid var(--rule)',
        boxShadow: '0 16px 40px color-mix(in srgb, var(--ink) 30%, transparent)',
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
