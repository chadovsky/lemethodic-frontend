'use client'

// P-230 — Snapshot section. The dashboard's anchor: where am I now?
//
// Two render paths:
//
// 1. **Diagnostic in progress** — when assigned is null OR
//    assigned.level === 'insufficient_data'. Replaces the snapshot card
//    with a tâche-coverage chip + next-recommended CTA. Honest about what's
//    measurable today.
//
// 2. **Full snapshot** — self-reported chip + assigned chip + agreement
//    copy + Confidence Visualizer (Block 8: 3-state meter, not %) +
//    coverage line + exam countdown.

import Link from 'next/link'
import type {
  AssignedBlock,
  DiagnosticStateResponse,
  LevelResponse,
  TacheCoverage,
} from '@/lib/types'

const INK = '#1A1A1A'
const INK_SOFT = '#1A1A1AB3'
const INK_MUTED = '#1A1A1A66'
const PAPER = '#FFFFFFCC'
const LAVENDER = '#E0D4F0'
const PEACH = '#FFD8C2'
const SAGE = '#D4E4D0'
const DISPLAY_FONT = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'

interface SnapshotSectionProps {
  level: LevelResponse | null
  diagnostic: DiagnosticStateResponse | null
  examDate: string | null
}

// ── Display helpers ─────────────────────────────────────────────────────────

const SELF_LEVEL_LABEL: Record<string, string> = {
  a2: 'A2',
  b1: 'B1',
  b2: 'B2',
  c1: 'C1',
  not_sure: 'Not sure',
}

const ASSIGNED_LEVEL_LABEL: Record<AssignedBlock['level'], string> = {
  below_B1: 'Below B1',
  B1_emerging: 'B1 emerging',
  B1_solid: 'B1 solid',
  above_B1: 'Above B1',
  insufficient_data: '—',
}

// Numeric ranks for self vs assigned comparison. Both scales mapped onto a
// shared float so we can detect "self > assigned" (overestimate) vs
// "self < assigned" (underestimate).
function selfRank(level: string | null): number | null {
  if (!level || level === 'not_sure') return null
  return { a2: 2, b1: 3, b2: 4, c1: 5 }[level] ?? null
}
function assignedRank(level: AssignedBlock['level']): number | null {
  if (level === 'insufficient_data') return null
  return {
    below_B1: 2.5,
    B1_emerging: 3.0,
    B1_solid: 3.5,
    above_B1: 4.5,
  }[level]
}

function daysUntilExam(iso: string | null): number | null {
  if (!iso) return null
  const exam = new Date(iso)
  if (Number.isNaN(exam.getTime())) return null
  exam.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

// ── Component ───────────────────────────────────────────────────────────────

export default function SnapshotSection({
  level,
  diagnostic,
  examDate,
}: SnapshotSectionProps) {
  // Both endpoints failed — render nothing rather than a confusing partial.
  if (level === null && diagnostic === null) return null

  const useDiagnosticInProgress =
    !level?.assigned || level.assigned.level === 'insufficient_data'

  return (
    <section aria-label="Snapshot">
      <SectionLabel>Snapshot</SectionLabel>
      {useDiagnosticInProgress ? (
        <DiagnosticInProgressCard diagnostic={diagnostic} examDate={examDate} />
      ) : (
        <FullSnapshotCard level={level!} examDate={examDate} />
      )}
    </section>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: DISPLAY_FONT,
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        color: INK_MUTED,
        margin: '0 0 12px',
      }}
    >
      {children}
    </p>
  )
}

// ── Diagnostic in progress card ─────────────────────────────────────────────

function DiagnosticInProgressCard({
  diagnostic,
  examDate,
}: {
  diagnostic: DiagnosticStateResponse | null
  examDate: string | null
}) {
  const examDays = daysUntilExam(examDate)
  const next = diagnostic?.next_recommended_tache ?? 1
  const cta = `/speaking/tache-${next}`
  return (
    <article
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
      <div>
        <h2
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 800,
            fontSize: 22,
            lineHeight: 1.2,
            color: INK,
            margin: '0 0 6px',
          }}
        >
          Diagnostic in progress
        </h2>
        <p
          style={{
            fontWeight: 500,
            fontSize: 14,
            lineHeight: 1.55,
            color: INK_SOFT,
            margin: 0,
          }}
        >
          We need 3 recordings to assess your level.
        </p>
      </div>

      {diagnostic && <TacheCoverageChip coverage={diagnostic.tache_coverage} />}

      {examDays !== null && <ExamCountdown days={examDays} />}

      <Link
        href={cta}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 44,
          padding: '0 18px',
          backgroundColor: INK,
          color: '#FFFFFF',
          borderRadius: 12,
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: '-0.01em',
          textDecoration: 'none',
          alignSelf: 'flex-start',
        }}
      >
        Record Tâche {next}
      </Link>
    </article>
  )
}

