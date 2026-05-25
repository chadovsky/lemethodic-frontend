'use client'

// F-202 — L'École intro. Post-signup methodology surface (the moat made
// visible). 5 sections: Frame, La Méthode en Couches, How it works,
// Le parcours, CTA.
//
// Routing: signup post-register pushes here on first auth (not /ecole).
// Always reachable as a deep-linkable destination; "À propos de L'École"
// header link from /ecole is filed as F-202.x.
//
// Copy is locked verbatim from F-202 spec — khâgneux-reviewed, not to be
// paraphrased. The 5-couche model expanded from 4 to 5 (Couche 5 — La Voix)
// per methodology shift locked this session.

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useInterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'
import { useInViewOnce } from '@/lib/motion'
import type { ReactNode } from 'react'

const ED_BG = 'var(--ed-bg)'
const ED_PAPER = 'var(--ed-paper)'
const ED_FG = 'var(--ed-fg)'
const ED_MUTED = 'var(--ed-muted)'
const ED_RULE = 'var(--ed-rule)'
const ED_ACCENT = 'var(--ed-accent)'
const SANS = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'
const SERIF = 'var(--font-source-serif), Georgia, "Times New Roman", serif'

// ── Locked methodology copy ────────────────────────────────────────────────

const FRAME = {
  en: {
    h1: "Welcome to La Méthode",
    subhead: '27 lessons. Built to break the B1 plateau. Made for English speakers.',
  },
  fr: {
    h1: "Bienvenue à La Méthode",
    subhead: '27 leçons. Pour franchir le plateau B1. Pensé pour les anglophones.',
  },
} as const

const METHODE = {
  en: {
    title: 'La Méthode en Couches',
    intro:
      "Five layers compose your French. When you hit a wall, it's rarely everywhere. It's in one specific layer. La Méthode finds it, and we treat it directly.",
    couches: [
      {
        n: 'Couche 1',
        name: 'Le Propos',
        label: 'Range',
        body: 'Ideas, arguments, examples. Content, before form.',
      },
      {
        n: 'Couche 2',
        name: 'Le Plan',
        label: 'Coherence',
        body: "The architecture of discourse. French speakers nuance, contrast, synthesize. They don't think in straight lines. Without this structure, your French sounds translated, even when every word is correct.",
      },
      {
        n: 'Couche 3',
        name: 'La Construction',
        label: 'Accuracy',
        body: 'Sentence architecture. Seven laws that make a French sentence sound French. Pour your ideas into the right mold, and the sentences sound right without effort.',
      },
      {
        n: 'Couche 4',
        name: 'Les Pièges Anglais',
        label: 'Fluency',
        body: 'English habits that slip through unnoticed. False friends, calques, preposition traps, the disappearing *ne*. La Méthode catches them, one by one.',
      },
      {
        n: 'Couche 5',
        name: 'La Musique',
        label: 'Voice',
        body: "How it sounds. The vowels English doesn't have, the liaisons that create flow, the rhythm that separates native from non-native.",
      },
    ],
    closer:
      "Most platforms tell you to practice more. La Méthode identifies the layer that's dragging. Treats that one, specifically.",
  },
  fr: {
    title: 'La Méthode en Couches',
    intro:
      "Cinq couches composent votre français. Quand vous bloquez, c'est rarement partout. C'est dans une couche précise. La Méthode l'identifie, et on la traite.",
    couches: [
      {
        n: 'Couche 1',
        name: 'Le Propos',
        label: 'Étendue',
        body: 'Les idées, les arguments, les exemples. Le contenu, avant la forme.',
      },
      {
        n: 'Couche 2',
        name: 'Le Plan',
        label: 'Cohérence',
        body: "L'architecture du discours. Les Français nuancent, opposent, synthétisent. Ils ne pensent pas en lignes droites. Sans cette structure, votre français a des allures de traduction, même quand chaque mot est correct.",
      },
      {
        n: 'Couche 3',
        name: 'La Construction',
        label: 'Correction',
        body: "L'architecture de la phrase. Sept lois qui font qu'une phrase sonne française. Coulez vos idées dans le bon moule, et vos phrases sonnent françaises sans effort.",
      },
      {
        n: 'Couche 4',
        name: 'Les Pièges Anglais',
        label: 'Aisance',
        body: 'Les habitudes anglaises qui passent sans permission. Faux-amis, calques, prépositions piégées, *ne* qui disparaît. La Méthode les détecte une par une.',
      },
      {
        n: 'Couche 5',
        name: 'La Musique',
        label: 'Voix',
        body: "Comment ça sonne. Les voyelles que l'anglais n'a pas, les liaisons qui font la fluidité, le rythme qui sépare le natif du non-natif.",
      },
    ],
    closer:
      'La plupart des plateformes vous disent de pratiquer plus. La Méthode identifie la couche qui freine. Et traite celle-là, précisément.',
  },
} as const

