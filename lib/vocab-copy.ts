// F-325 — copy for Le Vocabulaire surfaces. EN + FR per shipped UiLanguage.
// ES is filed as F-326 placeholder for a later sprint.
//
// Pattern: keyed by interfaceLanguage; pick via vocabCopy[lang ?? 'en'].
// Fallback to 'en' when interfaceLanguage is null/undefined/unknown — same
// as the rest of the app's i18n surfaces.

import type { UiLanguage } from './types'

export interface VocabularyCopy {
  catalog: {
    title: string
    subtitle: string
    filterLabel: string
    filterAllOff: string  // when no partition filter is active
  }
  partition: {
    CC_corpus: string
    chadi_authored: string
    book_lab: string
  }
  topic: {
    chunkCountLabel: (n: number) => string
    examTagsLabel: string
    cefrRangeLabel: (min: string, max: string) => string
    sourcePrefix: string
  }
  empty: {
    corpusTitle: string
    corpusBody: string
    topicFilteredTitle: string
    topicFilteredBody: string
  }
  locked: {
    title: string
    body: string
    cta: string
  }
  filters: {
    cefrLevel: string
    examTag: string
    register: string
    none: string  // exam_tag null fallback chip label
  }
  detail: {
    backToCatalog: string
    loadMore: string
    loadingMore: string
    showFr: string
    showEn: string
  }
  error: {
    title: string
    body: string
    retry: string
  }
  practice: {
    startCta: string                          // CTA on topic detail
    configTitle: string                       // SessionConfigCard heading
    configSubtitle: string
    directionLabel: string
    directionFrLabel: string                  // "Show FR, reveal EN"
    directionEnLabel: string                  // "Show EN, reveal FR"
    sessionLengthLabel: string
    sessionLengthAll: string                  // "All in topic"
    startSession: string
    progressLabel: (i: number, n: number) => string  // "Card 3 of 20"
    reveal: string
    gotIt: string
    needReview: string
    endTitle: string
    endStat: (got: number, total: number) => string  // "12 of 20 — 60%"
    endNeedReview: (n: number) => string
    practiceAgain: string
    backToTopic: string
    browseCorpus: string
    emptyTitle: string
    emptyBody: string
    tierLockedTitle: string                    // copy uses copy.locked.* but
                                               // surface needs page-level
                                               // strings around it
    devLockBadge: string                       // dev-only flag indicator
  }
  test: {
    startCta: string
    configTitle: string
    configSubtitle: string
    exerciseTypeLabel: string
    typeMcq: string
    typeDropdown: string
    typeExact: string
    typeMatching: string
    startSession: string
    progressLabel: (i: number, n: number) => string
    mcqPrompt: string
    dropdownPrompt: string
    exactPrompt: string
    matchingPrompt: string
    submit: string
    next: string
    feedbackCorrect: string
    feedbackWrong: (correct: string) => string
    endTitle: string
    endStat: (got: number, total: number) => string
    testAgain: string
    softEmptyTitle: string
    softEmptyBody: string
    softEmptyCta: string
  }
}

