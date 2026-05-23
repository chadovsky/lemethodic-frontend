// @deprecated — Static fixture for the 3 TCF Canada speaking tâches. Consumed
// by lib/api/taches.ts (fetchTaches / fetchTache). UI-013 reads title /
// descriptor / durationLabel; UI-014 reads prompt + durationSeconds.
// Replace this fixture with a live backend call when GET /api/taches is
// exposed by FastAPI.

export type TacheId = 1 | 2 | 3

export interface Tache {
  id: TacheId
  title: string
  descriptor: string
  durationLabel: string
  durationSeconds: number
  prompt: string
}

export const TACHES: readonly Tache[] = [
  {
    id: 1,
    title: "Tâche 1 : Échange d'informations",
    descriptor:
      "Vous posez des questions à l'examinateur pour obtenir des informations sur un sujet concret de la vie courante.",
    durationLabel: '~3 min',
    durationSeconds: 180,
    prompt:
      "Vous souhaitez vous inscrire à un cours de cuisine près de chez vous. Posez 5 questions à l'examinateur pour obtenir les informations dont vous avez besoin.",
  },
  {
    id: 2,
    title: "Tâche 2 : Échange d'opinions",
    descriptor:
      "Vous échangez des opinions sur un sujet de la vie courante avec l'examinateur, en justifiant votre point de vue.",
    durationLabel: '~3 min 30',
    durationSeconds: 210,
    prompt:
      'Donnez votre avis sur le télétravail. Préférez-vous travailler à distance ou au bureau ? Expliquez vos raisons.',
  },
  {
    id: 3,
    title: 'Tâche 3 : Comparaison et argumentation',
    descriptor:
      "Vous comparez deux documents proposés par l'examinateur et défendez le choix qui vous paraît le plus pertinent.",
    durationLabel: '~5 min',
    durationSeconds: 300,
    prompt:
      "Voici deux destinations proposées par votre entreprise pour un séminaire d'équipe. Comparez-les et expliquez laquelle vous choisiriez.",
  },
] as const
