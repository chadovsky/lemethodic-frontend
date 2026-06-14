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
      style={{
        display: 'flex',
        alignItems: 'stretch',
        // F-455 — inset the pill from the panel edges so it floats.
        padding: isCollapsed ? '2px 8px' : '2px 10px',
      }}
    >
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
          height: 42,
          flex: 1,
          paddingLeft: isCollapsed ? 0 : 12,
          paddingRight: isCollapsed ? 0 : 14,
          gap: isCollapsed ? 0 : 10,
          fontFamily: SANS_FONT,
          fontWeight: active ? 600 : 500,
          fontSize: '0.9375rem',
          letterSpacing: '0.005em',
          // F-455 — active = opaque white pill + coral icon/label; inactive =
          // secondary-text slate, no pill. Smooth fade on selection.
          borderRadius: 10,
          backgroundColor: active ? 'var(--shell-pill)' : 'transparent',
          boxShadow: active ? 'var(--shell-pill-shadow)' : 'none',
          color: active ? 'var(--accent)' : 'var(--text-secondary)',
          textDecoration: 'none',
          transition:
            'background-color var(--lm-duration-hover) var(--lm-ease), color var(--lm-duration-hover) ease, box-shadow var(--lm-duration-hover) ease',
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
