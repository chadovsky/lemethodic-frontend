'use client'

// F-VISUAL-001 X.4.3 — flashcard 3D flip motion added to FlashcardView
// below. perspective wrapper + transform-style: preserve-3d on the card
// + backfaceVisibility: hidden on each face. Framer Motion animates
// rotateY 0 -> 180 on reveal; useReducedMotion swaps to opacity cross-
// fade for users with the OS preference set. iOS Safari has known
// transform-style: preserve-3d quirks on older versions; Chadi runbook
// includes an explicit iOS Safari test per C4 (real device or
// BrowserStack).

// F-322 — Le Vocabulaire practice client.
//
// State machine has three view states (config / session / end) on top
// of TQ status. Pre-mount fetch warms the chunks; once resolved we
// either land on config (success), tier-locked (BE 403 tier_insufficient),
// error (other failure), or empty (zero chunks).
//
// Tier-lock screen capture: in dev only, ?devLock=tier forces the
// tier-locked view regardless of TQ state. This is the F-225 screenshot
// path for the locked-card, gated behind NODE_ENV !== 'production' so
// it can never leak into prod. F-311 supersedes when shipped (the live
// tier read will gate before BE even responds).

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { duration, ease } from '@/lib/motion'
import { api, isTierInsufficientError } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import { vocabCopy } from '@/lib/vocab-copy'
import {
  readDirectionPref,
  writeDirectionPref,
  recordGrade,
  type PracticeDirection,
  type PracticeGrade,
} from '@/lib/practice-state'
import type { VocabularyChunk } from '@/lib/types'

const PAGE_LIMIT = 20

type SessionLength = 10 | 20 | 'all'
type View = 'config' | 'session' | 'end'

interface GradeResult {
  chunkId: number
  grade: PracticeGrade
}

