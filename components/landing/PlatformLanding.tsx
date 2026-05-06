'use client'

// F-300a — platform-level landing for / and /fr. Reframes LeMethodic
// from "TCF speaking exam prep" to "French learning platform" with
// three product surfaces:
//   - Exam Prep (featured) → /exam-prep
//   - Library              → /library
//   - Free Diagnostic       → /onboarding (the conversion entry)
//
// The previous root content (TCF/TEF/DELF funnel) lives at /exam-prep
// per F-300b. V-013c TopNav stays excluded on / + /fr (marketing
// chrome). V-012 warm tokens, V-016d kicker treatment, V-016f Card 1
// bottleneck cycle reused for the Exam Prep card visual.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth'
import { useVerifyAuth } from '@/hooks/useVerifyAuth'
import LandingHeader from './LandingHeader'
import LandingFooter from './LandingFooter'
import RotatingKicker from './RotatingKicker'
import HeroAtmosphere from './HeroAtmosphere'
import RevealOnScroll from './RevealOnScroll'
import { useReducedMotion } from 'framer-motion'
import { ED, LETTER_SPACING, LINE_HEIGHT, SANS_FONT, SERIF_FONT } from '@/lib/typography'
import type { Lang } from './copy'

const PAGE_BG = 'var(--ed-bg)'

// ── Locked copy ──────────────────────────────────────────────────────────

const PLATFORM_COPY = {
  en: {
    hero: {
      h1: 'Stop translating. Start producing French.',
      sub: 'The method, the exams, the books — built for English speakers.',
      kickerSub: 'Built for the exams that change visa outcomes.',
      ctaPrimary: 'Start free diagnostic',
      ctaSecondary: 'Browse the library',
    },
    cards: {
      eyebrow: 'What you can do here',
      examPrep: {
        title: 'Exam Prep',
        subtitle: 'TCF · TEF · DELF · DALF',
        body: 'Diagnostic-driven path. AI examiner feedback under exam pressure. Built specifically for English speakers hitting the B1 wall.',
        cta: 'Explore exam prep',
        href: '/exam-prep',
      },
      library: {
        title: 'Library',
        subtitle: 'Books · Free resources',
        body: 'Method books, exam prep PDFs, free resources for English speakers learning French.',
        cta: 'Browse the library',
        href: '/library',
      },
      diagnostic: {
        title: 'Free Diagnostic',
        subtitle: '12 minutes · No card',
        body: "Get an honest read on what's blocking your French. Real Claude analysis on the 5 couches.",
        cta: 'Start the diagnostic',
        href: '/onboarding',
      },
    },
    methodology: {
      heading: 'La Méthode en Couches',
      sub: 'Five layers compose your French. We diagnose the one holding you back.',
      attribution: 'Built on 7,000+ hours of French tutoring with English speakers.',
      seeMore: 'See full methodology',
      seeMoreHref: '/exam-prep',
    },
    finalCta: {
      h2: "Stop guessing what's blocking your French.",
      body: 'Twelve minutes of honest diagnostic before you decide anything.',
      button: 'Start your free diagnostic',
      trust: 'Free. No card. About 12 minutes.',
    },
  },
  fr: {
    hero: {
      h1: 'Arrêtez de traduire. Commencez à produire en français.',
      sub: 'La méthode, les examens, les livres — pensés pour les anglophones.',
      kickerSub: 'Conçu pour les examens qui changent les résultats de visa.',
      ctaPrimary: 'Commencer le diagnostic gratuit',
      ctaSecondary: 'Parcourir la bibliothèque',
    },
    cards: {
      eyebrow: 'Ce que vous pouvez faire ici',
      examPrep: {
        title: 'Préparation aux examens',
        subtitle: 'TCF · TEF · DELF · DALF',
        body: "Parcours basé sur diagnostic. Feedback d'examinateur IA sous pression d'examen. Pensé pour les anglophones qui butent sur le mur B1.",
        cta: 'Découvrir la préparation',
        href: '/fr/exam-prep',
      },
      library: {
        title: 'Bibliothèque',
        subtitle: 'Livres · Ressources gratuites',
        body: 'Livres de méthode, PDF de préparation aux examens, ressources gratuites pour anglophones apprenant le français.',
        cta: 'Parcourir la bibliothèque',
        href: '/library',
      },
      diagnostic: {
        title: 'Diagnostic gratuit',
        subtitle: '12 minutes · Sans carte',
        body: 'Une évaluation honnête de ce qui bloque votre français. Analyse Claude sur les 5 couches.',
        cta: 'Commencer le diagnostic',
        href: '/onboarding',
      },
    },
    methodology: {
      heading: 'La Méthode en Couches',
      sub: 'Cinq couches composent votre français. On diagnostique celle qui vous freine.',
      attribution: "Basé sur plus de 7 000 heures d'enseignement du français à des anglophones.",
      seeMore: 'Voir la méthodologie complète',
      seeMoreHref: '/fr/exam-prep',
    },
    finalCta: {
      h2: 'Arrêtez de deviner ce qui bloque votre français.',
      body: "Douze minutes de diagnostic honnête avant de décider quoi que ce soit.",
      button: 'Commencer votre diagnostic gratuit',
      trust: 'Gratuit. Sans carte. Environ 12 minutes.',
    },
  },
} as const

