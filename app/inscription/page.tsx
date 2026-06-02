import SignupForm from '@/components/auth/SignupForm'

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>
}) {
  const { tier } = await searchParams
  return <SignupForm tier={tier} />
}
