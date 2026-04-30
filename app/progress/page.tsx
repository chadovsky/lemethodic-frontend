'use client'

// P-100 — Progress dashboard. Replaces the F-058 "Coming soon"
// placeholder. Step-3 build: orchestrator + EmptyState + Section 4
// (Recurring patterns). Sections 1-3 (snapshot card, sustained couches,
// activity timeline) ship in the next PR — this commit lands a usable
// empty-state path and the highest-confidence section first.

import { useCallback, useEffect, useState } from 'react'
import BottomNav from '@/components/home/BottomNav'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import EmptyState from '@/components/dashboard/EmptyState'
import RecurringModulesList from '@/components/dashboard/RecurringModulesList'
import { api, ApiError } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import type { Lesson, RecordingSummary, RecurringModule } from '@/lib/types'

const INK         = '#1A1A1A'
const INK_MUTED   = '#1A1A1A66'
const BG          = '#FAFAF7'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

export default function ProgressPage() {
  return (
    <ProtectedRoute>
      <ProgressDashboard />
    </ProtectedRoute>
  )
}

function ProgressDashboard() {
  const [recordings, setRecordings] = useState<RecordingSummary[] | null>(null)
  const [lessons, setLessons] = useState<Lesson[] | null>(null)
  const [recurringModules, setRecurringModules] = useState<RecurringModule[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  // Mirrors HomeScreen: parallel fetches with per-call .catch fallbacks
  // so one section's failure doesn't blank the entire page. /me is
  // refreshed in the background — failure is non-fatal (we already have
  // the cached user from auth store hydration).
  const load = useCallback(async () => {
    setFetchError(null)
    try {
      const [me, recordingsList, lessonsList, recurring] = await Promise.all([
        api.users.getMe().catch(() => null),
        api.recordings.list({ limit: 5 }).catch(() => null),
        api.lessons.list().catch(() => null),
        api.users.getRecurringModules().catch(() => ({ recurring_modules: [] })),
      ])
      if (me) {
        const token = useAuthStore.getState().token
        if (token) useAuthStore.getState().setAuth(token, me)
      }
      // Treat a recordings-list failure as "no data yet" — the dashboard
      // can still render the recurring modules surface even if the list
      // endpoint is hiccuping. The empty-state branch fires only when
      // the call succeeds AND returns an empty array.
      setRecordings(recordingsList ?? [])
      setLessons(lessonsList ?? [])
      setRecurringModules(recurring.recurring_modules ?? [])
    } catch (err) {
      // Catch-all guard above the per-call fallbacks. Should rarely fire
      // since each fetch already swallows its own failure, but kept so a
      // surprise (e.g. JSON parse during request())throw) doesn't crash
      // the page.
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

  const isLoading = recordings === null || lessons === null
  const isEmpty = recordings !== null && recordings.length === 0

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: BG, fontFamily: DISPLAY_FONT }}>
      <div style={{ maxWidth: 440, margin: '0 auto', position: 'relative' }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            height: 56,
            backgroundColor: BG,
            borderBottom: '1px solid #1A1A1A0A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 16px',
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
          ) : isLoading ? (
            <LoadingSkeleton />
          ) : isEmpty ? (
            <EmptyState />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {/* Sections 1-3 (snapshot, sustained couches, activity
                  timeline) ship in the next P-100 PR. */}
              <RecurringModulesList modules={recurringModules} lessons={lessons} />
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
        style={{ height: 120, borderRadius: 16, backgroundColor: '#1A1A1A0A' }}
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