const COUCHE_NAMES = ['Le Fond', 'Les Moules des Idées', 'Les Moules', 'Les Réflexes Anglais', 'La Voix']

interface Props {
  lang: Lang
}

export default function PlatformLanding({ lang }: Props) {
  const copy = PLATFORM_COPY[lang]
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const hydrated = useAuthStore((s) => s.hydrated)
  const verified = useAuthStore((s) => s.verified)

  useEffect(() => {
    useAuthStore.getState().hydrate()
  }, [])
  useVerifyAuth()
  useEffect(() => {
    if (hydrated && token && verified) {
      router.replace('/ecole')
    }
  }, [hydrated, token, verified, router])
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
    }
  }, [lang])

  return (
    <main className="min-h-screen w-full ed-page-enter" style={{ backgroundColor: PAGE_BG }}>
      <LandingHeader lang={lang} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="w-full"
        style={{
          backgroundColor: ED.bg,
          backgroundImage: 'linear-gradient(180deg, var(--ed-bg) 0%, var(--ed-warm-sand) 100%)',
          padding: 'clamp(80px, 14vw, 160px) clamp(24px, 4vw, 64px) clamp(64px, 10vw, 140px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <HeroAtmosphere />
        <div className="mx-auto" style={{ maxWidth: 1280, position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 920 }}>
            <div className="ed-hero-rise ed-hero-rise-delay-1">
              <RotatingKicker lang={lang} />
              <p
                style={{
                  fontFamily: SANS_FONT,
                  fontWeight: 500,
                  fontSize: 'clamp(13px, 1.2vw, 15px)',
                  letterSpacing: '0.04em',
                  color: ED.muted,
                  margin: 0,
                  marginBottom: 'clamp(24px, 3vw, 36px)',
                }}
              >
                {copy.hero.kickerSub}
              </p>
            </div>
            <h1
              className="text-balance ed-hero-rise ed-hero-rise-delay-2"
              style={{
                fontFamily: SANS_FONT,
                fontWeight: 700,
                fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                lineHeight: LINE_HEIGHT.display,
                letterSpacing: LETTER_SPACING.display,
                color: ED.fg,
                margin: 0,
                marginBottom: 'clamp(20px, 2.5vw, 32px)',
              }}
            >
              {copy.hero.h1}
            </h1>
            <p
              className="text-pretty ed-hero-rise ed-hero-rise-delay-3"
              style={{
                fontFamily: SANS_FONT,
                fontWeight: 400,
                fontSize: 'clamp(1.125rem, 1.6vw, 1.375rem)',
                lineHeight: LINE_HEIGHT.body,
                letterSpacing: LETTER_SPACING.body,
                color: ED.muted,
                maxWidth: 720,
                margin: 0,
                marginBottom: 'clamp(32px, 4vw, 48px)',
              }}
            >
              {copy.hero.sub}
            </p>

            {/* Hero CTAs */}
            <div className="ed-hero-rise ed-hero-rise-delay-3" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20 }}>
              <Link
                href="/onboarding"
                className="ed-cta-warm-hover ed-btn-press"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 64,
                  padding: '0 36px',
                  borderRadius: 4,
                  backgroundColor: 'var(--ed-warm-peach-deep)',
                  color: 'var(--ed-warm-cream)',
                  fontFamily: SANS_FONT,
                  fontWeight: 600,
                  fontSize: '1.0625rem',
                  letterSpacing: '0',
                  textDecoration: 'none',
                }}
              >
                {copy.hero.ctaPrimary}
              </Link>
              <Link
                href="/library"
                style={{
                  fontFamily: SANS_FONT,
                  fontWeight: 500,
                  fontSize: '0.9375rem',
                  color: ED.muted,
                  textDecoration: 'underline',
                  textUnderlineOffset: 4,
                  textDecorationThickness: 1,
                  textDecorationColor: 'var(--ed-rule)',
                  transition: 'color var(--ed-duration-hover) var(--ease-spring), text-decoration-color var(--ed-duration-hover) var(--ease-spring)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = ED.fg
                  e.currentTarget.style.textDecorationColor = ED.fg
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = ED.muted
                  e.currentTarget.style.textDecorationColor = 'var(--ed-rule)'
                }}
              >
                {copy.hero.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Product cards (Option B: featured + 2 secondary) ──────── */}
      <ProductCards lang={lang} copy={copy.cards} />

      {/* ── Compressed methodology ─────────────────────────────── */}
      <section
        className="w-full"
        style={{
          backgroundColor: ED.paper,
          borderTop: `1px solid ${ED.rule}`,
          padding: 'clamp(80px, 12vw, 160px) clamp(24px, 4vw, 64px)',
        }}
      >
        <div className="mx-auto" style={{ maxWidth: 720 }}>
          <RevealOnScroll>
            <h2
              className="text-balance"
              style={{
                fontFamily: SERIF_FONT,
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                lineHeight: 1.1,
                letterSpacing: '-0.015em',
                color: ED.accent,
                margin: 0,
              }}
            >
              {copy.methodology.heading}
            </h2>
          </RevealOnScroll>
          <RevealOnScroll delay={0.08}>
            <p
              className="text-balance"
              style={{
                fontFamily: SERIF_FONT,
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 'clamp(1.125rem, 1.8vw, 1.375rem)',
                lineHeight: 1.55,
                color: ED.muted,
                margin: 0,
                marginTop: 'clamp(20px, 2vw, 28px)',
                marginBottom: 'clamp(40px, 5vw, 64px)',
              }}
            >
              {copy.methodology.sub}
            </p>
          </RevealOnScroll>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {COUCHE_NAMES.map((name, i) => (
              <li key={name}>
                <RevealOnScroll delay={0.12 + i * 0.06}>
                  <p
                    style={{
                      fontFamily: SANS_FONT,
                      fontWeight: 600,
                      fontSize: 'clamp(1.125rem, 1.6vw, 1.375rem)',
                      lineHeight: 1.4,
                      color: ED.fg,
                      margin: 0,
                    }}
                  >
                    {name}
                  </p>
                </RevealOnScroll>
              </li>
            ))}
          </ul>
          <RevealOnScroll delay={0.4}>
            <p
              style={{
                fontFamily: SANS_FONT,
                fontWeight: 400,
                fontSize: '0.9375rem',
                color: ED.muted,
                margin: 0,
                marginTop: 'clamp(40px, 5vw, 64px)',
                fontStyle: 'italic',
              }}
            >
              {copy.methodology.attribution}
            </p>
            <Link
              href={copy.methodology.seeMoreHref}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 12,
                fontFamily: SANS_FONT,
                fontWeight: 600,
                fontSize: '0.9375rem',
                color: 'var(--ed-warm-espresso)',
                textDecoration: 'none',
              }}
            >
              {copy.methodology.seeMore} →
            </Link>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────── */}
      <section
        className="w-full"
        style={{
          backgroundColor: 'var(--ed-warm-sand)',
          padding: 'clamp(96px, 14vw, 180px) clamp(24px, 4vw, 64px)',
        }}
      >
        <div
          className="mx-auto"
          style={{ maxWidth: 720, textAlign: 'center' }}
        >
          <RevealOnScroll>
            <h2
              className="text-balance"
              style={{
                fontFamily: SANS_FONT,
                fontWeight: 600,
                fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
                lineHeight: LINE_HEIGHT.display,
                letterSpacing: LETTER_SPACING.display,
                color: ED.fg,
                margin: '0 auto',
                marginBottom: 'clamp(20px, 2.5vw, 28px)',
                textAlign: 'center',
                maxWidth: 640,
              }}
            >
              {copy.finalCta.h2}
            </h2>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <p
              className="text-pretty"
              style={{
                fontFamily: SANS_FONT,
                fontWeight: 400,
                fontSize: 'clamp(1rem, 1.5vw, 1.1875rem)',
                lineHeight: LINE_HEIGHT.body,
                letterSpacing: LETTER_SPACING.body,
                color: ED.muted,
                margin: '0 auto',
                marginBottom: 'clamp(32px, 4vw, 48px)',
                maxWidth: 600,
                textAlign: 'center',
              }}
            >
              {copy.finalCta.body}
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={0.2}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              <Link
                href="/onboarding"
                className="ed-cta-warm-hover ed-btn-press"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 64,
                  padding: '0 36px',
                  borderRadius: 4,
                  backgroundColor: 'var(--ed-warm-peach-deep)',
                  color: 'var(--ed-warm-cream)',
                  fontFamily: SANS_FONT,
                  fontWeight: 600,
                  fontSize: '1.0625rem',
                  textDecoration: 'none',
                }}
              >
                {copy.finalCta.button}
              </Link>
              <span
                style={{
                  fontFamily: SANS_FONT,
                  fontWeight: 400,
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  color: 'var(--ed-fg-soft)',
                }}
              >
                {copy.finalCta.trust}
              </span>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <LandingFooter lang={lang} />
    </main>
  )
}

