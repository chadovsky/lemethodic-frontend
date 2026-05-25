import { describe, expect, it } from 'vitest'
import { CHUNKS } from '@/lib/data/chunks'
import { buildQuiz } from '@/lib/vocab/quiz'

describe('buildQuiz', () => {
  it('returns N questions for count=N', () => {
    expect(buildQuiz(CHUNKS, 10)).toHaveLength(10)
    expect(buildQuiz(CHUNKS, 5)).toHaveLength(5)
    expect(buildQuiz(CHUNKS, 1)).toHaveLength(1)
  })

  it('uses the first N chunks as the prompt chunks, in fixture order', () => {
    const quiz = buildQuiz(CHUNKS, 10)
    for (let i = 0; i < 10; i++) {
      expect(quiz[i].chunk).toBe(CHUNKS[i])
    }
  })

  it('each question has exactly 4 unique choices', () => {
    const quiz = buildQuiz(CHUNKS, 10)
    for (const q of quiz) {
      expect(q.choices).toHaveLength(4)
      expect(new Set(q.choices).size).toBe(4)
    }
  })

  it("correctIndex is a valid 0..3 index and points to the prompt chunk's English gloss", () => {
    const quiz = buildQuiz(CHUNKS, 10)
    for (const q of quiz) {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0)
      expect(q.correctIndex).toBeLessThan(4)
      expect(q.choices[q.correctIndex]).toBe(q.chunk.en)
    }
  })

  it('the 3 distractors are drawn from other chunks (not the prompt chunk)', () => {
    const quiz = buildQuiz(CHUNKS, 10)
    for (const q of quiz) {
      const distractors = q.choices.filter((_, i) => i !== q.correctIndex)
      for (const gloss of distractors) {
        expect(gloss).not.toBe(q.chunk.en)
        const matching = CHUNKS.find((c) => c.en === gloss)
        expect(matching).toBeDefined()
        expect(matching!.id).not.toBe(q.chunk.id)
      }
    }
  })

  it('is deterministic: same input yields identical output', () => {
    const a = buildQuiz(CHUNKS, 10)
    const b = buildQuiz(CHUNKS, 10)
    expect(a).toEqual(b)
  })

  it('throws if count exceeds available chunks', () => {
    expect(() => buildQuiz(CHUNKS, CHUNKS.length + 1)).toThrow()
  })

  it('throws if count is less than 1', () => {
    expect(() => buildQuiz(CHUNKS, 0)).toThrow()
  })
})
