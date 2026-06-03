import type { DialogueProps } from '@/components/iles/molds/Dialogue'
import type { ActeDeParoleProps } from '@/components/iles/molds/ActeDeParole'
import type { ActiviteProps } from '@/components/iles/molds/Activite'
import type { TacheProps } from '@/components/iles/molds/Tache'

export type SeanceStep =
  | { type: 'dialogue'; props: DialogueProps }
  | { type: 'acte'; props: ActeDeParoleProps }
  | { type: 'activite'; props: ActiviteProps }
  | { type: 'tache'; props: TacheProps }

export interface SeanceSession {
  ile: string
  level: string
  displayTitle: string
  steps: SeanceStep[]
}

// Static focused session definitions — curated subset of île molds (not the full île).
// Mirrors the MDX source data for each île; kept in sync manually until BE wiring (F-417).
export const SESSIONS: SeanceSession[] = [
  {
    ile: '_sample',
    level: 'b1',
    displayTitle: 'La famille',
    steps: [
      {
        type: 'dialogue',
        props: {
          audio: '/iles/_sample/audio/b1/dialogue.mp3',
          transcript: [
            { speaker: 'Leila', text: "Bonjour Theo. Tu veux voir des photos de ma famille?" },
            { speaker: 'Theo', text: "Avec plaisir! Tu as des freres et soeurs?" },
            { speaker: 'Leila', text: "Oui, j'ai deux grands freres et une petite soeur. Et toi, tu viens d'une grande famille?" },
            { speaker: 'Theo', text: "Non, je suis enfant unique. Mais mes parents ont beaucoup de neveux et de nieces." },
            { speaker: 'Leila', text: "Ca doit etre tranquille chez toi. Chez nous, c'est toujours anime. Ma soeur joue du violon." },
            { speaker: 'Theo', text: "Et tes parents, qu'est-ce qu'ils font dans la vie?" },
            { speaker: 'Leila', text: "Mon pere est medecin et ma mere enseigne les mathematiques au lycee. Et tes parents?" },
            { speaker: 'Theo', text: "Mon pere est architecte et ma mere travaille dans la finance. On se voit souvent le week-end." },
          ],
          comprehensionChecks: [
            {
              type: 'mcq',
              question: "Quelle est la composition de la fratrie de Leila?",
              options: [
                "Un frere et une soeur",
                "Deux freres et une soeur",
                "Trois soeurs",
                "Elle est enfant unique",
              ],
              correctIndex: 1,
            },
            {
              type: 'vrai-faux',
              question: "Le pere de Leila est professeur de mathematiques.",
              options: ["Vrai", "Faux"],
              correctIndex: 1,
            },
          ],
        },
      },
      {
        type: 'acte',
        props: {
          fonction: "Demander poliment de répéter",
          formules: [
            { text: "Pourriez-vous répéter, s'il vous plaît?" },
            { text: "Je n'ai pas bien compris. Vous pouvez répéter?" },
            { text: "Excusez-moi, pourriez-vous parler plus lentement?" },
            { text: "Pardon, je n'ai pas saisi. Vous dites...?" },
          ],
          register: 'courant',
        },
      },
      {
        type: 'activite',
        props: {
          subtype: 'comprehension',
          question: "Que fait le pere de Theo dans la vie?",
          options: [
            "Il est medecin",
            "Il est professeur",
            "Il est architecte",
            "Il travaille dans la finance",
          ],
          correctIndex: 2,
          feedbackCorrect: "Exact. Le pere de Theo est architecte.",
          feedbackWrong: "Attention — c'est la mere de Theo qui travaille dans la finance.",
        },
      },
      {
        type: 'activite',
        props: {
          subtype: 'reflexe',
          items: [
            {
              prompt: "Mon frere est very tall pour son age.",
              expected: "Mon frere est tres grand pour son age.",
            },
            {
              prompt: "Mes parents sont very supportifs dans tout ce que je fais.",
              expected: "Mes parents me soutiennent dans tout ce que je fais.",
            },
            {
              prompt: "On se voit every weekend en famille.",
              expected: "On se voit tous les week-ends en famille.",
            },
          ],
        },
      },
      {
        type: 'tache',
        props: {
          prompt: "Presentez votre famille a un responsable d'association qui vous accueille dans une rencontre communautaire. Decrivez qui sont vos proches, quels sont leurs metiers, et ce que la famille represente pour vous.",
          scenario: "Vous participez a une rencontre communautaire a Montreal. Un benevole vous accueille et vous invite a vous presenter avec votre entourage.",
          targetLength: '3-4 minutes',
          type: 'oral',
        },
      },
    ],
  },
  {
    ile: 'cafe',
    level: 'b1',
    displayTitle: 'Au café',
    steps: [
      {
        type: 'dialogue',
        props: {
          audio: '/iles/cafe/audio/b1/dialogue.mp3',
          transcript: [
            { speaker: 'Serveur', text: "Bonjour, vous avez choisi?" },
            { speaker: 'Cliente', text: "Oui, je voudrais un cafe creme, s'il vous plait." },
            { speaker: 'Serveur', text: "Tres bien. Et avec ca?" },
            { speaker: 'Cliente', text: "Un croissant, s'il vous plait. C'est combien?" },
            { speaker: 'Serveur', text: "Alors, quatre euros cinquante en tout." },
            { speaker: 'Cliente', text: "Voila. Merci beaucoup." },
            { speaker: 'Serveur', text: "Je vous en prie. Bonne journee!" },
          ],
          comprehensionChecks: [
            {
              type: 'mcq',
              question: "Qu'est-ce que la cliente commande a boire?",
              options: [
                "Un cafe noir",
                "Un cafe creme",
                "Un the",
                "Un jus d'orange",
              ],
              correctIndex: 1,
            },
            {
              type: 'vrai-faux',
              question: "La commande totale coute cinq euros.",
              options: ["Vrai", "Faux"],
              correctIndex: 1,
            },
          ],
        },
      },
      {
        type: 'acte',
        props: {
          fonction: "Commander une boisson au café",
          formules: [
            { text: "Je voudrais un cafe, s'il vous plait." },
            { text: "Un the au lait, s'il vous plait." },
            { text: "Vous avez des croissants?" },
            { text: "L'addition, s'il vous plait." },
          ],
          register: 'courant',
        },
      },
      {
        type: 'tache',
        props: {
          prompt: "Vous etes dans un cafe parisien. Commandez une boisson et une viennoiserie. Demandez le prix et remerciez le serveur.",
          scenario: "Vous arretez dans un cafe du quartier avant une reunion importante. Le serveur vous accueille et attend votre commande.",
          targetLength: '1-2 minutes',
          type: 'oral',
        },
      },
    ],
  },
]
