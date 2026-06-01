'use client'

import { useAuthStore } from '@/lib/auth'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

function daysToExam(examDate: string | null | undefined): number | null {
  if (!examDate) return null
  const exam = new Date(examDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  exam.setHours(0, 0, 0, 0)
  return Math.ceil((exam.getTime() - today.getTime()) / 86400000)
}

export default function CountdownWidget() {
  const examDate = useAuthStore((s) => s.user?.examDate)
  const hydrated = useAuthStore((s) => s.hydrated)
  const days = daysToExam(examDate)

  return (
    <section
      data-testid="dashboard-widget-countdown"
      className="ed-card-lift"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 4,
        padding: 'clamp(20px, 2vw, 28px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <h2
        style={{
          fontFamily: SERIF_FONT,
          fontWeight: 500,
          fontSize: 'clamp(16px, 1.8vw, 20px)',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        Compte à rebours
      </h2>

      {!hydrated ? (
        <div className="ed-skeleton" style={{ height: 48, borderRadius: 4 }} />
      ) : days === null ? (
        <p
          data-testid="countdown-empty"
          style={{
            fontFamily: SANS_FONT,
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            margin: 0,
          }}
        >
          Aucune date d&apos;examen définie
        </p>
      ) : days < 0 ? (
        <p
          data-testid="countdown-past"
          style={{
            fontFamily: SANS_FONT,
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            margin: 0,
          }}
        >
          Examen passé
        </p>
      ) : (
        <>
          <span
            data-testid="countdown-days"
            style={{
              fontFamily: SERIF_FONT,
              fontWeight: 500,
              fontSize: 'clamp(36px, 4vw, 52px)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            {days}
          </span>
          <span
            style={{
              fontFamily: SANS_FONT,
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
            }}
          >
            {days === 1 ? 'jour restant' : 'jours restants'}
          </span>
        </>
      )}
    </section>
  )
}
