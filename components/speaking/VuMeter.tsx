'use client'

import { useEffect, useRef, useState } from 'react'

const BAR_COUNT = 24

interface VuMeterProps {
  active: boolean
  /** Color of the active bars — defaults to #1A1A1A */
  color?: string
}

export default function VuMeter({ active, color = '#1A1A1A' }: VuMeterProps) {
  const [levels, setLevels] = useState<number[]>(Array(BAR_COUNT).fill(4))
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (active) {
      frameRef.current = setInterval(() => {
        setLevels(
          Array.from({ length: BAR_COUNT }, () =>
            Math.max(4, Math.floor(Math.random() * 28 + 4))
          )
        )
      }, 80)
    } else {
      if (frameRef.current) clearInterval(frameRef.current)
      setLevels(Array(BAR_COUNT).fill(4))
    }
    return () => {
      if (frameRef.current) clearInterval(frameRef.current)
    }
  }, [active])

  return (
    <div
      role="img"
      aria-label={active ? 'Audio level meter active' : 'Audio level meter idle'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        height: 36,
      }}
    >
      {levels.map((h, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: h,
            borderRadius: 3,
            backgroundColor: active ? color : `${color}33`,
            transition: active ? 'height 0.08s ease' : 'height 0.3s ease',
          }}
        />
      ))}
    </div>
  )
}
