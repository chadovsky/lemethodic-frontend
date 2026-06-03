import { redirect } from 'next/navigation'

// Tâche 1 has no picker — the landing card links directly to
// /examen/expression-orale/tache-1/interview. This redirect exists only
// for anyone who navigates to the bare /tache-1 URL by hand.
export default function Tache1Page() {
  redirect('/l-examen/expression-orale/tache-1/interview')
}
