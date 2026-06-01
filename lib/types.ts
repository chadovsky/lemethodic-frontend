// Shared types for the Le Méthodic frontend. Where the backend (tcf-oral-tool
// FastAPI) exposes a richer shape than the UI needs, this file keeps the
// frontend-facing view; the mapper lives in lib/api.ts.

// ── Onboarding ────────────────────────────────────────────────────────────────

// P-220 — UI language is en or fr. The legacy 'es' option was a pre-pivot
// relic; the BE only serves en/fr copy and the new POST /onboarding/submit
// only accepts these two values for interface_language.
export type UiLanguage = 'en' | 'fr'

// One answer in the questionnaire. Single-selects produce a string (the
// option's `value`), multi-selects produce string[] (option values),
// date_input produces "YYYY-MM-DD" or null for the no-exam case, and the
// q9 freetext follow-up produces a string.
export type OnboardingAnswer = string | string[] | null

// Map of question_id → answer. The BE drives the question set; the FE just
// stores whatever values come back from the user. mapStoreToSubmitPayload
// (lib/api.ts) reshapes this into the OnboardingSubmitRequest the BE expects.
export type OnboardingData = Record<string, OnboardingAnswer>

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
  // F-310 Phase B — BE returns email_verified boolean from serialize_user().
  // undefined when the response comes from a stripped login/register shape
  // that doesn't include the field; false triggers the verification banner.
  emailVerified?: boolean
}

// ── Lessons (L'École) ───────────────────────────────────────────────────

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
  // F-087 — phase 1 (Fondations, lessons 1-16) vs phase 2
  // (Approfondissement, 17-27). Drives the visual separator on the home
  // tab and /ecole list page. Defaults to 1 in the mapper if backend
  // omits the field.
  phase: 1 | 2
  // F-087 (rendered by F-089) — deadpan English subline shown beneath
  // the title on lesson cards. Always populated for the seeded 27;
  // optional here only because the mapper hands through whatever the
  // backend sends.
  sublineEn?: string | null
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

// F-110 — list-endpoint summary shape per recording. Trimmed of the heavy
// transcript/audio fields and extended with cefrLevel + couche scores so
// the P-100 dashboard can compute rolling averages without N round-trips
// via getDiagnostic(id). Ordered by createdAt DESC server-side.
export interface RecordingSummary {
  id: number
  tacheMode: TacheMode
  createdAt: string
  cefrLevel: string | null
  clbLevel: string | null
  couches: Couche[]
}

// ── Diagnostic (frontend-facing view over Feedback.feedback_grid) ────────────

// F-088 — internal pedagogical keys (backend dimensions, scoring, and
// the LLM analysis contract still use these). The TCF display labels
// come from the backend per couche on each request — see
// `displayLabelEn` / `displayLabelFr` below.
//
// Prononciation was historically a 5th defensive key; the F-088
// `couches` response only carries the 4 official TCF criteria, so the
// type was narrowed to match.
export type CoucheKey = 'le_fond' | 'les_moules_des_idees' | 'les_moules' | 'les_reflexes_anglais' | 'la_voix'

export interface Couche {
  key: CoucheKey
  // F-088 — display labels authored on the backend
  // (`app/services/couche_labels.py`). Frontend picks one based on
  // `useInterfaceLanguage()`. EN/FR are intentionally identical today
  // (TCF uses the same French words across language tracks); both
  // fields exist anyway so a future market-specific divergence
  // doesn't need a schema change.
  displayLabelEn: string
  displayLabelFr: string
  score: number // 0-10 typically
  analyse: string | null
}

export interface Goulet {
  couche: CoucheKey
  // F-088 — display labels for the bottleneck callout. EN/FR are
  // identical today (TCF uses the same French words) but kept split
  // for symmetry with Couche.displayLabel*.
  nom: string   // EN (= "Aisance", "Étendue", …)
  nomFr: string // FR (= same as `nom` today; here for forward compat)
  explication: string
}

export interface OrdonnanceStep {
  priority: number
  action: string
  pattern?: string
  example?: string
}

