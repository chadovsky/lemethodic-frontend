// Journey data model + static fixture (F-456).
//
// Single source of truth for the voyage structure that the carte (/carte), the
// ile page (/ile/[theme]), and the seance render from. Phase 2 is static: the
// fixture below is hand-assembled. The types are shaped so the Phase 3 BE
// (island_activities + target_profiles) can populate the same structure later
// WITHOUT reshaping it. Field names map cleanly onto the planned BE tables:
//   Ile.practice[]  -> island_activities rows (one per ActivityType)
//   Journey.level + grammarPhase -> target_profiles (per-level grammar plan)
// Until that wiring lands, statuses on unauthored content read 'bientot'.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

// The 7 stable TCF themes. Ids are stable keys (BE join keys, route segments);
// labels are FR display names. Education first per the curriculum sequencing.
export type ThemeId =
  | 'education'
  | 'famille'
  | 'culture'
  | 'sante'
  | 'technologie'
  | 'environnement'
  | 'economie'

export interface Theme {
  id: ThemeId
  label: string
}

// Practice activity kinds. One activity per kind sits inside each ile's
// practice beat.
export type ActivityType =
  | 'traduction'
  | 'grammaire'
  | 'expression_ecrite'
  | 'expression_orale'
  | 'comprehension_orale'

// The 3-beat skeleton every ile follows.
export type Beat = 'learn' | 'practice' | 'check'

// Progression state. 'bientot' marks content that is not yet authored/wired.
export type Status = 'locked' | 'current' | 'completed' | 'bientot'

export interface GrammarTopic {
  id: string
  label: string
  level: Level
  // True when the point targets a known anglophone L1-interference pattern
  // (the Reflexes Anglais couche). Drives later prioritisation.
  interference: boolean
}

export interface Activity {
  id: string
  type: ActivityType
  label: string
  status: Status
}

// A scored checkpoint. Reused for the per-ile mini mock and the journey final.
export interface Mock {
  id: string
  label: string
  status: Status
}

export interface LearnBeat {
  vocab: string[]
  // GrammarTopic ids drawn from the journey's grammarPhase.
  grammarPoints: string[]
  leMaitreVideoId: string | null
}

export interface CheckBeat {
  miniMock: Mock
}

export interface Ile {
  theme: ThemeId
  level: Level
  learn: LearnBeat
  practice: Activity[]
  check: CheckBeat
  status: Status
}

export interface Journey {
  level: Level
  grammarPhase: GrammarTopic[]
  // Always 7, education first, in THEME order.
  iles: Ile[]
  finalMock: Mock
}

// ---------------------------------------------------------------------------
// Static reference data
// ---------------------------------------------------------------------------

// 7 themes, education first. Order is the canonical ile order on the carte.
export const THEMES: Theme[] = [
  { id: 'education', label: "L'éducation" },
  { id: 'famille', label: 'La famille' },
  { id: 'culture', label: 'La culture' },
  { id: 'sante', label: 'La santé' },
  { id: 'technologie', label: 'La technologie' },
  { id: 'environnement', label: "L'environnement" },
  { id: 'economie', label: "L'économie" },
]

// Ordered practice activity kinds + their FR labels. One per ile practice beat.
export const ACTIVITY_TYPES: ActivityType[] = [
  'traduction',
  'grammaire',
  'expression_ecrite',
  'expression_orale',
  'comprehension_orale',
]

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  traduction: 'Traduction',
  grammaire: 'Grammaire',
  expression_ecrite: 'Expression écrite',
  expression_orale: 'Expression orale',
  comprehension_orale: 'Compréhension orale',
}

// B1 grammar phase: the 13 clusters from curriculum/clusters/*. interference
// flags the points the curriculum calls out as anglophone-difficult.
const GRAMMAR_B1: GrammarTopic[] = [
  { id: 'imparfait-vs-passe-compose', label: 'Imparfait vs Passé Composé', level: 'B1', interference: true },
  { id: 'plus-que-parfait', label: 'Le Plus-que-parfait', level: 'B1', interference: false },
  { id: 'futur-simple-anterieur', label: 'Futur simple et Futur antérieur', level: 'B1', interference: false },
  { id: 'conditionnel-present', label: 'Conditionnel présent', level: 'B1', interference: false },
  { id: 'pronoms-cod', label: 'Pronoms COD', level: 'B1', interference: true },
  { id: 'pronoms-coi', label: 'Pronoms COI', level: 'B1', interference: true },
  { id: 'pronoms-y-en', label: 'Pronoms Y et EN', level: 'B1', interference: true },
  { id: 'doubles-pronoms', label: 'Doubles pronoms', level: 'B1', interference: true },
  { id: 'pronoms-toniques', label: 'Pronoms toniques', level: 'B1', interference: true },
  { id: 'pronoms-relatifs-simples', label: 'Pronoms relatifs simples', level: 'B1', interference: true },
  { id: 'connecteurs-intermediaires', label: 'Connecteurs intermédiaires', level: 'B1', interference: false },
  { id: 'discours-indirect-present', label: 'Discours indirect au présent', level: 'B1', interference: false },
  { id: 'expression-de-la-cause', label: 'Expression de la cause', level: 'B1', interference: false },
]

