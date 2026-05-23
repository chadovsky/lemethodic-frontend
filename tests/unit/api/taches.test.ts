import { describe, expect, it } from 'vitest'
import { fetchTaches, fetchTache } from '@/lib/api/taches'

describe('fetchTaches', () => {
  it('returns all 3 tâches in ascending id order', async () => {
    const taches = await fetchTaches()
    expect(taches).toHaveLength(3)
    expect(taches[0].id).toBe(1)
    expect(taches[1].id).toBe(2)
    expect(taches[2].id).toBe(3)
  })

  it('each tâche has durationSeconds set correctly', async () => {
    const taches = await fetchTaches()
    expect(taches[0].durationSeconds).toBe(180)
    expect(taches[1].durationSeconds).toBe(210)
    expect(taches[2].durationSeconds).toBe(300)
  })

  it('each tâche has required fields: title, descriptor, durationLabel, prompt', async () => {
    const taches = await fetchTaches()
    for (const t of taches) {
      expect(typeof t.title).toBe('string')
      expect(typeof t.descriptor).toBe('string')
      expect(typeof t.durationLabel).toBe('string')
      expect(typeof t.prompt).toBe('string')
    }
  })
})

describe('fetchTache', () => {
  it('returns tâche 1 with durationSeconds 180', async () => {
    const t = await fetchTache(1)
    expect(t).not.toBeNull()
    expect(t!.id).toBe(1)
    expect(t!.durationSeconds).toBe(180)
  })

  it('returns tâche 2 with durationSeconds 210', async () => {
    const t = await fetchTache(2)
    expect(t!.id).toBe(2)
    expect(t!.durationSeconds).toBe(210)
  })

  it('returns tâche 3 with durationSeconds 300', async () => {
    const t = await fetchTache(3)
    expect(t!.id).toBe(3)
    expect(t!.durationSeconds).toBe(300)
  })

  it('returns null for unknown id (4)', async () => {
    const t = await fetchTache(4)
    expect(t).toBeNull()
  })

  it('returns null for id 0', async () => {
    const t = await fetchTache(0)
    expect(t).toBeNull()
  })
})
