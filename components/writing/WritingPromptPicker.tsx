'use client'

// V-013a — Writing prompt library landing. Fetches F-224 prompts on
// mount, groups by tache_level (T1/T2/T3), surfaces level + topic_tag
// filter chips. Each prompt card routes to /writing/[prompt_id].
//
// Visual: V-012b warmth — ed-bg page bg, prompt cards on ed-paper with
// 1px ed-rule + ed-card-lift. Filter chips use ed-warm-* tokens for
// active state.

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { api, ApiError } from '@/lib/api'
import { useInterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'
import type { WritingPrompt } from '@/lib/types'

const ED_BG = 'var(--ed-bg)'
const ED_FG = 'var(--ed-fg)'
const ED_FG_SOFT = 'var(--ed-fg-soft)'
const ED_MUTED = 'var(--ed-muted)'
const ED_RULE = 'var(--ed-rule)'
const ED_PAPER = 'var(--ed-paper)'
const SANS = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'
const SERIF = 'var(--font-fraunces), Georgia, serif'

type LevelFilter = 'all' | 'B1' | 'B2'

const COPY = {
  en: {
    pageTitle: 'Writing',
    pageSubtitle: 'Practice prompts with Claude analysis on the 4 couches.',
    levelFilters: { all: 'All levels', B1: 'B1', B2: 'B2' },
    topicFilterAll: 'All topics',
    sectionLabels: { 1: 'Tâche 1', 2: 'Tâche 2', 3: 'Tâche 3' } as const,
    minutes: 'min',
    words: 'words',
    loadError: "Couldn't load prompts. Retry?",
    retry: 'Retry',
    empty: 'No prompts match these filters.',
  },
  fr: {
    pageTitle: 'Production écrite',
    pageSubtitle: 'Sujets de pratique avec analyse Claude sur les 4 couches.',
    levelFilters: { all: 'Tous niveaux', B1: 'B1', B2: 'B2' },
    topicFilterAll: 'Tous sujets',
    sectionLabels: { 1: 'Tâche 1', 2: 'Tâche 2', 3: 'Tâche 3' } as const,
    minutes: 'min',
    words: 'mots',
    loadError: 'Impossible de charger les sujets. Réessayer ?',
    retry: 'Réessayer',
    empty: 'Aucun sujet ne correspond à ces filtres.',
  },
} as const

export default function WritingPromptPicker() {
  const language = useInterfaceLanguage()
  const copy = COPY[language]
  const [prompts, setPrompts] = useState<WritingPrompt[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all')
  const [topicFilter, setTopicFilter] = useState<string>('all')

  const load = useCallback(async () => {
    setError(null)
    try {
      const list = await api.writing.listPrompts()
      setPrompts(list)
    } catch (err) {
      if (err instanceof ApiError) setError(copy.loadError)
      else setError(copy.loadError)
    }
  }, [copy.loadError])

  useEffect(() => {
    load()
  }, [load, retryKey])

  // Build the topic filter set from the prompts response.
  const topics = useMemo(() => {
    if (!prompts) return []
    return Array.from(new Set(prompts.map((p) => p.topic_tag))).sort()
  }, [prompts])

  // Apply filters then group by tache_level.
  const grouped = useMemo(() => {
    if (!prompts) return null
    const filtered = prompts.filter((p) => {
      if (levelFilter !== 'all' && p.level !== levelFilter) return false
      if (topicFilter !== 'all' && p.topic_tag !== topicFilter) return false
      return true
    })
    const groups: Record<1 | 2 | 3, WritingPrompt[]> = { 1: [], 2: [], 3: [] }
    for (const p of filtered) groups[p.tache_level].push(p)
    return groups
  }, [prompts, levelFilter, topicFilter])

  return (
    <div
      className="ed-page-enter"
      style={{
        minHeight: '100dvh',
        backgroundColor: ED_BG,
        fontFamily: SANS,
      }}
    >
      <div style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(32px, 5vw, 56px) clamp(20px, 4vw, 40px) 96px' }}>
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
            {copy.pageTitle}
          </p>
          <h1
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(32px, 4.5vw, 48px)',
              lineHeight: 1.1,
              letterSpacing: '-0.015em',
              color: ED_FG,
              margin: 0,
              marginBottom: 12,
              maxWidth: 640,
            }}
          >
            {copy.pageSubtitle}
          </h1>
        </header>

        {/* Filter chips */}
        {prompts && prompts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            <FilterRow
              label={copy.levelFilters.all}
              options={[
                { value: 'all', label: copy.levelFilters.all },
                { value: 'B1', label: copy.levelFilters.B1 },
                { value: 'B2', label: copy.levelFilters.B2 },
              ]}
              value={levelFilter}
              onChange={(v) => setLevelFilter(v as LevelFilter)}
            />
            <FilterRow
              label={copy.topicFilterAll}
              options={[
                { value: 'all', label: copy.topicFilterAll },
                ...topics.map((t) => ({ value: t, label: t })),
              ]}
              value={topicFilter}
              onChange={(v) => setTopicFilter(v)}
            />
          </div>
        )}

        {/* States */}
        {error ? (
          <ErrorRetry message={error} retryLabel={copy.retry} onRetry={() => setRetryKey((k) => k + 1)} />
        ) : prompts === null ? (
          <LoadingSkeleton />
        ) : grouped === null || (grouped[1].length + grouped[2].length + grouped[3].length === 0) ? (
          <EmptyState message={copy.empty} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {([1, 2, 3] as const).map((tache) => {
              const items = grouped[tache]
              if (items.length === 0) return null
              return (
                <section key={tache} aria-label={copy.sectionLabels[tache]}>
                  <h2
                    style={{
                      fontFamily: SERIF,
                      fontStyle: 'italic',
                      fontWeight: 400,
                      fontSize: 'clamp(22px, 2.6vw, 28px)',
                      letterSpacing: '-0.01em',
                      color: 'var(--ed-warm-espresso)',
                      margin: 0,
                      marginBottom: 16,
                    }}
                  >
                    {copy.sectionLabels[tache]}
                  </h2>
                  <div
                    style={{
                      display: 'grid',
                      gap: 12,
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    }}
                  >
                    {items.map((p) => (
                      <PromptCard
                        key={p.id}
                        prompt={p}
                        minutesLabel={copy.minutes}
                        wordsLabel={copy.words}
                      />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────

interface FilterRowProps {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

function FilterRow({ options, value, onChange }: FilterRowProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="ed-btn-press"
            style={{
              fontFamily: SANS,
              fontWeight: 500,
              fontSize: 13,
              padding: '6px 14px',
              borderRadius: 999,
              border: `1px solid ${active ? 'var(--ed-warm-peach-deep)' : ED_RULE}`,
              backgroundColor: active ? 'var(--ed-warm-peach)' : 'transparent',
              color: active ? ED_FG : ED_FG_SOFT,
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'background-color var(--ed-duration-hover) var(--ease-spring), border-color var(--ed-duration-hover) var(--ease-spring), color var(--ed-duration-hover) var(--ease-spring)',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function PromptCard({
  prompt,
  minutesLabel,
  wordsLabel,
}: {
  prompt: WritingPrompt
  minutesLabel: string
  wordsLabel: string
}) {
  return (
    <Link
      href={`/writing/${prompt.id}`}
      className="ed-card-lift"
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: ED_PAPER,
        border: `1px solid ${ED_RULE}`,
        borderRadius: 4,
        padding: 'clamp(20px, 2.5vw, 28px)',
        textDecoration: 'none',
        color: 'inherit',
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--ed-warm-peach-deep)',
          }}
        >
          {prompt.level}
        </span>
        <span
          style={{
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: 11,
            color: ED_MUTED,
            padding: '2px 8px',
            borderRadius: 999,
            backgroundColor: 'var(--ed-warm-cream)',
          }}
        >
          {prompt.topic_tag}
        </span>
      </div>
      <h3
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 16,
          lineHeight: 1.35,
          color: ED_FG,
          margin: 0,
          marginBottom: 14,
          flex: 1,
        }}
      >
        {prompt.title_fr}
      </h3>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontFamily: SANS,
          fontSize: 12,
          color: ED_MUTED,
          fontWeight: 500,
        }}
      >
        <span>
          {prompt.time_limit_min} {minutesLabel}
        </span>
        <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: ED_MUTED }} />
        <span>
          {prompt.min_words}–{prompt.max_words} {wordsLabel}
        </span>
      </div>
    </Link>
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="ed-skeleton" style={{ height: 28, width: 120, borderRadius: 4 }} />
          <div
            style={{
              display: 'grid',
              gap: 12,
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            }}
          >
            {[0, 1, 2].map((j) => (
              <div key={j} className="ed-skeleton" style={{ height: 140, borderRadius: 4 }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: '48px 16px',
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 14,
        color: ED_MUTED,
        fontWeight: 500,
      }}
    >
      {message}
    </div>
  )
}

function ErrorRetry({
  message,
  retryLabel,
  onRetry,
}: {
  message: string
  retryLabel: string
  onRetry: () => void
}) {
  return (
    <div
      role="alert"
      style={{ padding: '32px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
    >
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
