'use client'

// F-323 — Le Vocabulaire test client.
//
// Single-select exercise type per session. Walks the chosen exercise
// type across N chunks (N = session length, default 20). Matching mode
// chunks chunks into blocks of 5 and grades each chunk independently.
//
// Auto-grading replaces F-322's self-grade. Per-question feedback shows
// the correct answer when the user picks/types wrong. All grades persist
// to the same lemethodic_vocab_practice_state key as F-322 so V2 SRS
// reads one unified history.
//
// Tier-lock + ?devLock=tier capture flag + i18n + protected route are
// all mirrored from F-322 PracticeClient.

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api, isTierInsufficientError } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import { vocabCopy } from '@/lib/vocab-copy'
import {
  readDirectionPref,
  writeDirectionPref,
  recordGrade,
  type PracticeDirection,
} from '@/lib/practice-state'
import {
  buildMCQ,
  buildDropdown,
  buildExact,
  buildMatchingBlock,
  gradeExact,
  gradeMatching,
  shuffle,
  type MCQQuestion,
  type DropdownQuestion,
  type ExactQuestion,
  type MatchingBlock,
} from '@/lib/test-engine'
import type { VocabularyChunk } from '@/lib/types'

const PAGE_LIMIT = 20
const TEST_MIN_CHUNKS = 4         // BACKLOG F-323 — below this, surface soft-empty
const MATCHING_BLOCK_SIZE = 5

type SessionLength = 10 | 20 | 'all'
type ExerciseType = 'mcq' | 'dropdown' | 'exact' | 'matching'
type View = 'config' | 'session' | 'end'

type Question =
  | { kind: 'mcq'; data: MCQQuestion }
  | { kind: 'dropdown'; data: DropdownQuestion }
  | { kind: 'exact'; data: ExactQuestion }
  | { kind: 'matching'; data: MatchingBlock }

export default function TestClient({ slug }: { slug: string }) {
  const user = useAuthStore((s) => s.user)
  const copy = vocabCopy(user?.interfaceLanguage)
  const router = useRouter()
  const params = useSearchParams()

  // F-225 screenshot path; dead code in production builds.
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
  const [exerciseType, setExerciseType] = useState<ExerciseType>('mcq')
  const [direction, setDirection] = useState<PracticeDirection>(initialDirection)
  const [sessionLength, setSessionLength] = useState<SessionLength>(20)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<Record<number, 'pass' | 'fail'>>({})

  // Same TQ key family as F-325 catalog + F-322 practice (empty filter
  // segment). Browse-with-no-filters / practice / test all share cache.
  const chunksQuery = useQuery({
    queryKey: ['vocab', 'chunks', slug, ''],
    queryFn: () => api.vocab.listChunks(slug, { limit: PAGE_LIMIT, offset: 0 }),
    enabled: !devLockOn,
  })

  const chunkCount = chunksQuery.data?.chunks.length ?? 0
  const isTierLocked =
    devLockOn ||
    (chunksQuery.error != null && isTierInsufficientError(chunksQuery.error))
  const isOtherError =
    !devLockOn &&
    chunksQuery.error != null &&
    !isTierInsufficientError(chunksQuery.error)
  const isEmpty =
    !devLockOn &&
    !chunksQuery.isLoading &&
    !chunksQuery.error &&
    chunkCount === 0
  const isSoftEmpty =
    !devLockOn &&
    !chunksQuery.isLoading &&
    !chunksQuery.error &&
    chunkCount > 0 &&
    chunkCount < TEST_MIN_CHUNKS

  useEffect(() => {
    writeDirectionPref(direction)
  }, [direction])

  const handleStart = useCallback(() => {
    const all = chunksQuery.data?.chunks ?? []
    if (all.length < TEST_MIN_CHUNKS) return
    const shuffled = shuffle(all)
    const limit =
      sessionLength === 'all'
        ? shuffled.length
        : Math.min(sessionLength, shuffled.length)
    const picked = shuffled.slice(0, limit)
    const built = buildQuestions(picked, exerciseType, direction)
    setQuestions(built)
    setCurrentIndex(0)
    setResults({})
    setView('session')
  }, [chunksQuery.data, sessionLength, exerciseType, direction])

  const handleGradeOne = useCallback(
    (chunkId: number, grade: 'pass' | 'fail') => {
      recordGrade(chunkId, grade)
      setResults((prev) => ({ ...prev, [chunkId]: grade }))
    },
    [],
  )

  const handleGradeBlock = useCallback(
    (gradesByChunkId: Record<number, 'pass' | 'fail'>) => {
      for (const [chunkId, grade] of Object.entries(gradesByChunkId)) {
        recordGrade(Number(chunkId), grade)
      }
      setResults((prev) => ({ ...prev, ...gradesByChunkId }))
    },
    [],
  )

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setView('end')
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }, [currentIndex, questions.length])

  const handleRestart = useCallback(() => {
    setView('config')
    setQuestions([])
    setCurrentIndex(0)
    setResults({})
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
          <TestSkeleton />
        ) : isEmpty ? (
          <EmptyCard copy={copy} />
        ) : isSoftEmpty ? (
          <SoftEmptyCard copy={copy} slug={slug} />
        ) : view === 'config' ? (
          <SessionConfigCard
            copy={copy}
            direction={direction}
            sessionLength={sessionLength}
            exerciseType={exerciseType}
            chunkCount={chunkCount}
            onDirectionChange={setDirection}
            onSessionLengthChange={setSessionLength}
            onExerciseTypeChange={setExerciseType}
            onStart={handleStart}
          />
        ) : view === 'session' ? (
          <QuestionView
            copy={copy}
            question={questions[currentIndex]}
            i={currentIndex + 1}
            n={questions.length}
            onGradeOne={handleGradeOne}
            onGradeBlock={handleGradeBlock}
            onNext={handleNext}
          />
        ) : (
          <TestEndCard
            copy={copy}
            results={results}
            slug={slug}
            onTestAgain={handleRestart}
          />
        )}
      </div>
    </main>
  )
}

