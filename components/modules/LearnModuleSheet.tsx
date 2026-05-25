'use client'

// F-080d — shared bottom-sheet picker for LINKED modules (modules whose
// ecole_lesson_id is non-null). Two destinations:
//   - Primary CTA: structured École lesson at /ecole/{lesson_id}
//   - Secondary CTA: standalone module reading at /learn/{module_id}
//
// Used by HomeScreen "Recommended for you" cards (F2) and the diagnostic
// page DetectedModuleCard "Learn this" button (F3). Orphan modules
// (ecole_lesson_id === null) bypass this sheet entirely and route
// straight to /learn/[id]; the linked-vs-orphan branching lives at the
// call site so this component can stay focused on the "user picks" flow.
//
// Lesson title: callers can pass `lessonTitle` directly (HomeScreen has
// the lessons list cached and saves a roundtrip); when omitted, the
// sheet fetches `api.lessons.list()` once on open and looks up by
// lesson_number. Roundtrip is small (27 lessons post-F-087) but the cached path is
// preferred when available.
//
// F-089: `lessonSubline` (deadpan one-liner from EcoleLesson.sublineEn)
// is rendered below the title in the primary CTA. Same caching pattern
// as `lessonTitle` — callers with the lessons list cached pass it
// directly; otherwise the sheet's fetch fills it in.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { api } from '@/lib/api'

const INK          = 'var(--text-primary)'
const INK_SOFT     = 'var(--text-secondary)'
const INK_MUTED    = 'var(--text-muted)'
const DISPLAY_FONT = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'

// Subset of RemediationModule. Both call sites (HomeScreen recurring
// cards, diagnostic-page DetectedModuleCard) construct this shape — the
// recurring endpoint returns `module_id` while RemediationModule has
// `id`, so HomeScreen maps before passing in. Keeping the canonical
// `id` here (not `module_id`) matches the broader frontend type
// surface and avoids inventing a second namespace for the same concept.
interface ShortModule {
  id: string
  name_en: string
  name_fr: string
  ecole_lesson_id: number | null
}

interface Props {
  module: ShortModule
  /** Pre-fetched lesson title to avoid a roundtrip. When omitted, the
   *  sheet fetches lessons on open. */
  lessonTitle?: string
  /** F-089 — pre-fetched lesson subline (deadpan one-liner). Rendered
   *  below the title in the primary CTA. Same caching pattern as
   *  `lessonTitle`; filled by the sheet's fetch when callers omit it. */
  lessonSubline?: string | null
  onClose: () => void
}

export default function LearnModuleSheet({ module: m, lessonTitle, lessonSubline, onClose }: Props) {
  const router = useRouter()
  const [resolvedTitle, setResolvedTitle] = useState<string | null>(lessonTitle ?? null)
  const [resolvedSubline, setResolvedSubline] = useState<string | null>(lessonSubline ?? null)

  // Fetch lesson title + subline only when caller didn't provide a title
  // and the module is actually linked. Orphan modules shouldn't be
  // shown via this sheet at all (caller bug if they are), but stay
  // defensive. Subline degrades silently when missing — the CTA still
  // renders title + lesson number.
  useEffect(() => {
    if (resolvedTitle != null) return
    if (m.ecole_lesson_id == null) return
    let cancelled = false
    api.lessons
      .list()
      .then((lessons) => {
        if (cancelled) return
        const match = lessons.find((l) => l.lessonNumber === m.ecole_lesson_id)
        setResolvedTitle(match?.title ?? `Lesson ${m.ecole_lesson_id}`)
        setResolvedSubline(match?.sublineEn ?? null)
      })
      .catch(() => {
        if (cancelled) return
        // On fetch failure, fall back to the bare lesson number — the
        // route still works; only the displayed title is degraded.
        setResolvedTitle(`Lesson ${m.ecole_lesson_id}`)
      })
    return () => {
      cancelled = true
    }
  }, [m.ecole_lesson_id, resolvedTitle])

  const goLesson = () => {
    if (m.ecole_lesson_id == null) return
    router.push(`/la-methode/lesson/${m.ecole_lesson_id}`)
  }

  const goLearn = () => {
    router.push(`/learn/${m.id}`)
  }

  // Lock body scroll while the sheet is open.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // Render the primary CTA label even before lessons fetch lands —
  // shows the lesson number immediately, swaps in the title when
  // available. Avoids a flash of "Loading…" on the primary button.
  const primaryLabel =
    resolvedTitle && m.ecole_lesson_id != null
      ? `Lesson ${m.ecole_lesson_id}: ${resolvedTitle}`
      : `Lesson ${m.ecole_lesson_id}`

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.32)',
          zIndex: 60,
          cursor: 'pointer',
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`How do you want to work on ${m.name_en}?`}
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 440,
          backgroundColor: 'var(--lm-bg-base)',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          zIndex: 70,
          boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
          maxHeight: '80dvh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 32,
            height: 32,
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
          <X size={16} strokeWidth={2.25} />
        </button>

        <div style={{ padding: '28px 22px 18px' }}>
          <div
            aria-hidden="true"
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: INK_MUTED,
              margin: '0 auto 22px',
            }}
          />
          <p
            style={{
              margin: '0 0 6px',
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color: INK_MUTED,
            }}
          >
            Detected reflex
          </p>
          <h2
            style={{
              margin: '0 0 6px',
              fontFamily: DISPLAY_FONT,
              fontWeight: 800,
              fontSize: 22,
              lineHeight: 1.2,
              color: INK,
            }}
          >
            {m.name_en}
          </h2>
          <p
            style={{
              margin: 0,
              fontFamily: DISPLAY_FONT,
              fontWeight: 500,
              fontSize: 14,
              color: INK_SOFT,
            }}
          >
            How do you want to work on this?
          </p>
        </div>

        <div
          style={{
            padding: '4px 22px calc(32px + var(--lm-safe-bottom)) 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={goLesson}
            style={{
              width: '100%',
              minHeight: 56,
              borderRadius: 16,
              border: 'none',
              backgroundColor: INK,
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 15,
              color: '#FFFFFF',
              cursor: 'pointer',
              outline: 'none',
              padding: '14px 18px',
              textAlign: 'left',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span style={{ display: 'block', fontSize: 11, opacity: 0.7, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Structured lesson
            </span>
            <span style={{ display: 'block', marginTop: 2 }}>{primaryLabel}</span>
            {resolvedSubline && (
              <span style={{ display: 'block', marginTop: 4, fontSize: 13, fontWeight: 500, opacity: 0.7, lineHeight: 1.5 }}>
                {resolvedSubline}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={goLearn}
            style={{
              width: '100%',
              minHeight: 56,
              borderRadius: 16,
              border: `1.5px solid ${INK_MUTED}`,
              backgroundColor: 'transparent',
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 15,
              color: INK,
              cursor: 'pointer',
              outline: 'none',
              padding: '14px 18px',
              textAlign: 'left',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span style={{ display: 'block', fontSize: 11, opacity: 0.7, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Quick read
            </span>
            <span style={{ display: 'block', marginTop: 2 }}>Just read about this pattern</span>
          </button>
        </div>
      </div>
    </>
  )
}
