'use client'

// V-013a — Writing history list. Calls api.writing.history(); if BE
// returns 404 (endpoint not yet shipped), renders empty state with
// "Submissions will appear here" + the V-013a.history follow-up note.

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { useInterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'
import type { WritingHistoryItem } from '@/lib/types'

const ED_BG = 'var(--lm-bg-base)'
const ED_FG = 'var(--lm-text-primary)'
const ED_FG_SOFT = 'var(--lm-text-secondary)'
const ED_MUTED = 'var(--lm-text-tertiary)'
const ED_RULE = 'var(--lm-border-subtle)'
const ED_PAPER = 'var(--lm-bg-surface)'
const SANS = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'
const SERIF = 'var(--font-source-serif), Georgia, serif'

const COPY = {
  en: {
    backToWriting: 'Back to writing',
    title: 'Past submissions',
    empty: 'Your past submissions will appear here.',
    networkError: "Couldn't load history. Retry?",
    retry: 'Retry',
  },
  fr: {
    backToWriting: 'Retour à la production écrite',
    title: 'Soumissions passées',
    empty: 'Vos soumissions passées apparaîtront ici.',
    networkError: "Impossible de charger l'historique. Réessayer ?",
    retry: 'Réessayer',
  },
} as const

export default function WritingHistoryClient() {
  const language = useInterfaceLanguage()
  const copy = COPY[language]
  const [items, setItems] = useState<WritingHistoryItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  const load = useCallback(async () => {
    setError(null)
    try {
      const list = await api.writing.history()
      setItems(list)
    } catch (err) {
      // 404 = BE endpoint not ready yet (V-013a.history follow-up).
      // Treat as empty rather than blocking — don't surface a server
      // error to a user who has just never submitted.
      if (err instanceof ApiError && err.status === 404) {
        setItems([])
      } else {
        setError(copy.networkError)
      }
    }
  }, [copy.networkError])

  useEffect(() => {
    load()
  }, [load, retryKey])

  return (
    <div className="ed-page-enter" style={{ minHeight: '100dvh', backgroundColor: ED_BG, fontFamily: SANS }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(20px, 3vw, 32px) clamp(16px, 4vw, 32px) 96px' }}>
        <Link
          href="/examen/expression-ecrite"
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
          <span>{copy.backToWriting}</span>
        </Link>

        <h1
          style={{
            fontFamily: SERIF,
            fontWeight: 400,
            fontSize: 'clamp(28px, 4vw, 40px)',
            lineHeight: 1.1,
            letterSpacing: '-0.015em',
            color: ED_FG,
            margin: 0,
            marginBottom: 24,
          }}
        >
          {copy.title}
        </h1>

        {error ? (
          <div role="alert" style={{ padding: '32px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <p style={{ fontFamily: SANS, fontWeight: 500, fontSize: 14, color: ED_MUTED, margin: 0 }}>{error}</p>
            <button
              type="button"
              onClick={() => setRetryKey((k) => k + 1)}
              className="ed-btn-press"
              style={{
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 14,
                color: '#FFFFFF',
                backgroundColor: 'var(--cta-utility)',
                padding: '8px 18px',
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {copy.retry}
            </button>
          </div>
        ) : items === null ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="ed-skeleton" style={{ height: 72, borderRadius: 4 }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 18,
              color: ED_MUTED,
              margin: 0,
              padding: '48px 0',
              textAlign: 'center',
            }}
          >
            {copy.empty}
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map((item) => (
              <li key={item.id}>
                <div
                  className="ed-card-lift"
                  style={{
                    backgroundColor: ED_PAPER,
                    border: `1px solid ${ED_RULE}`,
                    borderRadius: 4,
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: SANS, fontWeight: 600, fontSize: 14, color: ED_FG, margin: 0, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.prompt_title_fr}
                    </p>
                    <p style={{ fontFamily: SANS, fontSize: 12, color: ED_MUTED, margin: 0 }}>
                      {new Date(item.submitted_at).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 22, color: 'var(--lm-warm-espresso)', margin: 0, lineHeight: 1 }}>
                      {item.overall_score}
                    </p>
                    <p style={{ fontFamily: SANS, fontWeight: 500, fontSize: 11, color: ED_MUTED, margin: 0, marginTop: 2 }}>
                      {item.cefr_band}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
