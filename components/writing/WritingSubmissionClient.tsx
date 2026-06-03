'use client'

// V-013a — Writing submission view + result. Single-page state machine:
// idle → submitting → result. Fetches the prompt by id, renders prompt_fr
// (with optional collapsible prompt_en helper), textarea with autosave to
// localStorage, live word counter color-gated, submit on POST /api/writing
// /submit, then renders Claude's 4-couche analysis result.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { useInterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'
import { BRAND_LABEL } from '@/lib/coucheBrandLabels'
import { usePollJob } from '@/lib/polling'
import type { WritingPrompt, WritingSubmissionResult } from '@/lib/types'

const ED_BG = 'var(--lm-bg-base)'
const ED_FG = 'var(--lm-text-primary)'
const ED_FG_SOFT = 'var(--lm-text-secondary)'
const ED_MUTED = 'var(--lm-text-tertiary)'
const ED_RULE = 'var(--lm-border-subtle)'
const ED_PAPER = 'var(--lm-bg-surface)'
const ED_ACCENT = 'var(--cta-utility)'
const SANS = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'
const SERIF = 'var(--font-source-serif), Georgia, serif'

const COPY = {
  en: {
    backToLibrary: 'Back to prompts',
    showEnglish: 'Show English',
    hideEnglish: 'Hide English',
    minutes: 'min',
    wordsRange: 'word range',
    yourResponse: 'Your response',
    placeholder: 'Start writing here…',
    wordCount: (n: number) => `${n} words`,
    submit: 'Submit for analysis',
    submitEmpty: 'Type a response to submit',
    underMinWarning: 'Below recommended minimum. Your analysis may be limited.',
    overMaxWarning: 'Over recommended maximum.',
    submitting: 'Analyzing…',
    submitError: "Couldn't submit. Try again in a moment.",
    promptError: "Couldn't load this prompt. Retry?",
    retry: 'Retry',
    notFound: 'Prompt not found.',
    resultTitle: 'Your analysis',
    resultBand: 'CEFR band',
    resultScore: 'Overall score',
    submitAnother: 'Submit another',
    tryAgain: 'Try the same prompt again',
    // V-016a.dashboard — coaching / transformation / TCF rubric accordion
    resultCoachingLabel: 'Coaching',
    resultCoachingFrLabel: 'FR',
    resultTransformationLabel: 'Try this',
    resultRubricLabel: 'TCF rubric breakdown',
    resultRubricSubline: 'Per-criterion score, examiner remark, and coaching.',
    resultRubricExpand: 'Show details',
    resultRubricCollapse: 'Hide details',
    resultExaminerLabel: 'Examiner remark',
    resultScoreSlash: (n: number, max: number) => `${n} / ${max}`,
    // V-016a.fe — async-job state copy.
    analyzingTitle: 'Analyzing your writing',
    analyzingPhase: {
      initial: 'This may take 30-90 seconds.',
      still: 'Still analyzing.',
      almost: 'Almost done.',
    },
    analyzingCancel: 'Cancel',
    failedTitle: 'Analysis failed',
    abandonedTitle: 'Analysis is taking longer than expected',
    abandonedBody: 'Try again in a moment. Your draft is saved.',
  },
  fr: {
    backToLibrary: 'Retour aux sujets',
    showEnglish: 'Afficher en anglais',
    hideEnglish: "Masquer l'anglais",
    minutes: 'min',
    wordsRange: 'mots demandés',
    yourResponse: 'Votre réponse',
    placeholder: 'Commencez à écrire ici…',
    wordCount: (n: number) => `${n} mots`,
    submit: 'Soumettre pour analyse',
    submitEmpty: 'Écrivez une réponse pour soumettre',
    underMinWarning: 'Sous le minimum recommandé. Votre analyse pourra être limitée.',
    overMaxWarning: 'Au-dessus du maximum recommandé.',
    submitting: 'Analyse en cours…',
    submitError: 'Impossible de soumettre. Réessayez dans un instant.',
    promptError: 'Impossible de charger ce sujet. Réessayer ?',
    retry: 'Réessayer',
    notFound: 'Sujet introuvable.',
    resultTitle: 'Votre analyse',
    resultBand: 'Niveau CECR',
    resultScore: 'Note globale',
    submitAnother: 'Soumettre un autre',
    tryAgain: 'Refaire le même sujet',
    // V-016a.dashboard — coaching / transformation / TCF rubric accordion
    resultCoachingLabel: 'Coaching',
    resultCoachingFrLabel: 'FR',
    resultTransformationLabel: 'Essayez ceci',
    resultRubricLabel: 'Détail du barème TCF',
    resultRubricSubline: 'Score, remarque et coaching par critère.',
    resultRubricExpand: 'Afficher le détail',
    resultRubricCollapse: 'Masquer le détail',
    resultExaminerLabel: "Remarque de l'examinateur",
    resultScoreSlash: (n: number, max: number) => `${n} / ${max}`,
    analyzingTitle: 'Analyse en cours',
    analyzingPhase: {
      initial: "Cela peut prendre 30 à 90 secondes.",
      still: 'Analyse toujours en cours.',
      almost: 'Presque terminé.',
    },
    analyzingCancel: 'Annuler',
    failedTitle: 'Analyse échouée',
    abandonedTitle: "L'analyse prend plus de temps que prévu",
    abandonedBody: 'Réessayez dans un instant. Votre brouillon est sauvegardé.',
  },
} as const