const EN: VocabularyCopy = {
  catalog: {
    title: 'La Bibliothèque',
    subtitle: 'Topic-organized French chunks. Browse by partition; open a topic to filter by level, exam, or register.',
    filterLabel: 'Filter by partition',
    filterAllOff: 'Showing all partitions',
  },
  partition: {
    CC_corpus: 'CC corpus',
    chadi_authored: 'Authored',
    book_lab: 'Book lab',
  },
  topic: {
    chunkCountLabel: (n) => `${n} ${n === 1 ? 'chunk' : 'chunks'}`,
    examTagsLabel: 'Exam tags',
    cefrRangeLabel: (min, max) => (min === max ? min : `${min}–${max}`),
    sourcePrefix: 'Source: ',
  },
  empty: {
    corpusTitle: 'La Bibliothèque is coming.',
    corpusBody: 'The corpus is being prepared. The first topic sets will land here once content is seeded.',
    topicFilteredTitle: 'No chunks match these filters.',
    topicFilteredBody: 'Try widening the CEFR range or clearing an exam tag.',
  },
  locked: {
    title: 'Exam-tagged corpus is for paid plans.',
    body: 'Upgrade to unlock TCF / DELF / TEF topic sets.',
    cta: 'See plans',
  },
  filters: {
    cefrLevel: 'CEFR level',
    examTag: 'Exam tag',
    register: 'Register',
    none: 'Untagged',
  },
  detail: {
    backToCatalog: 'Back to topics',
    loadMore: 'Load more',
    loadingMore: 'Loading…',
    showFr: 'FR',
    showEn: 'EN',
  },
  error: {
    title: "Couldn't load.",
    body: 'Check your connection and try again.',
    retry: 'Retry',
  },
  practice: {
    startCta: 'Start practice',
    configTitle: 'Practice this topic',
    configSubtitle: 'Pick a direction and a session length. Chunks are shuffled per session.',
    directionLabel: 'Direction',
    directionFrLabel: 'Show FR · reveal EN',
    directionEnLabel: 'Show EN · reveal FR',
    sessionLengthLabel: 'Session length',
    sessionLengthAll: 'All in topic',
    startSession: 'Start session',
    progressLabel: (i, n) => `Card ${i} of ${n}`,
    reveal: 'Reveal',
    gotIt: 'Got it',
    needReview: 'Need review',
    endTitle: 'Session complete.',
    endStat: (got, total) =>
      `${got} of ${total} — ${total === 0 ? 0 : Math.round((got / total) * 100)}%`,
    endNeedReview: (n) =>
      `${n} ${n === 1 ? 'chunk' : 'chunks'} for review`,
    practiceAgain: 'Practice again',
    backToTopic: 'Back to topic',
    browseCorpus: 'Browse the corpus',
    emptyTitle: 'Nothing to practice yet.',
    emptyBody: 'This topic has no chunks. Check back once the corpus is seeded.',
    tierLockedTitle: 'This topic is exam-tagged.',
    devLockBadge: 'DEV: simulated tier lock',
  },
  test: {
    startCta: 'Start test',
    configTitle: 'Test this topic',
    configSubtitle: 'Pick an exercise type, a direction, and a session length.',
    exerciseTypeLabel: 'Exercise type',
    typeMcq: 'Multiple choice',
    typeDropdown: 'Dropdown',
    typeExact: 'Exact completion',
    typeMatching: 'Matching',
    startSession: 'Start session',
    progressLabel: (i, n) => `Question ${i} of ${n}`,
    mcqPrompt: 'Pick the translation',
    dropdownPrompt: 'Complete the translation',
    exactPrompt: 'Type the translation',
    matchingPrompt: 'Pair each chunk with its translation',
    submit: 'Submit',
    next: 'Next',
    feedbackCorrect: 'Correct.',
    feedbackWrong: (correct) => `Not quite — the answer was “${correct}”.`,
    endTitle: 'Test complete.',
    endStat: (got, total) =>
      `${got} of ${total} — ${total === 0 ? 0 : Math.round((got / total) * 100)}%`,
    testAgain: 'Test again',
    softEmptyTitle: 'Not enough chunks for a test.',
    softEmptyBody: 'This topic has fewer than 4 chunks. Try practice mode instead.',
    softEmptyCta: 'Go to practice',
  },
}

