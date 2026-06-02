'use client'

// P-230 — Today's focus (Block 5 Dialogue Box). The single tutor-voice card
// that says "do this right now."
//
// dialogue_box rendering:
//   - In production today, BE always returns dialogue_box: null (P-240b +
//     P-213 not shipped). FE renders reason_code-driven fallback copy.
//   - When dialogue_box is non-null AND has a string `text` field, render
//     it instead of the fallback. Defensive: BE may add other fields later;
//     unknown shape falls back gracefully.

import Link from 'next/link'
import type { ActionBlock, TodayActionResponse } from '@/lib/types'

const INK = 'var(--text-primary)'
const INK_SOFT = 'var(--text-secondary)'
const INK_MUTED = 'var(--text-muted)'
const PAPER = '#FFFFFFCC'
const DISPLAY_FONT = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'

interface TodayFocusSectionProps {
  today: TodayActionResponse | null
}

export default function TodayFocusSection({ today }: TodayFocusSectionProps) {
  if (today === null) return null

  const text = resolveCopy(today)
  const cta = resolveCta(today.action)

  return (
    <section aria-label="Today's focus">
      <p
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color: INK_MUTED,
          margin: '0 0 12px',
        }}
      >
        Today's focus
      </p>
      <article
        style={{
          backgroundColor: PAPER,
          borderRadius: 20,
          padding: '20px 22px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <p
          style={{
            fontWeight: 500,
            fontSize: 15,
            lineHeight: 1.6,
            color: INK,
            margin: 0,
          }}
        >
          {text}
        </p>
        <Link
          href={cta.href}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 44,
            padding: '0 18px',
            backgroundColor: INK,
            color: '#FFFFFF',
            borderRadius: 12,
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: '-0.01em',
            textDecoration: 'none',
            alignSelf: 'flex-start',
          }}
        >
          {cta.label}
        </Link>
      </article>
    </section>
  )
}

// Defensive dialogue_box rendering. When BE ships P-240b/P-213 the field
// will populate with authored tutor copy. Until then it's always null.
// Assumed shape when present: { text: string }. Other shapes fall through.
function resolveCopy(today: TodayActionResponse): string {
  const db = today.dialogue_box
  if (
    db !== null &&
    typeof db === 'object' &&
    typeof (db as { text?: unknown }).text === 'string'
  ) {
    return (db as { text: string }).text
  }
  return reasonCodeFallback(today.action)
}

function reasonCodeFallback(action: ActionBlock): string {
  switch (action.reason_code) {
    case 'regression':
      return 'Your last session showed a step back. Today: replay where it slipped.'
    case 'needs_revisit':
      return 'A pattern from last week is reappearing. Today: revisit it.'
    case 'in_progress':
      return 'Continue where you left off.'
    case 'next_in_path':
      return action.cluster_slug
        ? `Next cluster: ${prettifySlug(action.cluster_slug)}.`
        : 'On to the next cluster.'
    case 'free_practice':
      return 'No specific cluster today. Pick any Tâche to keep momentum.'
    case 'no_path':
      return 'Set up your path to get a daily focus.'
  }
}

function resolveCta(action: ActionBlock): { href: string; label: string } {
  switch (action.kind) {
    case 'cluster_practice':
      // P-234: cluster_practice now routes through /cluster/[slug] when a
      // cluster_slug is available — gives users the lesson + practice prompt
      // before they record. The cluster page's "Practice now" CTA forwards
      // to /speaking/tache-{N}?promptCluster={slug}. When cluster_slug is
      // missing, fall back to the direct Tâche route (degraded but usable).
      if (action.cluster_slug) {
        return { href: `/cluster/${action.cluster_slug}`, label: 'Open cluster' }
      }
      if (action.tache_application) {
        const n = action.tache_application.replace('tache_', '')
        return { href: `/examen/expression-orale/tache-${n}`, label: 'Start practice' }
      }
      return { href: '/examen/expression-orale', label: 'Start practice' }
    case 'free_practice':
      return { href: '/examen/expression-orale', label: 'Open Speaking' }
    case 'path_complete':
      return { href: '/cours/methode-tcf-canada', label: 'Browse modules' }
    case 'no_path':
      return { href: '/onboarding', label: 'Complete onboarding' }
  }
}

function prettifySlug(slug: string): string {
  return slug
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}
