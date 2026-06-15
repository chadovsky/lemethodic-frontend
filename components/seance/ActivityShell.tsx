'use client'

// F-460 - La Seance activity shell.
//
// Renders one Practice activity (Ile.practice[] entry) as a content-free shell:
// type icon + kicker + label + a one-line descriptor + a bientot marker. No
// exercise content, no interactivity (Phase 3). Rounded-only, v3 tokens only.

import {
  Languages,
  SpellCheck,
  PenLine,
  Mic,
  Headphones,
  type LucideIcon,
} from 'lucide-react'
import type { Activity, ActivityType } from '@/lib/journey/journey'
import { ACTIVITY_SHELL_COPY } from '@/lib/seance/activities'
import { SANS_FONT } from '@/lib/typography'

const ACTIVITY_ICON: Record<ActivityType, LucideIcon> = {
  traduction: Languages,
  grammaire: SpellCheck,
  expression_ecrite: PenLine,
  expression_orale: Mic,
  comprehension_orale: Headphones,
}

export default function ActivityShell({ activity }: { activity: Activity }) {
  const copy = ACTIVITY_SHELL_COPY[activity.type]
  const Icon = ACTIVITY_ICON[activity.type]
  return (
    <section
      data-testid="seance-activity"
      data-activity-type={activity.type}
      lang="fr"
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--r-lg)',
        padding: 'clamp(28px, 5vw, 48px)',
        minHeight: 280,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 64,
          height: 64,
          flexShrink: 0,
          borderRadius: 'var(--r-md)',
          background: 'color-mix(in srgb, var(--dominant) 9%, var(--paper))',
          border: '1px solid var(--rule)',
          color: 'var(--dominant)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <Icon size={28} strokeWidth={1.75} />
      </div>

      <p
        style={{
          fontFamily: 'var(--f-mono)',
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--ink-faint)',
          margin: '0 0 8px',
        }}
      >
        {copy.kicker}
      </p>

      <h2
        style={{
          fontFamily: SANS_FONT,
          fontSize: 'clamp(18px, 2.4vw, 24px)',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          color: 'var(--ink)',
          margin: '0 0 12px',
        }}
      >
        {activity.label}
      </h2>

      <p
        style={{
          fontFamily: SANS_FONT,
          fontSize: 14,
          lineHeight: 1.55,
          color: 'var(--ink-soft)',
          margin: '0 0 22px',
          maxWidth: 420,
        }}
      >
        {copy.description}
      </p>

      <span
        data-testid="seance-activity-bientot"
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
          padding: '4px 12px',
        }}
      >
        Bientot
      </span>
    </section>
  )
}
