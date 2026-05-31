import Link from 'next/link'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'
import type { Tache } from '@/lib/data/taches'
import CouchesPreview from './CouchesPreview'
import PastScorePanel from './PastScorePanel'
import TacheOverviewGrid from './TacheOverviewGrid'
import RevealOnScroll from '@/components/landing/RevealOnScroll'

export default function DiagnosticLanding({ taches }: { taches: readonly Tache[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, paddingTop: 8 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1
          style={{
            fontFamily: SERIF_FONT,
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 'clamp(32px, 4vw, 52px)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {"L'Examen"}
        </h1>
        <p
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 500,
            fontSize: '1rem',
            color: 'var(--text-muted)',
            margin: 0,
          }}
        >
          Mesurez votre niveau réel en expression orale TCF Canada.
        </p>
      </header>

      <PastScorePanel />

      <section
        data-testid="diagnostic-section-persona"
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <h2
          style={{
            fontFamily: SERIF_FONT,
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 'clamp(24px, 2.8vw, 34px)',
            lineHeight: 1.2,
            letterSpacing: '-0.015em',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          Pourquoi un diagnostic ?
        </h2>
        <RevealOnScroll delay={0}>
          <p
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 400,
              fontSize: '1rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              margin: 0,
              maxWidth: 720,
            }}
          >
            Le diagnostic mesure votre expression orale dans les conditions du
            TCF Canada : trois tâches enchaînées, un seul essai, une évaluation
            fine de ce qui sort vraiment de votre bouche le jour J.
          </p>
        </RevealOnScroll>
        <RevealOnScroll delay={0.08}>
          <p
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 400,
              fontSize: '1rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              margin: 0,
              maxWidth: 720,
            }}
          >
            Pour les candidats anglophones pressés par un dossier d&rsquo;immigration,
            la question n&rsquo;est plus « combien de mots je connais » mais
            « quels réflexes francophones je peux mobiliser sous pression ». Le
            diagnostic répond précisément à cette question.
          </p>
        </RevealOnScroll>
        <RevealOnScroll delay={0.16}>
          <p
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 400,
              fontSize: '1rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              margin: 0,
              maxWidth: 720,
            }}
          >
            L&rsquo;évaluation suit la méthode en 5 couches — pas un test de
            vocabulaire, mais une cartographie de votre voix française.
          </p>
        </RevealOnScroll>
      </section>

      <section
        data-testid="diagnostic-section-overview"
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h2
            style={{
              fontFamily: SERIF_FONT,
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 'clamp(24px, 2.8vw, 34px)',
              lineHeight: 1.2,
              letterSpacing: '-0.015em',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Le déroulé
          </h2>
          <p
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 400,
              fontSize: '0.9375rem',
              color: 'var(--text-muted)',
              margin: 0,
            }}
          >
            Trois tâches enchaînées, environ douze minutes au total.
          </p>
        </div>
        <TacheOverviewGrid taches={taches} />
      </section>

      <section data-testid="diagnostic-section-couches">
        <CouchesPreview />
      </section>

      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Link
          data-testid="diagnostic-cta-start"
          href="/l-examen/diagnostic/tache/1"
          className="ed-btn-press"
          style={{
            minHeight: 48,
            padding: '14px 28px',
            fontFamily: SANS_FONT,
            fontWeight: 600,
            fontSize: '1rem',
            color: 'var(--bg-elevated)',
            backgroundColor: 'var(--cta-utility)',
            border: '1px solid var(--cta-utility)',
            borderRadius: 4,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Commencer le diagnostic
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ marginLeft: 8, flexShrink: 0 }}
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
