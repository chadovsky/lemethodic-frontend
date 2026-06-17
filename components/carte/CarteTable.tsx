'use client'

// F-472 — La Carte: an informative table (replaces the F-471 bubble trail).
//
// The journey is now a table, not a path. >=640px (container width) renders a
// 4-column table (Île / Focus / Progression / État); <640px stacks each île as a
// card (no horizontal scroll). ONE component, both layouts off one measured
// width; the data + DOM contract are identical across them.
//
// Data wiring is unchanged (the data layer is not touched): level from the target
// profile, completed iles from the seance-progress seam, journey =
// getJourney(level, completed). The DOM contract the e2e relies on is preserved:
// carte-journey, carte-map, carte-level, carte-grammar (data-live), carte-ile
// (data-theme/data-status), /ile/<theme> links, and exactly one carte-current-cta
// -> /ile/<current>.
//
// Per-theme palette (lib/carte/table-data) drives the tile + progress fill + the
// current Continuer button. NO coral anywhere (no --accent, no #E05C42/#DC5D4B);
// the NIVEAU pill is indigo. Structural surfaces use v3 tokens, so light + dark
// both work. Inter headings, DM Mono numbers.

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
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
  ArrowRight,
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
import { THEME_COLOR, FOCUS_BLURB, LEVEL_PILL_COLOR, DONE_GREEN } from '@/lib/carte/table-data'

const THEME_LABELS: Record<ThemeId, string> = Object.fromEntries(
  THEMES.map((theme) => [theme.id, theme.label]),
) as Record<ThemeId, string>

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

// Inter (v3 system face) — explicitly not the retired serif.
const HEADING_FONT = 'var(--f-en), var(--f-ui), -apple-system, system-ui, sans-serif'
const UI_FONT = 'var(--f-ui), -apple-system, system-ui, sans-serif'
const MONO_FONT = 'var(--f-mono), ui-monospace, monospace'

// One table/card row: grammar foundation (key 'grammaire') or one of the 7
// themes. Carries everything a row needs without re-deriving the journey.
interface Row {
  key: IslandKey
  theme?: ThemeId
  status: Status
  eyebrow: string // "Île N" or "Fondations"
  label: string
  color: string
  focus: string
  pct: number // 100 done / partial current / 0 locked
  href?: string // present only when the row name is navigable
  isCurrent: boolean
  isLocked: boolean
}

