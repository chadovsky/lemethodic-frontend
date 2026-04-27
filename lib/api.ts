// FluentPath API client. Typed fetch wrapper over the tcf-oral-tool FastAPI
// backend. All methods return Promise<T>; non-2xx responses throw ApiError.
//
// Token source: localStorage key "fluentpath_token" (written by lib/auth.ts).
// Base URL: NEXT_PUBLIC_API_URL.

import type {
  ApiErrorShape,
  Conversation,
  ConversationFinalizeResult,
  ConversationStart,
  ConversationSupersedeResult,
  ConversationTurn,
  ConversationTurnResult,
  Couche,
  CoucheKey,
  DetectedModulesResponse,
  Diagnostic,
  Goulet,
  Lesson,
  LessonDetail,
  ModuleWithContext,
  Moule,
  MoulesBreakdown,
  OnboardingData,
  OrdonnanceStep,
  QuizAnswer,
  QuizQuestion,
  QuizResult,
  Recording,
  RecurringModulesResponse,
  TacheMode,
  TCFGoal,
  User,
} from './types'
import { useAuthStore } from './auth'

const TOKEN_KEY = 'fluentpath_token'
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export class ApiError extends Error implements ApiErrorShape {
  status: number
  body: unknown
  constructor(status: number, message: string, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

// ── Core fetch ───────────────────────────────────────────────────────────────

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number | undefined>
  // Set when sending FormData — skip the JSON content-type header.
  formData?: FormData
}

function readToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(path.startsWith('http') ? path : `${BASE_URL}${path}`)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
    }
  }
  return url.toString()
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  // Default method: if a body/formData is present and the caller didn't
  // name a method, POST. The previous default was GET — which the browser
  // rejects synchronously with "Request with GET/HEAD method cannot have
  // body" when paired with any BodyInit. This regressed createRecording and
  // uploadAudio (both pass only { formData }); login/register/etc. were
  // fine because they pass method:'POST' explicitly.
  const { body, query, formData } = opts
  const method = opts.method ?? (body !== undefined || formData ? 'POST' : 'GET')
  const headers: Record<string, string> = {}
  const token = readToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  let payload: BodyInit | undefined
  if (formData) {
    payload = formData
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: payload,
  })

  const text = await res.text()
  let parsed: unknown
  try {
    parsed = text ? JSON.parse(text) : null
  } catch {
    parsed = text
  }

  if (!res.ok) {
    // Stale/expired/orphaned token: wipe auth so the next render cycle
    // reroutes the user to onboarding. Guarded on (a) being in the browser
    // (server-rendered requests should never touch the store) and (b) us
    // actually holding a token — a 401 on a login-failure call must not
    // clobber state for an already-logged-in user who is e.g. retrying.
    if (res.status === 401 && typeof window !== 'undefined') {
      const current = useAuthStore.getState().token
      if (current) {
        useAuthStore.getState().clearAuth()
      }
    }
    const message =
      (parsed && typeof parsed === 'object' && 'detail' in parsed && typeof (parsed as { detail: unknown }).detail === 'string'
        ? (parsed as { detail: string }).detail
        : null) ?? `${res.status} ${res.statusText}`
    throw new ApiError(res.status, message, parsed)
  }

  return parsed as T
}

// ── Mappers: backend DTO → frontend shape ────────────────────────────────────

interface RawUser {
  id: number
  email: string
  full_name: string | null
  is_admin?: boolean
  // Onboarding fields — only present on /api/auth/me and /api/users/onboarding
  // responses (serialize_user on the backend). /api/auth/login and
  // /api/auth/register return the stripped-down shape without them.
  target_level?: string | null
  exam_profile?: string | null
  exam_date?: string | null
  goal?: string | null
  current_level?: string | null
  interface_language?: string | null
}

function mapUser(raw: RawUser): User {
  return {
    id: raw.id,
    email: raw.email,
    fullName: raw.full_name,
    isAdmin: !!raw.is_admin,
    targetLevel: raw.target_level ?? null,
    examProfile: raw.exam_profile ?? null,
    examDate: raw.exam_date ?? null,
    goal: raw.goal ?? null,
    currentLevel: raw.current_level ?? null,
    interfaceLanguage: raw.interface_language ?? null,
  }
}

interface RawLesson {
  id: number
  lesson_number: number
  code: string
  title: string
  short_description: string
  detailed_content?: string
  status: Lesson['status']
  quiz_attempts: number
  quiz_best_score: number | null
  completed_at: string | null
  estimated_duration_minutes?: number
  prerequisite_lesson_number?: number | null
  // F-087 fields — present from the post-seed backend; defaulted in the
  // mapper for any older response shape that survives in tests.
  phase?: number
  subline_en?: string | null
}