// Count words in the user's submission. Splits on whitespace, filters
// empty tokens. Matches the BE word-count convention well enough for a
// live counter — final BE-side count may differ by ~1 word on edge cases.
function wordCount(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

// V-016a.fe — extended state machine for async-job analysis.
//   idle         → form is open, text in flight is the user's draft
//   submitting   → POST /api/writing/submit in flight (brief, ~1-2s)
//   polling      → have job_id, polling /api/writing/jobs/{id} until
//                  status flips to completed / failed / abandoned
//   result       → final analysis result rendered
//   failed       → BE returned status=failed OR a poll lost the server
//   abandoned    → 100 polls (~5min) elapsed without completion
//   submitError  → transport error during the initial POST (not a job
//                  failure — never had a job_id)
type SubmissionState =
  | { kind: 'idle'; text: string }
  | { kind: 'submitting'; text: string }
  | { kind: 'polling'; text: string; jobId: string }
  | { kind: 'result'; text: string; result: WritingSubmissionResult }
  | { kind: 'failed'; text: string; message: string }
  | { kind: 'abandoned'; text: string }
  | { kind: 'submitError'; text: string; message: string }

interface Props {
  promptId: number | null
}

export default function WritingSubmissionClient({ promptId }: Props) {
  const language = useInterfaceLanguage()
  const copy = COPY[language]
  const [prompt, setPrompt] = useState<WritingPrompt | null>(null)
  const [loadError, setLoadError] = useState<'not_found' | 'network' | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const [showEn, setShowEn] = useState(false)
  const [submission, setSubmission] = useState<SubmissionState>({ kind: 'idle', text: '' })

  const draftKey = promptId != null ? `lemethodic:writing-draft:${promptId}` : null

  // V-016a.fe — drive the polling loop from submission state. usePollJob
  // is a no-op when jobId is null (idle / submitting / result / etc.);
  // it kicks off the recursive setTimeout chain when submission flips to
  // 'polling' with a job_id.
  const activeJobId = submission.kind === 'polling' ? submission.jobId : null
  const pollState = usePollJob({
    jobId: activeJobId,
    fetcher: api.writing.getJob,
  })

  // Sync poll state → submission state. Only fires while the submission
  // is in the 'polling' phase, so a stale completed/failed result from a
  // previous job can't bleed into a new attempt.
  useEffect(() => {
    if (submission.kind !== 'polling') return
    if (pollState.kind === 'completed') {
      setSubmission({ kind: 'result', text: submission.text, result: pollState.result })
      if (draftKey) {
        try {
          window.localStorage.removeItem(draftKey)
        } catch {}
      }
    } else if (pollState.kind === 'failed') {
      setSubmission({ kind: 'failed', text: submission.text, message: pollState.message })
    } else if (pollState.kind === 'abandoned') {
      setSubmission({ kind: 'abandoned', text: submission.text })
    }
  }, [pollState, submission, draftKey])

  // Load prompt on mount. listPrompts returns the full library; pick by id.
  // Could be optimized with GET /api/writing/prompts/{id} when BE adds it.
  const load = useCallback(async () => {
    if (promptId == null) {
      setLoadError('not_found')
      return
    }
    setLoadError(null)
    try {
      const list = await api.writing.listPrompts()
      const match = list.find((p) => p.id === promptId)
      if (!match) {
        setLoadError('not_found')
      } else {
        setPrompt(match)
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setLoadError('not_found')
      else setLoadError('network')
    }
  }, [promptId])

  useEffect(() => {
    load()
  }, [load, retryKey])

  // Restore draft from localStorage once prompt has loaded. Same key on
  // remount survives across browser sessions for the same prompt.
  useEffect(() => {
    if (!draftKey || !prompt || submission.kind !== 'idle') return
    try {
      const saved = window.localStorage.getItem(draftKey)
      if (saved) setSubmission({ kind: 'idle', text: saved })
    } catch {
      // localStorage may throw in private mode — non-fatal.
    }
    // Run once when prompt loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, draftKey])

  // Debounced autosave on text change.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!draftKey) return
    if (submission.kind !== 'idle' && submission.kind !== 'submitError') return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      try {
        window.localStorage.setItem(draftKey, submission.text)
      } catch {}
    }, 500)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [submission, draftKey])

  const text = submission.kind === 'result' ? submission.text : (submission as { text: string }).text
  const count = useMemo(() => wordCount(text), [text])
  const minWords = prompt?.min_words ?? 0
  const maxWords = prompt?.max_words ?? 0
  // V-015b — word count is a guideline, not a hard requirement. Three
  // states: under min (red, advisory), in range (green), over max
  // (yellow, advisory). All three permit submission.
  const wordRangeState: 'under' | 'in_range' | 'over' | 'unknown' = !prompt
    ? 'unknown'
    : count < minWords
      ? 'under'
      : count > maxWords
        ? 'over'
        : 'in_range'
  const counterColor =
    wordRangeState === 'unknown'
      ? ED_MUTED
      : wordRangeState === 'under'
        ? 'var(--lm-error)'
        : wordRangeState === 'over'
          ? 'var(--lm-warm-peach-deep)'
          : 'var(--lm-warm-sage-deep)'
  // V-015b — submit gated only on non-empty text + active prompt + not
  // mid-submit. Word count thresholds no longer block.
  const canSubmit = prompt != null && count > 0

  async function handleSubmit() {
    if (!prompt) return
    if (submission.kind === 'submitting' || submission.kind === 'polling') return
    if (!canSubmit) return
    const sendText = text
    setSubmission({ kind: 'submitting', text: sendText })
    try {
      // V-016a.fe — POST returns a WritingJob handle; usePollJob takes
      // over from here. BE may return a terminal status synchronously
      // (cached / instant analyses) — we still handle that path so we
      // don't bounce through the polling loop unnecessarily.
      const job = await api.writing.submit(prompt.id, sendText)
      if (job.status === 'completed' && job.result) {
        setSubmission({ kind: 'result', text: sendText, result: job.result })
        if (draftKey) {
          try {
            window.localStorage.removeItem(draftKey)
          } catch {}
        }
        return
      }
      if (job.status === 'failed') {
        setSubmission({
          kind: 'failed',
          text: sendText,
          message: job.error?.message ?? copy.submitError,
        })
        return
      }
      // Pending or processing → flip to polling phase, hook drives loop.
      setSubmission({ kind: 'polling', text: sendText, jobId: job.job_id })
    } catch (err) {
      // V-014a — surface BE response details so production triage can
      // see the failure cause directly. Distinct from 'failed' (which
      // means BE accepted the job and then errored): submitError is the
      // initial-POST transport / validation error.
      // eslint-disable-next-line no-console
      console.error('Writing submit failed', err)
      let detail: string = copy.submitError
      if (err instanceof ApiError) {
        const bodyDetail =
          err.body && typeof err.body === 'object' && 'detail' in err.body
            ? typeof (err.body as { detail: unknown }).detail === 'string'
              ? (err.body as { detail: string }).detail
              : JSON.stringify((err.body as { detail: unknown }).detail)
            : null
        detail = bodyDetail
          ? `${copy.submitError} (${err.status}: ${bodyDetail})`
          : `${copy.submitError} (HTTP ${err.status})`
      }
      setSubmission({ kind: 'submitError', text: sendText, message: detail })
    }
  }

  // V-016a.fe — user-initiated cancel during polling. Reverts to the
  // idle form with text preserved (jobId nulled so usePollJob's effect
  // tears down the in-flight loop on next render).
  function handleCancelPolling() {
    if (submission.kind !== 'polling') return
    setSubmission({ kind: 'idle', text: submission.text })
  }

  // V-016a.fe — retry path from failed / abandoned. Resets to idle with
  // the user's text preserved so they can hit Submit again.
  function handleRetryFromFailed() {
    setSubmission({ kind: 'idle', text })
  }

  function handleReset() {
    setSubmission({ kind: 'idle', text: '' })
    if (draftKey) {
      try {
        window.localStorage.removeItem(draftKey)
      } catch {}
    }
  }

  return (
    <div
      className="ed-page-enter"
      style={{ minHeight: '100dvh', backgroundColor: ED_BG, fontFamily: SANS }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(20px, 3vw, 32px) clamp(16px, 4vw, 32px) 96px' }}>
        {/* Back link */}
        <Link
          href="/l-examen/expression-ecrite"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: 13,
            color: ED_FG_SOFT,
            textDecoration: 'none',
            marginBottom: 24,
          }}
        >
          <ChevronLeft size={16} strokeWidth={2} />
          <span>{copy.backToLibrary}</span>
        </Link>

        {loadError === 'not_found' ? (
          <NotFoundState message={copy.notFound} backLabel={copy.backToLibrary} />
        ) : loadError === 'network' ? (
          <NetworkError message={copy.promptError} retryLabel={copy.retry} onRetry={() => setRetryKey((k) => k + 1)} />
        ) : !prompt ? (
          <LoadingSkeleton />
        ) : submission.kind === 'polling' ? (
          <AnalyzingPanel
            pollCount={pollState.kind === 'polling' ? pollState.pollCount : 0}
            copy={copy}
            onCancel={handleCancelPolling}
          />
        ) : submission.kind === 'failed' ? (
          <FailedPanel
            title={copy.failedTitle}
            message={submission.message}
            retryLabel={copy.retry}
            onRetry={handleRetryFromFailed}
          />
        ) : submission.kind === 'abandoned' ? (
          <FailedPanel
            title={copy.abandonedTitle}
            message={copy.abandonedBody}
            retryLabel={copy.retry}
            onRetry={handleRetryFromFailed}
          />
        ) : submission.kind === 'result' ? (
          <ResultView
            prompt={prompt}
            result={submission.result}
            language={language}
            copy={copy}
            onReset={handleReset}
            onTryAgain={() => setSubmission({ kind: 'idle', text: '' })}
          />
        ) : (
          <SubmissionForm
            prompt={prompt}
            text={text}
            count={count}
            counterColor={counterColor}
            wordRangeState={wordRangeState}
            canSubmit={canSubmit}
            isSubmitting={submission.kind === 'submitting'}
            errorMessage={submission.kind === 'submitError' ? submission.message : null}
            showEn={showEn}
            language={language}
            copy={copy}
            onTextChange={(t) => setSubmission({ kind: 'idle', text: t })}
            onToggleEn={() => setShowEn((v) => !v)}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  )
}

// ── Submission form (idle / submitting / submitError) ─────────────────────

interface SubmissionFormProps {
  prompt: WritingPrompt
  text: string
  count: number
  counterColor: string
  wordRangeState: 'under' | 'in_range' | 'over' | 'unknown'
  canSubmit: boolean
  isSubmitting: boolean
  errorMessage: string | null
  showEn: boolean
  language: 'en' | 'fr'
  copy: typeof COPY[keyof typeof COPY]
  onTextChange: (text: string) => void
  onToggleEn: () => void
  onSubmit: () => void
}

function SubmissionForm({
  prompt,
  text,
  count,
  counterColor,
  wordRangeState,
  canSubmit,
  isSubmitting,
  errorMessage,
  showEn,
  copy,
  onTextChange,
  onToggleEn,
  onSubmit,
}: SubmissionFormProps) {
  return (
    <>
      {/* Prompt header */}
      <div style={{ marginBottom: 24 }}>
        <p
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--lm-warm-peach-deep)',
            margin: 0,
            marginBottom: 8,
          }}
        >
          Tâche {prompt.tache_level} · {prompt.level} · {prompt.topic_tag}
        </p>
        <h1
          style={{
            fontFamily: SERIF,
            fontWeight: 400,
            fontSize: 'clamp(28px, 4vw, 40px)',
            lineHeight: 1.15,
            letterSpacing: '-0.015em',
            color: ED_FG,
            margin: 0,
          }}
        >
          {prompt.title_fr}
        </h1>
      </div>

      {/* Prompt body — paper card with 1px ed-rule. Pre-line preserves \n\n
          for Tâche 3 multi-document prompts. Markdown bold (**word**) is
          parsed inline below. */}
      <article
        style={{
          backgroundColor: ED_PAPER,
          border: `1px solid ${ED_RULE}`,
          borderRadius: 4,
          padding: 'clamp(20px, 3vw, 32px)',
          marginBottom: 24,
          fontFamily: SANS,
          fontSize: 15,
          lineHeight: 1.65,
          color: ED_FG,
        }}
      >
        <PromptBody text={prompt.prompt_fr} />
        {showEn && (
          <>
            <hr style={{ border: 'none', borderTop: `1px solid ${ED_RULE}`, margin: '20px 0' }} />
            <PromptBody text={prompt.prompt_en} muted />
          </>
        )}
        <button
          type="button"
          onClick={onToggleEn}
          style={{
            marginTop: 16,
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: 13,
            color: ED_FG_SOFT,
            backgroundColor: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: 2,
          }}
        >
          {showEn ? copy.hideEnglish : copy.showEnglish}
        </button>
      </article>

      {/* Meta row: time limit + word range */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 16,
          fontFamily: SANS,
          fontSize: 13,
          color: ED_MUTED,
          fontWeight: 500,
        }}
      >
        <span>
          {prompt.time_limit_min} {copy.minutes}
        </span>
        <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: ED_MUTED }} />
        <span>
          {prompt.min_words}–{prompt.max_words} {copy.wordsRange}
        </span>
      </div>

      {/* Textarea */}
      <label
        htmlFor="writing-textarea"
        style={{
          display: 'block',
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 12,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: ED_MUTED,
          marginBottom: 8,
        }}
      >
        {copy.yourResponse}
      </label>
      <textarea
        id="writing-textarea"
        className="ed-field"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={copy.placeholder}
        disabled={isSubmitting}
        rows={14}
        style={{
          width: '100%',
          fontFamily: SANS,
          fontSize: 15,
          lineHeight: 1.65,
          color: ED_FG,
          backgroundColor: ED_PAPER,
          border: `1px solid ${ED_RULE}`,
          borderRadius: 4,
          padding: '16px 18px',
          resize: 'vertical',
          outline: 'none',
        }}
      />

      {/* Counter + submit */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginTop: 16,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 14,
            color: counterColor,
          }}
          aria-live="polite"
        >
          {copy.wordCount(count)}
        </span>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
          aria-busy={isSubmitting}
          className="ed-cta-warm-hover ed-btn-press"
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 15,
            color: '#FFFFFF',
            backgroundColor: canSubmit && !isSubmitting ? ED_ACCENT : ED_RULE,
            padding: '12px 24px',
            borderRadius: 4,
            border: 'none',
            cursor: canSubmit && !isSubmitting ? 'pointer' : 'not-allowed',
          }}
        >
          {isSubmitting ? copy.submitting : copy.submit}
        </button>
      </div>
      {/* V-015b — state-aware advisory below the action row. Empty
          state shows submitEmpty; under/over states show advisory but
          do NOT block submit. In-range shows nothing. */}
      {(() => {
        const advisory =
          !canSubmit && !isSubmitting
            ? copy.submitEmpty
            : wordRangeState === 'under'
              ? copy.underMinWarning
              : wordRangeState === 'over'
                ? copy.overMaxWarning
                : null
        if (!advisory) return null
        return (
          <p
            style={{
              fontFamily: SANS,
              fontSize: 12,
              color:
                wordRangeState === 'under'
                  ? 'var(--lm-error)'
                  : wordRangeState === 'over'
                    ? 'var(--lm-warm-peach-deep)'
                    : ED_MUTED,
              fontWeight: 500,
              margin: 0,
              paddingTop: 8,
              textAlign: 'right',
            }}
          >
            {advisory}
          </p>
        )
      })()}
      {errorMessage && (
        <p
          role="alert"
          style={{
            fontFamily: SANS,
            fontSize: 13,
            color: 'var(--lm-error)',
            marginTop: 12,
            textAlign: 'right',
          }}
        >
          {errorMessage}
        </p>
      )}
    </>
  )
}

