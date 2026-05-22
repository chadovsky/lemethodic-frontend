export default function MethodBasedIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* 5 stacked layers — decreasing width, top 3 in accent, bottom 2 muted */}
      <rect x="4" y="4"  width="32" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4" y="11" width="28" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4" y="18" width="24" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4" y="25" width="20" height="4" rx="1" stroke="var(--text-muted)" strokeWidth="1.5" />
      <rect x="4" y="32" width="16" height="4" rx="1" stroke="var(--text-muted)" strokeWidth="1.5" />
    </svg>
  )
}