// ── Question generation ──────────────────────────────────────────────────

function buildQuestions(
  chunks: VocabularyChunk[],
  type: ExerciseType,
  direction: PracticeDirection,
): Question[] {
  if (type === 'matching') {
    const out: Question[] = []
    for (let i = 0; i < chunks.length; i += MATCHING_BLOCK_SIZE) {
      const block = chunks.slice(i, i + MATCHING_BLOCK_SIZE)
      if (block.length < 2) break // a block of 1 isn't a meaningful match
      out.push({ kind: 'matching', data: buildMatchingBlock(block) })
    }
    return out
  }
  return chunks.map((chunk) => {
    if (type === 'mcq') return { kind: 'mcq' as const, data: buildMCQ(chunk, chunks, direction) }
    if (type === 'dropdown')
      return { kind: 'dropdown' as const, data: buildDropdown(chunk, chunks, direction) }
    return { kind: 'exact' as const, data: buildExact(chunk, direction) }
  })
}

// ── SessionConfigCard ─────────────────────────────────────────────────────

function SessionConfigCard({
  copy,
  direction,
  sessionLength,
  exerciseType,
  chunkCount,
  onDirectionChange,
  onSessionLengthChange,
  onExerciseTypeChange,
  onStart,
}: {
  copy: ReturnType<typeof vocabCopy>
  direction: PracticeDirection
  sessionLength: SessionLength
  exerciseType: ExerciseType
  chunkCount: number
  onDirectionChange: (d: PracticeDirection) => void
  onSessionLengthChange: (l: SessionLength) => void
  onExerciseTypeChange: (t: ExerciseType) => void
  onStart: () => void
}) {
  const lengths: SessionLength[] = [10, 20, 'all']
  const types: { value: ExerciseType; label: string }[] = [
    { value: 'mcq', label: copy.test.typeMcq },
    { value: 'dropdown', label: copy.test.typeDropdown },
    { value: 'exact', label: copy.test.typeExact },
    { value: 'matching', label: copy.test.typeMatching },
  ]
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
        {copy.test.configTitle}
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
        {copy.test.configSubtitle}
      </p>

      <Field label={copy.test.exerciseTypeLabel}>
        <ToggleRow options={types} active={exerciseType} onChange={onExerciseTypeChange} />
      </Field>

      <Field label={copy.practice.directionLabel}>
        <ToggleRow
          options={[
            { value: 'fr' as const, label: copy.practice.directionFrLabel },
            { value: 'en' as const, label: copy.practice.directionEnLabel },
          ]}
          active={direction}
          onChange={onDirectionChange}
        />
      </Field>

      <Field label={copy.practice.sessionLengthLabel}>
        <ToggleRow
          options={lengths.map((l) => ({
            value: l,
            label: l === 'all' ? copy.practice.sessionLengthAll : String(l),
          }))}
          active={sessionLength}
          onChange={onSessionLengthChange}
        />
      </Field>

      <button
        type="button"
        onClick={onStart}
        disabled={chunkCount < TEST_MIN_CHUNKS}
        className="ed-btn-press"
        style={{
          marginTop: 8,
          width: '100%',
          height: 52,
          borderRadius: 4,
          border: 'none',
          backgroundColor: chunkCount < TEST_MIN_CHUNKS ? 'var(--lm-border-subtle)' : 'var(--cta-utility)',
          color: chunkCount < TEST_MIN_CHUNKS ? 'var(--lm-text-tertiary)' : '#FFFFFF',
          fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: '0.01em',
          cursor: chunkCount < TEST_MIN_CHUNKS ? 'not-allowed' : 'pointer',
        }}
      >
        {copy.test.startSession}
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

// ── QuestionView (dispatcher) ─────────────────────────────────────────────

function QuestionView({
  copy,
  question,
  i,
  n,
  onGradeOne,
  onGradeBlock,
  onNext,
}: {
  copy: ReturnType<typeof vocabCopy>
  question: Question | undefined
  i: number
  n: number
  onGradeOne: (chunkId: number, grade: 'pass' | 'fail') => void
  onGradeBlock: (grades: Record<number, 'pass' | 'fail'>) => void
  onNext: () => void
}) {
  if (!question) return null
  return (
    <div className="flex flex-col gap-6">
      <div
        className="text-[12px] uppercase tracking-[0.12em] font-semibold text-center"
        style={{ color: 'var(--lm-text-tertiary)' }}
      >
        {copy.test.progressLabel(i, n)}
      </div>
      {question.kind === 'mcq' && (
        <MCQView
          copy={copy}
          question={question.data}
          onGradeOne={onGradeOne}
          onNext={onNext}
        />
      )}
      {question.kind === 'dropdown' && (
        <DropdownView
          copy={copy}
          question={question.data}
          onGradeOne={onGradeOne}
          onNext={onNext}
        />
      )}
      {question.kind === 'exact' && (
        <ExactView
          copy={copy}
          question={question.data}
          onGradeOne={onGradeOne}
          onNext={onNext}
        />
      )}
      {question.kind === 'matching' && (
        <MatchingView
          copy={copy}
          block={question.data}
          onGradeBlock={onGradeBlock}
          onNext={onNext}
        />
      )}
    </div>
  )
}

// ── MCQView ───────────────────────────────────────────────────────────────

function MCQView({
  copy,
  question,
  onGradeOne,
  onNext,
}: {
  copy: ReturnType<typeof vocabCopy>
  question: MCQQuestion
  onGradeOne: (chunkId: number, grade: 'pass' | 'fail') => void
  onNext: () => void
}) {
  const [picked, setPicked] = useState<string | null>(null)
  const submitted = picked !== null
  const isCorrect = picked === question.correct
  return (
    <>
      <ExerciseCard prompt={copy.test.mcqPrompt} body={question.prompt} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((opt) => {
          const optStyle = optionStyle(opt, picked, question.correct, submitted)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => {
                if (submitted) return
                setPicked(opt)
                onGradeOne(question.chunkId, opt === question.correct ? 'pass' : 'fail')
              }}
              className="ed-btn-press"
              style={optStyle}
            >
              {opt}
            </button>
          )
        })}
      </div>
      {submitted && <FeedbackBlock copy={copy} correct={question.correct} ok={isCorrect} onNext={onNext} />}
    </>
  )
}

