// FluentPath API client. Typed fetch wrapper over the tcf-oral-tool FastAPI
// backend. All methods return Promise<T>; non-2xx responses throw ApiError.
//
// Token source: localStorage key "fluentpath_token" (written by lib/auth.ts).
// Base URL: NEXT_PUBLIC_API_URL.

import type {
  ApiErrorShape,
  Conversation,
  ConversationTurn,
  Couche,
  CoucheKey,
  Diagnostic,
  Goulet,
  Lesson,
  LessonDetail,
  Moule,
  MoulesBreakdown,
  OnboardingData,
  OrdonnanceStep,
  QuizAnswer,
  QuizQuestion,
  QuizResult,
  Recording,
  TacheMode,
  User,
} from './types'

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
  const { method = 'GET', body, query, formData } = opts
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
}

function mapUser(raw: RawUser): User {
  return {
    id: raw.id,
    email: raw.email,
    fullName: raw.full_name,
    isAdmin: !!raw.is_admin,
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
  feedback?: RawFeedback
}

interface RawFeedback {
  note_globale: number
  score_le_fond: number
  score_les_moules_des_idees: number
  score_les_moules: number
  score_les_reflexes_anglais: number
  score_prononciation: number
  analyse_le_fond?: string | null
  analyse_les_moules_des_idees?: string | null
  analyse_les_moules?: string | null
  analyse_les_reflexes_anglais?: string | null
  analyse_prononciation?: string | null
  goulet_couche: CoucheKey
  goulet_nom: string
  goulet_explication: string
  ce_qui_marche: string | null
  ordonnance: OrdonnanceStep[] | null
  cefr_level: string | null
  clb_level: string | null
  feedback_grid?: {
    tache_2?: {
      pyramide?: RawMoule
      rebond?: RawMoule
      ciblage?: RawMoule
    }
  } | null
}

interface RawMoule {
  score?: number
  detected?: boolean
  examples?: string[]
  notes?: string | null
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

const COUCHE_LABELS: Record<CoucheKey, string> = {
  le_fond: 'Le fond',
  les_moules_des_idees: 'Les moules des idées',
  les_moules: 'Les moules',
  les_reflexes_anglais: 'Les réflexes anglais',
  prononciation: 'Prononciation',
}

// Exposed so tests / future tickets can reuse the mapper without a round-trip.
export function mapFeedbackToDiagnostic(recordingId: number, fb: RawFeedback): Diagnostic {
  const couches: Couche[] = [
    { key: 'le_fond', label: COUCHE_LABELS.le_fond, score: fb.score_le_fond, analyse: fb.analyse_le_fond ?? null },
    { key: 'les_moules_des_idees', label: COUCHE_LABELS.les_moules_des_idees, score: fb.score_les_moules_des_idees, analyse: fb.analyse_les_moules_des_idees ?? null },
    { key: 'les_moules', label: COUCHE_LABELS.les_moules, score: fb.score_les_moules, analyse: fb.analyse_les_moules ?? null },
    { key: 'les_reflexes_anglais', label: COUCHE_LABELS.les_reflexes_anglais, score: fb.score_les_reflexes_anglais, analyse: fb.analyse_les_reflexes_anglais ?? null },
    { key: 'prononciation', label: COUCHE_LABELS.prononciation, score: fb.score_prononciation, analyse: fb.analyse_prononciation ?? null },
  ]
  const goulet: Goulet = {
    couche: fb.goulet_couche,
    nom: fb.goulet_nom,
    explication: fb.goulet_explication,
  }
  return {
    recordingId,
    noteGlobale: fb.note_globale,
    couches,
    goulet,
    ceQuiMarche: fb.ce_qui_marche,
    ordonnance: fb.ordonnance ?? [],
    cefrLevel: fb.cefr_level,
    clbLevel: fb.clb_level,
  }
}

const MOULE_LABELS: Record<'pyramide' | 'rebond' | 'ciblage', string> = {
  pyramide: 'Pyramide',
  rebond: 'Rebond',
  ciblage: 'Ciblage',
}

export function mapFeedbackToMoules(recordingId: number, fb: RawFeedback): MoulesBreakdown {
  const grid = fb.feedback_grid?.tache_2 ?? {}
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

    // Backend onboarding-persistence endpoint is not yet implemented (see F-060
    // gap in the backend inventory). Stubbed here to the intended path so
    // wiring the UI in the next ticket is one backend landing away from green.
    async completeOnboarding(data: OnboardingData): Promise<User> {
      const raw = await request<RawUser>('/api/users/onboarding', {
        method: 'POST',
        body: {
          ui_language: data.uiLanguage,
          goal: data.goal,
          current_level: data.currentLevel,
          target_score: data.targetScore,
          exam_date: data.examDate,
        },
      })
      return mapUser(raw)
    },
  },

  lessons: {
    async list(): Promise<Lesson[]> {
      const raw = await request<{ lessons: RawLesson[] }>('/api/raccourci/lessons')
      return raw.lessons.map(mapLesson)
    },

    async get(id: number): Promise<LessonDetail> {
      const [lessonRaw, quizRaw] = await Promise.all([
        request<RawLesson>(`/api/raccourci/lessons/${id}`),
        request<{ questions: RawQuizQuestion[]; pass_threshold: number }>(
          `/api/raccourci/lessons/${id}/quiz`,
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
      }>(`/api/raccourci/lessons/${id}/quiz/submit`, {
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
    async createConversation(tacheMode: TacheMode, scenarioId?: string): Promise<Conversation> {
      const raw = await request<RawConversation>('/api/conversations/start', {
        method: 'POST',
        body: {
          tache_mode: tacheMode,
          ...(scenarioId ? { scenario_code: scenarioId } : {}),
        },
      })
      return mapConversation(raw)
    },

    async getConversation(id: string): Promise<Conversation> {
      const raw = await request<RawConversation>(`/api/conversations/${id}`)
      return mapConversation(raw)
    },

    // Posts a candidate turn to an existing conversation. turnIndex is
    // informational — the backend numbers turns itself.
    async uploadAudio(
      sessionId: string,
      audioBlob: Blob,
      turnIndex?: number,
    ): Promise<{
      candidateTranscript: string
      examinerTurnText: string | null
      examinerTurnAudioUrl: string | null
      conversationStatus: Conversation['status']
      recordingId: number | null
    }> {
      const fd = new FormData()
      fd.append('audio', audioBlob, 'turn.webm')
      if (turnIndex !== undefined) fd.append('turn_index', String(turnIndex))
      const raw = await request<{
        candidate_transcript: string
        examiner_turn_text: string | null
        examiner_turn_audio_url: string | null
        conversation_status: Conversation['status']
        recording_id: number | null
      }>(`/api/conversations/${sessionId}/turn`, { formData: fd })
      return {
        candidateTranscript: raw.candidate_transcript,
        examinerTurnText: raw.examiner_turn_text,
        examinerTurnAudioUrl: raw.examiner_turn_audio_url,
        conversationStatus: raw.conversation_status,
        recordingId: raw.recording_id,
      }
    },

    // Tâche 3 — one-shot monologue. Backend takes audio at creation time, so
    // the optional audioBlob is expected once the user hits submit. Calling
    // without a blob returns a rejected promise — intentional, to surface the
    // shape mismatch early.
    async createRecording(
      topicId: number,
      audioBlob: Blob,
      opts: { targetLevel?: string; uiLanguage?: string; examProfile?: string } = {},
    ): Promise<Recording> {
      const fd = new FormData()
      fd.append('audio', audioBlob, 'recording.webm')
      fd.append('topic_id', String(topicId))
      fd.append('tache_mode', 'tache_3')
      if (opts.targetLevel) fd.append('target_level', opts.targetLevel)
      if (opts.uiLanguage) fd.append('ui_language', opts.uiLanguage)
      if (opts.examProfile) fd.append('exam_profile', opts.examProfile)
      const raw = await request<RawRecording>('/api/recordings/upload', { formData: fd })
      return mapRecording(raw)
    },

    // Fetches the recording tied to a session (Conversation.recording_id for
    // Tâche 1/2; recording id directly for Tâche 3) and maps its feedback
    // into the 4-couche + goulet + ordonnance shape the UI renders.
    async getDiagnostic(recordingId: number): Promise<Diagnostic> {
      const raw = await request<RawRecording & { feedback?: RawFeedback }>(
        `/api/recordings/${recordingId}`,
      )
      if (!raw.feedback) {
        throw new ApiError(
          409,
          'Recording has no feedback yet — analysis may still be running.',
          raw,
        )
      }
      return mapFeedbackToDiagnostic(raw.id, raw.feedback)
    },

    // Cherry-picks feedback_grid.tache_2 from the recording's feedback.
    // Only meaningful for Tâche 2 sessions; returns zeroed moules otherwise.
    async getMoules(recordingId: number): Promise<MoulesBreakdown> {
      const raw = await request<RawRecording & { feedback?: RawFeedback }>(
        `/api/recordings/${recordingId}`,
      )
      if (!raw.feedback) {
        throw new ApiError(
          409,
          'Recording has no feedback yet — analysis may still be running.',
          raw,
        )
      }
      return mapFeedbackToMoules(raw.id, raw.feedback)
    },
  },
}

export type Api = typeof api
