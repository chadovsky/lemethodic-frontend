'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ThemeToggleProps {
  size?: number
}

export function ThemeToggle({ size = 16 }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Placeholder during SSR — prevents hydration mismatch on icon choice.
  if (!mounted) {
    return <div aria-hidden="true" style={{ width: 32, height: 32, flexShrink: 0 }} />
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      data-testid="theme-toggle"
      className="ed-btn-press"
      style={{
        width: 32,
        height: 32,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--lm-text-secondary)',
        borderRadius: 4,
        padding: 0,
        flexShrink: 0,
      }}
    >
      {isDark ? <Sun size={size} strokeWidth={1.75} /> : <Moon size={size} strokeWidth={1.75} />}
    </button>
  )
}
