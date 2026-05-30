'use client'

// P-234 — cluster detail orchestrator. Fetches detail + user state in
// parallel; renders 3 sections (header, lesson body, practice CTA). v1
// scope locked from plan-first: exercise_set + recording_history are in
// the BE response but rendered post-launch (P-234.exercises / P-234.history).
//
// Visual language: paper-on-canvas (mirrors B-102 LegalPage), distinct
// from /learn/[id]'s category-tinted modules. Brand mark in header links
// back to /progress as fallback when browser-back exits the app.

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { useInterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'
import type {
  ClusterDetailResponse,
  UserClusterStateResponse,
} from '@/lib/types'
import ClusterHeader from './ClusterHeader'
import LessonBody from './LessonBody'
import PracticeCTA from './PracticeCTA'

// F-204 — page chrome migrated to editorial system. Section components
// (ClusterHeader / LessonBody / PracticeCTA) restyled in this same ticket
// since they're tightly coupled to the page layout.
const INK = 'var(--lm-text-primary)'
const INK_MUTED = 'var(--lm-text-tertiary)'
const BG = 'var(--lm-bg-base)'
const DISPLAY_FONT = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'

interface ClusterDetailPageProps {
  slug: string
}

export default function ClusterDetailPage({ slug }: ClusterDetailPageProps) {
  const language = useInterfaceLanguage()
  const [detail, setDetail] = useState<ClusterDetailResponse | null>(null)
  const [state, setState] = useState<UserClusterStateResponse | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  const load = useCallback(async () => {
    setFetchError(null)
    setNotFound(false)
    try {
      // Detail is the load-bearing call (without it nothing renders); state
      // is auxiliary (status chips + history). Only detail's failure short-
      // circuits to error. State failure leaves the page rendering with
      // status chips hidden.
      const [detailRes, stateRes] = await Promise.all([
        api.clusters.get(slug),
        api.clusters.getUserState(slug).catch(() => null),
      ])
      setDetail(detailRes)
      setState(stateRes)
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 422)) {
        setNotFound(true)
      } else if (err instanceof ApiError) {
        setFetchError("Couldn't load this cluster.")
      } else {
        setFetchError("Couldn't reach the server.")
      }
    }
  }, [slug])

  useEffect(() => {
    load()
  }, [load, retryKey])

  return (
    <div className="ed-page-enter" style={{ minHeight: '100dvh', backgroundColor: BG, fontFamily: DISPLAY_FONT }}>
      <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative' }}>
        {/* Header — brand mark links back to /progress as nav fallback */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            height: 'calc(56px + var(--lm-safe-top))',
            backgroundColor: BG,
            borderBottom: '1px solid var(--lm-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            padding: 'var(--lm-safe-top) clamp(16px, 3vw, 32px) 0',
            gap: 12,
          }}
        >
          <Link
            href="/progress"
            aria-label="Back to Progress"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              color: INK,
              textDecoration: 'none',
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            <ChevronLeft size={18} strokeWidth={2.25} />
            <span>Le Méthodic</span>
          </Link>
        </header>

        <main style={{ padding: 'clamp(32px, 5vw, 48px) clamp(16px, 3vw, 32px) 64px' }}>
          {notFound ? (
            <NotFoundState />
          ) : fetchError ? (
            <ErrorRetry message={fetchError} onRetry={() => setRetryKey((k) => k + 1)} />
          ) : detail === null ? (
            <LoadingSkeleton />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <ClusterHeader detail={detail} state={state} language={language} />
              <LessonBody lesson={detail.lesson} />
              <PracticeCTA detail={detail} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function NotFoundState() {
  return (
    <div
      role="alert"
      style={{
        padding: '48px 16px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <h1
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 800,
          fontSize: 22,
          color: INK,
          margin: 0,
        }}
      >
        Cluster not found.
      </h1>
      <p
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 500,
          fontSize: 14,
          color: INK_MUTED,
          margin: 0,
          maxWidth: 380,
        }}
      >
        The link may be stale, or this cluster isn't part of the current curriculum.
      </p>
      <Link
        href="/progress"
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 14,
          color: '#FFFFFF',
          backgroundColor: INK,
          padding: '10px 18px',
          borderRadius: 12,
          textDecoration: 'none',
          marginTop: 8,
        }}
      >
        Back to Progress
      </Link>
    </div>
  )
}

function LoadingSkeleton() {
  // F-211 — editorial shimmer (ed-skeleton class) replaces Tailwind
  // animate-pulse. Slower, less aggressive, matches design system.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="ed-skeleton" style={{ height: 100, borderRadius: 4 }} />
      <div className="ed-skeleton" style={{ height: 240, borderRadius: 4 }} />
      <div className="ed-skeleton" style={{ height: 96, borderRadius: 4 }} />
    </div>
  )
}

function ErrorRetry({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      style={{
        padding: '32px 16px',
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
        {message} Retry?
      </p>
      <button
        type="button"
        onClick={onRetry}
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
  )
}
