'use client'

// F-458 — L'Île page: the 3-beat template (FE).
//
// Renders one ile from the F-456 journey model (lib/journey/journey.ts) at the
// learner's target level (F-457 readTargetLevel). The ile resolves from
// getJourney(level).iles by theme; the page lays out the 3 beats every ile
// follows:
//   Beat 1 Learn     -> vocab list + grammar points + Le Maitre video slot
//                       (authored MDX rendered if present, else bientot).
//   Beat 2 Practice  -> the 5 activity shells + one gated "Commencer la seance"
//                       CTA (placed but bientot; the seance walk is a later
//                       ticket — no interactivity here).
//   Beat 3 Check     -> the mini-mock shell (bientot).
// Les Pieges Anglais thread: grammar points flagged interference carry a Piege
// marker. No BE, no diagnostic, no authored content. Rounded-only, v3 tokens
// only, no em-dashes.

import { useState, useEffect } from 'react'
import type { ComponentType } from 'react'
import Link from 'next/link'
import {
  Lock,
  Check,
  Dumbbell,
  ClipboardCheck,
  Video,
  AlertTriangle,
  PlayCircle,
  ArrowRight,
} from 'lucide-react'
import {
  getJourney,
  THEMES,
  type Level,
  type Ile,
  type Status,
  type ThemeId,
  type GrammarTopic,
} from '@/lib/journey/journey'
import { readTargetLevel } from '@/lib/journey/target-level'
import { readCompletedIles } from '@/lib/journey/progress'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

interface Props {
  theme: string
}

const THEME_LABELS: Record<ThemeId, string> = Object.fromEntries(
  THEMES.map((theme) => [theme.id, theme.label]),
) as Record<ThemeId, string>

const THEME_IDS = new Set<string>(THEMES.map((t) => t.id))

// ── Shared bits ──────────────────────────────────────────────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'var(--f-mono)',
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--ink-faint)',
        margin: '0 0 6px',
      }}
    >
      {children}
    </p>
  )
}

// Small "Bientot" tag, reused across the not-yet-live slots.
function BientotTag() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: 'var(--f-mono)',
        fontSize: 9,
        fontWeight: 500,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--ink-faint)',
        background: 'var(--paper-edge)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--r-pill)',
        padding: '3px 10px',
        whiteSpace: 'nowrap',
      }}
    >
      Bientôt
    </span>
  )
}

function StatusTag({ status }: { status: Status }) {
  const map: Record<Status, { label: string; fg: string; bg: string }> = {
    current: {
      label: 'Vous êtes ici',
      fg: 'var(--accent)',
      bg: 'color-mix(in srgb, var(--accent) 12%, transparent)',
    },
    completed: {
      label: 'Terminée',
      fg: 'var(--success)',
      bg: 'color-mix(in srgb, var(--success) 14%, transparent)',
    },
    locked: {
      label: 'Verrouillée',
      fg: 'var(--ink-faint)',
      bg: 'var(--paper-edge)',
    },
    bientot: {
      label: 'Bientôt',
      fg: 'var(--ink-faint)',
      bg: 'var(--paper-edge)',
    },
  }
  const tag = map[status]
  return (
    <span
      data-testid="ile-status"
      data-status={status}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontFamily: SANS_FONT,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.02em',
        color: tag.fg,
        background: tag.bg,
        borderRadius: 'var(--r-pill)',
        padding: '3px 11px',
      }}
    >
      {status === 'locked' && <Lock size={11} strokeWidth={2} />}
      {status === 'completed' && <Check size={12} strokeWidth={2.5} />}
      {tag.label}
    </span>
  )
}

