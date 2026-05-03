'use client'

// P-230 — Overall Progress dashboard. Replaces the P-100 era surface
// (SnapshotCard / SustainedCouches / ActivityTimeline / RecurringModulesList
// / EmptyState — all deleted in commit 3 of this set).
//
// Per LEMETHODIC-CURRICULUM v0.2 §7.4 calm mode: 4 sections in priority
// order — Snapshot, Today's focus, Goulet Stack (top 3), Recent activity.
// Method mode toggle (Blocks 1, 7) is hidden until P-235/P-236 ship.
//
// Data flow: client-fetch on mount via Promise.all with per-call .catch so
// one section's failure doesn't blank the page (mirrors HomeScreen pattern).
// Each section receives its data slice and renders its own empty state when
// the slice is null/empty.

import { useCallback, useEffect, useState } from 'react'
import BottomNav from '@/components/home/BottomNav'
import SnapshotSection from './SnapshotSection'
import TodayFocusSection from './TodayFocusSection'
import GouletStackSection from './GouletStackSection'
import RecentActivitySection from './RecentActivitySection'
import { api, ApiError } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import type {
  DiagnosticStateResponse,
  LevelResponse,
  RecordingSummary,
  RecurringModule,
  TodayActionResponse,
} from '@/lib/types'

const INK = '#1A1A1A'
const INK_MUTED = '#1A1A1A66'
const BG = 'var(--fp-canvas)'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

interface DashboardData {
  level: LevelResponse | null
  diagnostic: DiagnosticStateResponse | null
  today: TodayActionResponse | null
  recurringModules: RecurringModule[]
  recordings: RecordingSummary[] | null
}

export default function ProgressDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const examDate = useAuthStore((s) => s.user?.examDate ?? null)

  const load = useCallback(async () => {
    setFetchError(null)
    try {
      // Per-call .catch so one section's failure leaves the rest renderable.
      // The catch-all guard below only fires for unexpected JS-level errors
      // (parse, throw outside the request boundary).
      const [level, diagnostic, today, recurring, recordings] = await Promise.all([
        api.users.getLevel().catch(() => null),
        api.diagnostic.getState().catch(() => null),
        api.users.getToday().catch(() => null),
        api.users
          .getRecurringModules()
          .catch(() => ({ recurring_modules: [] as RecurringModule[] })),
        api.recordings.list({ limit: 5 }).catch(() => null),
      ])
      setData({
        level,
        diagnostic,
        today,
        recurringModules: recurring.recurring_modules ?? [],
        recordings,
      })
    } catch (err) {
      if (err instanceof ApiError) {
        setFetchError("Couldn't load your dashboard.")
      } else {
        setFetchError("Couldn't reach the server.")
      }
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, retryKey])

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: BG, fontFamily: DISPLAY_FONT }}>
      <div style={{ maxWidth: 440, margin: '0 auto', position: 'relative' }}>
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
            justifyContent: 'center',
            padding: 'var(--fp-safe-top) 16px 0 16px',
          }}
        >
          <h1
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 18,
              color: INK,
              margin: 0,
            }}
          >
            Progress
          </h1>
        </header>

        <main style={{ padding: '24px 16px', paddingBottom: 88 }}>
          {fetchError ? (
            <ErrorRetry message={fetchError} onRetry={() => setRetryKey((k) => k + 1)} />
          ) : data === null ? (
            <LoadingSkeleton />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <SnapshotSection
                level={data.level}
                diagnostic={data.diagnostic}
                examDate={examDate}
              />
              <TodayFocusSection today={data.today} />
              <GouletStackSection modules={data.recurringModules} />
              <RecentActivitySection recordings={data.recordings} />
            </div>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        className="animate-pulse"
        style={{ height: 140, borderRadius: 16, backgroundColor: '#1A1A1A0A' }}
      />
      <div
        className="animate-pulse"
        style={{ height: 100, borderRadius: 16, backgroundColor: '#1A1A1A06' }}
      />
      <div
        className="animate-pulse"
        style={{ height: 80, borderRadius: 16, backgroundColor: '#1A1A1A06' }}
      />
      <div
        className="animate-pulse"
        style={{ height: 80, borderRadius: 16, backgroundColor: '#1A1A1A06' }}
      />
    </div>
  )
}

function ErrorRetry({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
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
