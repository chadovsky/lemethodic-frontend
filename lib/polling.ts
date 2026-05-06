'use client'

// V-016a.fe — generic job-polling hook for BE async jobs (writing
// submission today; reusable for any future job-shaped pattern).
//
// Implementation: recursive setTimeout (NOT setInterval). Next poll is
// scheduled only after the current request resolves, so a slow network
// can't stack pending requests against the backend. Cancellation flag
// is tracked via useRef and flipped on cleanup; an in-flight request's
// resolution after cancellation is dropped silently.

import { useEffect, useRef, useState } from 'react'

export type PollJobState<T> =
  | { kind: 'idle' }
  | { kind: 'polling'; pollCount: number }
  | { kind: 'completed'; result: T; pollCount: number }
  | { kind: 'failed'; message: string; pollCount: number }
  | { kind: 'abandoned'; pollCount: number }

// Generic job-shape contract. Consumers tell the hook how to fetch the
// job; the hook drives the loop. The job's `status` is the discriminator;
// `result` carries the typed payload on completion; `error` carries a
// surfaceable message on failure.
export interface PollJobResponse<T> {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: T | null
  error?: { message: string; code?: string } | null
}

export interface UsePollJobOptions<T> {
  // null disables the hook (useful when the parent component hasn't
  // yet captured a job_id from POST). Changing the value resets the
  // poll loop (cancels the previous, starts the new).
  jobId: string | null
  // Stable reference required — caller is expected to pass a top-level
  // function (e.g., api.writing.getJob) or memoize their fetcher.
  fetcher: (jobId: string) => Promise<PollJobResponse<T>>
  intervalMs?: number
  maxPolls?: number
}

export function usePollJob<T>({
  jobId,
  fetcher,
  intervalMs = 3000,
  maxPolls = 100,
}: UsePollJobOptions<T>): PollJobState<T> {
  const [state, setState] = useState<PollJobState<T>>({ kind: 'idle' })
  const cancelledRef = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!jobId) {
      setState({ kind: 'idle' })
      return
    }
    cancelledRef.current = false
    let pollCount = 0
    setState({ kind: 'polling', pollCount: 0 })

    const poll = async () => {
      if (cancelledRef.current) return
      pollCount += 1
      try {
        const job = await fetcher(jobId)
        if (cancelledRef.current) return
        if (job.status === 'completed') {
          if (job.result == null) {
            setState({
              kind: 'failed',
              pollCount,
              message: 'Job completed but no result was returned.',
            })
            return
          }
          setState({ kind: 'completed', pollCount, result: job.result })
          return
        }
        if (job.status === 'failed') {
          setState({
            kind: 'failed',
            pollCount,
            message: job.error?.message ?? 'Analysis failed.',
          })
          return
        }
        // Still pending / processing — schedule next poll or abandon.
        if (pollCount >= maxPolls) {
          setState({ kind: 'abandoned', pollCount })
          return
        }
        setState({ kind: 'polling', pollCount })
        timeoutRef.current = setTimeout(poll, intervalMs)
      } catch {
        if (cancelledRef.current) return
        // Network / parse error during a poll — fail rather than retry
        // silently. Caller decides whether to surface a retry button.
        setState({ kind: 'failed', pollCount, message: 'Lost connection to server.' })
      }
    }

    poll()

    return () => {
      cancelledRef.current = true
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [jobId, fetcher, intervalMs, maxPolls])

  return state
}
