// P-220 — pastel background + illustration assignment per question_id.
// Cycles the existing 6-asset palette across the 11 BE questions as a
// placeholder. Per-question authored assets ship with P-220.z (Phase 1
// polish). The keys here MUST match the BE question IDs exactly; unknown
// IDs fall back to a neutral default so a BE addition doesn't crash the
// flow.

export interface QuestionMeta {
  bg: string
  illustration: string
  illustrationAlt: string
}

const FALLBACK: QuestionMeta = {
  bg: '#FFD8C2',
  illustration: '/illustration-language.png',
  illustrationAlt: 'FluentPath illustration',
}

// Pastel palette pulled from the legacy onboarding step components. The
// 11 question IDs cycle through these in order; the cycle restarts at q7.
const META: Record<string, QuestionMeta> = {
  q1_current_level: {
    bg: '#FFD8C2', // peach
    illustration: '/illustration-level.png',
    illustrationAlt: 'Stepping-stones illustration',
  },
  q2_target_level: {
    bg: '#D4E4D0', // sage
    illustration: '/illustration-score.png',
    illustrationAlt: 'Target with arrow illustration',
  },
  q3_exam_date: {
    bg: '#FFF0C2', // butter
    illustration: '/illustration-date.png',
    illustrationAlt: 'Calendar illustration',
  },
  q4_motivation: {
    bg: '#E0D4F0', // lavender
    illustration: '/illustration-goal.png',
    illustrationAlt: 'Passport illustration',
  },
  q5_strongest_skill: {
    bg: '#CFE4F5', // sky
    illustration: '/illustration-language.png',
    illustrationAlt: 'Speech-bubble illustration',
  },
  q6_weakest_skill: {
    bg: '#F5D6D6', // blush
    illustration: '/illustration-level.png',
    illustrationAlt: 'Stepping-stones illustration',
  },
  q7_hours_per_week: {
    bg: '#FFD8C2', // peach (cycle restart)
    illustration: '/illustration-date.png',
    illustrationAlt: 'Calendar illustration',
  },
  q8_topics_tested_on: {
    bg: '#D4E4D0',
    illustration: '/illustration-goal.png',
    illustrationAlt: 'Passport illustration',
  },
  q9_native_language: {
    bg: '#FFF0C2',
    illustration: '/illustration-language.png',
    illustrationAlt: 'Speech-bubble illustration',
  },
  q9_native_language_other: {
    // Synthetic follow-up screen for q9='other'. Inherits q9's palette so the
    // visual transition is seamless.
    bg: '#FFF0C2',
    illustration: '/illustration-language.png',
    illustrationAlt: 'Speech-bubble illustration',
  },
  q10_prior_exam_history: {
    bg: '#E0D4F0',
    illustration: '/illustration-score.png',
    illustrationAlt: 'Target with arrow illustration',
  },
  q11_feedback_mode: {
    bg: '#CFE4F5',
    illustration: '/illustration-goal.png',
    illustrationAlt: 'Passport illustration',
  },
}

export function getQuestionMeta(questionId: string): QuestionMeta {
  return META[questionId] ?? FALLBACK
}

export const ECOLE_REVEAL_BG = '#F5D6D6'
export const ECOLE_REVEAL_ILLUSTRATION = '/illustration-ecole.png'