// F-083 — per-Tâche pedagogical rubric. Distinct from F-088's couches
// (those are TCF-evaluation criteria scored on the legacy /5 scale);
// the rubric here is the F-083 deadpan-tutor-voice layer.
export interface TacheRubricDimension {
  key: string
  score: number   // 0-5
  prose: string
}

export interface UniversalSidebar {
  score: number   // 0-5
  examples: string[]
}

export interface RetryRecommendation {
  shouldRetry: boolean
  reason: string
}

export interface TacheRubric {
  tacheMode: 'tache_1' | 'tache_2' | 'tache_3'
  summaryProse: string
  dimensions: TacheRubricDimension[]
  universalSidebars: {
    conjugation: UniversalSidebar
    grammar_structure: UniversalSidebar
    sentence_construction: UniversalSidebar
  }
  retryRecommendation: RetryRecommendation
  nextActionSuggestion: string
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
  // F-084 — single-sentence diagnostic hero ("B1+, headed to B2.
  // Connectors are holding you back."). null for legacy recordings
  // and rubric fallbacks; frontend falls back to a CEFR-band default.
  narrativeSummary: string | null
  // F-083/F-084 — per-Tâche pedagogical rubric block. null for
  // legacy recordings.
  tacheRubric: TacheRubric | null
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
  ecole_lesson_id: number | null
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

// F-080d — per-user detection history attached to a single module by the
// augmented GET /api/modules/{module_id}. Null when the request is
// unauthenticated OR the user has zero detections of this module
// ("cold state" — page still renders as a glossary entry).
export interface ModuleUserContext {
  recurrence_count: number
  first_detected_at: string
  last_detected_at: string
  detected_in_recordings: number[]
}

// Module + per-user context. Returned by GET /api/modules/{id}; consumed
// by the /learn/[module_id] page.
export interface ModuleWithContext extends RemediationModule {
  user_context: ModuleUserContext | null
}

// Compact entry returned by GET /api/users/me/recurring_modules. Subset
// of the full module — only the fields the home-tab "Recommended for
// you" card needs to render. Authoritative content (description,
// examples, content_refs) lives in the full module fetched on /learn/[id].
export interface RecurringModule {
  module_id: string
  name_en: string
  name_fr: string
  category: ModuleCategory
  severity: number
  ecole_lesson_id: number | null
  recurrence_count: number
  first_detected_at: string
  last_detected_at: string
  recording_ids: number[]
}

export interface RecurringModulesResponse {
  recurring_modules: RecurringModule[]
}

// ── P-230 dashboard endpoints ────────────────────────────────────────────────
// Snake_case mirrors the BE pydantic schemas verbatim. These responses flow
// through the dashboard sections without a camelCase mapper, matching how
// other read-only authored content (modules, recurring_modules) is handled.

// SelfReportedBlock — what the user told us during onboarding (from q1).
export interface SelfReportedBlock {
  level: 'a2' | 'b1' | 'b2' | 'c1' | 'not_sure' | null
  confidence: 'high' | 'medium' | 'low' | null
}

// AssignedBlock — system-derived assessment from P-201. `total_clusters_in_path`
// is BE-frozen at assessment time (Phase 1 returns 13). Use directly as the
// coverage denominator — no derivation needed.
export interface AssignedBlock {
  level: 'below_B1' | 'B1_emerging' | 'B1_solid' | 'above_B1' | 'insufficient_data'
  confidence: 'high' | 'medium' | 'low'
  coverage: number              // 0..1
  n_clusters_evaluated: number
  total_clusters_in_path: number
  computed_at: string           // ISO datetime
}

export interface LevelResponse {
  self_reported: SelfReportedBlock
  assigned: AssignedBlock | null
  agreement: 'matches' | 'discrepancy' | 'self_only' | 'assigned_only' | 'neither'
}

// TacheCoverage — per-Tâche "has the user recorded at least one of these?"
// flag. Drives the diagnostic-in-progress chip + next_recommended_tache CTA.
export interface TacheCoverage {
  tache_1: boolean
  tache_2: boolean
  tache_3: boolean
}

export interface DiagnosticStateResponse {
  stage: 'in_progress' | 'complete' | 'no_path'
  recordings_done: number
  tache_coverage: TacheCoverage
  next_recommended_tache: 1 | 2 | 3 | null
  latest_assessment_id: number | null
}

// ActionBlock — the recommendation itself. `kind` drives the high-level
// branch (cluster_practice / free_practice / path_complete / no_path);
// `reason_code` further qualifies for fallback Dialogue Box copy authoring.
export interface ActionBlock {
  kind: 'cluster_practice' | 'free_practice' | 'path_complete' | 'no_path'
  cluster_id: number | null
  cluster_slug: string | null
  tache_application: 'tache_1' | 'tache_2' | 'tache_3' | null
  practice_prompt: Record<string, unknown> | null
  reason_code:
    | 'regression'
    | 'needs_revisit'
    | 'in_progress'
    | 'next_in_path'
    | 'free_practice'
    | 'no_path'
}

export interface ContextBlock {
  current_phase_id: number | null
  current_phase_position: number | null
  clusters_remaining_in_path: number
  last_recording_at: string | null
}

export interface TodayActionResponse {
  action: ActionBlock
  context: ContextBlock
  // dialogue_box is BE-side authored Block 5 tutor copy. Always null in
  // production today (P-240b + P-213 not shipped). FE renders it when
  // present (assumed shape: { text: string }) and falls back to
  // reason_code-driven copy otherwise.
  dialogue_box: Record<string, unknown> | null
}

// ── P-234 cluster detail ────────────────────────────────────────────────────
// `labels` on cluster + theme is a `{[lang_code]: string}` map (en/fr at
// minimum). FE picks the user's interfaceLanguage entry, falls back to 'en',
// then to first-available. `detection_rubric` is deliberately absent from
// the BE response (internal scoring infrastructure). `practice_prompt` and
// `exercise_set` are JSONB pass-throughs whose authored shape is owned by
// the cluster authoring rubric (P-211 / P-211a) — kept loose here.

export interface VocabularyThemeRef {
  slug: string
  labels: Record<string, string>
}

export interface ClusterLesson {
  format: 'markdown' | 'pdf' | 'video'
  // Exactly one of `markdown` / `asset_url` carries content per the BE
  // lesson_format invariant. `markdown` is FR-only Phase 1.
  markdown: string
  asset_url: string
}

export interface ClusterDetailResponse {
  id: number
  slug: string
  labels: Record<string, string>
  grammar_topic: string
  vocabulary_theme: VocabularyThemeRef | null
  tache_application: 'tache_1' | 'tache_2' | 'tache_3'
  cefr_level: string
  lesson: ClusterLesson
  practice_prompt: Record<string, unknown>
  exercise_set: unknown[]
}

// One detection event in the user's recording history for a cluster.
// `detection_result` is per-recording (not per-cluster — that's `status`
// on the parent state response).
export interface RecordingHistoryEntry {
  recording_id: number
  created_at: string
  detection_result: 'clean' | 'wobble' | 'fail' | 'not_observed'
  rubric_score: number | null    // 0..1 when scored
}

export interface UserClusterStateResponse {
  cluster_slug: string
  // Cluster lifecycle. `not_started` is the default applied when no
  // UserClusterStatus row exists for this user (graceful "not started"
  // UX, not 404).
  status: 'not_started' | 'in_progress' | 'absorbed' | 'needs_revisit'
  last_rubric_score: number | null
  last_detection_result: 'clean' | 'wobble' | 'fail' | 'not_observed' | null
  revisit_count: number
  first_started_at: string | null
  last_status_change_at: string | null
  absorbed_at: string | null
  // Last 10 newest-first (BE-side limit).
  recording_history: RecordingHistoryEntry[]
}

// ── API error ────────────────────────────────────────────────────────────────

export interface ApiErrorShape {
  status: number
  message: string
  body: unknown
}

// ── Writing (V-013a / F-224) ─────────────────────────────────────────────────

// GET /api/writing/prompts row shape. tache_level is 1|2|3 per TCF mapping;
// level is CEFR ('B1' | 'B2'). prompt_text + prompt_type are legacy fields
// preserved for backward compat but ignored by the V-013a UI (we read
// prompt_fr / prompt_en + the structured metadata).
export interface WritingPrompt {
  id: number
  tache_level: 1 | 2 | 3
  level: 'B1' | 'B2'
  title_fr: string
  prompt_fr: string
  prompt_en: string
  min_words: number
  max_words: number
  time_limit_min: number
  topic_tag: string
  // Legacy fields (kept for shape parity with BE, not surfaced in UI):
  prompt_text?: string
  prompt_type?: string
}

// POST /api/writing/submit (via job result) response shape. V-016a.fix —
// `couches` is the BE-canonical Couche[] array (matches diagnostic
// recordings, lib/types.ts:227 — BE has been array-shaped throughout
// V-009/V-010). Original V-013a declaration as a record-by-key was
// the outlier and caused the prod crash when the array shape arrived.
//
// Each Couche carries `analyse` as the per-layer feedback string. La Voix
// may or may not appear in the array depending on V-009.be progress.
//
// Optional fields preserved as `?` so a partially-populated job result
// still renders without crashing — the consumer is expected to fall back
// to "Analysis pending" or skip the section per-couche.
export interface WritingCoucheFeedback {
  key: CoucheKey
  score: number
  // Per-couche feedback. BE may emit it under either `analyse` (matches
  // diagnostic Couche convention) or `feedback` (writing-specific).
  // Consumers should read both and fall back gracefully.
  analyse?: string | null
  feedback?: string | null
  displayLabelEn?: string
  displayLabelFr?: string
}

export interface WritingSubmissionResult {
  id: number
  prompt_id: number
  word_count: number
  overall_score?: number          // 0-100; optional in case BE omits
  cefr_band?: string              // 'B1' | 'B2' | 'C1' etc.; optional
  // V-016a.fix — array of per-couche entries; missing couches are NOT
  // present (consumer renders "Coming soon" placeholder for any expected
  // couche absent from the array).
  couches?: WritingCoucheFeedback[]
  // Optional Claude narrative summary if present.
  narrative_summary?: string | null
  // V-016a.dashboard — rich nested envelope returned alongside the flat
  // fields above. When `feedback` is present, the dashboard prefers values
  // from feedback.* (per-couche examiner remark + teacher coaching,
  // exam-profile criteria breakdown) and falls back to flat fields only
  // for back-compat with older BE responses.
  feedback?: WritingAnalysisFeedback
}

// V-016a.dashboard — pedagogical coaching block emitted per couche and
// per TCF criterion. coaching_en is primary copy; coaching_fr is the
// French analog; transformation is the action-step rewrite ("try this").
export interface WritingTeacherCoaching {
  coaching_en?: string | null
  coaching_fr?: string | null
  transformation?: string | null
}

// V-016a.dashboard — rich per-couche payload under
// `feedback.methode_en_couches.<key>`. Scores share the 0-20 scale used
// in the flat WritingCoucheFeedback array.
export interface WritingMethodeCoucheRich {
  score?: number | null
  examiner_remark_fr?: string | null
  teacher_coaching?: WritingTeacherCoaching | null
}

// V-016a.dashboard — single criterion from
// `feedback.exam_profile.criteria_breakdown[]`. This is the display-ready
// dataset (carries localized labels + max_score); the parallel raw
// `feedback.tcf_canada_evaluation.criteria[]` is the scoring source and
// is intentionally NOT rendered (one accordion only — see V-016a.dashboard).
export interface WritingCriterionBreakdown {
  criterion_key: string
  label_fr_technical?: string
  label_fr_student?: string
  label_en_student?: string
  label_es_student?: string
  max_score: number
  score: number
  feedback?: string | null
  examiner_remark_fr?: string | null
  teacher_coaching?: WritingTeacherCoaching | null
}

// V-016a.dashboard — `feedback.exam_profile` envelope. The dashboard reads
// overall_score + cefr_level from here in preference to the flat
// WritingSubmissionResult.overall_score / cefr_band; the secondary_framework
// pair (e.g. CLB, when targeting TCF Canada) renders only when value is
// non-null.
export interface WritingExamProfile {
  overall_score?: number | null
  cefr_level?: string | null
  criteria_breakdown?: WritingCriterionBreakdown[]
  secondary_framework_label?: string | null
  secondary_framework_value?: string | number | null
}

// V-016a.dashboard — full rich feedback envelope. `methode_en_couches` is
// the rich per-couche map (consumer reads keys via CoucheKey);
// `exam_profile` carries the TCF rubric breakdown
// and overall scoring. The narrative side-fields (summary, errors,
// strengths, next_steps, next_step, tcf_canada_evaluation) are present
// in the BE payload but not surfaced by the V-016a.dashboard UI pass —
// kept here so a future iteration can render them without re-typing.
export interface WritingAnalysisFeedback {
  overall_score?: number | null
  word_count?: number
  summary?: string | null
  errors?: unknown
  strengths?: unknown
  next_steps?: unknown
  next_step?: unknown
  methode_en_couches?: Partial<Record<CoucheKey | 'la_voix', WritingMethodeCoucheRich>>
  exam_profile?: WritingExamProfile
  tcf_canada_evaluation?: unknown
}

// V-016a.fe — async job contract. POST /api/writing/submit no longer
// returns the analysis result inline; it returns a job handle that the
// FE polls via GET /api/writing/jobs/{job_id}. The job's `result` is a
// WritingSubmissionResult once status flips to 'completed'.
export type WritingJobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface WritingJob {
  job_id: string
  status: WritingJobStatus
  result?: WritingSubmissionResult | null
  error?: { message: string; code?: string } | null
  created_at: string
  completed_at?: string | null
}

// GET /api/writing/history row (BE may not have this endpoint yet — V-013a
// runtime-detects 404 and renders empty state, files V-013a.history).
export interface WritingHistoryItem {
  id: number
  prompt_id: number
  prompt_title_fr: string
  word_count: number
  overall_score: number
  cefr_band: string
  submitted_at: string  // ISO datetime
}

// ── Le Vocabulaire (F-325 browse UI) ────────────────────────────────────────

// Canonical four-value enum per BE F-320 commit 0a7cc4b (supersedes the
// stale oqlf|academie|curated triple in BACKLOG.md:3274 — see BACKLOG-
// HYGIENE-001 follow-up). third_party_publisher_DO_NOT_EXTRACT exists in
// the BE schema but is silently filtered at the query layer (BE F-325
// Decision D4) — the FE never receives rows in that partition, so it
// stays in the enum for type completeness but is never surfaced as a
// filter chip or badge.
export type CorpusPartition =
  | 'CC_corpus'
  | 'chadi_authored'
  | 'book_lab'
  | 'third_party_publisher_DO_NOT_EXTRACT'

// Canonical CEFR set per F-320 schema. Chunks carry one band; topics
// carry a {min, max} range.
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

// F-320 schema. null on a chunk = untagged (general-French). Topic-level
// exam_tags is an array because a topic can be relevant to multiple
// exam profiles (e.g., a B1-formal-register topic tags both TCF and DELF).
export type ExamTag = 'TCF' | 'DELF' | 'TEF'

// F-320 schema — sociolinguistic register. Drives the filter chip group
// on /vocabulaire/[topic-slug].
export type Register = 'familier' | 'standard' | 'soutenu'

export interface VocabularyTopic {
  slug: string
  title: string
  corpusPartition: CorpusPartition
  source: string
  chunkCount: number
  examTags: ExamTag[]
  cefrRange: { min: CefrLevel; max: CefrLevel }
}

export interface VocabularyChunk {
  id: number
  chunkFr: string
  translationEn: string
  cefrLevel: CefrLevel
  examTag: ExamTag | null
  register: Register
  source: string
}

// Paginated response per BE F-325 offset-based contract. `next` is
// computed FE-side from total/limit/offset in the TQ infinite-query
// getNextPageParam (see app/vocabulaire/[topic-slug]).
export interface VocabularyChunksPage {
  chunks: VocabularyChunk[]
  total: number
  limit: number
  offset: number
}
