'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import type { UserProgress, ActivityCalendar } from '@/lib/types'
import { readTargetLevel } from '@/lib/journey/target-level'
import { readCompletedIles } from '@/lib/journey/progress'
import { getJourney } from '@/lib/journey/journey'
import DashboardGreeting from './DashboardGreeting'
import CarteHero from './CarteHero'
import MetricCard from './MetricCard'
import StatCard from './StatCard'
import CalendarWidget from './CalendarWidget'
import WeeklyChart from './WeeklyChart'

// F-464 — the three-zone /tableau-de-bord. The LEFT zone is the shipped F-465
// icon rail (AppShell, untouched). This renders the MAIN zone (greeting + the
// La Carte hero and the six tinted metric cards) and the RIGHT rail (calendar,
// weekly chart, two stat cards). Data is wired to what exists (F-439 progress,
// F-444 activity calendar, F-456 journey + lm.* localStorage); metrics with no
// source render bientot. No fabricated numbers.

function daysToExam(examDate: string | null | undefined): number | null {
  if (!examDate) return null
  const exam = new Date(examDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  exam.setHours(0, 0, 0, 0)
  return Math.ceil((exam.getTime() - today.getTime()) / 86400000)
}

// "YYYY-MM-DD" for the Monday that begins the current week (local time).
function mondayOfThisWeek(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  const dow = (d.getDay() + 6) % 7 // Mon=0..Sun=6
  d.setDate(d.getDate() - dow)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface JourneyState {
  level: string
  completed: number
  total: number
}

export default function Dashboard() {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [progressError, setProgressError] = useState(false)
  const [calendar, setCalendar] = useState<ActivityCalendar | null>(null)
  const [calendarError, setCalendarError] = useState(false)
  const [journey, setJourney] = useState<JourneyState | null>(null)

  const examDate = useAuthStore((s) => s.user?.examDate)
  const hydrated = useAuthStore((s) => s.hydrated)

  useEffect(() => {
    api.users.getProgress().then(setProgress).catch(() => setProgressError(true))
    api.users.getActivityCalendar(90).then(setCalendar).catch(() => setCalendarError(true))
  }, [])

  // Journey metrics are client-side (localStorage); resolve after mount so the
  // server render (which has no localStorage) does not mismatch hydration.
  useEffect(() => {
    const level = readTargetLevel()
    const completed = readCompletedIles(level)
    const j = getJourney(level, completed)
    setJourney({ level, completed: completed.length, total: j.iles.length })
  }, [])

  // ── Derived metrics ────────────────────────────────────────────────────────
  const progressLoading = !progressError && progress === null
  const calendarLoading = !calendarError && calendar === null

  const weekDays = calendar?.days ?? []
  const monday = mondayOfThisWeek()
  const weekProduction = weekDays
    .filter((d) => d.date >= monday)
    .reduce((sum, d) => sum + d.count, 0)
  const last7 = [...weekDays].sort((a, b) => a.date.localeCompare(b.date)).slice(-7).map((d) => d.count)

  const examDays = daysToExam(examDate)

  return (
    <div className="dash-grid" data-testid="dashboard-root">
      {/* ── MAIN zone ──────────────────────────────────────────────────────── */}
      <div className="dash-zone-main" data-testid="dashboard-zone-main">
        <DashboardGreeting />

        <div className="dash-cards">
          <CarteHero />

          <MetricCard
            testId="dashboard-metric-serie"
            title="Série"
            tint="sage"
            loading={progressLoading}
            error={progressError}
            value={progress?.streakDays ?? 0}
            unit={(progress?.streakDays ?? 0) === 1 ? 'jour consécutif' : 'jours consécutifs'}
          />

          <MetricCard
            testId="dashboard-metric-objectif"
            title="Objectif du jour"
            tint="slate"
            loading={calendarLoading}
            error={calendarError}
            value={calendar?.todayCount ?? 0}
            unit={`/ ${calendar?.todayTarget ?? 0} min`}
            progress={{ value: calendar?.todayCount ?? 0, target: calendar?.todayTarget ?? 0 }}
          />

          <MetricCard
            testId="dashboard-metric-production"
            title="Minutes de production"
            tint="cream"
            loading={calendarLoading}
            error={calendarError}
            value={weekProduction}
            unit="min cette semaine"
            sparkline={last7}
          />

          <MetricCard
            testId="dashboard-metric-iles"
            title="Îles terminées"
            tint="peach"
            loading={!journey}
            value={journey?.completed ?? 0}
            unit={`/ ${journey?.total ?? 7} îles`}
          />

          <MetricCard
            testId="dashboard-metric-niveau"
            title="Niveau cible"
            tint="sage"
            loading={!journey}
            value={journey?.level ?? ''}
            unit="niveau visé"
          />

          <MetricCard
            testId="dashboard-metric-examen"
            title="Examen"
            tint="slate"
            loading={!hydrated}
            bientot={hydrated && examDays === null}
            bientotLabel="Définissez votre date d'examen"
            value={examDays !== null && examDays >= 0 ? examDays : examDays !== null ? 'Passé' : ''}
            unit={examDays !== null && examDays >= 0 ? (examDays === 1 ? 'jour restant' : 'jours restants') : undefined}
          />
        </div>
      </div>

      {/* ── RIGHT rail ─────────────────────────────────────────────────────── */}
      <aside className="dash-zone-rail" data-testid="dashboard-zone-rail" aria-label="Statistiques">
        <CalendarWidget />

        {!calendarError && calendar && last7.length >= 2 && (
          <WeeklyChart days={weekDays} target={calendar.todayTarget} />
        )}

        <StatCard
          testId="dashboard-stat-production"
          title="Production totale"
          loading={progressLoading}
          error={progressError}
          value={progress?.productionMinutesTotal ?? 0}
          unit="min"
        />

        <StatCard
          testId="dashboard-stat-pieges"
          title="Pièges Anglais"
          bientot
          bientotLabel="Le suivi des Pièges arrive bientôt."
        />
      </aside>
    </div>
  )
}
