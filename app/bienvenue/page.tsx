'use client'

// F-365: /bienvenue - post-signup Target Profile capture.
// F-459: Le Diagnostic (Phase 2) adds a deliberate starting-level step (step 4)
// that writes an explicit `level` (A1..C1) onto the profile. That level is the
// field target-level.ts reads first, so the carte renders the assigned map.
// This is the deliberate level assignment; the adaptive grammar-surfacing
// diagnostic is Phase 3 (BE target_profiles), explicitly deferred.
// Persists to localStorage only. BE follow-up required: persist target_profiles
// server-side. The localStorage key "lm.targetProfile.v1" is the handoff
// contract between this FE stub and the future BE endpoint.
// Unauthenticated redirect: ProtectedRoute -> /inscription.
// Submit redirect: /carte (Atlas hub) with the assigned level applied.

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import {
  OnboardingScreen,
  OnboardingCard,
  CheckIcon,
} from '@/components/onboarding/OnboardingScreen'
import { SANS_FONT } from '@/lib/typography'
import type { Level } from '@/lib/journey/journey'
import { TARGET_PROFILE_KEY } from '@/lib/journey/target-level'

// ── Types ──────────────────────────────────────────────────────────────────────

type Exam = 'TCF' | 'TEF' | 'DALF' | 'DELF' | 'GENERAL'
type Persona = 'VISA_URGENT' | 'CAREER' | 'CERTIFICATION' | 'PLATEAU' | 'FOUNDATION'

interface TargetProfile {
  exam: Exam
  threshold: string
  deadline: string | null
  persona: Persona
  // F-459: deliberate level assignment. The carte renders this level's map.
  level: Level
  capturedAt: string
}

// ── Data ───────────────────────────────────────────────────────────────────────

const EXAMS: { id: Exam; label: string; bientot?: boolean }[] = [
  { id: 'TCF',     label: 'TCF' },
  { id: 'TEF',     label: 'TEF',                    bientot: true },
  { id: 'DALF',    label: 'DALF',                   bientot: true },
  { id: 'DELF',    label: 'DELF',                   bientot: true },
  { id: 'GENERAL', label: 'Général (sans examen ciblé)' },
]

const THRESHOLDS: Record<Exam, string[]> = {
  TCF:     ['B1 (CLB 4-6)', 'B2 (CLB 7-8)', 'C1 (CLB 9-10)'],
  TEF:     ['B1', 'B2', 'C1'],
  DALF:    ['C1', 'C2'],
  DELF:    ['A1', 'A2', 'B1', 'B2'],
  GENERAL: ["Pas d'examen, je veux progresser"],
}

const PERSONAS: { id: Persona; label: string; description: string }[] = [
  {
    id: 'VISA_URGENT',
    label: 'Visa ou résidence permanente',
    description:
      "Je prépare un examen pour une demande de résidence permanente ou un visa d'immigration.",
  },
  {
    id: 'CAREER',
    label: 'Avancement professionnel',
    description:
      'Je vise une promotion, une exigence de bilinguisme fédéral ou un contexte de travail en français.',
  },
  {
    id: 'CERTIFICATION',
    label: 'Validation académique',
    description:
      'Je cherche une certification académique ou professionnelle à niveau avancé (DALF C1 ou C2).',
  },
  {
    id: 'PLATEAU',
    label: 'Plateau à surmonter',
    description:
      "Mon français stagne depuis des années. Je comprends bien mais je produis difficilement.",
  },
  {
    id: 'FOUNDATION',
    label: 'Parcours structuré depuis A2',
    description:
      "Je débute à A2 et veux un chemin clair vers B2 et au-delà, sans urgence d'examen.",
  },
]

// F-459: deliberate starting-level options. CEFR band names only (standard,
// not authored content). B1 is the seeded default (the only level with an
// authored journey); the learner confirms or adjusts.
const LEVELS: { id: Level; label: string; hint: string }[] = [
  { id: 'A1', label: 'A1', hint: 'Débutant' },
  { id: 'A2', label: 'A2', hint: 'Élémentaire' },
  { id: 'B1', label: 'B1', hint: 'Intermédiaire' },
  { id: 'B2', label: 'B2', hint: 'Intermédiaire avancé' },
  { id: 'C1', label: 'C1', hint: 'Avancé' },
]

const DEFAULT_LEVEL: Level = 'B1'

