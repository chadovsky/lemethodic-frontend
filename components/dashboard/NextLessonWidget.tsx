'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { Lesson } from '@/lib/types'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

type Status = 'loading' | 'ok' | 'empty' | 'error'

export default function NextLessonWidget() {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    api.lessons
      .list()
      .then((lessons) => {
        const next =
          lessons.find((l) => l.status === 'in_progress') ??
          lessons.find((l) => l.status === 'unlocked')
        if (next) {
          setLesson(next)
          setStatus('ok')
        } else {
          setStatus('empty')
        }
      })
      .catch(() => setStatus('error'))
  }, [])

  return (
    <section
      data-testid="dashboard-widget-prochaine-lecon"
      className="ed-card-lift"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 4,
        padding: 'clamp(20px, 2vw, 28px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <h2
        style={{
          fontFamily: SERIF_FONT,
          fontWeight: 500,
          fontSize: 'clamp(16px, 1.8vw, 20px)',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        Prochaine leçon
      </h2>

      {status === 'loading' && (
        <div className="ed-skeleton" style={{ height: 48, borderRadius: 4 }} />
      )}

      {status === 'error' && (
        <p
          data-testid="next-lesson-error"
          style={{
            fontFamily: SANS_FONT,
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            margin: 0,
          }}
        >
          Données indisponibles
        </p>
      )}

      {status === 'empty' && (
        <p
          data-testid="next-lesson-empty"
          style={{
            fontFamily: SANS_FONT,
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            margin: 0,
          }}
        >
          Toutes les leçons sont terminées
        </p>
      )}

      {status === 'ok' && lesson && (
        <>
          <p
            data-testid="next-lesson-title"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 500,
              fontSize: '1rem',
              lineHeight: 1.4,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Leçon {lesson.lessonNumber}&nbsp;: {lesson.title}
          </p>

          <Link
            href={`/la-methode/lecon-${lesson.lessonNumber}`}
            className="ed-btn-press"
            style={{
              alignSelf: 'flex-start',
              marginTop: 'auto',
              padding: '10px 18px',
              backgroundColor: 'var(--cta-utility)',
              color: '#ffffff',
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: '0.875rem',
              letterSpacing: '0.01em',
              textDecoration: 'none',
              borderRadius: 4,
              minHeight: 44,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Reprendre
          </Link>
        </>
      )}
    </section>
  )
}
