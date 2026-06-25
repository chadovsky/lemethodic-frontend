'use client'

// F-484 - La Carte: the journey backbone, config-driven (Persona-as-Config).
//
// The carte renders from getActivePersona(): rows = the persona's themes (in
// order), columns = the persona's levels (levelBand). For TCF that is 7 themes x
// 5 levels, plus the grammar foundation row. Each grid cell is a station summary
// for (theme x level); the cell's state comes from the journey/progress seam for
// journeyBound personas (the learner's real states live on their RESOLVED level
// column) and is bientot everywhere else. A non-journey persona (a mold) renders
// every cell bientot with ZERO component change - that is the config-only proof.
//
// No-gates doctrine: the carte has no "locked"/Verrouillé state. The journey
// model still uses 'locked' to drive seance walkability, but cellStatusFor maps
// it to 'bientot' (not built, not a gate) for this surface.
//
// Twin view (theme | skill): co-primary projections of the same station set.
// Theme view is the grid below; skill view groups the stations by CO/CE/EO/EE.
// Default is theme view so the DOM contract resolves on load.
//
// Preserved DOM contract (F-472 / F-458 / F-459 / F-460): carte-journey,
// carte-map, carte-level, carte-grammar (data-live / data-theme / data-status),
// carte-ile (data-theme / data-status) x the persona's themes, completed rows
// link back to /ile/<theme>, exactly one carte-current-cta -> /ile/<current>.
//
// Per-theme palette (lib/carte/table-data) drives tiles + chips; mold themes
// cycle the same palette. NO coral; the NIVEAU pill is indigo. Structural
// surfaces use v3 tokens, so light + dark both work.

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
  ArrowRight,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { type Level, type ThemeId } from '@/lib/journey/journey'
import { readTargetLevel } from '@/lib/journey/target-level'
import { readCompletedIles } from '@/lib/journey/progress'
import {
  getActivePersona,
  cellStatusFor,
  stationsFor,
  type CellStatus,
  type Persona,
  type Skill,
} from '@/lib/personas'
import {
  FOCUS_BLURB,
  LEVEL_PILL_COLOR,
  DONE_GREEN,
  colorForTheme,
} from '@/lib/carte/table-data'
import BientotSlot from './BientotSlot'
import LeCapSlot from './LeCapSlot'
import GlobalRail from './GlobalRail'
import CarteViewToggle, { type CarteView } from './CarteViewToggle'

const HEADING_FONT = 'var(--f-en), var(--f-ui), -apple-system, system-ui, sans-serif'
const UI_FONT = 'var(--f-ui), -apple-system, system-ui, sans-serif'
const MONO_FONT = 'var(--f-mono), ui-monospace, monospace'

// Canonical-theme icons; mold themes fall back to a generic glyph.
const NODE_ICON: Record<string, LucideIcon> = {
  grammaire: BookOpen,
  education: GraduationCap,
  famille: Users,
  culture: Landmark,
  sante: HeartPulse,
  technologie: Cpu,
  environnement: Leaf,
  economie: Coins,
}

interface Cell {
  level: Level
  status: CellStatus
}

interface Row {
  key: string
  isGrammar: boolean
  theme?: string
  label: string
  eyebrow: string
  focus: string
  color: string
  rowStatus: CellStatus | 'completed' | 'bientot'
  dataLive?: boolean // grammar row only
  cells: Cell[]
  nameHref?: string // completed rows link their name back to the ile route
}

const SKILLS: { id: Skill; label: string }[] = [
  { id: 'CO', label: 'Compréhension orale' },
  { id: 'CE', label: 'Compréhension écrite' },
  { id: 'EO', label: 'Expression orale' },
  { id: 'EE', label: 'Expression écrite' },
]

