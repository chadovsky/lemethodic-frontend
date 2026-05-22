import { TACHES } from '@/lib/data/taches'
import TacheCard from './TacheCard'

export default function TacheOverviewGrid() {
  return (
    <div className="tache-overview-grid">
      {TACHES.map((tache) => (
        <TacheCard key={tache.id} tache={tache} />
      ))}
    </div>
  )
}
