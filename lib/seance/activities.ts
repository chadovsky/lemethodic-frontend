// F-460 - La Seance activity shell descriptors.
//
// The linear Practice walk steps through an ile's 5 activities (Ile.practice[]).
// Phase 2 renders each as a content-free SHELL: a title, a one-line "what this
// will be" descriptor, and a bientot marker. No exercise content, no scoring,
// no interactivity (all Phase 3). Keyed by ActivityType so the shells stay in
// lockstep with the journey model's ACTIVITY_TYPES.

import type { ActivityType } from '@/lib/journey/journey'

export interface ActivityShellCopy {
  // Short eyebrow shown above the activity title in the walk.
  kicker: string
  // One-line description of what the activity will hold once authored.
  description: string
}

export const ACTIVITY_SHELL_COPY: Record<ActivityType, ActivityShellCopy> = {
  traduction: {
    kicker: 'Traduction',
    description:
      "Traduisez des phrases du theme pour ancrer le vocabulaire et les structures.",
  },
  grammaire: {
    kicker: 'Grammaire',
    description:
      "Entrainez les points de grammaire de l'ile, pieges anglais compris.",
  },
  expression_ecrite: {
    kicker: 'Expression ecrite',
    description:
      "Redigez un court texte sur le theme et recevez un retour de Le Maitre.",
  },
  expression_orale: {
    kicker: 'Expression orale',
    description:
      "Prenez la parole sur le theme et travaillez votre aisance a l'oral.",
  },
  comprehension_orale: {
    kicker: 'Comprehension orale',
    description:
      "Ecoutez un document audio du theme et verifiez votre comprehension.",
  },
}
