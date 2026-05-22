import { notFound } from 'next/navigation'
import { TACHES } from '@/lib/data/taches'
import TacheShell from '@/components/diagnostic/TacheShell'

type Params = Promise<{ n: string }>

export function generateStaticParams() {
  return [{ n: '1' }, { n: '2' }, { n: '3' }]
}

export async function generateMetadata({ params }: { params: Params }) {
  const { n } = await params
  const tache = TACHES.find((t) => t.id === Number(n))
  if (!tache) return { title: 'Not Found' }
  return { title: `${tache.title} — Le Méthodic` }
}

export default async function TachePage({ params }: { params: Params }) {
  const { n } = await params
  if (!/^[123]$/.test(n)) notFound()
  const tache = TACHES.find((t) => t.id === Number(n))!
  return <TacheShell tache={tache} />
}