// One beat shell: numbered eyebrow + icon + title, then children.
function Beat({
  index,
  icon,
  title,
  testId,
  children,
}: {
  index: number
  icon: React.ReactNode
  title: string
  testId: string
  children: React.ReactNode
}) {
  return (
    <section
      data-testid={testId}
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--r-lg)',
        padding: 'clamp(20px, 3vw, 28px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <div
          aria-hidden="true"
          style={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: 'var(--r-md)',
            background: 'color-mix(in srgb, var(--dominant) 9%, var(--paper))',
            border: '1px solid var(--rule)',
            color: 'var(--dominant)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
        <div>
          <Eyebrow>Étape {index}</Eyebrow>
          <h2
            style={{
              fontFamily: SERIF_FONT,
              fontWeight: 500,
              fontSize: 'clamp(18px, 2.2vw, 22px)',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
              color: 'var(--ink)',
              margin: 0,
            }}
          >
            {title}
          </h2>
        </div>
      </div>
      {children}
    </section>
  )
}

function SlotLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'var(--f-mono)',
        fontSize: 9,
        fontWeight: 500,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--ink-faint)',
        margin: '0 0 10px',
      }}
    >
      {children}
    </p>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function IleShell({ theme }: Props) {
  // Level resolves client-side from the target profile (F-457); B1 keeps the
  // first paint deterministic before localStorage is read.
  const [level, setLevel] = useState<Level>('B1')
  const [completed, setCompleted] = useState<ThemeId[]>([])
  const [Content, setContent] = useState<ComponentType | null>(null)

  useEffect(() => {
    const resolved = readTargetLevel()
    setLevel(resolved)
    setCompleted(readCompletedIles(resolved))
    // Authored learn content seam: render the MDX mold sequence if a file
    // exists for this (theme, level), else the Le Maitre slot stays bientot.
    // The 7 journey themes have no MDX yet, so this resolves to bientot for
    // them; the existing _sample / cafe MDX still renders.
    import(`@/content/iles/${theme}/${resolved.toLowerCase()}.mdx`)
      .then((mod) => setContent(() => mod.default as ComponentType))
      .catch(() => setContent(null))
  }, [theme])

  const journey = getJourney(level, completed)
  const ile: Ile | undefined = THEME_IDS.has(theme)
    ? journey.iles.find((candidate) => candidate.theme === theme)
    : undefined

  // Unknown theme (or no ile at this level): graceful bientot stub, never a 404.
  if (!ile) {
    return (
      <main
        lang="fr"
        style={{
          maxWidth: 820,
          margin: '0 auto',
          padding: 'clamp(32px, 5vw, 64px) clamp(20px, 4vw, 40px)',
        }}
      >
        <div
          data-testid="ile-not-found"
          style={{
            background: 'var(--paper-tint)',
            border: '1px solid var(--rule)',
            borderRadius: 'var(--r-lg)',
            padding: 'clamp(40px, 6vw, 72px) clamp(24px, 4vw, 48px)',
            textAlign: 'center',
          }}
        >
          <Eyebrow>Bientôt</Eyebrow>
          <h1
            style={{
              fontFamily: SERIF_FONT,
              fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
              fontWeight: 400,
              color: 'var(--ink)',
              margin: '0 0 12px',
              letterSpacing: '-0.01em',
            }}
          >
            Cette île arrive prochainement.
          </h1>
          <p style={{ fontFamily: SANS_FONT, fontSize: 14, color: 'var(--ink-soft)', margin: 0 }}>
            Le contenu pour ce thème et ce niveau est en préparation.
          </p>
        </div>
      </main>
    )
  }

  const label = THEME_LABELS[ile.theme]

  // Resolve the ile's grammar-point ids against the journey grammar phase so we
  // can surface labels + the Pieges Anglais (interference) marker.
  const phaseById = new Map<string, GrammarTopic>(
    journey.grammarPhase.map((topic) => [topic.id, topic]),
  )
  const grammarTopics: GrammarTopic[] = ile.learn.grammarPoints
    .map((id) => phaseById.get(id))
    .filter((topic): topic is GrammarTopic => Boolean(topic))

  return (
    <main
      lang="fr"
      data-testid="ile-page"
      style={{
        maxWidth: 820,
        margin: '0 auto',
        padding: 'clamp(32px, 5vw, 64px) clamp(20px, 4vw, 40px)',
        fontFamily: SANS_FONT,
      }}
    >
      {/* Header: theme display name + level + status */}
      <header
        data-testid="ile-header"
        data-theme={ile.theme}
        data-level={ile.level}
        data-status={ile.status}
        style={{ marginBottom: 32 }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            marginBottom: 12,
          }}
        >
          <span
            data-testid="ile-level"
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
              borderRadius: 'var(--r-pill)',
              padding: '4px 12px',
            }}
          >
            Niveau {ile.level}
          </span>
          <StatusTag status={ile.status} />
        </div>
        <h1
          style={{
            fontFamily: SERIF_FONT,
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: 400,
            color: 'var(--ink)',
            margin: 0,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          {label}
        </h1>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* ── Beat 1 — Learn ─────────────────────────────────────────────── */}
        <Beat
          index={1}
          testId="ile-beat-learn"
          title="Apprendre"
          icon={<Video size={20} strokeWidth={1.75} />}
        >
          {/* Vocab */}
          <div style={{ marginBottom: 24 }}>
            <SlotLabel>Vocabulaire</SlotLabel>
            {ile.learn.vocab.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ile.learn.vocab.map((word) => (
                  <span
                    key={word}
                    data-testid="ile-vocab-item"
                    style={{
                      fontFamily: SANS_FONT,
                      fontSize: 13,
                      color: 'var(--ink)',
                      background: 'var(--paper-edge)',
                      border: '1px solid var(--rule)',
                      borderRadius: 'var(--r-pill)',
                      padding: '5px 13px',
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ fontFamily: SANS_FONT, fontSize: 13, color: 'var(--ink-faint)', margin: 0 }}>
                Le vocabulaire de cette île arrive bientôt.
              </p>
            )}
          </div>

          {/* Grammar points + Pieges Anglais thread */}
          <div style={{ marginBottom: 24 }}>
            <SlotLabel>Points de grammaire</SlotLabel>
            {grammarTopics.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {grammarTopics.map((topic) => (
                  <span
                    key={topic.id}
                    data-testid="ile-grammar-point"
                    data-interference={String(topic.interference)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      fontFamily: SANS_FONT,
                      fontSize: 13,
                      color: 'var(--ink)',
                      background: 'var(--paper-edge)',
                      border: '1px solid var(--rule)',
                      borderRadius: 'var(--r-pill)',
                      padding: '5px 13px',
                    }}
                  >
                    {topic.label}
                    {topic.interference && (
                      <span
                        data-testid="ile-piege"
                        title="Piège anglais : interférence avec l'anglais"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontFamily: 'var(--f-mono)',
                          fontSize: 9,
                          fontWeight: 500,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: 'var(--accent)',
                          background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
                          borderRadius: 'var(--r-pill)',
                          padding: '2px 8px',
                        }}
                      >
                        <AlertTriangle size={10} strokeWidth={2.25} />
                        Piège
                      </span>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ fontFamily: SANS_FONT, fontSize: 13, color: 'var(--ink-faint)', margin: 0 }}>
                Les points de grammaire de cette île arrivent bientôt.
              </p>
            )}
          </div>

          {/* Le Maitre video slot — authored MDX if present, else bientot */}
          <div data-testid="ile-maitre-video">
            <SlotLabel>La leçon de Le Maître</SlotLabel>
            {Content ? (
              <div data-testid="ile-maitre-content">
                <Content />
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  background: 'var(--paper-tint)',
                  border: '1px dashed var(--rule)',
                  borderRadius: 'var(--r-lg)',
                  padding: '18px 20px',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                    borderRadius: 'var(--r-md)',
                    background: 'var(--paper-edge)',
                    color: 'var(--ink-faint)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PlayCircle size={22} strokeWidth={1.75} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: SANS_FONT,
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--ink-soft)',
                      margin: '0 0 3px',
                    }}
                  >
                    La vidéo de Le Maître arrive bientôt.
                  </p>
                  <p style={{ fontFamily: SANS_FONT, fontSize: 13, color: 'var(--ink-faint)', margin: 0 }}>
                    La leçon vidéo pour cette île est en préparation.
                  </p>
                </div>
                <BientotTag />
              </div>
            )}
          </div>
        </Beat>

        {/* ── Beat 2 — Practice ──────────────────────────────────────────── */}
        <Beat
          index={2}
          testId="ile-beat-practice"
          title="S'entraîner"
          icon={<Dumbbell size={20} strokeWidth={1.75} />}
        >
          <SlotLabel>La séance</SlotLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ile.practice.map((activity) => (
              <div
                key={activity.id}
                data-testid="ile-activity"
                data-activity-type={activity.type}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  background: 'var(--paper-edge)',
                  border: '1px dashed var(--rule)',
                  borderRadius: 'var(--r-md)',
                  padding: '14px 16px',
                }}
              >
                <span
                  style={{
                    fontFamily: SANS_FONT,
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--ink-soft)',
                  }}
                >
                  {activity.label}
                </span>
                <BientotTag />
              </div>
            ))}
          </div>

          {/* Launch CTA — live for an actionable ile (current / completed),
              gated otherwise (locked / bientot). F-460 un-gates the seance. */}
          {ile.status === 'current' || ile.status === 'completed' ? (
            <Link
              href={`/seance?ile=${ile.theme}`}
              data-testid="ile-seance-cta"
              data-gated="false"
              className="ed-btn-press"
              style={{
                marginTop: 18,
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '13px 20px',
                background: 'var(--accent)',
                color: 'var(--paper)',
                border: 'none',
                borderRadius: 'var(--r-pill)',
                fontFamily: SANS_FONT,
                fontWeight: 600,
                fontSize: '0.9375rem',
                letterSpacing: '0.01em',
                textDecoration: 'none',
                minHeight: 48,
              }}
            >
              {ile.status === 'completed' ? 'Refaire la séance' : 'Commencer la séance'}
              <ArrowRight size={18} strokeWidth={2} />
            </Link>
          ) : (
            <button
              type="button"
              data-testid="ile-seance-cta"
              data-gated="true"
              disabled
              aria-disabled="true"
              style={{
                marginTop: 18,
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '13px 20px',
                background: 'var(--paper-edge)',
                color: 'var(--ink-faint)',
                border: '1px solid var(--rule)',
                borderRadius: 'var(--r-pill)',
                fontFamily: SANS_FONT,
                fontWeight: 600,
                fontSize: '0.9375rem',
                letterSpacing: '0.01em',
                cursor: 'not-allowed',
                minHeight: 48,
              }}
            >
              Commencer la séance
              <BientotTag />
            </button>
          )}
        </Beat>

        {/* ── Beat 3 — Check ─────────────────────────────────────────────── */}
        <Beat
          index={3}
          testId="ile-beat-check"
          title="Vérifier"
          icon={<ClipboardCheck size={20} strokeWidth={1.75} />}
        >
          <SlotLabel>Mini-examen</SlotLabel>
          <div
            data-testid="ile-mini-mock"
            data-status={ile.check.miniMock.status}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              background: 'var(--paper-tint)',
              border: '1px dashed var(--rule)',
              borderRadius: 'var(--r-lg)',
              padding: '18px 20px',
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: SANS_FONT,
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--ink-soft)',
                  margin: '0 0 3px',
                }}
              >
                {ile.check.miniMock.label}
              </p>
              <p style={{ fontFamily: SANS_FONT, fontSize: 13, color: 'var(--ink-faint)', margin: 0 }}>
                Mesurez ce que vous avez appris sur cette île.
              </p>
            </div>
            <BientotTag />
          </div>
        </Beat>
      </div>
    </main>
  )
}