export default function PracticeClient({ slug }: { slug: string }) {
  const user = useAuthStore((s) => s.user)
  const copy = vocabCopy(user?.interfaceLanguage)
  const router = useRouter()
  const params = useSearchParams()

  // F-225 screenshot path. Wrapped in process.env.NODE_ENV check so the
  // flag is dead code in production; F-311 supersedes this once the
  // live tier-read lands.
  const devLockOn =
    process.env.NODE_ENV !== 'production' && params.get('devLock') === 'tier'

  const initialDirection = useMemo<PracticeDirection>(() => {
    const url = params.get('direction')
    if (url === 'fr' || url === 'en') return url
    const pref = readDirectionPref()
    if (pref) return pref
    return 'fr'
  }, [params])

  const [view, setView] = useState<View>('config')
  const [direction, setDirection] = useState<PracticeDirection>(initialDirection)
  const [sessionLength, setSessionLength] = useState<SessionLength>(20)
  const [sessionChunks, setSessionChunks] = useState<VocabularyChunk[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [results, setResults] = useState<GradeResult[]>([])

  // Reuse F-325's query-key family with an empty filter segment — practice
  // never filters by user-applied cefr_level / exam_tag / register, so
  // the cache is shared with browse only when browse had no filters
  // active. Different filter set = different cache entry; no collision.
  const chunksQuery = useQuery({
    queryKey: ['vocab', 'chunks', slug, ''],
    queryFn: () => api.vocab.listChunks(slug, { limit: PAGE_LIMIT, offset: 0 }),
    enabled: !devLockOn, // skip the fetch entirely under dev-lock
  })

  const isTierLocked =
    devLockOn || (chunksQuery.error && isTierInsufficientError(chunksQuery.error))
  const isOtherError =
    !devLockOn &&
    chunksQuery.error != null &&
    !isTierInsufficientError(chunksQuery.error)
  const isEmpty =
    !devLockOn &&
    !chunksQuery.isLoading &&
    !chunksQuery.error &&
    (chunksQuery.data?.chunks.length ?? 0) === 0

  // Persist direction choice on change.
  useEffect(() => {
    writeDirectionPref(direction)
  }, [direction])

  const handleStart = useCallback(() => {
    const all = chunksQuery.data?.chunks ?? []
    const shuffled = shuffle(all)
    const limit = sessionLength === 'all' ? shuffled.length : Math.min(sessionLength, shuffled.length)
    setSessionChunks(shuffled.slice(0, limit))
    setCurrentIndex(0)
    setRevealed(false)
    setResults([])
    setView('session')
  }, [chunksQuery.data, sessionLength])

  const handleGrade = useCallback(
    (grade: PracticeGrade) => {
      const current = sessionChunks[currentIndex]
      if (!current) return
      recordGrade(current.id, grade)
      const nextResults = [...results, { chunkId: current.id, grade }]
      setResults(nextResults)
      if (currentIndex + 1 >= sessionChunks.length) {
        setView('end')
      } else {
        setCurrentIndex(currentIndex + 1)
        setRevealed(false)
      }
    },
    [currentIndex, results, sessionChunks],
  )

  const handleRestart = useCallback(() => {
    setView('config')
    setSessionChunks([])
    setResults([])
    setCurrentIndex(0)
    setRevealed(false)
  }, [])

  return (
    <main
      className="min-h-screen w-full ed-page-enter"
      style={{ backgroundColor: 'var(--lm-bg-base)' }}
    >
      <div className="mx-auto max-w-2xl px-5 md:px-8 py-10 md:py-14 lg:py-16">
        <Link
          href={`/la-bibliotheque/${encodeURIComponent(slug)}`}
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

        {isTierLocked ? (
          <TierLockedCard copy={copy} devLock={devLockOn} onCta={() => router.push('/paywall')} />
        ) : isOtherError ? (
          <ErrorCard copy={copy} onRetry={() => chunksQuery.refetch()} />
        ) : chunksQuery.isLoading ? (
          <PracticeSkeleton />
        ) : isEmpty ? (
          <EmptyCard copy={copy} />
        ) : view === 'config' ? (
          <SessionConfigCard
            copy={copy}
            direction={direction}
            sessionLength={sessionLength}
            chunkCount={chunksQuery.data?.chunks.length ?? 0}
            onDirectionChange={setDirection}
            onSessionLengthChange={setSessionLength}
            onStart={handleStart}
          />
        ) : view === 'session' ? (
          <FlashcardView
            copy={copy}
            chunk={sessionChunks[currentIndex]}
            i={currentIndex + 1}
            n={sessionChunks.length}
            direction={direction}
            revealed={revealed}
            onReveal={() => setRevealed(true)}
            onGrade={handleGrade}
          />
        ) : (
          <SessionEndCard
            copy={copy}
            results={results}
            slug={slug}
            onPracticeAgain={handleRestart}
          />
        )}
      </div>
    </main>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────

function SessionConfigCard({
  copy,
  direction,
  sessionLength,
  chunkCount,
  onDirectionChange,
  onSessionLengthChange,
  onStart,
}: {
  copy: ReturnType<typeof vocabCopy>
  direction: PracticeDirection
  sessionLength: SessionLength
  chunkCount: number
  onDirectionChange: (d: PracticeDirection) => void
  onSessionLengthChange: (l: SessionLength) => void
  onStart: () => void
}) {
  const lengths: SessionLength[] = [10, 20, 'all']
  return (
    <div
      style={{
        backgroundColor: 'var(--lm-bg-surface)',
        border: '1px solid var(--lm-border-subtle)',
        borderRadius: 4,
        padding: 'clamp(28px, 4vw, 44px)',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-source-serif), Georgia, serif',
          fontWeight: 400,
          fontSize: 'clamp(28px, 3.6vw, 36px)',
          lineHeight: 1.15,
          letterSpacing: '-0.015em',
          color: 'var(--lm-text-primary)',
          margin: 0,
          marginBottom: 12,
        }}
      >
        {copy.practice.configTitle}
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
          fontWeight: 400,
          fontSize: 15,
          lineHeight: 1.55,
          color: 'var(--lm-text-tertiary)',
          margin: 0,
          marginBottom: 24,
        }}
      >
        {copy.practice.configSubtitle}
      </p>

      <Field label={copy.practice.directionLabel}>
        <ToggleRow
          options={[
            { value: 'fr', label: copy.practice.directionFrLabel },
            { value: 'en', label: copy.practice.directionEnLabel },
          ]}
          active={direction}
          onChange={onDirectionChange}
        />
      </Field>

      <Field label={copy.practice.sessionLengthLabel}>
        <ToggleRow
          options={lengths.map((l) => ({
            value: l,
            label:
              l === 'all'
                ? copy.practice.sessionLengthAll
                : String(l),
          }))}
          active={sessionLength}
          onChange={onSessionLengthChange}
        />
      </Field>

      <button
        type="button"
        onClick={onStart}
        disabled={chunkCount === 0}
        className="ed-btn-press"
        style={{
          marginTop: 8,
          width: '100%',
          height: 52,
          borderRadius: 4,
          border: 'none',
          backgroundColor: chunkCount === 0 ? 'var(--lm-border-subtle)' : 'var(--cta-utility)',
          color: chunkCount === 0 ? 'var(--lm-text-tertiary)' : '#FFFFFF',
          fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: '0.01em',
          cursor: chunkCount === 0 ? 'not-allowed' : 'pointer',
        }}
      >
        {copy.practice.startSession}
      </button>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div
        className="text-[12px] uppercase tracking-[0.12em] font-semibold mb-2"
        style={{ color: 'var(--lm-text-tertiary)' }}
      >
        {label}
      </div>
      {children}
    </div>
  )
}

