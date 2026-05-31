'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SANS_FONT } from '@/lib/typography'

interface SidebarLinkProps {
  href: string
  label: string
  onClick?: () => void
  icon?: ReactNode
  isCollapsed?: boolean
}

function isActiveFor(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(href + '/')
}

export default function SidebarLink({ href, label, onClick, icon, isCollapsed = false }: SidebarLinkProps) {
  const pathname = usePathname() ?? '/'
  const active = isActiveFor(href, pathname)
  const slug = href.replace(/^\//, '') || 'root'

  return (
    <div
      className={active ? 'sidebar-active-row' : ''}
      style={{ display: 'flex', alignItems: 'stretch' }}
    >
      {active && (
        <span
          data-testid="sidebar-active-tab"
          aria-hidden="true"
          style={{
            width: 4,
            flexShrink: 0,
            backgroundColor: 'var(--cta-utility)',
            borderRadius: '0 2px 2px 0',
          }}
        />
      )}
      <Link
        href={href}
        onClick={onClick}
        data-testid={`sidebar-link-${slug}`}
        data-active={active}
        aria-current={active ? 'page' : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          height: 44,
          flex: 1,
          paddingLeft: isCollapsed ? 0 : (active ? 13 : 17),
          paddingRight: isCollapsed ? 0 : 20,
          gap: isCollapsed ? 0 : 10,
          fontFamily: SANS_FONT,
          fontWeight: active ? 600 : 500,
          fontSize: '0.9375rem',
          letterSpacing: '0.005em',
          color: active ? 'var(--text-primary)' : 'var(--text-muted)',
          textDecoration: 'none',
          transition: 'color var(--lm-duration-hover) ease',
        }}
      >
        {icon && (
          <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {icon}
          </span>
        )}
        <span style={{ display: isCollapsed ? 'none' : undefined }}>
          {label}
        </span>
      </Link>
    </div>
  )
}
