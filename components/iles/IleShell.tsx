'use client'

import { useState, useEffect } from 'react'
import type { ComponentType } from 'react'
import Image from 'next/image'
import { api } from '@/lib/api'
import { TOKEN_KEY } from '@/lib/storage-keys'

interface IleMeta {
  theme: string
  level: string
  display_title: string
  estimated_minutes?: number
  image_set?: string
  maitre_audio?: { intro: string; close: string }
  actes_de_parole?: string[]
}

interface Props {
  theme: string
}

const LEVEL_LABELS: Record<string, string> = {
  a1_a2: 'A1–A2',
  a2_b1: 'A2–B1',
  b1: 'B1',
  b2_plus: 'B2+',
}

export default function IleShell({ theme }: Props) {
  const [level, setLevel] = useState('b1')
  const [Content, setContent] = useState<ComponentType | null>(null)
  const [meta, setMeta] = useState<IleMeta | null>(null)
  const [missing, setMissing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [heroError, setHeroError] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    function init(resolvedLevel: string) {
      setLevel(resolvedLevel)
      // Persist start timestamp once per (theme, level) pair
      const startKey = `ile_started_${theme}_${resolvedLevel}`
      if (!localStorage.getItem(startKey)) {
        localStorage.setItem(startKey, new Date().toISOString())
      }
      setStarted(true)
      // Dynamic MDX import — webpack bundles all content/iles/**/*.mdx
      import(`@/content/iles/${theme}/${resolvedLevel}.mdx`)
        .then((mod) => {
          setContent(() => mod.default as ComponentType)
          setMeta((mod.meta as IleMeta) ?? null)
          setLoading(false)
        })
        .catch(() => {
          setMissing(true)
          setLoading(false)
        })
    }

    // F-439: authenticated users source level from BE progress endpoint.
    // Public visitors (no token) default to b1 without making a request.
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      api.users.getProgress()
        .then((p) => init(p.currentLevel ?? 'b1'))
        .catch(() => init('b1'))
    } else {
      init('b1')
    }
  }, [theme])

  if (loading) {
    return (
      <main
        lang="fr"
        style={{
          maxWidth: 820,
          margin: '0 auto',
          padding: 'clamp(32px, 5vw, 64px) clamp(20px, 4vw, 40px)',
        }}
      >
        <div
          style={{
            height: 220,
            background: 'var(--paper-edge)',
            borderRadius: 'var(--r-lg)',
            marginBottom: 32,
          }}
        />
        <div
          style={{
            height: 28,
            width: '52%',
            background: 'var(--paper-edge)',
            borderRadius: 'var(--r-sm)',
            marginBottom: 12,
          }}
        />
        <div
          style={{
            height: 14,
            width: '22%',
            background: 'var(--paper-edge)',
            borderRadius: 'var(--r-sm)',
          }}
        />
      </main>
    )
  }

  if (missing) {
    return (
      <main
        lang="fr"
        style={{
          maxWidth: 820,
          margin: '0 auto',
          padding: 'clamp(32px, 5vw, 64px) clamp(20px, 4vw, 40px)',
        }}
      >
        <div
          style={{
            background: 'var(--paper-tint)',
            border: '1px solid var(--rule)',
            borderRadius: 'var(--r-lg)',
            padding: 'clamp(40px, 6vw, 72px) clamp(24px, 4vw, 48px)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--ink-faint)',
              margin: '0 0 16px',
            }}
          >
            Bientôt
          </p>
          <h1
            style={{
              fontFamily: 'var(--f-display)',
              fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
              fontWeight: 400,
              color: 'var(--ink)',
              margin: '0 0 12px',
              letterSpacing: '-0.01em',
            }}
          >
            Cette île arrive prochainement.
          </h1>
          <p
            style={{
              fontFamily: 'var(--f-ui)',
              fontSize: 14,
              color: 'var(--ink-soft)',
              margin: 0,
            }}
          >
            Le contenu pour ce thème et ce niveau est en préparation.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main
      lang="fr"
      style={{
        maxWidth: 820,
        margin: '0 auto',
        padding: 'clamp(32px, 5vw, 64px) clamp(20px, 4vw, 40px)',
      }}
    >
      {/* Hero image — graceful placeholder if file is absent */}
      <div
        style={{
          position: 'relative',
          height: 220,
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
          marginBottom: 32,
          background: 'var(--paper-edge)',
        }}
      >
        {!heroError ? (
          <Image
            src={`/iles/${theme}/hero.png`}
            alt={meta?.display_title ?? theme}
            fill
            style={{ objectFit: 'cover' }}
            onError={() => setHeroError(true)}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--f-display)',
                fontSize: 80,
                color: 'var(--ink-trace)',
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              {(meta?.display_title ?? theme).charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Île header: title + level badge + duration + progress */}
      <div style={{ marginBottom: 40 }}>
        <h1
          style={{
            fontFamily: 'var(--f-display)',
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            fontWeight: 400,
            color: 'var(--ink)',
            margin: '0 0 12px',
            letterSpacing: '-0.01em',
          }}
        >
          {meta?.display_title ?? `Île ${theme}`}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Level badge */}
          <span
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--dominant)',
              background: 'rgba(20, 33, 61, 0.07)',
              borderRadius: 'var(--r-pill)',
              padding: '4px 12px',
            }}
          >
            {LEVEL_LABELS[level] ?? level.toUpperCase()}
          </span>

          {/* Duration chip */}
          {meta?.estimated_minutes && (
            <span
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-faint)',
                background: 'var(--paper-edge)',
                borderRadius: 'var(--r-pill)',
                padding: '4px 12px',
              }}
            >
              {meta.estimated_minutes} min
            </span>
          )}

          {/* Progress indicator (localStorage-persisted) */}
          {started && (
            <span
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--success)',
                background: 'rgba(68, 121, 79, 0.09)',
                borderRadius: 'var(--r-pill)',
                padding: '4px 12px',
              }}
            >
              En cours
            </span>
          )}
        </div>
      </div>

      {/* Le Maître intro — disabled seam */}
      {/* BE SEAM: replace with <MaitreAudio src={meta?.maitre_audio?.intro} /> in Round 2 (F-417) */}
      <div
        style={{
          background: 'var(--paper-tint)',
          border: '1px solid var(--rule)',
          borderRadius: 'var(--r-lg)',
          padding: '20px 24px',
          marginBottom: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--r-pill)',
            background: 'var(--dominant)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--f-display)',
              fontSize: 18,
              color: 'var(--paper)',
              lineHeight: 1,
            }}
          >
            M
          </span>
        </div>
        <div>
          <p
            style={{
              fontFamily: 'var(--f-ui)',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--dominant)',
              margin: '0 0 2px',
            }}
          >
            Le Maître
          </p>
          <p
            style={{
              fontFamily: 'var(--f-ui)',
              fontSize: 13,
              color: 'var(--ink-soft)',
              margin: 0,
            }}
          >
            Bienvenue sur cette île. Écoutez le dialogue, puis répondez aux questions.
          </p>
        </div>
      </div>

      {/* MDX mold sequence in order */}
      {Content && <Content />}

      {/* Le Maître close — disabled seam (same pattern as Tâche) */}
      {/* BE SEAM: gate until all molds complete in user_progress (F-417, Round 2) */}
      <div
        style={{
          background: 'var(--paper-tint)',
          border: '1px solid var(--rule)',
          borderRadius: 'var(--r-lg)',
          padding: '20px 24px',
          marginTop: 16,
          opacity: 0.45,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--r-pill)',
              background: 'var(--dominant)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--f-display)',
                fontSize: 18,
                color: 'var(--paper)',
                lineHeight: 1,
              }}
            >
              M
            </span>
          </div>
          <p
            style={{
              fontFamily: 'var(--f-ui)',
              fontSize: 13,
              color: 'var(--ink-soft)',
              margin: 0,
            }}
          >
            Vous avez terminé cette île. Continuez avec la suivante.
          </p>
        </div>
      </div>
    </main>
  )
}
