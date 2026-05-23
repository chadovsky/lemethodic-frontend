import type { Tache } from '@/lib/data/taches'
import { TACHES } from '@/lib/data/taches'

// V1.0: reads from the static fixture.
// Swap to a live API call when GET /api/taches is exposed by FastAPI.

export async function fetchTaches(): Promise<Tache[]> {
  return [...TACHES]
}

export async function fetchTache(id: number): Promise<Tache | null> {
  return TACHES.find((t) => t.id === id) ?? null
}
