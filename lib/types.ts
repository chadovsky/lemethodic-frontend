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

// Return shape of api.sessions.createConversation (POST /conversations/start).
// T1 populates examiner fields with an opening turn; T2 returns them null
// because the candidate speaks first.
export interface ConversationStart {
  conversationId: string
  tacheMode: TacheMode
  conversationStatus: Conversation['status']
  examinerTurnText: string | null
  examinerTurnAudioUrl: string | null
  examinerTurnNumber: number | null
  maxCandidateTurnsHard: number | null
  maxCandidateTurnsHint: number | null
}

// Return shape of api.sessions.uploadConversationTurn (POST /conversations/{id}/turn).
// `autoEnded` flips when the backend-side hard cap is hit — for clients
// enforcing a tighter cap (F-062's 6-turn T2 loop) this stays false and the
// client calls finalizeConversation itself.
// `candidateTurnNumber` is needed by the F-062.3 Refaire cette prise flow —
// it's the id to pass to supersedeTurn() when the user rejects the
// transcript.
export interface ConversationTurnResult {
  candidateTranscript: string
  candidateTurnNumber: number
  examinerTurnText: string | null
  examinerTurnAudioUrl: string | null
  examinerTurnNumber: number | null
  conversationStatus: Conversation['status']
  recordingId: number | null
  autoEnded: boolean
  wrapUpHint: boolean
}

// Return shape of api.sessions.finalizeConversation (POST /conversations/{id}/end).
// underMinTurns flags T1 sessions ended before the minimum turn count — the
// UI can warn that results are directional.
export interface ConversationFinalizeResult {
  conversationStatus: Conversation['status']
  recordingId: number | null
  underMinTurns: boolean
}

// Return shape of api.sessions.supersedeTurn (POST /conversations/{id}/turn/{N}/supersede).
// F-062.3: the backend cascades to immediately-following examiner turns,
// so `cascadedExaminerTurnNumbers` surfaces which turn(s) were also marked
// superseded. Frontend typically ignores this — but it's useful for the
// debug path when the UI's chat log needs to be reconciled.
export interface ConversationSupersedeResult {
  supersededTurnId: number
  supersededTurnNumber: number
  supersededAt: string
  cascadedExaminerTurnNumbers: number[]
  status: 'superseded'
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

// ── F-080 Module library (remediation modules + per-session detections) ─────

export type ModuleCategory =
  | 'vocab_calque'
  | 'grammar_interference'
  | 'discourse_structure'
  | 'pronunciation'
  | 'register_mismatch'
  | 'word_order'
  | 'verb_aspect'
  | 'other'

export type ContentRefType = 'inline_markdown' | 'document' | 'audio' | 'external_link'

// One example pair from a module's `examples` array. Fields per the F-080a
// pydantic schema; FR + EN explanations are always populated, ES deferred.
export interface ModuleExampleEntry {
  context: string
  wrong_utterance: string
  corrected_utterance: string
  explanation_fr: string
  explanation_en: string
}

// One content_ref. Conditional fields per `type`:
//   inline_markdown → content_fr/content_en populated
//   document        → locator + description populated
//   audio           → url + duration_seconds (+ optional description)
//   external_link   → url + description
export interface ModuleContentRef {
  type: ContentRefType
  display_order: number
  content_fr?: string | null
  content_en?: string | null
  locator?: string | null
  description?: string | null
  url?: string | null
  duration_seconds?: number | null
}

export interface ModuleDetectionCriteria {
  keywords_wrong: string[]
  grammatical_signals: string[]
  contextual_triggers: string[]
}

// Hydrated remediation module — matches the backend pydantic schema field
// names verbatim (snake_case) since the GET /detected-modules endpoint
// returns the pydantic dump shape directly. We don't run a camelCase
// mapper on this surface; the F-080c diagnostic components index by the
// authored field names. This is a deliberate divergence from the
// User/Recording mappers — those bridge frontend-store-shape to backend
// shape, whereas modules are read-only authored content that flows
// through unchanged.
export interface RemediationModule {
  id: string
  name_fr: string
  name_en: string
  category: ModuleCategory
  severity: number
  active: boolean
  L1_interference_description_fr: string
  L1_interference_description_en: string
  detection_criteria: ModuleDetectionCriteria
  examples: ModuleExampleEntry[]
  content_refs: ModuleContentRef[]
  drill_ids: number[]
  prerequisite_module_ids: string[]
  raccourci_lesson_id: number | null
}

// One row from session_detected_modules joined with the module id. The
// confidence_score is informational/debug-only — the diagnostic page
// MUST NOT surface it to the user (F-080c locked UX decision).
export interface SessionDetection {
  module_id: string
  confidence_score: number | null
  supporting_quote: string | null
  is_primary: boolean
}

export interface DetectedModulesResponse {
  primary_module: RemediationModule | null
  secondary_modules: RemediationModule[]
  detections: SessionDetection[]
}

// ── API error ────────────────────────────────────────────────────────────────

export interface ApiErrorShape {
  status: number
  message: string
  body: unknown
}