// Render prompt_fr / prompt_en bodies. Preserves \n\n breaks via white-
// space: pre-wrap; parses **bold** spans for Tâche 3 document separators.
function PromptBody({ text, muted = false }: { text: string; muted?: boolean }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <p
      style={{
        whiteSpace: 'pre-wrap',
        margin: 0,
        color: muted ? ED_MUTED : ED_FG,
      }}
    >
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <strong key={i} style={{ fontWeight: 700, color: ED_FG }}>
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </p>
  )
}

// ── Result view ────────────────────────────────────────────────────────────

interface ResultViewProps {
  prompt: WritingPrompt
  result: WritingSubmissionResult
  language: 'en' | 'fr'
  copy: typeof COPY[keyof typeof COPY]
  onReset: () => void
  onTryAgain: () => void
}

function ResultView({ prompt, result, language, copy, onReset, onTryAgain }: ResultViewProps) {
  // V-016a.dashboard — read the rich nested envelope
  // (result.feedback.methode_en_couches.<key>) first; fall back to the flat
  // result.couches[] array preserved by V-016a.fix for back-compat. Score
  // and remark merge across both shapes; coaching only exists in the rich
  // shape.
  const methodeRich = result.feedback?.methode_en_couches
  const coucheArray = Array.isArray(result.couches) ? result.couches : []
  const coucheByKey = new Map<string, (typeof coucheArray)[number]>()
  for (const c of coucheArray) coucheByKey.set(c.key, c)
  const expectedKeys = ['le_fond', 'les_moules_des_idees', 'les_moules', 'les_reflexes_anglais', 'la_voix'] as const
  const couches = expectedKeys.map((key) => {
    const rich = methodeRich?.[key] ?? null
    const flat = coucheByKey.get(key) ?? null
    return {
      key,
      score: rich?.score ?? flat?.score ?? null,
      // Per-couche prose: rich shape's examiner remark wins (the
      // methodology voice); falls back to flat shape's analyse/feedback
      // for older BE responses.
      remark: rich?.examiner_remark_fr ?? flat?.analyse ?? flat?.feedback ?? null,
      coaching: rich?.teacher_coaching ?? null,
      missing: rich === null && flat === null,
    }
  })

  // V-016a.dashboard — top-card scoring prefers the rich exam_profile;
  // falls back to the flat overall_score / cefr_band if BE omits feedback.*.
  const examProfile = result.feedback?.exam_profile
  const overallScore = examProfile?.overall_score ?? result.overall_score ?? null
  const cefrBand = examProfile?.cefr_level ?? result.cefr_band ?? null
  const secondaryLabel = examProfile?.secondary_framework_label ?? null
  const secondaryValue = examProfile?.secondary_framework_value ?? null
  const criteriaBreakdown = examProfile?.criteria_breakdown ?? []
  return (
    <>
      <p
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 11,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--lm-warm-peach-deep)',
          margin: 0,
          marginBottom: 8,
        }}
      >
        {prompt.title_fr}
      </p>
      <h1
        style={{
          fontFamily: SERIF,
          fontWeight: 400,
          fontSize: 'clamp(32px, 4.5vw, 48px)',
          lineHeight: 1.1,
          letterSpacing: '-0.015em',
          color: ED_FG,
          margin: 0,
          marginBottom: 24,
        }}
      >
        {copy.resultTitle}
      </h1>

      {/* V-016a.dashboard — Score summary card. overallScore/cefrBand may
          legitimately be 0 / "A1 not achieved" — em-dash is reserved for
          null/undefined (BE didn't score it), never for a real zero. */}
      <div
        style={{
          backgroundColor: ED_PAPER,
          border: `1px solid ${ED_RULE}`,
          borderRadius: 4,
          padding: 'clamp(20px, 3vw, 32px)',
          marginBottom: secondaryValue != null ? 12 : 24,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: ED_MUTED, margin: 0, marginBottom: 6 }}>
            {copy.resultScore}
          </p>
          <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 36, color: 'var(--lm-warm-espresso)', margin: 0 }}>
            {overallScore != null ? overallScore : '—'}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: ED_MUTED, margin: 0, marginBottom: 6 }}>
            {copy.resultBand}
          </p>
          <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 36, color: 'var(--lm-warm-espresso)', margin: 0 }}>
            {cefrBand != null ? cefrBand : '—'}
          </p>
        </div>
      </div>

      {/* V-016a.dashboard — secondary framework row (e.g. CLB equivalence
          when targeting TCF Canada). Only renders when BE provides a
          non-null value. */}
      {secondaryValue != null && (
        <div
          style={{
            backgroundColor: ED_PAPER,
            border: `1px solid ${ED_RULE}`,
            borderRadius: 4,
            padding: '14px clamp(20px, 3vw, 32px)',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: ED_MUTED, margin: 0 }}>
            {secondaryLabel ?? ''}
          </p>
          <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 22, color: 'var(--lm-warm-espresso)', margin: 0 }}>
            {secondaryValue}
          </p>
        </div>
      )}

      {/* Narrative summary if BE provides it */}
      {result.narrative_summary && (
        <p
          style={{
            fontFamily: SERIF,
            fontWeight: 400,
            fontSize: 18,
            lineHeight: 1.55,
            color: ED_FG,
            margin: 0,
            marginBottom: 24,
          }}
        >
          {result.narrative_summary}
        </p>
      )}

      {/* V-016a.dashboard — per-couche breakdown. Each card renders:
          - score (numeric; 0 displays as 0, "Coming soon" only when null)
          - examiner remark (serif , the methodology voice in French)
          - coaching block (EN primary + FR secondary, sans-serif tutor voice)
          - transformation sub-card ("Try this" action step)
          Missing entries render "Coming soon" badge with reduced opacity. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        {couches.map(({ key, score, remark, coaching, missing }) => {
          const hasCoachingProse = !!(coaching?.coaching_en || coaching?.coaching_fr)
          const hasTransformation = !!coaching?.transformation
          const hasAnyBody = !!remark || hasCoachingProse || hasTransformation
          return (
            <div
              key={key}
              style={{
                backgroundColor: ED_PAPER,
                border: `1px solid ${ED_RULE}`,
                borderRadius: 4,
                padding: '16px 20px',
                opacity: missing ? 0.6 : 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                <h3
                  style={{
                    fontFamily: SANS,
                    fontWeight: 600,
                    fontSize: 15,
                    color: ED_FG,
                    margin: 0,
                  }}
                >
                  {BRAND_LABEL[key][language]}
                </h3>
                {score != null ? (
                  <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 16, color: 'var(--lm-warm-peach-deep)' }}>
                    {score}
                  </span>
                ) : (
                  <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: ED_MUTED }}>
                    {language === 'fr' ? 'Bientôt' : 'Coming soon'}
                  </span>
                )}
              </div>
              {remark && (
                <p style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.6, color: ED_FG, margin: 0 }}>
                  {remark}
                </p>
              )}
              {hasCoachingProse && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <p style={{ fontFamily: SANS, fontWeight: 600, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: ED_MUTED, margin: 0 }}>
                    {copy.resultCoachingLabel}
                  </p>
                  {coaching?.coaching_en && (
                    <p style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.55, color: ED_FG, margin: 0 }}>
                      {coaching.coaching_en}
                    </p>
                  )}
                  {coaching?.coaching_fr && (
                    <p style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.5, color: ED_FG_SOFT, margin: 0 }}>
                      <span style={{ fontStyle: 'normal', fontWeight: 600, fontSize: 10, letterSpacing: '0.08em', color: ED_MUTED, marginRight: 6 }}>
                        {copy.resultCoachingFrLabel}
                      </span>
                      {coaching.coaching_fr}
                    </p>
                  )}
                </div>
              )}
              {hasTransformation && (
                <div
                  style={{
                    backgroundColor: 'var(--lm-warm-cream)',
                    border: `1px solid ${ED_RULE}`,
                    borderRadius: 4,
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <p style={{ fontFamily: SANS, fontWeight: 600, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--lm-warm-peach-deep)', margin: 0 }}>
                    {copy.resultTransformationLabel}
                  </p>
                  <p style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.55, color: 'var(--lm-warm-espresso)', margin: 0 }}>
                    {coaching!.transformation}
                  </p>
                </div>
              )}
              {!hasAnyBody && !missing && (
                <p style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.5, color: ED_MUTED, margin: 0 }}>
                  {language === 'fr' ? 'Pas de commentaire pour cette couche.' : 'No feedback for this layer.'}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* V-016a.dashboard — TCF rubric breakdown accordion. Renders the
          exam_profile.criteria_breakdown[] dataset (display-ready with
          localized labels + max_score). tcf_canada_evaluation.criteria[]
          is the raw scoring source and is intentionally NOT rendered —
          one accordion only per Chadi design call. Native <details> for
          accessibility + no JS state. */}
      {criteriaBreakdown.length > 0 && (
        <details
          style={{
            backgroundColor: ED_PAPER,
            border: `1px solid ${ED_RULE}`,
            borderRadius: 4,
            padding: '14px clamp(16px, 3vw, 24px)',
            marginBottom: 32,
          }}
        >
          <summary
            style={{
              cursor: 'pointer',
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              outline: 'none',
            }}
          >
            <p style={{ fontFamily: SANS, fontWeight: 600, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--lm-warm-peach-deep)', margin: 0 }}>
              {copy.resultRubricLabel}
            </p>
            <p style={{ fontFamily: SANS, fontSize: 13, color: ED_FG_SOFT, margin: 0 }}>
              {copy.resultRubricSubline}
            </p>
          </summary>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {criteriaBreakdown.map((criterion) => {
              const label =
                language === 'fr'
                  ? criterion.label_fr_student ?? criterion.label_fr_technical ?? criterion.criterion_key
                  : criterion.label_en_student ?? criterion.label_fr_student ?? criterion.criterion_key
              const observation = criterion.examiner_remark_fr ?? criterion.feedback ?? null
              const coach = criterion.teacher_coaching ?? null
              const cHasProse = !!(coach?.coaching_en || coach?.coaching_fr)
              const cHasTransformation = !!coach?.transformation
              return (
                <div
                  key={criterion.criterion_key}
                  style={{
                    border: `1px solid ${ED_RULE}`,
                    borderRadius: 4,
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                    <h4 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 14, color: ED_FG, margin: 0 }}>
                      {label}
                    </h4>
                    <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 14, color: 'var(--lm-warm-peach-deep)' }}>
                      {copy.resultScoreSlash(criterion.score, criterion.max_score)}
                    </span>
                  </div>
                  {observation && (
                    <p style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.55, color: ED_FG, margin: 0 }}>
                      {observation}
                    </p>
                  )}
                  {cHasProse && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <p style={{ fontFamily: SANS, fontWeight: 600, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: ED_MUTED, margin: 0 }}>
                        {copy.resultCoachingLabel}
                      </p>
                      {coach?.coaching_en && (
                        <p style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.55, color: ED_FG, margin: 0 }}>
                          {coach.coaching_en}
                        </p>
                      )}
                      {coach?.coaching_fr && (
                        <p style={{ fontFamily: SANS, fontSize: 12, lineHeight: 1.5, color: ED_FG_SOFT, margin: 0 }}>
                          <span style={{ fontStyle: 'normal', fontWeight: 600, fontSize: 10, letterSpacing: '0.08em', color: ED_MUTED, marginRight: 6 }}>
                            {copy.resultCoachingFrLabel}
                          </span>
                          {coach.coaching_fr}
                        </p>
                      )}
                    </div>
                  )}
                  {cHasTransformation && (
                    <div
                      style={{
                        backgroundColor: 'var(--lm-warm-cream)',
                        border: `1px solid ${ED_RULE}`,
                        borderRadius: 4,
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                      }}
                    >
                      <p style={{ fontFamily: SANS, fontWeight: 600, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--lm-warm-peach-deep)', margin: 0 }}>
                        {copy.resultTransformationLabel}
                      </p>
                      <p style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.55, color: 'var(--lm-warm-espresso)', margin: 0 }}>
                        {coach!.transformation}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </details>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onReset}
          className="ed-cta-warm-hover ed-btn-press"
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 14,
            color: '#FFFFFF',
            backgroundColor: ED_ACCENT,
            padding: '12px 24px',
            borderRadius: 4,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {copy.submitAnother}
        </button>
        <button
          type="button"
          onClick={onTryAgain}
          className="ed-btn-press"
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 14,
            color: ED_FG,
            backgroundColor: 'transparent',
            padding: '12px 22px',
            borderRadius: 4,
            border: `1px solid ${ED_RULE}`,
            cursor: 'pointer',
          }}
        >
          {copy.tryAgain}
        </button>
      </div>
    </>
  )
}

