// P-222 — auth-protected waitlist screen. Reachable post-signup when BE
// /onboarding/submit returns waitlist=true. Reads its content from
// useSubmitResponseStore (populated in app/signup/page.tsx right before the
// router.push here).

'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import WaitlistScreen from '@/components/onboarding/WaitlistScreen'

export default function OnboardingWaitlistPage() {
  return (
    <ProtectedRoute>
      <WaitlistScreen />
    </ProtectedRoute>
  )
}