function optionStyle(
  opt: string,
  picked: string | null,
  correct: string,
  submitted: boolean,
): React.CSSProperties {
  const base: React.CSSProperties = {
    minHeight: 56,
    padding: '12px 16px',
    borderRadius: 4,
    border: '1px solid var(--lm-border-subtle)',
    backgroundColor: 'var(--lm-bg-surface)',
    color: 'var(--lm-text-primary)',
    fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
    fontWeight: 500,
    fontSize: 14,
    lineHeight: 1.4,
    textAlign: 'left',
    cursor: submitted ? 'default' : 'pointer',
    transition:
      'background-color var(--lm-duration-hover) var(--lm-ease), color var(--lm-duration-hover) var(--lm-ease)',
  }
  if (!submitted) return base
  if (opt === correct) {
    return {
      ...base,
      backgroundColor: 'var(--cta-utility)',
      color: '#FFFFFF',
      borderColor: 'var(--cta-utility)',
    }
  }
  if (opt === picked) {
    return {
      ...base,
      backgroundColor: 'var(--lm-bg-base)',
      color: 'var(--lm-text-tertiary)',
      textDecoration: 'line-through',
    }
  }
  return { ...base, opacity: 0.5 }
}

function ExerciseCard({ prompt, body }: { prompt: string; body: string }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--lm-bg-surface)',
        border: '1px solid var(--lm-border-subtle)',
        borderRadius: 4,
        padding: 'clamp(24px, 3vw, 36px) clamp(20px, 3vw, 32px)',
        textAlign: 'center',
      }}
    >
      <div
        className="text-[12px] uppercase tracking-[0.12em] font-semibold mb-3"
        style={{ color: 'var(--lm-text-tertiary)' }}
      >
        {prompt}
      </div>
      <p
        style={{
          fontFamily: 'var(--font-source-serif), Georgia, serif',
          fontWeight: 500,
          fontSize: 'clamp(20px, 2.6vw, 26px)',
          lineHeight: 1.3,
          color: 'var(--lm-text-primary)',
          margin: 0,
        }}
      >
        {body}
      </p>
    </div>
  )
}

