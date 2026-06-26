import LessonListContainer from '@/components/ecole/LessonListContainer'
import CoucheStack from '@/components/la-methode/CoucheStack'

export const metadata = {
  title: "La Méthode | Le Méthodic",
}

export default function EcolePage() {
  // F-483 - the page h1 ("La Méthode") leads; the 5-couche visualizer is the h2
  // section right under it (passed as the methodology slot), then the 27 lessons.
  return <LessonListContainer methodology={<CoucheStack />} />
}
