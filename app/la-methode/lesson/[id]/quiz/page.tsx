import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import QuizClient from './QuizClient'
import BottomNav from '@/components/home/BottomNav'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

const DISPLAY_FONT = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'
const INK = 'var(--text-primary)'
const BG  = 'var(--lm-bg-base)'

interface Props {
  params: Promise<{ id: string }>
}

export default async function QuizPage({ params }: Props) {
  const { id } = await params

  return (
    <ProtectedRoute>
    <div style={{ minHeight: '100dvh', backgroundColor: BG, fontFamily: DISPLAY_FONT }}>
      <div style={{ maxWidth: 440, margin: '0 auto' }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            height: 'calc(56px + var(--lm-safe-top))',
            backgroundColor: BG,
            borderBottom: '1px solid #1A1A1A0A',
            display: 'flex',
            alignItems: 'center',
            padding: 'var(--lm-safe-top) 16px 0 16px',
            gap: 12,
          }}
        >
          <Link
            href={`/la-methode/lesson/${id}`}
            aria-label="Back to lesson"
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
            Lesson {id} Quiz
          </span>
        </header>
        <QuizClient lessonId={id} />
      </div>
      <BottomNav />
    </div>
    </ProtectedRoute>
  )
}
