'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import type { Lesson } from '@/lib/types'
import BottomNav from '@/components/home/BottomNav'

const DISPLAY_FONT = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'
const INK         = 'var(--text-primary)'
const INK_SOFT    = 'var(--text-secondary)'
const INK_MUTED   = 'var(--text-muted)'
const BG          = 'var(--lm-bg-base)'
const CTA_BG      = 'var(--text-primary)'

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
            height: 'calc(56px + var(--lm-safe-top))',
            backgroundColor: BG,
            borderBottom: '1px solid #1A1A1A0A',
            display: 'flex',
            alignItems: 'center',
            padding: 'var(--lm-safe-top) 16px 0 16px',
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
                {lesson.estimatedDurationMinutes ?? 15} min · La Méthode
              </p>

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

              <div style={{ marginTop: 40 }}>
                <Link
                  href={`/cours/methode-tcf-canada/lesson/${lessonNumber}/quiz`}
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
