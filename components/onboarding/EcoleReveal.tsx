'use client'

// F-201 — closing reveal screen migrated to the editorial system.
// Celebration weight comes from typography: the persona label is
// oversized (clamp 40-56px) in Source Serif 4 italic, --ed-accent navy.
// The plan summary card is --ed-paper on --ed-bg with 1px --ed-rule
// border. No confetti, no checkmarks, no green badges — the persona
// label + plan specifics carry the moment per F-201 design call.
//
// Persona note: POST /onboarding/submit is the source of truth for the
// authoritative persona, but submit requires authentication and EcoleReveal
// is shown pre-signup as the conversion screen. The persona derivation
// here is a deterministic preview based on q3 (exam date) — same inputs
// the BE uses. If BE logic changes, /ecole's post-signup surface holds
// the authoritative value.

import Image from 'next/image'
import type { OnboardingData, UiLanguage } from '@/lib/types'
import type { Persona } from '@/lib/onboarding-questions'
import {
  ECOLE_REVEAL_ILLUSTRATION,
  ECOLE_REVEAL_ILLUSTRATION_ALT_EN,
  ECOLE_REVEAL_ILLUSTRATION_ALT_FR,
} from './questionMeta'

// V-012b — EcoleReveal recoloured for the achievement / calm-pride moment.
// Section bg shifts to ed-warm-sage; persona label uses ed-warm-espresso
// for the warm-dark celebration accent (was ed-accent navy). Plan card
// stays ed-paper with 1px ed-rule (chrome preserved per V-012 spec).
const ED_BG = 'var(--ed-warm-sage)'
const ED_FG = 'var(--ed-fg)'
const ED_MUTED = 'var(--ed-muted)'
const ED_RULE = 'var(--ed-rule)'
const ED_PAPER = 'var(--ed-paper)'
const ED_ACCENT = 'var(--ed-warm-espresso)'
const SANS = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'
const SERIF = 'var(--font-fraunces), Georgia, "Times New Roman", serif'

interface EcoleRevealProps {
  data: OnboardingData
  language: UiLanguage
  onContinue: () => void
}

// ── Field formatters ────────────────────────────────────────────────────────

const LEVEL_LABELS: Record<string, { en: string; fr: string }> = {
  a2: { en: 'A2 · Basic', fr: 'A2 · Élémentaire' },
  b1: { en: 'B1 · Intermediate', fr: 'B1 · Intermédiaire' },
  b2: { en: 'B2 · Upper-intermediate', fr: 'B2 · Avancé' },
  c1: { en: 'C1 · Advanced', fr: 'C1 · Autonome' },
  c2: { en: 'C2 · Mastery', fr: 'C2 · Maîtrise' },
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

const PERSONA_DESCRIPTORS: Record<Persona, { en: string; fr: string }> = {
  foundation: {
    en: 'Plenty of time to build your French solidly.',
    fr: 'Suffisamment de temps pour construire solidement.',
  },
  acceleration: {
    en: 'A focused run — enough weeks to prepare well.',
    fr: 'Un sprint ciblé — suffisamment de semaines pour bien préparer.',
  },
  cram: {
    en: 'A tight timeline. Every session is targeted.',
    fr: 'Un calendrier serré. Chaque séance compte.',
  },
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
    cta: "Start your École",
    eyebrow: 'Your assessment',
  },
  fr: {
    plan: 'Votre plan',
    target: 'Objectif',
    exam: 'Examen',
    startingPoint: 'Point de départ',
    practice: 'Pratique',
    pace: 'Cadence',
    noExam: 'Aucun examen prévu',
    cta: 'Commencer votre École',
    eyebrow: 'Votre évaluation',
  },
} as const