// ── Product cards section ────────────────────────────────────────────────

interface ProductCardsProps {
  lang: Lang
  copy: typeof PLATFORM_COPY[keyof typeof PLATFORM_COPY]['cards']
}

function ProductCards({ lang, copy }: ProductCardsProps) {
  return (
    <section
      className="w-full"
      style={{
        backgroundColor: ED.bg,
        padding: 'clamp(80px, 12vw, 140px) clamp(24px, 4vw, 64px)',
      }}
      aria-label={copy.eyebrow}
    >
      <div className="mx-auto" style={{ maxWidth: 1280 }}>
        <RevealOnScroll>
          <p
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: 12,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: ED.muted,
              margin: 0,
              marginBottom: 'clamp(40px, 5vw, 56px)',
            }}
          >
            {copy.eyebrow}
          </p>
        </RevealOnScroll>

        {/* F-300a Option B layout: featured Exam Prep (~2/3 wide) +
            stacked Library + Free Diagnostic (~1/3 wide). At md the
            grid collapses to 2 cols (Exam Prep top, secondaries below).
            At <md a single column. */}
        <div
          className="fp-platform-cards"
          style={{ display: 'grid', gap: 'clamp(16px, 2vw, 24px)' }}
        >
          <ExamPrepCard lang={lang} copy={copy.examPrep} />
          <LibraryCard copy={copy.library} />
          <DiagnosticCard copy={copy.diagnostic} />
        </div>
      </div>
    </section>
  )
}