// Per-level grammar plan. Only B1 is authored in Phase 2; other levels return
// an empty phase until their curriculum lands. Keyed for clean lookup.
const GRAMMAR_BY_LEVEL: Partial<Record<Level, GrammarTopic[]>> = {
  B1: GRAMMAR_B1,
}

// Per-theme learn-beat seed for the authored B1 journey: placeholder vocab
// (real TCF B1 lemmas) + the grammar ids this ile foregrounds. grammarPoints
// reference GRAMMAR_B1 ids, so the ile ties back into the journey grammarPhase.
const B1_ILE_SEED: Record<ThemeId, { vocab: string[]; grammarPoints: string[] }> = {
  education: {
    vocab: ['la scolarité', 'le diplôme', 'la formation', "l'apprentissage", 'le redoublement'],
    grammarPoints: ['imparfait-vs-passe-compose', 'pronoms-relatifs-simples'],
  },
  famille: {
    vocab: ['le foyer', 'la fratrie', "l'éducation des enfants", 'le quotidien', 'les proches'],
    grammarPoints: ['imparfait-vs-passe-compose', 'pronoms-cod'],
  },
  culture: {
    vocab: ['le patrimoine', 'une exposition', 'la francophonie', 'un spectacle', 'les traditions'],
    grammarPoints: ['pronoms-y-en', 'connecteurs-intermediaires'],
  },
  sante: {
    vocab: ['le bien-être', 'la prévention', 'une ordonnance', 'le système de santé', "l'alimentation"],
    grammarPoints: ['conditionnel-present', 'expression-de-la-cause'],
  },
  technologie: {
    vocab: ['le numérique', 'les réseaux sociaux', 'une application', 'la vie privée', "l'intelligence artificielle"],
    grammarPoints: ['futur-simple-anterieur', 'pronoms-coi'],
  },
  environnement: {
    vocab: ['le réchauffement climatique', 'le tri sélectif', 'les énergies renouvelables', 'la biodiversité', 'le gaspillage'],
    grammarPoints: ['expression-de-la-cause', 'connecteurs-intermediaires'],
  },
  economie: {
    vocab: ["l'emploi", "le pouvoir d'achat", 'le télétravail', 'un entretien', 'le marché du travail'],
    grammarPoints: ['conditionnel-present', 'discours-indirect-present'],
  },
}

// ---------------------------------------------------------------------------
// Assembler
// ---------------------------------------------------------------------------

// One practice activity per ActivityType, all 'bientot' (placeholders).
function buildPractice(theme: ThemeId, level: Level): Activity[] {
  return ACTIVITY_TYPES.map((type) => ({
    id: `${theme}-${level}-${type}`,
    type,
    label: ACTIVITY_LABELS[type],
    status: 'bientot',
  }))
}

// Ile status for the sample B1 journey: first ile is the entry point
// ('current'), the rest are 'locked' behind it. Levels without an authored
// curriculum read 'bientot' (no content yet).
function ileStatus(level: Level, index: number): Status {
  if (level !== 'B1') return 'bientot'
  return index === 0 ? 'current' : 'locked'
}

function buildIle(theme: ThemeId, level: Level, index: number): Ile {
  const seed = level === 'B1' ? B1_ILE_SEED[theme] : null
  return {
    theme,
    level,
    learn: {
      vocab: seed?.vocab ?? [],
      grammarPoints: seed?.grammarPoints ?? [],
      leMaitreVideoId: null,
    },
    practice: buildPractice(theme, level),
    check: {
      miniMock: {
        id: `${theme}-${level}-mini-mock`,
        label: 'Mini-examen',
        status: 'bientot',
      },
    },
    status: ileStatus(level, index),
  }
}

// Thin assembler: returns the grammar phase + the 7 iles (education first) for
// a level. This is the single entry point the carte / ile / seance call.
export function getJourney(level: Level): Journey {
  return {
    level,
    grammarPhase: GRAMMAR_BY_LEVEL[level] ?? [],
    iles: THEMES.map((theme, index) => buildIle(theme.id, level, index)),
    finalMock: {
      id: `${level}-final-mock`,
      label: 'Examen final',
      status: 'bientot',
    },
  }
}

// The assembled sample journey at B1. Named export for fixture consumers.
export const SAMPLE_JOURNEY: Journey = getJourney('B1')
