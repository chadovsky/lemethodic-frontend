'use client'

import Link from 'next/link'
import { Clock, MessageCircle, Mic } from 'lucide-react'
import BottomNav from '@/components/home/BottomNav'

const INK          = 'var(--text-primary)'
const INK_SOFT     = 'var(--text-secondary)'
const INK_MUTED    = 'var(--text-muted)'
const PEACH        = 'var(--lm-pastel-peach)'
const SAGE         = 'var(--lm-pastel-sage)'
const LAVENDER     = 'var(--lm-pastel-lavender)'
const BG           = 'var(--lm-bg-base)'
const DISPLAY_FONT = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'

interface TacheCard {
  number: 1 | 2 | 3
  bg: string
  title: string
  descriptor: string
  metaClock: string
  metaMode: string
  MetaIcon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>
  href: string
}

const CARDS: TacheCard[] = [
  {
    number: 1,
    bg: PEACH,
    title: 'Self-presentation',
    descriptor: 'Introduce yourself. The examiner asks follow-up questions about your life.',
    metaClock: '5–8 min',
    metaMode: 'Conversation',
    MetaIcon: MessageCircle,
    href: '/examen/expression-orale/tache-1/interview',
  },
  {
    number: 2,
    bg: SAGE,
    title: 'Role-play',
    descriptor: 'Play a role and ask the right questions to gather information.',
    metaClock: '8–12 min',
    metaMode: 'Hold to talk',
    MetaIcon: Mic,
    href: '/examen/expression-orale/tache-2',
  },
  {
    number: 3,
    bg: LAVENDER,
    title: 'Argumentative monologue',
    descriptor: 'Express your opinion on a topic with structured arguments.',
    metaClock: '5 min · 2 min prep + 3 min',
    metaMode: 'Solo recording',
    MetaIcon: Mic,
    href: '/examen/expression-orale/tache-3/environnement',
  },
]

export default function SpeakingLanding() {
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
            justifyContent: 'center',
          }}
        >
          <h1
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 18,
              color: INK,
              margin: 0,
            }}
          >
            Speaking
          </h1>
        </header>

        {/* Body */}
        <main style={{ padding: '28px 20px', paddingBottom: 96 }}>

          {/* Page heading */}
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
            What do you want to practice?
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
            Pick a T&acirc;che to start a session.
          </p>

          {/* Tache cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {CARDS.map((card) => (
              <Link
                key={card.number}
                href={card.href}
                style={{ textDecoration: 'none' }}
                aria-label={`Tâche ${card.number}: ${card.title}`}
              >
                <div
                  style={{
                    backgroundColor: card.bg,
                    borderRadius: 24,
                    padding: '22px 24px',
                    minHeight: 140,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'transform 0.12s, box-shadow 0.12s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                  onPointerDown={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(0.98)' }}
                  onPointerUp={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)' }}
                  onPointerLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)' }}
                >
                  {/* Label */}
                  <p
                    style={{
                      fontFamily: DISPLAY_FONT,
                      fontWeight: 700,
                      fontSize: 10,
                      letterSpacing: '0.10em',
                      textTransform: 'uppercase',
                      color: INK_MUTED,
                      margin: '0 0 6px',
                    }}
                  >
                    T&acirc;che {card.number}
                  </p>

                  {/* Title */}
                  <h3
                    style={{
                      fontFamily: DISPLAY_FONT,
                      fontWeight: 700,
                      fontSize: 20,
                      lineHeight: '26px',
                      color: INK,
                      margin: '0 0 6px',
                    }}
                  >
                    {card.title}
                  </h3>

                  {/* Descriptor */}
                  <p
                    style={{
                      fontWeight: 500,
                      fontSize: 14,
                      lineHeight: '20px',
                      color: INK_SOFT,
                      margin: '0 0 16px',
                      flex: 1,
                    }}
                  >
                    {card.descriptor}
                  </p>

                  {/* Meta row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={13} color={INK_MUTED} strokeWidth={2} />
                      <span style={{ fontFamily: DISPLAY_FONT, fontWeight: 600, fontSize: 12, color: INK_MUTED }}>
                        {card.metaClock}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <card.MetaIcon size={13} color={INK_MUTED} strokeWidth={2} />
                      <span style={{ fontFamily: DISPLAY_FONT, fontWeight: 600, fontSize: 12, color: INK_MUTED }}>
                        {card.metaMode}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Recommended section */}
          <div style={{ marginTop: 40 }}>
            <p
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color: INK_MUTED,
                margin: '0 0 12px',
              }}
            >
              Recommended right now
            </p>
            <Link href="/examen/expression-orale/tache-2/agence-voyages" style={{ textDecoration: 'none' }}>
              <div
                style={{
                  backgroundColor: SAGE,
                  borderRadius: 24,
                  padding: '20px 24px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'transform 0.12s',
                }}
                onPointerDown={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(0.98)' }}
                onPointerUp={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)' }}
                onPointerLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)' }}
              >
                <p
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 700,
                    fontSize: 10,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    color: INK_MUTED,
                    margin: '0 0 4px',
                  }}
                >
                  T&acirc;che 2 &middot; Today&apos;s practice
                </p>
                <h3
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 700,
                    fontSize: 18,
                    color: INK,
                    margin: '0 0 4px',
                  }}
                >
                  Agence de voyages
                </h3>
                <p style={{ fontWeight: 500, fontSize: 13, color: INK_SOFT, margin: 0 }}>
                  Gather travel info from an agent. 10 min.
                </p>
              </div>
            </Link>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
