'use client'

// P-222 — waitlist screen. Renders post-signup when /onboarding/submit
// returned waitlist=true. Reads the captured response from
// useSubmitResponseStore. If the store is empty (user navigated here
// directly without going through signup), redirects to /ecole.
//
// Per BE Q2 (2026-05-03): fallback_path_offered is informational only — no
// "accept fallback" endpoint exists today. We render it as text, no CTA.
// Per BE Q3: waitlist_reason is an internal slug (only "path_not_active"
// today). FE owns the localized copy; we map slugs → authored strings.

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth'
import { useSubmitResponseStore } from '@/lib/submitResponse'
import { useInterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'
import {
  CTAButton,
  INK,
  INK_SOFT,
  INK_MUTED,
  PAPER,
  DISPLAY_FONT,
} from './OnboardingScreen'

type Lang = 'en' | 'fr'

const BG = '#F5D6D6' // --fp-blush — same family as EcoleReveal but for the
// "your path isn't ready" pause moment rather than the celebration moment.

// ── Slug → display ───────────────────────────────────────────────────────────

const LEVEL_DISPLAY: Record<string, string> = {
  a2: 'A2',
  b1: 'B1',
  b2: 'B2',
  c1: 'C1',
  c2: 'C2',
}

const PATH_DISPLAY: Record<string, string> = {
  a2_to_b1: 'A2 → B1',
  b1_to_b2: 'B1 → B2',
  b2_to_c1: 'B2 → C1',
  c1_to_c2: 'C1 → C2',
}

// Infer the path the user would need based on their self-reported level.
// Only fires for waitlist-bound levels (a2, b2, c1). c2 is a mastery edge
// case with no upward path; we render generically.
function inferNeededPath(currentLevel: string | null): string | null {
  if (!currentLevel) return null
  switch (currentLevel) {
    case 'a2': return 'a2_to_b1'
    case 'b2': return 'b2_to_c1'
    case 'c1': return 'c1_to_c2'
    default: return null  // b1 and not_sure don't waitlist; c2 has no upward path
  }
}

// ── Copy ────────────────────────────────────────────────────────────────────

const COPY = {
  en: {
    heading: "We haven't built your path yet.",
    body1: (level: string | null, neededPath: string | null) => {
      const levelLabel = level ? LEVEL_DISPLAY[level] ?? level.toUpperCase() : null
      const pathLabel = neededPath ? PATH_DISPLAY[neededPath] ?? neededPath : null
      if (levelLabel && pathLabel) {
        return `Based on your level (${levelLabel}), you'd need the ${pathLabel} path. We're focused on B1 → B2 for launch.`
      }
      if (levelLabel) {
        return `Based on your level (${levelLabel}), the path you need isn't part of the launch scope. We're focused on B1 → B2 for now.`
      }
      return "The path you need isn't part of the launch scope. We're focused on B1 → B2 for now."
    },
    body2Fallback: (fallbackSlug: string) => {
      const label = PATH_DISPLAY[fallbackSlug] ?? fallbackSlug
      return `While you wait, you can preview the ${label} starter content from your dashboard.`
    },
    body3: "We'll email you when your path is ready.",
    cta: "OK, I'll wait",
    signOut: 'Sign out',
  },
  fr: {
    heading: "Nous n'avons pas encore construit votre parcours.",
    body1: (level: string | null, neededPath: string | null) => {
      const levelLabel = level ? LEVEL_DISPLAY[level] ?? level.toUpperCase() : null
      const pathLabel = neededPath ? PATH_DISPLAY[neededPath] ?? neededPath : null
      if (levelLabel && pathLabel) {
        return `Selon votre niveau (${levelLabel}), vous avez besoin du parcours ${pathLabel}. Nous nous concentrons sur B1 → B2 pour le lancement.`
      }
      if (levelLabel) {
        return `Selon votre niveau (${levelLabel}), le parcours dont vous avez besoin n'est pas dans le périmètre du lancement. Nous nous concentrons sur B1 → B2 pour l'instant.`
      }
      return "Le parcours dont vous avez besoin n'est pas dans le périmètre du lancement. Nous nous concentrons sur B1 → B2 pour l'instant."
    },
    body2Fallback: (fallbackSlug: string) => {
      const label = PATH_DISPLAY[fallbackSlug] ?? fallbackSlug
      return `En attendant, vous pouvez prévisualiser le contenu ${label} de départ depuis votre tableau de bord.`
    },
    body3: "Nous vous écrirons à l'ouverture de votre parcours.",
    cta: "D'accord, j'attends",
    signOut: 'Se déconnecter',
  },
} as const satisfies Record<Lang, unknown>

// ── Component ───────────────────────────────────────────────────────────────

export default function WaitlistScreen() {
  const router = useRouter()
  const language = useInterfaceLanguage()
  const response = useSubmitResponseStore((s) => s.response)
  const currentLevel = useSubmitResponseStore((s) => s.currentLevelAtSubmit)
  const clear = useSubmitResponseStore((s) => s.clear)

  // If someone navigates directly to /onboarding/waitlist without a captured
  // submit response, send them to /ecole — they shouldn't see this screen.
  useEffect(() => {
    if (!response || !response.waitlist) {
      router.replace('/ecole')
    }
  }, [response, router])

  // Loader frame while the redirect resolves on direct navigation. The
  // ProtectedRoute wrapper above already handles unauth flicker; this
  // handles the "authed but no waitlist payload" case.
  if (!response || !response.waitlist) {
    return <div style={{ minHeight: '100dvh', backgroundColor: BG }} />
  }

  const copy = COPY[language]
  const neededPath = inferNeededPath(currentLevel)
  const fallback = response.fallback_path_offered ?? null

  function handleAcknowledge() {
    clear()
    router.push('/')
  }

  function handleSignOut() {
    // F-222 — canonical sign-out via lib/auth.signOut helper. Clears
    // submit-response + onboarding + auth stores in one shot.
    signOut(router)
  }

  return (
    <main
      className="min-h-screen w-full flex flex-col items-center"
      style={{ backgroundColor: BG }}
    >
      <div className="w-full max-w-[440px] flex flex-col flex-1 min-h-screen px-5 pb-6">
        {/* Top spacer where progress dots would live on questionnaire screens */}
        <div style={{ minHeight: 32 }} className="pt-4" />

        {/* Heading */}
        <h1
          className="text-balance mt-12"
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 800,
            fontSize: 32,
            lineHeight: '40px',
            letterSpacing: '-0.01em',
            color: INK,
          }}
        >
          {copy.heading}
        </h1>

        {/* Body block (paper card for readability against pastel) */}
        <div
          className="mt-8"
          style={{
            backgroundColor: PAPER,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: 20,
            padding: '20px 22px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <p
            className="text-pretty"
            style={{
              fontWeight: 500,
              fontSize: 15,
              lineHeight: 1.6,
              color: INK,
            }}
          >
            {copy.body1(currentLevel, neededPath)}
          </p>

          {fallback && (
            <p
              className="text-pretty"
              style={{
                fontWeight: 500,
                fontSize: 15,
                lineHeight: 1.6,
                color: INK_SOFT,
              }}
            >
              {copy.body2Fallback(fallback)}
            </p>
          )}

          <p
            className="text-pretty"
            style={{
              fontWeight: 500,
              fontSize: 15,
              lineHeight: 1.6,
              color: INK_SOFT,
            }}
          >
            {copy.body3}
          </p>
        </div>

        <div className="flex-1" />

        {/* Primary CTA */}
        <CTAButton
          label={copy.cta}
          enabled={true}
          onClick={handleAcknowledge}
        />

        {/* Footer sign-out link */}
        <div className="flex justify-center" style={{ marginTop: 4 }}>
          <button
            type="button"
            onClick={handleSignOut}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: DISPLAY_FONT,
              fontWeight: 600,
              fontSize: 13,
              color: INK_MUTED,
              padding: '8px 12px',
              outline: 'none',
            }}
          >
            {copy.signOut}
          </button>
        </div>
      </div>
    </main>
  )
}
