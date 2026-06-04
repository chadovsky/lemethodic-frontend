import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

// Must be hoisted above the `api` import so the module reads the mock.
vi.mock('@/lib/auth', () => ({
  useAuthStore: Object.assign(
    (selector: (s: { user: null }) => unknown) => selector({ user: null }),
    {
      getState: () => ({
        token: 'test-token',
        user: null,
        clearAuth: vi.fn(),
        setAuth: vi.fn(),
        markVerified: vi.fn(),
      }),
    },
  ),
}))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)
vi.stubGlobal('location', { pathname: '/dashboard', assign: vi.fn(), href: '/dashboard' })

import { api } from '@/lib/api'

function mockOkResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response
}

const rawProgressResponse = {
  current_level: 'b1',
  maitre_intensity: 2,
  streak_days: 5,
  longest_streak_days: 12,
  streak_last_active_date: '2026-06-03',
  production_minutes_total: 180,
  daily_target_minutes: 30,
  tache_attempts: 8,
  last_couche_signals: { ile_cafe: { level: 'b1', completed_at: '2026-06-03T10:00:00Z' } },
}

describe('api.users.getProgress() — F-439', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.setItem('lemethodic_token', 'test-token')
  })

  afterEach(() => {
    localStorage.removeItem('lemethodic_token')
  })

  it('calls GET /api/users/me/progress with credentials: include', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse(rawProgressResponse))
    await api.users.getProgress()
    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/api/users/me/progress')
    expect(init.credentials).toBe('include')
    expect(init.method).toBeUndefined() // GET inferred (no body)
  })

  it('maps current_level → currentLevel', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse(rawProgressResponse))
    const p = await api.users.getProgress()
    expect(p.currentLevel).toBe('b1')
  })

  it('maps maitre_intensity → maitreIntensity', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse(rawProgressResponse))
    const p = await api.users.getProgress()
    expect(p.maitreIntensity).toBe(2)
  })

  it('maps streak_days → streakDays', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse(rawProgressResponse))
    const p = await api.users.getProgress()
    expect(p.streakDays).toBe(5)
  })

  it('maps longest_streak_days → longestStreakDays', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse(rawProgressResponse))
    const p = await api.users.getProgress()
    expect(p.longestStreakDays).toBe(12)
  })

  it('maps streak_last_active_date → streakLastActiveDate', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse(rawProgressResponse))
    const p = await api.users.getProgress()
    expect(p.streakLastActiveDate).toBe('2026-06-03')
  })

  it('maps null streak_last_active_date', async () => {
    mockFetch.mockResolvedValueOnce(
      mockOkResponse({ ...rawProgressResponse, streak_last_active_date: null }),
    )
    const p = await api.users.getProgress()
    expect(p.streakLastActiveDate).toBeNull()
  })

  it('maps production_minutes_total → productionMinutesTotal', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse(rawProgressResponse))
    const p = await api.users.getProgress()
    expect(p.productionMinutesTotal).toBe(180)
  })

  it('maps daily_target_minutes → dailyTargetMinutes', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse(rawProgressResponse))
    const p = await api.users.getProgress()
    expect(p.dailyTargetMinutes).toBe(30)
  })

  it('maps tache_attempts → tacheAttempts', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse(rawProgressResponse))
    const p = await api.users.getProgress()
    expect(p.tacheAttempts).toBe(8)
  })

  it('maps last_couche_signals → lastCoucheSignals', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse(rawProgressResponse))
    const p = await api.users.getProgress()
    expect(p.lastCoucheSignals).toEqual(
      rawProgressResponse.last_couche_signals,
    )
  })

  it('sets Authorization: Bearer header', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse(rawProgressResponse))
    await api.users.getProgress()
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect((init.headers as Record<string, string>)['Authorization']).toMatch(/^Bearer .+/)
  })
})

describe('api.users.patchProgress() — F-439', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.setItem('lemethodic_token', 'test-token')
  })

  afterEach(() => {
    localStorage.removeItem('lemethodic_token')
  })

  it('calls PATCH /api/users/me/progress', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse(rawProgressResponse))
    await api.users.patchProgress({ daily_target_minutes: 45 })
    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/api/users/me/progress')
    expect(init.method).toBe('PATCH')
  })

  it('sends daily_target_minutes in body', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse(rawProgressResponse))
    await api.users.patchProgress({ daily_target_minutes: 45 })
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(init.body as string) as Record<string, unknown>
    expect(body.daily_target_minutes).toBe(45)
  })

  it('sends last_couche_signals in body', async () => {
    const signals = { ile_cafe: { level: 'b1', completed_at: '2026-06-04T09:00:00Z' } }
    mockFetch.mockResolvedValueOnce(mockOkResponse(rawProgressResponse))
    await api.users.patchProgress({ last_couche_signals: signals })
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(init.body as string) as Record<string, unknown>
    expect(body.last_couche_signals).toEqual(signals)
  })

  it('maps response back through mapUserProgress', async () => {
    mockFetch.mockResolvedValueOnce(
      mockOkResponse({ ...rawProgressResponse, daily_target_minutes: 45 }),
    )
    const p = await api.users.patchProgress({ daily_target_minutes: 45 })
    expect(p.dailyTargetMinutes).toBe(45)
    expect(p.currentLevel).toBe('b1')
  })
})
