'use client'

// V-016c — desktop /ecole layout (Option C: lesson-centric).
// Lesson grid is the hero of this surface; right rail carries the
// daily recommendation + exam countdown + streak slot. Mobile <md
// keeps the existing HomeScreen single-column layout.
//
// Data flow mirrors HomeScreen.tsx: api.lessons.list + api.users.getMe
// + api.users.getRecurringModules in parallel. Session-storage flag
// for the just-unlocked-lesson animation is preserved (read on mount,
// cleared once consumed).

import { Fragment, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Lock, Play, Check } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import { useInterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'
import type { Lesson, RecurringModule } from '@/lib/types'

const ED_BG = 'var(--lm-bg-base)'
const ED_FG = 'var(--lm-text-primary)'
const ED_FG_SOFT = 'var(--lm-text-secondary)'
const ED_MUTED = 'var(--lm-text-tertiary)'
const ED_RULE = 'var(--lm-border-subtle)'
const ED_PAPER = 'var(--lm-bg-surface)'
const ED_ACCENT = 'var(--cta-utility)'
const SANS = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'
const SERIF = 'var(--font-source-serif), Georgia, serif'

const TOTAL_LESSONS = 27

const COPY = {
  en: {
    pageEyebrow: "La Méthode",
    pageTitle: 'Your path to B2.',
    progress: (done: number, total: number) => `${done} of ${total} lessons complete`,
    phaseFond: 'Fondations',
    phaseApprof: 'Approfondissement',
    phaseFondRange: 'Lessons 1–16',
    phaseApprofRange: 'Lessons 17–27',
    todayLabel: "Today's session",
    todayCta: 'Open lesson',
    todayEmpty: 'All lessons complete. Loop back to refine.',
    daysLabel: 'Days until exam',
    daysEmpty: 'Set your exam date in /more.',
    streakLabel: 'Streak',
    streakComingSoon: 'Coming soon.',
    loadError: "Couldn't load your path.",
    retry: 'Retry',
    locked: 'Locked',
    inProgress: 'In progress',
    complete: 'Complete',
    // F-BUGS-001-FE-C — 200-empty states are NOT errors. Differentiated
    // from the network/HTTP retry surface by inspecting the user shape:
    // no exam_date → set-exam empty; exam_date set, no lessons →
    // diagnostic-incomplete empty.
    emptyNoExamTitle: 'Set your exam date to start your path.',
    emptyNoExamBody: "Tell us when you sit the TCF and we'll calibrate the 27-lesson sequence to your timeline.",
    emptyNoExamCta: 'Set exam date',
    emptyNoEnrollmentTitle: 'Complete your diagnostic to enroll.',
    emptyNoEnrollmentBody: 'The diagnostic takes a few minutes and unlocks the lesson sequence calibrated to your level.',
    emptyNoEnrollmentCta: 'Start diagnostic',
  },
  fr: {
    pageEyebrow: "La Méthode",
    pageTitle: 'Votre parcours vers le B2.',
    progress: (done: number, total: number) => `${done} sur ${total} leçons terminées`,
    phaseFond: 'Fondations',
    phaseApprof: 'Approfondissement',
    phaseFondRange: 'Leçons 1 à 16',
    phaseApprofRange: 'Leçons 17 à 27',
    todayLabel: 'Session du jour',
    todayCta: 'Ouvrir la leçon',
    todayEmpty: 'Toutes les leçons sont terminées. Revenez pour affiner.',
    daysLabel: "Jours avant l'examen",
    daysEmpty: "Définissez votre date d'examen dans /more.",
    streakLabel: 'Série',
    streakComingSoon: 'Bientôt.',
    loadError: 'Impossible de charger votre parcours.',
    retry: 'Réessayer',
    locked: 'Verrouillé',
    inProgress: 'En cours',
    complete: 'Terminé',
    emptyNoExamTitle: "Définissez votre date d'examen pour démarrer.",
    emptyNoExamBody: "Indiquez-nous quand vous passez le TCF et nous adapterons la séquence de 27 leçons à votre calendrier.",
    emptyNoExamCta: "Définir la date d'examen",
    emptyNoEnrollmentTitle: 'Terminez votre diagnostic pour vous inscrire.',
    emptyNoEnrollmentBody: 'Le diagnostic prend quelques minutes et débloque la séquence de leçons calibrée à votre niveau.',
    emptyNoEnrollmentCta: 'Démarrer le diagnostic',
  },
} as const

function pickNextLesson(lessons: Lesson[]): Lesson | null {
  if (!lessons.length) return null
  return (
    lessons.find((l) => l.status === 'in_progress') ??
    lessons.find((l) => l.status === 'unlocked') ??
    lessons[0]
  )
}

function daysUntilExam(isoDate: string | null | undefined): number | null {
  if (!isoDate) return null
  const exam = new Date(isoDate)
  if (Number.isNaN(exam.getTime())) return null
  exam.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

export default function EcoleDesktop() {
  const language = useInterfaceLanguage()
  const copy = COPY[language]
  const storeUser = useAuthStore((s) => s.user)
  const firstName = storeUser?.fullName?.trim().split(/\s+/)[0] ?? ''

  const [lessons, setLessons] = useState<Lesson[] | null>(null)
  const [recurring, setRecurring] = useState<RecurringModule[]>([])
  const [error, setError] = useState<string | null>(null)
  // F-BUGS-001-FE-A — lessons-specific error captured separately so the
  // page chrome (greeting, right rail with TODAY, recurring modules)
  // keeps rendering even when /api/ecole/lessons fails. Surfaced in the
  // lesson grid only. In dev, the inner detail is surfaced too so future
  // bug repros are 1-click; in prod the surface is the friendly copy.
  const [lessonsErrorDetail, setLessonsErrorDetail] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  const load = useCallback(async () => {
    setError(null)
    setLessonsErrorDetail(null)
    try {
      const [lessonList, me, recurringRes] = await Promise.all([
        // F-BUGS-001-FE-A — wrap in .catch so a non-2xx from
        // /api/ecole/lessons doesn't reject the whole Promise.all and
        // kill the page. Failure surfaces as an empty lesson grid +
        // local retry; the right rail + recurring modules still render.
        api.lessons.list().catch((e: unknown) => {
          // eslint-disable-next-line no-console
          console.error('F-BUGS-001-FE-A lessons load failed', e)
          const detail =
            e instanceof ApiError
              ? `${e.status} ${e.message}`
              : e instanceof Error
                ? e.message
                : String(e)
          setLessonsErrorDetail(detail)
          return [] as Lesson[]
        }),
        api.users.getMe().catch(() => null),
        api.users.getRecurringModules().catch(() => ({ recurring_modules: [] })),
      ])
      setLessons(lessonList)
      setRecurring(recurringRes.recurring_modules ?? [])
      if (me) {
        const token = useAuthStore.getState().token
        if (token) useAuthStore.getState().setAuth(token, me)
      }
    } catch (err) {
      // Outer catch retained as a safety net for unforeseen synchronous
      // throws. lessons-specific failures land in lessonsErrorDetail above
      // and don't reach this branch.
      if (err instanceof ApiError) setError(copy.loadError)
      else setError(copy.loadError)
    }
  }, [copy.loadError])

  useEffect(() => {
    load()
  }, [load, retryKey])

  const completedCount = lessons?.filter((l) => l.status === 'completed').length ?? 0
  const progressPct = Math.round((completedCount / TOTAL_LESSONS) * 100)
  const nextLesson = lessons ? pickNextLesson(lessons) : null
  // V-016c.fix — split by lessonNumber instead of the BE phase field. The
  // curriculum boundary is locked at 1-16 / 17-27 per F-087, and the BE
  // phase field was unreliable in prod (missing / wrong type) which sank
  // every lesson into Fondations and left Approfondissement empty.
  const fondations = lessons?.filter((l) => l.lessonNumber <= 16) ?? []
  const approfondissement = lessons?.filter((l) => l.lessonNumber >= 17) ?? []
  // F-BUGS-001-FE-C — four-way state machine for the lesson grid:
  //   1. lessonsErrorDetail set    → /api/ecole/lessons failed (network,
  //                                  401, 5xx). Render LessonGridError +
  //                                  Retry. lessons[] is [] from the catch.
  //   2. lessons==[] && no exam_date → 200 with empty payload AND user has
  //                                  no exam date set. Route to /profile.
  //   3. lessons==[] && exam_date set → 200 with empty payload but exam
  //                                  date present → user hasn't finished
  //                                  the diagnostic / enrolled. Route to
  //                                  /diagnostic.
  //   4. lessons.length>0          → render the phase grid normally.
  const lessonsLoadFailed = lessonsErrorDetail !== null
  const lessonsEmptyOk = lessons !== null && lessons.length === 0 && !lessonsLoadFailed
  const hasExamDate = !!storeUser?.examDate
  const examDays = daysUntilExam(storeUser?.examDate ?? null)
  const greeting =
    firstName
      ? language === 'fr'
        ? `Bonjour, ${firstName}.`
        : `Bonjour, ${firstName}.`
      : language === 'fr'
        ? 'Bonjour.'
        : 'Bonjour.'

  return (
    <div className="ed-page-enter" style={{ minHeight: 'calc(100dvh - 64px)', backgroundColor: ED_BG, fontFamily: SANS }}>
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: 'clamp(40px, 5vw, 72px) clamp(24px, 4vw, 48px)',
        }}
      >
        {/* Page header — eyebrow + title + progress strip */}
        <header style={{ marginBottom: 48 }}>
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
            {copy.pageEyebrow}
          </p>
          <h1
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(36px, 5vw, 56px)',
              lineHeight: 1.1,
              letterSpacing: '-0.015em',
              color: ED_FG,
              margin: 0,
              marginBottom: 8,
            }}
          >
            {copy.pageTitle}
          </h1>
          <p style={{ fontFamily: SANS, fontWeight: 500, fontSize: 14, color: ED_FG_SOFT, margin: 0, marginBottom: 24 }}>
            {greeting}
          </p>
          {/* Progress strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div
              role="progressbar"
              aria-valuenow={completedCount}
              aria-valuemin={0}
              aria-valuemax={TOTAL_LESSONS}
              style={{
                flex: 1,
                minWidth: 240,
                height: 8,
                borderRadius: 100,
                backgroundColor: 'var(--lm-warm-cream)',
                border: `1px solid ${ED_RULE}`,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progressPct}%`,
                  height: '100%',
                  backgroundColor: 'var(--lm-warm-peach-deep)',
                  borderRadius: 100,
                  transition: 'width 600ms var(--lm-ease-spring)',
                }}
              />
            </div>
            <span
              style={{
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 13,
                color: ED_FG,
                whiteSpace: 'nowrap',
              }}
            >
              {copy.progress(completedCount, TOTAL_LESSONS)}
            </span>
          </div>
        </header>

        {/* Body grid: lesson grid (left) + right rail.
            F-BUGS-001-FE-A — when /api/ecole/lessons fails, the lesson
            grid renders a local error card but the right rail (today's
            session, exam countdown, streak) keeps rendering against
            whatever data was loaded. Full-page outer-error guard stays
            for unforeseen synchronous throws. */}
        {error ? (
          <ErrorRetry message={error} retryLabel={copy.retry} onRetry={() => setRetryKey((k) => k + 1)} />
        ) : !lessons ? (
          <LoadingSkeleton />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 320px)',
              gap: 'clamp(24px, 3vw, 40px)',
            }}
          >
            {/* LEFT — lesson grid by phase (or local error / empty).
                F-BUGS-001-FE-C: four-way branch. Network/HTTP error keeps
                the existing Retry surface (F-BUGS-001-FE-A); 200-empty
                splits by exam_date into Set-exam-date or Start-diagnostic. */}
            <main>
              {lessonsLoadFailed ? (
                <LessonGridError
                  message={copy.loadError}
                  retryLabel={copy.retry}
                  detail={lessonsErrorDetail}
                  onRetry={() => setRetryKey((k) => k + 1)}
                />
              ) : lessonsEmptyOk ? (
                <LessonGridEmpty
                  title={hasExamDate ? copy.emptyNoEnrollmentTitle : copy.emptyNoExamTitle}
                  body={hasExamDate ? copy.emptyNoEnrollmentBody : copy.emptyNoExamBody}
                  ctaLabel={hasExamDate ? copy.emptyNoEnrollmentCta : copy.emptyNoExamCta}
                  ctaHref={hasExamDate ? '/l-examen' : '/profile'}
                />
              ) : (
                <>
              <PhaseSection
                title={copy.phaseFond}
                rangeLabel={copy.phaseFondRange}
                lessons={fondations}
                language={language}
                copy={copy}
              />
              <div style={{ height: 48 }} />
              <PhaseSection
                title={copy.phaseApprof}
                rangeLabel={copy.phaseApprofRange}
                lessons={approfondissement}
                language={language}
                copy={copy}
              />
                </>
              )}
            </main>

            {/* RIGHT rail — daily recommendation + countdown + streak */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 16, alignSelf: 'start', position: 'sticky', top: 96 }}>
              <RailCard label={copy.todayLabel} warm>
                {nextLesson ? (
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
                        marginBottom: 6,
                      }}
                    >
                      {language === 'fr' ? 'Leçon' : 'Lesson'} {nextLesson.lessonNumber}
                    </p>
                    <p
                      style={{
                        fontFamily: SERIF,
                        fontStyle: 'italic',
                        fontWeight: 400,
                        fontSize: 22,
                        lineHeight: 1.2,
                        color: 'var(--lm-warm-espresso)',
                        margin: 0,
                        marginBottom: 16,
                      }}
                    >
                      {nextLesson.title}
                    </p>
                    <Link
                      href={`/la-methode/lesson/${nextLesson.lessonNumber}`}
                      className="ed-cta-warm-hover ed-btn-press"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '10px 18px',
                        borderRadius: 4,
                        backgroundColor: ED_ACCENT,
                        color: '#FFFFFF',
                        fontFamily: SANS,
                        fontWeight: 600,
                        fontSize: 13,
                        textDecoration: 'none',
                      }}
                    >
                      {copy.todayCta}
                    </Link>
                  </>
                ) : (
                  <p style={{ fontFamily: SANS, fontSize: 13, color: ED_MUTED, margin: 0 }}>{copy.todayEmpty}</p>
                )}
              </RailCard>

              <RailCard label={copy.daysLabel}>
                {examDays !== null ? (
                  <p
                    style={{
                      fontFamily: SERIF,
                      fontStyle: 'italic',
                      fontWeight: 400,
                      fontSize: 36,
                      lineHeight: 1,
                      color: 'var(--lm-warm-espresso)',
                      margin: 0,
                    }}
                  >
                    {examDays}
                  </p>
                ) : (
                  <p style={{ fontFamily: SANS, fontSize: 13, color: ED_MUTED, margin: 0 }}>{copy.daysEmpty}</p>
                )}
              </RailCard>

              <RailCard label={copy.streakLabel}>
                <p style={{ fontFamily: SANS, fontSize: 13, color: ED_MUTED, margin: 0 }}>{copy.streakComingSoon}</p>
              </RailCard>

              {recurring.length > 0 && (
                <RailCard label={language === 'fr' ? 'Recommandé' : 'Recommended'}>
                  <p style={{ fontFamily: SANS, fontSize: 13, color: ED_FG_SOFT, margin: 0 }}>
                    {recurring.length}{' '}
                    {language === 'fr' ? 'modules détectés sur vos sessions récentes.' : 'modules detected from recent sessions.'}
                  </p>
                </RailCard>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Phase section ─────────────────────────────────────────────────────────

interface PhaseSectionProps {
  title: string
  rangeLabel: string
  lessons: Lesson[]
  language: 'en' | 'fr'
  copy: typeof COPY[keyof typeof COPY]
}

function PhaseSection({ title, rangeLabel, lessons, language, copy }: PhaseSectionProps) {
  return (
    <section aria-label={title}>
      <header style={{ marginBottom: 16, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <h2
          style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(22px, 2.4vw, 28px)',
            letterSpacing: '-0.01em',
            color: 'var(--lm-warm-espresso)',
            margin: 0,
          }}
        >
          {title}
        </h2>
        <span
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: ED_MUTED,
          }}
        >
          {rangeLabel}
        </span>
      </header>
      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        }}
      >
        {lessons.map((lesson) => (
          <Fragment key={lesson.id}>
            <LessonCard lesson={lesson} language={language} copy={copy} />
          </Fragment>
        ))}
      </div>
    </section>
  )
}

