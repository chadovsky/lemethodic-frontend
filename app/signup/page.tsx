import SignupForm from '@/components/auth/SignupForm'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>
}) {
  const { tier } = await searchParams
  return <SignupForm tier={tier} />
}
