import BottomNav from '@/components/home/BottomNav'
import WritingSubmissionClient from '@/components/writing/WritingSubmissionClient'

interface PageProps {
  params: Promise<{ prompt_id: string }>
}

export default async function WritingPromptPage({ params }: PageProps) {
  const { prompt_id } = await params
  const promptId = Number.parseInt(prompt_id, 10)
  return (
    <>
      <WritingSubmissionClient promptId={Number.isFinite(promptId) ? promptId : null} />
      <BottomNav />
    </>
  )
}
