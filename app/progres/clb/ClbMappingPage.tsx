'use client'

// F-337 — /progres/clb: CLB level per skill + Express Entry CRS points.
// Data source: api.recordings.list() for speaking CLB.
// Gap-to-target UI omitted: no targetClb field in onboarding profile (q0_*
// fields are exam-type selection only). Noted in F-337 report-back.

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/home/BottomNav'
import { api, ApiError } from '@/lib/api'
import type { RecordingSummary } from '@/lib/types'
import {
  clbToCrs,
  derivePageState,
  deriveSkills,
  SKILL_LABELS,
  type ClbPageState,
  type SkillRow,
} from './utils'

const INK = 'var(--lm-text-primary)'
const INK_MUTED = 'var(--lm-text-secondary)'
const INK_FAINT = 'var(--lm-text-tertiary)'
const BG = 'var(--lm-bg-base)'
const SURFACE = 'var(--lm-bg-surface)'
const BORDER = 'var(--lm-border-subtle)'
const SUCCESS = 'var(--lm-success)'
const SUCCESS_BG = 'var(--lm-success-25)'
const BRAND = 'var(--lm-brand)'
const BUTTER = 'var(--lm-pastel-butter)'
const ERROR_COLOR = 'var(--lm-error)'
const FONT = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'

interface PageData {
  recordings: RecordingSummary[]
}

export default function ClbMappingPage() {
  const [data, setData] = useState<PageData | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setFetchError(null)
    try {
      const recordings = await api.recordings.list({ limit: 20 }).catch(() => [] as RecordingSummary[])
      setData({ recordings })
    } catch (err) {
      setFetchError(err instanceof ApiError ? err.message : 'Une erreur inattendue est survenue.')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (!data && !fetchError) {
    return <LoadingState />
  }

  if (fetchError) {
    return <ErrorState message={fetchError} onRetry={load} />
  }

  const { recordings } = data!
  const latestClbRaw = recordings.find((r) => r.clbLevel !== null)?.clbLevel ?? null
  const skills = deriveSkills(latestClbRaw)
  const pageState: ClbPageState = derivePageState(skills, recordings.length > 0)

  if (pageState === 'empty') {
    return <EmptyState />
  }

  const totalCrs = skills.reduce((sum, s) => sum + (s.crs ?? 0), 0)

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: BG, fontFamily: FONT }}>
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '32px 16px 120px' }}>
        <header style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, color: INK_FAINT, margin: '0 0 6px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Progrès
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: INK, margin: '0 0 6px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Niveau CLB
          </h1>
          <p style={{ fontSize: 14, color: INK_MUTED, margin: 0 }}>
            Equivalence TCF Canada &rarr; Express Entry
          </p>
        </header>

        {pageState === 'partial' && (
          <div
            style={{
              marginBottom: 24,
              padding: '10px 14px',
              backgroundColor: BUTTER,
              borderRadius: 8,
              fontSize: 13,
              color: INK_MUTED,
              lineHeight: 1.5,
            }}
          >
            Seule l&apos;expression orale a été évaluée à ce stade. Les autres habiletés
            apparaitront après votre TCF Canada officiel.
          </div>
        )}

        <section style={{ marginBottom: 28 }}>
          <h2
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: INK_FAINT,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              margin: '0 0 12px',
            }}
          >
            Habiletés linguistiques
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {skills.map((skill) => (
              <SkillCard key={skill.key} skill={skill} />
            ))}
          </div>
        </section>

        <section
          style={{
            padding: '18px 20px',
            backgroundColor: SURFACE,
            borderRadius: 12,
            border: `1px solid ${BORDER}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: INK }}>
              Points linguistiques CRS
            </span>
            <span style={{ fontSize: 24, fontWeight: 700, color: BRAND, lineHeight: 1 }}>
              {totalCrs}
              <span style={{ fontSize: 13, fontWeight: 400, color: INK_FAINT }}> / 24</span>
            </span>
          </div>
          <p style={{ fontSize: 12, color: INK_FAINT, margin: 0, lineHeight: 1.5 }}>
            Table IRCC, demandeur principal, langue unique. Maximum 6 points par habileté.
          </p>
        </section>
      </main>
      <BottomNav />
    </div>
  )
}

function SkillCard({ skill }: { skill: SkillRow }) {
  const assessed = skill.clb !== null
  const label = SKILL_LABELS[skill.key]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        backgroundColor: SURFACE,
        borderRadius: 10,
        border: `1px solid ${assessed ? SUCCESS_BG : BORDER}`,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: assessed ? INK : INK_FAINT }}>
          {label.fr}
        </div>
        <div style={{ fontSize: 12, color: INK_FAINT, marginTop: 2 }}>
          {label.en}
        </div>
      </div>

      {assessed ? (
        <>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: INK_FAINT, marginBottom: 2 }}>CLB</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: INK, lineHeight: 1 }}>
              {skill.clb}
            </div>
          </div>
          <div style={{ width: 1, height: 28, backgroundColor: BORDER, flexShrink: 0 }} />
          <div style={{ textAlign: 'center', minWidth: 36 }}>
            <div style={{ fontSize: 11, color: INK_FAINT, marginBottom: 2 }}>CRS</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: SUCCESS, lineHeight: 1 }}>
              {skill.crs}
            </div>
          </div>
        </>
      ) : (
        <span style={{ fontSize: 12, color: INK_FAINT, fontStyle: 'italic' }}>
          Non encore évalué
        </span>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ minHeight: '100dvh', backgroundColor: BG, fontFamily: FONT }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100dvh - 64px)',
        }}
      >
        <span style={{ fontSize: 14, color: INK_FAINT }}>Chargement...</span>
      </div>
      <BottomNav />
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ minHeight: '100dvh', backgroundColor: BG, fontFamily: FONT }}>
      <main
        style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '80px 24px 120px',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, color: INK, margin: '0 0 12px', letterSpacing: '-0.01em' }}>
          Niveau CLB
        </h1>
        <p style={{ fontSize: 15, color: INK_MUTED, margin: '0 0 32px', lineHeight: 1.6 }}>
          Votre niveau CLB apparaitra ici après votre premier enregistrement dans L&apos;Examen.
        </p>
        <Link
          href="/l-examen/expression-orale"
          style={{
            display: 'inline-block',
            padding: '12px 28px',
            backgroundColor: BRAND,
            color: 'var(--lm-bg-base)',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Commencer L&apos;Examen
        </Link>
      </main>
      <BottomNav />
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{ minHeight: '100dvh', backgroundColor: BG, fontFamily: FONT }}>
      <main
        style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '80px 24px 120px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 15, color: ERROR_COLOR, margin: '0 0 20px' }}>{message}</p>
        <button
          onClick={onRetry}
          style={{
            padding: '10px 22px',
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            backgroundColor: 'transparent',
            fontSize: 14,
            color: INK,
            cursor: 'pointer',
          }}
        >
          Réessayer
        </button>
      </main>
      <BottomNav />
    </div>
  )
}
