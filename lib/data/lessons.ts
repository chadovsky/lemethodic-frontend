// UI-008 — static lesson fixture for L'École list + detail views.
// 16 Fondations + 11 Approfondissement = 27 lessons. Titles and
// descriptions are plausible-sounding placeholders; real curriculum
// content lands in CON-XXX. State distribution is illustrative
// (3 Terminée / 3 Disponible / 21 Verrouillée) per PRD UI-008.
// MOCK-008 — cefr field added: B1 for Fondations, B2 for Approfondissement.

export type LessonState = 'completed' | 'available' | 'locked'
export type LessonSection = 'fondations' | 'approfondissement'
export type LessonCefr = 'B1' | 'B2'

export interface Lesson {
  id: number
  title: string
  description: string
  section: LessonSection
  state: LessonState
  cefr: LessonCefr
}

const FONDATIONS_TITLES: { title: string; description: string }[] = [
  { title: "L'amorce d'une idée", description: 'Comment ouvrir une réponse sans hésiter ni traduire mot à mot.' },
  { title: 'Le présent du français parlé', description: 'Le temps de référence à l\'oral et ses pièges face à l\'anglais.' },
  { title: 'Les connecteurs essentiels', description: 'Sept connecteurs qui structurent toute prise de parole spontanée.' },
  { title: 'Les expressions de probabilité', description: 'Nuancer une opinion sans surcharger la phrase.' },
  { title: 'Le rythme de la phrase française', description: 'Pourquoi le débit anglo-saxon trahit le candidat à l\'oral.' },
  { title: 'Les marqueurs de temps', description: 'Situer une action sans alourdir le récit.' },
  { title: 'Les automatismes de l\'accord', description: 'Les accords qui se déclenchent à l\'oreille avant la grammaire.' },
  { title: 'Les questions à l\'oral', description: 'Reformuler une question sans changer le registre.' },
  { title: 'Les pronoms relatifs', description: 'Lier deux idées sans construire une seconde phrase.' },
  { title: 'Le subjonctif quotidien', description: 'Les vingt verbes qui demandent le subjonctif au quotidien.' },
  { title: 'Les négations nuancées', description: 'Aller au-delà du "ne… pas" pour préciser sa pensée.' },
  { title: 'La concordance des temps', description: 'Aligner les temps dans un récit sans réfléchir.' },
  { title: 'Les expressions de cause', description: 'Justifier une opinion avec les bonnes articulations.' },
  { title: 'Les expressions de conséquence', description: 'Enchaîner une idée vers sa conclusion logique.' },
  { title: 'L\'opinion construite', description: 'Une opinion en trois temps : position, raison, exemple.' },
  { title: 'La reformulation', description: 'Reprendre une idée pour gagner du temps et préciser sa pensée.' },
]

const APPROFONDISSEMENT_TITLES: { title: string; description: string }[] = [
  { title: 'L\'argumentation soutenue', description: 'Articuler un argument long sans perdre l\'examinateur.' },
  { title: 'La concession et l\'opposition', description: 'Nuancer un désaccord avec élégance et précision.' },
  { title: 'Le discours rapporté', description: 'Rapporter une parole sans calque depuis l\'anglais.' },
  { title: 'Les nuances du futur', description: 'Distinguer projection, certitude et engagement à l\'oral.' },
  { title: 'L\'expression de l\'hypothèse', description: 'Construire un raisonnement hypothétique en une seule phrase.' },
  { title: 'Le vocabulaire de l\'évaluation', description: 'Évaluer une situation sans répéter "bon" ou "mauvais".' },
  { title: 'Les registres de langue', description: 'Passer du registre courant au soutenu selon le contexte.' },
  { title: 'La précision lexicale', description: 'Choisir le mot juste plutôt que le mot disponible.' },
  { title: 'L\'écoute active à l\'oral', description: 'Reformuler la question de l\'examinateur pour mieux y répondre.' },
  { title: 'La synthèse improvisée', description: 'Résumer une position complexe en trente secondes.' },
  { title: 'La parole stratégique', description: 'Gérer le temps imparti et orienter l\'examinateur.' },
]

if (FONDATIONS_TITLES.length !== 16) {
  throw new Error(`Fondations fixture must have 16 entries, got ${FONDATIONS_TITLES.length}`)
}
if (APPROFONDISSEMENT_TITLES.length !== 11) {
  throw new Error(
    `Approfondissement fixture must have 11 entries, got ${APPROFONDISSEMENT_TITLES.length}`,
  )
}

function stateForLessonId(id: number): LessonState {
  if (id <= 3) return 'completed'
  if (id <= 6) return 'available'
  return 'locked'
}

export const LESSONS: readonly Lesson[] = [
  ...FONDATIONS_TITLES.map((entry, i) => ({
    id: i + 1,
    title: entry.title,
    description: entry.description,
    section: 'fondations' as const,
    state: stateForLessonId(i + 1),
    cefr: 'B1' as const,
  })),
  ...APPROFONDISSEMENT_TITLES.map((entry, i) => ({
    id: 17 + i,
    title: entry.title,
    description: entry.description,
    section: 'approfondissement' as const,
    state: stateForLessonId(17 + i),
    cefr: 'B2' as const,
  })),
]

export function getLessonById(id: number): Lesson | undefined {
  return LESSONS.find((l) => l.id === id)
}

export function lessonsBySection(section: LessonSection): Lesson[] {
  return LESSONS.filter((l) => l.section === section)
}

export const STATE_LABEL_FR: Record<LessonState, string> = {
  completed: 'Terminée',
  available: 'Disponible',
  locked: 'Verrouillée',
}
