// UI-013 — static fixture of the 3 TCF Canada speaking tâches, consumed
// by the Diagnostic landing (UI-013) and the Tâche shell (UI-014). The
// `prompt` field is read by UI-014 only; UI-013 reads title / descriptor
// / durationLabel. Real curriculum-validated copy lands in CON-XXX.

export type TacheId = 1 | 2 | 3

export interface Tache {
  id: TacheId
  title: string
  descriptor: string
  durationLabel: string
  prompt: string
}

export const TACHES: readonly Tache[] = [
  {
    id: 1,
    title: "Tâche 1 : Échange d'informations",
    descriptor:
      "Vous posez des questions à l'examinateur pour obtenir des informations sur un sujet concret de la vie courante.",
    durationLabel: '~3 min',
    prompt:
      "Vous souhaitez vous inscrire à un cours de cuisine près de chez vous. Posez 5 questions à l'examinateur pour obtenir les informations dont vous avez besoin.",
  },
  {
    id: 2,
    title: "Tâche 2 : Échange d'opinions",
    descriptor:
      "Vous échangez des opinions sur un sujet de la vie courante avec l'examinateur, en justifiant votre point de vue.",
    durationLabel: '~3 min 30',
    prompt:
      'Donnez votre avis sur le télétravail. Préférez-vous travailler à distance ou au bureau ? Expliquez vos raisons.',
  },
  {
    id: 3,
    title: 'Tâche 3 : Comparaison et argumentation',
    descriptor:
      "Vous comparez deux documents proposés par l'examinateur et défendez le choix qui vous paraît le plus pertinent.",
    durationLabel: '~5 min',
    prompt:
      "Voici deux destinations proposées par votre entreprise pour un séminaire d'équipe. Comparez-les et expliquez laquelle vous choisiriez.",
  },
] as const