// ── V-016a.fe — analyzing / failed panels ─────────────────────────────────

interface AnalyzingPanelProps {
  pollCount: number
  copy: typeof COPY[keyof typeof COPY]
  onCancel: () => void
}

function AnalyzingPanel({ pollCount, copy, onCancel }: AnalyzingPanelProps) {
  // Phase derived from pollCount × 3s. Threshold ~10 polls (30s) and
  // ~20 polls (60s) per spec — gives users a quiet sense of progress
  // without making timing claims we can't honor.
  const phaseCopy =
    pollCount >= 20
      ? copy.analyzingPhase.almost
      : pollCount >= 10
        ? copy.analyzingPhase.still
        : copy.analyzingPhase.initial
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        // Warm-cream panel with sage accent — V-012 calm-pride tone.
        backgroundColor: 'var(--lm-warm-cream)',
        border: `1px solid ${ED_RULE}`,
        borderRadius: 4,
        padding: 'clamp(48px, 8vw, 96px) clamp(24px, 4vw, 48px)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
      }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} aria-hidden="true">
        <span className="ed-spinner-dot ed-spinner-dot-1" />
        <span className="ed-spinner-dot ed-spinner-dot-2" />
        <span className="ed-spinner-dot ed-spinner-dot-3" />
      </div>
      <h2
        style={{
          fontFamily: SERIF,
          fontWeight: 400,
          fontSize: 'clamp(22px, 2.6vw, 30px)',
          lineHeight: 1.2,
          color: 'var(--lm-warm-espresso)',
          margin: 0,
        }}
      >
        {copy.analyzingTitle}
      </h2>
      <p
        style={{
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: 14,
          color: ED_MUTED,
          margin: 0,
          maxWidth: 420,
        }}
      >
        {phaseCopy}
      </p>
      <button
        type="button"
        onClick={onCancel}
        className="ed-btn-press"
        style={{
          marginTop: 8,
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: 13,
          color: ED_FG_SOFT,
          backgroundColor: 'transparent',
          border: `1px solid ${ED_RULE}`,
          padding: '8px 18px',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        {copy.analyzingCancel}
      </button>
    </div>
  )
}