export default function CarteTable() {
  const [level, setLevel] = useState<Level>('B1')
  const [completed, setCompleted] = useState<ThemeId[]>([])

  useEffect(() => {
    const resolved = readTargetLevel()
    setLevel(resolved)
    setCompleted(readCompletedIles(resolved))
  }, [])

  const journey: Journey = useMemo(() => getJourney(level, completed), [level, completed])
  const grammarLive = journey.grammarPhase.length > 0

  // Real journey progress: completed iles out of the 7 themes. No fabrication.
  const overallPct = Math.round((completed.length / THEMES.length) * 100)

  const rows: Row[] = useMemo(() => {
    const grammar: Row = {
      key: 'grammaire',
      status: grammarLive ? 'completed' : 'locked',
      eyebrow: 'Fondations',
      label: 'La grammaire',
      color: THEME_COLOR.grammaire,
      focus: FOCUS_BLURB.grammaire,
      pct: grammarLive ? 100 : 0,
      isCurrent: false,
      isLocked: !grammarLive,
    }
    const iles: Row[] = journey.iles.map((ile: Ile, i: number) => {
      const isCurrent = ile.status === 'current'
      const done = ile.status === 'completed'
      const isLocked = ile.status === 'locked' || ile.status === 'bientot'
      return {
        key: ile.theme,
        theme: ile.theme,
        status: ile.status,
        eyebrow: `Île ${i + 1}`,
        label: THEME_LABELS[ile.theme],
        color: THEME_COLOR[ile.theme],
        focus: FOCUS_BLURB[ile.theme],
        // done = full; current = real overall journey %; locked = empty.
        pct: done ? 100 : isCurrent ? overallPct : 0,
        // completed rows revisit via the name link; the current row routes via
        // the single carte-current-cta button, so its name is not a duplicate link.
        href: done ? `/ile/${ile.theme}` : undefined,
        isCurrent,
        isLocked,
      }
    })
    return [grammar, ...iles]
  }, [journey, grammarLive, overallPct])

  const currentIleIndex = journey.iles.findIndex((ile) => ile.status === 'current')
  const currentHref = currentIleIndex >= 0 ? `/ile/${journey.iles[currentIleIndex].theme}` : undefined
  const currentColor = currentIleIndex >= 0 ? THEME_COLOR[journey.iles[currentIleIndex].theme] : undefined

  // Container width drives the layout switch (so the table only renders when it
  // has room; otherwise cards). Default 720 => table on SSR + in jsdom (clientWidth
  // is 0 there, so the default holds). ResizeObserver-guarded.
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(720)
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
  const stacked = width < 640

  return (
    <div
      data-testid="carte-journey"
      style={{ maxWidth: 940, margin: '0 auto', padding: 'clamp(8px, 2vw, 24px) 0 64px', fontFamily: UI_FONT }}
    >
      <header style={{ marginBottom: 18 }}>
        <span
          data-testid="carte-level"
          style={{
            display: 'inline-block',
            fontFamily: MONO_FONT,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            background: LEVEL_PILL_COLOR,
            borderRadius: 'var(--r-pill)',
            padding: '4px 13px',
            marginBottom: 14,
            boxShadow: `0 2px 8px color-mix(in srgb, ${LEVEL_PILL_COLOR} 35%, transparent)`,
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
        <p style={{ fontSize: '1rem', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.6, maxWidth: 520 }}>
          Votre parcours vers le TCF, île par île. La grammaire d&apos;abord, puis
          les sept thèmes, chacun suivi de son mini-examen.
        </p>
      </header>

      <div ref={wrapRef} data-testid="carte-map" style={{ width: '100%' }}>
        {stacked ? (
          <CardStack rows={rows} currentHref={currentHref} currentColor={currentColor} />
        ) : (
          <TableView rows={rows} currentHref={currentHref} currentColor={currentColor} />
        )}
      </div>
    </div>
  )
}

// ── Shared cell pieces ────────────────────────────────────────────────────────

const GRAY_TILE = 'color-mix(in srgb, var(--ink) 20%, var(--paper-edge))'

function Tile({ row, size = 40 }: { row: Row; size?: number }) {
  const Icon = NODE_ICON[row.key]
  return (
    <span
      aria-hidden="true"
      style={{
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: 10,
        background: row.isLocked ? GRAY_TILE : row.color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: row.isLocked ? 'var(--ink-faint)' : '#FFFFFF',
      }}
    >
      <Icon size={Math.round(size * 0.5)} strokeWidth={2} />
    </span>
  )
}

function NameBlock({ row }: { row: Row }) {
  const name = row.href ? (
    <Link
      href={row.href}
      style={{ fontFamily: UI_FONT, fontSize: 15, fontWeight: 700, color: 'var(--heading)', textDecoration: 'none', lineHeight: 1.2 }}
    >
      {row.label}
    </Link>
  ) : (
    <span style={{ fontFamily: UI_FONT, fontSize: 15, fontWeight: 700, color: row.isLocked ? 'var(--ink-soft)' : 'var(--heading)', lineHeight: 1.2 }}>
      {row.label}
    </span>
  )
  return (
    <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <span
        style={{
          fontFamily: MONO_FONT,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: row.isLocked ? 'var(--ink-faint)' : row.color,
        }}
      >
        {row.eyebrow}
      </span>
      {name}
    </span>
  )
}

function ProgressBar({ row }: { row: Row }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span
        role="progressbar"
        aria-valuenow={row.pct}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          flex: 1,
          minWidth: 64,
          height: 8,
          borderRadius: 'var(--r-pill)',
          background: 'color-mix(in srgb, var(--ink) 8%, transparent)',
          overflow: 'hidden',
        }}
      >
        <span style={{ display: 'block', width: `${row.pct}%`, height: '100%', borderRadius: 'var(--r-pill)', background: row.color }} />
      </span>
      <span style={{ fontFamily: MONO_FONT, fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)', minWidth: 34, textAlign: 'right' }}>
        {row.pct} %
      </span>
    </span>
  )
}

function DonePill() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 10px',
        borderRadius: 'var(--r-pill)',
        background: `color-mix(in srgb, ${DONE_GREEN} 14%, transparent)`,
        color: DONE_GREEN,
        fontFamily: UI_FONT,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      <Check size={13} strokeWidth={2.5} aria-hidden="true" />
      Terminé
    </span>
  )
}