// ── Card primitives ─────────────────────────────────────────────────────

interface CardCtaProps {
  href: string
  label: string
  emphasis?: boolean
}

function CardCta({ href, label, emphasis = false }: CardCtaProps) {
  return (
    <Link
      href={href}
      style={{
        marginTop: 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: SANS_FONT,
        fontWeight: 600,
        fontSize: emphasis ? '1rem' : '0.9375rem',
        color: emphasis ? 'var(--ed-warm-peach-deep)' : 'var(--ed-warm-espresso)',
        textDecoration: 'none',
        alignSelf: 'flex-start',
      }}
    >
      {label} →
    </Link>
  )
}

// Card 1 — Exam Prep, featured. Reuses the V-016f bottleneck cycle as
// visual texture (text-anchored, hover-cycles through 5 couches).
function ExamPrepCard({ lang, copy }: { lang: Lang; copy: typeof PLATFORM_COPY[keyof typeof PLATFORM_COPY]['cards']['examPrep'] }) {
  return (
    <RevealOnScroll>
      <div
        className="ed-card-lift fp-platform-card-featured"
        style={{
          backgroundColor: ED.paper,
          border: `1px solid ${ED.rule}`,
          borderRadius: 4,
          padding: 'clamp(32px, 4vw, 56px)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          minHeight: 360,
        }}
      >
        <BottleneckVisual language={lang} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--ed-warm-peach-deep)',
              margin: 0,
            }}
          >
            {copy.subtitle}
          </p>
          <h3
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: 'clamp(1.5rem, 2.4vw, 2rem)',
              lineHeight: 1.2,
              letterSpacing: '-0.012em',
              color: ED.fg,
              margin: 0,
            }}
          >
            {copy.title}
          </h3>
          <p
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 400,
              fontSize: 'clamp(0.9375rem, 1.4vw, 1.0625rem)',
              lineHeight: 1.6,
              color: ED.muted,
              margin: 0,
            }}
          >
            {copy.body}
          </p>
        </div>
        <CardCta href={copy.href} label={copy.cta} emphasis />
      </div>
    </RevealOnScroll>
  )
}

