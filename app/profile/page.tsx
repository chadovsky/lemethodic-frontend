'use client'

import Link from 'next/link'
import BottomNav from '@/components/home/BottomNav'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { ArrowLeft, ChevronRight, Pencil } from 'lucide-react'

// ─── design tokens ────────────────────────────────────────────────────────────
const INK          = '#1A1A1A'
const INK_SOFT     = '#1A1A1AB3'
const INK_MUTED    = '#1A1A1A66'
const PEACH        = '#FFD8C2'
const SAGE         = '#D4E4D0'
const BUTTER       = '#FFF0C2'
const BG           = 'var(--fp-canvas)'
const CARD_BG      = '#FFFFFF'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'
const SEPARATOR    = '#1A1A1A0F'

// ─── reusable card shell ──────────────────────────────────────────────────────
function Card({
  children,
  background = CARD_BG,
}: {
  children: React.ReactNode
  background?: string
}) {
  return (
    <div
      style={{
        backgroundColor: background,
        borderRadius: 20,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {children}
    </div>
  )
}

// ─── list row ─────────────────────────────────────────────────────────────────
function ListRow({
  label,
  value,
  action,
  danger = false,
  onClick,
}: {
  label: string
  value?: string
  action?: React.ReactNode
  danger?: boolean
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '15px 20px',
        cursor: onClick ? 'pointer' : 'default',
        borderBottom: `1px solid ${SEPARATOR}`,
      }}
    >
      <span
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 600,
          fontSize: 15,
          color: danger ? '#D94F4F' : INK,
        }}
      >
        {label}
      </span>
      {(value || action) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {value && (
            <span
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 500,
                fontSize: 14,
                color: INK_MUTED,
              }}
            >
              {value}
            </span>
          )}
          {action}
        </div>
      )}
    </div>
  )
}

// ─── section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: DISPLAY_FONT,
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        color: INK_MUTED,
        margin: 0,
        marginBottom: 10,
        paddingLeft: 4,
      }}
    >
      {children}
    </p>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  return (
    <ProtectedRoute>
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: BG,
        fontFamily: DISPLAY_FONT,
      }}
    >
      <div style={{ maxWidth: 440, margin: '0 auto', position: 'relative' }}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            height: 'calc(56px + var(--fp-safe-top))',
            backgroundColor: BG,
            borderBottom: `1px solid ${SEPARATOR}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--fp-safe-top) 16px 0 16px',
          }}
        >
          <Link
            href="/"
            aria-label="Go back"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 12,
              color: INK,
              textDecoration: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </Link>

          <h1
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 18,
              color: INK,
              margin: 0,
            }}
          >
            Profile
          </h1>

          {/* Spacer to keep title centered */}
          <div style={{ width: 36 }} />
        </header>

        {/* ── Scrollable body ─────────────────────────────────────────── */}
        <main style={{ padding: '32px 16px', paddingBottom: 96 }}>

          {/* ── Hero ──────────────────────────────────────────────────── */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              marginBottom: 40,
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: PEACH,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              aria-label="Chadi's avatar"
            >
              <span
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 800,
                  fontSize: 32,
                  color: INK,
                  lineHeight: 1,
                }}
              >
                C
              </span>
            </div>

            {/* Name + subtitle */}
            <div style={{ textAlign: 'center' }}>
              <p
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 800,
                  fontSize: 26,
                  color: INK,
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                Chadi
              </p>
              <p
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 500,
                  fontSize: 14,
                  color: INK_MUTED,
                  margin: 0,
                  marginTop: 6,
                }}
              >
                TCF Canada &nbsp;&middot;&nbsp; 47 days to exam
              </p>
            </div>
          </div>

          {/* ── Card 1: Preply CTA ────────────────────────────────────── */}
          <div style={{ marginBottom: 28 }}>
            <Card background={SAGE}>
              <div style={{ padding: '22px 22px 20px' }}>
                <p
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 700,
                    fontSize: 10,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    color: '#3A6B35',
                    margin: 0,
                    marginBottom: 8,
                  }}
                >
                  Work 1-on-1 with your tutor
                </p>
                <p
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 800,
                    fontSize: 20,
                    color: INK,
                    margin: 0,
                    marginBottom: 8,
                    lineHeight: 1.2,
                  }}
                >
                  Book a trial with Chadi
                </p>
                <p
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 500,
                    fontSize: 14,
                    color: INK_SOFT,
                    margin: 0,
                    marginBottom: 20,
                    lineHeight: 1.55,
                  }}
                >
                  7,000+ hours teaching French to English speakers. Specialized in TCF Canada, TEF, and DELF prep.
                </p>
                <a
                  href="https://preply.in/CHADI4EN128687910"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 48,
                    paddingLeft: 24,
                    paddingRight: 24,
                    borderRadius: 14,
                    backgroundColor: INK,
                    color: '#FFFFFF',
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 700,
                    fontSize: 15,
                    textDecoration: 'none',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  Book on Preply
                </a>
              </div>
            </Card>
          </div>

          {/* ── Card 2: Stats ─────────────────────────────────────────── */}
          <div style={{ marginBottom: 28 }}>
            <SectionLabel>Your Practice</SectionLabel>
            <Card background={BUTTER}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  padding: '20px 0',
                }}
              >
                {[
                  { value: 'Day 7', sub: 'Current streak', icon: '🔥' },
                  { value: '4/16',  sub: 'École',       icon: null },
                  { value: '47',    sub: 'Days to TCF',     icon: null },
                ].map(({ value, sub, icon }, i) => (
                  <div
                    key={sub}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      borderRight: i < 2 ? `1px solid #1A1A1A14` : 'none',
                      padding: '0 4px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: DISPLAY_FONT,
                        fontWeight: 800,
                        fontSize: 20,
                        color: INK,
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {icon && <span aria-hidden="true">{icon}</span>}
                      {value}
                    </span>
                    <span
                      style={{
                        fontFamily: DISPLAY_FONT,
                        fontWeight: 500,
                        fontSize: 11,
                        color: INK_MUTED,
                        textAlign: 'center',
                        lineHeight: 1.3,
                      }}
                    >
                      {sub}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ── Card 3: Account ───────────────────────────────────────── */}
          <div style={{ marginBottom: 28 }}>
            <SectionLabel>Account</SectionLabel>
            <Card>
              <ListRow label="Email" value="chadi@example.com" />
              <ListRow label="Target score" value="TCF C1 (level 5)" />
              <div style={{ borderBottom: 'none' }}>
                <ListRow
                  label="Exam date"
                  value="June 7, 2026"
                  action={
                    <Pencil size={14} strokeWidth={2} color={INK_MUTED} />
                  }
                  onClick={() => {}}
                />
              </div>
            </Card>
          </div>

          {/* ── Card 4: Settings ──────────────────────────────────────── */}
          <div>
            <SectionLabel>Settings</SectionLabel>
            <Card>
              <ListRow
                label="Interface language"
                value="English"
                action={<ChevronRight size={16} strokeWidth={2} color={INK_MUTED} />}
                onClick={() => {}}
              />
              <ListRow
                label="Notifications"
                action={<ChevronRight size={16} strokeWidth={2} color={INK_MUTED} />}
                onClick={() => {}}
              />
              <div style={{ borderBottom: 'none' }}>
                <ListRow
                  label="Sign out"
                  danger
                  onClick={() => {}}
                />
              </div>
            </Card>
          </div>

        </main>
      </div>

      <BottomNav />
    </div>
    </ProtectedRoute>
  )
}
