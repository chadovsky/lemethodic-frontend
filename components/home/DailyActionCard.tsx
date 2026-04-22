'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock, Mic, LockOpen } from 'lucide-react'

// ─── design tokens ───────────────────────────────────────────────────────────
const INK        = '#1A1A1A'
const INK_MUTED  = '#1A1A1A66'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

type MetaItem = {
  icon: 'clock' | 'mic' | 'lock-open'
  label: string
}

interface DailyActionCardProps {
  background: string   // pastel hex
  label: string        // e.g. "LESSON 5 OF 16"
  title: string
  descriptor: string
  meta: MetaItem[]
  illustrationSrc: string
  illustrationAlt: string
  href: string
}

function MetaIcon({ icon }: { icon: MetaItem['icon'] }) {
  const props = { size: 13, strokeWidth: 2, color: INK_MUTED }
  if (icon === 'clock')     return <Clock {...props} />
  if (icon === 'mic')       return <Mic {...props} />
  if (icon === 'lock-open') return <LockOpen {...props} />
  return null
}

export default function DailyActionCard({
  background,
  label,
  title,
  descriptor,
  meta,
  illustrationSrc,
  illustrationAlt,
  href,
}: DailyActionCardProps) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        position: 'relative',
        backgroundColor: background,
        borderRadius: 20,
        padding: 20,
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        textDecoration: 'none',
        color: INK,
        overflow: 'hidden',
        minHeight: 180,
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
      }}
      onMouseDown={(e) => {
        ;(e.currentTarget as HTMLElement).style.transform = 'scale(0.97)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 1px 6px rgba(0,0,0,0.08)'
      }}
      onMouseUp={(e) => {
        ;(e.currentTarget as HTMLElement).style.transform = ''
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.transform = ''
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'
      }}
      onTouchStart={(e) => {
        ;(e.currentTarget as HTMLElement).style.transform = 'scale(0.97)'
      }}
      onTouchEnd={(e) => {
        ;(e.currentTarget as HTMLElement).style.transform = ''
      }}
    >
      {/* Illustration — top-right corner */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 64,
          height: 64,
          pointerEvents: 'none',
        }}
      >
        <Image
          src={illustrationSrc}
          alt={illustrationAlt}
          width={64}
          height={64}
          style={{ objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.10))' }}
        />
      </div>

      {/* Label */}
      <span
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 600,
          fontSize: 10,
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          color: INK_MUTED,
          display: 'block',
          marginBottom: 8,
          paddingRight: 72,
        }}
      >
        {label}
      </span>

      {/* Title */}
      <h3
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 20,
          lineHeight: '26px',
          color: INK,
          margin: 0,
          marginBottom: 8,
          paddingRight: 72,
        }}
      >
        {title}
      </h3>

      {/* Descriptor */}
      <p
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 500,
          fontSize: 13,
          lineHeight: '19px',
          color: INK_MUTED,
          margin: 0,
          marginBottom: 16,
          paddingRight: 72,
        }}
      >
        {descriptor}
      </p>

      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {meta.map(({ icon, label: metaLabel }, i) => (
          <div
            key={i}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <MetaIcon icon={icon} />
            <span
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 600,
                fontSize: 12,
                color: INK_MUTED,
              }}
            >
              {metaLabel}
            </span>
          </div>
        ))}
      </div>
    </Link>
  )
}
