export default function EnglishSpeakersIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* EN bracket — muted (source language) */}
      <path d="M7 12 L4 12 L4 28 L7 28" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="4" y1="20" x2="7" y2="20" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Arrow shaft */}
      <line x1="10" y1="20" x2="28" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Arrow head */}
      <path d="M24 16 L28 20 L24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* FR bracket — accent (target language) */}
      <path d="M33 12 L36 12 L36 28 L33 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="36" y1="20" x2="33" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