function mapLesson(raw: RawLesson): Lesson {
  return {
    id: raw.id,
    lessonNumber: raw.lesson_number,
    code: raw.code,
    title: raw.title,
    shortDescription: raw.short_description,
    detailedContent: raw.detailed_content,
    status: raw.status,
    quizAttempts: raw.quiz_attempts,
    quizBestScore: raw.quiz_best_score,
    completedAt: raw.completed_at,
    estimatedDurationMinutes: raw.estimated_duration_minutes,
    prerequisiteLessonNumber: raw.prerequisite_lesson_number,
    // F-087: default to 1 (Fondations) on missing/unknown to keep
    // legacy rows landing in the first phase. Anything other than the
    // documented values 1 or 2 collapses to 1.
    phase: raw.phase === 2 ? 2 : 1,
    sublineEn: raw.subline_en ?? null,
  }
}

interface RawQuizQuestion {
  id: number
  question_number: number
  question_type: QuizQuestion['questionType']
  question: string
  options?: string[]
}

function mapQuizQuestion(raw: RawQuizQuestion): QuizQuestion {
  return {
    id: raw.id,
    questionNumber: raw.question_number,
    questionType: raw.question_type,
    question: raw.question,
    options: raw.options,
  }
}

interface RawConversationTurn {
  id: number
  turn_number: number
  speaker: ConversationTurn['speaker']
  text: string
  audio_url: string | null
  word_count: number | null
}

function mapConversationTurn(raw: RawConversationTurn): ConversationTurn {
  return {
    id: raw.id,
    turnNumber: raw.turn_number,
    speaker: raw.speaker,
    text: raw.text,
    audioUrl: raw.audio_url,
    wordCount: raw.word_count,
  }
}

interface RawConversation {
  conversation_id: string
  tache_mode: TacheMode
  target_level: string
  status: Conversation['status']
  recording_id: number | null
  turns: RawConversationTurn[]
  started_at: string
  completed_at: string | null
}

// Backend /start response. Distinct from RawConversation because /start
// returns only the initial state, not the full turn history. T1 carries an
// opening examiner turn; T2 returns null in those slots (candidate opens).
interface RawConversationStart {
  conversation_id: string
  tache_mode: TacheMode
  conversation_status: Conversation['status']
  examiner_turn_text: string | null
  examiner_turn_audio_url: string | null
  turn_number: number | null
  // T1 uses one name, T2 another — normalized in the mapper.
  max_candidate_turns?: number
  max_candidate_turns_hard?: number
  max_candidate_turns_hint?: number
}

function mapConversation(raw: RawConversation): Conversation {
  return {
    conversationId: raw.conversation_id,
    tacheMode: raw.tache_mode,
    targetLevel: raw.target_level,
    status: raw.status,
    recordingId: raw.recording_id,
    turns: (raw.turns ?? []).map(mapConversationTurn),
    startedAt: raw.started_at,
    completedAt: raw.completed_at,
  }
}

interface RawRecording {
  id: number
  tache_mode: Recording['tacheMode']
  topic_id: number | null
  target_level: string
  transcript: string | null
  corrected_transcript: string | null
  word_count: number | null
  duration_seconds: number | null
  status: Recording['status']
  created_at: string
  // GET /api/recordings/{id} returns the structured analysis under `diagnostic`.
  // There's also a legacy `feedback` key in the response carrying
  // {overall_score, analysis, recommendations} — that's the old shape and
  // we intentionally ignore it.
  diagnostic?: RawDiagnosticBlock | null
}

// Backend shape for the `diagnostic` block as emitted by the recordings
// router (mirrors what analysis.py writes into the Feedback row, but
// restructured as JSON for the API).
// F-088 — `la_carte` (internal-key dict) replaced by `couches` (array
// of {internal_key, display_label_en, display_label_fr, score}). Hard
// cut: backend no longer emits `la_carte`. See
// app/services/couche_labels.py for the canonical mapping.
interface RawCouche {
  internal_key: CoucheKey
  display_label_en: string
  display_label_fr: string
  score: number
}

