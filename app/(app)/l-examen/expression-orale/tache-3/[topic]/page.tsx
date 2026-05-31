import Tache3Session from '@/components/speaking/Tache3Session'

interface Props {
  params: Promise<{ topic: string }>
}

export default async function Tache3TopicPage({ params }: Props) {
  const { topic } = await params
  return <Tache3Session topicSlug={topic} />
}
