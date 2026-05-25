interface Props {
  password: string
}

// 0 chars → 0 filled; 1–4 → 1 (blush/red); 5–7 → 2 (butter/amber); 8+ → 3 (sage/green)
const SEGMENT_COLORS = [
  '',
  'var(--lm-pastel-blush, #F5D6D6)',
  'var(--lm-pastel-butter, #FFF0C2)',
  'var(--lm-pastel-sage, #D4E4D0)',
]

export default function PasswordStrength({ password }: Props) {
  const len = password.length
  const filled = len === 0 ? 0 : len <= 4 ? 1 : len <= 7 ? 2 : 3
  const activeColor = SEGMENT_COLORS[filled]

  return (
    <div
      data-testid="password-strength"
      style={{ display: 'flex', gap: 4 }}
      aria-label={`Password strength: ${filled} of 3`}
    >
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          data-testid="strength-segment"
          data-filled={n <= filled ? 'true' : 'false'}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            backgroundColor: n <= filled ? activeColor : 'var(--rule-default)',
            transition: 'background-color 200ms var(--lm-ease, ease)',
          }}
        />
      ))}
    </div>
  )
}
