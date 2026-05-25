export type ActivityCategory = 'lesson' | 'vocab' | 'diagnostic'

export interface ActivityRow {
  label: string
  detail: string
  relativeTime: string
  category: ActivityCategory
}

export interface ProgressLayer {
  slug: string
  name: string
  percent: number
}

export const PROGRESS_LAYERS: readonly ProgressLayer[] = [
  { slug: 'le-fond', name: 'Le Propos', percent: 80 },
  { slug: 'les-moules-des-idees', name: 'Le Plan', percent: 60 },
  { slug: 'les-moules', name: 'La Construction', percent: 50 },
  { slug: 'les-reflexes-anglais', name: 'Les Pièges Anglais', percent: 35 },
  { slug: 'la-voix', name: 'La Musique', percent: 20 },
] as const

// 5 rows covering 2 lesson completions, 1 vocab session, 1 diagnostic tâche, 1 vocab test
export const RECENT_ACTIVITY: readonly ActivityRow[] = [
  {
    label: 'Leçon 5 terminée',
    detail: 'Fondations',
    relativeTime: 'il y a 1 jour',
    category: 'lesson',
  },
  {
    label: 'Leçon 4 terminée',
    detail: 'Fondations',
    relativeTime: 'il y a 2 jours',
    category: 'lesson',
  },
  {
    label: '10 chunks révisés',
    detail: 'La Bibliothèque',
    relativeTime: 'il y a 3 jours',
    category: 'vocab',
  },
  {
    label: 'Diagnostic Tâche 1 essayée',
    detail: "L'Examen",
    relativeTime: 'il y a 5 jours',
    category: 'diagnostic',
  },
  {
    label: '8 questions correctes',
    detail: 'Test de vocabulaire',
    relativeTime: 'il y a 6 jours',
    category: 'vocab',
  },
] as const

export const NEXT_LESSON = {
  id: 5,
  title: 'Le rythme de la phrase française',
}

export const DIAGNOSTIC_SCORE = {
  level: 'C1',
  lastEvaluatedLabel: 'il y a 7 jours',
} as const

// Category → dot color token
export const ACTIVITY_DOT_COLOR: Record<ActivityCategory, string> = {
  lesson: 'var(--fp-sage)',
  vocab: 'var(--fp-sky)',
  diagnostic: 'var(--fp-lavender)',
}
