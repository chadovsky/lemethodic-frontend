'use client'

// F-457 — La Carte journey map.
//
// Renders the F-456 journey (lib/journey/journey.ts) as a vertical trail:
//   grammar-phase node -> (ile node + its mini-mock marker) x7 -> final-mock.
// Node states come straight from the data:
//   current   = highlighted island + the only primary CTA (-> canonical ile route)
//   completed = done marker
//   locked    = muted, non-interactive
//   bientot   = shown not-yet-live (practice activities + mocks)
// Level is resolved from the target profile (localStorage), default B1; the
// diagnostic ticket owns real assignment later. No real island art (IslandNode
// is the placeholder seam). Rounded-only, v3 tokens only, no em-dashes.

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, ClipboardCheck, Flag, Lock, Check, ArrowRight } from 'lucide-react'
import {
  getJourney,
  THEMES,
  type Journey,
  type Level,
  type Ile,
  type Status,
  type ThemeId,
  type GrammarTopic,
  type Mock,
} from '@/lib/journey/journey'
import { readTargetLevel } from '@/lib/journey/target-level'
import { readCompletedIles } from '@/lib/journey/progress'
import IslandNode from '@/components/carte/IslandNode'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

const THEME_LABELS: Record<ThemeId, string> = Object.fromEntries(
  THEMES.map((theme) => [theme.id, theme.label]),
) as Record<ThemeId, string>

const GUTTER = 88

// ── Trail scaffolding ───────────────────────────────────────────────────────

// One trail row: a centered marker in the left gutter + content on the right.
function TrailRow({
  marker,
  children,
  testId,
  testProps,
}: {
  marker: React.ReactNode
  children: React.ReactNode
  testId?: string
  testProps?: Record<string, string>
}) {
  return (
    <div
      data-testid={testId}
      {...testProps}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}
    >
      <div
        style={{
          width: GUTTER,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {marker}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>{children}</div>
    </div>
  )
}

// Vertical connector segment between two rows, aligned to the gutter centre.
function Connector() {
  return (
    <div aria-hidden="true" style={{ height: 22, position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          left: GUTTER / 2 - 1,
          top: 0,
          bottom: 0,
          width: 2,
          background: 'var(--rule)',
          borderRadius: 2,
        }}
      />
    </div>
  )
}

// Rounded rail marker for non-island nodes (grammar, mocks). `live` foundation
// content uses the dominant tint; not-yet-live content reads faint + dashed.
function RailMarker({
  icon,
  live,
}: {
  icon: React.ReactNode
  live: boolean
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: 52,
        height: 52,
        borderRadius: 'var(--r-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: live
          ? 'color-mix(in srgb, var(--dominant) 10%, var(--paper))'
          : 'var(--paper-edge)',
        border: live ? '1px solid var(--rule-strong)' : '1px dashed var(--rule)',
        color: live ? 'var(--dominant)' : 'var(--ink-faint)',
      }}
    >
      {icon}
    </div>
  )
}

// ── Shared bits ─────────────────────────────────────────────────────────────

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

function NodeTitle({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </h2>
  )
}

// Small status tag shown beside an ile title.
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

