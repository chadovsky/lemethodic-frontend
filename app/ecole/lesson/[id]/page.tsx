import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import BottomNav from '@/components/home/BottomNav'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'
const INK        = '#1A1A1A'
const INK_MUTED  = '#1A1A1A66'
const BG         = '#FAFAF7'
const CTA_BG     = '#1A1A1A'

const LESSON_TITLES: Record<string, string> = {
  '1':  'Conjugaison',
  '2':  'Les articles',
  '3':  'Féminin / masculin',
  '4':  'Articles (suite)',
  '5':  'Prépositions',
  '6':  'Pronoms relatifs',
  '7':  'Comment dire "what" — en question',
  '8':  'Comment dire "what" — non-question',
  '9':  'Discours indirect au présent',
  '10': 'Conditionnel + plus-que-parfait',
  '11': 'Discours indirect au passé',
  '12': 'Subjonctif + mise en relief',
  '13': 'Voix passive (4 structures)',
  '14': 'Adverbes',
  '15': 'Nominalisation',
  '16': 'Gérondif',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function LessonPage({ params }: Props) {
  const { id } = await params
  const title = LESSON_TITLES[id] ?? `Lesson ${id}`

  return (
    <ProtectedRoute>
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
            padding: '0 16px',
            gap: 12,
          }}
        >
          <Link
            href="/"
            aria-label="Back to home"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: INK,
              textDecoration: 'none',
              padding: 4,
              borderRadius: 8,
              marginLeft: -4,
            }}
          >
            <ArrowLeft size={22} strokeWidth={2} />
          </Link>
          <span
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 16,
              color: INK,
            }}
          >
            Lesson {id}
          </span>
        </header>

        <main style={{ padding: '32px 20px', paddingBottom: 100 }}>
          {/* Title */}
          <h1
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 800,
              fontSize: 28,
              lineHeight: '34px',
              color: INK,
              margin: 0,
              marginBottom: 8,
            }}
          >
            Lesson {id}: {title}
          </h1>

          <p
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 600,
              fontSize: 12,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: INK_MUTED,
              margin: 0,
              marginBottom: 32,
            }}
          >
            15 min · L'École
          </p>

          {/* Illustration placeholder */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 24,
              backgroundColor: '#FFF0C2',
              margin: '0 auto 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-hidden="true"
          >
            <span style={{ fontSize: 48 }}>📖</span>
          </div>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 500,
                fontSize: 15,
                lineHeight: '24px',
                color: INK,
                margin: 0,
              }}
            >
              This lesson covers the four core French prepositions — à, de, en, dans — and the English-speaker traps around each. The choice between these four trips up even advanced learners because they don't map 1-to-1 to English equivalents.
            </p>
            <p
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 500,
                fontSize: 15,
                lineHeight: '24px',
                color: INK,
                margin: 0,
              }}
            >
              You'll see 20 contrasting examples pulled directly from past TCF oral exams, with a clear decision rule for each. Each example shows the wrong English-speaker instinct and the correct French form side-by-side.
            </p>
            <p
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 500,
                fontSize: 15,
                lineHeight: '24px',
                color: INK,
                margin: 0,
              }}
            >
              After the examples, take a 5-question quiz to confirm mastery before the lesson is marked complete.
            </p>
          </div>

          {/* CTA */}
          <div style={{ marginTop: 40 }}>
            <Link
              href={`/ecole/lesson/${id}/quiz`}
              style={{
                display: 'block',
                width: '100%',
                height: 56,
                borderRadius: 16,
                backgroundColor: CTA_BG,
                color: '#FFFFFF',
                fontFamily: DISPLAY_FONT,
                fontWeight: 700,
                fontSize: 16,
                textAlign: 'center',
                lineHeight: '56px',
                textDecoration: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Start quiz
            </Link>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
    </ProtectedRoute>
  )
}