function FeedbackBlock({
  copy,
  correct,
  ok,
  onNext,
}: {
  copy: ReturnType<typeof vocabCopy>
  correct: string
  ok: boolean
  onNext: () => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <p
        style={{
          fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
          fontWeight: 600,
          fontSize: 14,
          color: ok ? 'var(--cta-utility)' : 'var(--lm-text-primary)',
          textAlign: 'center',
          margin: 0,
        }}
      >
        {ok ? copy.test.feedbackCorrect : copy.test.feedbackWrong(correct)}
      </p>
      <button
        type="button"
        onClick={onNext}
        className="ed-btn-press"
        style={{
          width: '100%',
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
        {copy.test.next}
      </button>
    </div>
  )
}

// ── DropdownView ──────────────────────────────────────────────────────────

function DropdownView({
  copy,
  question,
  onGradeOne,
  onNext,
}: {
  copy: ReturnType<typeof vocabCopy>
  question: DropdownQuestion
  onGradeOne: (chunkId: number, grade: 'pass' | 'fail') => void
  onNext: () => void
}) {
  const [picked, setPicked] = useState<string>('')
  const [submitted, setSubmitted] = useState(false)
  const isCorrect = picked === question.correct
  function handleSubmit() {
    if (submitted || !picked) return
    setSubmitted(true)
    onGradeOne(question.chunkId, picked === question.correct ? 'pass' : 'fail')
  }
  return (
    <>
      <ExerciseCard prompt={copy.test.dropdownPrompt} body={question.shown} />
      <select
        value={picked}
        onChange={(e) => setPicked(e.target.value)}
        disabled={submitted}
        className="ed-field"
        style={{
          width: '100%',
          height: 52,
          padding: '0 14px',
          borderRadius: 4,
          border: '1px solid var(--lm-border-subtle)',
          backgroundColor: 'var(--lm-bg-surface)',
          color: picked ? 'var(--lm-text-primary)' : 'var(--lm-text-tertiary)',
          fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
          fontWeight: 500,
          fontSize: 14,
        }}
      >
        <option value="" disabled>
          —
        </option>
        {question.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {!submitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!picked}
          className="ed-btn-press"
          style={{
            width: '100%',
            height: 48,
            borderRadius: 4,
            border: 'none',
            backgroundColor: !picked ? 'var(--lm-border-subtle)' : 'var(--cta-utility)',
            color: !picked ? 'var(--lm-text-tertiary)' : '#FFFFFF',
            fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 14,
            cursor: !picked ? 'not-allowed' : 'pointer',
          }}
        >
          {copy.test.submit}
        </button>
      ) : (
        <FeedbackBlock copy={copy} correct={question.correct} ok={isCorrect} onNext={onNext} />
      )}
    </>
  )
}

// ── ExactView ─────────────────────────────────────────────────────────────

function ExactView({
  copy,
  question,
  onGradeOne,
  onNext,
}: {
  copy: ReturnType<typeof vocabCopy>
  question: ExactQuestion
  onGradeOne: (chunkId: number, grade: 'pass' | 'fail') => void
  onNext: () => void
}) {
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const isCorrect = submitted && gradeExact(value, question.expected)
  function handleSubmit() {
    if (submitted || !value.trim()) return
    setSubmitted(true)
    onGradeOne(question.chunkId, gradeExact(value, question.expected) ? 'pass' : 'fail')
  }
  return (
    <>
      <ExerciseCard prompt={copy.test.exactPrompt} body={question.prompt} />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={submitted}
        className="ed-field"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleSubmit()
          }
        }}
        style={{
          width: '100%',
          height: 52,
          padding: '0 14px',
          borderRadius: 4,
          border: '1px solid var(--lm-border-subtle)',
          backgroundColor: 'var(--lm-bg-surface)',
          color: 'var(--lm-text-primary)',
          fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
          fontWeight: 500,
          fontSize: 16,
          outline: 'none',
        }}
      />
      {!submitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="ed-btn-press"
          style={{
            width: '100%',
            height: 48,
            borderRadius: 4,
            border: 'none',
            backgroundColor: !value.trim() ? 'var(--lm-border-subtle)' : 'var(--cta-utility)',
            color: !value.trim() ? 'var(--lm-text-tertiary)' : '#FFFFFF',
            fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 14,
            cursor: !value.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {copy.test.submit}
        </button>
      ) : (
        <FeedbackBlock copy={copy} correct={question.expected} ok={isCorrect} onNext={onNext} />
      )}
    </>
  )
}