const HOW = {
  en: {
    title: 'How it works',
    intro:
      'Most exam prep platforms give everyone the same 200 lessons and let you sort it out. La Méthode does something different.',
    blocks: [
      {
        head: 'You record. The diagnostic listens.',
        body: 'Every speaking task you submit is run through the 5-couche analysis. The AI scores each layer and identifies your bottleneck (*Le Goulet*), the layer dragging your overall performance down.',
      },
      {
        head: 'The lessons target that bottleneck.',
        body: "Your path isn't generic. It pulls the lessons that work the layer where you're stuck. Once the layer is unblocked, you re-record; the diagnostic re-scores and identifies the next bottleneck.",
      },
      {
        head: 'You progress one Goulet at a time.',
        body: "Not \"practice more.\" Not \"try harder.\" Specific, layered work on the layer that needs it. Until you're solid across all five.",
      },
    ],
  },
  fr: {
    title: 'Comment ça marche',
    intro:
      'La plupart des plateformes vous donnent les 200 mêmes leçons et vous laissent vous débrouiller. La Méthode procède autrement.',
    blocks: [
      {
        head: 'Vous enregistrez. Le diagnostic écoute.',
        body: "Chaque tâche orale que vous soumettez est passée au crible des cinq couches. L'IA évalue chaque couche et identifie votre goulet (*Le Goulet*), la couche qui freine l'ensemble.",
      },
      {
        head: 'Les leçons travaillent ce goulet.',
        body: "Votre parcours n'est pas générique. Il puise dans les leçons qui agissent sur la couche où vous bloquez. Une fois la couche débloquée, vous réenregistrez ; le diagnostic réévalue et identifie le goulet suivant.",
      },
      {
        head: 'Vous progressez un goulet à la fois.',
        body: "Pas « pratiquez plus. » Pas « essayez plus fort. » Un travail précis et stratifié sur la couche qui en a besoin. Jusqu'à ce que les cinq soient solides.",
      },
    ],
  },
} as const

