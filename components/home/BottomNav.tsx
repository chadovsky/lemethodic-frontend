'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Mic, PenLine, BarChart2, MoreHorizontal } from 'lucide-react'

// ─── design tokens ───────────────────────────────────────────────────────────
const INK        = 'var(--lm-text-primary)'
const INK_MUTED  = 'var(--lm-text-tertiary)'
const PAPER      = 'var(--lm-bg-surface)'
const DISPLAY_FONT = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'

interface Tab {
  href: string
  label: string
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
}

const TABS: Tab[] = [
  { href: '/la-methode', label: 'Méthode', Icon: Home         },
  { href: '/examen/expression-orale',   label: 'Oral',  Icon: Mic     },
  { href: '/examen/expression-ecrite', label: 'Écrit', Icon: PenLine },
  { href: '/progression',  label: 'Progrès',  Icon: BarChart2    },
  { href: '/more',      label: 'More',      Icon: MoreHorizontal },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Main navigation"
      // V-013c / V-014b — mobile-only. Hidden above md (768px). Layout
      // is owned by `.fp-bottom-nav` in globals.css so the @media gate
      // can flip `display: none` cleanly. (V-013c had `style.display:
      // 'flex'` here, which beat Tailwind md:hidden on cascade — the
      // bar leaked onto desktop.)
      className="fp-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(64px + var(--lm-safe-bottom))',
        paddingBottom: 'var(--lm-safe-bottom)',
        backgroundColor: PAPER,
        borderTop: '1px solid var(--lm-border-subtle)',
        alignItems: 'stretch',
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 440,
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'stretch',
        }}
      >
        {TABS.map(({ href, label, Icon }) => {
          // treat /ecole/lesson/* as also "home" active
          const isActive =
            href === '/'
              ? pathname === '/'
              : pathname === href || pathname.startsWith(href + '/')

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                textDecoration: 'none',
                color: isActive ? INK : INK_MUTED,
                transition: 'color 0.15s',
                WebkitTapHighlightColor: 'transparent',
                userSelect: 'none',
              }}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.25 : 1.75}
              />
              <span
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 10,
                  lineHeight: 1,
                  letterSpacing: '0.01em',
                }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
