'use client'

// F-460 - La Seance: the linear Practice walk.
//
// Steps through one ile's 5 Practice activities (Ile.practice[] from the F-456
// journey model) one at a time: a stepper with progress (n of 5), previous /
// next, each activity rendered as a content-free shell (ActivityShell). After
// the 5 activities a completion screen returns to the carte; finishing marks
// the ile completed in localStorage (F-460 progress seam) so the loop visibly
// closes on the carte (the next ile becomes current). No BE.
//
// Phase 2 is LINEAR only: no adaptive sequencing, no resume endpoint, no
// scoring (all Phase 3). Rounded-only, v3 tokens only, no em-dashes.

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import {
  getJourney,
  THEMES,
  type Level,
  type Ile,
  type ThemeId,
} from '@/lib/journey/journey'
import { readTargetLevel } from '@/lib/journey/target-level'
import { readCompletedIles, markIleCompleted, isThemeId } from '@/lib/journey/progress'
import ActivityShell from '@/components/seance/ActivityShell'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

const THEME_LABELS: Record<ThemeId, string> = Object.fromEntries(
  THEMES.map((theme) => [theme.id, theme.label]),
) as Record<ThemeId, string>

const MAIN_STYLE = {
  maxWidth: 720,
  margin: '0 auto',
  padding: 'clamp(24px, 4vw, 48px) clamp(20px, 4vw, 40px) 64px',
  fontFamily: SANS_FONT,
} as const

const CARD_STYLE = {
  background: 'var(--paper-tint)',
  border: '1px solid var(--rule)',
  borderRadius: 'var(--r-lg)',
  padding: 'clamp(40px, 6vw, 72px) clamp(24px, 4vw, 48px)',
  textAlign: 'center' as const,
}

// Read the ?ile=<theme> launch param (client-only; avoids the useSearchParams
// Suspense requirement, matching the mounted-gate pattern below).
function readIleParam(): ThemeId | null {
  if (typeof window === 'undefined') return null
  const value = new URLSearchParams(window.location.search).get('ile')
  return isThemeId(value) ? value : null
}

function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="ed-btn-press"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--accent)',
        color: 'var(--paper)',
        borderRadius: 'var(--r-pill)',
        padding: '12px 24px',
        fontFamily: SANS_FONT,
        fontSize: 14,
        fontWeight: 600,
        textDecoration: 'none',
        letterSpacing: '0.01em',
        minHeight: 44,
      }}
    >
      {children}
    </Link>
  )
}

function EmptyState() {
  return (
    <main lang="fr" data-testid="seance-empty" style={MAIN_STYLE}>
      <div style={CARD_STYLE}>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-faint)', margin: '0 0 16px' }}>
          La seance
        </p>
        <h1 style={{ fontFamily: SERIF_FONT, fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 400, color: 'var(--ink)', margin: '0 0 12px', letterSpacing: '-0.01em' }}>
          Aucune ile a parcourir.
        </h1>
        <p style={{ fontFamily: SANS_FONT, fontSize: 14, color: 'var(--ink-soft)', margin: '0 0 28px' }}>
          Choisissez votre ile en cours sur la carte pour commencer une seance.
        </p>
        <PrimaryLink href="/carte">
          Aller a la carte
          <ArrowRight size={18} strokeWidth={2} />
        </PrimaryLink>
      </div>
    </main>
  )
}

