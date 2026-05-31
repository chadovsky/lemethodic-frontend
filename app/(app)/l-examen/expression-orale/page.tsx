import SpeakingLanding from '@/components/speaking/SpeakingLanding'
import SpeakingDesktop from '@/components/speaking/SpeakingDesktop'

// V-015c — desktop ≥md gets the tab-driven SpeakingDesktop; mobile <md
// keeps SpeakingLanding's existing 3-stacked-card layout. Gates are
// CSS-driven (.fp-mobile-only / .fp-desktop-only in globals.css) so
// both render server-side and the cascade picks the right one.

export default function ExpressionOralePage() {
  return (
    <>
      <div className="fp-mobile-only">
        <SpeakingLanding />
      </div>
      <div className="fp-desktop-only">
        <SpeakingDesktop />
      </div>
    </>
  )
}
