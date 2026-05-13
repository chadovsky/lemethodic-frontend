'use client'

// P-234 — lesson body. Renders per ClusterLesson.format. Reuses the
// .prose-legal CSS scope from B-102 (paper-on-canvas, Cabinet Grotesk
// headings, ink body). Lesson markdown is FR-only Phase 1; the .prose-legal
// styles are language-agnostic typography so reuse is clean.
//
// PDF format: <iframe> embed with download fallback link below.
// Video format: deferred to Phase 2 — no clusters use it yet per BE.

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ClusterLesson } from '@/lib/types'

const INK = 'var(--text-primary)'
const INK_MUTED = 'var(--text-muted)'
const PAPER = '#FFFFFFCC'
const DISPLAY_FONT = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'

interface LessonBodyProps {
  lesson: ClusterLesson
}

export default function LessonBody({ lesson }: LessonBodyProps) {
  if (lesson.format === 'markdown') {
    return (
      <article
        className="prose-legal"
        style={{
          backgroundColor: PAPER,
          borderRadius: 20,
          padding: '24px 28px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          // .prose-legal applies max-width: 720px + margin auto. Override
          // here so it fills the cluster card instead of re-centering.
          maxWidth: 'none',
          margin: 0,
        }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.markdown}</ReactMarkdown>
      </article>
    )
  }

  if (lesson.format === 'pdf') {
    return (
      <article
        style={{
          backgroundColor: PAPER,
          borderRadius: 20,
          padding: '20px 22px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <iframe
          src={lesson.asset_url}
          title="Lesson PDF"
          style={{
            width: '100%',
            height: 600,
            border: 'none',
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
          }}
        />
        <a
          href={lesson.asset_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 600,
            fontSize: 13,
            color: INK_MUTED,
            textDecoration: 'underline',
            alignSelf: 'flex-start',
          }}
        >
          Open PDF in new tab
        </a>
      </article>
    )
  }

  // Video — Phase 2. v1 placeholder so a stray video-format cluster doesn't
  // blank-screen the page.
  return (
    <article
      style={{
        backgroundColor: PAPER,
        borderRadius: 20,
        padding: '24px 22px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      }}
    >
      <p
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 600,
          fontSize: 14,
          color: INK_MUTED,
          margin: 0,
        }}
      >
        Video lesson coming soon.
      </p>
      {lesson.asset_url && (
        <a
          href={lesson.asset_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            marginTop: 8,
            fontFamily: DISPLAY_FONT,
            fontWeight: 600,
            fontSize: 13,
            color: INK,
            textDecoration: 'underline',
          }}
        >
          Watch externally
        </a>
      )}
    </article>
  )
}