function LockedPill() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 10px',
        borderRadius: 'var(--r-pill)',
        background: 'var(--paper-edge)',
        color: 'var(--ink-faint)',
        fontFamily: UI_FONT,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      <Lock size={12} strokeWidth={2.5} aria-hidden="true" />
      Verrouillé
    </span>
  )
}

function ContinuerButton({ href, color, full }: { href: string; color: string; full?: boolean }) {
  return (
    <Link
      href={href}
      data-testid="carte-current-cta"
      className="ed-btn-press"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        width: full ? '100%' : undefined,
        minHeight: full ? 44 : 36,
        padding: full ? undefined : '0 14px',
        borderRadius: 'var(--r-md)',
        background: color,
        color: '#FFFFFF',
        fontFamily: UI_FONT,
        fontSize: 14,
        fontWeight: 600,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      Continuer
      <ArrowRight size={16} strokeWidth={2.5} aria-hidden="true" />
    </Link>
  )
}

// Status cell content shared by both layouts.
function StateCell({ row, currentHref, currentColor, full }: { row: Row; currentHref?: string; currentColor?: string; full?: boolean }) {
  if (row.isCurrent && currentHref && currentColor) {
    return <ContinuerButton href={currentHref} color={currentColor} full={full} />
  }
  if (row.status === 'completed') return <DonePill />
  return <LockedPill />
}

function rowContract(row: Row) {
  return {
    'data-testid': row.key === 'grammaire' ? 'carte-grammar' : 'carte-ile',
    ...(row.key === 'grammaire' ? { 'data-live': String(!row.isLocked) } : {}),
    'data-theme': row.theme ?? 'grammaire',
    'data-status': row.status,
  }
}

// ── Table (>=640) ─────────────────────────────────────────────────────────────

function TableView({ rows, currentHref, currentColor }: { rows: Row[]; currentHref?: string; currentColor?: string }) {
  const th: CSSProperties = {
    textAlign: 'left',
    fontFamily: MONO_FONT,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--ink-faint)',
    padding: '14px 18px',
  }
  return (
    <div
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--r-lg)',
        boxShadow: '0 8px 28px color-mix(in srgb, var(--ink) 10%, transparent)',
        overflow: 'hidden',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: UI_FONT }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--rule)' }}>
            <th style={{ ...th, width: '30%' }}>Île</th>
            <th style={{ ...th }}>Focus</th>
            <th style={{ ...th, width: '24%' }}>Progression</th>
            <th style={{ ...th, width: 140 }}>État</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const last = i === rows.length - 1
            const td: CSSProperties = {
              padding: '14px 18px',
              borderBottom: last ? 'none' : '1px solid var(--rule)',
              verticalAlign: 'middle',
            }
            return (
              <tr
                key={row.key}
                {...rowContract(row)}
                className="carte-row"
                style={row.isCurrent ? { background: `color-mix(in srgb, ${row.color} 7%, var(--paper))` } : undefined}
              >
                <td style={{ ...td, borderLeft: `3px solid ${row.isCurrent ? row.color : 'transparent'}` }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <Tile row={row} />
                    <NameBlock row={row} />
                  </span>
                </td>
                <td style={{ ...td, fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.45 }}>{row.focus}</td>
                <td style={td}>
                  <ProgressBar row={row} />
                </td>
                <td style={td}>
                  <StateCell row={row} currentHref={currentHref} currentColor={currentColor} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Cards (<640) ──────────────────────────────────────────────────────────────

function CardStack({ rows, currentHref, currentColor }: { rows: Row[]; currentHref?: string; currentColor?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {rows.map((row) => (
        <div
          key={row.key}
          {...rowContract(row)}
          className="carte-card"
          style={{
            background: row.isCurrent ? `color-mix(in srgb, ${row.color} 8%, var(--paper))` : 'var(--paper)',
            border: '1px solid var(--rule)',
            borderLeft: `3px solid ${row.isCurrent ? row.color : 'var(--rule)'}`,
            borderRadius: 'var(--r-lg)',
            boxShadow: '0 4px 16px color-mix(in srgb, var(--ink) 8%, transparent)',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <Tile row={row} />
            <NameBlock row={row} />
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.45 }}>{row.focus}</p>
          <ProgressBar row={row} />
          <div>
            <StateCell row={row} currentHref={currentHref} currentColor={currentColor} full />
          </div>
        </div>
      ))}
    </div>
  )
}
