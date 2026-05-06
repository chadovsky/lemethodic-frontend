import HomeScreen from '@/components/home/HomeScreen'
import EcoleDesktop from '@/components/home/EcoleDesktop'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

// V-016c — desktop ≥md gets the lesson-grid EcoleDesktop layout
// (Option C); mobile <md keeps the existing HomeScreen single-column
// layout. Gates are CSS-driven (.fp-mobile-only / .fp-desktop-only in
// globals.css).

export default function EcolePage() {
  return (
    <ProtectedRoute>
      <div className="fp-mobile-only">
        <HomeScreen />
      </div>
      <div className="fp-desktop-only">
        <EcoleDesktop />
      </div>
    </ProtectedRoute>
  )
}
