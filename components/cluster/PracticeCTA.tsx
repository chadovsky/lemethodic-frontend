'use client'

// P-234 — practice prompt + record CTA. The terminal action on the cluster
// page: "I read the lesson, now I'm going to practice."
//
// practice_prompt is JSONB with no enforced shape (BE description: "JSONB
// pass-throughs whose authored shape is owned by the cluster authoring
// rubric (P-211/P-211a) — kept loose"). Best-effort string extraction
// (text → prompt → description → body, first match wins) for an inline
// preview. Falls back to no preview if none of those keys carry a string.
//
// CTA routes to /speaking/tache-{N}?promptCluster={slug}. Consumer
// (/speaking/* pages) reads ?promptCluster and applies — separate FE
// scope tracked under P-234.speaking-promptCluster.

import Link from 'next/link'
import type { ClusterDetailResponse } from '@/lib/types'

const INK = 'var(--text-primary)'
const INK_SOFT = 'var(--text-secondary)'
const INK_MUTED = 'var(--text-muted)'
const PAPER = '#FFFFFFCC'
const DISPLAY_FONT = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'

interface PracticeCTAProps {
  detail: ClusterDetailResponse
}

const TACHE_NUMBER: Record<ClusterDetailResponse['tache_application'], string> = {
  tache_1: '1',
  tache_2: '2',
  tache_3: '3',
}

const TACHE_NAME: Record<ClusterDetailResponse['tache_application'], string> = {
  tache_1: 'Interview',
  tache_2: 'Role-play',
  tache_3: 'Monologue',
}

// Loose extraction — tries common authoring keys until it finds a string.
function extractPromptPreview(prompt: Record<string, unknown>): string | null {
  for (const key of ['text', 'prompt', 'description', 'body']) {
    const v = prompt[key]
    if (typeof v === 'string' && v.trim().length > 0) return v
  }
  return null
}

export default function PracticeCTA({ detail }: PracticeCTAProps) {
  const tacheNum = TACHE_NUMBER[detail.tache_application]
  const tacheName = TACHE_NAME[detail.tache_application]
  const href = `/speaking/tache-${tacheNum}?promptCluster=${encodeURIComponent(detail.slug)}`
  const promptPreview = extractPromptPreview(detail.practice_prompt)

  return (
    <section
      aria-label="Practice this cluster"
      style={{
        backgroundColor: PAPER,
        borderRadius: 20,
        padding: '20px 22px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <p
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color: INK_MUTED,
          margin: 0,
        }}
      >
        Practice
      </p>

      {promptPreview && (
        <blockquote
          style={{
            margin: 0,
            padding: '12px 16px',
            borderLeft: `3px solid ${INK}`,
            backgroundColor: '#1A1A1A04',
            borderRadius: 4,
            fontWeight: 500,
            fontSize: 14,
            lineHeight: 1.55,
            color: INK_SOFT,
            fontStyle: 'italic',
          }}
        >
          {promptPreview}
        </blockquote>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Link
          href={href}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 48,
            padding: '0 22px',
            backgroundColor: INK,
            color: '#FFFFFF',
            borderRadius: 14,
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: '-0.01em',
            textDecoration: 'none',
            alignSelf: 'flex-start',
          }}
        >
          Practice now
        </Link>
        <span
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 500,
            fontSize: 12,
            color: INK_MUTED,
          }}
        >
          Tâche {tacheNum} · {tacheName}
        </span>
      </div>
    </section>
  )
}
