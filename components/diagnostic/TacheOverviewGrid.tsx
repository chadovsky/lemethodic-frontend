import type { Tache } from '@/lib/data/taches'
import TacheCard from './TacheCard'

export default function TacheOverviewGrid({ taches }: { taches: readonly Tache[] }) {
  return (
    <div className="tache-overview-grid">
      {taches.map((tache) => (
        <TacheCard key={tache.id} tache={tache} />
      ))}
    </div>
  )
}
