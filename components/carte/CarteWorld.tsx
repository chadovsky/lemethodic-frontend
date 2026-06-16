'use client'

// F-470 — La Carte: the baked Nano Banana scene + interactive overlays (desktop,
// >=1024px). Supersedes the F-469 CSS sea-world on desktop.
//
// The scene is ONE baked image (public/iles/carte-scene-light.png: ocean + the 8
// islands + the coral chain path, no app chrome, no checkmarks, no card). This
// component generates NO visuals of its own — it places the image as a fixed-ratio
// background and overlays interactivity + real journey state on top:
//   - 8 invisible click-zones (hotspots), positioned in PERCENT of the image so
//     they track on resize (lib/carte/hotspots), one per island, keyed by theme;
//   - per-island label pill (labels are NOT baked into the image);
//   - completed island -> coral checkmark badge;
//   - current island -> "Vous etes ici" pin + floating card (Ile N : <theme> +
//     coral % bar + coral Continuer -> /ile/<current>);
//   - locked island -> semi-transparent dark tint + click disabled (aria-disabled);
//   - unlocked non-current island -> clickable Link -> /ile/<theme>.
//
// Same single data source as the mobile serpentine (target level + seance-progress
// completions -> getJourney) and the same DOM contract (carte-level, carte-grammar,
// carte-ile data-theme/data-status, /ile links, the single carte-current-cta) so
// the ile/seance wiring is unaffected. Mobile (<1024) keeps the F-462 serpentine.

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
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
import { HOTSPOTS, SCENE_SRC, SCENE_ASPECT, type Hotspot } from '@/lib/carte/hotspots'
import { orderedPoints, ribbonPath, VIEW_W, VIEW_H } from '@/lib/carte/path'

const THEME_LABELS: Record<ThemeId, string> = Object.fromEntries(
  THEMES.map((theme) => [theme.id, theme.label]),
) as Record<ThemeId, string>

// Inter (v3 system face) heading stack — explicitly NOT the serif display face.
const HEADING_FONT = 'var(--f-en), var(--f-ui), -apple-system, system-ui, sans-serif'
const UI_FONT = 'var(--f-ui), -apple-system, system-ui, sans-serif'

// Click-zone size as a percent of the scene box. Wide/tall enough to cover an
// island; islands sit ~20% apart horizontally and ~29% apart vertically, so these
// never overlap a neighbour (half-extents 7.5% + 12% stay under both gaps).
const ZONE_W = 15 // % of scene width
const ZONE_H = 24 // % of scene height

// One island on the scene: the grammar foundation (key 'grammaire') or one of the
// 7 themes. Carries everything the hotspot needs without re-deriving the journey.
interface WorldNode {
  key: IslandKey
  theme?: ThemeId // present for the 7 ile nodes; absent for grammaire
  status: Status
  level: Level
  label: string
  href?: string // present only when navigable
  hotspot: Hotspot
}

