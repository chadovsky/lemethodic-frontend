'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Lock } from 'lucide-react'
import BottomNav from '@/components/home/BottomNav'
import { api } from '@/lib/api'

const INK          = 'var(--text-primary)'
const INK_SOFT     = 'var(--text-secondary)'
const INK_MUTED    = 'var(--text-muted)'
const PEACH        = 'var(--fp-peach)'
const SAGE         = 'var(--fp-sage)'
const BUTTER       = 'var(--fp-butter)'
const LAVENDER     = 'var(--fp-lavender)'
const SKY          = 'var(--fp-sky)'
const BG           = 'var(--fp-canvas)'
const DISPLAY_FONT = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'

interface Scenario {
  /** URL slug — hyphen-cased, used in the /speaking/tache-2/<code> route. */
  code: string
  /** Backend scenario_code (tache2_scenarios.code column). Diverges from
   *  the URL slug for three of five rows due to historical seeding drift.
   *  The F-062.1 sanity check below validates this mapping at mount in
   *  dev builds. */
  backendCode: string
  title: string
  bg: string
  difficulty: string
  register: string
  descriptor: string
  locked?: boolean
  lockedReason?: string
}

const SCENARIOS: Scenario[] = [
  {
    code: 'agence-voyages',
    backendCode: 'agence_voyages',
    title: "L'agence de voyages",
    bg: SAGE,
    difficulty: 'A2-B1',
    register: 'Formel',
    descriptor: "You're at a travel agency planning a trip. Ask the right questions to choose the perfect destination.",
  },
  {
    code: 'ami-demenage',
    backendCode: 'ami_demenagement',
    title: "L'ami qui d\u00e9m\u00e9nage",
    bg: PEACH,
    difficulty: 'A2-B1',
    register: 'Informel',
    descriptor: 'Your friend is moving to another city. Ask the questions a good friend would ask.',
  },
  {
    code: 'bibliotheque',
    backendCode: 'bibliotheque',
    title: 'La biblioth\u00e8que',
    bg: BUTTER,
    difficulty: 'A2-B1',
    register: 'Semi-formel',
    descriptor: "You need a book at the library and want to know the rules. Ask the librarian.",
  },
  {
    code: 'collegue-quebecois',
    backendCode: 'nouveau_collegue_quebecois',
    title: 'Le nouveau coll\u00e8gue qu\u00e9b\u00e9cois',
    bg: LAVENDER,
    difficulty: 'B1-B2',
    register: 'Informel',
    descriptor: 'A new colleague from Quebec joined the team. Get to know them.',
    locked: true,
    lockedReason: "Complete La Méthode to unlock",
  },
  {
    code: 'agence-immobiliere',
    backendCode: 'agence_immobiliere_canada',
    title: "L'agence immobili\u00e8re au Canada",
    bg: SKY,
    difficulty: 'B1-B2',
    register: 'Formel',
    descriptor: "You're moving to Canada and looking for an apartment. Get all the info you need.",
    locked: true,
    lockedReason: "Complete La Méthode to unlock",
  },
]

const REGISTER_COLORS: Record<string, string> = {
  'Formel': '#1A1A1A22',
  'Informel': '#1A1A1A22',
  'Semi-formel': '#1A1A1A22',
}

