'use client'

// F-325 — Le Vocabulaire topic detail (chunk list). Three filter chip
// groups (cefr_level / exam_tag / register), offset-based pagination via
// useInfiniteQuery (per BE F-325 contract — NOT cursor). All chip groups
// are multi-select; an empty selection means "all values pass."

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useInfiniteQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import { vocabCopy } from '@/lib/vocab-copy'
import type { CefrLevel, ExamTag, Register, VocabularyChunk } from '@/lib/types'

const CEFR_VALUES: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const EXAM_VALUES: ExamTag[] = ['TCF', 'DELF', 'TEF']
const REGISTER_VALUES: Register[] = ['familier', 'standard', 'soutenu']
const PAGE_LIMIT = 20

export default function TopicDetail({ slug }: { slug: string }) {
  const user = useAuthStore((s) => s.user)
  const copy = vocabCopy(user?.interfaceLanguage)

  const [cefrFilters, setCefrFilters] = useState<CefrLevel[]>([])
  const [examFilters, setExamFilters] = useState<ExamTag[]>([])
  const [registerFilters, setRegisterFilters] = useState<Register[]>([])

  const stableKey = useMemo(
    () =>
      [
        [...cefrFilters].sort().join(','),
        [...examFilters].sort().join(','),
        [...registerFilters].sort().join(','),
      ].join('|'),
    [cefrFilters, examFilters, registerFilters],
  )

  const chunksQuery = useInfiniteQuery({
    queryKey: ['vocab', 'chunks', slug, stableKey],
    queryFn: ({ pageParam = 0 }) =>
      api.vocab.listChunks(slug, {
        cefrLevel: cefrFilters.length ? cefrFilters : undefined,
        examTag: examFilters.length ? examFilters : undefined,
        register: registerFilters.length ? registerFilters : undefined,
        offset: pageParam as number,
        limit: PAGE_LIMIT,
      }),
    initialPageParam: 0,
    getNextPageParam: (last) => {
      const consumed = last.offset + last.limit
      return consumed < last.total ? consumed : undefined
    },
  })

  const allChunks: VocabularyChunk[] = useMemo(
    () => (chunksQuery.data?.pages ?? []).flatMap((p) => p.chunks),
    [chunksQuery.data],
  )
  const total = chunksQuery.data?.pages[0]?.total ?? 0
  const filtersActive =
    cefrFilters.length + examFilters.length + registerFilters.length > 0

  return (
    <main
      className="min-h-screen w-full ed-page-enter"
      style={{ backgroundColor: 'var(--lm-bg-base)' }}
    >
      <div className="mx-auto max-w-4xl px-5 md:px-8 lg:px-10 py-10 md:py-14 lg:py-16">
        <Link
          href="/la-bibliotheque"
          className="ed-btn-press inline-flex items-center gap-1.5 mb-6"
          style={{
            fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
            fontWeight: 500,
            fontSize: 13,
            color: 'var(--lm-text-tertiary)',
            textDecoration: 'none',
          }}
        >
          ← {copy.detail.backToCatalog}
        </Link>

        <header className="mb-7 md:mb-9 ed-hero-rise">
          <h1
            style={{
              fontFamily: 'var(--font-source-serif), Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(32px, 4vw, 44px)',
              lineHeight: 1.1,
              letterSpacing: '-0.015em',
              color: 'var(--lm-text-primary)',
              margin: 0,
              marginBottom: 8,
              wordBreak: 'break-word',
            }}
          >
            {/* The topic title isn't available until the chunks query
                runs (BE F-325 returns it on the first chunks page... or
                we'd need a separate /api/vocab/topics/{slug} endpoint).
                Until we know which path is canonical, render the slug
                as a humanized fallback so the header isn't empty.
                The chunk list itself is the primary content; the title
                refinement is filed as a follow-up if needed. */}
            {humanizeSlug(slug)}
          </h1>
          {!chunksQuery.isLoading && total > 0 && (
            <p
              style={{
                fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: 1.5,
                color: 'var(--lm-text-tertiary)',
                margin: 0,
              }}
            >
              {copy.topic.chunkCountLabel(total)}
            </p>
          )}
        </header>

        {/* F-322 / F-323 — primary entries into the practice and test
            surfaces. Only surfaced when there's actually something to
            practice/test (chunks loaded, count > 0). The practice button
            is the primary CTA (filled); the test button is secondary
            (outline). Both use ed-btn-press for the tap feedback. */}
        {!chunksQuery.isLoading && total > 0 && (
          <div className="mb-7 md:mb-9 ed-hero-rise ed-hero-rise-delay-1 flex flex-wrap gap-3">
            <Link
              href={`/la-bibliotheque/${encodeURIComponent(slug)}/practice`}
              className="ed-btn-press inline-flex items-center justify-center"
              style={{
                height: 48,
                padding: '0 22px',
                borderRadius: 4,
                border: 'none',
                backgroundColor: 'var(--cta-primary)',
                color: '#FFFFFF',
                fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: '0.01em',
                textDecoration: 'none',
              }}
            >
              {copy.practice.startCta}
            </Link>
            <Link
              href={`/la-bibliotheque/${encodeURIComponent(slug)}/test`}
              className="ed-btn-press inline-flex items-center justify-center"
              style={{
                height: 48,
                padding: '0 22px',
                borderRadius: 4,
                border: '1px solid var(--lm-border-subtle)',
                backgroundColor: 'var(--lm-bg-surface)',
                color: 'var(--lm-text-primary)',
                fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: '0.01em',
                textDecoration: 'none',
              }}
            >
              {copy.test.startCta}
            </Link>
          </div>
        )}

        <FilterRow
          label={copy.filters.cefrLevel}
          values={CEFR_VALUES}
          active={cefrFilters}
          onToggle={(v) =>
            setCefrFilters((p) =>
              p.includes(v as CefrLevel)
                ? p.filter((x) => x !== v)
                : [...p, v as CefrLevel],
            )
          }
        />
        <FilterRow
          label={copy.filters.examTag}
          values={EXAM_VALUES}
          active={examFilters}
          onToggle={(v) =>
            setExamFilters((p) =>
              p.includes(v as ExamTag)
                ? p.filter((x) => x !== v)
                : [...p, v as ExamTag],
            )
          }
        />
        <FilterRow
          label={copy.filters.register}
          values={REGISTER_VALUES}
          active={registerFilters}
          onToggle={(v) =>
            setRegisterFilters((p) =>
              p.includes(v as Register)
                ? p.filter((x) => x !== v)
                : [...p, v as Register],
            )
          }
        />

        <section aria-label="chunks" className="mt-2">
          {chunksQuery.isLoading ? (
            <ChunksSkeleton />
          ) : chunksQuery.isError ? (
            <ChunksError onRetry={() => chunksQuery.refetch()} copy={copy} />
          ) : allChunks.length === 0 ? (
            filtersActive ? (
              <EmptyFilteredState copy={copy} />
            ) : (
              <EmptyCorpusInTopicState copy={copy} />
            )
          ) : (
            <>
              <ul className="flex flex-col gap-3">
                {allChunks.map((c) => (
                  <ChunkRow key={c.id} chunk={c} copy={copy} />
                ))}
              </ul>
              {chunksQuery.hasNextPage && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => chunksQuery.fetchNextPage()}
                    disabled={chunksQuery.isFetchingNextPage}
                    className="ed-btn-press"
                    style={{
                      height: 44,
                      padding: '0 22px',
                      borderRadius: 4,
                      border: '1px solid var(--lm-border-subtle)',
                      backgroundColor: 'var(--lm-bg-surface)',
                      color: 'var(--lm-text-primary)',
                      fontFamily:
                        'var(--font-geist), -apple-system, system-ui, sans-serif',
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: chunksQuery.isFetchingNextPage ? 'wait' : 'pointer',
                    }}
                  >
                    {chunksQuery.isFetchingNextPage
                      ? copy.detail.loadingMore
                      : copy.detail.loadMore}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}

function humanizeSlug(slug: string): string {
  return slug
    .split('-')
    .map((s) => (s.length > 0 ? s[0].toUpperCase() + s.slice(1) : s))
    .join(' ')
}

function FilterRow<T extends string>({
  label,
  values,
  active,
  onToggle,
}: {
  label: string
  values: readonly T[]
  active: T[]
  onToggle: (v: T) => void
}) {
  return (
    <section aria-label={label} className="mb-4">
      <div
        className="text-[12px] uppercase tracking-[0.12em] font-semibold mb-2"
        style={{ color: 'var(--lm-text-tertiary)' }}
      >
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => {
          const isActive = active.includes(v)
          return (
            <button
              key={v}
              type="button"
              aria-pressed={isActive}
              onClick={() => onToggle(v)}
              className="ed-btn-press"
              style={{
                height: 32,
                padding: '0 12px',
                borderRadius: 4,
                border: '1px solid var(--lm-border-subtle)',
                backgroundColor: isActive ? 'var(--cta-primary)' : 'var(--lm-bg-surface)',
                color: isActive ? '#FFFFFF' : 'var(--lm-text-primary)',
                fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
                fontWeight: 500,
                fontSize: 12,
                letterSpacing: '0.01em',
                cursor: 'pointer',
                transition:
                  'background-color var(--lm-duration-hover) var(--lm-ease), color var(--lm-duration-hover) var(--lm-ease)',
              }}
            >
              {v}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function ChunkRow({
  chunk,
  copy,
}: {
  chunk: VocabularyChunk
  copy: ReturnType<typeof vocabCopy>
}) {
  return (
    <li
      style={{
        backgroundColor: 'var(--lm-bg-surface)',
        border: '1px solid var(--lm-border-subtle)',
        borderRadius: 4,
        padding: '16px 20px',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
          fontWeight: 500,
          fontSize: 16,
          lineHeight: 1.45,
          color: 'var(--lm-text-primary)',
          margin: 0,
          marginBottom: 6,
        }}
      >
        {chunk.chunkFr}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
          fontWeight: 400,
          fontSize: 14,
          lineHeight: 1.5,
          color: 'var(--lm-text-tertiary)',
          margin: 0,
          marginBottom: 10,
        }}
      >
        {chunk.translationEn}
      </p>
      <div className="flex flex-wrap gap-1.5">
        <ChunkChip label={chunk.cefrLevel} />
        {chunk.examTag ? (
          <ChunkChip label={chunk.examTag} />
        ) : (
          <ChunkChip label={copy.filters.none} muted />
        )}
        <ChunkChip label={chunk.register} />
      </div>
    </li>
  )
}

function ChunkChip({ label, muted }: { label: string; muted?: boolean }) {
  return (
    <span
      style={{
        height: 22,
        padding: '0 8px',
        borderRadius: 3,
        border: '1px solid var(--lm-border-subtle)',
        backgroundColor: 'var(--lm-bg-base)',
        color: muted ? 'var(--lm-text-tertiary)' : 'var(--lm-text-primary)',
        fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
        fontWeight: 600,
        fontSize: 11,
        letterSpacing: '0.04em',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {label}
    </span>
  )
}

function ChunksSkeleton() {
  return (
    <ul className="flex flex-col gap-3">
      {[0, 1, 2, 3, 4].map((i) => (
        <li
          key={i}
          className="ed-skeleton"
          style={{
            backgroundColor: 'var(--lm-bg-surface)',
            border: '1px solid var(--lm-border-subtle)',
            borderRadius: 4,
            height: 100,
          }}
        />
      ))}
    </ul>
  )
}

function EmptyFilteredState({ copy }: { copy: ReturnType<typeof vocabCopy> }) {
  return (
    <EmptyCard title={copy.empty.topicFilteredTitle} body={copy.empty.topicFilteredBody} />
  )
}

function EmptyCorpusInTopicState({ copy }: { copy: ReturnType<typeof vocabCopy> }) {
  return <EmptyCard title={copy.empty.corpusTitle} body={copy.empty.corpusBody} />
}

function EmptyCard({ title, body }: { title: string; body: string }) {
  return (
    <div
      role="status"
      style={{
        backgroundColor: 'var(--lm-bg-surface)',
        border: '1px solid var(--lm-border-subtle)',
        borderRadius: 4,
        padding: 'clamp(28px, 3vw, 48px)',
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-source-serif), Georgia, serif',
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 'clamp(22px, 2.4vw, 28px)',
          lineHeight: 1.15,
          color: 'var(--lm-text-primary)',
          margin: 0,
          marginBottom: 10,
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
          fontWeight: 400,
          fontSize: 15,
          lineHeight: 1.55,
          color: 'var(--lm-text-tertiary)',
          margin: 0,
          maxWidth: 460,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {body}
      </p>
    </div>
  )
}

function ChunksError({
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
        backgroundColor: 'var(--lm-bg-surface)',
        border: '1px solid var(--lm-border-subtle)',
        borderRadius: 4,
        padding: 'clamp(24px, 3vw, 36px)',
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-source-serif), Georgia, serif',
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 22,
          color: 'var(--lm-text-primary)',
          margin: 0,
          marginBottom: 8,
        }}
      >
        {copy.error.title}
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
          fontSize: 14,
          color: 'var(--lm-text-tertiary)',
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
          backgroundColor: 'var(--cta-primary)',
          color: '#FFFFFF',
          fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
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
