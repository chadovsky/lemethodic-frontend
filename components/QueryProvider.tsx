'use client'

// F-325 — TanStack Query provider mount.
//
// Conservative defaults so the introduction of TQ on top of the existing
// useState+useEffect+api.X.list() surfaces doesn't change perceived
// freshness on those surfaces (they don't use TQ; their state model is
// unaffected by these defaults):
//   - staleTime 60s: re-mounting a TQ surface within a minute is a no-op
//     refetch. Reduces network churn when navigating /vocabulaire ↔
//     /vocabulaire/[slug] ↔ back.
//   - refetchOnWindowFocus false: matches the app's quiet-update behavior
//     on /ecole, /diagnostic, /progress (those re-fetch only on mount or
//     explicit retry).
//   - retry: false: ApiError surfaces from lib/api.ts already routes
//     401 / 403-email-not-verified through the global interceptor. A
//     mindless retry would race the navigation and waste tokens.
//
// Devtools only mount in non-production.

import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: false,
          },
        },
      }),
  )
  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV !== 'production' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