// Card 2 — Library. Typographic book stack visual (no real book covers
// yet; placeholder typography until F-300c launches /library content).
function LibraryCard({ copy }: { copy: typeof PLATFORM_COPY[keyof typeof PLATFORM_COPY]['cards']['library'] }) {
  return (
    <RevealOnScroll delay={0.1}>
      <div
        className="ed-card-lift fp-platform-card-secondary"
        style={{
          backgroundColor: 'var(--ed-warm-cream)',
          border: `1px solid ${ED.rule}`,
          borderRadius: 4,
          padding: 'clamp(28px, 3vw, 40px)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <BookStackVisual />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--ed-warm-espresso)',
              margin: 0,
            }}
          >
            {copy.subtitle}
          </p>
          <h3
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: 'clamp(1.25rem, 1.8vw, 1.5rem)',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
              color: ED.fg,
              margin: 0,
            }}
          >
            {copy.title}
          </h3>
          <p
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 400,
              fontSize: '0.9375rem',
              lineHeight: 1.55,
              color: ED.muted,
              margin: 0,
            }}
          >
            {copy.body}
          </p>
        </div>
        <CardCta href={copy.href} label={copy.cta} />
      </div>
    </RevealOnScroll>
  )
}

// Card 3 — Free Diagnostic. Mini radar visual.
function DiagnosticCard({ copy }: { copy: typeof PLATFORM_COPY[keyof typeof PLATFORM_COPY]['cards']['diagnostic'] }) {
  return (
    <RevealOnScroll delay={0.18}>
      <div
        className="ed-card-lift fp-platform-card-secondary"
        style={{
          backgroundColor: ED.paper,
          border: `1px solid ${ED.rule}`,
          borderRadius: 4,
          padding: 'clamp(28px, 3vw, 40px)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <MiniRadarVisual />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--ed-warm-sage-deep)',
              margin: 0,
            }}
          >
            {copy.subtitle}
          </p>
          <h3
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: 'clamp(1.25rem, 1.8vw, 1.5rem)',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
              color: ED.fg,
              margin: 0,
            }}
          >
            {copy.title}
          </h3>
          <p
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 400,
              fontSize: '0.9375rem',
              lineHeight: 1.55,
              color: ED.muted,
              margin: 0,
            }}
          >
            {copy.body}
          </p>
        </div>
        <CardCta href={copy.href} label={copy.cta} />
      </div>
    </RevealOnScroll>
  )
}

// ── Card visuals ─────────────────────────────────────────────────────────

