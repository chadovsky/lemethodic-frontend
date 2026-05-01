'use client'

// P-100 Section 1 — Snapshot card.
//
// Three at-a-glance facts: current CEFR (latest recording per CEFR=Latest
// strategy locked in P-100), user's target level (from onboarding), and
// days until exam (countdown). Plain card, no chart. When the user has
// no exam_date set, the third cell becomes a Link to /profile mirroring
// HomeScreen's affordance.

import Link from 'next/link'
import { useAuthStore } from '@/lib/auth'
import { useInterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'
import type { RecordingSummary } from '@/lib/types'

const INK         = '#1A1A1A'
const INK_SOFT    = '#1A1A1AB3'
const INK_MUTED   = '#1A1A1A66'
const PAPER_SOLID = '#FFFFFF'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

interface Props {
  recordings: RecordingSummary[]
}

// Whole-day countdown to exam, clamped at 0. Local timezone so the
// number matches what the user sees on their device clock. Mirrors
// HomeScreen.tsx::daysUntilExam.
function daysUntilExam(isoDate: string | null | undefined): number | null {
  if (!isoDate) return null
  const exam = new Date(isoDate)
  if (Number.isNaN(exam.getTime())) return null
  exam.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round(
    (exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )
  return Math.max(0, diff)
}

export default function SnapshotCard({ recordings }: Props) {
  const lang = useInterfaceLanguage()
  const user = useAuthStore((s) => s.user)

  // CEFR=Latest: most recent recording's cefrLevel. Backend orders by
  // created_at DESC so recordings[0] is freshest.
  const latestCefr = recordings[0]?.cefrLevel ?? null
  const targetLevel = user?.targetLevel ?? null
  const examDays = daysUntilExam(user?.examDate ?? null)

  const labels =
    lang === 'fr'
      ? { eyebrow: 'Aperçu', current: 'Actuel', target: 'Objectif', exam: 'Examen', setExam: 'Définir →', placeholder: '—', daysSuffix: 'j' }
      : { eyebrow: 'Snapshot', current: 'Current', target: 'Target', exam: 'Exam', setExam: 'Set →', placeholder: '—', daysSuffix: 'd' }

  return (
    <section
      aria-label={labels.eyebrow}
      style={{
        backgroundColor: PAPER_SOLID,
        borderRadius: 20,
        padding: '20px 18px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        border: '1px solid #1A1A1A0A',
      }}
    >
      <p
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color: INK_MUTED,
          margin: '0 0 14px',
        }}
      >
        {labels.eyebrow}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 12,
        }}
      >
        <Cell label={labels.current} value={latestCefr ?? labels.placeholder} placeholder={!latestCefr} />
        <Cell label={labels.target} value={targetLevel ?? labels.placeholder} placeholder={!targetLevel} />
        {examDays !== null ? (
          <Cell label={labels.exam} value={`${examDays}${labels.daysSuffix}`} />
        ) : (
          <ExamCtaCell label={labels.exam} cta={labels.setExam} />
        )}
      </div>
    </section>
  )
}

// P-100.5 — when value is a placeholder (e.g. CEFR not yet computed),
// render in muted color so users can distinguish "—" from a real value.
function Cell({ label, value, placeholder = false }: { label: string; value: string; placeholder?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: '0.06em',
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
          fontSize: 22,
          color: placeholder ? INK_MUTED : INK,
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
    </div>
  )
}

function ExamCtaCell({ label, cta }: { label: string; cta: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: INK_MUTED,
        }}
      >
        {label}
      </span>
      <Link
        href="/profile"
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 14,
          color: INK_SOFT,
          textDecoration: 'none',
          WebkitTapHighlightColor: 'transparent',
          lineHeight: 1.1,
        }}
      >
        {cta}
      </Link>
    </div>
  )
}
