/**
 * F-432 — Leçon manifest: single source of truth for La Méthode.
 *
 * To unlock a leçon:
 *   1. Create content/iles/<themeSlug>/<level>.mdx
 *   2. Set status to 'available' here
 *   3. Update the title if needed
 *
 * La Méthode reads this file directly — no BE call, no build step.
 */

export type LeconSection = 'fondations' | 'approfondissement'
export type LeconStatus  = 'available' | 'bientot'

export interface LeconEntry {
  /** Display number (1–27). */
  number: number
  /** Card title shown to learners. */
  title: string
  /**
   * Slug passed to /ile/[theme] when status === 'available'.
   * Must match an existing content/iles/<themeSlug>/ folder.
   * Leave '' for bientôt placeholders.
   */
  themeSlug: string
  section: LeconSection
  status: LeconStatus
}

export const LECONS: LeconEntry[] = [

  // ── Fondations (leçons 1–16) ─────────────────────────────────────────────

  {
    number: 1,
    title: 'La famille',
    themeSlug: '_sample',
    section: 'fondations',
    status: 'available',
  },
  {
    number: 2,
    title: 'Au café',
    themeSlug: 'cafe',
    section: 'fondations',
    status: 'available',
  },
  { number: 3,  title: 'Leçon 3',  themeSlug: '', section: 'fondations', status: 'bientot' },
  { number: 4,  title: 'Leçon 4',  themeSlug: '', section: 'fondations', status: 'bientot' },
  { number: 5,  title: 'Leçon 5',  themeSlug: '', section: 'fondations', status: 'bientot' },
  { number: 6,  title: 'Leçon 6',  themeSlug: '', section: 'fondations', status: 'bientot' },
  { number: 7,  title: 'Leçon 7',  themeSlug: '', section: 'fondations', status: 'bientot' },
  { number: 8,  title: 'Leçon 8',  themeSlug: '', section: 'fondations', status: 'bientot' },
  { number: 9,  title: 'Leçon 9',  themeSlug: '', section: 'fondations', status: 'bientot' },
  { number: 10, title: 'Leçon 10', themeSlug: '', section: 'fondations', status: 'bientot' },
  { number: 11, title: 'Leçon 11', themeSlug: '', section: 'fondations', status: 'bientot' },
  { number: 12, title: 'Leçon 12', themeSlug: '', section: 'fondations', status: 'bientot' },
  { number: 13, title: 'Leçon 13', themeSlug: '', section: 'fondations', status: 'bientot' },
  { number: 14, title: 'Leçon 14', themeSlug: '', section: 'fondations', status: 'bientot' },
  { number: 15, title: 'Leçon 15', themeSlug: '', section: 'fondations', status: 'bientot' },
  { number: 16, title: 'Leçon 16', themeSlug: '', section: 'fondations', status: 'bientot' },

  // ── Approfondissement (leçons 17–27) ─────────────────────────────────────

  { number: 17, title: 'Leçon 17', themeSlug: '', section: 'approfondissement', status: 'bientot' },
  { number: 18, title: 'Leçon 18', themeSlug: '', section: 'approfondissement', status: 'bientot' },
  { number: 19, title: 'Leçon 19', themeSlug: '', section: 'approfondissement', status: 'bientot' },
  { number: 20, title: 'Leçon 20', themeSlug: '', section: 'approfondissement', status: 'bientot' },
  { number: 21, title: 'Leçon 21', themeSlug: '', section: 'approfondissement', status: 'bientot' },
  { number: 22, title: 'Leçon 22', themeSlug: '', section: 'approfondissement', status: 'bientot' },
  { number: 23, title: 'Leçon 23', themeSlug: '', section: 'approfondissement', status: 'bientot' },
  { number: 24, title: 'Leçon 24', themeSlug: '', section: 'approfondissement', status: 'bientot' },
  { number: 25, title: 'Leçon 25', themeSlug: '', section: 'approfondissement', status: 'bientot' },
  { number: 26, title: 'Leçon 26', themeSlug: '', section: 'approfondissement', status: 'bientot' },
  { number: 27, title: 'Leçon 27', themeSlug: '', section: 'approfondissement', status: 'bientot' },
]