// F-083/F-084 raw shape — the backend's `diagnostic.tache_rubric` JSON
// block. Field names mirror the LLM output schema in
// app/services/tache_rubric.py exactly; the mapper below converts
// snake_case → camelCase at the API boundary.
interface RawTacheRubricDimension {
  key: string
  score: number
  prose: string
}
interface RawUniversalSidebar {
  score: number
  examples: string[]
}
interface RawTacheRubric {
  tache_mode: 'tache_1' | 'tache_2' | 'tache_3'
  summary_prose: string
  tache_specific_dimensions: RawTacheRubricDimension[]
  universal_sidebars: {
    conjugation: RawUniversalSidebar
    grammar_structure: RawUniversalSidebar
    sentence_construction: RawUniversalSidebar
  }
  retry_recommendation: { should_retry: boolean; reason: string }
  next_action_suggestion: string
  narrative_summary?: string
}

interface RawDiagnosticBlock {
  note_globale?: number
  couches?: RawCouche[]
  le_goulet?: {
    couche: number | string
    nom: string
    explication: string
  }
  // F-084 — top-level narrative summary (also nested inside
  // tache_rubric.narrative_summary; the top-level one is the
  // canonical surface and is what the dedicated DB column carries).
  narrative_summary?: string | null
  // F-083 — per-Tâche pedagogical rubric. null for legacy recordings.
  tache_rubric?: RawTacheRubric | null
  ce_qui_marche?: string
  // NOT an array — the backend emits a wrapper object with an `exercices`
  // array inside (see RawOrdonnanceBlock). Typed as unknown at the block
  // level so the dedicated mapOrdonnance() guard owns the shape check.
  ordonnance?: unknown
  cefr_level?: string | null
  clb_level?: string | null
  feedback_grid?: {
    tache_2?: {
      pyramide?: RawMoule
      rebond?: RawMoule
      ciblage?: RawMoule
    }
    // The grid also carries {what_works, what_doesnt_work, english_habits,
    // structure_quality, tache_3} objects with title_fr/content_fr — not
    // consumed here yet, but keeping the type open so they pass through.
    [k: string]: unknown
  } | null
}

interface RawMoule {
  score?: number
  detected?: boolean
  examples?: string[]
  notes?: string | null
}

// Backend `ordonnance` block (app/services/analysis.py::SYSTEM_PROMPT_ORDONNANCE).
// Empty recordings serialize as {} (not [] — see recordings.py:645), so the
// wrapper object is optional at every level.
interface RawOrdonnanceExercise {
  numero?: number
  type?: string
  consigne?: string
  modele?: string
  phrase?: string
  options?: string[]
  reponse?: number
  explication?: string
}
interface RawOrdonnanceBlock {
  couche_ciblee?: number
  nom_couche?: string
  exercices?: RawOrdonnanceExercise[]
}

// Normalize the backend's wrapper-object-with-exercices-array into the flat
// OrdonnanceStep[] the UI expects. Returns [] whenever the shape is missing
// or unrecognizable (empty {}, null, pre-F-032 rows with different keys,
// demo-mode fallbacks).
function mapOrdonnance(raw: unknown): OrdonnanceStep[] {
  if (!raw || typeof raw !== 'object') return []
  const block = raw as RawOrdonnanceBlock
  const exercises = Array.isArray(block.exercices) ? block.exercices : []
  return exercises.map((ex, i) => ({
    priority: typeof ex.numero === 'number' ? ex.numero : i + 1,
    // `consigne` is already localized to the user's ui_language per the
    // analysis prompt; `type` is the short category fallback ("préposition",
    // "conjugaison", ...). Both can be absent on malformed rows.
    action: ex.consigne ?? ex.type ?? `Exercise ${i + 1}`,
    pattern: ex.type,
    example: ex.modele ?? ex.phrase,
  }))
}

function mapRecording(raw: RawRecording): Recording {
  return {
    id: raw.id,
    tacheMode: raw.tache_mode,
    topicId: raw.topic_id,
    targetLevel: raw.target_level,
    transcript: raw.transcript,
    correctedTranscript: raw.corrected_transcript,
    wordCount: raw.word_count,
    durationSeconds: raw.duration_seconds,
    status: raw.status,
    createdAt: raw.created_at,
  }
}

// The backend packs French + English into one string with "|||" as the
// separator (e.g. "Aucune production.|||No production."). Default to the
// English side; callers that want the French copy can split themselves.
// TODO(Phase 4): thread the user's interface_language through so the right
// side is picked automatically.
function pickLocalized(s: string | null | undefined): string | null {
  if (!s) return null
  const parts = s.split('|||')
  return parts.length > 1 ? parts[1].trim() : parts[0].trim()
}

