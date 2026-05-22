import { SANS_FONT } from '@/lib/typography'

interface FormFieldProps {
  label: string
  id: string
  type: 'email' | 'password' | 'text'
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string | null
  autoComplete?: string
}

export default function FormField({
  label,
  id,
  type,
  value,
  onChange,
  onBlur,
  error,
  autoComplete,
}: FormFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        htmlFor={id}
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 600,
          fontSize: '0.6875rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          color: 'var(--text-muted)',
        }}
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="ed-field"
        style={{
          height: 52,
          borderRadius: 4,
          border: error
            ? '1px solid var(--fp-error, #B91C1C)'
            : '1px solid var(--rule-default)',
          backgroundColor: 'var(--bg-elevated)',
          padding: '0 16px',
          fontFamily: SANS_FONT,
          fontWeight: 400,
          fontSize: '0.9375rem',
          color: 'var(--text-primary)',
          width: '100%',
          outline: 'none',
        }}
      />

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 500,
            fontSize: '0.8125rem',
            color: 'var(--ed-accent)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
            style={{ flexShrink: 0 }}
          >
            <path
              d="M6 1.5L11 10.5H1L6 1.5Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <line x1="6" y1="5" x2="6" y2="7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="6" cy="9" r="0.65" fill="currentColor" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
