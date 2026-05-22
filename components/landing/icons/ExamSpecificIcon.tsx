export default function ExamSpecificIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* Flag pole */}
      <line x1="8" y1="6" x2="8" y2="36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Flag body */}
      <path d="M8 6 L34 10 L34 22 L8 26 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Content lines inside flag — muted, representing exam text */}
      <line x1="13" y1="14" x2="29" y2="15.5" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13" y1="19" x2="25" y2="20" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
