'use client'

import { useAuthStore } from '@/lib/auth'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'
import type { User } from '@/lib/types'

function getFirstName(user: User | null): string | null {
  if (!user) return null
  if (user.fullName) return user.fullName.trim().split(/\s+/)[0]
  if (user.email) return user.email.split('@')[0]
  return null
}

function formatTodayInFrench(date = new Date()): string {
  return new Intl.DateTimeFormat('fr-CA', { dateStyle: 'full' }).format(date)
}

export default function DashboardGreeting() {
  const user = useAuthStore((s) => s.user)
  const firstName = getFirstName(user)
  const level = user?.currentLevel ?? user?.targetLevel ?? null
  const today = formatTodayInFrench()

  return (
    <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <h1
        data-testid="dashboard-greeting"
        style={{
          fontFamily: SERIF_FONT,
          fontWeight: 500,
          fontSize: 'clamp(32px, 4vw, 52px)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        {firstName ? `Bonjour, ${firstName}` : 'Bonjour'}
      </h1>
      <p
        data-testid="dashboard-today"
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 400,
          fontSize: '0.9375rem',
          color: 'var(--text-muted)',
          margin: 0,
          textTransform: 'capitalize',
        }}
      >
        {today}
      </p>
      {level && (
        <span
          data-testid="dashboard-level-badge"
          style={{
            display: 'inline-flex',
            alignSelf: 'flex-start',
            alignItems: 'center',
            fontFamily: SANS_FONT,
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginTop: 2,
          }}
        >
          {level}
        </span>
      )}
    </header>
  )
}