// ── UI helpers ─────────────────────────────────────────────────────────────────

function BientotChip() {
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: SANS_FONT,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        background: 'var(--bg-subtle)',
        borderRadius: 2,
        padding: '2px 6px',
        lineHeight: 1.4,
        flexShrink: 0,
      }}
    >
      Bientôt
    </span>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontFamily: SANS_FONT,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        margin: 0,
      }}
    >
      {children}
    </p>
  )
}

// ── Form ───────────────────────────────────────────────────────────────────────

export function BienvenueForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [exam, setExam] = useState<Exam | null>(null)
  const [threshold, setThreshold] = useState<string | null>(null)
  const [noDeadline, setNoDeadline] = useState(true)
  const [deadline, setDeadline] = useState('')
  const [persona, setPersona] = useState<Persona | null>(null)
  // F-459: seeded to the only authored level; confirm-and-adjust.
  const [level, setLevel] = useState<Level>(DEFAULT_LEVEL)

  function selectExam(id: Exam) {
    setExam(id)
    setThreshold(null)
  }

  function next() {
    if (step < 4) {
      setStep(step + 1)
    } else {
      submit()
    }
  }

  function submit() {
    if (!exam || !threshold || !persona) return
    const profile: TargetProfile = {
      exam,
      threshold,
      deadline: noDeadline ? null : deadline || null,
      persona,
      level,
      capturedAt: new Date().toISOString(),
    }
    // FE-only stub. BE follow-up (F-366): persist to target_profiles
    // server-side (new table or user.target_profile column).
    localStorage.setItem(TARGET_PROFILE_KEY, JSON.stringify(profile))
    // F-459: land on the carte with the assigned level applied (diagnostic ->
    // carte chain). target-level.ts reads profile.level, so the map matches.
    router.push('/carte')
  }

  // ── Step 1: Q1 exam ──────────────────────────────────────────────────────────

  if (step === 1) {
    return (
      <OnboardingScreen
        progressTotal={4}
        progressFilledUpTo={1}
        progressCurrent={1}
        headline="Bienvenue"
        descriptor="Ces quelques questions adaptent votre parcours à votre objectif. Quel examen préparez-vous?"
        ctaLabel="Continuer"
        ctaEnabled={exam !== null}
        ctaHint="Sélectionnez un examen pour continuer."
        onContinue={next}
      >
        {EXAMS.map((e) => (
          <OnboardingCard
            key={e.id}
            isSelected={exam === e.id}
            onClick={() => selectExam(e.id)}
          >
            <span style={{ fontFamily: SANS_FONT, fontWeight: 500, fontSize: 16 }}>
              {e.label}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              {e.bientot && <BientotChip />}
              <CheckIcon visible={exam === e.id} />
            </div>
          </OnboardingCard>
        ))}
        {exam && exam !== 'TCF' && exam !== 'GENERAL' && (
          <p
            style={{
              fontFamily: SANS_FONT,
              fontSize: 13,
              color: 'var(--text-muted)',
              margin: '4px 0 0',
              lineHeight: 1.5,
            }}
          >
            Cet examen arrive bientôt. Votre profil sera activé dès qu'il sera disponible.
          </p>
        )}
      </OnboardingScreen>
    )
  }

  // ── Step 2: Q2 threshold (adapts to Q1) ─────────────────────────────────────

  if (step === 2) {
    const options = exam ? THRESHOLDS[exam] : []
    const examLabel = EXAMS.find((e) => e.id === exam)?.label ?? ''
    const descriptor =
      exam === 'GENERAL'
        ? 'Confirmez votre objectif de progression.'
        : `Quel est votre niveau cible pour le ${examLabel}?`

    return (
      <OnboardingScreen
        progressTotal={4}
        progressFilledUpTo={2}
        progressCurrent={2}
        headline="Quel niveau visez-vous?"
        descriptor={descriptor}
        ctaLabel="Continuer"
        ctaEnabled={threshold !== null}
        ctaHint="Sélectionnez un niveau pour continuer."
        onContinue={next}
        onBack={() => setStep(1)}
      >
        {options.map((opt) => (
          <OnboardingCard
            key={opt}
            isSelected={threshold === opt}
            onClick={() => setThreshold(opt)}
          >
            <span style={{ fontFamily: SANS_FONT, fontWeight: 500, fontSize: 16 }}>
              {opt}
            </span>
            <CheckIcon visible={threshold === opt} />
          </OnboardingCard>
        ))}
      </OnboardingScreen>
    )
  }

  // ── Step 3: Q3 deadline + Q4 persona ────────────────────────────────────────

  const today = new Date()
  const minMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

  if (step === 3) {
    return (
    <OnboardingScreen
      progressTotal={4}
      progressFilledUpTo={3}
      progressCurrent={3}
      headline="Votre situation"
      descriptor="Deux questions pour finaliser votre profil."
      ctaLabel="Continuer"
      ctaEnabled={persona !== null}
      ctaHint="Sélectionnez votre situation pour continuer."
      onContinue={next}
      onBack={() => setStep(2)}
    >
      {/* Q3: when is the exam? */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <SectionLabel>Quand passez-vous l'examen?</SectionLabel>
        <OnboardingCard isSelected={noDeadline} onClick={() => setNoDeadline(true)}>
          <span style={{ fontFamily: SANS_FONT, fontWeight: 500, fontSize: 16 }}>
            Pas encore décidé
          </span>
          <CheckIcon visible={noDeadline} />
        </OnboardingCard>
        <OnboardingCard isSelected={!noDeadline} onClick={() => setNoDeadline(false)}>
          <span style={{ fontFamily: SANS_FONT, fontWeight: 500, fontSize: 16 }}>
            Je connais ma date
          </span>
          <CheckIcon visible={!noDeadline} />
        </OnboardingCard>
        {!noDeadline && (
          <input
            type="month"
            value={deadline}
            min={minMonth}
            onChange={(e) => setDeadline(e.target.value)}
            className="ed-field"
            style={{
              fontFamily: SANS_FONT,
              fontSize: 15,
              color: 'var(--text-primary)',
              background: 'var(--bg-elevated)',
              borderRadius: 4,
              padding: '10px 14px',
              width: '100%',
              boxSizing: 'border-box',
              border: '1px solid var(--rule-default)',
            }}
          />
        )}
      </div>

      {/* Q4: persona */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
        <SectionLabel>Quelle est votre situation?</SectionLabel>
        {PERSONAS.map((p) => (
          <OnboardingCard
            key={p.id}
            isSelected={persona === p.id}
            onClick={() => setPersona(p.id)}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontFamily: SANS_FONT, fontWeight: 600, fontSize: 15 }}>
                {p.label}
              </span>
              <span
                style={{
                  fontFamily: SANS_FONT,
                  fontSize: 13,
                  lineHeight: 1.45,
                  opacity: 0.72,
                }}
              >
                {p.description}
              </span>
            </div>
            <CheckIcon visible={persona === p.id} />
          </OnboardingCard>
        ))}
      </div>
    </OnboardingScreen>
    )
  }

  // ── Step 4: Le Diagnostic - deliberate starting-level assignment (F-459) ─────
  // Confirm-and-adjust. Seeded to B1 (the authored level); the learner accepts
  // or changes it. The chosen level is written to the profile and drives the
  // carte (target-level.ts reads profile.level). No question bank, no scoring.

  return (
    <OnboardingScreen
      progressTotal={4}
      progressFilledUpTo={4}
      progressCurrent={4}
      headline="Votre niveau de départ"
      descriptor="Ce niveau personnalise votre carte. Confirmez-le ou ajustez-le."
      ctaLabel="Commencer mon parcours"
      ctaEnabled={true}
      onContinue={next}
      onBack={() => setStep(3)}
    >
      <div
        data-testid="bienvenue-level-step"
        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        {LEVELS.map((lvl) => (
          <OnboardingCard
            key={lvl.id}
            isSelected={level === lvl.id}
            onClick={() => setLevel(lvl.id)}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span
                data-testid={`bienvenue-level-${lvl.id}`}
                style={{ fontFamily: SANS_FONT, fontWeight: 600, fontSize: 16 }}
              >
                {lvl.label}
              </span>
              <span
                style={{
                  fontFamily: SANS_FONT,
                  fontSize: 13,
                  opacity: 0.72,
                }}
              >
                {lvl.hint}
              </span>
            </div>
            <CheckIcon visible={level === lvl.id} />
          </OnboardingCard>
        ))}
      </div>
    </OnboardingScreen>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function BienvenuePage() {
  return (
    <ProtectedRoute redirectTo="/inscription">
      <BienvenueForm />
    </ProtectedRoute>
  )
}
