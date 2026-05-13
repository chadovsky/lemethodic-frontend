'use client'

// F-VISUAL-001 X.3.4 — vocabulaire surface audit (catalog + topic
// detail + practice + test). All four surfaces consume var(--ed-*)
// throughout — X.1 alias chain redirects to the new canonical palette
// automatically. Only remaining hex literals are '#FFFFFF' button-
// text (universal contrast, kept). No source edits required.

// F-325 — Le Vocabulaire catalog client. Topic listing + corpus_partition
// filter chip group. Mobile-first with responsive grid on desktop. Auth
// is enforced by the wrapping ProtectedRoute in page.tsx; this component
// just calls api.vocab.listTopics through TanStack Query.
//
// Tier-gate (locked-card variant for free users on exam_tagged topics)
// arrives in Phase A5 via useUserTier; for now every topic renders
// unlocked. third_party_publisher_DO_NOT_EXTRACT is BE-filtered and
// invisible to FE (Decision D4) — no chip, no badge here.

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import { vocabCopy } from '@/lib/vocab-copy'
import { useUserTier } from '@/hooks/useUserTier'
import type { CorpusPartition, VocabularyTopic } from '@/lib/types'

// Chip-surfaced partitions only — the fourth (third_party_publisher_…)
// is invisible by design (BE Decision D4).
const SURFACED_PARTITIONS: CorpusPartition[] = [
  'CC_corpus',
  'chadi_authored',
  'book_lab',
]