const HEADLINE = {
  en: "Here's your plan.",
  fr: 'Voici votre plan.',
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

// Mirrors BE persona derivation. ≤6w cram, ≤26w acceleration, else
// (or no exam) foundation. q7 hours_per_week is NOT a persona input
// (BE uses it for capacity_warning only).
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
  const personaLabel = PERSONA_LABELS[persona][language]

  const planRows: Array<{ label: string; value: string }> = [
    { label: labels.target, value: levelDisplay(readString(data.q2_target_level), language) },
    { label: labels.exam, value: formatExamDate(data, language) },
    { label: labels.startingPoint, value: levelDisplay(readString(data.q1_current_level), language) },
    { label: labels.practice, value: hoursDisplay(readString(data.q7_hours_per_week), language) },
  ]

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center"
      style={{ backgroundColor: ED_BG }}
    >
      <div
        className="w-full flex flex-col flex-1 min-h-screen"
        style={{
          maxWidth: 720,
          padding: '0 clamp(24px, 4vw, 48px)',
        }}
      >
        {/* Top spacer for breathing room */}
        <div style={{ height: 'clamp(48px, 8vw, 96px)' }} />

        {/* Single hero illustration — placeholder until P-228 ships */}
        <div
          className="flex justify-center"
          style={{ marginBottom: 'clamp(32px, 5vw, 56px)' }}
        >
          <Image
            src={ECOLE_REVEAL_ILLUSTRATION}
            alt={
              language === 'fr'
                ? ECOLE_REVEAL_ILLUSTRATION_ALT_FR
                : ECOLE_REVEAL_ILLUSTRATION_ALT_EN
            }
            width={280}
            height={280}
            className="object-contain"
            priority
          />
        </div>

        {/* Eyebrow + persona label as the celebration moment */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 3vw, 40px)' }}>
          <p
            style={{
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 12,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: ED_MUTED,
              margin: 0,
              marginBottom: 12,
            }}
          >
            {labels.eyebrow}
          </p>
          {/* Persona label — oversized Source Serif italic in navy.
              This IS the celebration. */}
          <h1
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontStyle: 'italic',
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.015em',
              color: ED_ACCENT,
              margin: 0,
            }}
          >
            {personaLabel}
          </h1>
          <p
            style={{
              fontFamily: SANS,
              fontWeight: 400,
              fontSize: 15,
              color: ED_MUTED,
              margin: '12px 0 0',
              lineHeight: 1.5,
            }}
          >
            {PERSONA_DESCRIPTORS[persona][language]}
          </p>
        </div>

        {/* Headline — reinforces the moment */}
        <h2
          className="text-balance"
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 'clamp(28px, 3.5vw, 40px)',
            lineHeight: 1.15,
            letterSpacing: '-0.015em',
            color: ED_FG,
            margin: 0,
            marginBottom: 'clamp(24px, 3vw, 40px)',
            textAlign: 'center',
          }}
        >
          {HEADLINE[language]}
        </h2>

        {/* Plan summary card — paper on bg with 1px ed-rule, generous
            interior padding. The card's content IS the celebration. */}
        <article
          style={{
            backgroundColor: ED_PAPER,
            border: `1px solid ${ED_RULE}`,
            borderRadius: 4,
            padding: 'clamp(32px, 4vw, 56px)',
            marginBottom: 'clamp(32px, 4vw, 48px)',
          }}
        >
          <p
            style={{
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 12,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: ED_MUTED,
              margin: 0,
              marginBottom: 24,
            }}
          >
            {labels.plan}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {planRows.map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 16,
                  paddingBottom: 16,
                  borderBottom: `1px solid ${ED_RULE}`,
                }}
              >
                <span
                  style={{
                    fontFamily: SANS,
                    fontWeight: 400,
                    fontSize: 14,
                    color: ED_MUTED,
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontFamily: SANS,
                    fontWeight: 500,
                    fontSize: 16,
                    color: ED_FG,
                    textAlign: 'right',
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
            {/* Pace row — last, no border */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <span
                style={{
                  fontFamily: SANS,
                  fontWeight: 400,
                  fontSize: 14,
                  color: ED_MUTED,
                }}
              >
                {labels.pace}
              </span>
              <span
                style={{
                  fontFamily: SERIF,
                  fontStyle: 'italic',
                  fontWeight: 400,
                  fontSize: 18,
                  color: ED_ACCENT,
                  textAlign: 'right',
                }}
              >
                {personaLabel}
              </span>
            </div>
          </div>
        </article>

        {/* Spacer */}
        <div className="flex-1" style={{ minHeight: 'clamp(24px, 4vw, 48px)' }} />

        {/* CTA */}
        <div style={{ paddingBottom: 'calc(20px + var(--fp-safe-bottom))' }}>
          <button
            onClick={onContinue}
            className="w-full"
            style={{
              height: 56,
              backgroundColor: ED_ACCENT,
              color: '#FFFFFF',
              borderRadius: 4,
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: '0',
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {labels.cta}
          </button>
        </div>
      </div>
    </div>
  )
}
