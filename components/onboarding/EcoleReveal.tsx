'use client'

// P-220 — closing reveal screen for the onboarding questionnaire. Pulls the
// answers out of the store, formats them for display, and computes a
// persona preview client-side.
//
// Persona note: POST /onboarding/submit is the source of truth for the
// authoritative persona, but submit requires authentication and EcoleReveal
// is shown pre-signup as the conversion screen. The persona derivation
// here is a deterministic preview based on q3 (exam date) + q7 (hours per
// week) — the same inputs the BE uses. If BE logic changes, /ecole's
// post-signup surface holds the authoritative value.

import Image from 'next/image'
import {
  ProgressDots,
  CTAButton,
  INK,
  INK_SOFT,
  INK_MUTED,
  PAPER,
  DISPLAY_FONT,
} from './OnboardingScreen'
import type { OnboardingData, UiLanguage } from '@/lib/types'
import type { Persona } from '@/lib/onboarding-questions'
import { ECOLE_REVEAL_BG, ECOLE_REVEAL_ILLUSTRATION } from './questionMeta'

interface EcoleRevealProps {
  data: OnboardingData
  language: UiLanguage
  onContinue: () => void
}

// ── Field formatters ────────────────────────────────────────────────────────

const LEVEL_LABELS: Record<string, { en: string; fr: string }> = {
  a2: { en: 'A2 — Basic', fr: 'A2 — Élémentaire' },
  b1: { en: 'B1 — Intermediate', fr: 'B1 — Intermédiaire' },
  b2: { en: 'B2 — Upper-intermediate', fr: 'B2 — Avancé' },
  c1: { en: 'C1 — Advanced', fr: 'C1 — Autonome' },
  c2: { en: 'C2 — Mastery', fr: 'C2 — Maîtrise' },
  not_sure: { en: 'Not sure yet', fr: 'Je ne sais pas encore' },
}

const HOURS_LABELS: Record<string, { en: string; fr: string }> = {
  less_than_2: { en: 'Less than 2 hrs/week', fr: 'Moins de 2 h / semaine' },
  '2_to_5': { en: '2–5 hrs/week', fr: '2 à 5 h / semaine' },
  '5_to_10': { en: '5–10 hrs/week', fr: '5 à 10 h / semaine' },
  more_than_10: { en: 'More than 10 hrs/week', fr: 'Plus de 10 h / semaine' },
}

const PERSONA_LABELS: Record<Persona, { en: string; fr: string }> = {
  foundation: { en: 'On track', fr: 'Bonne trajectoire' },
  acceleration: { en: 'Accelerated', fr: 'Rythme soutenu' },
  cram: { en: 'Intensive', fr: 'Intensif' },
}

const SECTION_LABELS = {
  en: {
    plan: 'Your plan',
    target: 'Target',
    exam: 'Exam',
    startingPoint: 'Starting point',
    practice: 'Practice',
    pace: 'Pace',
    noExam: 'No exam scheduled',
    cta: 'Start my École',
  },
  fr: {
    plan: 'Votre plan',
    target: 'Objectif',
    exam: 'Examen',
    startingPoint: 'Point de départ',
    practice: 'Pratique',
    pace: 'Cadence',
    noExam: 'Aucun examen prévu',
    cta: 'Commencer mon École',
  },
} as const

const HEADLINE = {
  en: "Meet L'École.",
  fr: "Voici L'École.",
}
// F-223 — interim copy patch: replaces stale "shortcut/raccourci" framing
// while F-202 (full L'École intro rebuild with methodology demo) is authored.
// FR keeps vous-form to match the rest of the FR onboarding context;
// tu/vous audit + full-app sweep tracked as F-226.
const SUBHEAD = {
  en: "This is L'École. Targeted lessons on the grammar traps English speakers hit again and again. Finish it, and B2 unlocks.",
  fr: "Voici L'École. Des leçons ciblées sur les pièges grammaticaux que les anglophones ratent à répétition. Finissez-la, et B2 est débloqué.",
}
const VALUE_LINES = {
  en: [
    'Focused lessons — not an infinite syllabus',
    'Ordered by what English speakers get wrong — not generic French grammar',
    'Anchored to your TCF — every lesson explains why it matters for the exam',
  ],
  fr: [
    'Des leçons ciblées — pas un programme sans fin',
    'Organisé selon les erreurs typiques des anglophones — pas de la grammaire générique',
    'Ancré sur votre TCF — chaque leçon explique pourquoi elle compte pour l\'examen',
  ],
}

function readString(v: unknown): string | null {
  return typeof v === 'string' ? v : null
}

