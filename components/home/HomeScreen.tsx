'use client'

import { Fragment, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import DailyActionCard from './DailyActionCard'
import EcoleProgress from './EcoleProgress'
import LessonListItem, { type LessonStatus as ItemStatus } from './LessonListItem'
import BottomNav from './BottomNav'
import RecurringModuleCard from '@/components/modules/RecurringModuleCard'
import LearnModuleSheet from '@/components/modules/LearnModuleSheet'
import { useAuthStore } from '@/lib/auth'
import { api, ApiError } from '@/lib/api'
import type { Lesson, RecurringModule } from '@/lib/types'

// ─── design tokens ───────────────────────────────────────────────────────────
// F-206 — page chrome migrated to editorial system. DailyActionCard
// pastels (peach/butter/sage/lavender) preserved as accent layer per
// F-200 rule. F-202 (L'École intro rebuild) eventually supersedes this
// surface entirely; F-206 is the interim chrome fix.
const INK         = 'var(--lm-text-primary)'
const INK_SOFT    = 'var(--lm-text-tertiary)'
const INK_MUTED   = 'var(--lm-text-tertiary)'
const PEACH       = 'var(--lm-pastel-peach)'
const BUTTER      = 'var(--lm-pastel-butter)'
const SAGE        = 'var(--lm-pastel-sage)'
const LAVENDER    = 'var(--lm-pastel-lavender)'
const BG          = 'var(--lm-bg-base)'
const DISPLAY_FONT = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'

// F-087 — 27 lessons total: Phase 1 Fondations (1-16) + Phase 2
// Approfondissement (17-27). Visual separator inserted between lesson
// 16 and 17 in the rendering loop below.
const TOTAL_LESSONS = 27

// ─── helpers ─────────────────────────────────────────────────────────────────

// Backend statuses ("locked" | "unlocked" | "in_progress" | "completed") flatten
// to the three visual states LessonListItem renders. "unlocked" (prereq met,
// not started yet) collapses into "in-progress" so it shows the play icon and
// is clickable — same UX as a lesson the user has opened but not finished.
function toItemStatus(s: Lesson['status']): ItemStatus {
  if (s === 'completed') return 'complete'
  if (s === 'in_progress' || s === 'unlocked') return 'in-progress'
  return 'locked'
}

// The card at the top picks the "what should I do next" lesson. Priority:
// 1) any in_progress lesson, 2) first unlocked-but-not-started, 3) first lesson.
function pickNextLesson(lessons: Lesson[]): Lesson | null {
  if (!lessons.length) return null
  return (
    lessons.find((l) => l.status === 'in_progress') ??
    lessons.find((l) => l.status === 'unlocked') ??
    lessons[0]
  )
}

// exam_date is stored as YYYY-MM-DD. Compute whole-day delta, clamped at 0.
// Returns null when there's no exam date set (user should see a CTA instead).
function daysUntilExam(isoDate: string | null | undefined): number | null {
  if (!isoDate) return null
  const exam = new Date(isoDate)
  if (Number.isNaN(exam.getTime())) return null
  exam.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round(
    (exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )
  return Math.max(0, diff)
}

// ─── props ───────────────────────────────────────────────────────────────────
// Props are overrides for storybook/testing. In normal use they're all
// undefined and HomeScreen sources data from the auth store + API.
interface HomeScreenProps {
  userName?: string
  streakDays?: number
  daysUntilExam?: number
  completedLessons?: number
}

// TODO(Phase 4.5): streak tracking — there's no /api/users/me streak field
// today. Leaving displayStreak = 0 with a neutral "Start your streak" affordance
// until a real streak endpoint lands.
export default function HomeScreen({
  userName,
  streakDays,
  daysUntilExam: daysUntilExamProp,
  completedLessons: completedLessonsProp,
}: HomeScreenProps) {
  // ─── auth-store backed user data ─────────────────────────────────────────
  const storeUser = useAuthStore((s) => s.user)
  const firstName = storeUser?.fullName?.trim().split(/\s+/)[0] ?? ''
  const resolvedName = userName ?? firstName
  const displayName = resolvedName || 'there'
  const avatarInitial = (resolvedName || 'F').charAt(0).toUpperCase()

  // ─── fetch state ─────────────────────────────────────────────────────────
  const router = useRouter()
  const [lessons, setLessons] = useState<Lesson[] | null>(null)
  // P-115 — when a quiz finished with a passing score, the QuizClient
  // wrote the next-lesson number to sessionStorage. Read once on mount,
  // surface it to the matching LessonListItem so it can play the
  // unlock animation, then clear the flag so a refresh doesn't replay.
  const [justUnlockedLesson, setJustUnlockedLesson] = useState<number | null>(null)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('lemethodic:unlocked-lesson')
      if (raw) {
        const n = parseInt(raw, 10)
        if (Number.isFinite(n)) setJustUnlockedLesson(n)
        sessionStorage.removeItem('lemethodic:unlocked-lesson')
      }
    } catch {
      // sessionStorage can throw in private-browsing modes — animation is
      // decorative, no-op.
    }
  }, [])
  // F-080d — recurring modules for the "Recommended for you" section.
  // Empty array = section hidden entirely (no banner, no header). Failure
  // to fetch is non-fatal; section just stays hidden.
  const [recurringModules, setRecurringModules] = useState<RecurringModule[]>([])
  const [pickerModule, setPickerModule] = useState<RecurringModule | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  const load = useCallback(async () => {
    setFetchError(null)
    try {
      // Lessons drive progress + the "Today" card. /me is refreshed in the
      // background to pick up any backend updates (e.g. exam_date edited
      // elsewhere); its failure must not block lesson rendering.
      // F-080d: recurring_modules added to the parallel fetch — its failure
      // is non-fatal (section just stays hidden).
      // F-BUGS-001-FE-A: lessons.list() also wrapped in .catch so a
      // non-2xx (token expired, 5xx, etc.) doesn't reject Promise.all
      // and kill the whole page. Failure routes to the existing local
      // fetchError display inside the lesson list (line 509+); page
      // chrome (greeting, recurring modules, TÂCHE 2 card) keeps
      // rendering. In dev the inner detail is surfaced too.
      const [lessonList, me, recurring] = await Promise.all([
        api.lessons.list().catch((e: unknown) => {
          // eslint-disable-next-line no-console
          console.error('F-BUGS-001-FE-A lessons load failed', e)
          const detail =
            e instanceof ApiError
              ? `${e.status} ${e.message}`
              : e instanceof Error
                ? e.message
                : String(e)
          const friendly = "Couldn't load your path."
          setFetchError(
            process.env.NODE_ENV !== 'production'
              ? `${friendly} (${detail})`
              : friendly,
          )
          return [] as Lesson[]
        }),
        api.users.getMe().catch(() => null),
        api.users.getRecurringModules().catch(() => ({ recurring_modules: [] })),
      ])
      setLessons(lessonList)
      setRecurringModules(recurring.recurring_modules ?? [])
      if (me) {
        const token = useAuthStore.getState().token
        if (token) useAuthStore.getState().setAuth(token, me)
      }
    } catch (err) {
      // Outer catch retained as a safety net for unforeseen synchronous
      // throws. lessons-specific failures land in the .catch above and
      // don't reach this branch.
      if (err instanceof ApiError) {
        setFetchError("Couldn't load your path.")
      } else {
        setFetchError("Couldn't reach the server.")
      }
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, retryKey])

  // F-080d — tap routing for recurring module cards. Linked modules open
  // the LearnModuleSheet picker; orphan modules route straight to the
  // standalone /learn/[id] page.
  const handleRecurringTap = useCallback(
    (m: RecurringModule) => {
      if (m.ecole_lesson_id != null) {
        setPickerModule(m)
      } else {
        router.push(`/learn/${m.module_id}`)
      }
    },
    [router],
  )

  // Pre-resolved lesson title + subline for the picker (HomeScreen
  // already has the lessons list cached, save the sheet a roundtrip).
  const pickerLesson =
    pickerModule != null && pickerModule.ecole_lesson_id != null && lessons
      ? lessons.find((l) => l.lessonNumber === pickerModule.ecole_lesson_id)
      : undefined
  const pickerLessonTitle = pickerLesson?.title
  const pickerLessonSubline = pickerLesson?.sublineEn ?? undefined

  // ─── derived values ──────────────────────────────────────────────────────
  const fetchedCompleted = lessons?.filter((l) => l.status === 'completed').length ?? 0
  const effectiveCompleted = completedLessonsProp ?? fetchedCompleted
  const nextLesson = lessons ? pickNextLesson(lessons) : null

  const effectiveExamDays = daysUntilExamProp ?? daysUntilExam(storeUser?.examDate ?? null)
  const displayStreak = streakDays ?? 0

  // ─── render ──────────────────────────────────────────────────────────────
  return (
    <div
      className="ed-page-enter"
      style={{
        minHeight: '100dvh',
        backgroundColor: BG,
        fontFamily: DISPLAY_FONT,
      }}
    >
      <div
        style={{
          // F-206 — column widened 440 → 720, fixes desktop white-rails.
          maxWidth: 720,
          margin: '0 auto',
          position: 'relative',
        }}
      >
        {/* ── Top bar ─────────────────────────────────────────────── */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            height: 'calc(56px + var(--lm-safe-top))',
            backgroundColor: BG,
            borderBottom: '1px solid #1A1A1A0A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--lm-safe-top) 16px 0 16px',
          }}
        >
          <Link
            href="/profil"
            aria-label={`${displayName}'s profile`}
            style={{ textDecoration: 'none', WebkitTapHighlightColor: 'transparent' }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: PEACH,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 800,
                  fontSize: 15,
                  color: INK,
                  lineHeight: 1,
                }}
              >
                {avatarInitial}
              </span>
            </div>
          </Link>

          <h1
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 18,
              color: INK,
              margin: 0,
            }}
          >
            La Méthode
          </h1>

          <button
            aria-label="Notifications"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 10,
              color: INK_MUTED,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell size={20} strokeWidth={1.75} />
          </button>
        </header>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <main style={{ padding: '24px 16px', paddingBottom: 88 }}>
          {/* Greeting + streak */}
          <div style={{ marginBottom: 16 }}>
            <h2
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 700,
                fontSize: 28,
                lineHeight: '34px',
                color: INK,
                margin: 0,
                marginBottom: 6,
              }}
            >
              Bonjour, {displayName}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF6B35" stroke="none" aria-hidden="true">
                <path d="M12 2C12 2 6 7.5 6 13a6 6 0 0012 0c0-2.5-1.5-5-3-7l-1.5 3C12.5 10.5 12 11.8 12 13a2 2 0 01-4 0c0-3 3-6 4-11z" />
              </svg>
              <span
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 600,
                  fontSize: 13,
                  color: INK_MUTED,
                }}
              >
                {displayStreak > 0
                  ? `Day ${displayStreak} · Current streak`
                  : 'Start your streak today'}
              </span>
            </div>
          </div>

          {/* Exam countdown chip — or CTA when exam_date isn't set */}
          <div style={{ marginBottom: 32 }}>
            {effectiveExamDays !== null ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 32,
                  padding: '0 14px',
                  borderRadius: 100,
                  backgroundColor: LAVENDER,
                  gap: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 700,
                    fontSize: 12,
                    color: '#6B4EAA',
                  }}
                >
                  TCF in {effectiveExamDays} days
                </span>
              </div>
            ) : (
              <Link
                href="/profil"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 32,
                  padding: '0 14px',
                  borderRadius: 100,
                  backgroundColor: '#1A1A1A0C',
                  gap: 6,
                  textDecoration: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 700,
                    fontSize: 12,
                    color: INK_MUTED,
                  }}
                >
                  Set your exam date →
                </span>
              </Link>
            )}
          </div>

          {/* ── Zone 1: Daily action ───────────────────────────────── */}
          <section aria-label="Today's actions">
            <p
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color: INK_MUTED,
                margin: 0,
                marginBottom: 12,
              }}
            >
              Today
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Card A — Today's lesson. Shows skeleton while fetching, and
                  nothing (gracefully) if the user has already completed all 16. */}
              {nextLesson ? (
                <DailyActionCard
                  background={BUTTER}
                  label={`Lesson ${nextLesson.lessonNumber} of ${TOTAL_LESSONS}`}
                  title={nextLesson.title}
                  subline={nextLesson.sublineEn ?? undefined}
                  descriptor={nextLesson.shortDescription}
                  meta={[
                    {
                      icon: 'clock',
                      label: `${nextLesson.estimatedDurationMinutes ?? 15} min`,
                    },
                    { icon: 'lock-open', label: 'Unlocked' },
                  ]}
                  illustrationSrc="/illustration-level.jpg"
                  illustrationAlt="Lesson illustration"
                  href={`/la-methode/lecon-${nextLesson.lessonNumber}`}
                />
              ) : lessons === null && !fetchError ? (
                <div
                  className="ed-skeleton"
                  style={{
                    borderRadius: 4,
                    minHeight: 180,
                  }}
                />
              ) : null}

              {/* Card B — Today's practice (out of scope for this ticket; Tâche 2
                  picker is still mock-linked. See Phase 4 practice ticket). */}
              <DailyActionCard
                background={SAGE}
                label="Tâche 2 · Role-play"
                title="Agence de voyages"
                descriptor="Gather travel info from an agent. 10 min."
                meta={[
                  { icon: 'clock', label: '10 min' },
                  { icon: 'mic', label: 'Speaking' },
                ]}
                illustrationSrc="/illustration-language.jpg"
                illustrationAlt="Speech bubble illustration"
                href="/l-examen/expression-orale/tache-2/agence-voyages"
              />
            </div>

            <p
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 500,
                fontSize: 12,
                color: INK_MUTED,
                textAlign: 'center',
                marginTop: 12,
                marginBottom: 0,
              }}
            >
              Complete both for today's full session (~25 min)
            </p>
          </section>

          {/* ── F-080d: Recommended for you (between Zone 1 and Zone 2) ── */}
          {recurringModules.length > 0 && (
            <section
              aria-label="Recommended for you"
              style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <div>
                <p
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 700,
                    fontSize: 10,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    color: INK_MUTED,
                    margin: '0 0 6px',
                  }}
                >
                  Recommended for you
                </p>
                <p
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 500,
                    fontSize: 13,
                    color: INK_SOFT,
                    margin: 0,
                  }}
                >
                  Based on patterns we&rsquo;ve seen across your sessions.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recurringModules.map((m) => (
                  <RecurringModuleCard
                    key={m.module_id}
                    module={m}
                    onTap={() => handleRecurringTap(m)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Zone 2: La Méthode journey ──────────────────────── */}
          <section aria-label="La Méthode journey" style={{ marginTop: 48 }}>
            <EcoleProgress
              completedCount={effectiveCompleted}
              totalCount={TOTAL_LESSONS}
            />

            <div style={{ marginTop: 16 }}>
              {/* F-BUGS-001-FE-C — four-way state machine for the lesson list:
                  1. fetchError set        → /api/ecole/lessons rejected,
                                             surface the existing Retry UI.
                  2. lessons === null      → still loading, shimmer skeleton.
                  3. empty + no exam_date  → ask user to set their exam date.
                  4. empty + exam_date set → ask user to finish the diagnostic.
                  5. non-empty             → render the lesson rows.
                  Cases 3 & 4 previously rendered an empty <div> (a 200 with
                  zero lessons looked identical to a successful fetch with no
                  rows visible — silent dead-end). */}
              {fetchError ? (
                <div
                  role="alert"
                  style={{
                    padding: '24px 16px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <p
                    style={{
                      fontFamily: DISPLAY_FONT,
                      fontWeight: 500,
                      fontSize: 14,
                      color: INK_MUTED,
                      margin: 0,
                    }}
                  >
                    {fetchError} Retry?
                  </p>
                  <button
                    type="button"
                    onClick={() => setRetryKey((k) => k + 1)}
                    style={{
                      fontFamily: DISPLAY_FONT,
                      fontWeight: 700,
                      fontSize: 14,
                      color: '#FFFFFF',
                      backgroundColor: INK,
                      padding: '8px 18px',
                      borderRadius: 12,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Retry
                  </button>
                </div>
              ) : lessons === null ? (
                // F-211 — editorial shimmer rows at the lesson-item shape.
                Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="ed-skeleton"
                    style={{
                      height: 56,
                      borderBottom: '1px solid var(--lm-border-subtle)',
                    }}
                  />
                ))
              ) : lessons.length === 0 ? (
                <LessonListEmpty hasExamDate={!!storeUser?.examDate} />
              ) : (
                lessons.map((lesson, idx) => {
                  const prev = idx > 0 ? lessons[idx - 1] : null
                  // F-087 — render the Phase 1 → Phase 2 divider
                  // exactly once, at the boundary where the previous
                  // lesson is phase 1 and this one is phase 2. Keyed
                  // off the row data rather than a hardcoded
                  // lesson_number === 17 check so a future curriculum
                  // shuffle just works.
                  const showPhaseDivider =
                    prev != null && prev.phase === 1 && lesson.phase === 2
                  return (
                    <Fragment key={lesson.id}>
                      {showPhaseDivider && <PhaseDivider />}
                      <LessonListItem
                        number={lesson.lessonNumber}
                        title={lesson.title}
                        subline={lesson.sublineEn ?? undefined}
                        descriptor={lesson.shortDescription}
                        status={toItemStatus(lesson.status)}
                        justUnlocked={lesson.lessonNumber === justUnlockedLesson}
                      />
                    </Fragment>
                  )
                })
              )}
            </div>
          </section>
        </main>
      </div>

      <BottomNav />

      {pickerModule && (
        <LearnModuleSheet
          // RecurringModule uses `module_id` (snake_case from the backend
          // response); LearnModuleSheet expects the canonical `id` field
          // (matches RemediationModule). Trivial bridge here.
          module={{
            id: pickerModule.module_id,
            name_en: pickerModule.name_en,
            name_fr: pickerModule.name_fr,
            ecole_lesson_id: pickerModule.ecole_lesson_id,
          }}
          lessonTitle={pickerLessonTitle}
          lessonSubline={pickerLessonSubline}
          onClose={() => setPickerModule(null)}
        />
      )}
    </div>
  )
}

// F-BUGS-001-FE-C — 200-empty empty state for the L'École journey list.
// NOT an error: the fetch succeeded, the user just isn't enrolled in a
// path yet. Two sub-states by exam_date presence; CTA routes accordingly.
function LessonListEmpty({ hasExamDate }: { hasExamDate: boolean }) {
  const title = hasExamDate
    ? 'Complete your diagnostic to enroll.'
    : 'Set your exam date to start your path.'
  const body = hasExamDate
    ? 'The diagnostic takes a few minutes and unlocks the lesson sequence calibrated to your level.'
    : "Tell us when you sit the TCF and we'll calibrate the 27-lesson sequence to your timeline."
  const ctaLabel = hasExamDate ? 'Start diagnostic' : 'Set exam date'
  const ctaHref = hasExamDate ? '/l-examen' : '/profil'
  return (
    <div
      style={{
        padding: '32px 20px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'var(--lm-bg-surface)',
        border: '1px solid var(--lm-border-subtle)',
        borderRadius: 4,
      }}
    >
      <p
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 18,
          lineHeight: 1.3,
          color: INK,
          margin: 0,
          maxWidth: 360,
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 500,
          fontSize: 13,
          lineHeight: 1.5,
          color: INK_SOFT,
          margin: 0,
          maxWidth: 360,
        }}
      >
        {body}
      </p>
      <Link
        href={ctaHref}
        style={{
          marginTop: 6,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 18px',
          borderRadius: 12,
          backgroundColor: INK,
          color: '#FFFFFF',
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 14,
          textDecoration: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {ctaLabel}
      </Link>
    </div>
  )
}

// F-087 — visual divider between Phase 1 (Fondations, lessons 1-16) and
// Phase 2 (Approfondissement, lessons 17-27). Rendered inline inside the
// lesson list when the loop crosses the phase boundary; HomeScreen is
// the only consumer so it's defined here rather than as a shared file.
function PhaseDivider() {
  return (
    <div
      role="separator"
      aria-label="Phase 2: Approfondissement"
      style={{
        padding: '24px 16px 12px',
        borderTop: '1px solid #1A1A1A14',
        marginTop: 8,
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color: INK_MUTED,
        }}
      >
        Phase 2: Approfondissement
      </p>
      <p
        style={{
          margin: '4px 0 0',
          fontFamily: DISPLAY_FONT,
          fontWeight: 500,
          fontSize: 12,
          color: INK_SOFT,
        }}
      >
        11 lessons of polish, after the click.
      </p>
    </div>
  )
}
