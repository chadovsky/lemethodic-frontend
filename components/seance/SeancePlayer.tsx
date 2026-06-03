'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LECONS } from '@/content/methode/lecons'
import { SESSIONS } from '@/lib/seance/sessions'
import type { SeanceStep } from '@/lib/seance/sessions'
import Dialogue from '@/components/iles/molds/Dialogue'
import ActeDeParole from '@/components/iles/molds/ActeDeParole'
import Activite from '@/components/iles/molds/Activite'
import Tache from '@/components/iles/molds/Tache'

const LEVEL_LABELS: Record<string, string> = {
  a1_a2: 'A1–A2',
  a2_b1: 'A2–B1',
  b1: 'B1',
  b2_plus: 'B2+',
}

function MoldStep({ step }: { step: SeanceStep }) {
  if (step.type === 'dialogue') return <Dialogue {...step.props} />
  if (step.type === 'acte') return <ActeDeParole {...step.props} />
  if (step.type === 'activite') return <Activite {...step.props} />
  if (step.type === 'tache') return <Tache {...step.props} />
  return null
}

const MAIN_STYLE = {
  maxWidth: 820,
  margin: '0 auto',
  padding: 'clamp(32px, 5vw, 64px) clamp(20px, 4vw, 40px)',
} as const

const CARD_STYLE = {
  background: 'var(--paper-tint)',
  border: '1px solid var(--rule)',
  borderRadius: 'var(--r-lg)',
  padding: 'clamp(40px, 6vw, 72px) clamp(24px, 4vw, 48px)',
  textAlign: 'center' as const,
}

function EmptyState() {
  return (
    <main lang="fr" style={MAIN_STYLE}>
      <div style={CARD_STYLE}>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-faint)', margin: '0 0 16px' }}>
          Bientôt
        </p>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 400, color: 'var(--ink)', margin: '0 0 12px', letterSpacing: '-0.01em' }}>
          Commence ta première île.
        </h1>
        <p style={{ fontFamily: 'var(--f-ui)', fontSize: 14, color: 'var(--ink-soft)', margin: '0 0 28px' }}>
          Aucune île disponible pour ta séance. Rends-toi sur La Méthode pour démarrer une leçon.
        </p>
        <Link
          href="/la-methode"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--dominant)',
            color: 'var(--paper)',
            borderRadius: 'var(--r-md)',
            padding: '12px 28px',
            fontFamily: 'var(--f-ui)',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
            letterSpacing: '0.01em',
          }}
        >
          Aller à La Méthode
        </Link>
      </div>
    </main>
  )
}

