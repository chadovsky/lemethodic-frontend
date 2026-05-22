import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import RecentActivityWidget from '@/components/dashboard/RecentActivityWidget'

describe('RecentActivityWidget', () => {
  it('renders the "Activité récente" section heading', () => {
    render(<RecentActivityWidget />)
    expect(
      screen.getByRole('heading', { name: /activité récente/i, level: 2 }),
    ).toBeInTheDocument()
  })

  // MOCK-007 — expanded to 5 rows from fixture
  it('renders exactly 5 activity rows', () => {
    render(<RecentActivityWidget />)
    const list = screen.getByRole('list', { name: /activité récente/i })
    expect(within(list).getAllByRole('listitem')).toHaveLength(5)
  })

  it('each row has a colored activity dot with data-testid activity-dot', () => {
    render(<RecentActivityWidget />)
    const dots = screen.getAllByTestId('activity-dot')
    expect(dots).toHaveLength(5)
  })
})
