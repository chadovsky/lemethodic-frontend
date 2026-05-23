import type { Tache } from '@/lib/data/taches'
import { TACHES } from '@/lib/data/taches'

// BE shape 1 — Tâche 1
// No dedicated live endpoint; T1 metadata is static fixture. The session
// /start response includes an opening examiner turn in `examiner_turn_text`
// (see lib/api.ts RawConversationStart) but that is session-level, not
// tâche-description level.

// BE shape 2 — Tâche 2 scenarios (GET /api/conversations/scenarios)
// Raw body: { scenarios: Array<{ id, code, difficulty }>, gates: { above_a2 } }
export interface RawTache2Scenario {
  id: number
  code: string
  difficulty: string
}

// BE shape 3 — Tâche 3 topics (GET /api/recordings/tache3-topics)
// Raw body: { topics: Array<{ id, title, theme, sous_theme, difficulty, prompt_fr, prompt_en, prompt_es }>, gates: { above_a2 } }
export interface RawTache3Topic {
  id: number
  title: string
  theme: string
  sous_theme: string
  difficulty: string
  prompt_fr: string
  prompt_en: string
  prompt_es: string
}

export function normalizeTache1(): Tache {
  return { ...TACHES[0] }
}

export function normalizeTache2Scenario(scenario: RawTache2Scenario): Tache {
  return { ...TACHES[1], prompt: scenario.code }
}

export function normalizeTache3Topic(topic: RawTache3Topic): Tache {
  return { ...TACHES[2], prompt: topic.prompt_fr }
}
