import BottomNav from '@/components/home/BottomNav'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import WritingPromptPicker from '@/components/writing/WritingPromptPicker'

// V-013a — wired to F-224 writing prompt library + analysis pipeline.
// PromptPicker fetches GET /api/writing/prompts; clicking a prompt routes
// to /writing/[prompt_id] for the submission view.

export default function WritingPage() {
  return (
    <ProtectedRoute>
      <WritingPromptPicker />
      <BottomNav />
    </ProtectedRoute>
  )
}
