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

  it('renders exactly 3 activity rows', () => {
    render(<RecentActivityWidget />)
    const list = screen.getByRole('list', { name: /activité récente/i })
    expect(within(list).getAllByRole('listitem')).toHaveLength(3)
  })

  it('renders the locked placeholder activities', () => {
    render(<RecentActivityWidget />)
    expect(screen.getByText(/leçon 4 terminée/i)).toBeInTheDocument()
    expect(screen.getByText(/10 chunks révisés/i)).toBeInTheDocument()
    expect(screen.getByText(/diagnostic tâche 1 essayée/i)).toBeInTheDocument()
  })
})