export default function CarteTable() {
  // Persona is product config; resolved level + completions are user state.
  const [persona, setPersona] = useState<Persona>(() => getActivePersona())
  const [level, setLevel] = useState<Level>('B1')
  const [completed, setCompleted] = useState<ThemeId[]>([])
  const [view, setView] = useState<CarteView>('theme')

  useEffect(() => {
    setPersona(getActivePersona())
    const resolved = readTargetLevel()
    setLevel(resolved)
    setCompleted(readCompletedIles(resolved))
  }, [])

  const band = persona.levelBand

  // Grammar foundation exists only for journeyBound personas (the islands path).
  const grammarLive = useMemo(
    () => persona.journeyBound && level === 'B1',
    [persona.journeyBound, level],
  )

  const rows: Row[] = useMemo(() => {
    const built: Row[] = []

    if (persona.journeyBound) {
      built.push({
        key: 'grammaire',
        isGrammar: true,
        theme: 'grammaire',
        label: 'La grammaire',
        eyebrow: 'Fondations',
        focus: FOCUS_BLURB.grammaire,
        color: colorForTheme('grammaire', 0),
        rowStatus: grammarLive ? 'completed' : 'bientot',
        dataLive: Boolean(grammarLive),
        cells: band.map((lvl) => ({
          level: lvl,
          status: (grammarLive && lvl === level ? 'completed' : 'bientot') as CellStatus,
        })),
      })
    }

    for (const theme of persona.themes) {
      const cells: Cell[] = band.map((lvl) => ({
        level: lvl,
        status: cellStatusFor(persona, theme.id, lvl, level, completed),
      }))
      const rowStatus = cells.find((c) => c.level === level)?.status ?? 'bientot'
      built.push({
        key: theme.id,
        isGrammar: false,
        theme: theme.id,
        label: theme.label,
        eyebrow: persona.journeyBound ? `Île ${theme.order + 1}` : `Bloc ${theme.order + 1}`,
        focus: FOCUS_BLURB[theme.id as keyof typeof FOCUS_BLURB] ?? '',
        color: colorForTheme(theme.id, theme.order),
        rowStatus,
        cells,
        nameHref: rowStatus === 'completed' ? `/ile/${theme.id}` : undefined,
      })
    }

    return built
  }, [persona, band, level, completed, grammarLive])

  // The single current theme (its resolved-level cell is 'current'). Drives the
  // one carte-current-cta. Theme-keyed route (no level-scoped routes here).
  const currentRow = rows.find((r) => !r.isGrammar && r.rowStatus === 'current')
  const currentHref = currentRow ? `/ile/${currentRow.theme}` : undefined
  const currentColor = currentRow?.color

  // Container width drives the table/card switch. Default 720 => table on SSR +
  // in jsdom (clientWidth 0 there). ResizeObserver-guarded.
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

  const stationCount = useMemo(() => stationsFor(persona).length, [persona])

  return (
    <div
      data-testid="carte-journey"
      style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(8px, 2vw, 24px) 0 64px', fontFamily: UI_FONT }}
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
          Niveau {level}
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
        <p style={{ fontSize: '1rem', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.6, maxWidth: 560 }}>
          Votre parcours, thème par thème et niveau par niveau. Chaque case est
          une étape ; tout reste accessible, rien n&apos;est verrouillé.
        </p>
      </header>

      <LeCapSlot persona={persona} />

      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
        <CarteViewToggle value={view} onChange={setView} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start' }}>
        <div ref={wrapRef} data-testid="carte-map" style={{ flex: '1 1 560px', minWidth: 0 }}>
          {view === 'skill' ? (
            <SkillView persona={persona} stationCount={stationCount} />
          ) : stacked ? (
            <CardStack rows={rows} band={band} currentHref={currentHref} currentColor={currentColor} />
          ) : (
            <TableView rows={rows} band={band} currentHref={currentHref} currentColor={currentColor} />
          )}
        </div>
        <div style={{ flex: '1 1 260px', minWidth: 0, maxWidth: 320 }}>
          <GlobalRail persona={persona} />
        </div>
      </div>
    </div>
  )
}

// ── Shared cell pieces ────────────────────────────────────────────────────────

const GRAY_TILE = 'color-mix(in srgb, var(--ink) 20%, var(--paper-edge))'

function Tile({ row, size = 40 }: { row: Row; size?: number }) {
  const Icon = NODE_ICON[row.key] ?? Sparkles
  const inert = row.rowStatus === 'bientot'
  return (
    <span
      aria-hidden="true"
      style={{
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: 10,
        background: inert ? GRAY_TILE : row.color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: inert ? 'var(--ink-faint)' : '#FFFFFF',
      }}
    >
      <Icon size={Math.round(size * 0.5)} strokeWidth={2} />
    </span>
  )
}

function NameBlock({ row }: { row: Row }) {
  const inert = row.rowStatus === 'bientot'
  const name = row.nameHref ? (
    <Link
      href={row.nameHref}
      style={{ fontFamily: UI_FONT, fontSize: 15, fontWeight: 700, color: 'var(--heading)', textDecoration: 'none', lineHeight: 1.2 }}
    >
      {row.label}
    </Link>
  ) : (
    <span style={{ fontFamily: UI_FONT, fontSize: 15, fontWeight: 700, color: inert ? 'var(--ink-soft)' : 'var(--heading)', lineHeight: 1.2 }}>
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
          color: inert ? 'var(--ink-faint)' : row.color,
        }}
      >
        {row.eyebrow}
      </span>
      {name}
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

function ContinuerButton({ href, color }: { href: string; color: string }) {
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
        minHeight: 36,
        padding: '0 12px',
        borderRadius: 'var(--r-md)',
        background: color,
        color: '#FFFFFF',
        fontFamily: UI_FONT,
        fontSize: 13.5,
        fontWeight: 600,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      Continuer
      <ArrowRight size={15} strokeWidth={2.5} aria-hidden="true" />
    </Link>
  )
}

