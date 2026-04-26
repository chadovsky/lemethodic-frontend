import LearnModulePage from '@/components/learn/LearnModulePage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

// F-080d — standalone module reading page. Wrapped in ProtectedRoute
// per Q4 Option A (pre-launch all visitors authenticate). Backend is
// already optional-auth so the public-glossary path (F-080d.y) is a
// later wrapper-removal away.
interface Props {
  params: Promise<{ module_id: string }>
}

export default async function LearnModuleRoute({ params }: Props) {
  const { module_id } = await params
  return (
    <ProtectedRoute>
      <LearnModulePage moduleId={module_id} />
    </ProtectedRoute>
  )
}
