// Shared types for the FluentPath frontend. Where the backend (tcf-oral-tool
// FastAPI) exposes a richer shape than the UI needs, this file keeps the
// frontend-facing view; the mapper lives in lib/api.ts.

// ── Onboarding ────────────────────────────────────────────────────────────────

export type UiLanguage = 'en' | 'es'
export type TCFGoal = 'immigration' | 'studies' | 'general'
export type CurrentLevel = 'A1_A2' | 'A2_B1' | 'B1_B2' | 'B2_plus'

// Mirrors OnboardingState in components/onboarding/OnboardingFlow.tsx but typed
// as required fields. Used as the payload to POST /api/users/onboarding.
export interface OnboardingData {
  uiLanguage: UiLanguage
  goal: TCFGoal
  currentLevel: CurrentLevel
  targetScore: string
  examDate:
    | { type: 'quick'; label: string }
    | { type: 'date'; value: string }
}

// ── User ─────────────────────────────────────────────────────────────────────

// Backend GET /api/auth/me (and /api/users/onboarding) returns the basic
// identity plus six onboarding fields once completed. Fields are optional so
// that login/register responses — which only return {id, email, full_name} —
// still fit this shape; HomeScreen calls getMe() to refresh the richer view.
//
// Note on shapes: the backend stores onboarding data after the mapper in
// lib/api.ts has already flattened the tagged-union exam_date to an ISO
// string, so here exam_date is always either a "YYYY-MM-DD" string or null.
// The tagged-union lives in OnboardingData above, which describes what the
// frontend collects before sending.
export interface User {
  id: number
  email: string
  fullName: string | null
  isAdmin: boolean
  targetLevel?: string | null
  examProfile?: string | null
  examDate?: string | null
  goal?: string | null
  currentLevel?: string | null
  interfaceLanguage?: string | null
}

// ── Lessons (Le Raccourci) ───────────────────────────────────────────────────

export type LessonStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed'

export interface Lesson {
  id: number
  lessonNumber: number
  code: string
  title: string
  shortDescription: string
  detailedContent?: string
  status: LessonStatus
  quizAttempts: number
  quizBestScore: number | null
  completedAt: string | null
  estimatedDurationMinutes?: number
  prerequisiteLessonNumber?: number | null
}

export type QuizQuestionType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'translate_en_fr'
  | 'translate_fr_en'
  | 'correct_the_sentence'

export interface QuizQuestion {
  id: number
  questionNumber: number
  questionType: QuizQuestionType
  question: string
  options?: string[]
}

export interface LessonDetail {
  lesson: Lesson
  quiz: {
    questions: QuizQuestion[]
    passThreshold: number
  }
}

export interface QuizAnswer {
  questionNumber: number
  answer: string
}

export interface QuizResult {
  score: number // 0-100
  correctCount: number
  total: number
  passed: boolean
  passThreshold: number
  feedback: Array<{
    questionNumber: number
    correct: boolean
    correctAnswer?: string
    explanation?: string
  }>
  status: LessonStatus
  nextUnlocked?: number
}

// ── Sessions ─────────────────────────────────────────────────────────────────
// "Session" is the frontend's umbrella for both backend concepts:
//   - Tâche 1/2 → Conversation (multi-turn)
//   - Tâche 3 → Recording (one-shot monologue)
// IDs for conversations are UUIDs; IDs for recordings are ints.

export type TacheMode = 'tache_1' | 'tache_2' | 'tache_3'

export interface ConversationTurn {
  id: number
  turnNumber: number
  speaker: 'examiner' | 'candidate'
  text: string
  audioUrl: string | null
  wordCount: number | null
}

export interface Conversation {
  conversationId: string
  tacheMode: TacheMode
  targetLevel: string
  status: 'in_progress' | 'completed' | 'abandoned'
  recordingId: number | null
  turns: ConversationTurn[]
  startedAt: string
  completedAt: string | null
}

export interface Recording {
  id: number
  tacheMode: TacheMode | 'writing' | 'legacy'
  topicId: number | null
  targetLevel: string
  transcript: string | null
  correctedTranscript: string | null
  wordCount: number | null
  durationSeconds: number | null
  status: 'pending' | 'transcribing' | 'analyzing' | 'done' | 'error'
  createdAt: string
}

// ── Diagnostic (frontend-facing view over Feedback.feedback_grid) ────────────

export type CoucheKey = 'le_fond' | 'les_moules_des_idees' | 'les_moules' | 'les_reflexes_anglais' | 'prononciation'

export interface Couche {
  key: CoucheKey
  label: string
  score: number // 0-10 typically
  analyse: string | null
}

export interface Goulet {
  couche: CoucheKey
  nom: string
  explication: string
}

export interface OrdonnanceStep {
  priority: number
  action: string
  pattern?: string
  example?: string
}

export interface Diagnostic {
  recordingId: number
  noteGlobale: number
  couches: Couche[]
  goulet: Goulet
  ceQuiMarche: string | null
  ordonnance: OrdonnanceStep[]
  cefrLevel: string | null
  clbLevel: string | null
}

// ── Moules (Tâche 2 breakdown: Pyramide / Rebond / Ciblage) ──────────────────

export type MouleKey = 'pyramide' | 'rebond' | 'ciblage'

export interface Moule {
  key: MouleKey
  label: string
  score: number
  detected: boolean
  examples: string[]
  notes: string | null
}

export interface MoulesBreakdown {
  recordingId: number
  moules: Moule[]
}

// ── API error ────────────────────────────────────────────────────────────────

export interface ApiErrorShape {
  status: number
  message: string
  body: unknown
}