function CompletionScreen({ displayTitle, onRedo }: { displayTitle: string; onRedo: () => void }) {
  return (
    <main lang="fr" style={MAIN_STYLE}>
      <div style={CARD_STYLE}>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-faint)', margin: '0 0 16px' }}>
          Séance terminée
        </p>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 400, color: 'var(--ink)', margin: '0 0 12px', letterSpacing: '-0.01em' }}>
          Bien joué.
        </h1>
        <p style={{ fontFamily: 'var(--f-ui)', fontSize: 14, color: 'var(--ink-soft)', margin: '0 0 32px' }}>
          Tu as complété la séance {displayTitle}. Reviens demain pour continuer.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={onRedo}
            style={{
              background: 'transparent',
              border: '1px solid var(--rule-strong)',
              borderRadius: 'var(--r-md)',
              padding: '12px 24px',
              fontFamily: 'var(--f-ui)',
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--ink-soft)',
              cursor: 'pointer',
              transition: 'border-color 150ms var(--ease), color 150ms var(--ease)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--ink)'
              e.currentTarget.style.borderColor = 'var(--ink-faint)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--ink-soft)'
              e.currentTarget.style.borderColor = 'var(--rule-strong)'
            }}
          >
            Refaire la séance
          </button>
          <Link
            href="/carte"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'var(--dominant)',
              color: 'var(--paper)',
              borderRadius: 'var(--r-md)',
              padding: '12px 24px',
              fontFamily: 'var(--f-ui)',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Tableau de bord
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function SeancePlayer() {
  const [mounted, setMounted] = useState(false)
  const [ile, setIle] = useState<string | null>(null)
  const [level, setLevel] = useState('b1')
  const [stepIdx, setStepIdx] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const storedLevel = localStorage.getItem('current_level') ?? 'b1'

    // Resolve current île: explicit override → first available île that has a session
    let activeIle: string | null = localStorage.getItem('current_ile')
    if (activeIle && !SESSIONS.some(s => s.ile === activeIle)) {
      activeIle = null
    }
    if (!activeIle) {
      const first = LECONS.find(
        l => l.status === 'available' && l.themeSlug && SESSIONS.some(s => s.ile === l.themeSlug),
      )
      activeIle = first?.themeSlug ?? null
    }

    setLevel(storedLevel)
    setIle(activeIle)
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Resolve session: exact match on (île, level), then same île any level
  const session = ile
    ? (SESSIONS.find(s => s.ile === ile && s.level === level) ?? SESSIONS.find(s => s.ile === ile) ?? null)
    : null

  if (!session) return <EmptyState />

  if (done) {
    return (
      <CompletionScreen
        displayTitle={session.displayTitle}
        onRedo={() => { setStepIdx(0); setDone(false) }}
      />
    )
  }

  const totalSteps = session.steps.length
  const currentStep = session.steps[stepIdx]
  const isLast = stepIdx === totalSteps - 1

  function handleContinuer() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (isLast) {
      // STREAK SEAM — persists completion timestamp; streak logic wires in F-407 (production scoring)
      localStorage.setItem(`seance_completed_${ile}_${level}`, new Date().toISOString())
      setDone(true)
    } else {
      setStepIdx(prev => prev + 1)
    }
  }

  return (
    <main lang="fr" style={MAIN_STYLE}>
      {/* Session header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 400, color: 'var(--ink)', margin: 0, letterSpacing: '-0.01em' }}>
              La Séance
            </h1>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dominant)', background: 'rgba(20, 33, 61, 0.07)', borderRadius: 'var(--r-pill)', padding: '4px 12px', whiteSpace: 'nowrap' }}>
              {session.displayTitle}
            </span>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-faint)', background: 'var(--paper-edge)', borderRadius: 'var(--r-pill)', padding: '4px 12px' }}>
              {LEVEL_LABELS[level] ?? level.toUpperCase()}
            </span>
          </div>

          {/* STREAK SEAM — F-407: stub placeholder.
              Real streak = production minutes (scoring not yet landed).
              Remove stub and wire to BE once F-407 ships. */}
          <span
            title="Série en cours — seam F-407"
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.07em',
              color: 'var(--ink-faint)',
              background: 'var(--paper-edge)',
              border: '1px solid var(--rule)',
              borderRadius: 'var(--r-pill)',
              padding: '5px 14px',
              cursor: 'default',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            -- jour(s)
          </span>
        </div>

        {/* Segmented progress bar + step counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: i <= stepIdx ? 'var(--dominant)' : 'var(--paper-edge)',
                transition: 'background 200ms var(--ease)',
              }}
            />
          ))}
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.07em', color: 'var(--ink-faint)', marginLeft: 8, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {stepIdx + 1} / {totalSteps}
          </span>
        </div>
      </div>

      {/* Current mold — reuses existing mold components unchanged */}
      <MoldStep step={currentStep} />

      {/* Footer CTA */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, paddingBottom: 48 }}>
        <button
          onClick={handleContinuer}
          style={{
            background: 'var(--dominant)',
            border: 'none',
            borderRadius: 'var(--r-md)',
            padding: '14px 36px',
            fontFamily: 'var(--f-ui)',
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--paper)',
            cursor: 'pointer',
            letterSpacing: '0.01em',
            transition: 'opacity 150ms var(--ease)',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          {isLast ? 'Terminer la séance' : 'Continuer'}
        </button>
      </div>
    </main>
  )
}