function TacheCoverageChip({ coverage }: { coverage: TacheCoverage }) {
  const items: Array<{ n: 1 | 2 | 3; done: boolean }> = [
    { n: 1, done: coverage.tache_1 },
    { n: 2, done: coverage.tache_2 },
    { n: 3, done: coverage.tache_3 },
  ]
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 10 }}
      aria-label="Tâche coverage"
    >
      {items.map(({ n, done }) => (
        <span
          key={n}
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: 12,
            color: done ? INK : INK_MUTED,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          Tâche {n} {done ? '✓' : '—'}
        </span>
      ))}
    </div>
  )
}

// ── Full snapshot card ──────────────────────────────────────────────────────

function FullSnapshotCard({
  level,
  examDate,
}: {
  level: LevelResponse
  examDate: string | null
}) {
  const assigned = level.assigned!
  const examDays = daysUntilExam(examDate)
  return (
    <article
      style={{
        backgroundColor: PAPER,
        borderRadius: 20,
        padding: '20px 22px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Level chips: self + assigned */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {level.self_reported.level && (
          <LevelChip
            label="You said"
            value={SELF_LEVEL_LABEL[level.self_reported.level] ?? level.self_reported.level.toUpperCase()}
            tint={LAVENDER}
          />
        )}
        <LevelChip
          label="We see"
          value={ASSIGNED_LEVEL_LABEL[assigned.level]}
          tint={SAGE}
        />
      </div>

      {/* Agreement copy */}
      <AgreementCopy level={level} />

      {/* Confidence visualizer (Block 8) — 3-state meter, not a percentage */}
      <ConfidenceMeter confidence={assigned.confidence} />

      {/* Coverage line — uses BE-supplied total_clusters_in_path directly */}
      <p
        style={{
          fontWeight: 500,
          fontSize: 13,
          lineHeight: 1.5,
          color: INK_MUTED,
          margin: 0,
        }}
      >
        {assigned.n_clusters_evaluated} of {assigned.total_clusters_in_path} areas evaluated.
      </p>

      {examDays !== null && <ExamCountdown days={examDays} />}
    </article>
  )
}

function LevelChip({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <div
      style={{
        backgroundColor: tint,
        borderRadius: 12,
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
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
          fontWeight: 800,
          fontSize: 16,
          color: INK,
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
    </div>
  )
}

function AgreementCopy({ level }: { level: LevelResponse }) {
  const self = level.self_reported.level
  const assigned = level.assigned
  const selfLabel = self ? SELF_LEVEL_LABEL[self] ?? self.toUpperCase() : null
  const assignedLabel = assigned ? ASSIGNED_LEVEL_LABEL[assigned.level] : null

  let copy: string | null = null
  switch (level.agreement) {
    case 'matches':
      copy = assignedLabel ? `${assignedLabel} confirmed.` : null
      break
    case 'discrepancy': {
      const sR = selfRank(self)
      const aR = assigned ? assignedRank(assigned.level) : null
      if (sR !== null && aR !== null && selfLabel && assignedLabel) {
        copy =
          sR > aR
            ? `You said ${selfLabel}; we see ${assignedLabel}. Let's close the gap.`
            : `You said ${selfLabel}; we see ${assignedLabel}. You're stronger than you thought.`
      }
      break
    }
    case 'assigned_only':
      copy = assignedLabel ? `Your assessment is ${assignedLabel}.` : null
      break
    case 'self_only':
      copy = selfLabel ? `Self-reported ${selfLabel}. Complete 3 recordings to verify.` : null
      break
    case 'neither':
      return null
  }

  if (!copy) return null
  return (
    <p
      style={{
        fontFamily: DISPLAY_FONT,
        fontWeight: 600,
        fontSize: 14,
        lineHeight: 1.55,
        color: INK,
        margin: 0,
      }}
    >
      {copy}
    </p>
  )
}

function ConfidenceMeter({ confidence }: { confidence: 'high' | 'medium' | 'low' }) {
  const filled = confidence === 'high' ? 3 : confidence === 'medium' ? 2 : 1
  const label =
    confidence === 'high'
      ? 'High confidence'
      : confidence === 'medium'
      ? 'Medium confidence'
      : 'Low confidence. Give us 2 more recordings'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        aria-label={label}
      >
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            aria-hidden="true"
            style={{
              width: 32,
              height: 6,
              borderRadius: 100,
              backgroundColor: i <= filled ? INK : '#1A1A1A14',
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 600,
          fontSize: 12,
          color: INK_MUTED,
        }}
      >
        {label}
      </span>
    </div>
  )
}

function ExamCountdown({ days }: { days: number }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignSelf: 'flex-start',
        alignItems: 'center',
        height: 28,
        padding: '0 12px',
        borderRadius: 100,
        backgroundColor: PEACH,
      }}
    >
      <span
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 12,
          color: INK,
        }}
      >
        TCF in {days} {days === 1 ? 'day' : 'days'}
      </span>
    </div>
  )
}
