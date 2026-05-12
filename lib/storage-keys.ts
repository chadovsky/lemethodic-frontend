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