const KNOWN_COUCHE_KEYS: ReadonlySet<CoucheKey> = new Set<CoucheKey>([
  'le_fond',
  'les_moules_des_idees',
  'les_moules',
  'les_reflexes_anglais',
])

// Exposed so tests / future tickets can reuse the mapper without a round-trip.
export function mapDiagnosticBlock(
  recordingId: number,
  d: RawDiagnosticBlock,
): Diagnostic {
  // F-088 — read the `couches` array directly. Backend always emits
  // all 4 TCF couches in canonical order; defensive filter is here in
  // case a legacy row ever lands without the field populated.
  const couches: Couche[] = (d.couches ?? [])
    .filter((c) => c && KNOWN_COUCHE_KEYS.has(c.internal_key as CoucheKey))
    .map((c) => ({
      key: c.internal_key as CoucheKey,
      displayLabelEn: c.display_label_en,
      displayLabelFr: c.display_label_fr,
      score: c.score ?? 0,
      // analyse_par_couche is not in the new `diagnostic` shape; use the
      // bilingual "ce_qui_marche" as a shared narrative instead (for now).
      analyse: null,
    }))

  // `le_goulet.nom` is a CoucheKey string from analysis.py
  // (e.g. "les_reflexes_anglais"). Look up the matching couche so the
  // bottleneck callout can render the same TCF display label as the bars.
  const gouletNomRaw = d.le_goulet?.nom ?? ''
  const gouletKey: CoucheKey = KNOWN_COUCHE_KEYS.has(gouletNomRaw as CoucheKey)
    ? (gouletNomRaw as CoucheKey)
    : 'le_fond'
  const gouletCouche = couches.find((c) => c.key === gouletKey)

  const goulet: Goulet = {
    couche: gouletKey,
    // F-088 — pre-resolve both display labels for the goulet so the
    // diagnostic page can pick by interface language without rewalking
    // the couches array.
    nom: gouletCouche?.displayLabelEn ?? gouletNomRaw,
    nomFr: gouletCouche?.displayLabelFr ?? gouletNomRaw,
    explication: pickLocalized(d.le_goulet?.explication) ?? '',
  }

  // F-083/F-084 — pass the rubric through with snake_case → camelCase
  // mapping. Defensive on every nested field so a partial-shape
  // backend response degrades to a usable rubric instead of crashing.
  let tacheRubric: import('./types').TacheRubric | null = null
  if (d.tache_rubric && typeof d.tache_rubric === 'object') {
    const r = d.tache_rubric
    const dims = Array.isArray(r.tache_specific_dimensions) ? r.tache_specific_dimensions : []
    const sb = (r.universal_sidebars ?? {}) as RawTacheRubric['universal_sidebars']
    const blank = { score: 0, examples: [] as string[] }
    tacheRubric = {
      tacheMode: r.tache_mode,
      summaryProse: r.summary_prose ?? '',
      dimensions: dims.map((dim) => ({
        key: String(dim.key ?? ''),
        score: typeof dim.score === 'number' ? dim.score : 0,
        prose: dim.prose ?? '',
      })),
      universalSidebars: {
        conjugation: sb.conjugation ?? blank,
        grammar_structure: sb.grammar_structure ?? blank,
        sentence_construction: sb.sentence_construction ?? blank,
      },
      retryRecommendation: {
        shouldRetry: !!r.retry_recommendation?.should_retry,
        reason: r.retry_recommendation?.reason ?? '',
      },
      nextActionSuggestion: r.next_action_suggestion ?? '',
    }
  }

  return {
    recordingId,
    noteGlobale: d.note_globale ?? 0,
    couches,
    goulet,
    ceQuiMarche: pickLocalized(d.ce_qui_marche),
    ordonnance: mapOrdonnance(d.ordonnance),
    cefrLevel: d.cefr_level ?? null,
    clbLevel: d.clb_level ?? null,
    // F-084 — top-level narrative summary. Empty string from the
    // backend rubric fallback collapses to null so the frontend has a
    // single "absent" check.
    narrativeSummary: d.narrative_summary && d.narrative_summary.trim() ? d.narrative_summary : null,
    tacheRubric,
  }
}

const MOULE_LABELS: Record<'pyramide' | 'rebond' | 'ciblage', string> = {
  pyramide: 'Pyramide',
  rebond: 'Rebond',
  ciblage: 'Ciblage',
}

