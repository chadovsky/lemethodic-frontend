// F-323 — Le Vocabulaire test engine.
//
// Pure factory functions over VocabularyChunk[]. No React, no fetch, no
// localStorage. TestClient.tsx (B2) imports these and composes them into
// the four exercise views; storage / grading still happens via
// lib/practice-state.ts (B1 of F-322) so test and practice failures
// share one history.
//
// Distractor pool quality at F-321 seed scale (~150-250 chunks per topic,
// FE fetches first page = 20) is healthy enough that random sampling
// gives non-repetitive distractors across a 20-question session. Tiny
// topics fall under the 4-chunk gate (BACKLOG F-323) and never reach
// these helpers.

import type {
  PracticeDirection,
} from './practice-state'
import type { VocabularyChunk } from './types'

// ── Direction helpers ────────────────────────────────────────────────────

// `direction` semantics match F-322: 'fr' = show FR, reveal/expect EN
// (comprehension); 'en' = show EN, expect FR (recall). For test mode,
// "shown" is the prompt and "hidden" is what the user must produce or
// recognize.
export function getShown(chunk: VocabularyChunk, direction: PracticeDirection): string {
  return direction === 'fr' ? chunk.chunkFr : chunk.translationEn
}

export function getHidden(chunk: VocabularyChunk, direction: PracticeDirection): string {
  return direction === 'fr' ? chunk.translationEn : chunk.chunkFr
}

// ── Distractor picking ───────────────────────────────────────────────────

// Picks `count` random sibling chunks from `pool` excluding `correct`.
// Returns the hidden-side strings (what the user picks from in MCQ /
// Dropdown). Falls back to repeating the en-dash placeholder when the
// pool is exhausted — this only happens if the BACKLOG 4-chunk gate is
// bypassed somehow, e.g., a topic shrinking mid-session.
export function pickDistractors(
  correct: VocabularyChunk,
  pool: VocabularyChunk[],
  direction: PracticeDirection,
  count: number,
): string[] {
  const candidates = pool.filter((c) => c.id !== correct.id)
  const shuffled = shuffle(candidates)
  const expected = getHidden(correct, direction)
  const out: string[] = []
  for (const c of shuffled) {
    const value = getHidden(c, direction)
    if (value === expected) continue          // collision dedupe
    if (out.includes(value)) continue         // string dedupe
    out.push(value)
    if (out.length >= count) break
  }
  while (out.length < count) out.push('—')     // placeholder fallback
  return out
}

// ── Exercise factories ───────────────────────────────────────────────────

export interface MCQQuestion {
  chunkId: number
  prompt: string                              // shown-side
  correct: string                             // hidden-side
  options: string[]                           // shuffled, includes correct
}

export function buildMCQ(
  chunk: VocabularyChunk,
  pool: VocabularyChunk[],
  direction: PracticeDirection,
): MCQQuestion {
  const correct = getHidden(chunk, direction)
  const distractors = pickDistractors(chunk, pool, direction, 3)
  const options = shuffle([correct, ...distractors])
  return {
    chunkId: chunk.id,
    prompt: getShown(chunk, direction),
    correct,
    options,
  }
}

export interface DropdownQuestion {
  chunkId: number
  shown: string                               // shown-side, rendered above the dropdown
  correct: string
  options: string[]                           // shuffled, includes correct
}

export function buildDropdown(
  chunk: VocabularyChunk,
  pool: VocabularyChunk[],
  direction: PracticeDirection,
): DropdownQuestion {
  const correct = getHidden(chunk, direction)
  const distractors = pickDistractors(chunk, pool, direction, 3)
  const options = shuffle([correct, ...distractors])
  return {
    chunkId: chunk.id,
    shown: getShown(chunk, direction),
    correct,
    options,
  }
}

export interface ExactQuestion {
  chunkId: number
  prompt: string                              // shown-side
  expected: string                            // hidden-side (raw; comparison normalizes)
}

export function buildExact(
  chunk: VocabularyChunk,
  direction: PracticeDirection,
): ExactQuestion {
  return {
    chunkId: chunk.id,
    prompt: getShown(chunk, direction),
    expected: getHidden(chunk, direction),
  }
}

// Normalize for permissive matching. Per BACKLOG F-323: case-insensitive
// + whitespace-trim + accent-strip + punctuation-strip. Order matters —
// accent-strip uses NFD then strips combining marks, which can introduce
// extra whitespace if punctuation/marks were adjacent.
const COMBINING_MARKS = /[̀-ͯ]/g  // Unicode combining diacritical marks block
const PUNCT_ASCII = /[.,;:!?'"`()\[\]{}\-]/g
const PUNCT_SMART = /[‘’“”–—]/g  // smart quotes + en/em dashes

export function normalizeExactAnswer(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(PUNCT_ASCII, '')
    .replace(PUNCT_SMART, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function gradeExact(userInput: string, expected: string): boolean {
  return normalizeExactAnswer(userInput) === normalizeExactAnswer(expected)
}

export interface MatchingPair {
  chunkId: number
  fr: string
  en: string
}

export interface MatchingBlock {
  pairs: MatchingPair[]                       // up to 5; raw order = correct order
}

// Takes up to 5 chunks and returns the matching block. Pairs are
// surfaced with both languages explicitly — MatchingView column layout
// renders FR on one side and EN on the other regardless of direction.
// (Direction would have meaning if matching were "FR -> ??" with hidden
// EN; in practice the matching exercise shows BOTH sides because the
// task is pairing, not recall. Direction in matching mode only affects
// which column is on the left for cosmetic consistency with other
// exercises.)
export function buildMatchingBlock(chunks: VocabularyChunk[]): MatchingBlock {
  return {
    pairs: chunks.slice(0, 5).map((c) => ({
      chunkId: c.id,
      fr: c.chunkFr,
      en: c.translationEn,
    })),
  }
}

// Grade a matching block by checking each chunk's user-selected pair.
// Map shape: chunkId -> the chunkId the user paired it with (could be
// itself = correct, or a different chunkId = wrong).
export type MatchingUserPairs = Record<number, number>

export function gradeMatching(
  userPairs: MatchingUserPairs,
  block: MatchingBlock,
): Record<number, 'pass' | 'fail'> {
  const out: Record<number, 'pass' | 'fail'> = {}
  for (const pair of block.pairs) {
    out[pair.chunkId] = userPairs[pair.chunkId] === pair.chunkId ? 'pass' : 'fail'
  }
  return out
}

// ── Shared shuffle ───────────────────────────────────────────────────────

// Fisher-Yates over a copy; original untouched. Exported for tests +
// for the matching-block "shuffle the second column" path in MatchingView.
export function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