// ── Lesson card ───────────────────────────────────────────────────────────

interface LessonCardProps {
  lesson: Lesson
  language: 'en' | 'fr'
  copy: typeof COPY[keyof typeof COPY]
}

function LessonCard({ lesson, copy }: LessonCardProps) {
  const isLocked = lesson.status === 'locked'
  const isCompleted = lesson.status === 'completed'
  const isInProgress = lesson.status === 'in_progress' || lesson.status === 'unlocked'
  const StatusIcon = isLocked ? Lock : isCompleted ? Check : Play
  const statusLabel = isLocked ? copy.locked : isCompleted ? copy.complete : copy.inProgress
  const statusColor = isLocked
    ? ED_MUTED
    : isCompleted
      ? 'var(--lm-warm-sage-deep)'
      : 'var(--lm-warm-peach-deep)'
  const card = (
    <div
      className="ed-card-lift"
      style={{
        backgroundColor: ED_PAPER,
        border: `1px solid ${ED_RULE}`,
        borderRadius: 4,
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        height: '100%',
        opacity: isLocked ? 0.6 : 1,
        cursor: isLocked ? 'default' : 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span
          style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 18,
            color: 'var(--lm-warm-espresso)',
          }}
        >
          {String(lesson.lessonNumber).padStart(2, '0')}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 10,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: statusColor,
          }}
        >
          <StatusIcon size={12} strokeWidth={2.25} />
          {statusLabel}
        </span>
      </div>
      <h3
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 14,
          lineHeight: 1.35,
          color: ED_FG,
          margin: 0,
        }}
      >
        {lesson.title}
      </h3>
      {lesson.shortDescription && (
        <p
          style={{
            fontFamily: SANS,
            fontWeight: 400,
            fontSize: 12,
            lineHeight: 1.55,
            color: ED_FG_SOFT,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {lesson.shortDescription}
        </p>
      )}
    </div>
  )
  if (isLocked) return card
  return (
    <Link href={`/la-methode/lesson/${lesson.lessonNumber}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      {card}
    </Link>
  )
}

// ── Rail card primitive ───────────────────────────────────────────────────

function RailCard({ label, warm, children }: { label: string; warm?: boolean; children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: warm ? 'var(--lm-warm-cream)' : ED_PAPER,
        border: `1px solid ${ED_RULE}`,
        borderRadius: 4,
        padding: '18px 22px',
      }}
    >
      <p
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: ED_MUTED,
          margin: 0,
          marginBottom: 12,
        }}
      >
        {label}
      </p>
      {children}
    </div>
  )
}

// ── States ────────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 320px)',
        gap: 32,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[0, 1].map((i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="ed-skeleton" style={{ height: 28, width: 200, borderRadius: 4 }} />
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
              {[0, 1, 2, 3].map((j) => (
                <div key={j} className="ed-skeleton" style={{ height: 130, borderRadius: 4 }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="ed-skeleton" style={{ height: 160, borderRadius: 4 }} />
        <div className="ed-skeleton" style={{ height: 100, borderRadius: 4 }} />
        <div className="ed-skeleton" style={{ height: 100, borderRadius: 4 }} />
      </div>
    </div>
  )
}

function ErrorRetry({ message, retryLabel, onRetry }: { message: string; retryLabel: string; onRetry: () => void }) {
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

// F-BUGS-001-FE-C — 200-empty empty state. NOT an error surface: the API
// succeeded with an empty lesson list because the user either hasn't set
// an exam date or hasn't completed the diagnostic. Caller picks the copy
// + CTA target by inspecting storeUser.examDate.
function LessonGridEmpty({
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  title: string
  body: string
  ctaLabel: string
  ctaHref: string
}) {
  return (
    <div
      style={{
        padding: '40px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 4,
      }}
    >
      <p
        style={{
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 22,
          lineHeight: 1.25,
          color: 'var(--lm-warm-espresso)',
          margin: 0,
          maxWidth: 480,
        }}
      >
        {title}
      </p>
      <p style={{ fontFamily: SANS, fontWeight: 400, fontSize: 14, lineHeight: 1.55, color: ED_FG_SOFT, margin: 0, maxWidth: 480 }}>
        {body}
      </p>
      <Link
        href={ctaHref}
        className="ed-btn-press"
        style={{
          marginTop: 4,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 18px',
          borderRadius: 4,
          backgroundColor: ED_ACCENT,
          color: '#FFFFFF',
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 13,
          textDecoration: 'none',
        }}
      >
        {ctaLabel}
      </Link>
    </div>
  )
}

// F-BUGS-001-FE-A — local lesson-grid error surface. Renders inside the
// main column when /api/ecole/lessons fails; the right rail keeps
// rendering against whatever else loaded. In dev, the raw error detail
// (status + message) is surfaced so future bug repros are 1-click.
function LessonGridError({
  message,
  retryLabel,
  detail,
  onRetry,
}: {
  message: string
  retryLabel: string
  detail: string | null
  onRetry: () => void
}) {
  const showDetail = process.env.NODE_ENV !== 'production' && detail
  return (
    <div
      role="alert"
      style={{
        padding: '40px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 4,
      }}
    >
      <p style={{ fontFamily: SANS, fontWeight: 500, fontSize: 15, color: ED_FG, margin: 0 }}>{message}</p>
      {showDetail && (
        <code
          style={{
            fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
            fontSize: 12,
            color: ED_MUTED,
            backgroundColor: 'var(--bg-subtle)',
            padding: '6px 10px',
            borderRadius: 3,
            maxWidth: '100%',
            wordBreak: 'break-word',
          }}
        >
          {detail}
        </code>
      )}
      <button
        type="button"
        onClick={onRetry}
        className="ed-btn-press"
        style={{
          marginTop: 4,
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
