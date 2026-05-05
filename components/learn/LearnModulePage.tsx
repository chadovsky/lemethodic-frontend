'use client'

// F-080d — full module reading page at /learn/[module_id]. Reached from
// (1) home tab "Recommended for you" cards (orphan modules direct,
// linked modules via the LearnModuleSheet "Just read about this
// pattern" CTA), and (2) the diagnostic page DetectedModuleCard "Learn
// this" button (same routing rules).
//
// Cold state: when user_context is null (unauthenticated request OR
// authed user with zero detections of this module), the page still
// renders — module title, prose, examples — but the recurrence pill is
// suppressed. This is the glossary-entry path; pre-launch we wrap the
// route in ProtectedRoute so cold state means "logged-in user who
// hasn't triggered the module," not "anonymous visitor." (F-080d.y
// flips that for post-launch SEO.)

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { fr as frLocale } from 'date-fns/locale'
import ModuleExamples from '@/components/diagnostic/ModuleExamples'
import { api, ApiError } from '@/lib/api'
import { useInterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'
import type { Lesson, ModuleCategory, ModuleWithContext } from '@/lib/types'

// F-206 — page chrome migrated to editorial system. CATEGORY_BG pastels
// preserved per F-200 rule (data-display chip layer for module category).
const INK          = 'var(--ed-fg)'
const INK_SOFT     = 'var(--ed-muted)'
const INK_MUTED    = 'var(--ed-muted)'
const BG           = 'var(--ed-bg)'
const DISPLAY_FONT = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'

const CATEGORY_BG: Record<ModuleCategory, string> = {
  vocab_calque:        '#FFD8C2',
  discourse_structure: '#E0D4F0',
  grammar_interference:'#FFF0C2',
  pronunciation:       '#C7DFEA',
  register_mismatch:   '#F4CFD8',
  word_order:          '#D4E4D0',
  verb_aspect:         '#E8E4D8',
  other:               '#1A1A1A0F',
}

const CATEGORY_LABEL: Record<'fr' | 'en', Record<ModuleCategory, string>> = {
  fr: {
    vocab_calque:        'Calque lexical',
    discourse_structure: 'Structure du discours',
    grammar_interference:'Interférence grammaticale',
    pronunciation:       'Prononciation',
    register_mismatch:   'Registre',
    word_order:          'Ordre des mots',
    verb_aspect:         'Aspect verbal',
    other:               'Autre',
  },
  en: {
    vocab_calque:        'Vocabulary calque',
    discourse_structure: 'Discourse structure',
    grammar_interference:'Grammar interference',
    pronunciation:       'Pronunciation',
    register_mismatch:   'Register',
    word_order:          'Word order',
    verb_aspect:         'Verb aspect',
    other:               'Other',
  },
}

const COPY = {
  fr: {
    severity: 'Sévérité',
    detectedSessions: (n: number) => `Détecté dans ${n} session${n > 1 ? 's' : ''}`,
    mostRecently: (rel: string) => `· le plus récemment ${rel}`,
    backToEcole: "Retour à L'École",
    closeAndReturn: 'Ou simplement fermer',
    goDeeperPrefix: 'Approfondir avec la leçon',
  },
  en: {
    severity: 'Severity',
    detectedSessions: (n: number) => `Detected in ${n} session${n > 1 ? 's' : ''}`,
    mostRecently: (rel: string) => `· most recently ${rel}`,
    backToEcole: "Back to L'École",
    closeAndReturn: 'Or just close this',
    goDeeperPrefix: 'Go deeper in Lesson',
  },
} as const

interface Props {
  moduleId: string
}

export default function LearnModulePage({ moduleId }: Props) {
  const router = useRouter()
  const lang = useInterfaceLanguage()
  const copy = lang === 'fr' ? COPY.fr : COPY.en

  const [moduleData, setModuleData] = useState<ModuleWithContext | null>(null)
  const [linkedLesson, setLinkedLesson] = useState<Lesson | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [retryKey, setRetryKey] = useState(0)

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      // The module is the load-blocker. Lessons fetch in parallel only
      // for the linked-lesson title; its failure is non-fatal — falls
      // back to "Lesson N" with no title.
      const [m, lessons] = await Promise.all([
        api.modules.get(moduleId),
        api.lessons.list().catch(() => [] as Lesson[]),
      ])
      setModuleData(m)
      if (m.ecole_lesson_id != null) {
        setLinkedLesson(lessons.find((l) => l.lessonNumber === m.ecole_lesson_id) ?? null)
      } else {
        setLinkedLesson(null)
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setLoadError(lang === 'fr' ? 'Module introuvable.' : 'Module not found.')
      } else if (err instanceof ApiError) {
        setLoadError(err.message || (lang === 'fr' ? 'Échec du chargement.' : 'Could not load this module.'))
      } else {
        setLoadError(lang === 'fr' ? "Impossible de joindre le serveur." : "Couldn't reach the server.")
      }
    } finally {
      setIsLoading(false)
    }
  }, [moduleId, lang])

  useEffect(() => {
    void fetchAll()
  }, [fetchAll, retryKey])

  // Loading skeleton
  if (isLoading && !moduleData) {
    return <LoaderScreen />
  }
  if (loadError && !moduleData) {
    return (
      <ErrorScreen
        message={loadError}
        onRetry={() => setRetryKey((k) => k + 1)}
        backLabel={copy.backToEcole}
        onBack={() => router.push('/ecole')}
      />
    )
  }
  if (!moduleData) {
    // Shouldn't reach — loading + error gates handle null. Defensive.
    return <LoaderScreen />
  }

  const m = moduleData
  const name = lang === 'fr' ? m.name_fr : m.name_en
  const description = lang === 'fr' ? m.L1_interference_description_fr : m.L1_interference_description_en
  const categoryLabel = (lang === 'fr' ? CATEGORY_LABEL.fr : CATEGORY_LABEL.en)[m.category]

  // Recurrence pill — suppressed in cold state (user_context null OR
  // recurrence_count zero, which the backend should never emit but
  // belt-and-braces).
  const ctx = m.user_context
  let recurrencePill: string | null = null
  if (ctx && ctx.recurrence_count > 0) {
    let mostRecently = ''
    try {
      const parsed = parseISO(ctx.last_detected_at)
      const rel = formatDistanceToNow(parsed, {
        addSuffix: true,
        locale: lang === 'fr' ? frLocale : undefined,
      })
      mostRecently = ` ${copy.mostRecently(rel)}`
    } catch {
      // Malformed ISO? Skip the relative-time half. Pill still renders
      // the count.
      mostRecently = ''
    }
    recurrencePill = `${copy.detectedSessions(ctx.recurrence_count)}${mostRecently}`
  }

  const linkedLessonNumber = m.ecole_lesson_id
  const linkedLessonTitle = linkedLesson?.title
  const linkedLessonSubline = linkedLesson?.sublineEn ?? null

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: BG, fontFamily: DISPLAY_FONT }}>
      <div style={{ maxWidth: 720, margin: '0 auto', paddingBottom: 120 }}>
        {/* Header */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            backgroundColor: BG,
            padding: '14px 16px 10px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#1A1A1A0F',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: INK,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <ChevronLeft size={20} strokeWidth={2.25} />
          </button>
        </header>

        <div
          style={{
            padding: '4px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* Module hero card */}
          <div
            style={{
              backgroundColor: CATEGORY_BG[m.category],
              borderRadius: 24,
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: INK_SOFT,
                }}
              >
                {categoryLabel}
              </span>
              <SeverityScale value={m.severity} label={copy.severity} />
            </div>

            <h1
              style={{
                margin: 0,
                fontFamily: DISPLAY_FONT,
                fontWeight: 800,
                fontSize: 26,
                lineHeight: 1.2,
                color: INK,
              }}
            >
              {name}
            </h1>

            {recurrencePill && (
              <span
                style={{
                  alignSelf: 'flex-start',
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 600,
                  fontSize: 12,
                  color: INK_SOFT,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 100,
                  padding: '6px 12px',
                }}
              >
                {recurrencePill}
              </span>
            )}
          </div>

          {/* Long-form description */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              padding: '20px 20px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: DISPLAY_FONT,
                fontWeight: 500,
                fontSize: 15,
                lineHeight: '23px',
                color: INK,
              }}
            >
              {description}
            </p>
          </div>

          {/* Examples — expanded by default on this page (no toggle). */}
          {m.examples.length > 0 && (
            <section aria-label="Examples" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  color: INK_MUTED,
                  margin: '4px 0 0',
                }}
              >
                {lang === 'fr' ? 'Exemples' : 'Examples'}
              </p>
              <ModuleExamples examples={m.examples} />
            </section>
          )}

          {/* Footer CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {linkedLessonNumber != null ? (
              <>
                <button
                  type="button"
                  onClick={() => router.push(`/ecole/lesson/${linkedLessonNumber}`)}
                  style={{
                    width: '100%',
                    minHeight: 56,
                    borderRadius: 16,
                    border: 'none',
                    backgroundColor: INK,
                    color: '#FFFFFF',
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer',
                    padding: '14px 18px',
                    textAlign: 'left',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <span style={{ display: 'block' }}>
                    {linkedLessonTitle
                      ? `${copy.goDeeperPrefix} ${linkedLessonNumber}: ${linkedLessonTitle}`
                      : `${copy.goDeeperPrefix} ${linkedLessonNumber}`}
                  </span>
                  {linkedLessonSubline && (
                    <span style={{ display: 'block', marginTop: 4, fontSize: 13, fontWeight: 500, opacity: 0.7, lineHeight: 1.5 }}>
                      {linkedLessonSubline}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 600,
                    fontSize: 14,
                    color: INK_SOFT,
                    cursor: 'pointer',
                    padding: '10px 0',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {copy.closeAndReturn}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => router.push('/ecole')}
                style={{
                  width: '100%',
                  minHeight: 56,
                  borderRadius: 16,
                  border: 'none',
                  backgroundColor: INK,
                  color: '#FFFFFF',
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {copy.backToEcole}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SeverityScale({ value, label }: { value: number; label: string }) {
  const dots = [1, 2, 3, 4, 5]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 600,
          fontSize: 10,
          letterSpacing: '0.04em',
          color: INK_MUTED,
        }}
      >
        {label}
      </span>
      <div style={{ display: 'flex', gap: 3 }} aria-label={`${label} ${value}/5`}>
        {dots.map((d) => (
          <span
            key={d}
            aria-hidden="true"
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: d <= value ? INK : '#1A1A1A24',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function LoaderScreen() {
  return <div style={{ minHeight: '100dvh', backgroundColor: BG }} aria-label="Loading module" />
}

function ErrorScreen({
  message,
  onRetry,
  backLabel,
  onBack,
}: {
  message: string
  onRetry: () => void
  backLabel: string
  onBack: () => void
}) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: BG,
        fontFamily: DISPLAY_FONT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        gap: 16,
      }}
      role="alert"
    >
      <p style={{ fontWeight: 700, fontSize: 18, color: INK, margin: 0, textAlign: 'center' }}>{message}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={onRetry}
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: 14,
            color: '#FFFFFF',
            backgroundColor: INK,
            border: 'none',
            borderRadius: 12,
            padding: '10px 18px',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
        <button
          type="button"
          onClick={onBack}
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 600,
            fontSize: 14,
            color: INK_SOFT,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '10px 12px',
          }}
        >
          {backLabel}
        </button>
      </div>
    </div>
  )
}
