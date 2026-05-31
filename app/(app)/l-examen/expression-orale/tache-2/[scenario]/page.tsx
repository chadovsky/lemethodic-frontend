import Tache2Session from '@/components/speaking/Tache2Session'

interface Props {
  params: Promise<{ scenario: string }>
}

export default async function Tache2ScenarioPage({ params }: Props) {
  const { scenario } = await params
  return <Tache2Session scenario={scenario} />
}
