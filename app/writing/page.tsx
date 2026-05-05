import BottomNav from '@/components/home/BottomNav'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

// F-206 — page chrome migrated to editorial system.
const DISPLAY_FONT = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'
const INK_MUTED = 'var(--ed-muted)'

export default function WritingPage() {
  return (
    <ProtectedRoute>
    <div style={{ minHeight: '100dvh', backgroundColor: 'var(--ed-bg)', fontFamily: DISPLAY_FONT }}>
      <div
        style={{
          maxWidth: 720,
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
          Writing
        </p>
        <p style={{ fontWeight: 500, fontSize: 14, color: INK_MUTED, margin: 0 }}>
          Coming soon (F-058)
        </p>
      </div>
      <BottomNav />
    </div>
    </ProtectedRoute>
  )
}
