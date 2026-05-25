'use client'

// F-327 — Inserted between q11 and submit for users who selected
// 'another_exam' at q0. Presents two CTAs that determine accept_fallback
// before the onboarding submit is fired:
//
//   Primary:   "Start with La Méthode" → accept_fallback=true
//   Secondary: "Just add me to the waitlist" → accept_fallback=false
//
// After submission, OnboardingFlow branches on the response:
//   path_slug='b1_to_b2' + waitlist=true → Case A (proxy-enrolled, route to /ecole)
//   waitlist=true + path_slug=null + accept_fallback=true  → Case C (no fallback, level mismatch)
//   waitlist=true + path_slug=null + accept_fallback=false → Case B (waitlist-only, user declined)

import type { UiLanguage } from '@/lib/types'

const SANS = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'
const SERIF = 'var(--font-source-serif), Georgia, "Times New Roman", serif'
const ED_FG = 'var(--lm-text-primary)'
const ED_MUTED = 'var(--lm-text-tertiary)'
const ED_RULE = 'var(--lm-border-subtle)'
const ED_ACCENT = 'var(--cta-primary)'

const COPY = {
  en: {
    heading: "Your exam isn't supported yet.",
    subhead: (examName: string) =>
      `We're still building direct prep for ${examName}. While you wait, you can preview La Méthode — the path that builds the core skills shared across most B2-level exams.`,
    body: "Argument structure. Idea construction. Exam-style fluency. When your exam launches, we'll migrate your progress.",
    primaryCta: 'Start with La Méthode',
    secondaryCta: 'Just add me to the waitlist',
  },
  fr: {
    heading: "Votre examen n'est pas encore disponible.",
    subhead: (examName: string) =>
      `Nous construisons encore la préparation directe pour ${examName}. En attendant, vous pouvez prévisualiser La Méthode — le parcours qui développe les compétences de base communes à la plupart des examens de niveau B2.`,
    body: "Structure de l'argumentation. Construction des idées. Fluidité en conditions d'examen. Quand votre examen sera disponible, nous migrerons vos progrès.",
    primaryCta: 'Commencer avec La Méthode',
    secondaryCta: "M'inscrire sur la liste d'attente",
  },
} as const

interface WaitlistOrProxyConfirmationProps {
  specificIntendedExam: string | null
  language: UiLanguage
  isSubmitting: boolean
  bg?: string
  onAccept: () => void
  onDecline: () => void
}

export default function WaitlistOrProxyConfirmation({
  specificIntendedExam,
  language,
  isSubmitting,
  bg,
  onAccept,
  onDecline,
}: WaitlistOrProxyConfirmationProps) {
  const copy = COPY[language] ?? COPY.en
  const examLabel = specificIntendedExam || (language === 'fr' ? 'votre examen' : 'your exam')

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center ed-page-enter"
      style={{ backgroundColor: bg ?? 'var(--lm-warm-peach-deep)' }}
    >
      <div
        className="w-full flex flex-col flex-1 min-h-screen"
        style={{
          maxWidth: 720,
          padding: '0 clamp(24px, 4vw, 48px)',
        }}
      >
        <div style={{ height: 'clamp(56px, 9vw, 96px)' }} />

        {/* Heading block */}
        <div style={{ marginBottom: 'clamp(28px, 4vw, 48px)' }}>
          <h1
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontStyle: 'italic',
              fontSize: 'clamp(2rem, 4.5vw, 3rem)',
              lineHeight: 1.15,
              letterSpacing: '-0.015em',
              color: ED_FG,
              margin: 0,
              marginBottom: 'clamp(16px, 2vw, 24px)',
            }}
          >
            {copy.heading}
          </h1>
          <p
            style={{
              fontFamily: SANS,
              fontWeight: 400,
              fontSize: 'clamp(15px, 1.6vw, 17px)',
              lineHeight: 1.6,
              color: ED_MUTED,
              margin: 0,
              marginBottom: 16,
            }}
          >
            {copy.subhead(examLabel)}
          </p>
          <p
            style={{
              fontFamily: SANS,
              fontWeight: 400,
              fontSize: 14,
              lineHeight: 1.6,
              color: ED_MUTED,
              margin: 0,
            }}
          >
            {copy.body}
          </p>
        </div>

        <div className="flex-1" />

        {/* CTA stack */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            paddingBottom: 'calc(32px + var(--lm-safe-bottom, 0px))',
          }}
        >
          {/* Primary: accept the La Méthode proxy offer */}
          <button
            type="button"
            onClick={onAccept}
            disabled={isSubmitting}
            style={{
              height: 56,
              width: '100%',
              backgroundColor: ED_ACCENT,
              color: '#FFFFFF',
              borderRadius: 4,
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 16,
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1,
              outline: 'none',
              transition: 'opacity 150ms',
            }}
          >
            {isSubmitting ? '…' : copy.primaryCta}
          </button>

          {/* Secondary: waitlist-only */}
          <button
            type="button"
            onClick={onDecline}
            disabled={isSubmitting}
            style={{
              height: 48,
              width: '100%',
              backgroundColor: 'transparent',
              color: ED_FG,
              borderRadius: 4,
              fontFamily: SANS,
              fontWeight: 500,
              fontSize: 15,
              border: `1px solid ${ED_RULE}`,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.4 : 1,
              outline: 'none',
              transition: 'opacity 150ms',
            }}
          >
            {copy.secondaryCta}
          </button>
        </div>
      </div>
    </div>
  )
}
