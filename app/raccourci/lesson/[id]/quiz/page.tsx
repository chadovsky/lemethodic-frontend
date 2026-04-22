import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import QuizClient from './QuizClient'
import BottomNav from '@/components/home/BottomNav'

const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'
const INK = '#1A1A1A'
const BG  = '#FAFAF7'

interface Props {
  params: Promise<{ id: string }>
}

export default async function QuizPage({ params }: Props) {
  const { id } = await params

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: BG, fontFamily: DISPLAY_FONT }}>
      <div style={{ maxWidth: 440, margin: '0 auto' }}>
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
            href={`/raccourci/lesson/${id}`}
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
  )
}
