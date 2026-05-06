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
import type { WritingPrompt, WritingSubmissionResult } from '@/lib/types'

const ED_BG = 'var(--ed-bg)'
const ED_FG = 'var(--ed-fg)'
const ED_FG_SOFT = 'var(--ed-fg-soft)'
const ED_MUTED = 'var(--ed-muted)'
const ED_RULE = 'var(--ed-rule)'
const ED_PAPER = 'var(--ed-paper)'
const ED_ACCENT = 'var(--ed-accent)'
const SANS = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'
const SERIF = 'var(--font-fraunces), Georgia, serif'

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
    submitDisabled: 'Reach the minimum word count to submit',
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
  },
  fr: {
    backToLibrary: 'Retour aux sujets',
    showEnglish: 'Afficher en anglais',
    hideEnglish: 'Masquer l’anglais',
    minutes: 'min',
    wordsRange: 'mots demandés',
    yourResponse: 'Votre réponse',
    placeholder: 'Commencez à écrire ici…',
    wordCount: (n: number) => `${n} mots`,
    submit: 'Soumettre pour analyse',
    submitDisabled: 'Atteignez le minimum de mots pour soumettre',
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

type SubmissionState =
  | { kind: 'idle'; text: string }
  | { kind: 'submitting'; text: string }
  | { kind: 'result'; text: string; result: WritingSubmissionResult }
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
  const approachingMax = maxWords > 0 ? Math.floor(maxWords * 0.9) : 0
  const counterColor =
    !prompt
      ? ED_MUTED
      : count < minWords
        ? 'var(--fp-error)'
        : count > maxWords
          ? 'var(--fp-error)'
          : count > approachingMax
            ? 'var(--ed-warm-peach-deep)'
            : 'var(--ed-warm-sage-deep)'
  const canSubmit = prompt != null && count >= minWords && count <= maxWords

  async function handleSubmit() {
    if (!prompt || !canSubmit || submission.kind === 'submitting') return
    const sendText = text
    setSubmission({ kind: 'submitting', text: sendText })
    try {
      const result = await api.writing.submit(prompt.id, sendText)
      setSubmission({ kind: 'result', text: sendText, result })
      // Clear draft on successful submit.
      if (draftKey) {
        try {
          window.localStorage.removeItem(draftKey)
        } catch {}
      }
    } catch (err) {
      // V-014a — surface BE response details so production triage can
      // see the failure cause directly. Generic "Couldn't submit" was
      // masking 422 / 500 / auth status codes.
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
          href="/writing"
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
            color: 'var(--ed-warm-peach-deep)',
            margin: 0,
            marginBottom: 8,
          }}
        >
          Tâche {prompt.tache_level} · {prompt.level} · {prompt.topic_tag}
        </p>
        <h1
          style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
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
      {!canSubmit && !isSubmitting && (
        <p
          style={{
            fontFamily: SANS,
            fontSize: 12,
            color: ED_MUTED,
            marginTop: 8,
            margin: 0,
            paddingTop: 8,
            textAlign: 'right',
          }}
        >
          {copy.submitDisabled}
        </p>
      )}
      {errorMessage && (
        <p
          role="alert"
          style={{
            fontFamily: SANS,
            fontSize: 13,
            color: 'var(--fp-error)',
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
        fontStyle: muted ? 'italic' : 'normal',
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
  const couches: { key: 'le_fond' | 'les_moules_des_idees' | 'les_moules' | 'les_reflexes_anglais'; data: { score: number; feedback: string } }[] = [
    { key: 'le_fond', data: result.couches.le_fond },
    { key: 'les_moules_des_idees', data: result.couches.les_moules_des_idees },
    { key: 'les_moules', data: result.couches.les_moules },
    { key: 'les_reflexes_anglais', data: result.couches.les_reflexes_anglais },
  ]
  return (
    <>
      <p
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 11,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--ed-warm-peach-deep)',
          margin: 0,
          marginBottom: 8,
        }}
      >
        {prompt.title_fr}
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
          marginBottom: 24,
        }}
      >
        {copy.resultTitle}
      </h1>

      {/* Score summary card */}
      <div
        style={{
          backgroundColor: ED_PAPER,
          border: `1px solid ${ED_RULE}`,
          borderRadius: 4,
          padding: 'clamp(20px, 3vw, 32px)',
          marginBottom: 24,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: ED_MUTED, margin: 0, marginBottom: 6 }}>
            {copy.resultScore}
          </p>
          <p style={{ fontFamily: SERIF, fontWeight: 400, fontStyle: 'italic', fontSize: 36, color: 'var(--ed-warm-espresso)', margin: 0 }}>
            {result.overall_score}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: ED_MUTED, margin: 0, marginBottom: 6 }}>
            {copy.resultBand}
          </p>
          <p style={{ fontFamily: SERIF, fontWeight: 400, fontStyle: 'italic', fontSize: 36, color: 'var(--ed-warm-espresso)', margin: 0 }}>
            {result.cefr_band}
          </p>
        </div>
      </div>

      {/* Narrative summary if BE provides it */}
      {result.narrative_summary && (
        <p
          style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
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

      {/* Per-couche breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        {couches.map(({ key, data }) => (
          <div
            key={key}
            style={{
              backgroundColor: ED_PAPER,
              border: `1px solid ${ED_RULE}`,
              borderRadius: 4,
              padding: '16px 20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
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
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 16, color: 'var(--ed-warm-peach-deep)' }}>
                {data.score}
              </span>
            </div>
            <p style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.6, color: ED_FG_SOFT, margin: 0 }}>
              {data.feedback}
            </p>
          </div>
        ))}
      </div>

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
      <h1 style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: 28, color: ED_FG, margin: 0 }}>{message}</h1>
      <Link
        href="/writing"
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
