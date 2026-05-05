// M-101a — client-side waitlist persistence. Stores Sprint and Premium
// signups in localStorage until M-101c upgrades to a BE endpoint. Same email
// can sign up for both Sprint and Premium independently; same email +
// same intent is idempotent (returns 'already_on_list').

const KEY = 'lemethodic_waitlist'

// F-221 — `exam_other` added for the "Another exam" branch on the
// onboarding exam picker. Captures which exam the user wants in
// `examName` (free text, e.g., "DALF C1") so M-101c migration can
// surface intent to the BE later.
export type WaitlistIntent = 'sprint' | 'premium' | 'exam_other'

export interface WaitlistEntry {
  email: string
  intent: WaitlistIntent
  examDate: string | null    // YYYY-MM-DD or null
  examName: string | null    // F-221: which exam the user wants (exam_other only)
  submittedAt: string        // ISO timestamp
}

export type SubmitResult =
  | { ok: true; entry: WaitlistEntry; alreadyOnList: boolean }
  | { ok: false; reason: 'invalid_email' | 'storage_unavailable' }

function readAll(): WaitlistEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((e): e is WaitlistEntry => {
      return (
        e &&
        typeof e === 'object' &&
        typeof e.email === 'string' &&
        (e.intent === 'sprint' || e.intent === 'premium' || e.intent === 'exam_other') &&
        (e.examDate === null || typeof e.examDate === 'string') &&
        (e.examName === null ||
          e.examName === undefined ||
          typeof e.examName === 'string') &&
        typeof e.submittedAt === 'string'
      )
    })
  } catch {
    return []
  }
}

function writeAll(entries: WaitlistEntry[]): boolean {
  if (typeof window === 'undefined') return false
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries))
    return true
  } catch {
    return false
  }
}

// Permissive: requires non-empty local-part, '@', non-empty domain with at
// least one dot. The BE validates strictly; this is just a guard against
// obviously-broken input that costs us a 422 round-trip later.
export function isValidEmail(input: string): boolean {
  const e = input.trim()
  if (e.length < 5 || e.length > 254) return false
  const at = e.indexOf('@')
  if (at <= 0 || at !== e.lastIndexOf('@')) return false
  const local = e.slice(0, at)
  const domain = e.slice(at + 1)
  if (!local || !domain) return false
  const dot = domain.lastIndexOf('.')
  if (dot < 1 || dot === domain.length - 1) return false
  return true
}

export function submitWaitlist(input: {
  email: string
  intent: WaitlistIntent
  examDate?: string | null
  // F-221: which exam the user wants (only applies when intent='exam_other').
  examName?: string | null
}): SubmitResult {
  const email = input.email.trim().toLowerCase()
  if (!isValidEmail(email)) return { ok: false, reason: 'invalid_email' }

  const entries = readAll()
  const existing = entries.find((e) => e.email === email && e.intent === input.intent)
  if (existing) return { ok: true, entry: existing, alreadyOnList: true }

  const entry: WaitlistEntry = {
    email,
    intent: input.intent,
    examDate: input.examDate ?? null,
    examName: input.examName?.trim() || null,
    submittedAt: new Date().toISOString(),
  }
  const next = [...entries, entry]
  if (!writeAll(next)) return { ok: false, reason: 'storage_unavailable' }
  return { ok: true, entry, alreadyOnList: false }
}

// For tests / future BE migration: dump all entries so M-101c can POST them
// in bulk on first authenticated load.
export function readAllWaitlist(): WaitlistEntry[] {
  return readAll()
}