const PARCOURS = {
  en: {
    title: 'The curriculum',
    fondations: {
      name: 'Fondations',
      range: 'Lessons 1–16',
      body: "The frames you'll use every time you speak. Sentence patterns, discourse rhythm, the reflexes that separate translated French from real French.",
    },
    approfondissement: {
      name: 'Approfondissement',
      range: 'Lessons 17–27',
      body: 'Where the polish happens. Nuance, register, voice control. The work that takes you from B1 confidence to B2 mastery.',
    },
    segmentsTitle: 'Each lesson follows the same five segments:',
    segments: [
      { name: 'Le Piège', body: "the trap. The English-speaker mistake we're correcting today." },
      { name: 'La Règle', body: 'the rule. The French structure that fixes it.' },
      { name: 'Le Drill', body: 'practice. Pattern repetition until automatic.' },
      { name: 'La Situation', body: 'application. You speak; the AI examiner responds and corrects.' },
      { name: 'Le Débrief', body: "the review. What you got right, what you missed, what's next." },
    ],
  },
  fr: {
    title: 'Le parcours',
    fondations: {
      name: 'Fondations',
      range: 'Leçons 1 à 16',
      body: 'Les structures que vous utiliserez à chaque fois que vous parlerez. Modèles de phrases, rythme du discours, les réflexes qui séparent le français traduit du vrai français.',
    },
    approfondissement: {
      name: 'Approfondissement',
      range: 'Leçons 17 à 27',
      body: "Là où ça s'affine. Nuance, registre, contrôle de la voix. Le travail qui vous fait passer de la confiance B1 à la maîtrise B2.",
    },
    segmentsTitle: 'Chaque leçon suit cinq segments :',
    segments: [
      { name: 'Le Piège', body: "l'erreur typique de l'anglophone qu'on corrige aujourd'hui." },
      { name: 'La Règle', body: 'la structure française qui la corrige.' },
      { name: 'Le Drill', body: "la pratique. Répétition du modèle jusqu'à l'automatisme." },
      { name: 'La Situation', body: "l'application. Vous parlez, l'examinateur IA répond et corrige." },
      { name: 'Le Débrief', body: 'le bilan. Ce que vous avez réussi, ce qui vous a échappé, la suite.' },
    ],
  },
} as const

const CTA = {
  en: { kicker: 'Shall we begin?', button: 'Commencer ma première leçon' },
  fr: { kicker: 'On commence ?', button: 'Commencer ma première leçon' },
} as const

// ── Render helpers ────────────────────────────────────────────────────────

// Inline *italic* spans rendered as Source Serif 4 italic in ed-accent.
// Used for "Le Goulet" emphasis in the How it works section. Token form:
// "*phrase*" splits the string and wraps the captured group.
function renderEmphasis(body: string): ReactNode {
  const parts = body.split(/(\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      const inner = part.slice(1, -1)
      return (
        <em
          key={i}
          style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontWeight: 400,
            color: ED_ACCENT,
          }}
        >
          {inner}
        </em>
      )
    }
    return <span key={i}>{part}</span>
  })
}

