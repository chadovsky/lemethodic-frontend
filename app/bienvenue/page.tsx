'use client'

// F-365: /bienvenue - post-signup Target Profile capture.
// All four questions across three steps. Persists to localStorage only.
// BE follow-up required: persist target_profiles server-side (new table or
// column on users). The localStorage key "lm.targetProfile.v1" is the
// handoff contract between this FE stub and the future BE endpoint.
// Unauthenticated redirect: ProtectedRoute -> / (onboarding/signup).
// /inscription not yet a live route; this will align when F-inscription ships.
// Submit redirect: /carte (Atlas hub). /maitre/diagnostic does not exist as a
// live route; /carte is the correct target per PRODUCT.md Section 7.

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import {
  OnboardingScreen,
  OnboardingCard,
  CheckIcon,
} from '@/components/onboarding/OnboardingScreen'
import { SANS_FONT } from '@/lib/typography'

// ── Types ──────────────────────────────────────────────────────────────────────

type Exam = 'TCF' | 'TEF' | 'DALF' | 'DELF' | 'GENERAL'
type Persona = 'VISA_URGENT' | 'CAREER' | 'CERTIFICATION' | 'PLATEAU' | 'FOUNDATION'

interface TargetProfile {
  exam: Exam
  threshold: string
  deadline: string | null
  persona: Persona
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

function BienvenueForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [exam, setExam] = useState<Exam | null>(null)
  const [threshold, setThreshold] = useState<string | null>(null)
  const [noDeadline, setNoDeadline] = useState(true)
  const [deadline, setDeadline] = useState('')
  const [persona, setPersona] = useState<Persona | null>(null)

  function selectExam(id: Exam) {
    setExam(id)
    setThreshold(null)
  }

  function next() {
    if (step < 3) {
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
      capturedAt: new Date().toISOString(),
    }
    // FE-only stub. BE follow-up (F-366): persist to target_profiles
    // server-side (new table or user.target_profile column).
    localStorage.setItem('lm.targetProfile.v1', JSON.stringify(profile))
    router.push('/carte')
  }

  // ── Step 1: Q1 exam ──────────────────────────────────────────────────────────

  if (step === 1) {
    return (
      <OnboardingScreen
        progressTotal={3}
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
        progressTotal={3}
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

  return (
    <OnboardingScreen
      progressTotal={3}
      progressFilledUpTo={3}
      progressCurrent={3}
      headline="Votre situation"
      descriptor="Deux dernières questions pour finaliser votre profil."
      ctaLabel="Commencer mon parcours"
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

// ── Page ───────────────────────────────────────────────────────────────────────

export default function BienvenuePage() {
  return (
    <ProtectedRoute>
      <BienvenueForm />
    </ProtectedRoute>
  )
}
