'use client'

// V-015d — desktop ≥md bento dashboard. Asymmetric tile grid in the
// Apple iCloud restraint register: ed-paper tiles, 1px ed-rule, 4px
// radius, no aggressive shadows. Six tiles:
//
//   - Radar (large, 2×2): 5-couche Recharts polar from latest recording
//   - Today's Focus (medium, 2×1): TodayActionResponse → CTA
//   - Bottleneck (small, 1×1): lowest-scoring scored couche
//   - Streak (small, 1×1): placeholder until streak BE field lands
//   - Per-couche row (4 cols wide): 5 small scored tiles incl. Voix
//     unscored placeholder per V-009
//   - Recent activity (4 cols wide): RecordingSummary list
//
// Bento collapses at <lg to a 2-column variant; mobile <md uses the
// existing ProgressDashboard stacked layout (gated via fp-mobile-only /
// fp-desktop-only in globals.css). Skip score-trend tile per Chadi
// pick — V-015d.trend filed for BE endpoint.

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import { api, ApiError } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import { useInterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'
import { BRAND_LABEL, COUCHE_ORDER } from '@/lib/coucheBrandLabels'
import type {
  Couche,
  CoucheKey,
  DiagnosticStateResponse,
  LevelResponse,
  RecordingSummary,
  TodayActionResponse,
} from '@/lib/types'

const ED_BG = 'var(--ed-bg)'
const ED_FG = 'var(--ed-fg)'
const ED_FG_SOFT = 'var(--ed-fg-soft)'
const ED_MUTED = 'var(--ed-muted)'
const ED_RULE = 'var(--ed-rule)'
const ED_PAPER = 'var(--ed-paper)'
const SANS = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'
const SERIF = 'var(--font-fraunces), Georgia, serif'

const COPY = {
  en: {
    title: 'Progress',
    subtitle: 'Where you stand today.',
    radarLabel: 'La Méthode en Couches',
    radarEmpty: 'Record on /speaking to populate your diagnostic.',
    todayLabel: "Today's focus",
    todayEmpty: 'Open a lesson to see today recommendations.',
    todayCta: 'Open lesson',
    bottleneckLabel: 'Your bottleneck',
    bottleneckEmpty: 'Bottleneck appears after your first recording.',
    streakLabel: 'Streak',
    streakComingSoon: 'Coming soon.',
    perCoucheLabel: 'Per-couche detail',
    voixComingSoon: 'Coming soon',
    recentLabel: 'Recent activity',
    recentEmpty: 'No activity yet.',
    loadError: "Couldn't load your dashboard.",
    retry: 'Retry',
  },
  fr: {
    title: 'Progrès',
    subtitle: 'Où vous en êtes aujourd’hui.',
    radarLabel: 'La Méthode en Couches',
    radarEmpty: 'Enregistrez sur /speaking pour alimenter votre diagnostic.',
    todayLabel: 'Focus du jour',
    todayEmpty: 'Ouvrez une leçon pour voir les recommandations du jour.',
    todayCta: 'Ouvrir la leçon',
    bottleneckLabel: 'Votre goulet',
    bottleneckEmpty: 'Le goulet apparaît après votre premier enregistrement.',
    streakLabel: 'Série',
    streakComingSoon: 'Bientôt.',
    perCoucheLabel: 'Détail par couche',
    voixComingSoon: 'Bientôt',
    recentLabel: 'Activité récente',
    recentEmpty: 'Aucune activité pour le moment.',
    loadError: 'Impossible de charger le tableau de bord.',
    retry: 'Réessayer',
  },
} as const

interface DashboardData {
  level: LevelResponse | null
  diagnostic: DiagnosticStateResponse | null
  today: TodayActionResponse | null
  recordings: RecordingSummary[] | null
}

// Coerce raw BE score (0-10 scale typically) to 0-100 percent.
function toPercent(rawScore: number): number {
  if (!Number.isFinite(rawScore)) return 0
  if (rawScore <= 10) return Math.round(rawScore * 10)
  return Math.round(rawScore)
}

export default function ProgressDashboardDesktop() {
  const language = useInterfaceLanguage()
  const copy = COPY[language]
  const examDate = useAuthStore((s) => s.user?.examDate ?? null)
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  const load = useCallback(async () => {
    setError(null)
    try {
      const [level, diagnostic, today, recordings] = await Promise.all([
        api.users.getLevel().catch(() => null),
        api.diagnostic.getState().catch(() => null),
        api.users.getToday().catch(() => null),
        api.recordings.list({ limit: 8 }).catch(() => null),
      ])
      setData({ level, diagnostic, today, recordings })
    } catch (err) {
      if (err instanceof ApiError) setError(copy.loadError)
      else setError(copy.loadError)
    }
  }, [copy.loadError])

  useEffect(() => {
    load()
  }, [load, retryKey])

  // Latest recording → drives radar + per-couche tiles + bottleneck.
  const latestRecording = data?.recordings?.[0] ?? null
  const latestCouches = latestRecording?.couches ?? []
  const couchesByKey = useMemo(() => {
    const map = new Map<CoucheKey, Couche>()
    for (const c of latestCouches) map.set(c.key, c)
    return map
  }, [latestCouches])

  // Bottleneck = lowest-scoring scored couche (Voix excluded — unscored).
  const bottleneck = useMemo(() => {
    if (latestCouches.length === 0) return null
    return [...latestCouches].sort((a, b) => a.score - b.score)[0] ?? null
  }, [latestCouches])

  // Days until exam — same logic as HomeScreen.
  const daysUntilExam = useMemo(() => {
    if (!examDate) return null
    const exam = new Date(examDate)
    if (Number.isNaN(exam.getTime())) return null
    exam.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diff = Math.round((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
  }, [examDate])

  return (
    <div className="ed-page-enter" style={{ minHeight: 'calc(100dvh - 64px)', backgroundColor: ED_BG, fontFamily: SANS }}>
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: 'clamp(40px, 5vw, 72px) clamp(24px, 4vw, 48px)',
        }}
      >
        {/* Page header */}
        <header style={{ marginBottom: 32 }}>
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
            {copy.title}
          </p>
          <h1
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(36px, 5vw, 56px)',
              lineHeight: 1.1,
              letterSpacing: '-0.015em',
              color: ED_FG,
              margin: 0,
            }}
          >
            {copy.subtitle}
          </h1>
        </header>

        {error ? (
          <ErrorRetry message={error} retryLabel={copy.retry} onRetry={() => setRetryKey((k) => k + 1)} />
        ) : data === null ? (
          <BentoSkeleton />
        ) : (
          <>
            {/* Bento grid — 4-col lg / 2-col md */}
            <div
              className="fp-bento-grid"
              style={{
                display: 'grid',
                gap: 16,
              }}
            >
              {/* Radar tile (2×2) */}
              <div className="fp-bento-radar">
                <Tile label={copy.radarLabel}>
                  {latestCouches.length > 0 ? (
                    <RadarTile couches={latestCouches} language={language} />
                  ) : (
                    <EmptyMessage>{copy.radarEmpty}</EmptyMessage>
                  )}
                </Tile>
              </div>

              {/* Today's focus tile (2×1) */}
              <div className="fp-bento-today">
                <Tile
                  label={copy.todayLabel}
                  warm
                  cta={
                    data.today
                      ? {
                          href: '/ecole',
                          label: copy.todayCta,
                        }
                      : null
                  }
                >
                  {data.today ? (
                    <TodayBody today={data.today} language={language} />
                  ) : (
                    <EmptyMessage>{copy.todayEmpty}</EmptyMessage>
                  )}
                </Tile>
              </div>

              {/* Bottleneck tile (1×1) */}
              <div className="fp-bento-bottleneck">
                <Tile label={copy.bottleneckLabel}>
                  {bottleneck ? (
                    <BottleneckBody couche={bottleneck} language={language} />
                  ) : (
                    <EmptyMessage>{copy.bottleneckEmpty}</EmptyMessage>
                  )}
                </Tile>
              </div>

              {/* Streak tile (1×1) — V-015d.streak follow-up */}
              <div className="fp-bento-streak">
                <Tile label={copy.streakLabel}>
                  {daysUntilExam !== null ? (
                    <DaysToExamBody days={daysUntilExam} language={language} />
                  ) : (
                    <EmptyMessage>{copy.streakComingSoon}</EmptyMessage>
                  )}
                </Tile>
              </div>

              {/* Per-couche detail row (full width) */}
              <div className="fp-bento-couches">
                <Tile label={copy.perCoucheLabel}>
                  <PerCoucheRow
                    couchesByKey={couchesByKey}
                    voixComingSoonLabel={copy.voixComingSoon}
                    language={language}
                  />
                </Tile>
              </div>

              {/* Recent activity (full width) */}
              <div className="fp-bento-recent">
                <Tile label={copy.recentLabel}>
                  {data.recordings && data.recordings.length > 0 ? (
                    <RecentActivityList recordings={data.recordings} language={language} />
                  ) : (
                    <EmptyMessage>{copy.recentEmpty}</EmptyMessage>
                  )}
                </Tile>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Tile primitive ────────────────────────────────────────────────────────

interface TileProps {
  label: string
  warm?: boolean
  cta?: { href: string; label: string } | null
  children: React.ReactNode
}

function Tile({ label, warm, cta, children }: TileProps) {
  return (
    <div
      style={{
        backgroundColor: warm ? 'var(--ed-warm-cream)' : ED_PAPER,
        border: `1px solid ${ED_RULE}`,
        borderRadius: 4,
        padding: 'clamp(20px, 2.4vw, 28px)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
        <p
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: ED_MUTED,
            margin: 0,
          }}
        >
          {label}
        </p>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</div>
      {cta && (
        <Link
          href={cta.href}
          className="ed-btn-press"
          style={{
            marginTop: 16,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 13,
            color: 'var(--ed-warm-espresso)',
            textDecoration: 'none',
            alignSelf: 'flex-start',
          }}
        >
          {cta.label}
          <ChevronRight size={14} strokeWidth={2.25} />
        </Link>
      )}
    </div>
  )
}

function EmptyMessage({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.55, color: ED_MUTED, margin: 0, padding: '4px 0' }}>
      {children}
    </p>
  )
}

// ── Radar tile body ────────────────────────────────────────────────────────

function RadarTile({ couches, language }: { couches: Couche[]; language: 'en' | 'fr' }) {
  // Build a 5-axis dataset including Voix as unscored placeholder so the
  // shape stays pentagonal regardless of BE scoring availability.
  const data = useMemo(() => {
    const byKey = new Map<CoucheKey, number>()
    for (const c of couches) byKey.set(c.key, toPercent(c.score))
    return COUCHE_ORDER.map((key) => {
      const score = byKey.get(key as CoucheKey) ?? 0
      return {
        axis: BRAND_LABEL[key][language],
        user: score,
        target: 75,
        unscored: !byKey.has(key as CoucheKey),
      }
    })
  }, [couches, language])

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 12, right: 32, bottom: 12, left: 32 }}>
          <PolarGrid stroke="rgba(26, 26, 26, 0.08)" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{
              fontSize: 11,
              fontFamily: 'var(--font-switzer), -apple-system, system-ui, sans-serif',
              fontWeight: 600,
              fill: 'rgba(26, 26, 26, 0.6)',
            }}
          />
          <Radar
            name="Target"
            dataKey="target"
            stroke="var(--ed-warm-sage-deep)"
            strokeDasharray="4 3"
            fill="transparent"
            strokeWidth={1.25}
          />
          <Radar
            name="You"
            dataKey="user"
            stroke="var(--ed-warm-peach-deep)"
            fill="var(--ed-warm-peach)"
            fillOpacity={0.5}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Today body ─────────────────────────────────────────────────────────────

