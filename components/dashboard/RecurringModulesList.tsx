'use client'

// P-100 Section 4 — Recurring patterns list.
//
// Renders top-5 recurring modules sorted by recurrence_count DESC,
// reusing the F-080d card + sheet pattern from HomeScreen so the
// dashboard's interaction model matches the home tab's "Recommended for
// you" surface. Linked modules (ecole_lesson_id != null) open the
// LearnModuleSheet picker; orphan modules route directly to /learn/[id].

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import RecurringModuleCard from '@/components/modules/RecurringModuleCard'
import LearnModuleSheet from '@/components/modules/LearnModuleSheet'
import { useInterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'
import type { Lesson, RecurringModule } from '@/lib/types'

const INK_SOFT     = '#1A1A1AB3'
const INK_MUTED    = '#1A1A1A66'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

interface Props {
  modules: RecurringModule[]
  /** Pre-fetched lessons list lets LearnModuleSheet skip its fallback
   *  fetch when picking title/subline for the linked-module picker. */
  lessons: Lesson[] | null
}

export default function RecurringModulesList({ modules, lessons }: Props) {
  const router = useRouter()
  const lang = useInterfaceLanguage()
  const [pickerModule, setPickerModule] = useState<RecurringModule | null>(null)

  const top5 = modules.slice(0, 5)
  const isEmpty = top5.length === 0

  const handleTap = useCallback(
    (m: RecurringModule) => {
      if (m.ecole_lesson_id != null) {
        setPickerModule(m)
      } else {
        router.push(`/learn/${m.module_id}`)
      }
    },
    [router],
  )

  // P-100.5 — backend returns empty until the user has 3+ recordings
  // (F-080d threshold). Render a placeholder card instead of hiding the
  // section entirely so users understand the threshold rather than
  // wondering where Section 4 went.

  // Pre-resolved lesson title + subline for the picker, sourced from the
  // dashboard's already-cached lessons list so the sheet doesn't refetch
  // on open. Mirrors HomeScreen's optimization.
  const pickerLesson =
    pickerModule != null && pickerModule.ecole_lesson_id != null && lessons
      ? lessons.find((l) => l.lessonNumber === pickerModule.ecole_lesson_id)
      : undefined

  const eyebrow = lang === 'fr' ? 'Schémas récurrents' : 'Recurring patterns'
  const subhead =
    lang === 'fr'
      ? 'Les schémas qui reviennent dans plusieurs sessions.'
      : 'Patterns that show up across multiple sessions.'
  const emptyCopy =
    lang === 'fr'
      ? 'Les schémas récurrents apparaîtront après vos 3 premiers enregistrements. Continuez à pratiquer.'
      : 'Recurring patterns will appear after your first 3 recordings. Keep practicing.'

  return (
    <section
      aria-label={eyebrow}
      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <div>
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
          {eyebrow}
        </p>
        <p
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 500,
            fontSize: 13,
            color: INK_SOFT,
            margin: 0,
          }}
        >
          {subhead}
        </p>
      </div>

      {isEmpty ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: '18px 18px',
            border: '1px solid #1A1A1A0A',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <p
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 500,
              fontSize: 14,
              lineHeight: 1.5,
              color: INK_MUTED,
              margin: 0,
            }}
          >
            {emptyCopy}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {top5.map((m) => (
            <RecurringModuleCard
              key={m.module_id}
              module={m}
              onTap={() => handleTap(m)}
            />
          ))}
        </div>
      )}

      {pickerModule && (
        <LearnModuleSheet
          module={{
            id: pickerModule.module_id,
            name_en: pickerModule.name_en,
            name_fr: pickerModule.name_fr,
            ecole_lesson_id: pickerModule.ecole_lesson_id,
          }}
          lessonTitle={pickerLesson?.title}
          lessonSubline={pickerLesson?.sublineEn ?? undefined}
          onClose={() => setPickerModule(null)}
        />
      )}
    </section>
  )
}
