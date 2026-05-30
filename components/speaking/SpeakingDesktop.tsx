'use client'

// V-015c — desktop tab-driven /speaking layout. Three tabs (Tâche 1/2/3)
// over a 60/40 detail panel. Mobile <md keeps the existing 3-card stack
// rendered by SpeakingLanding (gated via .fp-mobile-only / .fp-desktop-
// only classes in globals.css).
//
// Tâche-specific format / tips / examples copy is placeholder-stubbed
// per V-015c.copy follow-up — Chadi authoring real content for v2.

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, MessageCircle, Mic, ChevronRight } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { useInterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'
import type { RecordingSummary, TacheMode } from '@/lib/types'

const ED_BG = 'var(--lm-bg-base)'
const ED_FG = 'var(--lm-text-primary)'
const ED_FG_SOFT = 'var(--lm-text-secondary)'
const ED_MUTED = 'var(--lm-text-tertiary)'
const ED_RULE = 'var(--lm-border-subtle)'
const ED_PAPER = 'var(--lm-bg-surface)'
const ED_ACCENT = 'var(--cta-utility)'
const SANS = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'
const SERIF = 'var(--font-source-serif), Georgia, serif'

type TacheNumber = 1 | 2 | 3
type TacheKey = `tache_${TacheNumber}`

interface TacheData {
  number: TacheNumber
  mode: TacheMode
  href: string
  metaIcon: 'message' | 'mic'
}

const TACHES: TacheData[] = [
  { number: 1, mode: 'tache_1', href: '/speaking/tache-1/interview', metaIcon: 'message' },
  { number: 2, mode: 'tache_2', href: '/speaking/tache-2', metaIcon: 'mic' },
  { number: 3, mode: 'tache_3', href: '/speaking/tache-3/environnement', metaIcon: 'mic' },
]

// V-015c.copy — placeholder stubs. Real format/tips/examples copy is
// Chadi-authored in v2; ship structure + lorem-style placeholders so
// the surface is shippable today.
const COPY = {
  en: {
    title: 'Speaking',
    subtitle: 'Pick a Tâche to start a session.',
    tabsAria: 'Tâche selector',
    detail: {
      tache_1: {
        title: 'Self-presentation',
        meta: { duration: '5–8 min', mode: 'Conversation' },
        intro: 'Introduce yourself. The examiner asks follow-up questions about your life, work, and goals.',
        formatLabel: 'Format',
        format:
          'You speak first, then the examiner asks 2–4 questions. Total speaking time: 5–8 minutes.',
        tipsLabel: 'Tips',
        tips: [
          'Speak in full sentences — short answers signal a low CEFR band.',
          "Don't switch to English when stuck. Reformulate in French.",
          'Use connectors (parce que, donc, alors) to extend turns.',
        ],
        startCta: 'Start Tâche 1 session',
      },
      tache_2: {
        title: 'Role-play',
        meta: { duration: '8–12 min', mode: 'Hold to talk' },
        intro: 'You play a customer, traveler, or client. The examiner-agent answers your questions.',
        formatLabel: 'Format',
        format:
          'Pick a scenario, ask 8–12 questions to gather information. Hold-to-talk recording per turn.',
        tipsLabel: 'Tips',
        tips: [
          "Use formal vous register — informal tu in a service exchange marks down.",
          'Lead with a polite framer ("Bonjour, je voudrais…") on your first turn.',
          'Ask follow-up questions instead of accepting the first answer.',
        ],
        startCta: 'Start Tâche 2 session',
      },
      tache_3: {
        title: 'Argumentative monologue',
        meta: { duration: '5 min · 2 prep + 3 record', mode: 'Solo recording' },
        intro: 'Express a structured opinion on a topic. Two minutes of prep, three minutes of solo speaking.',
        formatLabel: 'Format',
        format:
          'You receive a prompt. 2-minute silent prep window. Then 3-minute solo monologue, no interruptions.',
        tipsLabel: 'Tips',
        tips: [
          'Plan the prep window: thesis + 2 supporting arguments + counter-acknowledgement.',
          'Open with a clear position, not a hedge ("Je pense que…" beats "Peut-être que…").',
          'Close with a synthesis that restates the position. Examiners listen for the closing.',
        ],
        startCta: 'Start Tâche 3 session',
      },
    },
    rightRail: {
      recentLabel: 'Recent recordings',
      recentEmpty: 'No recordings yet for this Tâche.',
      historyLabel: 'Score history',
      historyComingSoon: 'Score chart coming soon.',
      loadError: "Couldn't load recent recordings.",
    },
  },
  fr: {
    title: 'Production orale',
    subtitle: 'Choisissez une tâche pour commencer.',
    tabsAria: 'Sélecteur de tâche',
    detail: {
      tache_1: {
        title: 'Présentation personnelle',
        meta: { duration: '5–8 min', mode: 'Conversation' },
        intro: "Présentez-vous. L'examinateur pose des questions sur votre vie, votre travail et vos objectifs.",
        formatLabel: 'Format',
        format:
          "Vous parlez d'abord, puis l'examinateur pose 2 à 4 questions. Temps total : 5 à 8 minutes.",
        tipsLabel: 'Conseils',
        tips: [
          'Parlez en phrases complètes. Les réponses courtes signalent un niveau CECR bas.',
          "Ne basculez pas vers l'anglais en cas de blocage. Reformulez en français.",
          'Utilisez des connecteurs (parce que, donc, alors) pour prolonger les tours.',
        ],
        startCta: 'Commencer la Tâche 1',
      },
      tache_2: {
        title: 'Jeu de rôle',
        meta: { duration: '8–12 min', mode: 'Maintenir pour parler' },
        intro: "Vous jouez un client, un voyageur, un usager. L'examinateur-agent répond à vos questions.",
        formatLabel: 'Format',
        format:
          'Choisissez un scénario, posez 8 à 12 questions pour obtenir des informations. Enregistrement maintenu par tour.',
        tipsLabel: 'Conseils',
        tips: [
          'Utilisez le vouvoiement. Le tutoiement dans un échange de service vous fait perdre des points.',
          'Commencez par une formule de politesse ("Bonjour, je voudrais…") au premier tour.',
          "Posez des questions de suivi plutôt que d'accepter la première réponse.",
        ],
        startCta: 'Commencer la Tâche 2',
      },
      tache_3: {
        title: 'Monologue argumentatif',
        meta: { duration: '5 min · 2 prép. + 3 enr.', mode: 'Enregistrement solo' },
        intro: 'Exprimez une opinion structurée. Deux minutes de préparation, trois minutes de monologue.',
        formatLabel: 'Format',
        format:
          'Vous recevez un sujet. 2 minutes de préparation silencieuse. Puis 3 minutes de monologue solo, sans interruption.',
        tipsLabel: 'Conseils',
        tips: [
          "Pendant la préparation : thèse + 2 arguments + reconnaissance d'un contre-argument.",
          'Ouvrez avec une position claire, pas un évitement ("Je pense que…" plutôt que "Peut-être que…").',
          'Concluez par une synthèse qui rappelle la position. Les examinateurs écoutent la conclusion.',
        ],
        startCta: 'Commencer la Tâche 3',
      },
    },
    rightRail: {
      recentLabel: 'Enregistrements récents',
      recentEmpty: 'Aucun enregistrement pour cette tâche.',
      historyLabel: 'Historique des scores',
      historyComingSoon: 'Graphique des scores à venir.',
      loadError: 'Impossible de charger les enregistrements.',
    },
  },
} as const

export default function SpeakingDesktop() {
  const language = useInterfaceLanguage()
  const copy = COPY[language]
  const [activeTab, setActiveTab] = useState<TacheNumber>(1)
  const [recordings, setRecordings] = useState<RecordingSummary[] | null>(null)
  const [recordingsError, setRecordingsError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setRecordingsError(null)
    try {
      const list = await api.recordings.list({ limit: 30 })
      setRecordings(list)
    } catch (err) {
      if (err instanceof ApiError) setRecordingsError(copy.rightRail.loadError)
      else setRecordingsError(copy.rightRail.loadError)
    }
  }, [copy.rightRail.loadError])

  useEffect(() => {
    load()
  }, [load])

  const activeKey: TacheKey = `tache_${activeTab}`
  const activeTache = TACHES.find((t) => t.number === activeTab)!
  const detail = copy.detail[activeKey]
  const filteredRecordings =
    recordings?.filter((r) => r.tacheMode === activeTache.mode).slice(0, 5) ?? null

  return (
    <div style={{ minHeight: 'calc(100dvh - 64px)', backgroundColor: ED_BG, fontFamily: SANS }}>
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

        {/* Tab bar */}
        <div
          role="tablist"
          aria-label={copy.tabsAria}
          style={{
            display: 'flex',
            gap: 28,
            borderBottom: `1px solid ${ED_RULE}`,
            marginBottom: 40,
          }}
        >
          {TACHES.map((t) => {
            const active = t.number === activeTab
            return (
              <button
                key={t.number}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`tache-${t.number}-panel`}
                onClick={() => setActiveTab(t.number)}
                style={{
                  position: 'relative',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '12px 0 16px',
                  fontFamily: SANS,
                  fontWeight: active ? 600 : 500,
                  fontSize: 16,
                  color: active ? ED_FG : ED_FG_SOFT,
                  transition: 'color var(--lm-duration-hover) var(--lm-ease-spring)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = ED_FG
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = active ? ED_FG : ED_FG_SOFT
                }}
              >
                Tâche {t.number}
                {active && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: -1,
                      height: 2,
                      backgroundColor: 'var(--lm-warm-peach-deep)',
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Detail panel — 60/40 grid */}
        <div
          id={`tache-${activeTab}-panel`}
          role="tabpanel"
          aria-labelledby={`tache-${activeTab}-tab`}
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
            gap: 'clamp(24px, 3vw, 48px)',
          }}
        >
          {/* LEFT — content */}
          <div>
            <p
              style={{
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 11,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--lm-warm-peach-deep)',
                margin: 0,
                marginBottom: 8,
              }}
            >
              Tâche {activeTab} · {detail.meta.duration} · {detail.meta.mode}
            </p>
            <h2
              style={{
                fontFamily: SERIF,
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 'clamp(28px, 3.6vw, 40px)',
                lineHeight: 1.15,
                letterSpacing: '-0.012em',
                color: ED_FG,
                margin: 0,
                marginBottom: 16,
              }}
            >
              {detail.title}
            </h2>
            <p
              style={{
                fontFamily: SANS,
                fontWeight: 400,
                fontSize: 17,
                lineHeight: 1.65,
                color: ED_FG_SOFT,
                margin: 0,
                marginBottom: 32,
              }}
            >
              {detail.intro}
            </p>

            {/* Format block */}
            <SectionBlock title={detail.formatLabel}>
              <p style={{ fontFamily: SANS, fontWeight: 400, fontSize: 15, lineHeight: 1.65, color: ED_FG, margin: 0 }}>
                {detail.format}
              </p>
            </SectionBlock>

            {/* Tips block */}
            <SectionBlock title={detail.tipsLabel}>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {detail.tips.map((tip, i) => (
                  <li
                    key={i}
                    style={{
                      fontFamily: SANS,
                      fontWeight: 400,
                      fontSize: 15,
                      lineHeight: 1.6,
                      color: ED_FG,
                      paddingLeft: 18,
                      position: 'relative',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 8,
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: 'var(--lm-warm-peach-deep)',
                      }}
                    />
                    {tip}
                  </li>
                ))}
              </ul>
            </SectionBlock>
          </div>

          {/* RIGHT rail — CTA + recent recordings + score history */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* CTA */}
            <Link
              href={activeTache.href}
              className="ed-cta-warm-hover ed-btn-press"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '18px 24px',
                borderRadius: 4,
                backgroundColor: ED_ACCENT,
                color: '#FFFFFF',
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 15,
                textDecoration: 'none',
              }}
            >
              <span>{detail.startCta}</span>
              {activeTache.metaIcon === 'message' ? (
                <MessageCircle size={18} strokeWidth={2} />
              ) : (
                <Mic size={18} strokeWidth={2} />
              )}
            </Link>

            {/* Recent recordings */}
            <RailCard
              label={copy.rightRail.recentLabel}
              empty={!filteredRecordings || filteredRecordings.length === 0}
              emptyMessage={recordingsError ?? copy.rightRail.recentEmpty}
            >
              {filteredRecordings && filteredRecordings.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {filteredRecordings.map((r) => (
                    <li
                      key={r.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: 12,
                        alignItems: 'baseline',
                        padding: '10px 0',
                        borderBottom: `1px solid ${ED_RULE}`,
                      }}
                    >
                      <span style={{ fontFamily: SANS, fontSize: 13, color: ED_FG_SOFT }}>
                        {new Date(r.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 14, color: 'var(--lm-warm-espresso)' }}>
                        {r.cefrLevel ?? '—'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </RailCard>

            {/* Score history — placeholder until V-015d.trend BE endpoint */}
            <RailCard label={copy.rightRail.historyLabel} empty emptyMessage={copy.rightRail.historyComingSoon}>
              <div />
            </RailCard>

            {/* Quick stats footer (uses existing recordings list) */}
            {filteredRecordings && filteredRecordings.length > 0 && (
              <div
                style={{
                  fontFamily: SANS,
                  fontSize: 12,
                  color: ED_MUTED,
                  textAlign: 'center',
                  paddingTop: 4,
                }}
              >
                {filteredRecordings.length} {language === 'fr' ? 'enregistrements récents' : 'recent recordings'}
              </div>
            )}
          </aside>
        </div>

        {/* Bottom meta strip — small visual closure */}
        <div
          style={{
            marginTop: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 16,
            fontFamily: SANS,
            fontSize: 13,
            color: ED_MUTED,
          }}
        >
          <Clock size={14} strokeWidth={2} />
          <span>{detail.meta.duration}</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: ED_MUTED }} />
          <span>{detail.meta.mode}</span>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h3
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 12,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: ED_MUTED,
          margin: 0,
          marginBottom: 12,
        }}
      >
        {title}
      </h3>
      {children}
    </section>
  )
}

function RailCard({
  label,
  empty,
  emptyMessage,
  children,
}: {
  label: string
  empty: boolean
  emptyMessage?: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        backgroundColor: ED_PAPER,
        border: `1px solid ${ED_RULE}`,
        borderRadius: 4,
        padding: '18px 22px',
      }}
    >
      <p
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: ED_MUTED,
          margin: 0,
          marginBottom: 12,
        }}
      >
        {label}
      </p>
      {empty ? (
        <p style={{ fontFamily: SANS, fontSize: 13, color: ED_MUTED, margin: 0, padding: '4px 0' }}>
          {emptyMessage}
        </p>
      ) : (
        children
      )}
    </div>
  )
}
