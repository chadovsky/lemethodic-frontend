import LessonListContainer from '@/components/ecole/LessonListContainer'
import CoucheStack from '@/components/la-methode/CoucheStack'

export const metadata = {
  title: "La Méthode | Le Méthodic",
}

export default function EcolePage() {
  // F-483 — the 5-couche methodology visualizer leads the page (the
  // methodology-visible-in-product surface), then the 27 lessons that teach it.
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(40px, 6vw, 72px)',
      }}
    >
      <CoucheStack />
      <LessonListContainer />
    </div>
  )
}
