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
}

const EN: VocabularyCopy = {
  catalog: {
    title: 'Le Vocabulaire',
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
    corpusTitle: 'Le Vocabulaire is coming.',
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
}

const FR: VocabularyCopy = {
  catalog: {
    title: 'Le Vocabulaire',
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
    corpusTitle: 'Le Vocabulaire arrive.',
    corpusBody: 'Le corpus est en préparation. Les premiers ensembles thématiques apparaîtront ici dès que le contenu sera prêt.',
    topicFilteredTitle: 'Aucun chunk ne correspond à ces filtres.',
    topicFilteredBody: 'Essayez d’élargir la plage CEFR ou de retirer un tag d’examen.',
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
}

export function vocabCopy(lang: UiLanguage | string | null | undefined): VocabularyCopy {
  return lang === 'fr' ? FR : EN
}
