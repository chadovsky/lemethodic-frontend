// P-220 — types mirroring the BE OnboardingQuestionsResponse (GET
// /onboarding/questions) and OnboardingSubmitRequest/Response (POST
// /onboarding/submit). Snake_case here matches the BE pydantic schema since
// these payloads flow through unchanged — no camelCase mapper.

export interface I18n {
  en: string
  fr: string
}

export interface OnboardingQuestionOption {
  value: string
  label: I18n
}

export type OnboardingQuestionType =
  | 'single_select'
  | 'multi_select'
  | 'date_input'
  | 'text_input'

export interface OnboardingQuestion {
  id: string
  order: number
  type: OnboardingQuestionType
  required: boolean
  // Free-form per BE; the FE keys off specific shapes:
  //   q3 carries { no_exam_toggle_label: I18n, min_offset_days, max_offset_days }
  //   q8 carries { skip_when: 'q3_no_exam_scheduled' }
  //   q9 carries { other_freetext_field: 'q9_native_language_other' }
  skip_condition: Record<string, unknown> | null
  heading: I18n
  helper: I18n
  options: OnboardingQuestionOption[] | null
}

export interface OnboardingQuestionsResponse {
  questions: OnboardingQuestion[]
}

// ── Submit request / response ────────────────────────────────────────────────

// All possible payload keys per OnboardingSubmitRequest. Optional fields use
// `?` (omitted when not set) or null per BE schema (anyOf string|null).
// q3 is split: q3_exam_date is the date or null, q3_no_exam_scheduled is the
// boolean toggle (default false). interface_language was added in BE follow-up
// to P-220 — optional, en/fr only.
// F-327 adds q0_target_exam + q0_specific_intended_exam + q0_accept_fallback
// for the another_exam waitlist-moat / proxy-continuation flow.
export interface OnboardingSubmitRequest {
  q0_target_exam?: string | null
  q0_specific_intended_exam?: string | null
  q0_accept_fallback?: boolean
  q1_current_level: 'a2' | 'b1' | 'b2' | 'c1' | 'not_sure'
  q2_target_level: 'b1' | 'b2' | 'c1' | 'c2' | 'not_sure'
  q3_exam_date?: string | null
  q3_no_exam_scheduled?: boolean
  q4_motivation?:
    | 'immigration'
    | 'professional'
    | 'studies'
    | 'personal'
    | 'prefer_not_to_say'
    | null
  q5_strongest_skill?:
    | 'speaking'
    | 'listening'
    | 'reading'
    | 'writing'
    | 'all_equally_weak'
    | null
  q6_weakest_skill?:
    | 'speaking_under_pressure'
    | 'listening_fast'
    | 'reading_complex'
    | 'writing_essays'
    | 'grammar_accuracy'
    | 'vocabulary_depth'
    | null
  q7_hours_per_week: 'less_than_2' | '2_to_5' | '5_to_10' | 'more_than_10'
  q8_topics_tested_on?: Array<
    | 'vie_quotidienne'
    | 'societe'
    | 'education'
    | 'travail'
    | 'loisirs_voyages'
    | 'sante'
    | 'environnement'
    | 'culture_medias'
  >
  q9_native_language:
    | 'english'
    | 'arabic'
    | 'spanish'
    | 'portuguese'
    | 'mandarin'
    | 'hindi'
    | 'russian'
    | 'german'
    | 'italian'
    | 'other'
  q9_native_language_other?: string | null
  q10_prior_exam_history: 'never' | 'recent_6mo' | 'recent_12mo' | 'older'
  q11_feedback_mode: 'calm' | 'method'
  interface_language?: 'en' | 'fr' | null
}

export type Persona = 'foundation' | 'acceleration' | 'cram'

export interface CapacityWarning {
  weeks_to_exam: number
  hours_per_week_selected: OnboardingSubmitRequest['q7_hours_per_week']
  recommended_minimum_hours: OnboardingSubmitRequest['q7_hours_per_week']
}

export interface OnboardingSubmitResponse {
  path_slug: string | null
  persona: Persona | null
  redirect_to_diagnostic: boolean
  waitlist: boolean
  capacity_warning?: CapacityWarning | null
  user_path_enrollment_id?: number | null
  waitlist_reason?: string | null
  fallback_path_offered?: string | null
}

// ── Skip-condition helpers ───────────────────────────────────────────────────

// q8 hides when q3 was answered with the no-exam toggle. BE encodes this as
// skip_condition.skip_when === 'q3_no_exam_scheduled'.
export function shouldSkipQuestion(
  question: OnboardingQuestion,
  answers: Record<string, unknown>,
): boolean {
  const cond = question.skip_condition
  if (!cond) return false
  if (typeof cond.skip_when === 'string' && cond.skip_when === 'q3_no_exam_scheduled') {
    return answers.q3_exam_date === null
  }
  return false
}

// q3 carries its toggle copy + min/max offsets in skip_condition. Pull them
// out with safe fallbacks so a malformed BE payload doesn't crash the screen.
export interface DateInputMeta {
  noExamToggleLabel: I18n
  minOffsetDays: number
  maxOffsetDays: number
}
export function readDateInputMeta(question: OnboardingQuestion): DateInputMeta {
  const cond = question.skip_condition ?? {}
  const label = cond.no_exam_toggle_label as I18n | undefined
  const min = typeof cond.min_offset_days === 'number' ? cond.min_offset_days : 0
  const max = typeof cond.max_offset_days === 'number' ? cond.max_offset_days : 540
  return {
    noExamToggleLabel: label ?? { en: 'No exam scheduled', fr: 'Aucun examen prévu' },
    minOffsetDays: min,
    maxOffsetDays: max,
  }
}

// q9 carries the freetext follow-up field name. When the user picks 'other',
// the flow inserts a synthetic OtherFreetextScreen step that writes into this
// key.
export function readOtherFreetextField(question: OnboardingQuestion): string | null {
  const cond = question.skip_condition
  if (cond && typeof cond.other_freetext_field === 'string') {
    return cond.other_freetext_field
  }
  return null
}