// The practice beat: 5 activity chips, all not-yet-live.
function PracticeRow({ activities }: { activities: Ile['practice'] }) {
  return (
    <div style={{ marginTop: 14 }}>
      <p
        style={{
          fontFamily: 'var(--f-mono)',
          fontSize: 9,
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--ink-faint)',
          margin: '0 0 8px',
        }}
      >
        Entraînement, bientôt
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {activities.map((activity) => (
          <span
            key={activity.id}
            data-testid="carte-practice-chip"
            style={{
              fontFamily: SANS_FONT,
              fontSize: 12,
              color: 'var(--ink-faint)',
              background: 'var(--paper-edge)',
              border: '1px dashed var(--rule)',
              borderRadius: 'var(--r-pill)',
              padding: '4px 12px',
            }}
          >
            {activity.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Nodes ───────────────────────────────────────────────────────────────────

function GrammarNode({ topics }: { topics: GrammarTopic[] }) {
  const live = topics.length > 0
  return (
    <TrailRow
      testId="carte-grammar"
      testProps={{ 'data-live': String(live) }}
      marker={<RailMarker icon={<BookOpen size={22} strokeWidth={1.75} />} live={live} />}
    >
      <Eyebrow>Fondations</Eyebrow>
      <NodeTitle>La grammaire</NodeTitle>
      {live ? (
        <>
          <p
            style={{
              fontFamily: SANS_FONT,
              fontSize: 14,
              lineHeight: 1.5,
              color: 'var(--ink-soft)',
              margin: '8px 0 0',
            }}
          >
            Les bases à consolider avant de naviguer entre les îles.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
            {topics.map((topic) => (
              <span
                key={topic.id}
                data-testid="carte-grammar-chip"
                style={{
                  fontFamily: SANS_FONT,
                  fontSize: 12,
                  color: 'var(--ink)',
                  background: 'var(--paper-edge)',
                  border: '1px solid var(--rule)',
                  borderRadius: 'var(--r-pill)',
                  padding: '4px 12px',
                }}
              >
                {topic.label}
              </span>
            ))}
          </div>
        </>
      ) : (
        <p
          style={{
            fontFamily: SANS_FONT,
            fontSize: 14,
            lineHeight: 1.5,
            color: 'var(--ink-faint)',
            margin: '8px 0 0',
          }}
        >
          Le programme de grammaire pour ce niveau arrive bientôt.
        </p>
      )}
    </TrailRow>
  )
}

function IleNode({ ile }: { ile: Ile }) {
  const label = THEME_LABELS[ile.theme]
  const isCurrent = ile.status === 'current'
  return (
    <TrailRow
      testId="carte-ile"
      testProps={{ 'data-theme': ile.theme, 'data-status': ile.status }}
      marker={<IslandNode theme={ile.theme} status={ile.status} label={label} />}
    >
      <div
        style={{
          background: isCurrent
            ? 'color-mix(in srgb, var(--accent) 5%, var(--paper))'
            : 'var(--paper)',
          border: isCurrent ? '2px solid var(--accent)' : '1px solid var(--rule)',
          borderRadius: 'var(--r-lg)',
          padding: 'clamp(16px, 2vw, 22px)',
          opacity: ile.status === 'locked' ? 0.72 : 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            marginBottom: 8,
          }}
        >
          <NodeTitle>{label}</NodeTitle>
          <StatusTag status={ile.status} />
        </div>

        <span
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--ink-faint)',
          }}
        >
          Niveau {ile.level}
        </span>

        <PracticeRow activities={ile.practice} />

        {isCurrent && (
          <Link
            href={`/ile/${ile.theme}`}
            data-testid="carte-current-cta"
            className="ed-btn-press"
            style={{
              marginTop: 18,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              backgroundColor: 'var(--accent)',
              color: 'var(--paper)',
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: '0.9375rem',
              letterSpacing: '0.01em',
              textDecoration: 'none',
              borderRadius: 'var(--r-pill)',
              minHeight: 44,
            }}
          >
            Commencer
            <ArrowRight size={18} strokeWidth={2} />
          </Link>
        )}
      </div>
    </TrailRow>
  )
}

// Mini-mock + final-mock checkpoints. Both bientot in the data: not-yet-live.
function CheckpointNode({
  mock,
  testId,
  testProps,
  icon,
  eyebrow,
}: {
  mock: Mock
  testId: string
  testProps?: Record<string, string>
  icon: React.ReactNode
  eyebrow: string
}) {
  return (
    <TrailRow
      testId={testId}
      testProps={{ ...testProps, 'data-status': mock.status }}
      marker={<RailMarker icon={icon} live={false} />}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <p
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: 15,
              color: 'var(--ink-soft)',
              margin: 0,
            }}
          >
            {mock.label}
          </p>
        </div>
        <StatusTag status={mock.status} />
      </div>
    </TrailRow>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function CarteJourney() {
  // Level resolves client-side from the target profile; B1 default keeps the
  // first paint (and SSR) deterministic before localStorage is read.
  const [level, setLevel] = useState<Level>('B1')
  const [completed, setCompleted] = useState<ThemeId[]>([])

  useEffect(() => {
    const resolved = readTargetLevel()
    setLevel(resolved)
    setCompleted(readCompletedIles(resolved))
  }, [])

  const journey: Journey = getJourney(level, completed)

  return (
    <div
      data-testid="carte-journey"
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: 'clamp(8px, 2vw, 24px) 0 64px',
        fontFamily: SANS_FONT,
      }}
    >
      <header style={{ marginBottom: 36 }}>
        <span
          data-testid="carte-level"
          style={{
            display: 'inline-block',
            fontFamily: 'var(--f-mono)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
            borderRadius: 'var(--r-pill)',
            padding: '4px 13px',
            marginBottom: 14,
          }}
        >
          Niveau {journey.level}
        </span>
        <h1
          style={{
            fontFamily: SERIF_FONT,
            fontSize: 'clamp(2rem, 5vw, 2.75rem)',
            fontWeight: 400,
            color: 'var(--ink)',
            margin: '0 0 10px',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          La Carte
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--ink-soft)',
            margin: 0,
            lineHeight: 1.6,
            maxWidth: 460,
          }}
        >
          Votre parcours vers le TCF, île par île. La grammaire d&apos;abord,
          puis les sept thèmes, chacun suivi de son mini-examen.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <GrammarNode topics={journey.grammarPhase} />

        {journey.iles.map((ile) => (
          <div key={ile.theme} style={{ display: 'flex', flexDirection: 'column' }}>
            <Connector />
            <IleNode ile={ile} />
            <Connector />
            <CheckpointNode
              mock={ile.check.miniMock}
              testId="carte-mini-mock"
              testProps={{ 'data-theme': ile.theme }}
              icon={<ClipboardCheck size={22} strokeWidth={1.75} />}
              eyebrow="Vérification"
            />
          </div>
        ))}

        <Connector />
        <CheckpointNode
          mock={journey.finalMock}
          testId="carte-final-mock"
          icon={<Flag size={22} strokeWidth={1.75} />}
          eyebrow="Objectif"
        />
      </div>
    </div>
  )
}
