import BottomNav from '@/components/home/BottomNav'

const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'
const INK_MUTED = '#1A1A1A66'

export default function MorePage() {
  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#FAFAF7', fontFamily: DISPLAY_FONT }}>
      <div
        style={{
          maxWidth: 440,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80dvh',
          padding: '0 24px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontWeight: 700, fontSize: 18, color: '#1A1A1A', margin: 0, marginBottom: 8 }}>
          More
        </p>
        <p style={{ fontWeight: 500, fontSize: 14, color: INK_MUTED, margin: 0 }}>
          Coming soon (F-058)
        </p>
      </div>
      <BottomNav />
    </div>
  )
}
