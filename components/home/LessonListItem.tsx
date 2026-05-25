'use client'

import Link from 'next/link'
import { Check, Play, Lock } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  lessonUnlockScale,
  lessonUnlockBoxShadow,
  lessonUnlockBoxShadowTimes,
  lessonUnlockDuration,
  easeFpEnter,
  easeFpDefault,
} from '@/lib/motion'

// ─── design tokens ───────────────────────────────────────────────────────────
const INK         = 'var(--text-primary)'
const INK_SOFT    = 'var(--text-secondary)'
const INK_MUTED   = 'var(--text-muted)'
const CTA_BG      = 'var(--text-primary)'
const DISPLAY_FONT = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'

export type LessonStatus = 'complete' | 'in-progress' | 'locked'

export interface LessonListItemProps {
  number: number
  title: string
  // F-089 — deadpan one-liner from EcoleLesson.sublineEn. Rendered
  // between title and descriptor when present.
  subline?: string
  descriptor: string
  status: LessonStatus
  // P-115 — true on the lesson card that just unlocked (after a quiz pass
  // routed back to the home screen). Plays a one-shot scale + elevation
  // animation on first render. Stays at default after ~1s.
  justUnlocked?: boolean
}

// Number circle
function NumberCircle({ number, status }: { number: number; status: LessonStatus }) {
  const isComplete   = status === 'complete'
  const isInProgress = status === 'in-progress'
  const isLocked     = status === 'locked'

  const bg = isComplete ? CTA_BG : isInProgress ? '#FFFFFF' : '#1A1A1A10'
  const border = isInProgress ? `2px solid ${CTA_BG}` : 'none'
  const color = isComplete ? '#FFFFFF' : isInProgress ? CTA_BG : INK_MUTED

  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        backgroundColor: bg,
        border,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {isComplete ? (
        <Check size={16} strokeWidth={2.5} color="#FFFFFF" />
      ) : (
        <span
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: 13,
            color,
            opacity: isLocked ? 0.5 : 1,
          }}
        >
          {number}
        </span>
      )}
    </div>
  )
}

// Status icon on the right
function StatusIcon({ status }: { status: LessonStatus }) {
  if (status === 'complete')    return <Check size={18} strokeWidth={2.5} color="var(--fp-sage-deep)" />
  if (status === 'in-progress') return <Play  size={18} strokeWidth={2}   color={CTA_BG}  fill={CTA_BG} />
  return <Lock size={16} strokeWidth={1.75} color={INK_MUTED} />
}

export default function LessonListItem({ number, title, subline, descriptor, status, justUnlocked }: LessonListItemProps) {
  const isLocked = status === 'locked'
  const reduceMotion = useReducedMotion()
  const playUnlock = !!justUnlocked && !reduceMotion

  const inner = (
    <motion.div
      initial={playUnlock ? { scale: lessonUnlockScale[0], boxShadow: lessonUnlockBoxShadow[0] } : false}
      animate={
        playUnlock
          ? {
              scale: lessonUnlockScale[1],
              boxShadow: lessonUnlockBoxShadow,
            }
          : undefined
      }
      transition={
        playUnlock
          ? {
              scale: { duration: 0.4, ease: easeFpEnter },
              boxShadow: {
                duration: lessonUnlockDuration,
                times: lessonUnlockBoxShadowTimes,
                ease: easeFpDefault,
              },
            }
          : undefined
      }
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 0',
        borderBottom: '1px solid #1A1A1A0A',
        opacity: isLocked ? 0.5 : 1,
        cursor: isLocked ? 'not-allowed' : 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <NumberCircle number={number} status={status} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: 15,
            color: INK,
            margin: 0,
            lineHeight: '20px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </p>
        {subline && (
          <p
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 500,
              fontSize: 13,
              color: INK_MUTED,
              margin: 0,
              lineHeight: '19px',
              marginTop: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {subline}
          </p>
        )}
        <p
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 500,
            fontSize: 12,
            color: INK_MUTED,
            margin: 0,
            lineHeight: '17px',
            marginTop: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {descriptor}
        </p>
      </div>

      <div style={{ flexShrink: 0 }}>
        <StatusIcon status={status} />
      </div>
    </motion.div>
  )

  if (isLocked) {
    return <div aria-disabled="true">{inner}</div>
  }

  return (
    <Link
      href={`/la-methode/lesson/${number}`}
      style={{ display: 'block', textDecoration: 'none' }}
    >
      {inner}
    </Link>
  )
}