// Bottleneck cycle — adapted from V-016f Card 1. Hover advances index;
// keyed remount triggers spring fade-up via ed-pair-fade-in keyframe.

const BOTTLENECK_LAYERS = ['Le Fond', 'Les Moules des Idées', 'Les Moules', 'Les Réflexes Anglais', 'La Voix']
const BOTTLENECK_COPY = {
  en: { eyebrow: 'Diagnose your bottleneck', tail: "is what's blocking your B2." },
  fr: { eyebrow: 'Identifiez votre goulet', tail: 'freine votre B2.' },
} as const

function BottleneckVisual({ language }: { language: Lang }) {
  const [active, setActive] = useState(3)
  const reduced = useReducedMotion()
  const text = BOTTLENECK_COPY[language]
  return (
    <div
      onMouseEnter={() => setActive((i) => (i + 1) % BOTTLENECK_LAYERS.length)}
      style={{
        height: 160,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 10,
      }}
      aria-live="polite"
    >
      <p
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 600,
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: ED.muted,
          margin: 0,
        }}
      >
        {text.eyebrow}
      </p>
      <p
        key={active}
        style={{
          fontFamily: SERIF_FONT,
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
          lineHeight: 1.05,
          letterSpacing: '-0.015em',
          color: 'var(--ed-warm-peach-deep)',
          margin: 0,
          animation: reduced ? 'none' : 'ed-pair-fade-in 400ms var(--ease-spring) both',
        }}
      >
        {BOTTLENECK_LAYERS[active]}
      </p>
      <p
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 400,
          fontSize: 14,
          lineHeight: 1.45,
          color: ED.fg,
          margin: 0,
        }}
      >
        {text.tail}
      </p>
    </div>
  )
}

// Library — typographic book stack. Three angled blocks, ed-warm tokens.
function BookStackVisual() {
  return (
    <div
      aria-hidden="true"
      style={{
        height: 100,
        display: 'flex',
        alignItems: 'flex-end',
        gap: 6,
        paddingLeft: 4,
      }}
    >
      <div
        style={{
          width: 48,
          height: 80,
          backgroundColor: 'var(--ed-warm-peach-deep)',
          borderRadius: '2px 2px 0 0',
          boxShadow: 'inset -2px 0 0 rgba(0,0,0,0.04)',
        }}
      />
      <div
        style={{
          width: 48,
          height: 92,
          backgroundColor: 'var(--ed-warm-sage-deep)',
          borderRadius: '2px 2px 0 0',
          boxShadow: 'inset -2px 0 0 rgba(0,0,0,0.04)',
        }}
      />
      <div
        style={{
          width: 48,
          height: 72,
          backgroundColor: 'var(--ed-warm-espresso)',
          borderRadius: '2px 2px 0 0',
          opacity: 0.85,
          boxShadow: 'inset -2px 0 0 rgba(0,0,0,0.04)',
        }}
      />
    </div>
  )
}

// Mini radar — pure SVG pentagon; sage-deep stroke, peach fill.
function MiniRadarVisual() {
  // Pentagon points around a circle of radius R, starting at top.
  const R = 38
  const cx = 50
  const cy = 50
  const points = Array.from({ length: 5 }, (_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5
    return { x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle) }
  })
  // Inner "user" pentagon at ~60% radius, slightly off-center to read
  // as data, not symmetric.
  const innerPoints = Array.from({ length: 5 }, (_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5
    const r = R * (i === 3 ? 0.4 : 0.65)
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  })
  const outerPath = points.map((p) => `${p.x},${p.y}`).join(' ')
  const innerPath = innerPoints.map((p) => `${p.x},${p.y}`).join(' ')
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <polygon
        points={outerPath}
        fill="transparent"
        stroke="var(--ed-warm-sage-deep)"
        strokeWidth="1.25"
        strokeDasharray="3 2"
      />
      <polygon
        points={innerPath}
        fill="var(--ed-warm-peach)"
        fillOpacity="0.55"
        stroke="var(--ed-warm-peach-deep)"
        strokeWidth="1.5"
      />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="var(--ed-warm-sage-deep)" />
      ))}
    </svg>
  )
}
