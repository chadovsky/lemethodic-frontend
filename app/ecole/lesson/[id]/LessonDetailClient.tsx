'use client'

// F-089 — wires the lesson detail page to the real `/api/ecole/lessons`
// data layer. Pre-F-089 this page rendered a hardcoded `LESSON_TITLES`
// stub map covering only the old 16-lesson curriculum; lessons 17-27
// (added by F-087) fell through to "Lesson N" with no real content.
// The fix bundle was approved as a side-effect of F-089's gate 6
// (subline must render in the header) since gate 6 cannot pass without
// real data wiring. See BACKLOG.md F-080d.z rule #2 for the verification
// rule that should have caught this in F-087.
//
// Route param `id` is a `lesson_number` (1-27), not a DB id — that's
// the convention HomeScreen + LessonListItem already use when building
// `/ecole/lesson/${nextLesson.lessonNumber}`. We fetch the full lesson
// list and filter client-side; the list is small (27 rows post-F-087)
// and is already cached on most paths into this page.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import type { Lesson } from '@/lib/types'
import BottomNav from '@/components/home/BottomNav'

const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'
const INK         = '#1A1A1A'
const INK_SOFT    = '#1A1A1AB3'
const INK_MUTED   = '#1A1A1A66'
const BG          = 'var(--fp-canvas)'
const CTA_BG      = '#1A1A1A'

interface Props {
  lessonNumber: number
}

export default function LessonDetailClient({ lessonNumber }: Props) {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    api.lessons
      .list()
      .then((lessons) => {
        if (cancelled) return
        const match = lessons.find((l) => l.lessonNumber === lessonNumber)
        if (!match) {
          setError('Lesson not found.')
          return
        }
        setLesson(match)
      })
      .catch(() => {
        if (cancelled) return
        setError('Could not load this lesson. Try again in a moment.')
      })
    return () => {
      cancelled = true
    }
  }, [lessonNumber])

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: BG, fontFamily: DISPLAY_FONT }}>
      <div style={{ maxWidth: 440, margin: '0 auto' }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            height: 'calc(56px + var(--fp-safe-top))',
            backgroundColor: BG,
            borderBottom: '1px solid #1A1A1A0A',
            display: 'flex',
            alignItems: 'center',
            padding: 'var(--fp-safe-top) 16px 0 16px',
            gap: 12,
          }}
        >
          <Link
            href="/"
            aria-label="Back to home"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: INK,
              textDecoration: 'none',
              padding: 4,
              borderRadius: 8,
              marginLeft: -4,
            }}
          >
            <ArrowLeft size={22} strokeWidth={2} />
          </Link>
          <span
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 16,
              color: INK,
            }}
          >
            Lesson {lessonNumber}
          </span>
        </header>

        <main style={{ padding: '32px 20px', paddingBottom: 100 }}>
          {error ? (
            <p
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 500,
                fontSize: 15,
                color: INK_SOFT,
                margin: 0,
              }}
            >
              {error}
            </p>
          ) : lesson == null ? (
            <div
              className="animate-pulse"
              aria-label="Loading lesson"
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <div style={{ height: 34, width: '80%', backgroundColor: '#1A1A1A0A', borderRadius: 6 }} />
              <div style={{ height: 22, width: '60%', backgroundColor: '#1A1A1A0A', borderRadius: 6 }} />
              <div style={{ height: 22, width: '90%', backgroundColor: '#1A1A1A0A', borderRadius: 6, marginTop: 24 }} />
              <div style={{ height: 22, width: '85%', backgroundColor: '#1A1A1A0A', borderRadius: 6 }} />
            </div>
          ) : (
            <>
              {/* Title */}
              <h1
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 800,
                  fontSize: 28,
                  lineHeight: '34px',
                  color: INK,
                  margin: 0,
                  marginBottom: lesson.sublineEn ? 10 : 8,
                }}
              >
                Lesson {lesson.lessonNumber}: {lesson.title}
              </h1>

              {/* Subline (F-089) */}
              {lesson.sublineEn && (
                <p
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 500,
                    fontSize: 16,
                    lineHeight: 1.5,
                    color: INK_MUTED,
                    margin: 0,
                    marginBottom: 16,
                  }}
                >
                  {lesson.sublineEn}
                </p>
              )}

              <p
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: INK_MUTED,
                  margin: 0,
                  marginBottom: 32,
                }}
              >
                {lesson.estimatedDurationMinutes ?? 15} min · L'École
              </p>

              {/* Body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 500,
                    fontSize: 15,
                    lineHeight: '24px',
                    color: INK,
                    margin: 0,
                  }}
                >
                  {lesson.shortDescription}
                </p>
                {lesson.detailedContent && lesson.detailedContent !== lesson.shortDescription && (
                  <p
                    style={{
                      fontFamily: DISPLAY_FONT,
                      fontWeight: 500,
                      fontSize: 15,
                      lineHeight: '24px',
                      color: INK,
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {lesson.detailedContent}
                  </p>
                )}
              </div>

              {/* CTA — quiz route still keyed by lesson_number to match
                  the rest of the route surface. The quiz page itself is
                  still stub (separate ticket). */}
              <div style={{ marginTop: 40 }}>
                <Link
                  href={`/ecole/lesson/${lessonNumber}/quiz`}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: 56,
                    borderRadius: 16,
                    backgroundColor: CTA_BG,
                    color: '#FFFFFF',
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 700,
                    fontSize: 16,
                    textAlign: 'center',
                    lineHeight: '56px',
                    textDecoration: 'none',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  Start quiz
                </Link>
              </div>
            </>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
