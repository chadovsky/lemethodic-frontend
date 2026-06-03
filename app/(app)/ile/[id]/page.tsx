import type { Metadata } from 'next'
import type { ComponentType } from 'react'

export const metadata: Metadata = {
  title: 'Île | Le Méthodic',
}

type Params = Promise<{ id: string }>

interface IleMeta {
  theme: string
  level: string
  display_title: string
  estimated_minutes?: number
  persona_priority?: string[]
  image_set?: string
  maitre_audio?: { intro: string; close: string }
  actes_de_parole?: string[]
}

// BE SEAM: Replace hardcoded 'b1' with level resolved from user's target_profile (F-410).
// In Round 2, call getTargetProfile(userId).current_level and pass it here.
const CURRENT_LEVEL = 'b1'

async function loadIle(theme: string): Promise<{
  Content: ComponentType
  meta: IleMeta | undefined
} | null> {
  try {
    const mod = (await import(`@/content/iles/${theme}/${CURRENT_LEVEL}.mdx`)) as {
      default: ComponentType
      meta?: IleMeta
    }
    return { Content: mod.default, meta: mod.meta }
  } catch {
    return null
  }
}

export default async function IlePage({ params }: { params: Params }) {
  const { id } = await params
  const ile = await loadIle(id)

  if (!ile) {
    return (
      <main
        lang="fr"
        style={{
          maxWidth: 820,
          margin: '0 auto',
          padding: 'clamp(32px, 5vw, 64px) clamp(20px, 4vw, 40px)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--f-ui)',
            fontSize: 14,
            color: 'var(--ink-soft)',
            margin: 0,
          }}
        >
          Cette ile n&apos;est pas encore disponible.
        </p>
      </main>
    )
  }

  const { Content, meta } = ile

  return (
    <main
      lang="fr"
      style={{
        maxWidth: 820,
        margin: '0 auto',
        padding: 'clamp(32px, 5vw, 64px) clamp(20px, 4vw, 40px)',
      }}
    >
      {/* Le Maitre intro placeholder */}
      {/* BE SEAM: Replace with <MaitreAudio src={meta?.maitre_audio?.intro} /> in Round 2 (F-417).
          Audio is the island intro recorded via ElevenLabs founder-voice clone. */}
      <div
        style={{
          background: 'var(--paper-tint)',
          border: '1px solid var(--rule)',
          borderRadius: 'var(--r-lg)',
          padding: '20px 24px',
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--r-pill)',
            background: 'var(--dominant)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--f-display)',
              fontSize: 18,
              color: 'var(--paper)',
              lineHeight: 1,
            }}
          >
            M
          </span>
        </div>
        <div>
          <p
            style={{
              fontFamily: 'var(--f-ui)',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--dominant)',
              margin: '0 0 2px',
            }}
          >
            Le Maitre
          </p>
          <p
            style={{
              fontFamily: 'var(--f-ui)',
              fontSize: 13,
              color: 'var(--ink-soft)',
              margin: 0,
            }}
          >
            Bienvenue sur cette ile. Ecoutez le dialogue, puis repondez aux questions.
          </p>
        </div>
      </div>

      {/* Island title */}
      <h1
        style={{
          fontFamily: 'var(--f-display)',
          fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
          fontWeight: 400,
          color: 'var(--ink)',
          margin: '0 0 8px',
          letterSpacing: '-0.01em',
        }}
      >
        {meta?.display_title ?? `Ile ${id}`}
      </h1>

      {meta?.estimated_minutes && (
        <p
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 11,
            color: 'var(--ink-faint)',
            margin: '0 0 40px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {meta.estimated_minutes} min
        </p>
      )}

      {/* MDX content: all molds for this ile */}
      <Content />

      {/* Le Maitre close placeholder */}
      {/* BE SEAM: Gate this reveal until all molds are marked complete in user_progress (F-417, Round 2).
          In Round 2, check getIleProgress(userId, theme, level).allComplete before showing. */}
      <div
        style={{
          background: 'var(--paper-tint)',
          border: '1px solid var(--rule)',
          borderRadius: 'var(--r-lg)',
          padding: '24px',
          marginTop: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--r-pill)',
              background: 'var(--dominant)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--f-display)',
                fontSize: 18,
                color: 'var(--paper)',
                lineHeight: 1,
              }}
            >
              M
            </span>
          </div>
          <p
            style={{
              fontFamily: 'var(--f-ui)',
              fontSize: 13,
              color: 'var(--ink-soft)',
              margin: 0,
            }}
          >
            Vous avez termine le dialogue. Continuez avec les autres activites de cette ile.
          </p>
        </div>
      </div>
    </main>
  )
}
