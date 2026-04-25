import { redirect } from 'next/navigation'

// Tâche 1 has no picker — the landing card links directly to
// /speaking/tache-1/interview. This redirect exists only for anyone who
// navigates to the bare /speaking/tache-1 URL by hand.
export default function Tache1Page() {
  redirect('/speaking/tache-1/interview')
}
