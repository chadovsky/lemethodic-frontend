import Link from 'next/link'
import { SANS_FONT } from '@/lib/typography'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export default function Breadcrumb({
  items,
  testId = 'breadcrumb',
}: {
  items: BreadcrumbItem[]
  testId?: string
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      data-testid={testId}
      style={{
        fontFamily: SANS_FONT,
        fontSize: '0.8125rem',
        lineHeight: 1.5,
        color: 'var(--text-muted)',
      }}
    >
      <ol
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 6,
        }}
      >
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li
              key={`${item.label}-${i}`}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  style={{
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                  }}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  style={{
                    color: isLast ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: isLast ? 500 : 400,
                  }}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden="true" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                  ›
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
