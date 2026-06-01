// F-337 — CLB mapping utilities. Pure functions, no side effects.
// Source for CRS table: IRCC Express Entry, principal applicant, single language skill.

export type SkillKey = 'speaking' | 'listening' | 'reading' | 'writing'

export interface SkillRow {
  key: SkillKey
  clb: number | null
  crs: number | null
}

export type ClbPageState = 'loading' | 'error' | 'empty' | 'partial' | 'full'

/**
 * IRCC CLB to CRS language points (single skill, principal applicant).
 * Table verified in F-337 dispatch:
 *   CLB 4-: 0 | CLB 5-6: 1 | CLB 7-8: 5 | CLB 9+: 6
 */
export function clbToCrs(clb: number): number {
  if (clb >= 9) return 6
  if (clb >= 7) return 5
  if (clb >= 5) return 1
  return 0
}

/**
 * Parse CLB level from backend string. Backend may emit "7", "CLB 8", etc.
 * Returns null for missing, unparseable, or zero values.
 */
export function parseClb(raw: string | null | undefined): number | null {
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null
  const n = parseInt(digits, 10)
  return isNaN(n) || n === 0 ? null : n
}

/**
 * Build the 4-skill row array. Only speaking is assessed via recordings;
 * listening/reading/writing are always null until TCF Canada results land.
 */
export function deriveSkills(speakingClbRaw: string | null | undefined): SkillRow[] {
  const speakingClb = parseClb(speakingClbRaw)
  return [
    {
      key: 'speaking',
      clb: speakingClb,
      crs: speakingClb !== null ? clbToCrs(speakingClb) : null,
    },
    { key: 'listening', clb: null, crs: null },
    { key: 'reading', clb: null, crs: null },
    { key: 'writing', clb: null, crs: null },
  ]
}

export function derivePageState(skills: SkillRow[], hasRecordings: boolean): ClbPageState {
  const assessed = skills.filter((s) => s.clb !== null).length
  if (!hasRecordings || assessed === 0) return 'empty'
  if (assessed === 4) return 'full'
  return 'partial'
}

export const SKILL_LABELS: Record<SkillKey, { fr: string; en: string }> = {
  speaking:  { fr: 'Expression orale',    en: 'Speaking'  },
  listening: { fr: 'Compréhension orale', en: 'Listening' },
  reading:   { fr: 'Compréhension écrite', en: 'Reading'  },
  writing:   { fr: 'Expression écrite',   en: 'Writing'   },
}
