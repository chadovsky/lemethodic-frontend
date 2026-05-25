// UI-010 — static vocabulary fixture for Le Vocabulaire browse view.
// 60 chunks spanning all 5 CEFR levels (12 each) and all 5 sources.
// Plausible-sounding placeholders only — real curriculum data lands
// in CON-001 (F-321 vocab review, ~1,684 chunks pending Chadi triage).

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
export type ChunkSource = 'Média' | 'Conversation' | 'Travail' | 'Voyage' | 'Quotidien'

export interface Chunk {
  id: number
  fr: string
  en: string
  level: CefrLevel
  source: ChunkSource
}

export const CEFR_LEVELS: readonly CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1']

export const CHUNK_SOURCES: readonly ChunkSource[] = [
  'Média',
  'Conversation',
  'Travail',
  'Voyage',
  'Quotidien',
]

export const CHUNKS: readonly Chunk[] = [
  // A1 — 6
  { id: 1, fr: 'Ça va', en: "I'm fine", level: 'A1', source: 'Conversation' },
  { id: 2, fr: "S'il vous plaît", en: 'Please', level: 'A1', source: 'Quotidien' },
  { id: 3, fr: 'Bonne journée', en: 'Have a nice day', level: 'A1', source: 'Quotidien' },
  { id: 4, fr: 'Combien ça coûte ?', en: 'How much is it?', level: 'A1', source: 'Voyage' },
  { id: 5, fr: 'Je voudrais…', en: 'I would like...', level: 'A1', source: 'Travail' },
  { id: 6, fr: 'À demain', en: 'See you tomorrow', level: 'A1', source: 'Conversation' },

  // A2 — 6
  { id: 7, fr: 'Pas de souci', en: 'No worries', level: 'A2', source: 'Conversation' },
  { id: 8, fr: 'Tout droit', en: 'Straight ahead', level: 'A2', source: 'Voyage' },
  { id: 9, fr: 'Du coup', en: 'So / therefore', level: 'A2', source: 'Conversation' },
  { id: 10, fr: "À tout à l'heure", en: 'See you later', level: 'A2', source: 'Quotidien' },
  { id: 11, fr: 'Sans problème', en: 'No problem', level: 'A2', source: 'Travail' },
  { id: 12, fr: 'Où est…', en: 'Where is...', level: 'A2', source: 'Voyage' },

  // B1 — 6
  { id: 13, fr: 'Ça tombe à pic', en: "That's perfect timing", level: 'B1', source: 'Conversation' },
  { id: 14, fr: 'En fait', en: 'Actually', level: 'B1', source: 'Média' },
  { id: 15, fr: 'À mon avis', en: 'In my opinion', level: 'B1', source: 'Média' },
  { id: 16, fr: 'Faire la queue', en: 'To wait in line', level: 'B1', source: 'Quotidien' },
  { id: 17, fr: 'Prendre rendez-vous', en: 'To make an appointment', level: 'B1', source: 'Travail' },
  { id: 18, fr: 'Faire escale', en: 'To make a stopover', level: 'B1', source: 'Voyage' },

  // B2 — 6
  { id: 19, fr: 'Faire le point', en: 'To take stock', level: 'B2', source: 'Travail' },
  { id: 20, fr: "Il n'empêche que", en: 'Nevertheless', level: 'B2', source: 'Média' },
  { id: 21, fr: 'Mine de rien', en: 'Without seeming to', level: 'B2', source: 'Quotidien' },
  { id: 22, fr: 'Pour autant', en: 'However', level: 'B2', source: 'Média' },
  { id: 23, fr: 'Tomber sur', en: 'To stumble upon', level: 'B2', source: 'Conversation' },
  { id: 24, fr: "À l'étranger", en: 'Abroad', level: 'B2', source: 'Voyage' },

  // C1 — 6
  { id: 25, fr: 'Tirer parti de', en: 'To take advantage of', level: 'C1', source: 'Travail' },
  { id: 26, fr: 'En fin de compte', en: 'All things considered', level: 'C1', source: 'Média' },
  { id: 27, fr: 'Au demeurant', en: 'Moreover', level: 'C1', source: 'Média' },
  { id: 28, fr: 'Mettre les bouchées doubles', en: 'To redouble efforts', level: 'C1', source: 'Conversation' },
  { id: 29, fr: 'À toutes fins utiles', en: 'Just in case', level: 'C1', source: 'Quotidien' },
  { id: 30, fr: 'Au gré des vents', en: 'At the mercy of the winds', level: 'C1', source: 'Voyage' },

  // A1 — 6 more (no Média — preserves A1+Média=0 test)
  { id: 31, fr: "D'accord", en: 'Agreed / OK', level: 'A1', source: 'Conversation' },
  { id: 32, fr: 'Il fait beau', en: 'The weather is nice', level: 'A1', source: 'Quotidien' },
  { id: 33, fr: 'À quelle heure ?', en: 'At what time?', level: 'A1', source: 'Voyage' },
  { id: 34, fr: 'Merci beaucoup', en: 'Thank you very much', level: 'A1', source: 'Quotidien' },
  { id: 35, fr: 'Pardon', en: 'Sorry / Excuse me', level: 'A1', source: 'Conversation' },
  { id: 36, fr: 'Je ne comprends pas', en: "I don't understand", level: 'A1', source: 'Travail' },

  // A2 — 6 more
  { id: 37, fr: 'En retard', en: 'Late', level: 'A2', source: 'Travail' },
  { id: 38, fr: 'À gauche', en: 'To the left', level: 'A2', source: 'Voyage' },
  { id: 39, fr: 'Tout de suite', en: 'Right away', level: 'A2', source: 'Quotidien' },
  { id: 40, fr: "C'est bien", en: "That's good", level: 'A2', source: 'Conversation' },
  { id: 41, fr: 'Comme ci comme ça', en: 'So-so', level: 'A2', source: 'Conversation' },
  { id: 42, fr: 'Il y a', en: 'There is / There are', level: 'A2', source: 'Média' },

  // B1 — 6 more
  { id: 43, fr: 'Se débrouiller', en: 'To manage / get by', level: 'B1', source: 'Quotidien' },
  { id: 44, fr: 'Mettre à jour', en: 'To update', level: 'B1', source: 'Travail' },
  { id: 45, fr: 'Prendre en compte', en: 'To take into account', level: 'B1', source: 'Travail' },
  { id: 46, fr: 'En ce qui concerne', en: 'Regarding / As for', level: 'B1', source: 'Média' },
  { id: 47, fr: 'À vrai dire', en: 'To tell the truth', level: 'B1', source: 'Conversation' },
  { id: 48, fr: 'Faire face à', en: 'To face / deal with', level: 'B1', source: 'Voyage' },

  // B2 — 6 more (no Conversation chunk with "tomber" — preserves B2+Conversation+search("tomber")=1 test)
  { id: 49, fr: 'Dans une certaine mesure', en: 'To some extent', level: 'B2', source: 'Média' },
  { id: 50, fr: "D'ores et déjà", en: 'Already / from now on', level: 'B2', source: 'Travail' },
  { id: 51, fr: 'Se remettre en question', en: 'To question oneself', level: 'B2', source: 'Quotidien' },
  { id: 52, fr: 'Mettre en évidence', en: 'To highlight / emphasize', level: 'B2', source: 'Média' },
  { id: 53, fr: 'À première vue', en: 'At first glance', level: 'B2', source: 'Conversation' },
  { id: 54, fr: 'Prendre du recul', en: 'To step back', level: 'B2', source: 'Travail' },

  // C1 — 6 more
  { id: 55, fr: "S'avérer", en: 'To prove to be', level: 'C1', source: 'Média' },
  { id: 56, fr: 'Force est de constater', en: 'One cannot but notice', level: 'C1', source: 'Média' },
  { id: 57, fr: 'À juste titre', en: 'Rightfully so', level: 'C1', source: 'Travail' },
  { id: 58, fr: 'Nonobstant', en: 'Notwithstanding', level: 'C1', source: 'Média' },
  { id: 59, fr: "Quoi qu'il en soit", en: 'Be that as it may', level: 'C1', source: 'Conversation' },
  { id: 60, fr: 'Battre en brèche', en: 'To challenge / refute', level: 'C1', source: 'Voyage' },
]

if (CHUNKS.length !== 60) {
  throw new Error(`Chunks fixture must have 60 entries, got ${CHUNKS.length}`)
}