export default function Catalog() {
  const user = useAuthStore((s) => s.user)
  const copy = vocabCopy(user?.interfaceLanguage)
  const { tier } = useUserTier()

  const [activePartitions, setActivePartitions] = useState<CorpusPartition[]>([])

  const stableKey = useMemo(
    () => [...activePartitions].sort().join('|'),
    [activePartitions],
  )

  const topicsQuery = useQuery({
    queryKey: ['vocab', 'topics', stableKey],
    queryFn: () =>
      api.vocab.listTopics({
        corpusPartition: activePartitions.length ? activePartitions : undefined,
      }),
  })

  function togglePartition(p: CorpusPartition) {
    setActivePartitions((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    )
  }

  return (
    <main
      className="min-h-screen w-full ed-page-enter"
      style={{ backgroundColor: 'var(--ed-bg)' }}
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8 lg:px-10 py-10 md:py-14 lg:py-16">
        <header className="mb-8 md:mb-10">
          <h1
            className="ed-hero-rise"
            style={{
              fontFamily: 'var(--font-fraunces), Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(36px, 5vw, 56px)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: 'var(--ed-fg)',
              margin: 0,
              marginBottom: 14,
            }}
          >
            {copy.catalog.title}
          </h1>
          <p
            className="ed-hero-rise ed-hero-rise-delay-1"
            style={{
              fontFamily: 'var(--font-switzer), -apple-system, system-ui, sans-serif',
              fontWeight: 400,
              fontSize: 'clamp(15px, 1.4vw, 17px)',
              lineHeight: 1.55,
              color: 'var(--ed-muted)',
              margin: 0,
              maxWidth: 640,
            }}
          >
            {copy.catalog.subtitle}
          </p>
        </header>

        <section
          aria-label={copy.catalog.filterLabel}
          className="mb-7 md:mb-9 ed-hero-rise ed-hero-rise-delay-2"
        >
          <div
            className="text-[12px] uppercase tracking-[0.12em] font-semibold mb-3"
            style={{ color: 'var(--ed-muted)' }}
          >
            {copy.catalog.filterLabel}
          </div>
          <div className="flex flex-wrap gap-2">
            {SURFACED_PARTITIONS.map((p) => (
              <PartitionChip
                key={p}
                active={activePartitions.includes(p)}
                label={copy.partition[p as 'CC_corpus' | 'chadi_authored' | 'book_lab']}
                onClick={() => togglePartition(p)}
              />
            ))}
          </div>
        </section>

        <section aria-label={copy.catalog.title} className="ed-hero-rise ed-hero-rise-delay-3">
          {topicsQuery.isLoading ? (
            <CatalogSkeleton />
          ) : topicsQuery.isError ? (
            <CatalogError onRetry={() => topicsQuery.refetch()} copy={copy} />
          ) : !topicsQuery.data || topicsQuery.data.length === 0 ? (
            <EmptyCorpusState copy={copy} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {topicsQuery.data.map((t) => {
                // F-325 A5 — locked-card surfaces when (a) tier is
                // 'free' AND (b) topic is exam-tagged (exam_tags
                // non-empty). 'unknown' (default until F-311.fe ships)
                // falls through to unlocked so the surface degrades
                // gracefully.
                const isExamTagged = t.examTags.length > 0
                const locked = tier === 'free' && isExamTagged
                return locked ? (
                  <TopicCardLocked key={t.slug} topic={t} copy={copy} />
                ) : (
                  <TopicCard key={t.slug} topic={t} copy={copy} />
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function PartitionChip({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="ed-btn-press"
      style={{
        height: 36,
        padding: '0 14px',
        borderRadius: 4,
        border: '1px solid var(--ed-rule)',
        backgroundColor: active ? 'var(--ed-accent)' : 'var(--ed-paper)',
        color: active ? '#FFFFFF' : 'var(--ed-fg)',
        fontFamily: 'var(--font-switzer), -apple-system, system-ui, sans-serif',
        fontWeight: 500,
        fontSize: 13,
        letterSpacing: '0.01em',
        cursor: 'pointer',
        transition:
          'background-color var(--ed-duration-hover) var(--ed-ease), color var(--ed-duration-hover) var(--ed-ease)',
      }}
    >
      {label}
    </button>
  )
}

function TopicCard({
  topic,
  copy,
}: {
  topic: VocabularyTopic
  copy: ReturnType<typeof vocabCopy>
}) {
  const range = copy.topic.cefrRangeLabel(topic.cefrRange.min, topic.cefrRange.max)
  return (
    <Link
      href={`/vocabulaire/${encodeURIComponent(topic.slug)}`}
      className="ed-card-lift ed-btn-press block"
      style={{
        backgroundColor: 'var(--ed-paper)',
        border: '1px solid var(--ed-rule)',
        borderRadius: 4,
        padding: '20px 22px',
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
      }}
    >
      <div
        className="text-[12px] uppercase tracking-[0.12em] font-semibold mb-2"
        style={{ color: 'var(--ed-muted)' }}
      >
        {copy.topic.chunkCountLabel(topic.chunkCount)} · {range}
      </div>
      <h2
        style={{
          fontFamily: 'var(--font-fraunces), Georgia, serif',
          fontWeight: 500,
          fontSize: 'clamp(20px, 1.8vw, 24px)',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          color: 'var(--ed-fg)',
          margin: 0,
          marginBottom: 10,
        }}
      >
        {topic.title}
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-switzer), -apple-system, system-ui, sans-serif',
          fontWeight: 400,
          fontSize: 13,
          lineHeight: 1.5,
          color: 'var(--ed-muted)',
          margin: 0,
          marginBottom: 12,
        }}
      >
        {copy.topic.sourcePrefix}
        {topic.source}
      </p>
      {topic.examTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topic.examTags.map((t) => (
            <span
              key={t}
              style={{
                height: 22,
                padding: '0 8px',
                borderRadius: 3,
                border: '1px solid var(--ed-rule)',
                backgroundColor: 'var(--ed-bg)',
                color: 'var(--ed-fg)',
                fontFamily: 'var(--font-switzer), -apple-system, system-ui, sans-serif',
                fontWeight: 600,
                fontSize: 11,
                letterSpacing: '0.04em',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}

function TopicCardLocked({
  topic,
  copy,
}: {
  topic: VocabularyTopic
  copy: ReturnType<typeof vocabCopy>
}) {
  const router = useRouter()
  const range = copy.topic.cefrRangeLabel(topic.cefrRange.min, topic.cefrRange.max)
  return (
    <div
      className="ed-card-lift"
      style={{
        backgroundColor: 'var(--ed-paper)',
        border: '1px solid var(--ed-rule)',
        borderRadius: 4,
        padding: '20px 22px',
        position: 'relative',
      }}
    >
      <div
        className="text-[12px] uppercase tracking-[0.12em] font-semibold mb-2"
        style={{ color: 'var(--ed-muted)' }}
      >
        {copy.topic.chunkCountLabel(topic.chunkCount)} · {range}
      </div>
      <h2
        style={{
          fontFamily: 'var(--font-fraunces), Georgia, serif',
          fontWeight: 500,
          fontSize: 'clamp(20px, 1.8vw, 24px)',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          color: 'var(--ed-fg)',
          margin: 0,
          marginBottom: 8,
        }}
      >
        {topic.title}
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-switzer), -apple-system, system-ui, sans-serif',
          fontWeight: 500,
          fontSize: 13,
          lineHeight: 1.5,
          color: 'var(--ed-fg)',
          margin: 0,
          marginBottom: 4,
        }}
      >
        {copy.locked.title}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-switzer), -apple-system, system-ui, sans-serif',
          fontWeight: 400,
          fontSize: 13,
          lineHeight: 1.5,
          color: 'var(--ed-muted)',
          margin: 0,
          marginBottom: 14,
        }}
      >
        {copy.locked.body}
      </p>
      <button
        type="button"
        onClick={() => router.push('/paywall')}
        className="ed-btn-press"
        style={{
          height: 40,
          padding: '0 18px',
          borderRadius: 4,
          border: 'none',
          backgroundColor: 'var(--ed-accent)',
          color: '#FFFFFF',
          fontFamily: 'var(--font-switzer), -apple-system, system-ui, sans-serif',
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        {copy.locked.cta}
      </button>
    </div>
  )
}

function EmptyCorpusState({ copy }: { copy: ReturnType<typeof vocabCopy> }) {
  return (
    <div
      role="status"
      style={{
        backgroundColor: 'var(--ed-paper)',
        border: '1px solid var(--ed-rule)',
        borderRadius: 4,
        padding: 'clamp(32px, 4vw, 56px)',
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-fraunces), Georgia, serif',
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 'clamp(24px, 2.6vw, 30px)',
          lineHeight: 1.15,
          letterSpacing: '-0.015em',
          color: 'var(--ed-fg)',
          margin: 0,
          marginBottom: 12,
        }}
      >
        {copy.empty.corpusTitle}
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-switzer), -apple-system, system-ui, sans-serif',
          fontWeight: 400,
          fontSize: 15,
          lineHeight: 1.55,
          color: 'var(--ed-muted)',
          margin: 0,
          maxWidth: 480,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {copy.empty.corpusBody}
      </p>
    </div>
  )
}

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="ed-skeleton"
          style={{
            backgroundColor: 'var(--ed-paper)',
            border: '1px solid var(--ed-rule)',
            borderRadius: 4,
            height: 160,
          }}
        />
      ))}
    </div>
  )
}

function CatalogError({
  onRetry,
  copy,
}: {
  onRetry: () => void
  copy: ReturnType<typeof vocabCopy>
}) {
  return (
    <div
      role="alert"
      style={{
        backgroundColor: 'var(--ed-paper)',
        border: '1px solid var(--ed-rule)',
        borderRadius: 4,
        padding: 'clamp(28px, 3vw, 40px)',
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-fraunces), Georgia, serif',
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 'clamp(20px, 2vw, 24px)',
          color: 'var(--ed-fg)',
          margin: 0,
          marginBottom: 8,
        }}
      >
        {copy.error.title}
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-switzer), -apple-system, system-ui, sans-serif',
          fontSize: 14,
          color: 'var(--ed-muted)',
          margin: 0,
          marginBottom: 16,
        }}
      >
        {copy.error.body}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="ed-btn-press"
        style={{
          height: 40,
          padding: '0 18px',
          borderRadius: 4,
          border: 'none',
          backgroundColor: 'var(--ed-accent)',
          color: '#FFFFFF',
          fontFamily: 'var(--font-switzer), -apple-system, system-ui, sans-serif',
          fontWeight: 600,
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        {copy.error.retry}
      </button>
    </div>
  )
}