export function mapDiagnosticBlockToMoules(
  recordingId: number,
  d: RawDiagnosticBlock,
): MoulesBreakdown {
  const grid = d.feedback_grid?.tache_2 ?? {}
  const keys: Array<'pyramide' | 'rebond' | 'ciblage'> = ['pyramide', 'rebond', 'ciblage']
  const moules: Moule[] = keys.map((key) => {
    const raw = grid[key] ?? {}
    return {
      key,
      label: MOULE_LABELS[key],
      score: raw.score ?? 0,
      detected: raw.detected ?? false,
      examples: raw.examples ?? [],
      notes: raw.notes ?? null,
    }
  })
  return { recordingId, moules }
}

// ── Onboarding shape bridge ──────────────────────────────────────────────────

// TCF goals on the frontend are coarse motivations; the backend's exam_profile
// is the specific exam track. This mapping reflects the descriptors shown on
// onboarding step 2 (TCFGoalSelect). Tune here if the product pivots the
// association.
//
// F-091.0 — V1 onboarding lock to TCF-only. All three goals map to
// 'tcf_canada' until the F-091 epic ships post-launch. The backend
// exam_profiles registry only ships TCF Canada today; the previous
// values 'delf' / 'tcf_general' were silently falling through to TCF
// Canada via get_profile()'s default-fallback, so the mapping was
// already a false-promise string in the DB. Locking it here makes
// the persisted value match the actual analyzer behavior. F-091b
// will restore goal-aware profile dispatch (with real DELF + TEF
// implementations).
//
// The `goal` field on the user is unaffected — it still persists the
// motivation ('immigration' / 'studies' / 'general'), which F-091b
// will read to dispatch into the right exam profile post-launch.
const GOAL_TO_EXAM_PROFILE: Record<TCFGoal, string> = {
  immigration: 'tcf_canada',
  studies: 'tcf_canada',
  general: 'tcf_canada',
}

interface BackendOnboardingPayload {
  target_level: string | undefined
  exam_profile: string | undefined
  exam_date: string | null
  goal: string | undefined
  current_level: string | undefined
  interface_language: string | undefined
}

// Exported so the signup flow / tests can invoke the mapper without a network
// round-trip and so future callers (e.g. a profile-edit screen) share one
// source of truth for the shape conversion.
export function mapOnboardingToBackend(
  data: Partial<OnboardingData>,
): BackendOnboardingPayload {
  // The store's ExamDate is a tagged union:
  //   { type: 'quick', label } → user picked a bucket, no concrete date
  //   { type: 'date',  value } → value is "YYYY-MM" from <input type="month">
  // Backend Pydantic expects YYYY-MM-DD or null; pad with "-01" for month-only.
  let examDate: string | null = null
  const d = data.examDate
  if (d && d.type === 'date' && d.value) {
    examDate = /^\d{4}-\d{2}-\d{2}$/.test(d.value) ? d.value : `${d.value}-01`
  }

  return {
    target_level: data.targetScore,
    exam_profile: data.goal ? GOAL_TO_EXAM_PROFILE[data.goal] : undefined,
    exam_date: examDate,
    goal: data.goal,
    current_level: data.currentLevel,
    interface_language: data.uiLanguage,
  }
}

// ── Domain methods ───────────────────────────────────────────────────────────

