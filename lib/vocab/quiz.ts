// UI-012 — pure quiz-building logic for Le Vocabulaire test view.
//
// buildQuiz(chunks, count) returns `count` deterministic multi-choice
// questions drawn from the first `count` chunks. Distractors are pulled
// from later positions in the fixture using prime offsets so all 4
// glosses stay unique, and correctIndex follows a deterministic rotation
// so tests are reproducible. Adaptive selection (spaced repetition,
// difficulty banding) is AI-XXX scope and out of this file.

import type { Chunk } from '@/lib/data/chunks'

export interface QuizQuestionData {
  chunk: Chunk
  choices: string[]
  correctIndex: number
}

const DISTRACTOR_OFFSETS = [11, 17, 23] as const

export function buildQuiz(
  chunks: readonly Chunk[],
  count: number,
): QuizQuestionData[] {
  if (count < 1) {
    throw new Error(`buildQuiz: count must be >= 1, got ${count}`)
  }
  if (count > chunks.length) {
    throw new Error(
      `buildQuiz: count ${count} exceeds available chunks (${chunks.length})`,
    )
  }

  const N = chunks.length
  const questions: QuizQuestionData[] = []

  for (let i = 0; i < count; i++) {
    const promptChunk = chunks[i]
    const distractorGlosses: string[] = []
    const usedGlosses = new Set<string>([promptChunk.en])

    for (const offset of DISTRACTOR_OFFSETS) {
      // Walk forward from (i + offset) until we hit a chunk whose gloss
      // hasn't been used. Guards against collisions when the prompt
      // chunk + an offset chunk share a gloss (shouldn't happen in the
      // fixture, but the loop keeps the function safe under future
      // edits).
      let step = 0
      while (step < N) {
        const candidate = chunks[(i + offset + step) % N]
        if (!usedGlosses.has(candidate.en)) {
          distractorGlosses.push(candidate.en)
          usedGlosses.add(candidate.en)
          break
        }
        step++
      }
    }

    const correctIndex = i % 4
    const choices = [...distractorGlosses]
    choices.splice(correctIndex, 0, promptChunk.en)

    questions.push({
      chunk: promptChunk,
      choices,
      correctIndex,
    })
  }

  return questions
}
