import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

// Must be hoisted above the `api` import so the module reads the mock.
vi.mock('@/lib/auth', () => ({
  // useAuthStore is called as a selector function AND as useAuthStore.getState()
  // inside request(). Combine both usages into one mock.
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

// Stub window.location so the 403 email_not_verified handler doesn't navigate.
vi.stubGlobal('location', { pathname: '/dashboard', assign: vi.fn(), href: '/dashboard' })

import { api } from '@/lib/api'

function mockOkResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response
}

const rawMeResponse = {
  id: 1,
  email: 'test@example.com',
  full_name: 'Test User',
  is_admin: false,
  email_verified: true,
  current_level: 'B2',
}

const rawLevelResponse = {
  self_reported: { target_level: 'B2', target_exam: 'tcf_canada' },
  assigned: null,
  agreement: 'self_only',
}

describe('api.users — BE-002 wiring', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    // Provide a localStorage token so the Authorization header is set.
    localStorage.setItem('lemethodic_token', 'test-token')
  })

  afterEach(() => {
    localStorage.removeItem('lemethodic_token')
  })

  describe('getMe()', () => {
    it('calls /api/auth/me with credentials: include', async () => {
      mockFetch.mockResolvedValueOnce(mockOkResponse(rawMeResponse))
      await api.users.getMe()
      expect(mockFetch).toHaveBeenCalledOnce()
      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect(url).toContain('/api/auth/me')
      expect(init.credentials).toBe('include')
    })

    it('sets Authorization: Bearer header', async () => {
      mockFetch.mockResolvedValueOnce(mockOkResponse(rawMeResponse))
      await api.users.getMe()
      const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect((init.headers as Record<string, string>)['Authorization']).toMatch(/^Bearer .+/)
    })

    it('maps email_verified: true → user.emailVerified: true', async () => {
      mockFetch.mockResolvedValueOnce(mockOkResponse({ ...rawMeResponse, email_verified: true }))
      const user = await api.users.getMe()
      expect(user.emailVerified).toBe(true)
    })

    it('maps email_verified: false → user.emailVerified: false', async () => {
      mockFetch.mockResolvedValueOnce(mockOkResponse({ ...rawMeResponse, email_verified: false }))
      const user = await api.users.getMe()
      expect(user.emailVerified).toBe(false)
    })

    it('maps full_name → user.fullName', async () => {
      mockFetch.mockResolvedValueOnce(mockOkResponse(rawMeResponse))
      const user = await api.users.getMe()
      expect(user.fullName).toBe('Test User')
    })

    it('maps current_level → user.currentLevel', async () => {
      mockFetch.mockResolvedValueOnce(mockOkResponse(rawMeResponse))
      const user = await api.users.getMe()
      expect(user.currentLevel).toBe('B2')
    })
  })

  describe('getLevel()', () => {
    it('calls /api/users/me/level with credentials: include', async () => {
      mockFetch.mockResolvedValueOnce(mockOkResponse(rawLevelResponse))
      await api.users.getLevel()
      expect(mockFetch).toHaveBeenCalledOnce()
      const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect(url).toContain('/api/users/me/level')
      expect(init.credentials).toBe('include')
    })

    it('returns the level response shape as-is', async () => {
      mockFetch.mockResolvedValueOnce(mockOkResponse(rawLevelResponse))
      const level = await api.users.getLevel()
      expect(level.self_reported).toBeDefined()
      expect(level.assigned).toBeNull()
      expect(level.agreement).toBe('self_only')
    })
  })
})