export const api = {
  auth: {
    async login(email: string, password: string): Promise<{ token: string; user: User }> {
      const raw = await request<{ access_token: string; user: RawUser }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      return { token: raw.access_token, user: mapUser(raw.user) }
    },

    // Backend register requires full_name; derive from the email local-part
    // when the frontend doesn't collect it explicitly (F-060 may formalize this).
    async register(email: string, password: string, fullName?: string): Promise<{ token: string; user: User }> {
      const raw = await request<{ access_token: string; user: RawUser }>('/api/auth/register', {
        method: 'POST',
        body: {
          email,
          password,
          full_name: fullName ?? email.split('@')[0],
        },
      })
      return { token: raw.access_token, user: mapUser(raw.user) }
    },

    async logout(): Promise<void> {
      await request<{ message: string }>('/api/auth/logout', { method: 'POST' })
    },
  },

  users: {
    // Backend exposes this as /api/auth/me, not /api/users/me. Kept under
    // api.users.* to match the frontend's mental model.
    async getMe(): Promise<User> {
      const raw = await request<RawUser>('/api/auth/me')
      return mapUser(raw)
    },

    // Backend schema (app/routers/users.py::OnboardingData):
    //   target_level, exam_profile, exam_date (YYYY-MM-DD | null),
    //   goal, current_level, interface_language.
    // Frontend store uses a different shape (targetScore, tagged-union
    // examDate, uiLanguage, no exam_profile). mapOnboardingToBackend bridges
    // the two so onboarding screens and the store can stay as-is.
    async completeOnboarding(data: OnboardingData): Promise<User> {
      const raw = await request<RawUser>('/api/users/onboarding', {
        method: 'POST',
        body: mapOnboardingToBackend(data),
      })
      return mapUser(raw)
    },

    // F-080d — modules detected in 3+ distinct recordings for the
    // current user, sorted by severity DESC then recurrence_count DESC.
    // Returns a snake_case payload verbatim from the backend (read-only
    // surface; no camelCase mapper layer to avoid maintenance churn).
    // Empty array on cold users (fewer than 3 recurring detections).
    async getRecurringModules(): Promise<RecurringModulesResponse> {
      return request<RecurringModulesResponse>('/api/users/me/recurring_modules')
    },
  },

  modules: {
    // F-080d — full module spec for the /learn/[module_id] page. The
    // backend endpoint augments with optional auth: when a token is
    // present and the user has detections of this module, `user_context`
    // carries the per-user history; null otherwise (cold state). 404
    // when module_id doesn't exist in the active library.
    async get(moduleId: string): Promise<ModuleWithContext> {
      return request<ModuleWithContext>(`/api/modules/${moduleId}`)
    },
  },

  lessons: {
    async list(): Promise<Lesson[]> {
      const raw = await request<{ lessons: RawLesson[] }>('/api/ecole/lessons')
      return raw.lessons.map(mapLesson)
    },

    async get(id: number): Promise<LessonDetail> {
      const [lessonRaw, quizRaw] = await Promise.all([
        request<RawLesson>(`/api/ecole/lessons/${id}`),
        request<{ questions: RawQuizQuestion[]; pass_threshold: number }>(
          `/api/ecole/lessons/${id}/quiz`,
        ),
      ])
      return {
        lesson: mapLesson(lessonRaw),
        quiz: {
          questions: quizRaw.questions.map(mapQuizQuestion),
          passThreshold: quizRaw.pass_threshold,
        },
      }
    },

    // Backend has no dedicated /complete endpoint; passing the quiz is what
    // marks a lesson done. This method submits the quiz and returns the result;
    // the UI treats `passed: true` as completion.
    async complete(id: number, quizAnswers: QuizAnswer[]): Promise<QuizResult> {
      const raw = await request<{
        score: number
        correct_count: number
        total: number
        passed: boolean
        pass_threshold: number
        feedback: Array<{
          question_number: number
          correct: boolean
          correct_answer?: string
          explanation?: string
        }>
        status: Lesson['status']
        next_unlocked?: number
      }>(`/api/ecole/lessons/${id}/quiz/submit`, {
        method: 'POST',
        body: {
          answers: quizAnswers.map((a) => ({
            question_number: a.questionNumber,
            answer: a.answer,
          })),
        },
      })
      return {
        score: raw.score,
        correctCount: raw.correct_count,
        total: raw.total,
        passed: raw.passed,
        passThreshold: raw.pass_threshold,
        feedback: raw.feedback.map((f) => ({
          questionNumber: f.question_number,
          correct: f.correct,
          correctAnswer: f.correct_answer,
          explanation: f.explanation,
        })),
        status: raw.status,
        nextUnlocked: raw.next_unlocked,
      }
    },
  },

  sessions: {
    // Tâche 1/2 — starts a multi-turn conversation.
    //
    // Backend /start returns different shapes for T1 vs T2:
    //   - T1: includes an opening examiner turn (examiner_turn_text/_audio_url/_number)
    //   - T2: candidate speaks first, so those fields are all null; the
    //         scenario object is included instead
    // Both include the conversation id, status, mode, and turn caps.
    async createConversation(
      tacheMode: TacheMode,
      opts: {
        scenarioCode?: string
        topicId?: number
        targetLevel?: string
        uiLanguage?: string
        examProfile?: string
      } = {},
    ): Promise<ConversationStart> {
      const raw = await request<RawConversationStart>('/api/conversations/start', {
        body: {
          tache_mode: tacheMode,
          ...(opts.scenarioCode ? { scenario_code: opts.scenarioCode } : {}),
          ...(opts.topicId ? { topic_id: opts.topicId } : {}),
          ...(opts.targetLevel ? { target_level: opts.targetLevel } : {}),
          ...(opts.uiLanguage ? { ui_language: opts.uiLanguage } : {}),
          ...(opts.examProfile ? { exam_profile: opts.examProfile } : {}),
        },
      })
      return {
        conversationId: raw.conversation_id,
        tacheMode: raw.tache_mode,
        conversationStatus: raw.conversation_status,
        examinerTurnText: raw.examiner_turn_text ?? null,
        examinerTurnAudioUrl: raw.examiner_turn_audio_url ?? null,
        examinerTurnNumber: raw.turn_number ?? null,
        // T1 uses max_candidate_turns; T2 uses max_candidate_turns_hard. The
        // client normalizes to a single "hard cap" number so callers don't
        // have to fork on mode. Hint is T2-only.
        maxCandidateTurnsHard:
          raw.max_candidate_turns_hard ?? raw.max_candidate_turns ?? null,
        maxCandidateTurnsHint: raw.max_candidate_turns_hint ?? null,
      }
    },

    async getConversation(id: string): Promise<Conversation> {
      const raw = await request<RawConversation>(`/api/conversations/${id}`)
      return mapConversation(raw)
    },

    // Lists Tâche 2 scenarios the current user is gated into. Backend
    // filters by the ecole gate (F-053): below-A2 users only get A2_B1
    // rows. Used by the F-062.1 dev sanity check in Tache2Picker to detect
    // slug/code drift between the client-side SCENARIOS literal and the
    // seeded DB; the picker itself will eventually consume this endpoint
    // as its source of truth (F-061.1).
    async listTache2Scenarios(): Promise<{
      scenarios: Array<{ id: number; code: string; difficulty: string }>
      aboveA2: boolean
    }> {
      const raw = await request<{
        scenarios: Array<{
          id: number
          code: string
          difficulty?: string
        }>
        gates: { above_a2: boolean }
      }>('/api/conversations/scenarios')
      return {
        scenarios: raw.scenarios.map((s) => ({
          id: s.id,
          code: s.code,
          difficulty: s.difficulty ?? 'A2_B1',
        })),
        aboveA2: raw.gates.above_a2,
      }
    },

    // Posts a candidate turn. Multipart F-048 path: server runs STT and
    // returns the transcript + the next examiner turn. When the backend's
    // hard cap is hit (T1: 4, T2: 12) it auto-runs analysis and sets
    // recordingId — clients that enforce a tighter client-side cap (like
    // F-062's 6-turn T2 loop) never see that because they call finalize()
    // themselves before the backend would auto-end.
    async uploadConversationTurn(
      sessionId: string,
      audioBlob: Blob,
    ): Promise<ConversationTurnResult> {
      const fd = new FormData()
      fd.append('audio', audioBlob, 'turn.webm')
      const raw = await request<{
        candidate_transcript: string
        candidate_turn_number: number
        examiner_turn_text: string | null
        examiner_turn_audio_url: string | null
        examiner_turn_number: number | null
        conversation_status: Conversation['status']
        recording_id: number | null
        auto_ended: boolean
        wrap_up_hint: boolean
      }>(`/api/conversations/${sessionId}/turn`, { formData: fd })
      return {
        candidateTranscript: raw.candidate_transcript,
        candidateTurnNumber: raw.candidate_turn_number,
        examinerTurnText: raw.examiner_turn_text,
        examinerTurnAudioUrl: raw.examiner_turn_audio_url,
        examinerTurnNumber: raw.examiner_turn_number,
        conversationStatus: raw.conversation_status,
        recordingId: raw.recording_id,
        autoEnded: raw.auto_ended,
        wrapUpHint: raw.wrap_up_hint,
      }
    },

    // F-062.3: mark a candidate turn as superseded so the candidate can
    // re-record it. Use this BEFORE re-uploading audio on the same turn
    // position. Idempotent (calling twice on the same turn returns the
    // original supersede timestamp).
    //
    // Backend cascades: also supersedes the immediately-following examiner
    // turn if present. Frontend generally doesn't need to act on
    // `cascadedExaminerTurnNumbers`, but can use it to reconcile its own
    // chat log view if it was showing the examiner reply.
    async supersedeTurn(
      sessionId: string,
      turnNumber: number,
    ): Promise<ConversationSupersedeResult> {
      const raw = await request<{
        superseded_turn_id: number
        superseded_turn_number: number
        superseded_at: string
        cascaded_examiner_turn_numbers: number[]
        status: 'superseded'
      }>(`/api/conversations/${sessionId}/turn/${turnNumber}/supersede`, {
        method: 'POST',
        body: {},
      })
      return {
        supersededTurnId: raw.superseded_turn_id,
        supersededTurnNumber: raw.superseded_turn_number,
        supersededAt: raw.superseded_at,
        cascadedExaminerTurnNumbers: raw.cascaded_examiner_turn_numbers,
        status: raw.status,
      }
    },

    // Manually end a conversation — runs the 4-couche analysis over all
    // candidate turns and links the resulting Recording row for /diagnostic
    // routing. Idempotent on completed conversations (returns the same
    // recording_id). Named `finalize` on the frontend for API-surface
    // consistency; backend endpoint is `/end` (semantically identical).
    async finalizeConversation(sessionId: string): Promise<ConversationFinalizeResult> {
      const raw = await request<{
        conversation_status: Conversation['status']
        recording_id: number | null
        under_min_turns: boolean
      }>(`/api/conversations/${sessionId}/end`, {
        method: 'POST',
        body: {},
      })
      return {
        conversationStatus: raw.conversation_status,
        recordingId: raw.recording_id,
        underMinTurns: raw.under_min_turns,
      }
    },

    // Tâche 3 — one-shot monologue. Backend takes audio at creation time, so
    // the optional audioBlob is expected once the user hits submit. Calling
    // without a blob returns a rejected promise — intentional, to surface the
    // shape mismatch early.
    //
    // tacheMode accepts either a digit (1|2|3) or the full backend string
    // ('tache_1'|'tache_2'|'tache_3'). Bare digits are normalized to the
    // `tache_N` form — the backend rejects anything else with a 400. Defaults
    // to 'tache_3' so existing T3-only callers don't need to change.
    async createRecording(
      topicId: number,
      audioBlob: Blob,
      opts: {
        tacheMode?: 1 | 2 | 3 | 'tache_1' | 'tache_2' | 'tache_3'
        targetLevel?: string
        uiLanguage?: string
        examProfile?: string
      } = {},
    ): Promise<Recording> {
      const rawMode = opts.tacheMode ?? 'tache_3'
      const mode = typeof rawMode === 'number' ? `tache_${rawMode}` : rawMode
      const fd = new FormData()
      fd.append('audio', audioBlob, 'recording.webm')
      fd.append('topic_id', String(topicId))
      fd.append('tache_mode', mode)
      if (opts.targetLevel) fd.append('target_level', opts.targetLevel)
      if (opts.uiLanguage) fd.append('ui_language', opts.uiLanguage)
      if (opts.examProfile) fd.append('exam_profile', opts.examProfile)
      const raw = await request<RawRecording>('/api/recordings/upload', { formData: fd })
      return mapRecording(raw)
    },

    // Fetches the recording tied to a session (Conversation.recording_id for
    // Tâche 1/2; recording id directly for Tâche 3) and maps its `diagnostic`
    // block into the 4-couche + goulet + ordonnance shape the UI renders.
    // Note: the backend also returns a legacy `feedback` object with a
    // trimmed {overall_score, analysis, recommendations} shape — we don't
    // use it; all structured data lives under `diagnostic`.
    async getDiagnostic(recordingId: number): Promise<Diagnostic> {
      const raw = await request<RawRecording>(`/api/recordings/${recordingId}`)
      if (!raw.diagnostic) {
        throw new ApiError(
          409,
          'Recording has no diagnostic yet — analysis may still be running.',
          raw,
        )
      }
      return mapDiagnosticBlock(raw.id, raw.diagnostic)
    },

    // F-080c — fetch the modules detected on this recording, hydrated
    // with full module content for the diagnostic page. Returned shape
    // mirrors the backend response verbatim (snake_case field names);
    // the diagnostic components consume it directly without camelCase
    // mapping. See lib/types.DetectedModulesResponse for the shape.
    //
    // Empty state: when no modules were detected, the backend returns
    // primary_module: null + empty arrays; the diagnostic page renders
    // EmptyDetectionFallback in that case. 404 only fires when the
    // recording_id doesn't exist or doesn't belong to the user.
    async getDetectedModules(recordingId: number): Promise<DetectedModulesResponse> {
      return request<DetectedModulesResponse>(
        `/api/recordings/${recordingId}/detected-modules`,
      )
    },

    // Cherry-picks feedback_grid.tache_2 from the recording's diagnostic.
    // Only meaningful for Tâche 2 sessions; returns zeroed moules otherwise.
    async getMoules(recordingId: number): Promise<MoulesBreakdown> {
      const raw = await request<RawRecording>(`/api/recordings/${recordingId}`)
      if (!raw.diagnostic) {
        throw new ApiError(
          409,
          'Recording has no diagnostic yet — analysis may still be running.',
          raw,
        )
      }
      return mapDiagnosticBlockToMoules(raw.id, raw.diagnostic)
    },
  },
}

export type Api = typeof api
