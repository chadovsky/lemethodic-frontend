'use client'

const BARS = [6, 12, 18, 26, 34, 28, 40, 32, 24, 38, 28, 18, 30, 22, 10]

export default function WaveformPlaceholder({ isActive }: { isActive: boolean }) {
  return (
    <div
      data-testid="waveform-placeholder"
      aria-hidden="true"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        height: 48,
      }}
    >
      {BARS.map((h, i) => (
        <div
          key={i}
          className={isActive ? 'waveform-bar waveform-bar-active' : 'waveform-bar'}
          style={{
            width: 4,
            height: h,
            borderRadius: 2,
            backgroundColor: isActive ? 'var(--cta-primary)' : 'var(--rule-default)',
            animationDelay: `${i * 50}ms`,
          }}
        />
      ))}
    </div>
  )
}