function formatExamDate(data: OnboardingData, language: UiLanguage): string {
  const raw = readString(data.q3_exam_date)
  if (!raw) return SECTION_LABELS[language].noExam
  const d = new Date(raw)
  if (isNaN(d.getTime())) return raw
  return d.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function levelDisplay(value: string | null, language: UiLanguage): string {
  if (!value) return '—'
  const entry = LEVEL_LABELS[value]
  return entry ? entry[language] : value.toUpperCase()
}

function hoursDisplay(value: string | null, language: UiLanguage): string {
  if (!value) return '—'
  const entry = HOURS_LABELS[value]
  return entry ? entry[language] : value
}

// ── Persona preview ─────────────────────────────────────────────────────────

// Mirrors BE persona derivation exactly. BE uses ONLY q3_exam_date:
//   ≤ 6 weeks                  → cram
//   6 weeks .. 6 months (~26w) → acceleration
//   > 6 months OR no exam      → foundation
// q7 hours_per_week is NOT a persona input — BE uses it for capacity_warning
// only. If this client-side preview ever diverges from the BE-returned
// persona, the user would see one label here and another inside /ecole; we
// keep the function tight so that doesn't happen.
function derivePersonaPreview(data: OnboardingData): Persona {
  const examDate = readString(data.q3_exam_date)
  if (!examDate) return 'foundation'

  const exam = new Date(examDate)
  if (isNaN(exam.getTime())) return 'foundation'
  const now = new Date()
  const msPerWeek = 1000 * 60 * 60 * 24 * 7
  const weeks = Math.max(0, Math.ceil((exam.getTime() - now.getTime()) / msPerWeek))

  if (weeks <= 6) return 'cram'
  if (weeks <= 26) return 'acceleration'
  return 'foundation'
}

// ── Component ───────────────────────────────────────────────────────────────

export default function EcoleReveal({ data, language, onContinue }: EcoleRevealProps) {
  const labels = SECTION_LABELS[language]
  const persona = derivePersonaPreview(data)

  const planRows: Array<{ label: string; value: string }> = [
    { label: labels.target, value: levelDisplay(readString(data.q2_target_level), language) },
    { label: labels.exam, value: formatExamDate(data, language) },
    { label: labels.startingPoint, value: levelDisplay(readString(data.q1_current_level), language) },
    { label: labels.practice, value: hoursDisplay(readString(data.q7_hours_per_week), language) },
    { label: labels.pace, value: PERSONA_LABELS[persona][language] },
  ]

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center"
      style={{ backgroundColor: ECOLE_REVEAL_BG }}
    >
      <div className="w-full max-w-[440px] flex flex-col flex-1 min-h-screen px-5">
        <div className="pt-4">
          <ProgressDots total={1} filledUpTo={1} current={1} />
        </div>

        <div className="flex justify-center mt-10">
          <Image
            src={ECOLE_REVEAL_ILLUSTRATION}
            alt={language === 'fr' ? "Illustration L'École" : "L'École illustration"}
            width={240}
            height={240}
            className="object-contain"
            style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.15))' }}
            priority
          />
        </div>

        <h1
          className="text-center mt-8 leading-tight text-balance"
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 800,
            fontSize: 36,
            lineHeight: '44px',
            color: INK,
          }}
        >
          {HEADLINE[language]}
        </h1>

        <p
          className="text-center mt-3 mx-auto text-pretty"
          style={{
            fontWeight: 600,
            fontSize: 18,
            lineHeight: '28px',
            color: INK_SOFT,
            maxWidth: 360,
          }}
        >
          {SUBHEAD[language]}
        </p>

        <div className="flex flex-col gap-3 mt-8 mx-auto" style={{ maxWidth: 320, width: '100%' }}>
          {VALUE_LINES[language].map((line, i) => (
            <div key={i} className="flex items-start gap-3">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
                style={{ marginTop: 3, flexShrink: 0 }}
              >
                <circle cx="9" cy="9" r="9" fill={INK} />
                <path
                  d="M5 9.2L7.8 12L13 6.5"
                  stroke="white"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{ fontWeight: 500, fontSize: 14, lineHeight: '22px', color: INK }}>
                {line}
              </span>
            </div>
          ))}
        </div>

        <div
          className="mt-8 mx-auto"
          style={{
            maxWidth: 360,
            width: '100%',
            backgroundColor: PAPER,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: 20,
            padding: '20px 24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          <p
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 14,
              color: INK_MUTED,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            {labels.plan}
          </p>
          <div className="flex flex-col gap-2">
            {planRows.map(({ label, value }) => (
              <div key={label} className="flex items-baseline gap-1">
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: INK_SOFT,
                    lineHeight: '20px',
                    minWidth: 110,
                  }}
                >
                  {label}:
                </span>
                <span
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 700,
                    fontSize: 14,
                    color: INK,
                    lineHeight: '20px',
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1" />

        <CTAButton label={labels.cta} enabled onClick={onContinue} />
      </div>
    </div>
  )
}