function TodayBody({ today, language }: { today: TodayActionResponse; language: 'en' | 'fr' }) {
  // TodayActionResponse.action carries the recommendation kind; map to a
  // short bento headline. BE-authored dialogue_box is null in production
  // today, so we drive copy from action.kind.
  const action = today.action
  const headline = (() => {
    if (!action) return language === 'fr' ? 'Pas de recommandation aujourd’hui.' : 'No recommendation today.'
    if (action.kind === 'cluster_practice')
      return language === 'fr' ? 'Pratique du cluster.' : 'Cluster practice.'
    if (action.kind === 'free_practice')
      return language === 'fr' ? 'Pratique libre.' : 'Free practice.'
    if (action.kind === 'path_complete')
      return language === 'fr' ? 'Parcours terminé.' : 'Path complete.'
    return language === 'fr' ? 'Pas de parcours actif.' : 'No active path.'
  })()
  return (
    <div>
      <p
        style={{
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 'clamp(20px, 2vw, 26px)',
          lineHeight: 1.25,
          color: 'var(--ed-warm-espresso)',
          margin: 0,
        }}
      >
        {headline}
      </p>
    </div>
  )
}

// ── Bottleneck body ───────────────────────────────────────────────────────

function BottleneckBody({ couche, language }: { couche: Couche; language: 'en' | 'fr' }) {
  const brandLabel = BRAND_LABEL[couche.key][language]
  return (
    <div>
      <p
        style={{
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 22,
          lineHeight: 1.2,
          color: ED_FG,
          margin: 0,
          marginBottom: 6,
        }}
      >
        {brandLabel}
      </p>
      <p style={{ fontFamily: SANS, fontWeight: 600, fontSize: 13, color: 'var(--ed-warm-peach-deep)', margin: 0 }}>
        {toPercent(couche.score)} / 100
      </p>
    </div>
  )
}