// One grid cell (theme x level). The atom of the backbone: completed shows the
// done chip, current holds the single CTA, bientot shows the inert slot.
function CellContent({
  cell,
  color,
  currentHref,
  currentColor,
}: {
  cell: Cell
  color: string
  currentHref?: string
  currentColor?: string
}) {
  if (cell.status === 'completed') return <DonePill />
  if (cell.status === 'current' && currentHref && currentColor) {
    return <ContinuerButton href={currentHref} color={currentColor} />
  }
  return <BientotSlot compact color={color} testid="carte-cell-slot" />
}

function rowContract(row: Row) {
  return {
    'data-testid': row.isGrammar ? 'carte-grammar' : 'carte-ile',
    ...(row.isGrammar ? { 'data-live': String(Boolean(row.dataLive)) } : {}),
    'data-theme': row.theme ?? 'grammaire',
    'data-status': row.rowStatus,
  }
}

// ── Table (>=640): themes x levels ────────────────────────────────────────────

function TableView({
  rows,
  band,
  currentHref,
  currentColor,
}: {
  rows: Row[]
  band: Level[]
  currentHref?: string
  currentColor?: string
}) {
  const th: CSSProperties = {
    textAlign: 'left',
    fontFamily: MONO_FONT,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--ink-faint)',
    padding: '14px 14px',
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
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: UI_FONT, tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--rule)' }}>
            <th style={{ ...th, width: '32%' }}>Parcours</th>
            {band.map((lvl) => (
              <th key={lvl} style={{ ...th, textAlign: 'center' }}>
                {lvl}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const last = i === rows.length - 1
            const isCurrentRow = row.rowStatus === 'current'
            const td: CSSProperties = {
              padding: '12px 14px',
              borderBottom: last ? 'none' : '1px solid var(--rule)',
              verticalAlign: 'middle',
            }
            return (
              <tr
                key={row.key}
                {...rowContract(row)}
                className="carte-row"
                style={isCurrentRow ? { background: `color-mix(in srgb, ${row.color} 7%, var(--paper))` } : undefined}
              >
                <td style={{ ...td, borderLeft: `3px solid ${isCurrentRow ? row.color : 'transparent'}` }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <Tile row={row} />
                    <NameBlock row={row} />
                  </span>
                  {row.focus ? (
                    <span style={{ display: 'block', marginTop: 6, fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.4 }}>
                      {row.focus}
                    </span>
                  ) : null}
                </td>
                {row.cells.map((cell) => (
                  <td key={cell.level} style={{ ...td, textAlign: 'center' }} data-cell-level={cell.level} data-cell-status={cell.status}>
                    <span style={{ display: 'inline-flex', justifyContent: 'center' }}>
                      <CellContent cell={cell} color={row.color} currentHref={currentHref} currentColor={currentColor} />
                    </span>
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Cards (<640): one card per theme, levels as a chip row ────────────────────

function CardStack({
  rows,
  band,
  currentHref,
  currentColor,
}: {
  rows: Row[]
  band: Level[]
  currentHref?: string
  currentColor?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {rows.map((row) => {
        const isCurrentRow = row.rowStatus === 'current'
        return (
          <div
            key={row.key}
            {...rowContract(row)}
            className="carte-card"
            style={{
              background: isCurrentRow ? `color-mix(in srgb, ${row.color} 8%, var(--paper))` : 'var(--paper)',
              border: '1px solid var(--rule)',
              borderLeft: `3px solid ${isCurrentRow ? row.color : 'var(--rule)'}`,
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
            {row.focus ? (
              <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.45 }}>{row.focus}</p>
            ) : null}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              {row.cells.map((cell) => (
                <span
                  key={cell.level}
                  data-cell-level={cell.level}
                  data-cell-status={cell.status}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <span style={{ fontFamily: MONO_FONT, fontSize: 10.5, fontWeight: 600, color: 'var(--ink-faint)' }}>
                    {cell.level}
                  </span>
                  <CellContent cell={cell} color={row.color} currentHref={currentHref} currentColor={currentColor} />
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Skill view: the same station set, grouped by CO/CE/EO/EE ───────────────────

function SkillView({ persona, stationCount }: { persona: Persona; stationCount: number }) {
  const perSkill = Math.round(stationCount / SKILLS.length)
  return (
    <div
      data-testid="carte-skill-view"
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}
    >
      {SKILLS.map((skill) => (
        <div
          key={skill.id}
          data-testid="carte-skill-group"
          data-skill={skill.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            padding: 16,
            borderRadius: 'var(--r-lg)',
            border: '1px solid var(--rule)',
            background: 'var(--paper)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontFamily: HEADING_FONT, fontSize: 15, fontWeight: 700, color: 'var(--heading)' }}>
              {skill.id}
            </span>
            <span style={{ fontFamily: MONO_FONT, fontSize: 11, color: 'var(--ink-faint)' }}>
              {perSkill} stations
            </span>
          </div>
          <span style={{ fontFamily: UI_FONT, fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.4 }}>
            {skill.label}
          </span>
          <BientotSlot color="var(--ink-soft)" testid={`carte-skill-${skill.id}-slot`} />
        </div>
      ))}
    </div>
  )
}
