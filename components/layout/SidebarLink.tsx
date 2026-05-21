'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SANS_FONT } from '@/lib/typography'

interface SidebarLinkProps {
  href: string
  label: string
  onClick?: () => void
}

function isActiveFor(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(href + '/')
}

export default function SidebarLink({ href, label, onClick }: SidebarLinkProps) {
  const pathname = usePathname() ?? '/'
  const active = isActiveFor(href, pathname)
  const slug = href.replace(/^\//, '') || 'root'

  return (
    <Link
      href={href}
      onClick={onClick}
      data-testid={`sidebar-link-${slug}`}
      data-active={active}
      aria-current={active ? 'page' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 44,
        padding: '0 20px 0 17px',
        fontFamily: SANS_FONT,
        fontWeight: active ? 600 : 500,
        fontSize: '0.9375rem',
        letterSpacing: '0.005em',
        color: active ? 'var(--text-primary)' : 'var(--text-muted)',
        backgroundColor: active ? 'var(--bg-subtle)' : 'transparent',
        borderLeft: active
          ? '3px solid var(--cta-primary)'
          : '3px solid transparent',
        textDecoration: 'none',
        transition:
          'background-color var(--ed-duration-hover, 200ms) ease, color var(--ed-duration-hover, 200ms) ease',
      }}
    >
      {label}
    </Link>
  )
}