function CompletionScreen({ label, onRedo }: { label: string; onRedo: () => void }) {
  return (
    <main lang="fr" data-testid="seance-complete" style={MAIN_STYLE}>
      <div style={CARD_STYLE}>
        <div
          aria-hidden="true"
          style={{
            width: 56,
            height: 56,
            margin: '0 auto 20px',
            borderRadius: 'var(--r-pill)',
            background: 'color-mix(in srgb, var(--success) 16%, var(--paper))',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Check size={28} strokeWidth={2.5} />
        </div>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-faint)', margin: '0 0 16px' }}>
          Seance terminee
        </p>
        <h1 style={{ fontFamily: SERIF_FONT, fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 400, color: 'var(--ink)', margin: '0 0 12px', letterSpacing: '-0.01em' }}>
          Bien joue.
        </h1>
        <p style={{ fontFamily: SANS_FONT, fontSize: 14, color: 'var(--ink-soft)', margin: '0 0 32px' }}>
          Vous avez parcouru les cinq activites de l&apos;ile {label}. Retrouvez votre progression sur la carte.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            data-testid="seance-redo"
            onClick={onRedo}
            className="ed-btn-press"
            style={{
              background: 'transparent',
              border: '1px solid var(--rule-strong)',
              borderRadius: 'var(--r-pill)',
              padding: '12px 24px',
              fontFamily: SANS_FONT,
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--ink-soft)',
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            Refaire la seance
          </button>
          <PrimaryLink href="/carte">
            Retour a la carte
            <ArrowRight size={18} strokeWidth={2} />
          </PrimaryLink>
        </div>
      </div>
    </main>
  )
}

export default function SeancePlayer() {
  const [mounted, setMounted] = useState(false)
  const [level, setLevel] = useState<Level>('B1')
  const [completed, setCompleted] = useState<ThemeId[]>([])
  const [theme, setTheme] = useState<ThemeId | null>(null)
  const [stepIdx, setStepIdx] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const resolvedLevel = readTargetLevel()
    const resolvedCompleted = readCompletedIles(resolvedLevel)
    const journey = getJourney(resolvedLevel, resolvedCompleted)
    // Launch target: the ?ile= param if valid, else the journey's current ile.
    const param = readIleParam()
    const current = journey.iles.find((ile) => ile.status === 'current')
    setLevel(resolvedLevel)
    setCompleted(resolvedCompleted)
    setTheme(param ?? current?.theme ?? null)
    setMounted(true)
  }, [])

  if (!mounted) return null

  const journey = getJourney(level, completed)
  const ile: Ile | undefined = theme
    ? journey.iles.find((candidate) => candidate.theme === theme)
    : undefined

  // Only current / completed iles are walkable (parity with the ile-page CTA
  // gating). Anything else (locked, bientot, unknown) shows the empty state.
  const walkable = ile && (ile.status === 'current' || ile.status === 'completed')
  if (!ile || !walkable) return <EmptyState />

  const label = THEME_LABELS[ile.theme]
  const activities = ile.practice
  const totalSteps = activities.length

  if (done) {
    return <CompletionScreen label={label} onRedo={() => { setStepIdx(0); setDone(false) }} />
  }

  const isLast = stepIdx === totalSteps - 1
  const isFirst = stepIdx === 0

  function handleNext() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (isLast) {
      markIleCompleted(level, ile!.theme)
      setCompleted((prev) => (prev.includes(ile!.theme) ? prev : [...prev, ile!.theme]))
      setDone(true)
    } else {
      setStepIdx((prev) => prev + 1)
    }
  }

  function handlePrev() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setStepIdx((prev) => Math.max(0, prev - 1))
  }

  return (
    <main lang="fr" data-testid="seance-player" style={MAIN_STYLE}>
      {/* Header: ile label + level + segmented progress + counter */}
      <div data-testid="seance-header" data-theme={ile.theme} data-level={ile.level} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          <h1 style={{ fontFamily: SERIF_FONT, fontSize: 'clamp(1.5rem, 2.6vw, 2.1rem)', fontWeight: 400, color: 'var(--ink)', margin: 0, letterSpacing: '-0.01em' }}>
            La Seance
          </h1>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)', borderRadius: 'var(--r-pill)', padding: '4px 12px', whiteSpace: 'nowrap' }}>
            {label}
          </span>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-faint)', background: 'var(--paper-edge)', borderRadius: 'var(--r-pill)', padding: '4px 12px' }}>
            Niveau {ile.level}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 'var(--r-pill)',
                background: i <= stepIdx ? 'var(--accent)' : 'var(--paper-edge)',
                transition: 'background 200ms var(--ease)',
              }}
            />
          ))}
          <span data-testid="seance-progress" style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.07em', color: 'var(--ink-faint)', marginLeft: 8, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {stepIdx + 1} sur {totalSteps}
          </span>
        </div>
      </div>

      {/* Current activity shell */}
      <ActivityShell activity={activities[stepIdx]} />

      {/* Footer: previous / next (or terminer on the last step) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 20 }}>
        <button
          type="button"
          data-testid="seance-prev"
          onClick={handlePrev}
          disabled={isFirst}
          className="ed-btn-press"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'transparent',
            border: '1px solid var(--rule-strong)',
            borderRadius: 'var(--r-pill)',
            padding: '12px 22px',
            fontFamily: SANS_FONT,
            fontSize: 14,
            fontWeight: 500,
            color: isFirst ? 'var(--ink-faint)' : 'var(--ink-soft)',
            cursor: isFirst ? 'not-allowed' : 'pointer',
            opacity: isFirst ? 0.5 : 1,
            minHeight: 44,
          }}
        >
          <ArrowLeft size={18} strokeWidth={2} />
          Precedent
        </button>

        <button
          type="button"
          data-testid="seance-next"
          onClick={handleNext}
          className="ed-btn-press"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--accent)',
            border: 'none',
            borderRadius: 'var(--r-pill)',
            padding: '12px 28px',
            fontFamily: SANS_FONT,
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--paper)',
            cursor: 'pointer',
            letterSpacing: '0.01em',
            minHeight: 44,
          }}
        >
          {isLast ? 'Terminer la seance' : 'Continuer'}
          {!isLast && <ArrowRight size={18} strokeWidth={2} />}
        </button>
      </div>
    </main>
  )
}