// ── MatchingView ──────────────────────────────────────────────────────────
//
// UX (per BACKLOG): tap one side → that item highlights as selected →
// tap an item in the OPPOSITE column → pair confirmed; tapping the same
// column twice deselects + re-selects. Tapping an already-paired item
// breaks that pair and selects the tapped item.
//
// Internal state: paired = Record<chunkId, partnerChunkId> when both
// sides agree. Each chunkId appears as a key (FR mapping) AND as a value
// (EN partner from the FR row). When two FR/EN items are paired, both
// directions of the relationship are stored so either tap can find them.

function MatchingView({
  copy,
  block,
  onGradeBlock,
  onNext,
}: {
  copy: ReturnType<typeof vocabCopy>
  block: MatchingBlock
  onGradeBlock: (grades: Record<number, 'pass' | 'fail'>) => void
  onNext: () => void
}) {
  // The right column is shuffled for display so position doesn't leak
  // the correct pairing. The IDs stay the same on both sides because
  // each chunkId carries both fr and en.
  const enColumn = useMemo(() => shuffle(block.pairs), [block])
  const frColumn = block.pairs

  // selection: side + chunkId of the currently highlighted item.
  // paired: chunkId (FR-side, i.e., the canonical chunkId) ->
  //          chunkId (the EN-side chunkId the user paired it with).
  const [selection, setSelection] = useState<{ side: 'fr' | 'en'; id: number } | null>(null)
  const [paired, setPaired] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [graded, setGraded] = useState<Record<number, 'pass' | 'fail'>>({})

  function tap(side: 'fr' | 'en', id: number) {
    if (submitted) return
    // Break any existing pair this item is part of.
    const next = { ...paired }
    // remove pair where id is key
    if (next[id] !== undefined) delete next[id]
    // remove pair where id is value
    for (const [k, v] of Object.entries(next)) {
      if (v === id) delete next[Number(k)]
    }
    if (selection && selection.side !== side) {
      // Form a pair. FR id is the canonical key.
      const frId = side === 'fr' ? id : selection.id
      const enId = side === 'en' ? id : selection.id
      next[frId] = enId
      setPaired(next)
      setSelection(null)
    } else {
      setPaired(next)
      setSelection({ side, id })
    }
  }

  function pairedPartner(side: 'fr' | 'en', id: number): number | null {
    if (side === 'fr') return paired[id] ?? null
    for (const [k, v] of Object.entries(paired)) {
      if (v === id) return Number(k)
    }
    return null
  }

  function handleSubmit() {
    if (submitted) return
    // Build the user-pair map for grading: for each FR chunk in this
    // block, what EN chunk did the user pair it with? Per F-323 contract,
    // a correct match means the user paired chunk-N's FR with chunk-N's
    // EN (same chunkId on both sides). So userPairs[chunkId] = paired
    // mapping resolves to the EN chunkId; we record pass when EN == FR.
    const userPairs: Record<number, number> = {}
    for (const pair of block.pairs) {
      userPairs[pair.chunkId] = paired[pair.chunkId] ?? -1
    }
    const grades = gradeMatching(userPairs, block)
    onGradeBlock(grades)
    setGraded(grades)
    setSubmitted(true)
  }

  const allPaired = block.pairs.every((p) => paired[p.chunkId] !== undefined)

  return (
    <>
      <div
        className="text-[12px] uppercase tracking-[0.12em] font-semibold mb-1"
        style={{ color: 'var(--lm-text-tertiary)', textAlign: 'center' }}
      >
        {copy.test.matchingPrompt}
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="flex flex-col gap-2">
          {frColumn.map((p) => (
            <MatchItem
              key={`fr-${p.chunkId}`}
              text={p.fr}
              selected={selection?.side === 'fr' && selection.id === p.chunkId}
              paired={paired[p.chunkId] !== undefined}
              correct={submitted ? graded[p.chunkId] === 'pass' : null}
              onClick={() => tap('fr', p.chunkId)}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {enColumn.map((p) => {
            const partner = pairedPartner('en', p.chunkId)
            const isCorrectAfterGrade = submitted ? partner === p.chunkId : null
            return (
              <MatchItem
                key={`en-${p.chunkId}`}
                text={p.en}
                selected={selection?.side === 'en' && selection.id === p.chunkId}
                paired={partner !== null}
                correct={isCorrectAfterGrade}
                onClick={() => tap('en', p.chunkId)}
              />
            )
          })}
        </div>
      </div>
      {!submitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allPaired}
          className="ed-btn-press"
          style={{
            marginTop: 16,
            width: '100%',
            height: 48,
            borderRadius: 4,
            border: 'none',
            backgroundColor: !allPaired ? 'var(--lm-border-subtle)' : 'var(--cta-utility)',
            color: !allPaired ? 'var(--lm-text-tertiary)' : '#FFFFFF',
            fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 14,
            cursor: !allPaired ? 'not-allowed' : 'pointer',
          }}
        >
          {copy.test.submit}
        </button>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          <p
            style={{
              fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
              fontWeight: 600,
              fontSize: 14,
              color: 'var(--lm-text-primary)',
              textAlign: 'center',
              margin: 0,
            }}
          >
            {Object.values(graded).filter((g) => g === 'pass').length} / {Object.keys(graded).length}
          </p>
          <button
            type="button"
            onClick={onNext}
            className="ed-btn-press"
            style={{
              width: '100%',
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
            {copy.test.next}
          </button>
        </div>
      )}
    </>
  )
}

function MatchItem({
  text,
  selected,
  paired,
  correct,
  onClick,
}: {
  text: string
  selected: boolean
  paired: boolean
  correct: boolean | null
  onClick: () => void
}) {
  // Post-submit: green-ish (ed-accent) for correct, muted strikethrough
  // for wrong. Pre-submit: ed-accent fill on selected, paper + slight
  // tint when paired (so the user can see which items are already in
  // a pair vs free to select).
  let bg = 'var(--lm-bg-surface)'
  let fg: React.CSSProperties['color'] = 'var(--lm-text-primary)'
  let borderColor: React.CSSProperties['borderColor'] = 'var(--lm-border-subtle)'
  let textDecoration: React.CSSProperties['textDecoration'] = 'none'
  if (correct === true) {
    bg = 'var(--cta-utility)'
    fg = '#FFFFFF'
    borderColor = 'var(--cta-utility)'
  } else if (correct === false) {
    bg = 'var(--lm-bg-base)'
    fg = 'var(--lm-text-tertiary)'
    textDecoration = 'line-through'
  } else if (selected) {
    bg = 'var(--cta-utility)'
    fg = '#FFFFFF'
    borderColor = 'var(--cta-utility)'
  } else if (paired) {
    bg = 'var(--lm-bg-base)'
    fg = 'var(--lm-text-primary)'
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="ed-btn-press"
      style={{
        minHeight: 48,
        padding: '10px 12px',
        borderRadius: 4,
        border: `1px solid ${borderColor}`,
        backgroundColor: bg,
        color: fg,
        fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
        fontWeight: 500,
        fontSize: 13,
        lineHeight: 1.35,
        textAlign: 'left',
        cursor: 'pointer',
        textDecoration,
        transition:
          'background-color var(--lm-duration-hover) var(--lm-ease), color var(--lm-duration-hover) var(--lm-ease)',
      }}
    >
      {text}
    </button>
  )
}

// ── TestEndCard ───────────────────────────────────────────────────────────

function TestEndCard({
  copy,
  results,
  slug,
  onTestAgain,
}: {
  copy: ReturnType<typeof vocabCopy>
  results: Record<number, 'pass' | 'fail'>
  slug: string
  onTestAgain: () => void
}) {
  const total = Object.keys(results).length
  const got = Object.values(results).filter((r) => r === 'pass').length
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
        {copy.test.endTitle}
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
          fontWeight: 600,
          fontSize: 18,
          color: 'var(--lm-text-primary)',
          margin: 0,
          marginBottom: 24,
        }}
      >
        {copy.test.endStat(got, total)}
      </p>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onTestAgain}
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
          {copy.test.testAgain}
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

// ── State cards (tier-locked / error / empty / soft-empty / skeleton) ────

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

function SoftEmptyCard({
  copy,
  slug,
}: {
  copy: ReturnType<typeof vocabCopy>
  slug: string
}) {
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
        {copy.test.softEmptyTitle}
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
        {copy.test.softEmptyBody}
      </p>
      <Link
        href={`/la-bibliotheque/${encodeURIComponent(slug)}/practice`}
        className="ed-btn-press"
        style={{
          height: 48,
          padding: '0 24px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 4,
          border: 'none',
          backgroundColor: 'var(--cta-utility)',
          color: '#FFFFFF',
          fontFamily: 'var(--font-geist), -apple-system, system-ui, sans-serif',
          fontWeight: 600,
          fontSize: 14,
          textDecoration: 'none',
        }}
      >
        {copy.test.softEmptyCta}
      </Link>
    </div>
  )
}

function TestSkeleton() {
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