export default function Tache2Picker() {
  const router = useRouter()

  // F-062.1 sanity check (dev builds only): verify every unlocked SCENARIOS
  // entry's backendCode actually exists + is active in the DB. Runs once on
  // mount. Purely diagnostic — errors are swallowed, no user-facing surface.
  //
  // Skips `locked: true` entries because backend /scenarios filters by the
  // ecole gate (F-053); for below-A2 users those rows won't be in the
  // response even though they exist in the DB. A "missing" warning for a
  // gated row would be a false positive.
  //
  // TODO(F-061.1): replace SCENARIOS with the live /scenarios response so
  // drift becomes impossible by construction; this check can then be
  // deleted.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    let cancelled = false
    ;(async () => {
      try {
        const resp = await api.sessions.listTache2Scenarios()
        if (cancelled) return
        const backendCodes = new Set(resp.scenarios.map((s) => s.code))
        const checkable = SCENARIOS.filter((s) => !s.locked)
        const missing = checkable.filter((s) => !backendCodes.has(s.backendCode))
        if (missing.length > 0) {
          // eslint-disable-next-line no-console
          console.warn(
            '[F-062.1] Tache2 scenario drift — the following picker entries reference backend codes that are missing or inactive:',
            missing.map((s) => ({ slug: s.code, backendCode: s.backendCode })),
            '\nActive backend codes returned:',
            Array.from(backendCodes),
          )
        }
      } catch {
        // Network / auth / endpoint unavailable — dev diagnostic only, stay
        // silent. Worst case the backendCode map ships drifted and the
        // first user click surfaces a 404 via the error overlay.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: BG, fontFamily: DISPLAY_FONT }}>
      <div style={{ maxWidth: 440, margin: '0 auto' }}>

        {/* Top bar */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            height: 56,
            backgroundColor: BG,
            borderBottom: '1px solid #1A1A1A0A',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            gap: 8,
          }}
        >
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: INK, display: 'flex', alignItems: 'center' }}
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>
          <h1
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 17,
              color: INK,
              margin: 0,
              flex: 1,
              textAlign: 'center',
              paddingRight: 32, // balance back button
            }}
          >
            T&acirc;che 2 &middot; Role-play
          </h1>
        </header>

        {/* Body */}
        <main style={{ padding: '28px 20px', paddingBottom: 96 }}>
          <h2
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 24,
              lineHeight: '32px',
              color: INK,
              margin: '0 0 6px',
            }}
          >
            Pick a scenario
          </h2>
          <p
            style={{
              fontWeight: 500,
              fontSize: 15,
              lineHeight: '24px',
              color: INK_SOFT,
              margin: '0 0 28px',
            }}
          >
            Each scenario is a different role-play conversation.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {SCENARIOS.map((s) => {
              const cardBg = s.locked ? `${s.bg}99` : s.bg
              const inner = (
                <div
                  style={{
                    backgroundColor: cardBg,
                    borderRadius: 22,
                    padding: '20px 20px',
                    minHeight: 120,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    cursor: s.locked ? 'not-allowed' : 'pointer',
                    transition: 'transform 0.12s',
                    opacity: s.locked ? 0.7 : 1,
                  }}
                  onPointerDown={(e) => { if (!s.locked) (e.currentTarget as HTMLDivElement).style.transform = 'scale(0.98)' }}
                  onPointerUp={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)' }}
                  onPointerLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)' }}
                >
                  {/* Difficulty + register badges top-right */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: DISPLAY_FONT,
                        fontWeight: 700,
                        fontSize: 10,
                        color: INK_MUTED,
                        backgroundColor: '#1A1A1A14',
                        padding: '2px 8px',
                        borderRadius: 100,
                      }}
                    >
                      {s.difficulty}
                    </span>
                    <span
                      style={{
                        fontFamily: DISPLAY_FONT,
                        fontWeight: 600,
                        fontSize: 10,
                        color: INK_SOFT,
                        backgroundColor: '#1A1A1A0D',
                        padding: '2px 8px',
                        borderRadius: 100,
                      }}
                    >
                      {s.register}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontFamily: DISPLAY_FONT,
                      fontWeight: 700,
                      fontSize: 17,
                      lineHeight: '23px',
                      color: INK,
                      margin: '0 80px 6px 0', // leave room for badges
                    }}
                  >
                    {s.title}
                  </h3>

                  {/* Descriptor */}
                  <p
                    style={{
                      fontWeight: 500,
                      fontSize: 13,
                      lineHeight: '19px',
                      color: INK_SOFT,
                      margin: 0,
                    }}
                  >
                    {s.descriptor}
                  </p>

                  {/* Lock overlay */}
                  {s.locked && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        borderRadius: 22,
                        backgroundColor: 'rgba(255,255,255,0.5)',
                        backdropFilter: 'blur(2px)',
                      }}
                    >
                      <Lock size={20} color={INK_MUTED} strokeWidth={1.75} />
                      <span
                        style={{
                          fontFamily: DISPLAY_FONT,
                          fontWeight: 600,
                          fontSize: 12,
                          color: INK_SOFT,
                          textAlign: 'center',
                          maxWidth: 180,
                        }}
                      >
                        {s.lockedReason}
                      </span>
                    </div>
                  )}
                </div>
              )

              if (s.locked) return <div key={s.code}>{inner}</div>
              return (
                <Link key={s.code} href={`/speaking/tache-2/${s.code}`} style={{ textDecoration: 'none' }}>
                  {inner}
                </Link>
              )
            })}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