// ── Days-until-exam body (Streak slot v1) ─────────────────────────────────

function DaysToExamBody({ days, language }: { days: number; language: 'en' | 'fr' }) {
  return (
    <div>
      <p
        style={{
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 36,
          lineHeight: 1,
          color: 'var(--ed-warm-espresso)',
          margin: 0,
          marginBottom: 6,
        }}
      >
        {days}
      </p>
      <p style={{ fontFamily: SANS, fontSize: 12, color: ED_MUTED, margin: 0 }}>
        {language === 'fr' ? "jours avant l'examen" : 'days until exam'}
      </p>
    </div>
  )
}

// ── Per-couche row (5 mini cards) ──────────────────────────────────────────

function PerCoucheRow({
  couchesByKey,
  voixComingSoonLabel,
  language,
}: {
  couchesByKey: Map<CoucheKey, Couche>
  voixComingSoonLabel: string
  language: 'en' | 'fr'
}) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 12,
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      }}
    >
      {COUCHE_ORDER.map((key) => {
        const isVoix = key === 'la_voix'
        const c = isVoix ? null : couchesByKey.get(key as CoucheKey) ?? null
        const score = c ? toPercent(c.score) : null
        const brand = BRAND_LABEL[key][language]
        return (
          <div
            key={key}
            style={{
              padding: '14px 16px',
              borderRadius: 4,
              border: `1px solid ${ED_RULE}`,
              backgroundColor: 'var(--ed-warm-cream)',
              opacity: isVoix ? 0.6 : 1,
            }}
          >
            <p
              style={{
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 13,
                color: ED_FG,
                margin: 0,
                marginBottom: 6,
              }}
            >
              {brand}
            </p>
            {isVoix ? (
              <p style={{ fontFamily: SANS, fontSize: 11, color: ED_MUTED, margin: 0, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {voixComingSoonLabel}
              </p>
            ) : score !== null ? (
              <p
                style={{
                  fontFamily: SERIF,
                  fontStyle: 'italic',
                  fontWeight: 400,
                  fontSize: 22,
                  lineHeight: 1,
                  color: 'var(--ed-warm-espresso)',
                  margin: 0,
                }}
              >
                {score}
              </p>
            ) : (
              <p style={{ fontFamily: SANS, fontSize: 11, color: ED_MUTED, margin: 0 }}>—</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Recent activity list ──────────────────────────────────────────────────

function RecentActivityList({
  recordings,
  language,
}: {
  recordings: RecordingSummary[]
  language: 'en' | 'fr'
}) {
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {recordings.map((r) => (
        <li
          key={r.id}
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: 16,
            padding: '10px 0',
            borderBottom: `1px solid ${ED_RULE}`,
            alignItems: 'baseline',
          }}
        >
          <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 12, color: 'var(--ed-warm-peach-deep)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {r.tacheMode.replace('tache_', 'Tâche ')}
          </span>
          <span style={{ fontFamily: SANS, fontSize: 13, color: ED_FG_SOFT }}>
            {new Date(r.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: 16, color: 'var(--ed-warm-espresso)' }}>
            {r.cefrLevel ?? '—'}
          </span>
        </li>
      ))}
    </ul>
  )
}

// ── Loading + error ───────────────────────────────────────────────────────

function BentoSkeleton() {
  return (
    <div
      className="fp-bento-grid"
      style={{ display: 'grid', gap: 16 }}
    >
      <div className="fp-bento-radar"><div className="ed-skeleton" style={{ height: 360, borderRadius: 4 }} /></div>
      <div className="fp-bento-today"><div className="ed-skeleton" style={{ height: 160, borderRadius: 4 }} /></div>
      <div className="fp-bento-bottleneck"><div className="ed-skeleton" style={{ height: 160, borderRadius: 4 }} /></div>
      <div className="fp-bento-streak"><div className="ed-skeleton" style={{ height: 160, borderRadius: 4 }} /></div>
      <div className="fp-bento-couches"><div className="ed-skeleton" style={{ height: 120, borderRadius: 4 }} /></div>
      <div className="fp-bento-recent"><div className="ed-skeleton" style={{ height: 200, borderRadius: 4 }} /></div>
    </div>
  )
}

function ErrorRetry({ message, retryLabel, onRetry }: { message: string; retryLabel: string; onRetry: () => void }) {
  return (
    <div role="alert" style={{ padding: '32px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <p style={{ fontFamily: SANS, fontWeight: 500, fontSize: 14, color: ED_MUTED, margin: 0 }}>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="ed-btn-press"
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 14,
          color: '#FFFFFF',
          backgroundColor: 'var(--ed-accent)',
          padding: '8px 18px',
          borderRadius: 4,
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {retryLabel}
      </button>
    </div>
  )
}
