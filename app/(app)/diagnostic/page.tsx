import { fetchTaches } from '@/lib/api/taches'
import DiagnosticLanding from '@/components/diagnostic/DiagnosticLanding'

export const metadata = {
  title: 'Le Diagnostic — Le Méthodic',
}

export default async function DiagnosticPage() {
  const taches = await fetchTaches()
  return <DiagnosticLanding taches={taches} />
}
