'use client'

import Link from 'next/link'
import { Check, Play, Lock } from 'lucide-react'

// ─── design tokens ───────────────────────────────────────────────────────────
const INK         = '#1A1A1A'
const INK_SOFT    = '#1A1A1AB3'
const INK_MUTED   = '#1A1A1A66'
const CTA_BG      = '#1A1A1A'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

export type LessonStatus = 'complete' | 'in-progress' | 'locked'

export interface LessonListItemProps {
  number: number
  title: string
  descriptor: string
  status: LessonStatus
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
  if (status === 'complete')    return <Check size={18} strokeWidth={2.5} color="#2D8B55" />
  if (status === 'in-progress') return <Play  size={18} strokeWidth={2}   color={CTA_BG}  fill={CTA_BG} />
  return <Lock size={16} strokeWidth={1.75} color={INK_MUTED} />
}

export default function LessonListItem({ number, title, descriptor, status }: LessonListItemProps) {
  const isLocked = status === 'locked'

  const inner = (
    <div
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
    </div>
  )

  if (isLocked) {
    return <div aria-disabled="true">{inner}</div>
  }

  return (
    <Link
      href={`/ecole/lesson/${number}`}
      style={{ display: 'block', textDecoration: 'none' }}
    >
      {inner}
    </Link>
  )
}