const FR: VocabularyCopy = {
  catalog: {
    title: 'La Bibliothèque',
    subtitle: 'Chunks français organisés par thème. Parcourez par partition ; ouvrez un thème pour filtrer par niveau, examen ou registre.',
    filterLabel: 'Filtrer par partition',
    filterAllOff: 'Toutes les partitions',
  },
  partition: {
    CC_corpus: 'Corpus CC',
    chadi_authored: 'Auteur',
    book_lab: 'Atelier livres',
  },
  topic: {
    chunkCountLabel: (n) => `${n} chunk${n === 1 ? '' : 's'}`,
    examTagsLabel: "Tags d'examen",
    cefrRangeLabel: (min, max) => (min === max ? min : `${min}–${max}`),
    sourcePrefix: 'Source : ',
  },
  empty: {
    corpusTitle: 'La Bibliothèque arrive.',
    corpusBody: 'Le corpus est en préparation. Les premiers ensembles thématiques apparaîtront ici dès que le contenu sera prêt.',
    topicFilteredTitle: 'Aucun chunk ne correspond à ces filtres.',
    topicFilteredBody: "Essayez d'élargir la plage CEFR ou de retirer un tag d'examen.",
  },
  locked: {
    title: 'Le corpus tagué examen est réservé aux offres payantes.',
    body: 'Passez à un plan supérieur pour accéder aux ensembles TCF / DELF / TEF.',
    cta: 'Voir les offres',
  },
  filters: {
    cefrLevel: 'Niveau CEFR',
    examTag: "Tag d'examen",
    register: 'Registre',
    none: 'Sans tag',
  },
  detail: {
    backToCatalog: 'Retour aux thèmes',
    loadMore: 'Charger plus',
    loadingMore: 'Chargement…',
    showFr: 'FR',
    showEn: 'EN',
  },
  error: {
    title: 'Impossible de charger.',
    body: 'Vérifiez votre connexion et réessayez.',
    retry: 'Réessayer',
  },
  practice: {
    startCta: 'Commencer la pratique',
    configTitle: 'Pratiquer ce thème',
    configSubtitle: 'Choisissez une direction et une durée de session. Les chunks sont mélangés à chaque session.',
    directionLabel: 'Direction',
    directionFrLabel: 'Afficher FR · dévoiler EN',
    directionEnLabel: 'Afficher EN · dévoiler FR',
    sessionLengthLabel: 'Durée de session',
    sessionLengthAll: 'Tous les chunks du thème',
    startSession: 'Lancer la session',
    progressLabel: (i, n) => `Carte ${i} sur ${n}`,
    reveal: 'Dévoiler',
    gotIt: 'Acquis',
    needReview: 'À revoir',
    endTitle: 'Session terminée.',
    endStat: (got, total) =>
      `${got} sur ${total} — ${total === 0 ? 0 : Math.round((got / total) * 100)} %`,
    endNeedReview: (n) =>
      `${n} chunk${n === 1 ? '' : 's'} à revoir`,
    practiceAgain: 'Pratiquer encore',
    backToTopic: 'Retour au thème',
    browseCorpus: 'Parcourir le corpus',
    emptyTitle: 'Rien à pratiquer pour le moment.',
    emptyBody: 'Ce thème ne contient aucun chunk. Revenez quand le corpus sera prêt.',
    tierLockedTitle: 'Ce thème est tagué examen.',
    devLockBadge: 'DEV : verrou de palier simulé',
  },
  test: {
    startCta: 'Commencer le test',
    configTitle: 'Tester ce thème',
    configSubtitle: "Choisissez un type d'exercice, une direction et une durée de session.",
    exerciseTypeLabel: "Type d'exercice",
    typeMcq: 'Choix multiple',
    typeDropdown: 'Liste déroulante',
    typeExact: 'Complétion exacte',
    typeMatching: 'Appariement',
    startSession: 'Lancer la session',
    progressLabel: (i, n) => `Question ${i} sur ${n}`,
    mcqPrompt: 'Choisissez la traduction',
    dropdownPrompt: 'Complétez la traduction',
    exactPrompt: 'Saisissez la traduction',
    matchingPrompt: 'Associez chaque chunk à sa traduction',
    submit: 'Valider',
    next: 'Suivant',
    feedbackCorrect: 'Correct.',
    feedbackWrong: (correct) => `Pas tout à fait — la réponse était « ${correct} ».`,
    endTitle: 'Test terminé.',
    endStat: (got, total) =>
      `${got} sur ${total} — ${total === 0 ? 0 : Math.round((got / total) * 100)} %`,
    testAgain: 'Tester encore',
    softEmptyTitle: 'Pas assez de chunks pour un test.',
    softEmptyBody: 'Ce thème compte moins de 4 chunks. Essayez plutôt le mode pratique.',
    softEmptyCta: 'Aller à la pratique',
  },
}

export function vocabCopy(lang: UiLanguage | string | null | undefined): VocabularyCopy {
  return lang === 'fr' ? FR : EN
}
