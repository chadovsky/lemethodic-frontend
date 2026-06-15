'use client'

import { useState, useEffect, type CSSProperties } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { SANS_FONT } from '@/lib/typography'
import { getJourney, THEMES, type ThemeId } from '@/lib/journey/journey'
import { ISLAND_ART } from '@/lib/journey/island-art'
import { readTargetLevel } from '@/lib/journey/target-level'
import { readCompletedIles } from '@/lib/journey/progress'

// F-464 — La Carte HERO. The dashboard's entry into the voyage: the current
// île's art + theme name + level, a slim progress bar, and a "Continuer" CTA to
// /carte. An entry card, NOT a mini map. Reuses the F-456 journey model + the
// F-461 island-art map; the journey readers are client-side (localStorage), so
// resolution happens after mount with a skeleton first paint (no SSR mismatch).

interface HeroState {
  theme: ThemeId
  label: string
  level: string
  completed: number
  total: number
  hasCurrent: boolean
}

function resolveHero(): HeroState {
  const level = readTargetLevel()
  const completed = readCompletedIles(level)
  const journey = getJourney(level, completed)
  // The current île when the level is authored (B1); otherwise the first île is
  // the honest entry point (no fabricated "current").
  const current = journey.iles.find((i) => i.status === 'current')
  const ile = current ?? journey.iles[0]
  const theme = ile.theme
  return {
    theme,
    label: THEMES.find((t) => t.id === theme)?.label ?? theme,
    level,
    completed: completed.length,
    total: journey.iles.length,
    hasCurrent: Boolean(current),
  }
}

export default function CarteHero({ style }: { style?: CSSProperties }) {
  const [hero, setHero] = useState<HeroState | null>(null)

  useEffect(() => {
    setHero(resolveHero())
  }, [])

  const pct = hero && hero.total > 0 ? Math.round((hero.completed / hero.total) * 100) : 0

  return (
    <section
      data-testid="dashboard-carte-hero"
      aria-label="La Carte, votre parcours"
      className="ed-card-lift dash-hero"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 'var(--r-xl)',
        padding: 'clamp(20px, 2.4vw, 32px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 20,
        minWidth: 0,
        ...style,
      }}
    >
      {!hero ? (
        <div className="ed-skeleton" style={{ flex: 1, minHeight: 160, borderRadius: 'var(--r-lg)' }} />
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(16px, 2vw, 28px)' }}>
            <Image
              data-testid="dashboard-carte-hero-art"
              src={ISLAND_ART[hero.theme]}
              alt={hero.label}
              width={132}
              height={132}
              unoptimized
              draggable={false}
              className="dash-hero-art"
              style={{ width: 'clamp(96px, 12vw, 132px)', height: 'auto', objectFit: 'contain', flexShrink: 0, userSelect: 'none' }}
            />
            <div style={{ minWidth: 0 }}>
              <span
                style={{
                  display: 'inline-flex',
                  fontFamily: SANS_FONT,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: 6,
                }}
              >
                {hero.hasCurrent ? 'Île en cours' : 'Votre parcours'} · Niveau {hero.level}
              </span>
              <h2
                data-testid="dashboard-carte-hero-theme"
                style={{
                  fontFamily: SANS_FONT,
                  fontWeight: 700,
                  fontSize: 'clamp(24px, 3vw, 36px)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  color: 'var(--heading)',
                  margin: 0,
                }}
              >
                {hero.label}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span
                  style={{
                    fontFamily: SANS_FONT,
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                  }}
                >
                  Progression
                </span>
                <span data-testid="dashboard-carte-hero-progress-label" style={{ fontFamily: SANS_FONT, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {hero.completed} / {hero.total} îles
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 4, backgroundColor: 'color-mix(in srgb, var(--heading) 10%, transparent)', overflow: 'hidden' }}>
                <div
                  data-testid="dashboard-carte-hero-progress-fill"
                  className="progress-bar-fill"
                  style={{ height: '100%', width: `${pct}%`, borderRadius: 4, backgroundColor: 'var(--accent)' }}
                />
              </div>
            </div>

            <Link
              href="/carte"
              data-testid="dashboard-carte-hero-cta"
              className="ed-btn-press"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                alignSelf: 'flex-start',
                gap: 8,
                padding: '10px 18px',
                borderRadius: 'var(--r-md)',
                background: 'var(--accent)',
                color: 'var(--accent-foreground)',
                fontFamily: SANS_FONT,
                fontWeight: 600,
                fontSize: '0.9375rem',
                textDecoration: 'none',
              }}
            >
              Continuer
              <ArrowRight size={18} strokeWidth={2.25} aria-hidden="true" />
            </Link>
          </div>
        </>
      )}
    </section>
  )
}
