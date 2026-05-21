export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Enter a valid email address.'
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required.'
  if (password.length < 8) return 'Password must be at least 8 characters.'
  return null
}

export function validateConfirmPassword(password: string, confirm: string): string | null {
  if (!confirm) return 'Please confirm your password.'
  if (password !== confirm) return "Passwords don't match."
  return null
}

const TIER_LABELS: Record<string, string> = {
  'a-la-carte': 'À la carte',
  'daily-bundle': 'Daily Bundle',
  'exam-bundle': 'Exam Bundle',
  pro: 'Pro',
  sprint: 'Sprint',
}

export function formatTierLabel(slug: string): string {
  return (
    TIER_LABELS[slug] ??
    slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  )
}
