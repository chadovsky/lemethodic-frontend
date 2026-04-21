'use client'

import { Bell } from 'lucide-react'
import DailyActionCard from './DailyActionCard'
import RaccourciProgress from './RaccourciProgress'
import LessonListItem, { LessonStatus } from './LessonListItem'
import BottomNav from './BottomNav'

// ─── design tokens ───────────────────────────────────────────────────────────
const INK         = '#1A1A1A'
const INK_MUTED   = '#1A1A1A66'
const PEACH       = '#FFD8C2'
const BUTTER      = '#FFF0C2'
const SAGE        = '#D4E4D0'
const LAVENDER    = '#E0D4F0'
const BG          = '#FAFAF7'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

// ─── lesson data ─────────────────────────────────────────────────────────────
interface Lesson {
  number: number
  title: string
  descriptor: string
  status: LessonStatus
}

const LESSONS: Lesson[] = [
  { number: 1,  title: 'Conjugaison',                       descriptor: 'Present tense patterns that don\'t match English.',         status: 'complete'    },
  { number: 2,  title: 'Les articles',                      descriptor: 'Le/la/les — English speakers overuse "the".',               status: 'complete'    },
  { number: 3,  title: 'Féminin / masculin',                descriptor: 'Gender rules that matter at B2.',                          status: 'complete'    },
  { number: 4,  title: 'Articles (suite)',                   descriptor: 'Partitive and contracted articles.',                       status: 'complete'    },
  { number: 5,  title: 'Prépositions',                      descriptor: 'À, de, en, dans — the big four.',                         status: 'in-progress' },
  { number: 6,  title: 'Pronoms relatifs',                   descriptor: 'Qui, que, dont, où — relative clauses made clear.',       status: 'locked'      },
  { number: 7,  title: 'Comment dire "what" — en question', descriptor: 'Qu\'est-ce que, quel, quoi — choosing the right form.',    status: 'locked'      },
  { number: 8,  title: 'Comment dire "what" — non-question',descriptor: 'Ce que, ce qui — embedded clauses.',                      status: 'locked'      },
  { number: 9,  title: 'Discours indirect au présent',      descriptor: 'Reported speech, present-tense backshift.',                status: 'locked'      },
  { number: 10, title: 'Conditionnel + plus-que-parfait',   descriptor: 'Hypothesis and the unmet past condition.',                 status: 'locked'      },
  { number: 11, title: 'Discours indirect au passé',        descriptor: 'Past reported speech — the tense cascade.',               status: 'locked'      },
  { number: 12, title: 'Subjonctif + mise en relief',       descriptor: 'Subjunctive triggers and fronting structures.',            status: 'locked'      },
  { number: 13, title: 'Voix passive (4 structures)',        descriptor: 'Four passive constructions examiners test.',              status: 'locked'      },
  { number: 14, title: 'Adverbes',                          descriptor: 'Placement rules that trip up fluent speakers.',           status: 'locked'      },
  { number: 15, title: 'Nominalisation',                    descriptor: 'Turning verbs and adjectives into formal nouns.',         status: 'locked'      },
  { number: 16, title: 'Gérondif',                          descriptor: 'En + present participle — simultaneous actions.',         status: 'locked'      },
]

// ─── props ───────────────────────────────────────────────────────────────────
interface HomeScreenProps {
  userName?: string
  streakDays?: number
  daysUntilExam?: number
  completedLessons?: number
}

