'use client'

// F-200 — scroll-triggered editorial fade-up. opacity 0→1 + translateY
// 24px→0, 700ms cubic-bezier(0.16, 1, 0.3, 1). Triggers via framer-motion
// `whileInView` at 20% viewport. Honors prefers-reduced-motion (framer-
// motion's `useReducedMotion` shortcut + the global CSS reduce-motion rule
// in globals.css).
//
// Reusable across F-200 + F-201..F-214 sections.

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

interface RevealOnScrollProps {
  children: ReactNode
  // Stagger value when used inside a parent that orchestrates multiple
  // reveals. Default 0; set to 0.1-0.2 for staggered children.
  delay?: number
  // Override the default Y-translate distance (px) for tighter or
  // wider feel.
  distance?: number
  className?: string
}

export default function RevealOnScroll({
  children,
  delay = 0,
  distance = 24,
  className,
}: RevealOnScrollProps) {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