export default function CarteWorld() {
  // Same client-resolved seam as the serpentine: B1 / empty keep SSR stable.
  const [level, setLevel] = useState<Level>('B1')
  const [completed, setCompleted] = useState<ThemeId[]>([])
  // Visual-gate aid: outline the hotspot zones when localStorage flag is set.
  const [debug, setDebug] = useState(false)

  useEffect(() => {
    const resolved = readTargetLevel()
    setLevel(resolved)
    setCompleted(readCompletedIles(resolved))
    try {
      setDebug(localStorage.getItem('lm.carteDebug') === '1')
    } catch {
      /* SSR / blocked storage: debug stays off */
    }
  }, [])

  const journey: Journey = useMemo(() => getJourney(level, completed), [level, completed])

  const grammarLive = journey.grammarPhase.length > 0

  // 8 island nodes in journey order: grammaire (foundation) then the 7 themes.
  const nodes: WorldNode[] = useMemo(() => {
    const grammar: WorldNode = {
      key: 'grammaire',
      status: grammarLive ? 'completed' : 'bientot',
      level: journey.level,
      label: 'La grammaire',
      hotspot: HOTSPOTS.grammaire,
    }
    const iles: WorldNode[] = journey.iles.map((ile: Ile) => {
      const navigable = ile.status === 'current' || ile.status === 'completed'
      return {
        key: ile.theme,
        theme: ile.theme,
        status: ile.status,
        level: ile.level,
        label: THEME_LABELS[ile.theme],
        href: navigable ? `/ile/${ile.theme}` : undefined,
        hotspot: HOTSPOTS[ile.theme],
      }
    })
    return [grammar, ...iles]
  }, [journey, grammarLive])

  // Current ile -> its 1-based number among the 7 themes (grammaire is node 0).
  const currentIleIndex = journey.iles.findIndex((ile) => ile.status === 'current')
  const currentIle = currentIleIndex >= 0 ? journey.iles[currentIleIndex] : null

  // Real journey progress: completed iles out of the 7 themes. No fabrication.
  const progressPct = Math.round((completed.length / THEMES.length) * 100)

  // Coral ribbon through the 8 hotspots in journey order (grammaire = node 0, so
  // the current ile is its index + 1). Solid through the current node, muted
  // beyond; whole ribbon solid once every ile is done; nothing solid when no ile
  // is current (unauthored levels).
  const points = useMemo(() => orderedPoints(), [])
  const allDone = journey.iles.length > 0 && journey.iles.every((ile) => ile.status === 'completed')
  const currentNodeIndex = currentIleIndex >= 0 ? currentIleIndex + 1 : -1
  const accentTo = currentNodeIndex >= 0 ? currentNodeIndex : allDone ? points.length - 1 : 0
  const fullD = useMemo(() => ribbonPath(points), [points])
  const solidD = useMemo(() => ribbonPath(points, 0, accentTo), [points, accentTo])

  return (
    <div
      data-testid="carte-journey"
      style={{
        position: 'relative',
        // Full-bleed: cancel the AppShell main horizontal padding so the baked
        // ocean reaches the content-area edges (within the widened 1536 column).
        marginLeft: 'calc(-1 * clamp(16px, 3vw, 32px))',
        marginRight: 'calc(-1 * clamp(16px, 3vw, 32px))',
        paddingTop: 8,
        paddingBottom: 24,
        fontFamily: UI_FONT,
      }}
    >
      <div
        data-testid="carte-map"
        className="carte-scene"
        style={{
          position: 'relative',
          width: '100%',
          // Fixed aspect ratio matching the PNG so the islands never distort and
          // the percent hotspots stay aligned to the art at any width.
          aspectRatio: String(SCENE_ASPECT),
          borderRadius: 0,
          overflow: 'hidden',
        }}
      >
        {/* The baked scene. Decorative (the islands' meaning is carried by the
            overlay hotspots); object-fit cover fills the fixed-ratio box without
            distortion. Real asset — the e2e asserts it decodes (no 404). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-testid="carte-scene"
          src={SCENE_SRC}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            userSelect: 'none',
          }}
        />

        {/* Coral chain path — an SVG ribbon threading the 8 hotspots in journey
            order (the baked scene has no path). Solid prefix = completed through
            the current node; muted = upcoming. Decorative, under the badges +
            labels (zIndex below the hotspots). */}
        <svg
          data-testid="carte-path"
          aria-hidden="true"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}
        >
          <path d={fullD} fill="none" stroke="var(--accent)" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" opacity={0.3} />
          {solidD && (
            <path d={solidD} fill="none" stroke="var(--accent)" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>

        {/* Header — over the sky band of the image. Inter heading (NOT serif),
            coral NIVEAU pill, the serpentine's descriptor copy. */}
        <header style={{ position: 'absolute', top: 'clamp(20px, 3vw, 36px)', left: 'clamp(20px, 3vw, 40px)', right: 24, zIndex: 30, maxWidth: 520 }}>
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

        {/* The 8 island hotspots: invisible click-zones + per-island overlays. */}
        {nodes.map((node) => (
          <IslandHotspot key={node.key} node={node} debug={debug} />
        ))}

        {/* Current-node floating card — real ile + real progress, the single
            carte-current-cta deep-linking to the current ile. */}
        {currentIle && (
          <CurrentCard
            ileNumber={currentIleIndex + 1}
            label={THEME_LABELS[currentIle.theme]}
            href={`/ile/${currentIle.theme}`}
            progressPct={progressPct}
            hotspot={HOTSPOTS[currentIle.theme]}
          />
        )}
      </div>
    </div>
  )
}

// One island hotspot: an invisible click-zone centred on the island, plus the
// state overlays (label pill, completion badge, "Vous etes ici" pin, locked tint).
// Current / completed (navigable) iles are Links to the canonical ile route; the
// grammar foundation and locked/bientot iles are non-interactive role="link"s.
// The single carte-current-cta lives on the floating card, NOT here.
function IslandHotspot({ node, debug }: { node: WorldNode; debug: boolean }) {
  const navigable = !!node.href
  const grammar = node.key === 'grammaire'
  const isCurrent = node.status === 'current'
  const completed = node.status === 'completed'
  const locked = node.status === 'locked' || node.status === 'bientot'

  const ariaLabel = isCurrent
    ? `${node.label}, niveau ${node.level}, étape actuelle`
    : completed
      ? `${node.label}, terminée`
      : `${node.label}, ${node.status === 'bientot' ? 'bientôt' : 'verrouillée'}`

  // The transparent click-zone covering the island; carries the interaction.
  const zoneStyle = {
    position: 'absolute' as const,
    inset: 0,
    display: 'block',
    borderRadius: 12,
    // Visual gate only: outline + faint fill so each zone can be checked against
    // the baked island. Off by default (localStorage 'lm.carteDebug' = '1').
    ...(debug
      ? { outline: '2px dashed rgba(224, 92, 66, 0.9)', background: 'rgba(224, 92, 66, 0.18)' }
      : {}),
  }

  const interaction = navigable ? (
    <Link href={node.href!} aria-label={ariaLabel} className="ed-btn-press" style={zoneStyle} />
  ) : (
    <div role="link" aria-disabled="true" aria-label={ariaLabel} style={zoneStyle} />
  )

  return (
    <div
      data-testid={grammar ? 'carte-grammar' : 'carte-ile'}
      {...(grammar ? { 'data-live': String(node.status !== 'bientot') } : {})}
      data-theme={node.theme ?? 'grammaire'}
      data-status={node.status}
      style={{
        position: 'absolute',
        left: `${node.hotspot.x}%`,
        top: `${node.hotspot.y}%`,
        width: `${ZONE_W}%`,
        height: `${ZONE_H}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isCurrent ? 25 : 20,
      }}
    >
      {/* "Vous etes ici" pin, floating just above the current island. */}
      {isCurrent && (
        <div
          data-testid="carte-here-marker"
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translate(-50%, -4px)',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 10px',
            borderRadius: 'var(--r-pill)',
            background: 'var(--accent)',
            color: 'var(--accent-foreground)',
            fontFamily: UI_FONT,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px color-mix(in srgb, var(--accent) 40%, transparent)',
          }}
        >
          <MapPin aria-hidden="true" size={12} strokeWidth={2.5} />
          Vous êtes ici
        </div>
      )}

      {/* The click-zone (Link or aria-disabled), filling the island box. */}
      {interaction}

      {/* Locked tint: a semi-transparent dark veil over the island. Decorative;
          the click is disabled on the role="link" above. */}
      {locked && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 12,
            background: 'rgba(12, 22, 38, 0.42)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Completion badge: a coral disc with a light check, top-right of the
          island. */}
      {completed && (
        <span
          aria-hidden="true"
          data-testid="carte-check-badge"
          style={{
            position: 'absolute',
            top: '8%',
            right: '14%',
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: 'var(--accent)',
            border: '2px solid var(--paper)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-foreground)',
            boxShadow: '0 4px 12px color-mix(in srgb, var(--accent) 40%, transparent)',
            pointerEvents: 'none',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      )}

      {/* Label pill, just below the island (labels are not baked into the image).
          Frosted white in both modes (mock parity); fixed dark ink so it stays
          legible on the white pill even in dark mode. */}
      <div
        style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translate(-50%, 4px)',
          padding: '4px 12px',
          borderRadius: 'var(--r-pill)',
          background: 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          boxShadow: '0 2px 10px rgba(20, 30, 45, 0.22)',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        <p style={{ fontFamily: UI_FONT, fontSize: 14, fontWeight: 600, lineHeight: 1.2, color: '#1F2933', margin: 0 }}>
          {node.label}
        </p>
      </div>
    </div>
  )
}

// The floating current-node card: "Ile N : <theme>", a coral progress bar with
// the real completed-iles percentage, and the coral Continuer CTA deep-linking to
// the current ile. This carries the single carte-current-cta. Floated above the
// current island, anchored to its hotspot percent and clamped inside the scene.
function CurrentCard({
  ileNumber,
  label,
  href,
  progressPct,
  hotspot,
}: {
  ileNumber: number
  label: string
  href: string
  progressPct: number
  hotspot: Hotspot
}) {
  // Clamp the horizontal anchor so a 320px card never spills past the scene edges.
  const left = Math.min(80, Math.max(20, hotspot.x))
  return (
    <div
      data-testid="carte-current-card"
      style={{
        position: 'absolute',
        left: `${left}%`,
        top: `${hotspot.y}%`,
        transform: 'translate(-50%, calc(-50% - 132px))',
        zIndex: 40,
        width: 320,
        maxWidth: 'calc(100% - 32px)',
        background: 'var(--paper)',
        borderRadius: 'var(--r-lg)',
        border: '1px solid var(--rule)',
        boxShadow: '0 16px 40px color-mix(in srgb, var(--ink) 30%, transparent)',
        padding: '18px 20px',
        fontFamily: UI_FONT,
      }}
    >
      <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--heading)', margin: '0 0 12px', lineHeight: 1.2 }}>
        Île {ileNumber} : {label}
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