interface FailedPanelProps {
  title: string
  message: string
  retryLabel: string
  onRetry: () => void
}

function FailedPanel({ title, message, retryLabel, onRetry }: FailedPanelProps) {
  return (
    <div
      role="alert"
      style={{
        backgroundColor: ED_PAPER,
        border: `1px solid ${ED_RULE}`,
        borderRadius: 4,
        padding: 'clamp(40px, 6vw, 72px) clamp(24px, 4vw, 48px)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <h2
        style={{
          fontFamily: SERIF,
          fontWeight: 400,
          fontSize: 'clamp(22px, 2.6vw, 30px)',
          lineHeight: 1.2,
          color: ED_FG,
          margin: 0,
          maxWidth: 480,
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: 14,
          color: ED_MUTED,
          margin: 0,
          maxWidth: 420,
        }}
      >
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="ed-cta-warm-hover ed-btn-press"
        style={{
          marginTop: 8,
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 14,
          color: '#FFFFFF',
          backgroundColor: ED_ACCENT,
          padding: '10px 20px',
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

// ── Loading + error states ────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="ed-skeleton" style={{ height: 24, width: 200, borderRadius: 4 }} />
      <div className="ed-skeleton" style={{ height: 48, width: '80%', borderRadius: 4 }} />
      <div className="ed-skeleton" style={{ height: 200, borderRadius: 4 }} />
      <div className="ed-skeleton" style={{ height: 320, borderRadius: 4 }} />
    </div>
  )
}

function NotFoundState({ message, backLabel }: { message: string; backLabel: string }) {
  return (
    <div role="alert" style={{ padding: '48px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <h1 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 28, color: ED_FG, margin: 0 }}>{message}</h1>
      <Link
        href="/l-examen/expression-ecrite"
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 14,
          color: '#FFFFFF',
          backgroundColor: ED_ACCENT,
          padding: '10px 18px',
          borderRadius: 4,
          textDecoration: 'none',
          marginTop: 8,
        }}
      >
        {backLabel}
      </Link>
    </div>
  )
}

function NetworkError({
  message,
  retryLabel,
  onRetry,
}: {
  message: string
  retryLabel: string
  onRetry: () => void
}) {
  return (
    <div role="alert" style={{ padding: '32px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
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
          backgroundColor: ED_ACCENT,
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
