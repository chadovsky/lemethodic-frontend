'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Mic, PenLine, BarChart2, MoreHorizontal } from 'lucide-react'

// ─── design tokens ───────────────────────────────────────────────────────────
const INK        = '#1A1A1A'
const INK_MUTED  = '#1A1A1A66'
const PAPER      = '#FFFFFF'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

interface Tab {
  href: string
  label: string
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
}

const TABS: Tab[] = [
  { href: '/',          label: 'Raccourci', Icon: Home         },
  { href: '/speaking',  label: 'Speaking',  Icon: Mic          },
  { href: '/writing',   label: 'Writing',   Icon: PenLine      },
  { href: '/progress',  label: 'Progress',  Icon: BarChart2    },
  { href: '/more',      label: 'More',      Icon: MoreHorizontal },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Main navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        backgroundColor: PAPER,
        borderTop: '1px solid #1A1A1A0F',
        display: 'flex',
        alignItems: 'stretch',
        zIndex: 50,
        // center content within 440px max-width
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
          // treat /raccourci/lesson/* as also "home" active
          const isActive =
            href === '/'
              ? pathname === '/' || pathname.startsWith('/raccourci')
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
