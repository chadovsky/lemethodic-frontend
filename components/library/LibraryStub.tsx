'use client'

// V-016g — /library stub page. Empty state with hero + "launching soon"
// message + email signup placeholder. F-300c populates the real
// catalog later. Visual continuity with PlatformLanding (V-012 warm
// tokens, ed-warm-sand hero gradient cap, peach-deep accents).

import { useState } from 'react'
import Link from 'next/link'
import LandingHeader from '@/components/landing/LandingHeader'
import LandingFooter from '@/components/landing/LandingFooter'
import RevealOnScroll from '@/components/landing/RevealOnScroll'
import { ED, LETTER_SPACING, LINE_HEIGHT, SANS_FONT, SERIF_FONT } from '@/lib/typography'
import type { Lang } from '@/components/landing/copy'

const PAGE_BG = 'var(--ed-bg)'

const COPY = {
  en: {
    eyebrow: 'Library',
    h1: 'Method books, exam prep, and free resources.',
    sub: 'A growing catalog for English speakers learning French. Books on La Méthode, exam-specific PDFs, and free practice resources. Launching soon.',
    notifyLabel: 'Get notified when it ships',
    placeholder: 'Your email',
    button: 'Notify me',
    success: "You're on the list. We'll email you when the catalog opens.",
    fallbackInvalid: 'Enter a valid email.',
    backCta: 'Back to home',
    backHref: '/',
  },
  fr: {
    eyebrow: 'Bibliothèque',
    h1: 'Livres de méthode, préparation aux examens, ressources gratuites.',
    sub: "Un catalogue grandissant pour anglophones apprenant le français. Livres sur La Méthode, PDF spécifiques aux examens, et ressources de pratique gratuites. À venir bientôt.",
    notifyLabel: 'Soyez prévenu(e) au lancement',
    placeholder: 'Votre adresse e-mail',
    button: 'Me prévenir',
    success: 'Vous êtes inscrit(e). Nous vous écrirons à l’ouverture du catalogue.',
    fallbackInvalid: 'Entrez une adresse e-mail valide.',
    backCta: "Retour à l'accueil",
    backHref: '/fr',
  },
} as const

interface Props {
  lang: Lang
}

const STORAGE_KEY = 'lemethodic:library-notify-email'

export default function LibraryStub({ lang }: Props) {
  const copy = COPY[lang]
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@') || !trimmed.split('@')[1]?.includes('.')) {
      setError(copy.fallbackInvalid)
      return
    }
    // V-016g — local-only capture until BE library-notify endpoint
    // exists (F-300c). Persists to localStorage so a refresh shows the
    // success state; BE-side capture filed for follow-up.
    setError(null)
    try {
      window.localStorage.setItem(STORAGE_KEY, trimmed)
    } catch {}
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen w-full ed-page-enter" style={{ backgroundColor: PAGE_BG }}>
      <LandingHeader lang={lang} />

      <section
        className="w-full"
        style={{
          backgroundColor: ED.bg,
          backgroundImage: 'linear-gradient(180deg, var(--ed-bg) 0%, var(--ed-warm-sand) 100%)',
          padding: 'clamp(80px, 14vw, 160px) clamp(24px, 4vw, 64px) clamp(96px, 12vw, 180px)',
        }}
      >
        <div className="mx-auto" style={{ maxWidth: 720, textAlign: 'center' }}>
          <RevealOnScroll>
            <p
              style={{
                fontFamily: SANS_FONT,
                fontWeight: 600,
                fontSize: 12,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--ed-warm-peach-deep)',
                margin: 0,
                marginBottom: 16,
              }}
            >
              {copy.eyebrow}
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={0.08}>
            <h1
              className="text-balance"
              style={{
                fontFamily: SANS_FONT,
                fontWeight: 700,
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                lineHeight: LINE_HEIGHT.display,
                letterSpacing: LETTER_SPACING.display,
                color: ED.fg,
                margin: 0,
                marginBottom: 'clamp(20px, 2.5vw, 32px)',
              }}
            >
              {copy.h1}
            </h1>
          </RevealOnScroll>
          <RevealOnScroll delay={0.16}>
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
                marginBottom: 'clamp(40px, 5vw, 64px)',
                maxWidth: 560,
              }}
            >
              {copy.sub}
            </p>
          </RevealOnScroll>

          {/* Notify form */}
          <RevealOnScroll delay={0.24}>
            <div
              style={{
                maxWidth: 460,
                margin: '0 auto',
                backgroundColor: ED.paper,
                border: `1px solid ${ED.rule}`,
                borderRadius: 4,
                padding: 'clamp(24px, 3vw, 32px)',
              }}
            >
              {submitted ? (
                <p
                  style={{
                    fontFamily: SANS_FONT,
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: 'var(--ed-warm-espresso)',
                    margin: 0,
                  }}
                  role="status"
                >
                  {copy.success}
                </p>
              ) : (
                <form onSubmit={handleSubmit}>
                  <label
                    htmlFor="library-notify-email"
                    style={{
                      display: 'block',
                      fontFamily: SANS_FONT,
                      fontWeight: 600,
                      fontSize: 11,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: ED.muted,
                      marginBottom: 10,
                      textAlign: 'left',
                    }}
                  >
                    {copy.notifyLabel}
                  </label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <input
                      id="library-notify-email"
                      type="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (error) setError(null)
                      }}
                      placeholder={copy.placeholder}
                      className="ed-field"
                      style={{
                        flex: 1,
                        minWidth: 200,
                        height: 48,
                        borderRadius: 4,
                        border: `1px solid ${ED.rule}`,
                        backgroundColor: ED.paper,
                        padding: '0 14px',
                        fontFamily: SANS_FONT,
                        fontWeight: 400,
                        fontSize: 14,
                        color: ED.fg,
                        outline: 'none',
                      }}
                    />
                    <button
                      type="submit"
                      className="ed-cta-warm-hover ed-btn-press"
                      style={{
                        height: 48,
                        padding: '0 22px',
                        borderRadius: 4,
                        backgroundColor: 'var(--ed-warm-peach-deep)',
                        color: 'var(--ed-warm-cream)',
                        fontFamily: SANS_FONT,
                        fontWeight: 600,
                        fontSize: 14,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {copy.button}
                    </button>
                  </div>
                  {error && (
                    <p
                      role="alert"
                      style={{
                        fontFamily: SANS_FONT,
                        fontSize: 12,
                        color: 'var(--fp-error)',
                        margin: 0,
                        marginTop: 8,
                        textAlign: 'left',
                      }}
                    >
                      {error}
                    </p>
                  )}
                </form>
              )}
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.32}>
            <Link
              href={copy.backHref}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 48,
                fontFamily: SANS_FONT,
                fontWeight: 500,
                fontSize: 13,
                color: ED.muted,
                textDecoration: 'underline',
                textUnderlineOffset: 4,
                textDecorationThickness: 1,
                textDecorationColor: 'var(--ed-rule)',
              }}
            >
              ← {copy.backCta}
            </Link>
          </RevealOnScroll>
        </div>
      </section>

      <LandingFooter lang={lang} />
    </main>
  )
}