// Reveal-on-scroll wrapper. Stagger via delayMs from the consumer (sibling
// index × ED_STAGGER.cards). Honors prefers-reduced-motion: useInViewOnce
// fires immediately when IntersectionObserver isn't available, and the
// reveal CSS animation is gated on prefers-reduced-motion: no-preference.
function Reveal({
  children,
  delayMs = 0,
}: {
  children: ReactNode
  delayMs?: number
}) {
  const { ref, inView } = useInViewOnce(0.15)
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────

export default function EcoleIntro() {
  const router = useRouter()
  const language = useInterfaceLanguage()
  const frame = FRAME[language]
  const methode = METHODE[language]
  const how = HOW[language]
  const parcours = PARCOURS[language]
  const cta = CTA[language]

  return (
    <div
      className="ed-page-enter"
      style={{ minHeight: '100dvh', backgroundColor: ED_BG, fontFamily: SANS }}
    >
      {/* Minimal header — brand mark only (matches ClusterDetailPage chrome) */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          height: 'calc(56px + var(--fp-safe-top))',
          backgroundColor: ED_BG,
          borderBottom: `1px solid ${ED_RULE}`,
          display: 'flex',
          alignItems: 'center',
          padding: 'var(--fp-safe-top) clamp(16px, 3vw, 32px) 0',
        }}
      >
        <Link
          href="/la-methode"
          aria-label="La Méthode"
          style={{
            color: ED_FG,
            textDecoration: 'none',
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: '0',
          }}
        >
          LeMethodic
        </Link>
      </header>

      {/* ── Section 1 — Frame ─────────────────────────────────────── */}
      <section
        aria-label="Welcome"
        style={{
          padding: 'clamp(80px, 12vw, 120px) clamp(24px, 4vw, 48px) clamp(64px, 8vw, 80px)',
          maxWidth: 1280,
          margin: '0 auto',
        }}
      >
        <div style={{ maxWidth: 880 }}>
          <h1
            className="text-balance"
            style={{
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 'clamp(56px, 9vw, 96px)',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              color: ED_FG,
              margin: 0,
            }}
          >
            {frame.h1}
          </h1>
          <p
            className="text-balance"
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(20px, 2.2vw, 24px)',
              lineHeight: 1.5,
              color: ED_MUTED,
              margin: 0,
              marginTop: 'clamp(20px, 2vw, 28px)',
              maxWidth: 720,
            }}
          >
            {frame.subhead}
          </p>
        </div>
      </section>

      {/* ── Section 2 — La Méthode en Couches (centerpiece) ─────── */}
      <section
        aria-label={methode.title}
        style={{
          padding: 'clamp(64px, 8vw, 112px) clamp(24px, 4vw, 48px)',
          backgroundColor: ED_BG,
          borderTop: `1px solid ${ED_RULE}`,
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <Reveal>
            <h2
              style={{
                fontFamily: SERIF,
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 'clamp(40px, 5.5vw, 64px)',
                lineHeight: 1.1,
                letterSpacing: '-0.015em',
                color: ED_ACCENT,
                margin: 0,
              }}
            >
              {methode.title}
            </h2>
            <p
              className="text-balance"
              style={{
                fontFamily: SERIF,
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 'clamp(19px, 2vw, 22px)',
                lineHeight: 1.55,
                color: ED_MUTED,
                margin: 0,
                marginTop: 'clamp(24px, 2.5vw, 32px)',
              }}
            >
              {methode.intro}
            </p>
          </Reveal>

          {/* 5 couche blocks. 80ms stagger via delayMs. 96px vertical between. */}
          <div
            style={{
              marginTop: 'clamp(72px, 10vw, 112px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(72px, 10vw, 112px)',
            }}
          >
            {methode.couches.map((c, i) => (
              <Reveal key={c.n} delayMs={i * 80}>
                <div>
                  <p
                    style={{
                      fontFamily: SERIF,
                      fontStyle: 'italic',
                      fontWeight: 400,
                      fontSize: 'clamp(18px, 1.6vw, 20px)',
                      letterSpacing: '0.02em',
                      color: ED_ACCENT,
                      margin: 0,
                    }}
                  >
                    {c.n}
                  </p>
                  <h3
                    style={{
                      fontFamily: SANS,
                      fontWeight: 600,
                      fontSize: 'clamp(32px, 3.6vw, 40px)',
                      lineHeight: 1.15,
                      letterSpacing: '-0.018em',
                      color: ED_FG,
                      margin: 0,
                      marginTop: 8,
                    }}
                  >
                    {c.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: SANS,
                      fontWeight: 500,
                      fontSize: 13,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: ED_MUTED,
                      margin: 0,
                      marginTop: 8,
                    }}
                  >
                    {c.label}
                  </p>
                  <p
                    style={{
                      fontFamily: SANS,
                      fontWeight: 400,
                      fontSize: 'clamp(17px, 1.6vw, 19px)',
                      lineHeight: 1.65,
                      color: ED_FG,
                      margin: 0,
                      marginTop: 'clamp(20px, 2vw, 24px)',
                      maxWidth: 640,
                    }}
                  >
                    {renderEmphasis(c.body)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Closer — larger Source Serif 4 italic, centered, ed-fg */}
          <Reveal>
            <p
              className="text-balance"
              style={{
                fontFamily: SERIF,
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 'clamp(22px, 2.4vw, 28px)',
                lineHeight: 1.45,
                color: ED_FG,
                margin: 0,
                marginTop: 'clamp(96px, 12vw, 144px)',
                textAlign: 'center',
              }}
            >
              {methode.closer}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Section 3 — How it works (process) ──────────────────── */}
      <section
        aria-label={how.title}
        style={{
          padding: 'clamp(64px, 8vw, 112px) clamp(24px, 4vw, 48px)',
          backgroundColor: ED_PAPER,
          borderTop: `1px solid ${ED_RULE}`,
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <Reveal>
            <h2
              style={{
                fontFamily: SERIF,
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 'clamp(40px, 5.5vw, 56px)',
                lineHeight: 1.1,
                letterSpacing: '-0.015em',
                color: ED_ACCENT,
                margin: 0,
              }}
            >
              {how.title}
            </h2>
            <p
              style={{
                fontFamily: SANS,
                fontWeight: 400,
                fontSize: 'clamp(17px, 1.7vw, 19px)',
                lineHeight: 1.65,
                color: ED_FG,
                margin: 0,
                marginTop: 'clamp(24px, 2.5vw, 32px)',
              }}
            >
              {how.intro}
            </p>
          </Reveal>

          <div
            style={{
              marginTop: 'clamp(48px, 6vw, 72px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(48px, 6vw, 72px)',
            }}
          >
            {how.blocks.map((b, i) => (
              <Reveal key={b.head} delayMs={i * 80}>
                <div>
                  <h3
                    style={{
                      fontFamily: SANS,
                      fontWeight: 600,
                      fontSize: 'clamp(22px, 2.4vw, 28px)',
                      lineHeight: 1.25,
                      letterSpacing: '-0.012em',
                      color: ED_FG,
                      margin: 0,
                    }}
                  >
                    {b.head}
                  </h3>
                  <p
                    style={{
                      fontFamily: SANS,
                      fontWeight: 400,
                      fontSize: 'clamp(17px, 1.6vw, 19px)',
                      lineHeight: 1.65,
                      color: ED_FG,
                      margin: 0,
                      marginTop: 'clamp(14px, 1.5vw, 18px)',
                    }}
                  >
                    {renderEmphasis(b.body)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4 — Le parcours (curriculum catalog) ───────── */}
      <section
        aria-label={parcours.title}
        style={{
          padding: 'clamp(64px, 8vw, 112px) clamp(24px, 4vw, 48px)',
          backgroundColor: ED_BG,
          borderTop: `1px solid ${ED_RULE}`,
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <Reveal>
            <h2
              style={{
                fontFamily: SERIF,
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 'clamp(40px, 5.5vw, 56px)',
                lineHeight: 1.1,
                letterSpacing: '-0.015em',
                color: ED_ACCENT,
                margin: 0,
              }}
            >
              {parcours.title}
            </h2>
          </Reveal>

          {/* Two-block grid: side-by-side ≥768px, stacked mobile */}
          <div className="ecole-intro-blocks" style={{ marginTop: 'clamp(40px, 5vw, 56px)' }}>
            <Reveal>
              <div className="ecole-intro-block">
                <h3
                  style={{
                    fontFamily: SANS,
                    fontWeight: 600,
                    fontSize: 'clamp(26px, 2.8vw, 32px)',
                    lineHeight: 1.2,
                    letterSpacing: '-0.012em',
                    color: ED_FG,
                    margin: 0,
                  }}
                >
                  {parcours.fondations.name}
                </h3>
                <p
                  style={{
                    fontFamily: SANS,
                    fontWeight: 500,
                    fontSize: 13,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: ED_MUTED,
                    margin: 0,
                    marginTop: 6,
                  }}
                >
                  {parcours.fondations.range}
                </p>
                <p
                  style={{
                    fontFamily: SANS,
                    fontWeight: 400,
                    fontSize: 'clamp(16px, 1.5vw, 18px)',
                    lineHeight: 1.6,
                    color: ED_FG,
                    margin: 0,
                    marginTop: 16,
                  }}
                >
                  {parcours.fondations.body}
                </p>
              </div>
            </Reveal>
            <Reveal delayMs={80}>
              <div className="ecole-intro-block">
                <h3
                  style={{
                    fontFamily: SANS,
                    fontWeight: 600,
                    fontSize: 'clamp(26px, 2.8vw, 32px)',
                    lineHeight: 1.2,
                    letterSpacing: '-0.012em',
                    color: ED_FG,
                    margin: 0,
                  }}
                >
                  {parcours.approfondissement.name}
                </h3>
                <p
                  style={{
                    fontFamily: SANS,
                    fontWeight: 500,
                    fontSize: 13,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: ED_MUTED,
                    margin: 0,
                    marginTop: 6,
                  }}
                >
                  {parcours.approfondissement.range}
                </p>
                <p
                  style={{
                    fontFamily: SANS,
                    fontWeight: 400,
                    fontSize: 'clamp(16px, 1.5vw, 18px)',
                    lineHeight: 1.6,
                    color: ED_FG,
                    margin: 0,
                    marginTop: 16,
                  }}
                >
                  {parcours.approfondissement.body}
                </p>
              </div>
            </Reveal>
          </div>

          {/* Five segments — vertical numbered list, generous spacing */}
          <Reveal>
            <h3
              style={{
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 'clamp(20px, 2vw, 24px)',
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
                color: ED_FG,
                margin: 0,
                marginTop: 'clamp(72px, 9vw, 96px)',
              }}
            >
              {parcours.segmentsTitle}
            </h3>
          </Reveal>

          <ol
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              marginTop: 'clamp(28px, 3vw, 40px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(28px, 3vw, 36px)',
            }}
          >
            {parcours.segments.map((s, i) => (
              <li key={s.name}>
                <Reveal delayMs={i * 60}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr',
                      gap: 'clamp(16px, 2vw, 24px)',
                      alignItems: 'baseline',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: SERIF,
                        fontStyle: 'italic',
                        fontWeight: 400,
                        fontSize: 'clamp(20px, 2vw, 24px)',
                        color: ED_ACCENT,
                        lineHeight: 1.2,
                        minWidth: 28,
                      }}
                    >
                      {i + 1}.
                    </span>
                    <p
                      style={{
                        fontFamily: SANS,
                        fontWeight: 400,
                        fontSize: 'clamp(16px, 1.5vw, 18px)',
                        lineHeight: 1.6,
                        color: ED_FG,
                        margin: 0,
                      }}
                    >
                      <strong style={{ fontWeight: 600 }}>{s.name}</strong>
                      {language === 'fr' ? ' : ' : ': '}
                      {s.body}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Section 5 — CTA ─────────────────────────────────────── */}
      <section
        aria-label="Begin"
        style={{
          padding: 'clamp(80px, 10vw, 120px) clamp(24px, 4vw, 48px) clamp(96px, 12vw, 144px)',
          backgroundColor: ED_BG,
          borderTop: `1px solid ${ED_RULE}`,
          textAlign: 'center',
        }}
      >
        <Reveal>
          <p
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(22px, 2.4vw, 28px)',
              lineHeight: 1.4,
              color: ED_FG,
              margin: 0,
              marginBottom: 'clamp(32px, 4vw, 48px)',
            }}
          >
            {cta.kicker}
          </p>
          <button
            type="button"
            onClick={() => router.push('/la-methode')}
            className="ed-btn-press"
            style={{
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 16,
              color: '#FFFFFF',
              backgroundColor: ED_ACCENT,
              border: 'none',
              borderRadius: 4,
              padding: '16px 32px',
              cursor: 'pointer',
              outline: 'none',
              letterSpacing: '0',
              transition: 'background-color var(--ed-duration-hover) var(--ease-spring)',
            }}
          >
            {cta.button}
          </button>
        </Reveal>
      </section>
    </div>
  )
}
