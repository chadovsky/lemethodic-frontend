// LeMethodic localStorage key constants
// Centralized to prevent drift between lib/api.ts and lib/auth.ts

export const TOKEN_KEY = 'lemethodic_token'
export const USER_KEY = 'lemethodic_user'
export const ONBOARDING_KEY = 'lemethodic_onboarding'
export const SUBMIT_RESPONSE_KEY = 'lemethodic_submit_response'

// F-322 — Le Vocabulaire practice surface.
// VOCAB_PRACTICE_STATE_KEY: per-chunk grade history. V2 SRS reads this.
// VOCAB_PRACTICE_PREF_KEY:  session-config preferences (direction).
export const VOCAB_PRACTICE_STATE_KEY = 'lemethodic_vocab_practice_state'
export const VOCAB_PRACTICE_PREF_KEY = 'lemethodic_vocab_practice_pref'

// F-BUGS-001-FE-D — per-conversation Tâche 2 candidate-brief language pref.
// Keyed by conversation_id so re-entering the same session restores the
// user's prior FR/EN choice; default is derived from user.targetLevel
// (B1+ → fr, A1/A2 → en) when no saved value exists.
export const BRIEF_LANG_KEY_PREFIX = 'lemethodic_brief_lang_'
export const briefLangKey = (conversationId: string) =>
  `${BRIEF_LANG_KEY_PREFIX}${conversationId}`