export default function HomeScreen({
  userName = 'Chadi',
  streakDays = 7,
  daysUntilExam = 47,
  completedLessons = 4,
}: HomeScreenProps) {
  const totalLessons = 16
  const nextLesson = LESSONS.find((l) => l.status === 'in-progress') ?? LESSONS[0]

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: BG,
        fontFamily: DISPLAY_FONT,
      }}
    >
      {/* ── Max-width column ─────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 440,
          margin: '0 auto',
          position: 'relative',
        }}
      >

        {/* ── Top bar (sticky) ─────────────────────────────────────── */}
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
            justifyContent: 'space-between',
            padding: '0 16px',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: PEACH,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-label={`${userName}'s avatar`}
          >
            <span
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 800,
                fontSize: 15,
                color: INK,
                lineHeight: 1,
              }}
            >
              {userName[0].toUpperCase()}
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 18,
              color: INK,
              margin: 0,
            }}
          >
            Le Raccourci
          </h1>

          {/* Bell */}
          <button
            aria-label="Notifications"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 10,
              color: INK_MUTED,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell size={20} strokeWidth={1.75} />
          </button>
        </header>

        {/* ── Scrollable body ──────────────────────────────────────── */}
        <main
          style={{
            padding: '24px 16px',
            paddingBottom: 88, // space for bottom nav
          }}
        >

          {/* Greeting + streak */}
          <div style={{ marginBottom: 16 }}>
            <h2
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 700,
                fontSize: 28,
                lineHeight: '34px',
                color: INK,
                margin: 0,
                marginBottom: 6,
              }}
            >
              Bonjour, {userName}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {/* Flame SVG inline (lucide has no Flame in this version) */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF6B35" stroke="none" aria-hidden="true">
                <path d="M12 2C12 2 6 7.5 6 13a6 6 0 0012 0c0-2.5-1.5-5-3-7l-1.5 3C12.5 10.5 12 11.8 12 13a2 2 0 01-4 0c0-3 3-6 4-11z" />
              </svg>
              <span
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 600,
                  fontSize: 13,
                  color: INK_MUTED,
                }}
              >
                Day {streakDays} · Current streak
              </span>
            </div>
          </div>

          {/* Exam countdown chip */}
          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: 32,
                padding: '0 14px',
                borderRadius: 100,
                backgroundColor: LAVENDER,
                gap: 6,
              }}
            >
              <span
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 12,
                  color: '#6B4EAA',
                }}
              >
                TCF in {daysUntilExam} days
              </span>
            </div>
          </div>

          {/* ── Zone 1: Daily action ───────────────────────────────── */}
          <section aria-label="Today's actions">
            <p
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color: INK_MUTED,
                margin: 0,
                marginBottom: 12,
              }}
            >
              Today
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Card A — Today's lesson */}
              <DailyActionCard
                background={BUTTER}
                label={`Lesson ${nextLesson.number} of ${totalLessons}`}
                title={nextLesson.title}
                descriptor="À, de, en, dans — English speakers' most common gap."
                meta={[
                  { icon: 'clock',     label: '15 min'   },
                  { icon: 'lock-open', label: 'Unlocked' },
                ]}
                illustrationSrc="/illustration-level.jpg"
                illustrationAlt="Staircase steps illustration"
                href={`/raccourci/lesson/${nextLesson.number}`}
              />

              {/* Card B — Today's practice */}
              <DailyActionCard
                background={SAGE}
                label="Tache 2 · Role-play"
                title="Agence de voyages"
                descriptor="Gather travel info from an agent. 10 min."
                meta={[
                  { icon: 'clock', label: '10 min'   },
                  { icon: 'mic',   label: 'Speaking' },
                ]}
                illustrationSrc="/illustration-language.jpg"
                illustrationAlt="Speech bubble illustration"
                href="/speaking/tache-2/agence-voyages"
              />
            </div>

            <p
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 500,
                fontSize: 12,
                color: INK_MUTED,
                textAlign: 'center',
                marginTop: 12,
                marginBottom: 0,
              }}
            >
              Complete both for today's full session (~25 min)
            </p>
          </section>

          {/* ── Zone 2: Le Raccourci journey ──────────────────────── */}
          <section
            aria-label="Le Raccourci journey"
            style={{ marginTop: 48 }}
          >
            <RaccourciProgress
              completedCount={completedLessons}
              totalCount={totalLessons}
            />

            {/* 16-lesson list */}
            <div style={{ marginTop: 16 }}>
              {LESSONS.map((lesson) => (
                <LessonListItem
                  key={lesson.number}
                  number={lesson.number}
                  title={lesson.title}
                  descriptor={lesson.descriptor}
                  status={lesson.status}
                />
              ))}
            </div>
          </section>

        </main>
      </div>

      <BottomNav />
    </div>
  )
}
