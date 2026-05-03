'use client'

// P-234 — cluster header. Status chip + title + chip row (grammar /
// vocabulary theme / Tâche application / CEFR level).
//
// Status displays the cluster lifecycle (not_started / in_progress /
// absorbed / needs_revisit). When `last_detection_result` is non-null we
// render a secondary chip alongside (clean / wobble / fail / not_observed).
// Both surface BE truth at the user's current state.
//
// i18n: cluster + theme labels are {[lang_code]: string} maps. Resolve in
// order: user lang → 'en' → first available.

import type {
  ClusterDetailResponse,
  RecordingHistoryEntry,
  UserClusterStateResponse,
} from '@/lib/types'
import type { InterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'

const INK = '#1A1A1A'
const INK_SOFT = '#1A1A1AB3'
const INK_MUTED = '#1A1A1A66'
const PAPER = '#FFFFFFCC'
const SAGE = '#D4E4D0'
const PEACH = '#FFD8C2'
const BUTTER = '#FFF0C2'
const LAVENDER = '#E0D4F0'
const BLUSH = '#F5D6D6'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

interface ClusterHeaderProps {
  detail: ClusterDetailResponse
  state: UserClusterStateResponse | null
  language: InterfaceLanguage
}

// ── i18n label resolver ────────────────────────────────────────────────────

function resolveLabel(labels: Record<string, string>, lang: InterfaceLanguage): string {
  if (labels[lang]) return labels[lang]
  if (labels.en) return labels.en
  // Fall back to any first-available label so a cluster missing en/fr
  // doesn't crash the header.
  const first = Object.values(labels)[0]
  return first ?? ''
}

// ── Status chip mapping ────────────────────────────────────────────────────

type Status = UserClusterStateResponse['status']
type Detection = NonNullable<RecordingHistoryEntry['detection_result']>

const STATUS_LABEL: Record<Status, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  absorbed: 'Absorbed',
  needs_revisit: 'Needs revisit',
}

const STATUS_BG: Record<Status, string> = {
  not_started: '#1A1A1A0C',
  in_progress: PEACH,
  absorbed: SAGE,
  needs_revisit: BLUSH,
}

const DETECTION_LABEL: Record<Detection, string> = {
  clean: 'Last: clean',
  wobble: 'Last: wobble',
  fail: 'Last: fail',
  not_observed: 'Last: not observed',
}

// Detection dot color — green for clean, amber for wobble, red for fail,
// muted for not_observed. Plain hex (not the FluentPath palette) since
// detection signal needs traffic-light intuition.
const DETECTION_DOT: Record<Detection, string> = {
  clean: '#2D8B55',
  wobble: '#D9A441',
  fail: '#D08272',
  not_observed: INK_MUTED,
}

// ── Tâche application label ────────────────────────────────────────────────

const TACHE_LABEL: Record<ClusterDetailResponse['tache_application'], string> = {
  tache_1: 'Tâche 1 · Interview',
  tache_2: 'Tâche 2 · Role-play',
  tache_3: 'Tâche 3 · Monologue',
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ClusterHeader({ detail, state, language }: ClusterHeaderProps) {
  const title = resolveLabel(detail.labels, language)
  const themeTitle = detail.vocabulary_theme
    ? resolveLabel(detail.vocabulary_theme.labels, language)
    : null

  return (
    <header
      style={{
        backgroundColor: PAPER,
        borderRadius: 20,
        padding: '20px 22px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Status row (first impression — what's my state on this cluster?) */}
      {state && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <StatusChip status={state.status} />
          {state.last_detection_result && (
            <DetectionChip result={state.last_detection_result} />
          )}
        </div>
      )}

      {/* Title */}
      <h1
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 800,
          fontSize: 'clamp(24px, 4vw, 32px)',
          lineHeight: 1.15,
          letterSpacing: '-0.01em',
          color: INK,
          margin: 0,
        }}
      >
        {title}
      </h1>

      {/* Meta chip row: grammar topic / vocabulary theme / Tâche / CEFR */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <MetaChip label="Grammar" value={detail.grammar_topic} tint={BUTTER} />
        {themeTitle && <MetaChip label="Theme" value={themeTitle} tint={LAVENDER} />}
        <MetaChip label="Tâche" value={TACHE_LABEL[detail.tache_application]} tint={SAGE} />
        <MetaChip label="CEFR" value={detail.cefr_level.toUpperCase()} tint={PEACH} />
      </div>
    </header>
  )
}

function StatusChip({ status }: { status: Status }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 26,
        padding: '0 10px',
        borderRadius: 100,
        backgroundColor: STATUS_BG[status],
        fontFamily: DISPLAY_FONT,
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: INK,
      }}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}

function DetectionChip({ result }: { result: Detection }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 26,
        padding: '0 10px',
        borderRadius: 100,
        backgroundColor: '#1A1A1A0C',
        fontFamily: DISPLAY_FONT,
        fontWeight: 600,
        fontSize: 11,
        color: INK_SOFT,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: DETECTION_DOT[result],
        }}
      />
      {DETECTION_LABEL[result]}
    </span>
  )
}

function MetaChip({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: 2,
        padding: '6px 10px',
        borderRadius: 10,
        backgroundColor: tint,
      }}
    >
      <span
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 9,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: INK_MUTED,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 13,
          color: INK,
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
    </span>
  )
}