function ToggleRow<T extends string | number>({
  options,
  active,
  onChange,
}: {
  options: { value: T; label: string }[]
  active: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = opt.value === active
        return (
          <button
            key={String(opt.value)}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(opt.value)}
            className="ed-btn-press"
            style={{
              height: 38,
              padding: '0 14px',
              borderRadius: 4,
              border: '1px solid var(--lm-border-subtle)',
              backgroundColor: isActive ? 'var(--cta-utility)' : 'var(--lm-bg-surface)',
              color: isActive ? '#FFFFFF' : 'var(--lm-text-primary)',
              fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
              fontWeight: 500,
              fontSize: 13,
              letterSpacing: '0.01em',
              cursor: 'pointer',
              transition:
                'background-color var(--lm-duration-hover) var(--lm-ease), color var(--lm-duration-hover) var(--lm-ease)',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function FlashcardView({
  copy,
  chunk,
  i,
  n,
  direction,
  revealed,
  onReveal,
  onGrade,
}: {
  copy: ReturnType<typeof vocabCopy>
  chunk: VocabularyChunk | undefined
  i: number
  n: number
  direction: PracticeDirection
  revealed: boolean
  onReveal: () => void
  onGrade: (g: PracticeGrade) => void
}) {
  if (!chunk) return null

  const front = direction === 'fr' ? chunk.chunkFr : chunk.translationEn
  const back = direction === 'fr' ? chunk.translationEn : chunk.chunkFr

  return (
    <div className="flex flex-col gap-6">
      <div
        className="text-[12px] uppercase tracking-[0.12em] font-semibold text-center"
        style={{ color: 'var(--lm-text-tertiary)' }}
      >
        {copy.practice.progressLabel(i, n)}
      </div>

      <Flashcard3D front={front} back={back} revealed={revealed} />

      {!revealed ? (
        <button
          type="button"
          onClick={onReveal}
          className="ed-btn-press"
          style={{
            width: '100%',
            height: 52,
            borderRadius: 4,
            border: 'none',
            backgroundColor: 'var(--cta-utility)',
            color: '#FFFFFF',
            fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          {copy.practice.reveal}
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onGrade('fail')}
            className="ed-btn-press"
            style={{
              height: 52,
              borderRadius: 4,
              border: '1px solid var(--lm-border-subtle)',
              backgroundColor: 'var(--lm-bg-surface)',
              color: 'var(--lm-text-primary)',
              fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            {copy.practice.needReview}
          </button>
          <button
            type="button"
            onClick={() => onGrade('pass')}
            className="ed-btn-press"
            style={{
              height: 52,
              borderRadius: 4,
              border: 'none',
              backgroundColor: 'var(--cta-utility)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            {copy.practice.gotIt}
          </button>
        </div>
      )}
    </div>
  )
}

// F-VISUAL-001 X.4.3 — 3D card flip on reveal. perspective ancestor +
// transform-style: preserve-3d on the rotating layer + backface-
// visibility: hidden on each face. Framer Motion drives the rotateY
// transition; useReducedMotion swaps to a no-rotation opacity cross-
// fade so users with prefers-reduced-motion don't get the flip.
// iOS Safari: explicit real-device test in F-225 Batch 3 (per C4).
function Flashcard3D({
  front,
  back,
  revealed,
}: {
  front: string
  back: string
  revealed: boolean
}) {
  const reduce = useReducedMotion()
  if (reduce) {
    // Reduced-motion fallback: opacity cross-fade, no rotation.
    return (
      <FlashcardSurface>
        <p
          style={{
            ...flashcardFrontStyle,
            opacity: revealed ? 0.55 : 1,
            transition: 'opacity 250ms ease',
          }}
        >
          {front}
        </p>
        {revealed && (
          <p
            style={{
              ...flashcardBackStyle,
              paddingTop: 18,
              borderTop: '1px solid var(--lm-border-subtle)',
            }}
          >
            {back}
          </p>
        )}
      </FlashcardSurface>
    )
  }
  return (
    <div style={{ perspective: '1200px' }}>
      <motion.div
        animate={{ rotateY: revealed ? 180 : 0 }}
        transition={{ duration: duration.medium, ease: ease.spring }}
        style={{
          position: 'relative',
          minHeight: 220,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Front face */}
        <div
          style={{
            ...flashcardSurfaceStyle,
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <p style={flashcardFrontStyle}>{front}</p>
        </div>
        {/* Back face — pre-rotated 180deg so it appears when wrapper
            rotates to 180. */}
        <div
          style={{
            ...flashcardSurfaceStyle,
            position: 'absolute',
            inset: 0,
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <p style={flashcardBackStyle}>{back}</p>
        </div>
      </motion.div>
    </div>
  )
}

function FlashcardSurface({ children }: { children: React.ReactNode }) {
  return <div style={flashcardSurfaceStyle}>{children}</div>
}

const flashcardSurfaceStyle: React.CSSProperties = {
  backgroundColor: 'var(--lm-bg-surface)',
  border: '1px solid var(--lm-border-subtle)',
  borderRadius: 4,
  padding: 'clamp(32px, 4vw, 56px) clamp(24px, 3vw, 40px)',
  minHeight: 220,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'center',
}

const flashcardFrontStyle: React.CSSProperties = {
  fontFamily: 'var(--font-source-serif), Georgia, serif',
  fontWeight: 500,
  fontSize: 'clamp(22px, 3vw, 30px)',
  lineHeight: 1.3,
  color: 'var(--lm-text-primary)',
  margin: 0,
}

const flashcardBackStyle: React.CSSProperties = {
  fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
  fontWeight: 400,
  fontSize: 'clamp(15px, 1.6vw, 17px)',
  lineHeight: 1.5,
  color: 'var(--lm-text-tertiary)',
  margin: 0,
}

function SessionEndCard({
  copy,
  results,
  slug,
  onPracticeAgain,
}: {
  copy: ReturnType<typeof vocabCopy>
  results: GradeResult[]
  slug: string
  onPracticeAgain: () => void
}) {
  const total = results.length
  const got = results.filter((r) => r.grade === 'pass').length
  const fail = total - got
  return (
    <div
      style={{
        backgroundColor: 'var(--lm-bg-surface)',
        border: '1px solid var(--lm-border-subtle)',
        borderRadius: 4,
        padding: 'clamp(28px, 4vw, 48px)',
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-source-serif), Georgia, serif',
          fontWeight: 400,
          fontSize: 'clamp(26px, 3vw, 34px)',
          lineHeight: 1.15,
          color: 'var(--lm-text-primary)',
          margin: 0,
          marginBottom: 16,
        }}
      >
        {copy.practice.endTitle}
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
          fontWeight: 600,
          fontSize: 18,
          color: 'var(--lm-text-primary)',
          margin: 0,
          marginBottom: 6,
        }}
      >
        {copy.practice.endStat(got, total)}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
          fontWeight: 400,
          fontSize: 14,
          color: 'var(--lm-text-tertiary)',
          margin: 0,
          marginBottom: 24,
        }}
      >
        {copy.practice.endNeedReview(fail)}
      </p>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onPracticeAgain}
          className="ed-btn-press"
          style={{
            height: 48,
            borderRadius: 4,
            border: 'none',
            backgroundColor: 'var(--cta-utility)',
            color: '#FFFFFF',
            fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          {copy.practice.practiceAgain}
        </button>
        <Link
          href={`/la-bibliotheque/${encodeURIComponent(slug)}`}
          className="ed-btn-press"
          style={{
            height: 44,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
            border: '1px solid var(--lm-border-subtle)',
            backgroundColor: 'var(--lm-bg-surface)',
            color: 'var(--lm-text-primary)',
            fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          {copy.practice.backToTopic}
        </Link>
        <Link
          href="/la-bibliotheque"
          className="ed-btn-press"
          style={{
            height: 44,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
            border: '1px solid var(--lm-border-subtle)',
            backgroundColor: 'var(--lm-bg-surface)',
            color: 'var(--lm-text-primary)',
            fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          {copy.practice.browseCorpus}
        </Link>
      </div>
    </div>
  )
}

function TierLockedCard({
  copy,
  devLock,
  onCta,
}: {
  copy: ReturnType<typeof vocabCopy>
  devLock: boolean
  onCta: () => void
}) {
  return (
    <div
      style={{
        backgroundColor: 'var(--lm-bg-surface)',
        border: '1px solid var(--lm-border-subtle)',
        borderRadius: 4,
        padding: 'clamp(28px, 4vw, 48px)',
        textAlign: 'center',
      }}
    >
      {devLock && (
        <div
          style={{
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: 3,
            border: '1px dashed var(--lm-text-tertiary)',
            fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 11,
            color: 'var(--lm-text-tertiary)',
            letterSpacing: '0.08em',
            marginBottom: 16,
          }}
        >
          {copy.practice.devLockBadge}
        </div>
      )}
      <h2
        style={{
          fontFamily: 'var(--font-source-serif), Georgia, serif',
          fontWeight: 400,
          fontSize: 'clamp(24px, 2.8vw, 30px)',
          lineHeight: 1.15,
          color: 'var(--lm-text-primary)',
          margin: 0,
          marginBottom: 10,
        }}
      >
        {copy.locked.title}
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
          fontWeight: 400,
          fontSize: 15,
          lineHeight: 1.55,
          color: 'var(--lm-text-tertiary)',
          margin: 0,
          marginBottom: 22,
          maxWidth: 420,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {copy.locked.body}
      </p>
      <button
        type="button"
        onClick={onCta}
        className="ed-btn-press"
        style={{
          height: 48,
          padding: '0 24px',
          borderRadius: 4,
          border: 'none',
          backgroundColor: 'var(--cta-utility)',
          color: '#FFFFFF',
          fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
          fontWeight: 600,
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        {copy.locked.cta}
      </button>
    </div>
  )
}

function ErrorCard({
  copy,
  onRetry,
}: {
  copy: ReturnType<typeof vocabCopy>
  onRetry: () => void
}) {
  return (
    <div
      role="alert"
      style={{
        backgroundColor: 'var(--lm-bg-surface)',
        border: '1px solid var(--lm-border-subtle)',
        borderRadius: 4,
        padding: 'clamp(28px, 4vw, 44px)',
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-source-serif), Georgia, serif',
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
          marginBottom: 18,
        }}
      >
        {copy.error.body}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="ed-btn-press"
        style={{
          height: 44,
          padding: '0 20px',
          borderRadius: 4,
          border: 'none',
          backgroundColor: 'var(--cta-utility)',
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

function EmptyCard({ copy }: { copy: ReturnType<typeof vocabCopy> }) {
  return (
    <div
      role="status"
      style={{
        backgroundColor: 'var(--lm-bg-surface)',
        border: '1px solid var(--lm-border-subtle)',
        borderRadius: 4,
        padding: 'clamp(28px, 4vw, 48px)',
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-source-serif), Georgia, serif',
          fontWeight: 400,
          fontSize: 'clamp(22px, 2.4vw, 28px)',
          lineHeight: 1.15,
          color: 'var(--lm-text-primary)',
          margin: 0,
          marginBottom: 10,
        }}
      >
        {copy.practice.emptyTitle}
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
          fontWeight: 400,
          fontSize: 15,
          lineHeight: 1.55,
          color: 'var(--lm-text-tertiary)',
          margin: 0,
          maxWidth: 420,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {copy.practice.emptyBody}
      </p>
    </div>
  )
}

function PracticeSkeleton() {
  return (
    <div
      className="ed-skeleton"
      style={{
        backgroundColor: 'var(--lm-bg-surface)',
        border: '1px solid var(--lm-border-subtle)',
        borderRadius: 4,
        height: 260,
      }}
    />
  )
}

// Fisher-Yates shuffle. Returns a new array; original is untouched.
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
